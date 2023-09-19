import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, retry, switchMap, tap } from 'rxjs/operators';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { environment } from 'environments/environment';

@Injectable()
export class AuthService {
    private _authenticated: boolean = false;
    private _userDetail: BehaviorSubject<any[] | null> = new BehaviorSubject<any[]>(null);

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _userService: UserService
    ) {
    }

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

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any> {
        return this._httpClient.post('api/auth/forgot-password', email);
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string): Observable<any> {
        return this._httpClient.post('api/auth/reset-password', password);
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { email: string; password: string }): Observable<any> {
        // Throw error, if the user is already logged in
        if (this._authenticated) {
            return throwError('User is already logged in.');
        }

        return this._httpClient.post(environment.signInAuth, credentials)
            .pipe(
                switchMap((response: any) => {
                    const payload = {
                        accessToken: response["idToken"],
                        tokenType: 'bearer',
                        user: {
                            avatar: response["avatar"] || null,
                            email: response["email"],
                            id: response["localId"],
                            name: response["displayName"],
                            status: "online"
                        }
                    };

                    // Store the access token in the local storage
                    this.accessToken = payload.accessToken;
                    // Set the authenticated flag to true
                    this._authenticated = true;

                    // Store the user on the user service
                    this._userService.user = payload.user;

                    // Return a new observable with the response
                    return of(payload);
                })
            );
    }

    /**
     * Sign in using the access token
     */

    parseJwt(token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    };

    signInUsingToken(): Observable<any> {
        const user = {
            avatar: this.parseJwt(this.accessToken)["avatar"] || null,
            email: this.parseJwt(this.accessToken)["email"],
            id: this.parseJwt(this.accessToken)["user_id"],
            name: this.parseJwt(this.accessToken)["display_name"]
        }
        this.accessToken = this.accessToken;
        this._userService.user = user;
        this._authenticated = true;
        return of(true);
    }
    get user$(): Observable<any[]> {
        return this._userDetail.asObservable();
    };
    getUserInfo(): Observable<any[]> {
        let params = {
            info: true
        }
        return this._httpClient.get<any[]>(environment.userUrl, {
            params: params
        }).pipe(retry(3), tap((response: any) => {
            this._userDetail.next(response);
        }));
    }
    /**
     * Sign out
     */
    signOut(): Observable<any> {
        // Remove the access token from the local storage
        localStorage.removeItem('accessToken');

        // Set the authenticated flag to false
        this._authenticated = false;

        // Return the observable
        return of(true);
    }

    /**
     * Sign up
     *
     * @param user
     */
    signUp(user: { name: string; email: string; password: string; company: string }): Observable<any> {
        return this._httpClient.post('api/auth/sign-up', user);
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: { email: string; password: string }): Observable<any> {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean> {
        // Check if the user is logged in
        if (this._authenticated) {
            return of(true);
        }

        // Check the access token availability
        if (!this.accessToken) {
            return of(false);
        }

        // Check the access token expire date
        if (AuthUtils.isTokenExpired(this.accessToken)) {
            return of(false);
        }

        // If the access token exists and it didn't expire, sign in using it
        return this.signInUsingToken();
    }
}
