import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthData } from './auth-data.model';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private isAuthenticated = false;
    private token: string;
    private authStatusListener = new Subject<boolean>();
    private tokenExpirationTimer: any;
    private userId: string;

    url = 'http://localhost:3000/api/users';

    constructor(private http: HttpClient,
        private router: Router) {}

    createUser(email: string, password: string) {

        const authData: AuthData = {
            email: email,
            password: password
        };

        return this.http.post(this.url + '/signup', authData)
            .subscribe(() => {
                this.router.navigate(['/login']);
            }, error => {
                this.authStatusListener.next(false);
            });

    }

    login(email: string, password: string) {
        const authData: AuthData = {
            email: email,
            password: password
        };

        this.http.post<{ token: string, expiresIn: number, userId: string }>(this.url + '/login', authData)
            .subscribe(res => {
                const token = res.token;
                this.token = token;
                if (token) {
                    const expiresInDuration = res.expiresIn;

                    this.isAuthenticated = true;
                    this.userId = res.userId;
                    this.authStatusListener.next(true);
                    this.setAuthTimer(expiresInDuration * 1000);
                    const now = new Date();
                    const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
                    this.saveAuthData(token, expirationDate, this.userId);
                    this.router.navigate(['/']);
                }
            }, () => {
                this.authStatusListener.next(false);
            });
    }

    autoAuthUser() {

        const authData = this.getAuthData();

        if (!authData) {
            return;
        }

        const now = new Date();
        const expiresIn = authData.expirationDate.getTime() - now.getTime();

        if (expiresIn <= 0) {
            return;
        }

        this.token = authData.token;
        this.isAuthenticated = true;
        this.userId = authData.userId;
        this.setAuthTimer(expiresIn);
        this.authStatusListener.next(true);
    }

    logout() {
        clearTimeout(this.tokenExpirationTimer);
        this.token = null;
        this.isAuthenticated = false;
        this.userId = null;
        this.authStatusListener.next(false);
        this.clearAuthData();
        this.router.navigate(['/']);
    }

    private setAuthTimer(duration: number) {
        this.tokenExpirationTimer = setTimeout(() => {
            this.logout();
        }, duration );
    }

    getToken() {
        return this.token;
    }

    getIsAuth() {
        return this.isAuthenticated;
    }

    getAuthStatusListener() {
        return this.authStatusListener.asObservable();
    }

    getUserId() {
        return this.userId;
    }

    private saveAuthData(token: string, expirationDate: Date, userId: string) { 
        localStorage.setItem('token', token);
        localStorage.setItem('expiration', expirationDate.toISOString());
        localStorage.setItem('userId', userId);
    }

    private clearAuthData() {
        localStorage.removeItem('token');
        localStorage.removeItem('expiration');
        localStorage.removeItem('userId');
    }

    private getAuthData() {
        const token = localStorage.getItem('token');
        const expirationDate = localStorage.getItem('expiration');
        const userId = localStorage.getItem('userId');
        if (!token || !expirationDate) {
            return;
        }

        return {
            token: token,
            expirationDate: new Date(expirationDate),
            userId: userId
        };
    }
}