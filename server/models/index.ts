import mongoose, { Model as MongooseModelType, Schema } from 'mongoose';

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

/* =========================================================================
   MONGOOSE SCHEMAS (Persisted in MongoDB Atlas)
   ========================================================================= */

const userSchema = new Schema<IUser>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    username: { type: String },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true },
    departmentId: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() }
  },
  { _id: false, versionKey: false }
);

const departmentSchema = new Schema<IDepartment>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() }
  },
  { _id: false, versionKey: false }
);

const budgetSchema = new Schema<IBudget>(
  {
    _id: { type: String, required: true },
    financialYear: { type: String, required: true },
    departmentId: { type: String, required: true },
    scheme: { type: String, required: true },
    allocatedAmount: { type: Number, required: true },
    allocationDate: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    status: { type: String, default: 'ACTIVE' },
    totalSpent: { type: Number, default: 0 },
    remainingAmount: { type: Number, default: 0 },
    utilizationPercentage: { type: Number, default: 0 },
    createdBy: { type: String, default: 'SYSTEM' },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() }
  },
  { _id: false, versionKey: false }
);

const expenditureSchema = new Schema<IExpenditure>(
  {
    _id: { type: String, required: true },
    budgetId: { type: String, required: true },
    departmentId: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    description: { type: String, default: '' },
    transactionDate: { type: String, required: true },
    supportingDocumentUrl: { type: String },
    supportingDocumentName: { type: String },
    supportingDocumentSize: { type: Number },
    supportingDocumentType: { type: String },
    createdBy: { type: String, default: 'SYSTEM' },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() }
  },
  { _id: false, versionKey: false }
);

const alertSchema = new Schema<IAlert>(
  {
    _id: { type: String, required: true },
    departmentId: { type: String, required: true },
    budgetId: { type: String, required: true },
    type: { type: String, required: true },
    severity: { type: String, required: true },
    message: { type: String, required: true },
    currentValue: { type: Number, default: 0 },
    thresholdValue: { type: Number, default: 0 },
    explanation: { type: String, default: '' },
    status: { type: String, default: 'OPEN' },
    createdAt: { type: String, default: () => new Date().toISOString() },
    reviewedBy: { type: String, default: null },
    reviewedAt: { type: String, default: null }
  },
  { _id: false, versionKey: false }
);

const thresholdSchema = new Schema<IThreshold>(
  {
    _id: { type: String, required: true },
    underUtilizationPercentage: { type: Number, default: 40 },
    timeElapsedPercentage: { type: Number, default: 50 },
    warningUtilizationPercentage: { type: Number, default: 85 },
    criticalUtilizationPercentage: { type: Number, default: 100 },
    spendingSpikePercentage: { type: Number, default: 25 },
    updatedBy: { type: String, default: 'SYSTEM' },
    updatedAt: { type: String, default: () => new Date().toISOString() }
  },
  { _id: false, versionKey: false }
);

const auditLogSchema = new Schema<IAuditLog>(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userRole: { type: String },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: String, required: true },
    oldValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed },
    timestamp: { type: String, default: () => new Date().toISOString() },
    ipAddress: { type: String }
  },
  { _id: false, versionKey: false }
);

// Mongoose Models
export const MongoUserModel = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
export const MongoDepartmentModel = mongoose.models.Department || mongoose.model<IDepartment>('Department', departmentSchema);
export const MongoBudgetModel = mongoose.models.Budget || mongoose.model<IBudget>('Budget', budgetSchema);
export const MongoExpenditureModel = mongoose.models.Expenditure || mongoose.model<IExpenditure>('Expenditure', expenditureSchema);
export const MongoAlertModel = mongoose.models.Alert || mongoose.model<IAlert>('Alert', alertSchema);
export const MongoThresholdModel = mongoose.models.Threshold || mongoose.model<IThreshold>('Threshold', thresholdSchema);
export const MongoAuditLogModel = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', auditLogSchema);

/* =========================================================================
   HYBRID REPOSITORY: MONGODB ATLAS + IN-MEMORY FAILOVER STORE
   ========================================================================= */

class Store<T extends { _id: string }> {
  private items: Map<string, T> = new Map();
  private mongooseModel: MongooseModelType<any>;

  constructor(mongooseModel: MongooseModelType<any>) {
    this.mongooseModel = mongooseModel;
  }

