import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models';

export const roleGuard: CanActivateFn = (route, _state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const expectedRoles = route.data?.['roles'] as UserRole[];

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  if (expectedRoles && !authService.hasRole(expectedRoles)) {
    router.navigate(['/unauthorized']);
    return false;
  }

  return true;
};
