import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User, UserRole } from '../models';
import { environment } from '../../../environments/environment';

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private tokenKey = 'govbudget_jwt_token';
  private userKey = 'govbudget_user_profile';

  constructor(private http: HttpClient, private router: Router) {
    this.loadInitialSession();
  }

  private loadInitialSession(): void {
    const token = localStorage.getItem(this.tokenKey);
    const userJson = localStorage.getItem(this.userKey);
    if (token && userJson) {
      try {
        this.currentUserSubject.next(JSON.parse(userJson));
      } catch (e) {
        this.clearSession();
      }
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  public isAuthenticated(): boolean {
    return !!this.token && !!this.currentUserValue;
  }

  public hasRole(roles: UserRole[]): boolean {
    const user = this.currentUserValue;
    return !!user && roles.includes(user.role);
  }

  login(identifier: string, password: string): Observable<AuthResponse> {
    const payload = { email: identifier, username: identifier, password };
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, payload).pipe(
      tap(res => {
        if (res.success && res.token) {
          localStorage.setItem(this.tokenKey, res.token);
          localStorage.setItem(this.userKey, JSON.stringify(res.user));
          this.currentUserSubject.next(res.user);
          this.redirectBasedOnRole(res.user.role);
        }
      })
    );
  }

  logout(): void {
    this.http.post(`${environment.apiUrl}/auth/logout`, {}).subscribe({
      next: () => this.clearSession(),
      error: () => this.clearSession()
    });
  }

  private clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  public redirectBasedOnRole(role: UserRole): void {
    switch (role) {
      case 'ADMIN':
        this.router.navigate(['/dashboard']);
        break;
      case 'FINANCE_OFFICER':
        this.router.navigate(['/dashboard']);
        break;
      case 'DEPARTMENT_HEAD':
        this.router.navigate(['/dashboard']);
        break;
      default:
        this.router.navigate(['/dashboard']);
    }
  }
}
