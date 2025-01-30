import { Component} from '@angular/core';
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
  constructor(private router:Router,private authService:AuthService){}
  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
  goToDashboard(){
    this.router.navigate(['/dashboard']);
  }
  goToMaintenance(){
    this.router.navigate(['/maintenance']);
  }
  goToNotification(){
    this.router.navigate(['/notifications']);
  }
  goToDocuments(){
    this.router.navigate(['/documents']);
  }
  goToComplaint(){
    this.router.navigate(['/complaint']);
  }
  async logout(){
    await this.authService.signOut()
    this.router.navigate(['/auth/login']);
  }
}
