import bcrypt from 'bcryptjs';

export type UserRole = 'ADMIN' | 'FINANCE_OFFICER' | 'DEPARTMENT_HEAD';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  username?: string;
  passwordHash: string;
  role: UserRole;
  departmentId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IDepartment {
  _id: string;
  name: string;
  code: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IBudget {
  _id: string;
  financialYear: string;
  departmentId: string;
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
  updatedAt: string;
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

export interface IExpenditure {
  _id: string;
  budgetId: string;
  departmentId: string;
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
  updatedAt: string;
}

export type AlertType =
  | 'UNDER_UTILIZATION'
  | 'OVERSPENDING'
  | 'SPENDING_SPIKE'
  | 'THRESHOLD_DEVIATION';

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AlertStatus = 'OPEN' | 'REVIEWED' | 'RESOLVED';

export interface IAlert {
  _id: string;
  departmentId: string;
  budgetId: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  currentValue: number;
  thresholdValue: number;
  explanation: string;
  status: AlertStatus;
  createdAt: string;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
}

export interface IThreshold {
  _id: string;
  underUtilizationPercentage: number;
  timeElapsedPercentage: number;
  warningUtilizationPercentage: number;
  criticalUtilizationPercentage: number;
  spendingSpikePercentage: number;
  updatedBy: string;
  updatedAt: string;
}

export interface IAuditLog {
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

// In-Memory Collections with full Mongoose-like Query Abstraction
class Store<T extends { _id: string }> {
  private items: Map<string, T> = new Map();

  async find(query?: any): Promise<T[]> {
    const list = Array.from(this.items.values());
    if (!query) return list;
    if (typeof query === 'function') {
      return list.filter(query);
    }
    if (query.$or && Array.isArray(query.$or)) {
      return list.filter(item => {
        return query.$or.some((subQuery: any) => {
          for (const key of Object.keys(subQuery)) {
            if ((item as any)[key] !== subQuery[key]) return false;
          }
          return true;
        });
      });
    }
    return list.filter(item => {
      for (const key of Object.keys(query)) {
        if (query[key] !== undefined && (item as any)[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
  }

  async findById(id: string): Promise<T | null> {
    return this.items.get(id) || null;
  }

  async findOne(query: Partial<T> | ((item: T) => boolean)): Promise<T | null> {
    const results = await this.find(query);
    return results.length > 0 ? results[0] : null;
  }

  async create(data: Omit<T, '_id'> & { _id?: string }): Promise<T> {
    const _id = data._id || 'gen_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    const newItem = { ...data, _id } as T;
    this.items.set(_id, newItem);
    return newItem;
  }

  async findByIdAndUpdate(id: string, update: Partial<T>): Promise<T | null> {
    const existing = this.items.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...update, updatedAt: new Date().toISOString() };
    this.items.set(id, updated);
    return updated;
  }

  async findByIdAndDelete(id: string): Promise<T | null> {
    const existing = this.items.get(id);
    if (!existing) return null;
    this.items.delete(id);
    return existing;
  }

  async countDocuments(query?: Partial<T>): Promise<number> {
    const results = await this.find(query);
    return results.length;
  }

  async deleteMany(query: Partial<T>): Promise<number> {
    const results = await this.find(query);
    results.forEach(item => this.items.delete(item._id));
    return results.length;
  }

  async clear(): Promise<void> {
    this.items.clear();
  }

  seed(items: T[]): void {
    items.forEach(i => this.items.set(i._id, i));
  }
}

export const UserModel = new Store<IUser>();
export const DepartmentModel = new Store<IDepartment>();
export const BudgetModel = new Store<IBudget>();
export const ExpenditureModel = new Store<IExpenditure>();
export const AlertModel = new Store<IAlert>();
export const ThresholdModel = new Store<IThreshold>();
export const AuditLogModel = new Store<IAuditLog>();
