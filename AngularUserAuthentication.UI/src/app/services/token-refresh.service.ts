import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, map, shareReplay } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { AuthStateService } from './auth-state.service';

@Injectable({
  providedIn: 'root',
})
export class TokenRefreshService {
  private refreshRequest$: Observable<string> | null = null;

  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private authStateService: AuthStateService,
  ) {}

  refreshAccessToken(): Observable<string> {
    // Refresh already running
    if (this.refreshRequest$) {
      return this.refreshRequest$;
    }

    // Get refresh token
    const refreshToken = this.tokenService.getRefreshToken();

    if (!refreshToken) {
      this.tokenService.clearTokens();
      this.authStateService.setLoggedOut();
      return throwError(() => new Error('Refresh token is not available.'));
    }

    // Create refresh request
    this.refreshRequest$ = this.authService
      .refreshToken({
        refreshToken: refreshToken,
      })
      .pipe(
        // Save new tokens
        map((response) => {
          this.tokenService.setAccessToken(response.accessToken);

          if (response.refreshToken) {
            this.tokenService.setRefreshToken(response.refreshToken);
          }

          this.authStateService.setAuthenticated();
          return response.accessToken;
        }),

        // Handle refresh failure
        catchError((error) => {
          this.tokenService.clearTokens();
          this.authStateService.setLoggedOut();
          return throwError(() => error);
        }),

        // Share one HTTP request
        shareReplay(1),
        // Allow future refreshes
        finalize(() => {
          this.refreshRequest$ = null;
        }),
      );

    return this.refreshRequest$;
  }
}
