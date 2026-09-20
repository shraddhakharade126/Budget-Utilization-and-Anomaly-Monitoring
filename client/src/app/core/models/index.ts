export type UserRole = 'ADMIN' | 'FINANCE_OFFICER' | 'DEPARTMENT_HEAD';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface Department {
  _id: string;
  name: string;
  code: string;
  description: string;
  isActive: boolean;
}

export interface Budget {
  _id: string;
  financialYear: string;
  departmentId: string;
  department?: Department;
  scheme: string;
  allocatedAmount: number;
  allocationDate: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'EXHAUSTED' | 'EXCEEDED' | 'CLOSED';
  totalSpent?: number;
  remainingAmount?: number;
  utilizationPercentage?: number;
  createdBy: string;
  createdAt: string;
}

export interface Expenditure {
  _id: string;
  budgetId: string;
  budget?: Budget;
  departmentId: string;
  department?: Department;
  amount: number;
  category: string;
  description: string;
  transactionDate: string;
  supportingDocumentUrl?: string;
  supportingDocumentName?: string;
  createdBy: string;
  createdAt: string;
}

export interface Alert {
  _id: string;
  departmentId: string;
  department?: Department;
  budgetId: string;
  budget?: Budget;
  type: 'UNDER_UTILIZATION' | 'OVERSPENDING' | 'SPENDING_SPIKE' | 'THRESHOLD_DEVIATION';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  currentValue: number;
  thresholdValue: number;
  explanation: string;
  status: 'OPEN' | 'REVIEWED' | 'RESOLVED';
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface Threshold {
  _id: string;
  underUtilizationPercentage: number;
  timeElapsedPercentage: number;
  warningUtilizationPercentage: number;
  criticalUtilizationPercentage: number;
  spendingSpikePercentage: number;
  updatedBy: string;
  updatedAt: string;
}

export interface AuditLog {
  _id: string;
  userId: string;
  userName: string;
  userRole?: string;
  action: string;
  entity: string;
  entityId: string;
  oldValue?: any;
  newValue?: any;
  timestamp: string;
  ipAddress?: string;
}

export interface AIInsight {
  riskSummary: string;
  possibleExplanation: string;
  recommendedAction: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  executiveSummary: string;
  disclaimer: string;
  isAiGenerated: boolean;
  modelUsed: string;
}
