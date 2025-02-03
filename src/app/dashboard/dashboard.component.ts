import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Auth, onAuthStateChanged, user, User } from '@angular/fire/auth';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';
import { CommonModule, DatePipe } from '@angular/common';
import { BehaviorSubject, interval, map, Subscription } from 'rxjs';
import { SideBarComponent } from '../side-bar/side-bar.component';
import { DocumentsService } from '../services/documents.service';
import { ComplaintService } from '../services/complaint.service';
import { NotificationService } from '../services/notification.service';
import { UserService } from '../services/user.service';
interface DashboardStats {
  totalUsers: number;
  activeComplaints: number;
  unreadNotifications: number;
  totalDocuments: number;
}
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SideBarComponent, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
  userRole: string = '';
  userEmail: string = '';
  username: string = '';
  isLoading: boolean = true;
  today = new Date();
  dashBoardStats: DashboardStats = {
    totalUsers: 0,
    activeComplaints: 0,
    unreadNotifications: 0,
    totalDocuments: 0,
  };
  private subscriptions: Subscription[] = [];
  private statsSubject = new BehaviorSubject<DashboardStats>({
    totalUsers: 0,
    activeComplaints: 0,
    unreadNotifications: 0,
    totalDocuments: 0,
  });
  stats$ = this.statsSubject.asObservable();
  constructor(
    private router: Router,
    private authService: AuthService,
    private auth: Auth,
    private firestore: Firestore,
    private documentService: DocumentsService,
    private complaintService: ComplaintService,
    private notificationService: NotificationService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.subscribeToAuthState();
    this.initializeStats();
    const refreshSub = interval(30000).subscribe(() => {
      this.refreshStats();
    });
    this.subscriptions.push(refreshSub);
  }
  private async refreshStats() {
    if (this.userRole === 'admin') {
      try {
        const users = await this.userService.getallUsers();
        this.updateStats({ totalUsers: users.length });
      } catch (error) {
        console.error('Error refreshing user stats:', error);
      }
    }
  }
  private async initializeStats() {
    if (this.userRole === 'admin') {
      try {
        const users = await this.userService.getallUsers();
        this.updateStats({ totalUsers: users.length });
      } catch (error) {
        console.error('Error getting users count:', error);
      }
    }
    const complaintSub = this.complaintService.complaint$
      .pipe(
        map(
          (complaints) =>
            complaints.filter((c) => c.status === 'pending').length
        )
      )
      .subscribe((count) => {
        this.updateStats({ activeComplaints: count });
      });
    const notificationSub = this.notificationService
      .getNotifications()
      .pipe(
        map((notifications) => notifications.filter((n) => !n.isRead).length)
      )
      .subscribe((count) => {
        this.updateStats({ unreadNotifications: count });
      });
    const documentSub = this.documentService.documents$
      .pipe(map((documents) => documents.length))
      .subscribe((count) => {
        this.updateStats({ totalDocuments: count });
      });
    this.subscriptions.push(complaintSub, notificationSub, documentSub);
  }
  private updateStats(newStats: Partial<DashboardStats>) {
    const currentStats = this.statsSubject.value;
    this.statsSubject.next({
      ...currentStats,
      ...newStats,
    });
    this.dashBoardStats = {
      ...currentStats,
      ...newStats,
    };
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private subscribeToAuthState() {
    const unsubscribe = onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.loadUserData(user);
      } else {
        this.router.navigate(['/auth/login']);
      }
    });

    this.subscriptions.push(new Subscription(() => unsubscribe()));
  }

  async loadUserData(user: User) {
    try {
      const userDocsRef = doc(this.firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocsRef);
      console.log('user doc:', userDoc);
      console.log('user doc ref:', userDocsRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        this.userRole = userData['role'] || '';
        this.userEmail = user.email || '';
        this.username = userData['username'] || '';
        this.isLoading = false;
        await this.initializeStats();
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
  manageUser() {
    this.router.navigate(['/manage-user']);
  }
  goToNotification() {
    this.router.navigate(['/notifications']);
  }
  goToComplaint() {
    this.router.navigate(['/complaint']);
  }
  goToDocument() {
    this.router.navigate(['/documents']);
  }
  goToProfile(){
    this.router.navigate(['/profile']);
  }
}
