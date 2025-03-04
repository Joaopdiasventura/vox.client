import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { isPlatformServer } from '@angular/common';
import { Observable, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { UserService } from '../services/user.service';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private platformId = inject(PLATFORM_ID);
  private userService = inject(UserService);
  private router = inject(Router);

  public canActivate(): boolean | Observable<boolean> {
    if (isPlatformServer(this.platformId)) return true;
    const user = this.userService.getCurrentData();
    if (user) return true;
    return this.connectUser();
  }

  private connectUser(): boolean | Observable<boolean> {
    if (!localStorage) return true;
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['access']);
      return of(true);
    }
    return this.userService.decodeToken(token).pipe(
      tap((user: User) => this.userService.updateData(user)),
      map(() => true),
      catchError(() => {
        this.router.navigate(['access']);
        return of(true);
      })
    );
  }
}
