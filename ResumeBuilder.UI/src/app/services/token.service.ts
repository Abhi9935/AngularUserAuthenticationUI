import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly accessTokenKey = 'access_token';

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
}
