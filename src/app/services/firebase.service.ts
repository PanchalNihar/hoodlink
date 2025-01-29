import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  constructor(private firestore: AngularFirestore) {}
  getCollections(collection: string) {
    return this.firestore.collection(collection).valueChanges();
  }
  addDocument(collection: string, data: any) {
    return this.firestore.collection(collection).add(data);
  }
  updateDocument(collection: string, id: string, data: any) {
    return this.firestore.collection(collection).doc(id).update(data);
  }
  deleteDocument(collection: string, id: string) {
    return this.firestore.collection(collection).doc(id).delete();
  }
}
