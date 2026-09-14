import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { TokenService } from './token.service';

import { LoginRequest } from '../models/login-request';
import { LoginResponse } from '../models/login-response';

import { RegisterRequest } from '../models/register-request';
import { RegisterResponse } from '../models/register-response';
import { RefreshTokenRequest } from '../models/refresh-token-request';
import { RefreshTokenResponse } from '../models/refresh-token-response';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  //private readonly apiBaseUrl = environment.apiBaseUrl;
  //private readonly apiUrl = 'https://localhost:5001/api';
  private readonly apiUrl = `${environment.apiBaseUrl}/api`;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
  ) {}

  register(request: RegisterRequest) {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/Auth/register`, request);
  }

  login(request: LoginRequest) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/Auth/login`, request);
  }
  refreshToken(request: RefreshTokenRequest): Observable<RefreshTokenResponse> {
    return this.http.post<RefreshTokenResponse>(`${this.apiUrl}/Auth/refresh-token`, request);
  }
}
