import { Injectable } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import {
  signInWithEmailAndPassword as firebaseSignIn,
  createUserWithEmailAndPassword as firebaseCreateUser,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userState = new BehaviorSubject<any>(null);
  user$ = this.userState.asObservable();
  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {
    onAuthStateChanged(this.auth, (user) => {
      this.userState.next(user);
    });
  }

  async login(email: string, password: string) {
    try {
      const userCredential = await firebaseSignIn(this.auth, email, password);
      const user = userCredential.user;

      if (!user) {
        throw new Error('No user found after login');
      }

      console.log('User logged in:', user.uid);

      // Get the user document from Firestore
      const userDocRef = doc(this.firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      console.log('User doc exists:', userDoc.exists());

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('User role:', userData['role']);

        if (userData['role'] === 'admin') {
          await this.router.navigate(['/admin']);
        } else if (userData['role'] === 'member') {
          await this.router.navigate(['/dashboard']);
        } else {
          console.log('Invalid role:', userData['role']);
          await this.signOut();
          throw new Error('Role not assigned or invalid');
        }
      } else {
        console.log('No user document found in Firestore');
        await this.signOut();
        throw new Error('User document not found in Firestore');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(email: string, password: string, role: 'admin' | 'member') {
    try {
      const userCredential = await firebaseCreateUser(
        this.auth,
        email,
        password
      );
      const user = userCredential.user;

      if (!user) {
        throw new Error('No user created');
      }

      // Set the user role in Firestore
      const userDocRef = doc(this.firestore, 'users', user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        role: role,
      });

      await this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async signOut() {
    try {
      await this.auth.signOut();
      await this.router.navigate(['/auth/login']);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }
}
