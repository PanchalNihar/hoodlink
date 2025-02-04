import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-side-bar',
  imports: [CommonModule, FormsModule],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.css',
})
export class SideBarComponent {
  isCollapsed = false;
  isOpen = false;
  isMobile = window.innerWidth <= 768;

  constructor(private router: Router, private authService: AuthService) {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) {
      this.isOpen = false;
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
    this.closeSidebar();
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

  async logout() {
    await this.authService.signOut();
    this.navigateAndClose('/auth/login');
  }
}