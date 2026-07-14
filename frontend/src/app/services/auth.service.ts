import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap, delay } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      if (token && savedUser) {
        this.currentUserSubject.next(JSON.parse(savedUser));
      }
    }
  }

  sendOtp(phone: string): Observable<any> {
    return of({ message: 'OTP sent', mockOtp: '123456' }).pipe(delay(500));
  }

  verifyOtp(phone: string, otp: string): Observable<any> {
    if (otp !== '123456') {
      throw new Error('Invalid OTP');
    }

    const mockUser = {
      id: 'u_' + Date.now(),
      phone: phone,
      points: 0,
      createdAt: new Date().toISOString()
    };

    return of({ token: 'mock-jwt-token', user: mockUser }).pipe(
      delay(500),
      tap(res => {
        if (typeof window !== 'undefined') {
          // Keep existing points if user is already "registered" in local storage
          const existingStr = localStorage.getItem('user');
          if (existingStr) {
            const existing = JSON.parse(existingStr);
            if (existing.phone === phone) {
              res.user.points = existing.points;
              res.user.createdAt = existing.createdAt;
            }
          }
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));
        }
        this.currentUserSubject.next(res.user);
      })
    );
  }

  getProfile(): Observable<any> {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      if (user) return of(JSON.parse(user)).pipe(delay(200));
    }
    throw new Error('Unauthorized');
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    this.currentUserSubject.next(null);
  }

  get isLoggedIn() {
    return !!this.currentUserSubject.value;
  }
}
