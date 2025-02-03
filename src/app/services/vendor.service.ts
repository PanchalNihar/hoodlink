import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc, query, orderBy } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Observable, from, map } from 'rxjs';

export interface Vendor {
  id?: string | null;  // Updated type to include null
  name: string;
  contact: string;
  email: string;
  services: string[];
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class VendorService {
  private readonly collectionName = 'vendors';

  constructor(
    private firestore: Firestore,
    private authService: AuthService
  ) {}

  async addVendor(vendor: Omit<Vendor, 'id' | 'createdAt'>): Promise<void> {
    const isAdmin = await this.authService.isAdmin();
    if (!isAdmin) {
      throw new Error('Unauthorized: Only admins can add vendors');
    }

    const vendorData: Omit<Vendor, 'id'> = {
      ...vendor,
      createdAt: new Date().toISOString()
    };

    const vendorsRef = collection(this.firestore, this.collectionName);
    await addDoc(vendorsRef, vendorData);
  }

  getVendors(): Observable<Vendor[]> {
    const vendorsRef = collection(this.firestore, this.collectionName);
    const q = query(vendorsRef, orderBy('createdAt', 'desc'));
    
    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id || null,  // Ensure id is either string or null
          ...doc.data() as Omit<Vendor, 'id'>
        }))
      )
    );
  }

  async updateVendor(id: string, updates: Partial<Vendor>): Promise<void> {
    const isAdmin = await this.authService.isAdmin();
    if (!isAdmin) {
      throw new Error('Unauthorized: Only admins can update vendors');
    }

    const vendorRef = doc(this.firestore, this.collectionName, id);
    await updateDoc(vendorRef, updates);
  }

  async deleteVendor(id: string): Promise<void> {
    const isAdmin = await this.authService.isAdmin();
    if (!isAdmin) {
      throw new Error('Unauthorized: Only admins can delete vendors');
    }

    const vendorRef = doc(this.firestore, this.collectionName, id);
    await deleteDoc(vendorRef);
  }
}