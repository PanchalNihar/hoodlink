import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../services/user.service';
import { DashboardComponent } from "../dashboard/dashboard.component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-manage-users',
  imports: [CommonModule],
  templateUrl: './manage-users.component.html',
  styleUrl: './manage-users.component.css',
})
export class ManageUsersComponent implements OnInit {
  users: User[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  constructor(private userService: UserService,private router:Router) {}
  ngOnInit(): void {
    this.loadUsers();
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
  backToDashboard(){
    this.router.navigate(['/dashboard']);
  }
}
