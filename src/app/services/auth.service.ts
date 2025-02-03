import { Injectable } from '@angular/core';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import {
  signInWithEmailAndPassword as firebaseSignIn,
  createUserWithEmailAndPassword as firebaseCreateUser,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userState = new BehaviorSubject<User | null>(null);
  user$ = this.userState.asObservable();
  isAuthLoaded = false; // Flag to track if auth has been initialized

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {
    // Wait for Firebase to fully load authentication before navigating
    onAuthStateChanged(this.auth, async (user) => {
      this.userState.next(user);
      this.isAuthLoaded = true;

      if (user) {
        const userDocRef = doc(this.firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData['role'] === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/dashboard']);
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

      console.log('User logged in:', user.uid);

      // Get the user role from Firestore
      const userDocRef = doc(this.firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        await this.signOut();
        throw new Error('User document not found in Firestore');
      }

      // Wait for Firebase auth state to fully load before navigating
      this.isAuthLoaded = true;
      const userData = userDoc.data();
      this.userState.next(user);

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

  async register(email: string, password: string, role: 'admin' | 'member', username: string) {
    try {
      const userCredential = await firebaseCreateUser(this.auth, email, password);
      const user = userCredential.user;
      if (!user) throw new Error('No user created');

      const userDocRef = doc(this.firestore, 'users', user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        role: role,
        username: username,
        createdAt: new Date().toISOString(),
      });

      this.userState.next(user);
      this.isAuthLoaded = true;

      if (role === 'admin') {
        await this.router.navigate(['/admin']);
      } else {
        await this.router.navigate(['/dashboard']);
      }
    } catch (error) {
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
}
