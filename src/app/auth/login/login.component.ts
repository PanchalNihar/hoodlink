import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from "@angular/forms";
import { Router } from '@angular/router';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService,private router:Router) {}
  async onGoogleSignIn() {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('Google Sign-in sucessfull: ', user);
      this.router.navigate(['/dashboard']);
    } catch (err) {
      console.error(err);
      alert('Failed to sign in with google. Please try again later');
    }
  }
  async login() {
    try {
      await this.authService.login(this.email, this.password);
    } catch (error: any) {
      alert(error.message);
    }
  }
  navigatetoDashboard(){
    this.router.navigate(['/dashboard']);
  }
  onRegister(){
    this.router.navigate(['/auth/register']);
  }
  forgotPassword(){
    this.router.navigate(['/auth/forgot-password'])
  }
}