import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'budgets',
    canActivate: [authGuard],
    loadComponent: () => import('./features/budgets/budget-list.component').then(m => m.BudgetListComponent)
  },
  {
    path: 'expenditures',
    canActivate: [authGuard],
    loadComponent: () => import('./features/expenditures/expenditure-list.component').then(m => m.ExpenditureListComponent)
  },
  {
    path: 'anomalies',
    canActivate: [authGuard],
    loadComponent: () => import('./features/anomalies/anomaly-monitor.component').then(m => m.AnomalyMonitorComponent)
  },
  {
    path: 'alerts',
    canActivate: [authGuard],
    loadComponent: () => import('./features/alerts/alert-management.component').then(m => m.AlertManagementComponent)
  },
  {
    path: 'ai-insights',
    canActivate: [authGuard],
    loadComponent: () => import('./features/ai-insights/ai-insights.component').then(m => m.AiInsightsComponent)
  },
  {
    path: 'analytics',
    canActivate: [authGuard],
    loadComponent: () => import('./features/analytics/analytics-reports.component').then(m => m.AnalyticsReportsComponent)
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () => import('./features/admin/admin-panel.component').then(m => m.AdminPanelComponent)
  },
  {
    path: 'data-sources',
    loadComponent: () => import('./features/sources/data-sources.component').then(m => m.DataSourcesComponent)
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./features/errors/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./features/errors/not-found.component').then(m => m.NotFoundComponent)
  }
];
