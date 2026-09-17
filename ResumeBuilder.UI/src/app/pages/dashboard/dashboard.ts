import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TokenService } from '../../services/token.service';
import { AuthStateService } from '../../services/auth-state.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private authStateService: AuthStateService,
    private router: Router,
  ) {}

  logout(): void {
    const refreshToken = this.tokenService.getRefreshToken();

    if (!refreshToken) {
      this.performLocalLogout();
      return;
    }

    this.authService
      .logout({
        refreshToken: refreshToken,
      })
      .subscribe({
        next: () => {
          this.performLocalLogout();
        },

        error: () => {
          //Even if the server logout fails, remove local authentication.
          this.performLocalLogout();
        },
      });
  }

  private performLocalLogout(): void {
    this.tokenService.clearTokens();
    this.authStateService.setLoggedOut();
    this.router.navigate(['/login']);
  }
}
