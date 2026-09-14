import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth';
import { AuthStateService } from '../services/auth-state';
import { API_ENDPOINTS } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);
  const authStateService = inject(AuthStateService);

  // Detect Refresh Token Request
  const isRefreshRequest = req.url.includes(API_ENDPOINTS.refreshToken);

  // Prevent Infinite Refresh Loop
  if (isRefreshRequest) {
    return next(req);
  }

  // Get Access Token
  const accessToken = tokenService.getAccessToken();

  // No Access Token
  if (!accessToken) {
    return next(req);
  }

  // Add JWT
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // Send Request
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Only Handle 401
      if (error.status !== 401) {
        return throwError(() => error);
      }

      // Get Refresh Token
      const refreshToken = tokenService.getRefreshToken();

      // Refresh Token Missing
      if (!refreshToken) {
        tokenService.clearTokens();
        authStateService.setLoggedOut();
        return throwError(() => error);
      }

      // Call Refresh API
      return authService
        .refreshToken({
          refreshToken: refreshToken,
        })
        .pipe(
          switchMap((response) => {
            // Save New Access Token
            tokenService.setAccessToken(response.accessToken);

            // Save New Refresh Token
            if (response.refreshToken) {
              tokenService.setRefreshToken(response.refreshToken);
            }

            // Update Auth State
            authStateService.setAuthenticated();

            // Retry Original Request
            const retryRequest = req.clone({
              setHeaders: {
                Authorization: `Bearer ${response.accessToken}`,
              },
            });

            return next(retryRequest);
          }),

          // Refresh Failed
          catchError((refreshError) => {
            tokenService.clearTokens();
            authStateService.setLoggedOut();
            return throwError(() => refreshError);
          }),
        );
    }),
  );
};
