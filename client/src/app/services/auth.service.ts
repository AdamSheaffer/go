import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { tokenNotExpired } from 'angular2-jwt';
import 'rxjs/add/operator/map';

@Injectable()
export class AuthService {

    domain = "http://localhost:8080";
    redirectUrl: String;
    authToken: String;
    user: any;

    constructor(private http: Http) { }

    createAuthenticationHeaders<RequestOptions>() {
        this.loadToken();
        return new RequestOptions({
            headers: new Headers({
                'Content-Type': 'application/json',
                authorization: this.authToken
            })
        });
    }

    loadToken() {
        this.authToken = localStorage.getItem('token');
    }

    loadUser() {
        this.user = JSON.parse(localStorage.getItem('user'));
    }

    registerUser(user) {
        return this.http.post(`${this.domain}/auth/register`, user).toPromise();
    }

    login(user) {
        return this.http.post(`${this.domain}/auth/login`, user).toPromise();
    }

    logout() {
        this.authToken = null;
        this.user = null;
        localStorage.clear();
    }

    isLoggedIn() {
        return tokenNotExpired();
    }

    storeUserData(token, user) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        this.authToken = token;
        this.user = user;
    }
}