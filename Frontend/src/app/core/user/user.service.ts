import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiConfig } from 'app/core/config/api.config';
import { User, ApiResponse } from 'app/core/user/user.types';
import { catchError, map, Observable, of, ReplaySubject, tap, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
    private _http = inject(HttpClient);
    private _apiConfig = inject(ApiConfig);
    private _user: ReplaySubject<User> = new ReplaySubject<User>(1);

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for user
     *
     * @param value
     */
    set user(value: User) {
        // Store the value
        this._user.next(value);
    }

    get user$(): Observable<User> {
        return this._user.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the current signed-in user data from API
     */
    get(): Observable<User> {
        return this._http
            .get<ApiResponse<User>>(this._apiConfig.getAuthEndpoint('/profile'))
            .pipe(
                map((response) => {
                    if (response.success && response.data) {
                        // Transform user data for compatibility
                        const user: User = {
                            ...response.data,
                            id: response.data.uuid || response.data.id,
                            name:
                                response.data.firstname && response.data.lastname
                                    ? `${response.data.firstname} ${response.data.lastname}`
                                    : response.data.username || response.data.name || response.data.email.split('@')[0],
                        };
                        this._user.next(user);
                        return user;
                    }
                    throw new Error(response.message || 'Failed to get user profile');
                }),
                catchError((error: HttpErrorResponse) => {
                    // If error, return a default user
                    const defaultUser: User = {
                        email: '',
                        name: '',
                    };
                    this._user.next(defaultUser);
                    return throwError(() => error);
                })
            );
    }

    /**
     * Update the user
     *
     * @param user
     */
    update(user: User): Observable<User> {
        return this._http
            .put<ApiResponse<User>>(this._apiConfig.getAuthEndpoint('/profile'), user)
            .pipe(
                map((response) => {
                    if (response.success && response.data) {
                        const updatedUser: User = {
                            ...response.data,
                            id: response.data.uuid || response.data.id,
                            name:
                                response.data.firstname && response.data.lastname
                                    ? `${response.data.firstname} ${response.data.lastname}`
                                    : response.data.username || response.data.name || response.data.email.split('@')[0],
                        };
                        this._user.next(updatedUser);
                        return updatedUser;
                    }
                    throw new Error(response.message || 'Failed to update user');
                }),
                catchError((error: HttpErrorResponse) => {
                    return throwError(() => error);
                })
            );
    }
}
