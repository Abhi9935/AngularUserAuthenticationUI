import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { TokenService } from '../services/token.service';
import { AuthStateService } from '../services/auth-state.service';
import { TokenRefreshService } from '../services/token-refresh.service';
import { API_ENDPOINTS } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const authStateService = inject(AuthStateService);
  const tokenRefreshService = inject(TokenRefreshService);

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

      // Refresh Token
      return tokenRefreshService.refreshAccessToken().pipe(
        switchMap((newAccessToken) => {
          // Retry Original Request
          const retryRequest = req.clone({
            setHeaders: {
              Authorization: `Bearer ${newAccessToken}`,
            },
          });

          return next(retryRequest);
        }),

        catchError((refreshError) => {
          authStateService.setLoggedOut();
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
