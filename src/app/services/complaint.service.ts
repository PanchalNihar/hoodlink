import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  doc,
  Firestore,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from '@angular/fire/firestore';
import { BehaviorSubject, map, firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
export interface Complaint {
  id: string;
  userId: string;
  status: 'pending' | 'resolved';
  type: 'text' | 'photo' | 'video';
  content: string;
  createdAt: string;
  username?: string;
}
@Injectable({
  providedIn: 'root',
})
export class ComplaintService {
  private complaintSubject = new BehaviorSubject<Complaint[]>([]);
  complaint$ = this.complaintSubject.asObservable();
  constructor(private firestore: Firestore, private authService: AuthService) {
    this.loadComplaints();
  }
  async loadComplaints() {
    try {
      const complaintRef = collection(this.firestore, 'complaints');
      const q = query(complaintRef, orderBy('createdAt', 'desc'));
      const snapShot = await getDocs(q);
      const complaints = snapShot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Complaint[];
      this.complaintSubject.next(complaints);
    } catch (error) {
      console.log('Error loading Complaints:', error);
      throw error;
    }
  }
  // complaints.service.ts
async addComplaint(content: string, type: 'text' | 'photo' | 'video') {
  try {
    const user = await firstValueFrom(this.authService.user$);
    if (!user) throw new Error('User not authenticated');

    // Get the user document from Firestore to access the username
    const userDocRef = doc(this.firestore, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      throw new Error('User document not found');
    }

    const userData = userDoc.data();
    
    const complaint: Omit<Complaint, 'id'> = {
      userId: user.uid,
      status: 'pending',
      type,
      content,
      createdAt: new Date().toISOString(),
      username: userData['username'] // Get username from Firestore document
    };

    const docRef = await addDoc(collection(this.firestore, 'complaints'), complaint);
    await this.loadComplaints();
    return docRef.id;
  } catch (error) {
    console.error('Error adding complaint:', error);
    throw error;
  }
}
  async updateComplaint(complaintId: string, status: 'pending' | 'resolved') {
    try {
      const complaintRef = doc(this.firestore, 'complaints', complaintId);
      await updateDoc(complaintRef, { status });
      await this.loadComplaints();
    } catch (error) {
      console.log('Error updating Complaint', error);
      throw error;
    }
  }
}
