import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  Firestore,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  Unsubscribe,
  where,
} from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { BehaviorSubject, firstValueFrom, from, map, Observable } from 'rxjs';
export interface Document {
  id: string;
  title: string;
  fileUrl: string;
  createdBy: string;
  createdAt: string;
  category: string;
  size: number;
}
export interface UploadStatus {
  isUploading: boolean;
  progress: number;
  message: string;
  type: 'success' | 'error' | 'info';
}
@Injectable({
  providedIn: 'root',
})
export class DocumentsService {
  private documentsSubject = new BehaviorSubject<Document[]>([]);
  documents$ = this.documentsSubject.asObservable();

  private uploadProgress = new BehaviorSubject<number>(0);
  uploadProgress$ = this.uploadProgress.asObservable();

  private uploadStatusSubject = new BehaviorSubject<UploadStatus>({
    isUploading: false,
    progress: 0,
    message: '',
    type: 'info',
  });
  uploadStatus$ = this.uploadStatusSubject.asObservable();
  private unsubscribe: Unsubscribe | null = null;
  constructor(private firestore: Firestore, private authService: AuthService) {
    this.setupRealtimeUpdates();
  }
  private async setupRealtimeUpdates() {
    const societyId = await this.authService.getCurrentUserSocietyId();
    if (!societyId) {
      throw new Error('No Society Found');
    }
    const docRef = collection(this.firestore, 'documents');
    const docQuery = query(
      docRef,
      where('societyId', '==', societyId),
      orderBy('createdAt', 'desc')
    );

    // Store the unsubscribe function
    this.unsubscribe = onSnapshot(docQuery, {
      next: (snapshot) => {
        const documents = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Document)
        );
        this.documentsSubject.next(documents);
      },
      error: (error) => {
        console.error('Documents subscription error:', error);
      },
    });
  }
  async uploadDocuments(
    file: File,
    title: string,
    category: string
  ): Promise<void> {
    try {
      const societyId = await this.authService.getCurrentUserSocietyId();
      if (!societyId) {
        throw new Error('No Society Found');
      }
      this.uploadStatusSubject.next({
        isUploading: true,
        progress: 0,
        message: 'Starting upload...',
        type: 'info',
      });
      const user = await firstValueFrom(this.authService.user$);
      if (!user) {
        throw new Error('User not logged in');
      }
      const isAdmin = await this.authService.isAdmin();
      if (!isAdmin) {
        throw new Error('Only admins can upload documents');
      }
      if (file.size > 1024 * 1024) {
        throw new Error('File size is too large');
      }
      const fileUrl = await this.readFileAsBase64(file);

      const docData = {
        title: title,
        fileUrl: fileUrl,
        createdBy: user.uid,
        societyId: societyId,
        createdAt: new Date().toISOString(),
        category: category,
        size: file.size / 1024,
      };
      await addDoc(collection(this.firestore, 'documents'), docData);
      this.uploadStatusSubject.next({
        isUploading: false,
        progress: 100,
        message: 'File uploaded successfully!',
        type: 'success',
      });
      setTimeout(() => {
        this.uploadStatusSubject.next({
          isUploading: false,
          progress: 0,
          message: '',
          type: 'info',
        });
      }, 3000);
      // this.uploadProgress.next(100);
    } catch (error) {
      console.log('Upload Error:', error);
      throw error;
    }
  }
  private readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          this.uploadProgress.next(progress);
        }
      };
      reader.onload = () => {
        const base64String = reader.result as string;
        resolve(base64String);
      };
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      reader.readAsDataURL(file);
    });
  }
  async getDocuments(): Promise<Observable<Document[]>> {
    const societyId=await this.authService.getCurrentUserSocietyId()
    if(!societyId){
      throw new Error("Society Not Found")
    }
    const docRef = collection(this.firestore, 'documents');
    const docQuery = query(docRef, where('societyId','==',societyId),orderBy('createdAt', 'desc'));
    return from(getDocs(docQuery)).pipe(
      map((snapshot) =>
        snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Document)
        )
      )
    );
  }
  async getDocumentByCategory(category: string): Promise<Observable<Document[]>> {
    const documents$ = await this.getDocuments(); // Resolve the Promise
    return documents$.pipe(
      map((documents) => documents.filter((doc) => doc.category === category))
    );
  }
  async deleteDocument(document: Document): Promise<void> {
    const user = await firstValueFrom(this.authService.user$);
    const isAdmin = user && (await this.authService.isAdmin());

    if (!isAdmin) {
      throw new Error('Only admins can delete documents');
    }
    await deleteDoc(doc(this.firestore, 'documents', document.id));
  }
  async downloadDocument(doc: Document) {
    try {
      const mimeType = doc.fileUrl.split(';')[0].split(':')[1];

      const base64Data = doc.fileUrl.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      const blob = new Blob(byteArrays, { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.title;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download Failed: ', error);
      throw new Error('Failed to download file');
    }
  }
}
