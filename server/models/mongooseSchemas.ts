import mongoose, { Schema, Model } from 'mongoose';

/**
 * Formal Mongoose Schemas & Models for College Project Submission / MongoDB Atlas deployment.
 */
export const UserMongooseSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['ADMIN', 'FINANCE_OFFICER', 'DEPARTMENT_HEAD'], required: true },
    departmentId: { type: String, default: null },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const DepartmentMongooseSchema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    description: { type: String },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const BudgetMongooseSchema = new Schema(
  {
    financialYear: { type: String, required: true },
    departmentId: { type: String, required: true },
    scheme: { type: String, required: true },
    allocatedAmount: { type: Number, required: true, min: 0 },
    allocationDate: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    status: { type: String, enum: ['ACTIVE', 'EXHAUSTED', 'EXCEEDED', 'CLOSED'], default: 'ACTIVE' },
    createdBy: { type: String, required: true }
  },
  { timestamps: true }
);

export const ExpenditureMongooseSchema = new Schema(
  {
    budgetId: { type: String, required: true },
    departmentId: { type: String, required: true },
    amount: { type: Number, required: true, min: 0.01 },
    category: {
      type: String,
      enum: ['Infrastructure', 'Equipment', 'Salaries', 'Procurement', 'Operations', 'Training', 'Maintenance', 'Other'],
      required: true
    },
    description: { type: String, required: true },
    transactionDate: { type: String, required: true },
    supportingDocumentUrl: { type: String },
    supportingDocumentName: { type: String },
    createdBy: { type: String, required: true }
  },
  { timestamps: true }
);

export const AlertMongooseSchema = new Schema(
  {
    departmentId: { type: String, required: true },
    budgetId: { type: String, required: true },
    type: {
      type: String,
      enum: ['UNDER_UTILIZATION', 'OVERSPENDING', 'SPENDING_SPIKE', 'THRESHOLD_DEVIATION'],
      required: true
    },
    severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], required: true },
    message: { type: String, required: true },
    currentValue: { type: Number, required: true },
    thresholdValue: { type: Number, required: true },
    explanation: { type: String },
    status: { type: String, enum: ['OPEN', 'REVIEWED', 'RESOLVED'], default: 'OPEN' },
    reviewedBy: { type: String },
    reviewedAt: { type: String }
  },
  { timestamps: true }
);

export const ThresholdMongooseSchema = new Schema(
  {
    underUtilizationPercentage: { type: Number, default: 35 },
    timeElapsedPercentage: { type: Number, default: 60 },
    warningUtilizationPercentage: { type: Number, default: 85 },
    criticalUtilizationPercentage: { type: Number, default: 95 },
    spendingSpikePercentage: { type: Number, default: 40 },
    updatedBy: { type: String }
  },
  { timestamps: true }
);

export const AuditLogMongooseSchema = new Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  action: { type: String, required: true },
  entity: { type: String, required: true },
  entityId: { type: String, required: true },
  oldValue: { type: Schema.Types.Mixed },
  newValue: { type: Schema.Types.Mixed },
  timestamp: { type: String, default: () => new Date().toISOString() },
  ipAddress: { type: String }
});

// Model getters with existing-model fallback (prevents OverwriteModelError in hot reloads)
export const MongooseUser: Model<any> = mongoose.models.User || mongoose.model('User', UserMongooseSchema);
export const MongooseDepartment: Model<any> = mongoose.models.Department || mongoose.model('Department', DepartmentMongooseSchema);
export const MongooseBudget: Model<any> = mongoose.models.Budget || mongoose.model('Budget', BudgetMongooseSchema);
export const MongooseExpenditure: Model<any> = mongoose.models.Expenditure || mongoose.model('Expenditure', ExpenditureMongooseSchema);
export const MongooseAlert: Model<any> = mongoose.models.Alert || mongoose.model('Alert', AlertMongooseSchema);
export const MongooseThreshold: Model<any> = mongoose.models.Threshold || mongoose.model('Threshold', ThresholdMongooseSchema);
export const MongooseAuditLog: Model<any> = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogMongooseSchema);
