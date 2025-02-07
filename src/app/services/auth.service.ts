import { Injectable } from '@angular/core';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import {
  signInWithEmailAndPassword as firebaseSignIn,
  createUserWithEmailAndPassword as firebaseCreateUser,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import {
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from '@angular/fire/firestore';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userState = new BehaviorSubject<User | null>(null);
  user$ = this.userState.asObservable();
  isAuthLoaded = false;

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {
    onAuthStateChanged(this.auth, async (user) => {
      this.userState.next(user);
      this.isAuthLoaded = true;

      if (user) {
        const userDocRef = doc(this.firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();

          // Only redirect if user is on the login page (to prevent forcing them to dashboard on refresh)
          if (this.router.url === '/auth/login') {
            if (userData['role'] === 'admin') {
              this.router.navigate(['/admin']);
            } else {
              this.router.navigate(['/dashboard']);
            }
          }
        }
      }
    });
  }

  async login(email: string, password: string) {
    try {
      const userCredential = await firebaseSignIn(this.auth, email, password);
      const user = userCredential.user;
      if (!user) throw new Error('No user found after login');

      const userDocRef = doc(this.firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        await this.signOut();
        throw new Error('User document not found in Firestore');
      }

      this.isAuthLoaded = true;
      const userData = userDoc.data();
      this.userState.next(user);

      // Redirect user based on role **after login only**
      if (userData['role'] === 'admin') {
        await this.router.navigate(['/admin']);
      } else {
        await this.router.navigate(['/dashboard']);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(email: string, password: string, role: 'admin' | 'member', username: string, societyId: string) {
    try {
      // First create the Firebase Auth user
      const userCredential = await firebaseCreateUser(this.auth, email, password);
      const user = userCredential.user;
      if (!user) throw new Error('No user created');
  
      // Wait a moment to ensure Firebase Auth is fully processed
      await new Promise(resolve => setTimeout(resolve, 1000));
  
      // Then create the user document in Firestore
      const userDocRef = doc(this.firestore, 'users', user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        email: email,
        role: role,
        username: username,
        societyId: societyId,
        createdAt: new Date().toISOString()
      });
  
      this.userState.next(user);
      this.isAuthLoaded = true;
  
      if (role === 'admin') {
        await this.router.navigate(['/admin']);
      } else {
        await this.router.navigate(['/dashboard']);
      }
    } catch (error) {
      // If Firestore document creation fails, delete the auth user
      if (this.auth.currentUser) {
        await this.auth.currentUser.delete();
      }
      console.error('Registration error:', error);
      throw error;
    }
  }

  async signOut() {
    try {
      await this.auth.signOut();
      this.userState.next(null);
      this.isAuthLoaded = true;
      await this.router.navigate(['/auth/login']);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  async isAdmin(): Promise<boolean> {
    const user = await firstValueFrom(this.user$);
    if (!user) return false;

    const userDoc = await getDoc(doc(this.firestore, 'users', user.uid));
    return userDoc.exists() && userDoc.data()['role'] === 'admin';
  }
  async getCurrentUserSocietyId(): Promise<string | null> {
    const user = await firstValueFrom(this.user$);
    if (!user) {
      return null;
    }
    const userDoc = await getDoc(doc(this.firestore, 'users', user.uid));
    return userDoc.exists() ? userDoc.data()['societyId'] : null;
  }
}
