import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS, environment } from '../../environments/environment';
import { TokenService } from './token.service';
import { Router } from '@angular/router';

import { Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { LoginRequest } from '../models/login-request';
import { LoginResponse } from '../models/login-response';
import { RegisterRequest } from '../models/register-request';
import { RegisterResponse } from '../models/register-response';
import { RefreshTokenRequest } from '../models/refresh-token-request';
import { RefreshTokenResponse } from '../models/refresh-token-response';
import { LogoutRequest } from '../models/logout-request';

import { AuthStateService } from './auth-state.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  //private readonly apiBaseUrl = environment.apiBaseUrl;
  private readonly apiBaseUrl = `${environment.apiBaseUrl}`;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private authStateService: AuthStateService,
    private router: Router,
  ) {}

  // REGISTER
  register(request: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiBaseUrl}${API_ENDPOINTS.register}`, request);
  }

  // LOGIN
  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiBaseUrl}${API_ENDPOINTS.login}`, request);
  }

  // REFRESH TOKEN
  refreshToken(request: RefreshTokenRequest): Observable<RefreshTokenResponse> {
    return this.http.post<RefreshTokenResponse>(
      `${this.apiBaseUrl}${API_ENDPOINTS.refreshToken}`,
      request,
    );
  }

  // LOGOUT
  logout(): Observable<void> {
    const refreshToken = this.tokenService.getRefreshToken();

    // No refresh token means there is nothing to revoke on the server.
    if (!refreshToken) {
      this.completeLocalLogout();
      return of(void 0);
    }

    const request: LogoutRequest = {
      refreshToken: refreshToken,
    };

    return this.http.post<void>(`${this.apiBaseUrl}${API_ENDPOINTS.logout}`, request).pipe(
      catchError((error) => {
        // Even if server logout fails, continue with local logout.
        return of(void 0);
      }),

      finalize(() => {
        this.completeLocalLogout();
      }),
    );
  }
  // LOGOUT ALL DEVICES
  // ==================================================

  logoutAllDevices(): Observable<void> {
    return this.http.post<void>(`${this.apiBaseUrl}${API_ENDPOINTS.logoutAll}`, {}).pipe(
      // Even if the server request fails, clean up the current browser session.
      catchError(() => {
        return of(void 0);
      }),

      finalize(() => {
        this.completeLocalLogout();
      }),
    );
  }

  // LOCAL LOGOUT
  private completeLocalLogout(): void {
    // 1. Remove access + refresh tokens
    this.tokenService.clearTokens();
    // 2. Update authentication state
    this.authStateService.setLoggedOut();
    // 3. Navigate to login
    this.router.navigate(['/login']);
  }
}
