import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_ENDPOINTS, environment } from '../../environments/environment';
import { TokenService } from './token.service';

import { LoginRequest } from '../models/login-request';
import { LoginResponse } from '../models/login-response';

import { RegisterRequest } from '../models/register-request';
import { RegisterResponse } from '../models/register-response';
import { RefreshTokenRequest } from '../models/refresh-token-request';
import { RefreshTokenResponse } from '../models/refresh-token-response';
import { Observable } from 'rxjs/internal/Observable';
import { LogoutRequest } from '../models/logout-request';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  //private readonly apiBaseUrl = environment.apiBaseUrl;
  private readonly apiBaseUrl = `${environment.apiBaseUrl}`;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
  ) {}

  register(request: RegisterRequest) {
    return this.http.post<RegisterResponse>(`${this.apiBaseUrl}${API_ENDPOINTS.register}`, request);
  }

  login(request: LoginRequest) {
    return this.http.post<LoginResponse>(`${this.apiBaseUrl}${API_ENDPOINTS.login}`, request);
  }
  refreshToken(request: RefreshTokenRequest): Observable<RefreshTokenResponse> {
    return this.http.post<RefreshTokenResponse>(
      `${this.apiBaseUrl}${API_ENDPOINTS.refreshToken}`,
      request,
    );
  }
  logout(request: LogoutRequest): Observable<void> {
    return this.http.post<void>(`${this.apiBaseUrl}${API_ENDPOINTS.logout}`, request);
  }
}
