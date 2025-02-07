import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SideBarComponent } from '../side-bar/side-bar.component';
import { AuthService } from '../services/auth.service';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { User } from '@angular/fire/auth';
import { Router } from '@angular/router';

interface UserProfile {
  username?: string;
  email?: string;
  role?: 'admin' | 'member';
  createdAt?: string;
  phone?: string;
  address?: string;
  societyName: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, SideBarComponent, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  userProfile: UserProfile = {
    societyName: '',
  };
  isLoading = true;
  isEditing = false;

  constructor(
    private authService: AuthService,
    private firestore: Firestore,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe(async (user) => {
      this.user = user;
      if (user) {
        await this.fetchUserProfile(user.uid);
      }
    });
  }

  async fetchUserProfile(uid: string) {
    try {
      const userDocRef = doc(this.firestore, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      const societyId = await this.authService.getCurrentUserSocietyId();
      if (userDoc.exists()) {
        this.userProfile = userDoc.data() as UserProfile;
        this.userProfile.societyName = societyId ?? '';
      }
      this.isLoading = false;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      this.isLoading = false;
    }
  }

  toggleEditMode() {
    this.isEditing = !this.isEditing;
  }

  async saveProfile() {
    if (!this.user) return;

    try {
      const userDocRef = doc(this.firestore, 'users', this.user.uid);
      await setDoc(userDocRef, this.userProfile, { merge: true });

      this.isEditing = false; // Exit edit mode after saving
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  }
  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
