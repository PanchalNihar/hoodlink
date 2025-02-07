import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from '@angular/fire/firestore';
import { AuthService } from './auth.service';

export interface User {
  uid: string;
  username: string;
  email: string;
  role: 'admin' | 'member';
  societyId: string;
  createdAt: string;
}
@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private firestore: Firestore, private authService: AuthService) {}
  async getallUsers(): Promise<User[]> {
    try {
      const societyId = await this.authService.getCurrentUserSocietyId();
      if (!societyId) {
        throw new Error('No Society ID Found');
      }
      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, where('societyId', '==', societyId));
      const snapShot = await getDocs(q);
      return snapShot.docs.map((doc) => ({
        ...(doc.data() as User),
      }));
    } catch (error) {
      console.log('Error Fetching User: ', error);
      throw error;
    }
  }
  async deleteUser(uid: string): Promise<void> {
    try {
      const societyId = await this.authService.getCurrentUserSocietyId();
      const userDocRef = doc(this.firestore, 'users', uid);
      const userDoc = await getDocs(
        query(
          collection(this.firestore, 'users'),
          where('uid', '==', uid),
          where('societyId', '==', societyId)
        )
      );
      if (userDoc.empty) {
        throw new Error('User Not Found in your Society');
      }
      await deleteDoc(userDocRef);
      console.log(`User with UID: ${uid} deleted successfully.`);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}
