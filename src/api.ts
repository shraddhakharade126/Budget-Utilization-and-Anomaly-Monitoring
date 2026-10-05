import {
  User,
  Department,
  Budget,
  Expenditure,
  Alert,
  Threshold,
  AuditLog,
  AIInsight,
  BudgetForecastOutput,
  ConsolidatedForecastSummary,
  DataSourceItem,
  MonthlyAnalyticsResponse
} from './types';

const TOKEN_KEY = 'govbudget_token';
const USER_KEY = 'govbudget_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  const json = localStorage.getItem(USER_KEY);
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function storeSession(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // If body is NOT FormData, set application/json
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  if (response.status === 401) {
    clearSession();
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const res = await request<{ success: boolean; token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res.success && res.token && res.user) {
      storeSession(res.token, res.user);
    }
    return res;
  },

  register: async (payload: {
    name: string;
    email: string;
    password: string;
    role: string;
    departmentId?: string | null;
  }) => {
    const res = await request<{ success: boolean; token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (res.success && res.token && res.user) {
      storeSession(res.token, res.user);
    }
    return res;
  },

  logout: async () => {
    try {
      await request<{ success: boolean; message: string }>('/api/auth/logout', {
        method: 'POST'
      });
    } catch {
      // ignore logout network errors
    } finally {
      clearSession();
    }
    return { success: true, message: 'Logged out' };
  },

  getMe: () =>
    request<{ success: boolean; user: User }>('/api/auth/me'),

  // Analytics & Overview
  getOverview: () =>
    request<{
      success: boolean;
      data: {
        totalAllocated: number;
        totalExpenditure: number;
        remainingBudget: number;
        overallUtilization: number;
        totalDepartments: number;
        totalBudgets: number;
        activeAlertsCount: number;
        criticalAlertsCount: number;
        underUtilizedCount: number;
        pendingApprovalsCount?: number;
        databaseType: string;
      };
    }>('/api/analytics/overview'),

  getDepartmentAnalytics: () =>
    request<{
      success: boolean;
      departments: {
        departmentId: string;
        name: string;
        code: string;
        allocated: number;
        spent: number;
        remaining: number;
        utilization: number;
        budgetCount: number;
      }[];
    }>('/api/analytics/departments'),

  getMonthlyAnalytics: () =>
    request<MonthlyAnalyticsResponse>('/api/analytics/monthly'),

  getAlertAnalytics: () =>
    request<{
      success: boolean;
      byType: Record<string, number>;
      bySeverity: Record<string, number>;
      total: number;
      unreviewedCount: number;
    }>('/api/analytics/alerts'),

  // Departments
  getDepartments: () =>
    request<{ success: boolean; departments: Department[] }>('/api/departments'),

  createDepartment: (dept: Partial<Department>) =>
    request<{ success: boolean; department: Department }>('/api/departments', {
      method: 'POST',
      body: JSON.stringify(dept)
    }),

  updateDepartment: (id: string, dept: Partial<Department>) =>
    request<{ success: boolean; department: Department }>(`/api/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dept)
    }),

  // Budgets
  getBudgets: (departmentId?: string, financialYear?: string) => {
    const q = new URLSearchParams();
    if (departmentId) q.set('departmentId', departmentId);
    if (financialYear) q.set('financialYear', financialYear);
    return request<{ success: boolean; budgets: Budget[] }>(`/api/budgets?${q.toString()}`);
  },

  getBudgetById: (id: string) =>
    request<{ success: boolean; budget: Budget }>(`/api/budgets/${id}`),

  createBudget: (budget: Partial<Budget>) =>
    request<{ success: boolean; budget: Budget }>('/api/budgets', {
      method: 'POST',
      body: JSON.stringify(budget)
    }),

  updateBudget: (id: string, budget: Partial<Budget>) =>
    request<{ success: boolean; budget: Budget }>(`/api/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(budget)
    }),

  deleteBudget: (id: string) =>
    request<{ success: boolean; message: string }>(`/api/budgets/${id}`, {
      method: 'DELETE'
    }),

  // Expenditures
  getExpenditures: (filters?: { departmentId?: string; budgetId?: string; category?: string }) => {
    const q = new URLSearchParams();
    if (filters?.departmentId) q.set('departmentId', filters.departmentId);
    if (filters?.budgetId) q.set('budgetId', filters.budgetId);
    if (filters?.category) q.set('category', filters.category);
    return request<{ success: boolean; expenditures: Expenditure[] }>(`/api/expenditures?${q.toString()}`);
  },

  createExpenditure: (formData: FormData) =>
    request<{
      success: boolean;
      expenditure: Expenditure;
      updatedBudget: Budget;
      newAlerts: Alert[];
    }>('/api/expenditures', {
      method: 'POST',
      body: formData
    }),

  deleteExpenditure: (id: string) =>
    request<{ success: boolean; message: string }>(`/api/expenditures/${id}`, {
      method: 'DELETE'
    }),

  // Alerts
  getAlerts: (filters?: { severity?: string; type?: string; status?: string; departmentId?: string }) => {
    const q = new URLSearchParams();
    if (filters?.severity) q.set('severity', filters.severity);
    if (filters?.type) q.set('type', filters.type);
    if (filters?.status) q.set('status', filters.status);
    if (filters?.departmentId) q.set('departmentId', filters.departmentId);
    return request<{ success: boolean; alerts: Alert[] }>(`/api/alerts?${q.toString()}`);
  },

  reviewAlert: (id: string) =>
    request<{ success: boolean; alert: Alert }>(`/api/alerts/${id}/review`, {
      method: 'PATCH'
    }),

  resolveAlert: (id: string) =>
    request<{ success: boolean; alert: Alert }>(`/api/alerts/${id}/resolve`, {
      method: 'PATCH'
    }),

  scanAnomalies: () =>
    request<{ success: boolean; message: string; scannedBudgets: number; totalNewAlerts: number }>(
      '/api/anomalies/scan',
      { method: 'POST' }
    ),

  // AI
  getAIInsights: (budgetId?: string, anomalyType?: string) =>
    request<{ success: boolean; insight: AIInsight; budget: Budget; department: Department }>(
      '/api/ai/insights',
      {
        method: 'POST',
        body: JSON.stringify({ budgetId, anomalyType })
      }
    ),

  getAIBudgetForecast: (budgetId?: string) =>
    request<{ success: boolean; forecast: BudgetForecastOutput; budget: Budget; department: Department }>(
      '/api/ai/forecast',
      {
        method: 'POST',
        body: JSON.stringify({ budgetId })
      }
    ),

  getConsolidatedAIBudgetForecast: () =>
    request<{
      success: boolean;
      consolidated: ConsolidatedForecastSummary;
      forecasts: BudgetForecastOutput[];
    }>('/api/ai/forecast/consolidated'),

  generateImage: (prompt: string, size: '1K' | '2K' | '4K') =>
    request<{ success: boolean; imageUrl: string; size: string; model: string }>('/api/ai/generate-image', {
      method: 'POST',
      body: JSON.stringify({ prompt, size })
    }),

  generateVideo: (image: string, prompt?: string, aspectRatio?: '16:9' | '9:16') =>
    request<{ success: boolean; operationName: string; model: string; aspectRatio: string }>(
      '/api/ai/generate-video',
      {
        method: 'POST',
        body: JSON.stringify({ image, prompt, aspectRatio })
      }
    ),

  // Admin: Users
  getUsers: () =>
    request<{ success: boolean; users: User[] }>('/api/users'),

  createUser: (userData: any) =>
    request<{ success: boolean; user: User }>('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),

  updateUser: (id: string, userData: any) =>
    request<{ success: boolean; user: User }>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    }),

  setUserStatus: (id: string, isActive: boolean) =>
    request<{ success: boolean; user: User }>(`/api/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive })
    }),

  // Admin: Thresholds
  getThresholds: () =>
    request<{ success: boolean; threshold: Threshold }>('/api/thresholds'),

  updateThresholds: (threshold: Partial<Threshold>) =>
    request<{ success: boolean; threshold: Threshold }>('/api/thresholds', {
      method: 'PUT',
      body: JSON.stringify(threshold)
    }),

  // Admin: Audit Logs
  getAuditLogs: () =>
    request<{ success: boolean; logs: AuditLog[] }>('/api/audit-logs'),

  // Data Sources
  getDataSources: () =>
    request<{ success: boolean; sources: DataSourceItem[]; disclaimer: string }>('/api/data-sources'),

  // Real-time synchronization
  syncLedger: () =>
    request<{ success: boolean; message: string; timestamp: string; newAlertsCount: number }>('/api/analytics/sync', {
      method: 'POST'
    }),

  // Baseline maintenance
  resetBaseline: () =>
    request<{ success: boolean; message: string }>('/api/seed/reset', {
      method: 'POST'
    }),
  resetDemoData: () =>
    request<{ success: boolean; message: string }>('/api/seed/reset', {
      method: 'POST'
    }),
  resetDemo: () =>
    request<{ success: boolean; message: string }>('/api/seed/reset', {
      method: 'POST'
    }),

  // Session storage helpers
  getStoredUser,
  getStoredToken,
  storeSession,
  clearSession
};
