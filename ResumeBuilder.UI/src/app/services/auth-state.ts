import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthStateService {
  private authenticatedSubject = new BehaviorSubject<boolean>(false);

  isAuthenticated$ = this.authenticatedSubject.asObservable();

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
