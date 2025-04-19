import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manager-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './manager-login.component.html',
  styleUrl: './manager-login.component.scss'
})
export class ManagerLoginComponent {
  password: string = '';
  showError: boolean = false;
  
  constructor(private router: Router) {}

  onSubmit() {
    console.log('Login submitted with password:', this.password);
    // Simple password check - "adminnoon" as requested
    if (this.password === 'adminnoon') {
      console.log('Password correct, navigating to /manager');
      this.router.navigate(['/manager']);
    } else {
      console.log('Password incorrect');
      this.showError = true;
    }
  }
}
