import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import {
  addDoc,
  collection,
  collectionData,
  doc,
  Firestore,
  getDocs,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { BehaviorSubject, first, firstValueFrom, Observable } from 'rxjs';
export interface Maintenance {
  id?: string;
  userId: string;
  description: string;
  amount: number;
  dueDate:string,
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  reportedDate: string;
}
@Injectable({
  providedIn: 'root',
})
export class MaintenanceService {
  private maintenanceStat = new BehaviorSubject<{
    pending: number;
    inProgress: number;
    completed: number;
  }>({
    pending: 0,
    inProgress: 0,
    completed: 0,
  });
  constructor(private authService: AuthService, private firestore: Firestore) {
    this.loadMaintenanceStat();
  }
  async loadMaintenanceStat() {
    const isAdmin = await this.authService.isAdmin();
    const user = await firstValueFrom(this.authService.user$);
    const maintenanceRef = collection(this.firestore, 'maintenance');
    let q = query(maintenanceRef);
    if (!isAdmin) {
      q = query(maintenanceRef, where('userid', '==', user?.uid));
    }
    const snapShot = getDocs(q);
    const stats = {
      pending: 0,
      inProgress: 0,
      completed: 0,
    };
    (await snapShot).forEach((doc) => {
      const data = doc.data();
      switch (data['status']) {
        case 'pending':
          stats.pending++;
          break;
        case 'in_progess':
          stats.inProgress++;
          break;
        case 'completed':
          stats.completed++;
          break;
      }
    });
    this.maintenanceStat.next(stats);
  }
  getMaintenanceStat(): Observable<any> {
    return this.maintenanceStat.asObservable();
  }
   getActicveRequest(): Observable<Maintenance[]> {
    const maintenanceRef = collection(this.firestore, 'maintenance');
    const q = query(maintenanceRef, where('status', 'in', ['pending', 'in_progress']));
    return collectionData(q, { idField: 'id' }) as Observable<Maintenance[]>;
  }
  async createMaintenanceRequest(request: Omit<Maintenance, 'id' | 'status' | 'reportedDate' | 'userId'>) {
    try {
      const user = await firstValueFrom(this.authService.user$)
      if (!user) throw new Error('User not authenticated');

      const maintenanceRef = collection(this.firestore, 'maintenance');
      const newRequest = {
        ...request,
        userId: user.uid,
        status: 'pending',
        reportedDate: new Date().toISOString(),
        dueDate: new Date(request.dueDate).toISOString()
      };

      await addDoc(maintenanceRef, newRequest);
      await this.loadMaintenanceStat();
    } catch (error) {
      console.error('Error creating maintenance request:', error);
      throw error;
    }
  }
  async updateRequestStatus(requestId: string, status: Maintenance['status']) {
    try {
      const isAdmin = await this.authService.isAdmin();
      if (!isAdmin) {
        throw new Error('Only admins can update request status');
      }
      
      const requestRef = doc(this.firestore, 'maintenance', requestId);
      await updateDoc(requestRef, { status });
      await this.loadMaintenanceStat();
    } catch (error) {
      console.error('Error updating request status:', error);
      throw error;
    }
  }
}

