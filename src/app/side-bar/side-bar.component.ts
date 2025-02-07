import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent {
  isCollapsed = false;
  isOpen = true;
  isMobile = false;

  constructor(private router: Router, private authService: AuthService) {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  checkScreenSize() {
    const previousIsMobile = this.isMobile;
    this.isMobile = window.innerWidth <= 768;
    
    // Keep sidebar visible by default on desktop
    if (!this.isMobile && previousIsMobile) {
      this.isOpen = true;
    }
  }

  toggleSidebar() {
    if (this.isMobile) {
      this.isOpen = !this.isOpen;
    } else {
      this.isCollapsed = !this.isCollapsed;
    }
  }

  closeSidebar() {
    if (this.isMobile) {
      this.isOpen = false;
    }
  }

  // Navigation methods with automatic sidebar closing on mobile
  private navigateAndClose(path: string) {
    this.router.navigate([path]);
    if (this.isMobile) {
      this.closeSidebar();
    }
  }

  goToDashboard() {
    this.navigateAndClose('/dashboard');
  }

  goToMaintenance() {
    this.navigateAndClose('/maintenance');
  }

  goToNotification() {
    this.navigateAndClose('/notifications');
  }

  goToDocuments() {
    this.navigateAndClose('/documents');
  }

  goToComplaint() {
    this.navigateAndClose('/complaint');
  }

  goToVendors() {
    this.navigateAndClose('/vendors');
  }
  goToProfile(){
    this.navigateAndClose('/profile');
  }
  async logout() {
    await this.authService.signOut();
    this.navigateAndClose('/auth/login');
  }
}