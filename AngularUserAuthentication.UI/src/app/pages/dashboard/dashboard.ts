import { Component } from '@angular/core';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  constructor(private authService: AuthService) {}

  isLoggingOut = false;

  logout(): void {
    if (this.isLoggingOut) {
      return;
    }

    this.isLoggingOut = true;
    this.authService.logout().subscribe({
      complete: () => {
        this.isLoggingOut = false;
      },
    });
  }

  logoutAllDevices(): void {
    if (this.isLoggingOut) {
      return;
    }

    this.isLoggingOut = true;
    this.authService.logoutAllDevices().subscribe({
      complete: () => {
        this.isLoggingOut = false;
      },
    });
  }
}
