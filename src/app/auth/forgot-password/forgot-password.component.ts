import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Auth, sendPasswordResetEmail } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  imports:[CommonModule,FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent {
  email: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private auth: Auth,private router:Router) {}

  async resetPassword() {
    try {
      await sendPasswordResetEmail(this.auth, this.email);
      this.successMessage = 'Password reset email sent successfully!';
      this.errorMessage = '';
    } catch (error: any) {
      this.errorMessage = error.message;
      this.successMessage = '';
    }
  }
  onLogin(){
    this.router.navigate(['/auth/login']);
  }
}