  private isConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }

  async find(query?: any): Promise<T[]> {
    if (this.isConnected()) {
      try {
        if (typeof query === 'function') {
          const all = await this.mongooseModel.find({}).lean().exec();
          return (all as unknown as T[]).filter(query);
        }
        const docs = await this.mongooseModel.find(query || {}).lean().exec();
        return docs as unknown as T[];
      } catch (err) {
        console.error('[Store] MongoDB find error, checking fallback store:', err);
      }
    }

    // In-memory fallback
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
    if (this.isConnected()) {
      try {
        const doc = await this.mongooseModel.findOne({ _id: id }).lean().exec();
        return (doc as unknown as T) || null;
      } catch (err) {
        console.error('[Store] MongoDB findById error, checking fallback store:', err);
      }
    }
    return this.items.get(id) || null;
  }

  async findOne(query: Partial<T> | ((item: T) => boolean)): Promise<T | null> {
    if (this.isConnected()) {
      try {
        if (typeof query === 'function') {
          const all = await this.find(query);
          return all.length > 0 ? all[0] : null;
        }
        const doc = await this.mongooseModel.findOne(query as any).lean().exec();
        return (doc as unknown as T) || null;
      } catch (err) {
        console.error('[Store] MongoDB findOne error, checking fallback store:', err);
      }
    }
    const results = await this.find(query);
    return results.length > 0 ? results[0] : null;
  }

  async create(data: Omit<T, '_id'> & { _id?: string }): Promise<T> {
    const _id = data._id || 'gen_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    const now = new Date().toISOString();
    const newItem = {
      ...data,
      _id,
      createdAt: (data as any).createdAt || now,
      updatedAt: (data as any).updatedAt || now
    } as unknown as T;

    if (this.isConnected()) {
      try {
        const created = await this.mongooseModel.create(newItem);
        const result = (created.toObject ? created.toObject() : created) as unknown as T;
        this.items.set(_id, result);
        return result;
      } catch (err) {
        console.error('[Store] MongoDB create error, saving in-memory:', err);
      }
    }

    this.items.set(_id, newItem);
    return newItem;
  }

  async findByIdAndUpdate(id: string, update: Partial<T>): Promise<T | null> {
    const updatedAt = new Date().toISOString();

    if (this.isConnected()) {
      try {
        const updated = await this.mongooseModel
          .findOneAndUpdate({ _id: id }, { ...update, updatedAt }, { returnDocument: 'after' })
          .lean()
          .exec();
        if (updated) {
          const res = updated as unknown as T;
          this.items.set(id, res);
          return res;
        }
      } catch (err) {
        console.error('[Store] MongoDB findByIdAndUpdate error, falling back:', err);
      }
    }

    const existing = this.items.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...update, updatedAt };
    this.items.set(id, updated);
    return updated;
  }

  async findByIdAndDelete(id: string): Promise<T | null> {
    if (this.isConnected()) {
      try {
        const deleted = await this.mongooseModel.findOneAndDelete({ _id: id }).lean().exec();
        this.items.delete(id);
        return (deleted as unknown as T) || null;
      } catch (err) {
        console.error('[Store] MongoDB findByIdAndDelete error:', err);
      }
    }

    const existing = this.items.get(id);
    if (!existing) return null;
    this.items.delete(id);
    return existing;
  }

  async countDocuments(query?: Partial<T> | ((item: T) => boolean)): Promise<number> {
    if (this.isConnected() && typeof query !== 'function') {
      try {
        return await this.mongooseModel.countDocuments(query || {}).exec();
      } catch (err) {
        console.error('[Store] MongoDB countDocuments error:', err);
      }
    }

    const results = await this.find(query);
    return results.length;
  }

  async deleteMany(query: Partial<T>): Promise<number> {
    if (this.isConnected()) {
      try {
        const res = await this.mongooseModel.deleteMany(query || {}).exec();
        return res.deletedCount || 0;
      } catch (err) {
        console.error('[Store] MongoDB deleteMany error:', err);
      }
    }

    const results = await this.find(query);
    results.forEach(item => this.items.delete(item._id));
    return results.length;
  }

  async clear(): Promise<void> {
    if (this.isConnected()) {
      try {
        await this.mongooseModel.deleteMany({}).exec();
      } catch (err) {
        console.error('[Store] MongoDB clear error:', err);
      }
    }
    this.items.clear();
  }

  async seed(items: T[]): Promise<void> {
    if (this.isConnected()) {
      try {
        const operations = items.map(item => ({
          updateOne: {
            filter: { _id: item._id },
            update: { $set: item },
            upsert: true
          }
        }));
        if (operations.length > 0) {
          await this.mongooseModel.bulkWrite(operations);
        }
      } catch (err) {
        console.error('[Store] Error seeding documents into MongoDB Atlas:', err);
      }
    }
    items.forEach(i => this.items.set(i._id, i));
  }
}

export const UserModel = new Store<IUser>(MongoUserModel);
export const DepartmentModel = new Store<IDepartment>(MongoDepartmentModel);
export const BudgetModel = new Store<IBudget>(MongoBudgetModel);
export const ExpenditureModel = new Store<IExpenditure>(MongoExpenditureModel);
export const AlertModel = new Store<IAlert>(MongoAlertModel);
export const ThresholdModel = new Store<IThreshold>(MongoThresholdModel);
export const AuditLogModel = new Store<IAuditLog>(MongoAuditLogModel);
