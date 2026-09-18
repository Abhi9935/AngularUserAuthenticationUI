import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly accessTokenKey = 'access_token';
  private readonly refreshTokenKey = 'refresh_token';

  // Access Token
  setAccessToken(token: string): void {
    sessionStorage.setItem(this.accessTokenKey, token);
  }

  getAccessToken(): string | null {
    return sessionStorage.getItem(this.accessTokenKey);
  }

  clearAccessToken(): void {
    sessionStorage.removeItem(this.accessTokenKey);
  }

  hasAccessToken(): boolean {
    return this.getAccessToken() !== null;
  }

  // Refresh Token
  setRefreshToken(token: string): void {
    sessionStorage.setItem(this.refreshTokenKey, token);
  }

  getRefreshToken(): string | null {
    return sessionStorage.getItem(this.refreshTokenKey);
  }

  clearRefreshToken(): void {
    sessionStorage.removeItem(this.refreshTokenKey);
  }

  // Clear All Tokens
  clearTokens(): void {
    this.clearAccessToken();
    this.clearRefreshToken();
  }
}
