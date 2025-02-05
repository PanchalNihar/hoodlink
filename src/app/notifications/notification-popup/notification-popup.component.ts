import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Notification } from '../../services/notification.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-notification-popup',
  imports: [CommonModule],
  templateUrl: './notification-popup.component.html',
  styleUrl: './notification-popup.component.css',
})
export class NotificationPopupComponent {
  @Input() notification!: Notification;
  @Input() show = false;
  @Output() close = new EventEmitter<void>();
  @Output() markAsRead = new EventEmitter<string>();
  onClose() {
    this.close.emit();
  }
  onMarkAsRead() {
    this.markAsRead.emit(this.notification.id);
    this.close.emit();
  }
}
