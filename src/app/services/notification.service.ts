import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { map, Observable } from 'rxjs';
export interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: Date;
  isRead: string;
  type?: 'info' | 'alert' | 'success';
  recipientIds?: string[];
}
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationsCollection = 'notifications';
  constructor(private firestore: Firestore, private authService: AuthService) {}
  getNotifications(): Observable<Notification[]> {
    const notificationRef = collection(
      this.firestore,
      this.notificationsCollection
    );
    const notificationsQuery = query(
      notificationRef,
      orderBy('createdAt', 'desc')
    );
    return collectionData(notificationsQuery, { idField: 'id' }).pipe(
      map((notifications) => notifications as Notification[])
    );
  }
  async createNotification(
    notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>
  ) {
    const isAdmin = await this.authService.isAdmin();
    if (!isAdmin) {
      throw new Error('Only admins can create notifications');
    }
    const notificationData = {
      ...notification,
      createdAt: new Date(),
      isRead: false,
    };
    return addDoc(
      collection(this.firestore, this.notificationsCollection),
      notificationData
    );
  }
  async markAsRead(notificationId: string) {
    const notificationRef = doc(
      this.firestore,
      this.notificationsCollection,
      notificationId
    );
    return updateDoc(notificationRef, { isRead: true });
  }
  async markAllAsRead() {
    const notificationRef = collection(
      this.firestore,
      this.notificationsCollection
    );
    const notificationQuery = query(
      notificationRef,
      where('isRead', '==', false)
    );
    const snapShot = await getDocs(notificationQuery);
    const updatePromises = snapShot.docs.map((doc) =>
      updateDoc(doc.ref, { isRead: true })
    );
    await Promise.all(updatePromises);
  }
  async deleteNotification(notificationId: string) {
    const isAdmin = await this.authService.isAdmin();
    if (!isAdmin) {
      throw new Error('Only admins can delete notifications');
    }
    const notificationRef = doc(
      this.firestore,
      this.notificationsCollection,
      notificationId
    );
    return deleteDoc(notificationRef);
  }
}
