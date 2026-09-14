import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, finalize, map, take } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { AuthStateService } from './auth-state.service';

@Injectable({
  providedIn: 'root',
})
export class TokenRefreshService {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private authStateService: AuthStateService,
  ) {}

  refreshAccessToken(): Observable<string> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);
      const refreshToken = this.tokenService.getRefreshToken();

      if (!refreshToken) {
        this.isRefreshing = false;
        this.tokenService.clearTokens();
        this.authStateService.setLoggedOut();
        return throwError(() => new Error('Refresh token is not available.'));
      }

      return this.authService
        .refreshToken({
          refreshToken: refreshToken,
        })
        .pipe(
          map((response) => {
            // Save new access token
            this.tokenService.setAccessToken(response.accessToken);

            // Save rotated refresh token
            if (response.refreshToken) {
              this.tokenService.setRefreshToken(response.refreshToken);
            }

            this.authStateService.setAuthenticated();

            // Tell waiting requests
            this.refreshTokenSubject.next(response.accessToken);

            return response.accessToken;
          }),

          catchError((error) => {
            this.tokenService.clearTokens();
            this.authStateService.setLoggedOut();
            this.refreshTokenSubject.next(null);
            return throwError(() => error);
          }),

          finalize(() => {
            this.isRefreshing = false;
          }),
        );
    }

    // Refresh already running
    return this.waitForRefresh();
  }

  private waitForRefresh(): Observable<string> {
    return this.refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
    ) as Observable<string>;
  }
}
