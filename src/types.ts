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

export type ExpenditureCategory =
  | 'Infrastructure'
  | 'Equipment'
  | 'Salaries'
  | 'Procurement'
  | 'Operations'
  | 'Training'
  | 'Maintenance'
  | 'Other';

export interface Expenditure {
  _id: string;
  budgetId: string;
  budget?: Budget;
  departmentId: string;
  department?: Department;
  amount: number;
  category: ExpenditureCategory;
  description: string;
  transactionDate: string;
  supportingDocumentUrl?: string;
  supportingDocumentName?: string;
  supportingDocumentSize?: number;
  supportingDocumentType?: string;
  createdBy: string;
  createdAt: string;
}

export type AlertType =
  | 'UNDER_UTILIZATION'
  | 'OVERSPENDING'
  | 'SPENDING_SPIKE'
  | 'THRESHOLD_DEVIATION';

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'OPEN' | 'REVIEWED' | 'RESOLVED';

export interface Alert {
  _id: string;
  departmentId: string;
  department?: Department;
  budgetId: string;
  budget?: Budget;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  currentValue: number;
  thresholdValue: number;
  explanation: string;
  status: AlertStatus;
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

export interface QuarterlyForecastItem {
  quarter: string; // 'Q1', 'Q2', 'Q3', 'Q4'
  projectedSpend: number;
  cumulativeSpend: number;
  utilizationTargetPct: number;
}

export interface BudgetForecastOutput {
  scheme: string;
  department: string;
  financialYear: string;
  allocatedAmount: number;
  currentDisbursed: number;
  currentUtilizationPercentage: number;
  remainingAmount: number;
  elapsedMonths: number;

  projectedYearEndSpend: number;
  projectedUtilizationPercentage: number;
  forecastedStatus: 'ON_TRACK' | 'PROJECTED_SURPLUS' | 'PROJECTED_DEFICIT' | 'SEVERE_BREACH';
  projectedVariance: number; // positive = surplus, negative = deficit
  burnRatePerMonth: number;
  burnRateVelocity: 'ACCELERATING' | 'STEADY' | 'DECELERATING' | 'CRITICAL_SPIKE';
  confidenceScore: number;

  quarterlyBreakdown: QuarterlyForecastItem[];

  executiveForecastSummary: string;
  riskHorizonAnalysis: string;
  strategicRecommendations: string[];
  recommendedAdjustment: string;

  modelUsed: string;
  isAiGenerated: boolean;
  generatedAt: string;
  disclaimer: string;
}

export interface ConsolidatedForecastSummary {
  totalAllocated: number;
  totalDisbursed: number;
  totalProjectedSpend: number;
  projectedUtilizationPercentage: number;
  netVariance: number;
  schemesCount: number;
  statusCounts: {
    onTrack: number;
    surplus: number;
    deficit: number;
    breach: number;
  };
  generatedAt: string;
  modelUsed: string;
}

export interface DataSourceItem {
  sourceName: string;
  sourceDocument: string;
  sourceYear: string;
  sourceUrl: string;
  description: string;
}
