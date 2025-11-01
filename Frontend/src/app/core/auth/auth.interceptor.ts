import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandlerFn,
    HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { Observable, catchError, switchMap, throwError } from 'rxjs';

/**
 * Intercept HTTP requests to add auth token and handle errors
 *
 * @param req
 * @param next
 */
export const authInterceptor = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Clone the request object
    let newReq = req.clone();

    // Request
    //
    // If the access token didn't expire, add the Authorization header.
    // If the access token expired, try to refresh it first.
    if (authService.accessToken) {
        if (!AuthUtils.isTokenExpired(authService.accessToken)) {
            // Token is valid, add Authorization header
            newReq = req.clone({
                headers: req.headers.set(
                    'Authorization',
                    'Bearer ' + authService.accessToken
                ),
            });
        } else if (authService.refreshToken) {
            // Token expired, try to refresh
            return authService.refreshAccessToken().pipe(
                switchMap((tokenResponse) => {
                    // Retry original request with new token
                    newReq = req.clone({
                        headers: req.headers.set(
                            'Authorization',
                            'Bearer ' + tokenResponse.accessToken
                        ),
                    });
                    return next(newReq);
                }),
                catchError((error) => {
                    // Refresh failed, sign out and redirect
                    if (error instanceof HttpErrorResponse && error.status === 401) {
                        authService.signOut().subscribe(() => {
                            router.navigateByUrl('/sign-in');
                        });
                    }
                    return throwError(() => error);
                })
            );
        }
    }

    // Response
    return next(newReq).pipe(
        catchError((error) => {
            // Catch "401 Unauthorized" responses
            if (error instanceof HttpErrorResponse && error.status === 401) {
                // If we have a refresh token, try to refresh
                if (authService.refreshToken) {
                    return authService.refreshAccessToken().pipe(
                        switchMap((tokenResponse) => {
                            // Retry original request with new token
                            const retryReq = req.clone({
                                headers: req.headers.set(
                                    'Authorization',
                                    'Bearer ' + tokenResponse.accessToken
                                ),
                            });
                            return next(retryReq);
                        }),
                        catchError((refreshError) => {
                            // Refresh failed, sign out
                            authService.signOut().subscribe(() => {
                                router.navigateByUrl('/sign-in');
                            });
                            return throwError(() => refreshError);
                        })
                    );
                } else {
                    // No refresh token, sign out immediately
                    authService.signOut().subscribe(() => {
                        router.navigateByUrl('/sign-in');
                    });
                }
            }

            return throwError(() => error);
        })
    );
};
