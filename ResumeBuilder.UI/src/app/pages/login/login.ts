import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { AuthStateService } from '../../services/auth-state';

import { Router, RouterLink } from '@angular/router';
import { LoginRequest } from '../../models/login-request';
import { TokenService } from '../../services/token.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  showPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private authStateService: AuthStateService,
    private tokenService: TokenService,
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const request: LoginRequest = {
      UserEmail: this.loginForm.value.email,
      Password: this.loginForm.value.password,
    };

    this.isSubmitting = true;

    this.authService.login(request).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        console.log('Login successful:', response);
        this.authStateService.setAuthenticated();
        this.successMessage = 'Login successful!';
        // need to implement Token handling
        this.tokenService.setAccessToken(response.accessToken);
        this.router.navigate(['/dashboard']);
      },

      error: (error) => {
        this.isSubmitting = false;
        console.error('Login failed:', error);
        this.errorMessage = this.getErrorMessage(error);
      },
    });
  }

  private getErrorMessage(error: any): string {
    if (!error) {
      return 'Something went wrong. Please try again.';
    }
    if (error.status === 0) {
      return 'Unable to connect to the server. ' + 'Please check whether the API is running.';
    }
    if (error.status === 400) {
      return error.error?.message || 'Please check your email and password.';
    }
    if (error.status === 401) {
      return error.error?.message || 'Invalid email or password.';
    }
    if (error.status === 403) {
      return error.error?.message || 'You are not authorized to access this application.';
    }
    if (error.status >= 500) {
      return 'A server error occurred. Please try again later.';
    }
    return error.error?.message || 'Login failed. Please try again.';
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}
