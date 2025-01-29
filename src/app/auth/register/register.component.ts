import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
@Component({
  selector: 'app-register',
  imports: [CommonModule,FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  role: 'admin' | 'member' = 'member';
  constructor(private authService:AuthService,private router:Router){}
  register(){
    this.authService.register(this.email,this.password,this.role).catch((error)=>{
      alert(error.message)
    })
  }
}
