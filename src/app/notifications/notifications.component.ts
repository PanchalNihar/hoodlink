import { Component, OnInit } from '@angular/core';
import { SideBarComponent } from '../side-bar/side-bar.component';
import {
  Notification,
  NotificationService,
} from '../services/notification.service';
import { AuthService } from '../services/auth.service';
import { firstValueFrom, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-notifications',
  imports: [SideBarComponent, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css',
})
export class NotificationsComponent implements OnInit {
  notifications$!: Observable<Notification[]>;
  isAdmin = false;
  showCreateForm = false;
  notificationForm: FormGroup;
  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    try {
      this.notificationForm = this.fb.group({
        title: ['', [Validators.required]],
        message: ['', [Validators.required]],
        type: ['info', [Validators.required]],
      });
    } catch (error) {
      console.error('Error initializing form:', error);
      // Initialize with a default form if fb.group fails
      this.notificationForm = new FormGroup({
        title: new FormControl('', [Validators.required]),
        message: new FormControl('', [Validators.required]),
        type: new FormControl('info', [Validators.required]),
      });
    }
  }
  async ngOnInit() {
    try {
      this.notifications$ = this.notificationService.getNotifications();
      this.isAdmin = await this.authService.isAdmin();
    } catch (error) {
      console.error('Error in ngOnInit:', error);
      this.isAdmin = false;
    }
  }
  getUnreadNotifications(notifications: Notification[]): Notification[] {
    return notifications.filter((n) => !n.isRead);
  }

  getReadNotifications(notifications: Notification[]): Notification[] {
    return notifications.filter((n) => n.isRead);
  }

  hasUnreadNotifications(notifications: Notification[]): boolean {
    return notifications.some((n) => !n.isRead);
  }

  hasReadNotifications(notifications: Notification[]): boolean {
    return notifications.some((n) => n.isRead);
  }
  async createNewNotification() {
    if (this.notificationForm.valid) {
      try {
        await this.notificationService.createNotification(
          this.notificationForm.value
        );
        this.notificationForm.reset({ type: 'info' });
        this.showCreateForm = false;
      } catch (error) {
        console.error('Error creating notification:', error);
      }
    }
  }
  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.notificationForm.reset({ type: 'info' });
    }
  }
  async markAllAsRead() {
    try {
      await this.notificationService.markAllAsRead();
    } catch (error) {
      console.error('Error marking all notification as read', error);
      throw error;
    }
  }
  async deleteNotification(notificationId: string) {
    try {
      await this.notificationService.deleteNotification(notificationId);
    } catch (error) {
      console.error('Error deleting notification', error);
      throw error;
    }
  }
}
