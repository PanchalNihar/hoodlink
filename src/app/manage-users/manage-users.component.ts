import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../services/user.service';
import { DashboardComponent } from "../dashboard/dashboard.component";
import { Router } from '@angular/router';
import { SideBarComponent } from '../side-bar/side-bar.component';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-manage-users',
  imports: [CommonModule,SideBarComponent],
  templateUrl: './manage-users.component.html',
  styleUrl: './manage-users.component.css',
})
export class ManageUsersComponent implements OnInit {
  users: User[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  isAdminUser:boolean=false
  constructor(private userService: UserService,private router:Router,private authService:AuthService) {}
  ngOnInit(): void {
    this.checkAdminRole()
    this.loadUsers();
  }
  async checkAdminRole() {
    this.isAdminUser = await this.authService.isAdmin();
  }
  async loadUsers() {
    try {
      this.isLoading = true;
      this.users = await this.userService.getallUsers();
    } catch (error) {
      this.error = 'Failed to Load Users!!';
      console.log('Errors: ', error);
    } finally {
      this.isLoading = false;
    }
  }
  async deleteUser(uid: string) {
    if (!this.isAdminUser) {
      alert('Only admins can delete users.');
      return;
    }

    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await this.userService.deleteUser(uid);
        alert('User deleted successfully.');
        this.loadUsers(); // Refresh the list
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user.');
      }
    }
  }
  backToDashboard(){
    this.router.navigate(['/dashboard']);
  }
}
