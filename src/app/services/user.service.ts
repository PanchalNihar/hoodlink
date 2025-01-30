import { Injectable } from '@angular/core';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
export interface User {
  uid: string;
  username: string;
  email: string;
  role: 'admin' | 'member';
  createdAt: string;
}
@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private firestore: Firestore) {}
  async getallUsers(): Promise<User[]> {
    try {
      const usersRef = collection(this.firestore, 'users');
      const snapShot = await getDocs(usersRef);
      return snapShot.docs.map((doc) => ({
        ...(doc.data() as User),
      }));
    } catch (error) {
      console.log('Error Fetching User: ', error);
      throw error;
    }
  }
}
