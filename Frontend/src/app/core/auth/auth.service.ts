import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { ApiConfig } from 'app/core/config/api.config';
import { User, AuthResponse, ApiResponse } from 'app/core/user/user.types';
import { UserService } from 'app/core/user/user.service';
import { catchError, map, Observable, of, switchMap, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private _authenticated: boolean = false;
    private _http = inject(HttpClient);
    private _apiConfig = inject(ApiConfig);
    private _userService = inject(UserService);
    private _router = inject(Router);

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    }

    /**
     * Setter & getter for refresh token
     */
    set refreshToken(token: string) {
        localStorage.setItem('refreshToken', token);
    }

    get refreshToken(): string {
        return localStorage.getItem('refreshToken') ?? '';
    }

    /**
     * Check if user is authenticated
     */
    get isAuthenticated(): boolean {
        return this._authenticated;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign up
     *
     * @param userData
     */
    signUp(userData: {
        username: string;
        email: string;
        password: string;
        firstname?: string;
        lastname?: string;
        country_code?: string;
        phone_number?: string;
    }): Observable<AuthResponse> {
        return this._http
            .post<ApiResponse<{
                user: User;
                accessToken: string;
                refreshToken: string;
                otp?: string;
            }>>(this._apiConfig.getAuthEndpoint('/signup'), userData)
            .pipe(
                map((response) => {
                    if (response.success && response.data) {
                        // Store tokens
                        this.accessToken = response.data.accessToken;
                        this.refreshToken = response.data.refreshToken;

                        // Transform user data for compatibility
                        const user: User = {
                            ...response.data.user,
                            id: response.data.user.uuid,
                            name:
                                response.data.user.firstname && response.data.user.lastname
                                    ? `${response.data.user.firstname} ${response.data.user.lastname}`
                                    : response.data.user.username || response.data.user.email.split('@')[0],
                        };

                        // Set authenticated flag
                        this._authenticated = true;

                        // Store user in user service
                        this._userService.user = user;

                        return {
                            success: true,
                            message: response.message,
                            data: {
                                user,
                                accessToken: response.data.accessToken,
                                refreshToken: response.data.refreshToken,
                                otp: response.data.otp,
                            },
                        };
                    }
                    throw new Error(response.message || 'Sign up failed');
                }),
                catchError((error: HttpErrorResponse) => {
                    return this._handleError(error, 'Sign up failed');
                })
            );
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { email: string; password: string }): Observable<AuthResponse> {
        // Throw error if user is already logged in
        if (this._authenticated) {
            return throwError(() => 'User is already logged in.');
        }

        return this._http
            .post<ApiResponse<{
                user: User;
                accessToken: string;
                refreshToken: string;
            }>>(this._apiConfig.getAuthEndpoint('/signin'), credentials)
            .pipe(
                map((response) => {
                    if (response.success && response.data) {
                        // Store tokens
                        this.accessToken = response.data.accessToken;
                        this.refreshToken = response.data.refreshToken;

                        // Transform user data
                        const user: User = {
                            ...response.data.user,
                            id: response.data.user.uuid,
                            name:
                                response.data.user.firstname && response.data.user.lastname
                                    ? `${response.data.user.firstname} ${response.data.user.lastname}`
                                    : response.data.user.username || response.data.user.email.split('@')[0],
                        };

                        // Set authenticated flag
                        this._authenticated = true;

                        // Store user in user service
                        this._userService.user = user;

                        return {
                            success: true,
                            message: response.message,
                            data: {
                                user,
                                accessToken: response.data.accessToken,
                                refreshToken: response.data.refreshToken,
                            },
                        };
                    }
                    throw new Error(response.message || 'Sign in failed');
                }),
                catchError((error: HttpErrorResponse) => {
                    return this._handleError(error, 'Invalid email or password');
                })
            );
    }

    /**
     * Sign in using Google
     */
    signInWithGoogle(googleData: {
        google_id: string;
        email: string;
        name?: string;
        firstname?: string;
        lastname?: string;
        picture?: string;
    }): Observable<AuthResponse> {
        return this._http
            .post<ApiResponse<{
                user: User;
                accessToken: string;
                refreshToken: string;
            }>>(this._apiConfig.getAuthEndpoint('/google'), googleData)
            .pipe(
                map((response) => {
                    if (response.success && response.data) {
                        this.accessToken = response.data.accessToken;
                        this.refreshToken = response.data.refreshToken;

                        const user: User = {
                            ...response.data.user,
                            id: response.data.user.uuid,
                            name:
                                response.data.user.firstname && response.data.user.lastname
                                    ? `${response.data.user.firstname} ${response.data.user.lastname}`
                                    : response.data.user.username || response.data.user.email.split('@')[0],
                            avatar: googleData.picture,
                        };

                        this._authenticated = true;
                        this._userService.user = user;

                        return {
                            success: true,
                            message: response.message,
                            data: {
                                user,
                                accessToken: response.data.accessToken,
                                refreshToken: response.data.refreshToken,
                            },
                        };
                    }
                    throw new Error(response.message || 'Google sign in failed');
                }),
                catchError((error: HttpErrorResponse) => {
                    return this._handleError(error, 'Google sign in failed');
                })
            );
    }

    /**
     * Sign in using Meta/Facebook
     */
    signInWithMeta(metaData: {
        meta_id: string;
        email: string;
        name?: string;
        firstname?: string;
        lastname?: string;
        picture?: string;
    }): Observable<AuthResponse> {
        return this._http
            .post<ApiResponse<{
                user: User;
                accessToken: string;
                refreshToken: string;
            }>>(this._apiConfig.getAuthEndpoint('/meta'), metaData)
            .pipe(
                map((response) => {
                    if (response.success && response.data) {
                        this.accessToken = response.data.accessToken;
                        this.refreshToken = response.data.refreshToken;

                        const user: User = {
                            ...response.data.user,
                            id: response.data.user.uuid,
                            name:
                                response.data.user.firstname && response.data.user.lastname
                                    ? `${response.data.user.firstname} ${response.data.user.lastname}`
                                    : response.data.user.username || response.data.user.email.split('@')[0],
                            avatar: metaData.picture,
                        };

                        this._authenticated = true;
                        this._userService.user = user;

                        return {
                            success: true,
                            message: response.message,
                            data: {
                                user,
                                accessToken: response.data.accessToken,
                                refreshToken: response.data.refreshToken,
                            },
                        };
                    }
                    throw new Error(response.message || 'Meta sign in failed');
                }),
                catchError((error: HttpErrorResponse) => {
                    return this._handleError(error, 'Meta sign in failed');
                })
            );
    }

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<ApiResponse<{ resetToken?: string }>> {
        return this._http
            .post<ApiResponse<{ resetToken?: string }>>(
                this._apiConfig.getAuthEndpoint('/forgot-password'),
                { email }
            )
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    return this._handleError(error, 'Failed to send reset email');
                })
            );
    }

    /**
     * Reset password
     *
     * @param resetToken
     * @param newPassword
     */
    resetPassword(resetToken: string, newPassword: string): Observable<ApiResponse> {
        return this._http
            .post<ApiResponse>(
                this._apiConfig.getAuthEndpoint('/reset-password'),
                { resetToken, newPassword }
            )
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    return this._handleError(error, 'Failed to reset password');
                })
            );
    }

    /**
     * Refresh access token
     */
    refreshAccessToken(): Observable<{ accessToken: string }> {
        const refreshToken = this.refreshToken;

        if (!refreshToken) {
            return throwError(() => 'No refresh token available');
        }

        return this._http
            .post<ApiResponse<{ accessToken: string }>>(
                this._apiConfig.getAuthEndpoint('/refresh'),
                { refreshToken }
            )
            .pipe(
                map((response) => {
                    if (response.success && response.data) {
                        this.accessToken = response.data.accessToken;
                        return { accessToken: response.data.accessToken };
                    }
                    throw new Error(response.message || 'Token refresh failed');
                }),
                catchError((error: HttpErrorResponse) => {
                    // If refresh fails, sign out user
                    this.signOut().subscribe();
                    return throwError(() => 'Token refresh failed');
                })
            );
    }

    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<boolean> {
        // If already authenticated, return true
        if (this._authenticated) {
            return of(true);
        }

        // If no token, return false
        if (!this.accessToken) {
            return of(false);
        }

        // Check if token is expired
        if (AuthUtils.isTokenExpired(this.accessToken)) {
            // Try to refresh token
            return this.refreshAccessToken().pipe(
                switchMap(() => {
                    // After refresh, get user profile
                    return this._getUserProfile();
                }),
                catchError(() => {
                    // If refresh fails, return false
                    return of(false);
                })
            );
        }

        // Token is valid, get user profile
        return this._getUserProfile();
    }

    /**
     * Get user profile from API
     */
    private _getUserProfile(): Observable<boolean> {
        return this._userService.get().pipe(
            map(() => {
                this._authenticated = true;
                return true;
            }),
            catchError(() => {
                this._authenticated = false;
                return of(false);
            })
        );
    }

    /**
     * Sign out
     */
    signOut(): Observable<boolean> {
        // Call logout API if token exists
        if (this.accessToken) {
            return this._http
                .post<ApiResponse>(this._apiConfig.getAuthEndpoint('/logout'), {})
                .pipe(
                    map(() => {
                        this._clearAuth();
                        return true;
                    }),
                    catchError(() => {
                        // Even if API call fails, clear local auth
                        this._clearAuth();
                        return of(true);
                    })
                );
        }

        // No token, just clear local auth
        this._clearAuth();
        return of(true);
    }

    /**
     * Clear authentication data
     */
    private _clearAuth(): void {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        this._authenticated = false;
        this._userService.user = {
            email: '',
            name: '',
        };
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: {
        email: string;
        password: string;
    }): Observable<AuthResponse> {
        // Use sign in for unlock session
        return this.signIn(credentials);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean> {
        // If already authenticated, return true
        if (this._authenticated) {
            return of(true);
        }

        // Check if access token exists
        if (!this.accessToken) {
            return of(false);
        }

        // Check if token is expired
        if (AuthUtils.isTokenExpired(this.accessToken)) {
            // Try to refresh
            return this.refreshAccessToken().pipe(
                switchMap(() => this.signInUsingToken()),
                catchError(() => of(false))
            );
        }

        // Token is valid, verify with server
        return this.signInUsingToken();
    }

    /**
     * Handle HTTP errors
     */
    private _handleError(error: HttpErrorResponse, defaultMessage: string): Observable<never> {
        let errorMessage = defaultMessage;

        if (error.error instanceof ErrorEvent) {
            // Client-side error
            errorMessage = error.error.message;
        } else {
            // Server-side error
            if (error.error && error.error.message) {
                errorMessage = error.error.message;
            } else if (error.status === 401) {
                errorMessage = 'Unauthorized. Please sign in again.';
            } else if (error.status === 403) {
                errorMessage = 'Access forbidden.';
            } else if (error.status === 404) {
                errorMessage = 'Resource not found.';
            } else if (error.status >= 500) {
                errorMessage = 'Server error. Please try again later.';
            }
        }

        return throwError(() => errorMessage);
    }
}
