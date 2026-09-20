import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-6 space-y-6 bg-slate-950 min-h-screen text-slate-100">
      <!-- Top Title & Role Indicator -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span class="text-blue-500">🏛️</span> Financial Governance Dashboard
          </h1>
          <p class="text-sm text-slate-400 mt-0.5">
            FY 2025-26 &bull; Scope:
            <span class="font-semibold text-slate-200">
              {{ currentUser?.role === 'ADMIN' ? 'Global Treasury (All Departments)' : 'Departmental Authorization Unit' }}
            </span>
          </p>
        </div>
        <div class="flex items-center gap-3">
          <span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-900/50 text-blue-300 border border-blue-700/50">
            Role: {{ currentUser?.role }}
          </span>
          <span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            Engine: Deterministic + Gemini 3.8
          </span>
        </div>
      </div>

      <!-- KPI Metric Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- 1. Total Allocated -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Allocated</span>
            <span class="p-2 bg-blue-500/10 text-blue-400 rounded-lg text-lg">💰</span>
          </div>
          <div class="mt-3">
            <h3 class="text-2xl font-bold text-white tracking-tight">₹{{ formatLakhCrore(stats?.totalAllocated || 0) }}</h3>
            <p class="text-xs text-slate-400 mt-1">Approved budget allocation</p>
          </div>
        </div>

        <!-- 2. Total Expenditure -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Expenditure</span>
            <span class="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg text-lg">📊</span>
          </div>
          <div class="mt-3">
            <h3 class="text-2xl font-bold text-indigo-300 tracking-tight">₹{{ formatLakhCrore(stats?.totalExpenditure || 0) }}</h3>
            <p class="text-xs text-slate-400 mt-1">Actual disbursed vouchers</p>
          </div>
        </div>

        <!-- 3. Remaining Balance -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Remaining Balance</span>
            <span class="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg text-lg">💼</span>
          </div>
          <div class="mt-3">
            <h3 class="text-2xl font-bold text-emerald-400 tracking-tight">₹{{ formatLakhCrore(stats?.remainingBudget || 0) }}</h3>
            <p class="text-xs text-slate-400 mt-1">Uncommitted treasury funds</p>
          </div>
        </div>

        <!-- 4. Overall Utilization Rate -->
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Overall Utilization</span>
            <span class="p-2 bg-amber-500/10 text-amber-400 rounded-lg text-lg">⚡</span>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <h3 class="text-2xl font-bold text-amber-400 tracking-tight">{{ stats?.overallUtilization || 0 }}%</h3>
            <span class="text-xs text-slate-400">of allocation</span>
          </div>
          <div class="w-full bg-slate-800 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div
              class="h-1.5 rounded-full transition-all duration-500"
              [ngClass]="{
                'bg-emerald-500': (stats?.overallUtilization || 0) <= 85,
                'bg-amber-500': (stats?.overallUtilization || 0) > 85 && (stats?.overallUtilization || 0) <= 100,
                'bg-red-500': (stats?.overallUtilization || 0) > 100
              }"
              [style.width.%]="Math.min(stats?.overallUtilization || 0, 100)"
            ></div>
          </div>
        </div>
      </div>

      <!-- Anomaly Alert Summary Banner -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-400">Active Governance Alerts</p>
            <h4 class="text-xl font-bold text-white mt-1">{{ stats?.activeAlertsCount || 0 }}</h4>
          </div>
          <a routerLink="/alerts" class="text-xs text-blue-400 hover:text-blue-300 font-medium">Review Alerts &rarr;</a>
        </div>

        <div class="bg-slate-900 border border-red-900/40 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p class="text-xs text-red-400">Critical Overspending Alerts</p>
            <h4 class="text-xl font-bold text-red-300 mt-1">{{ stats?.criticalAlertsCount || 0 }}</h4>
          </div>
          <span class="text-xs px-2 py-0.5 rounded bg-red-900/60 text-red-200 border border-red-700">Immediate Action</span>
        </div>

        <div class="bg-slate-900 border border-amber-900/40 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p class="text-xs text-amber-400">Under-Utilized Schemes</p>
            <h4 class="text-xl font-bold text-amber-300 mt-1">{{ stats?.underUtilizedCount || 0 }}</h4>
          </div>
          <span class="text-xs px-2 py-0.5 rounded bg-amber-900/60 text-amber-200 border border-amber-700">Lapse Warning</span>
        </div>
      </div>

      <!-- Department-wise Utilization Breakdown -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-base font-bold text-white">Departmental Allocation &amp; Utilization</h2>
            <p class="text-xs text-slate-400">Real-time expenditure reconciliation against approved demand for grants</p>
          </div>
          <a routerLink="/analytics" class="text-xs text-blue-400 hover:underline">Full Analytics &rarr;</a>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-slate-800/60 text-slate-400 uppercase text-[11px] tracking-wider">
              <tr>
                <th class="p-3">Department</th>
                <th class="p-3">Code</th>
                <th class="p-3 text-right">Allocated</th>
                <th class="p-3 text-right">Disbursed</th>
                <th class="p-3 text-right">Remaining</th>
                <th class="p-3 text-center">Utilization</th>
                <th class="p-3">Status Risk</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800">
              <tr *ngFor="let dept of departments" class="hover:bg-slate-800/30 transition">
                <td class="p-3 font-medium text-white">{{ dept.name }}</td>
                <td class="p-3 text-slate-400">{{ dept.code }}</td>
                <td class="p-3 text-right font-mono">₹{{ formatLakhCrore(dept.allocated) }}</td>
                <td class="p-3 text-right font-mono text-indigo-300">₹{{ formatLakhCrore(dept.spent) }}</td>
                <td class="p-3 text-right font-mono" [ngClass]="dept.remaining < 0 ? 'text-red-400 font-bold' : 'text-emerald-400'">
                  ₹{{ formatLakhCrore(dept.remaining) }}
                </td>
                <td class="p-3 text-center">
                  <span class="font-semibold font-mono" [ngClass]="getUtilizationColor(dept.utilization)">
                    {{ dept.utilization }}%
                  </span>
                </td>
                <td class="p-3">
                  <span
                    class="px-2 py-0.5 text-[10px] font-semibold rounded-full"
                    [ngClass]="getRiskBadgeClass(dept.utilization)"
                  >
                    {{ getRiskBadgeLabel(dept.utilization) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  currentUser: any;
  stats: any;
  departments: any[] = [];
  Math = Math;

  constructor(private authService: AuthService, private http: HttpClient) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.loadData();
  }

  loadData() {
    this.http.get<{ success: boolean; data: any }>(`${environment.apiUrl}/analytics/overview`).subscribe({
      next: (res) => { if (res.success) this.stats = res.data; }
    });

    this.http.get<{ success: boolean; departments: any[] }>(`${environment.apiUrl}/analytics/departments`).subscribe({
      next: (res) => { if (res.success) this.departments = res.departments; }
    });
  }

  formatLakhCrore(amount: number): string {
    if (Math.abs(amount) >= 10000000) {
      return (amount / 10000000).toFixed(2) + ' Cr';
    } else if (Math.abs(amount) >= 100000) {
      return (amount / 100000).toFixed(2) + ' L';
    }
    return amount.toLocaleString('en-IN');
  }

  getUtilizationColor(util: number): string {
    if (util > 100) return 'text-red-400';
    if (util > 85) return 'text-amber-400';
    if (util < 35) return 'text-sky-400';
    return 'text-emerald-400';
  }

  getRiskBadgeClass(util: number): string {
    if (util > 100) return 'bg-red-900/60 text-red-200 border border-red-700';
    if (util > 85) return 'bg-amber-900/60 text-amber-200 border border-amber-700';
    if (util < 35) return 'bg-sky-900/60 text-sky-200 border border-sky-700';
    return 'bg-emerald-900/60 text-emerald-200 border border-emerald-700';
  }

  getRiskBadgeLabel(util: number): string {
    if (util > 100) return 'Overspending';
    if (util > 85) return 'High Utilization';
    if (util < 35) return 'Under-Utilized';
    return 'Normal Pace';
  }
}
