import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Budget, Expenditure, Alert, Department, Threshold, AuditLog, AIInsight } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private base = `${environment.apiUrl}/budgets`;

  constructor(private http: HttpClient) {}

  getBudgets(departmentId?: string, financialYear?: string): Observable<{ success: boolean; budgets: Budget[] }> {
    let params = new HttpParams();
    if (departmentId) params = params.set('departmentId', departmentId);
    if (financialYear) params = params.set('financialYear', financialYear);
    return this.http.get<{ success: boolean; budgets: Budget[] }>(this.base, { params });
  }

  getBudgetById(id: string): Observable<{ success: boolean; budget: Budget }> {
    return this.http.get<{ success: boolean; budget: Budget }>(`${this.base}/${id}`);
  }

  createBudget(budget: Partial<Budget>): Observable<{ success: boolean; budget: Budget }> {
    return this.http.post<{ success: boolean; budget: Budget }>(this.base, budget);
  }

  updateBudget(id: string, budget: Partial<Budget>): Observable<{ success: boolean; budget: Budget }> {
    return this.http.put<{ success: boolean; budget: Budget }>(`${this.base}/${id}`, budget);
  }

  deleteBudget(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.base}/${id}`);
  }
}

@Injectable({
  providedIn: 'root'
})
export class ExpenditureService {
  private base = `${environment.apiUrl}/expenditures`;

  constructor(private http: HttpClient) {}

  getExpenditures(filters?: { departmentId?: string; budgetId?: string; category?: string }): Observable<{ success: boolean; expenditures: Expenditure[] }> {
    let params = new HttpParams();
    if (filters?.departmentId) params = params.set('departmentId', filters.departmentId);
    if (filters?.budgetId) params = params.set('budgetId', filters.budgetId);
    if (filters?.category) params = params.set('category', filters.category);
    return this.http.get<{ success: boolean; expenditures: Expenditure[] }>(this.base, { params });
  }

  createExpenditure(formData: FormData): Observable<{ success: boolean; expenditure: Expenditure; updatedBudget: Budget; newAlerts: Alert[] }> {
    return this.http.post<{ success: boolean; expenditure: Expenditure; updatedBudget: Budget; newAlerts: Alert[] }>(this.base, formData);
  }

  deleteExpenditure(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.base}/${id}`);
  }
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private base = `${environment.apiUrl}/alerts`;

  constructor(private http: HttpClient) {}

  getAlerts(filters?: { severity?: string; type?: string; status?: string; departmentId?: string }): Observable<{ success: boolean; alerts: Alert[] }> {
    let params = new HttpParams();
    if (filters?.severity) params = params.set('severity', filters.severity);
    if (filters?.type) params = params.set('type', filters.type);
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.departmentId) params = params.set('departmentId', filters.departmentId);
    return this.http.get<{ success: boolean; alerts: Alert[] }>(this.base, { params });
  }

  reviewAlert(id: string): Observable<{ success: boolean; alert: Alert }> {
    return this.http.patch<{ success: boolean; alert: Alert }>(`${this.base}/${id}/review`, {});
  }

  resolveAlert(id: string): Observable<{ success: boolean; alert: Alert }> {
    return this.http.patch<{ success: boolean; alert: Alert }>(`${this.base}/${id}/resolve`, {});
  }

  scanAnomalies(): Observable<{ success: boolean; scannedBudgets: number; totalNewAlerts: number }> {
    return this.http.post<{ success: boolean; scannedBudgets: number; totalNewAlerts: number }>(`${environment.apiUrl}/anomalies/scan`, {});
  }
}
