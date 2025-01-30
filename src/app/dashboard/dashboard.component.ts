import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { SideBarComponent } from "../side-bar/side-bar.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SideBarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
  userRole: string = '';
  userEmail: string = '';
  username: string = '';
  isLoading: boolean = true;
  today = new Date();
  private authStateSubscription?: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService,
    private auth: Auth,
    private firestore: Firestore
  ) {}

  ngOnInit(): void {
    this.subscribeToAuthState();
  }

  ngOnDestroy(): void {
    if (this.authStateSubscription) {
      this.authStateSubscription.unsubscribe();
    }
  }

  private subscribeToAuthState() {
    const unsubscribe = onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.loadUserData(user);
      } else {
        this.router.navigate(['/auth/login']);
      }
    });

    this.authStateSubscription = new Subscription(() => unsubscribe());
  }

  async loadUserData(user: User) {
    try {
      const userDocsRef = doc(this.firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocsRef);
      console.log("user doc:",userDoc)
      console.log("user doc ref:",userDocsRef)
      if (userDoc.exists()) {
        const userData = userDoc.data();
        this.userRole = userData['role'] || '';
        this.userEmail = user.email || '';
        this.username = userData['username'] || '';
        this.isLoading = false;

        if (!this.userRole) {
          await this.authService.signOut();
          this.router.navigate(['/auth/login']);
        }
      } else {
        await this.authService.signOut();
        this.router.navigate(['/auth/login']);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      this.isLoading = false;
      await this.authService.signOut();
      this.router.navigate(['/auth/login']);
    }
  }

  async logout() {
    await this.authService.signOut();
    this.router.navigate(['/auth/login']);
  }
  manageUser(){
    this.router.navigate(['/manage-user'])
  }
}
