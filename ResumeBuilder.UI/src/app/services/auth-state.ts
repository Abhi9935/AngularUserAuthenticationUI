import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  private authenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$;

  constructor(private tokenService: TokenService) {
    const hasToken = this.tokenService.hasAccessToken();
    this.authenticatedSubject = new BehaviorSubject<boolean>(hasToken);
    this.isAuthenticated$ = this.authenticatedSubject.asObservable();
  }

  setAuthenticated(): void {
    this.authenticatedSubject.next(true);
  }

  setLoggedOut(): void {
    this.authenticatedSubject.next(false);
  }

  get isAuthenticated(): boolean {
    return this.authenticatedSubject.value;
  }
}
