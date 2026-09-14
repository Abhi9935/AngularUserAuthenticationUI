import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn, HttpContextToken } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { TokenService } from '../services/token.service';
import { AuthStateService } from '../services/auth-state.service';
import { TokenRefreshService } from '../services/token-refresh.service';
import { API_ENDPOINTS } from '../../environments/environment';

// Prevent infinite retry
const AUTH_RETRY = new HttpContextToken<boolean>(() => false);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const tokenRefreshService = inject(TokenRefreshService);
  const authStateService = inject(AuthStateService);

  // Don't intercept refresh endpoint
  const isRefreshRequest = req.url.includes(API_ENDPOINTS.refreshToken);

  if (isRefreshRequest) {
    return next(req);
  }

  // Check if request already retried
  const alreadyRetried = req.context.get(AUTH_RETRY);

  // Get Access Token
  const accessToken = tokenService.getAccessToken();

  // No Access Token
  if (!accessToken) {
    return next(req);
  }

  // Add JWT Access Token
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

      // Already retried
      if (alreadyRetried) {
        tokenService.clearTokens();
        authStateService.setLoggedOut();
        return throwError(() => error);
      }

      // Refresh access token
      return tokenRefreshService.refreshAccessToken().pipe(
        switchMap((newAccessToken) => {
          // Mark request as retried
          const retryRequest = req.clone({
            context: req.context.set(AUTH_RETRY, true),
            setHeaders: {
              Authorization: `Bearer ${newAccessToken}`,
            },
          });

          // Retry request
          return next(retryRequest);
        }),

        // Refresh failed
        catchError((refreshError) => {
          tokenService.clearTokens();
          authStateService.setLoggedOut();
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
