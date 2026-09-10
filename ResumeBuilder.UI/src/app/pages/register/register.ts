import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { RegisterRequest } from '../../models/register-request';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-register',
  styleUrl: './register.css',
  templateUrl: './register.html',
})
export class Register {
  registerForm: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.registerForm = this.formBuilder.group(
      {
        username: ['', Validators.required, Validators.minLength(3)],
        email: ['', [(Validators.required, Validators.email)]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      {
        validators: [this.passwordMatchValidator()],
      },
    );
  }

  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const request: RegisterRequest = {
      Username: this.registerForm.value.username,
      UserEmail: this.registerForm.value.email,
      Password: this.registerForm.value.password,
    };

    this.isSubmitting = true;

    this.authService.register(request).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = response.message || 'Registration successful!';
        console.log('Registration successful');
        // Optional: Redirect to Login page

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },

      error: (error) => {
        this.isSubmitting = false;
        console.error('Registration failed:', error);
        this.errorMessage = this.getErrorMessage(error);
      },
    });
  }

  // Explicitly check the type inside your error helper
  private getErrorMessage(error: any): string {
    if (!error) {
      return 'Something went wrong. Please try again.';
    }

    if (error.status === 0) {
      return 'Unable to connect to the server.';
    }

    if (error.status === 400) {
      return error.error?.message || 'Please check the information you entered.';
    }

    if (error.status === 409) {
      return error.error?.message || 'An account with this information already exists.';
    }

    if (error.status >= 500) {
      return 'Server error. Please try again later.';
    }

    return error.error?.message || 'Registration failed. Please try again.';
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('password')?.value;
      const confirmPassword = control.get('confirmPassword')?.value;

      if (password !== confirmPassword) {
        return {
          passwordMismatch: true,
        };
      }

      return null;
    };
  }
}
