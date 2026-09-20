import {
  AlertModel,
  BudgetModel,
  ExpenditureModel,
  ThresholdModel,
  IAlert,
  IBudget,
  IExpenditure,
  IThreshold,
  AlertType,
  AlertSeverity
} from '../models/index.js';

export interface AnomalyEvaluationResult {
  budget: IBudget;
  totalSpent: number;
  remainingAmount: number;
  utilizationPercentage: number;
  newAlerts: IAlert[];
}

// Default threshold fallback matching statutory standards (e.g., <40% used after 70% elapsed)
export const DEFAULT_THRESHOLDS: Omit<IThreshold, '_id'> = {
  underUtilizationPercentage: 40, // <40% utilization threshold
  timeElapsedPercentage: 70, // 70% of fiscal duration elapsed
  warningUtilizationPercentage: 80, // 80% utilization warning
  criticalUtilizationPercentage: 95, // 95% critical cap
  spendingSpikePercentage: 40, // 40% sudden surge over running average
  updatedBy: 'system',
  updatedAt: new Date().toISOString()
};

export async function getActiveThresholds(): Promise<IThreshold> {
  const existing = await ThresholdModel.find();
  if (existing.length > 0) {
    return existing[0];
  }
  return await ThresholdModel.create(DEFAULT_THRESHOLDS);
}

/**
 * Calculates budget totals and executes deterministic rules.
 */
export async function evaluateBudgetAnomalies(budgetId: string): Promise<AnomalyEvaluationResult> {
  const budget = await BudgetModel.findById(budgetId);
  if (!budget) {
    throw new Error(`Budget with ID ${budgetId} not found.`);
  }

  const expenditures = await ExpenditureModel.find(e => e.budgetId === budgetId);
  const thresholds = await getActiveThresholds();

  // 1. Precise Financial Calculations (Source of truth)
  const totalSpent = expenditures.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const allocated = Number(budget.allocatedAmount || 0);
  const remainingAmount = Math.round((allocated - totalSpent) * 100) / 100;
  const utilizationPercentage = allocated > 0
    ? Math.round((totalSpent / allocated) * 10000) / 100
    : 0;

  // Update budget record status and cached calculations
  let status: IBudget['status'] = 'ACTIVE';
  if (totalSpent > allocated) {
    status = 'EXCEEDED';
  } else if (totalSpent === allocated) {
    status = 'EXHAUSTED';
  }

  await BudgetModel.findByIdAndUpdate(budgetId, {
    totalSpent,
    remainingAmount,
    utilizationPercentage,
    status
  });

  const updatedBudget = (await BudgetModel.findById(budgetId))!;
  const newAlerts: IAlert[] = [];

  // Calculate Time Elapsed percentage
  const startDate = new Date(budget.startDate).getTime();
  const endDate = new Date(budget.endDate).getTime();
  const now = Date.now();
  const totalDuration = Math.max(endDate - startDate, 1);
  const elapsedDuration = Math.min(Math.max(now - startDate, 0), totalDuration);
  const timeElapsedPercentage = Math.round((elapsedDuration / totalDuration) * 100);

  // Existing open alerts for this budget
  const existingAlerts = await AlertModel.find(a => a.budgetId === budgetId && a.status === 'OPEN');

  // RULE 2: OVERSPENDING (Critical Severity)
  if (totalSpent > allocated) {
    const hasAlert = existingAlerts.some(a => a.type === 'OVERSPENDING');
    if (!hasAlert) {
      const alert = await AlertModel.create({
        departmentId: budget.departmentId,
        budgetId: budget._id,
        type: 'OVERSPENDING',
        severity: 'CRITICAL',
        message: `Budget allocation exceeded for scheme "${budget.scheme}". Total expenditure is ₹${totalSpent.toLocaleString()} against allocated ₹${allocated.toLocaleString()}.`,
        currentValue: utilizationPercentage,
        thresholdValue: 100,
        explanation: `Expenditure has breached the 100% allocation cap by ₹${(totalSpent - allocated).toLocaleString()} (${(utilizationPercentage - 100).toFixed(1)}% over approved ceiling).`,
        status: 'OPEN',
        createdAt: new Date().toISOString()
      });
      newAlerts.push(alert);
    }
  }

  // RULE 1: UNDER UTILIZATION (Medium Severity)
  if (
    timeElapsedPercentage >= thresholds.timeElapsedPercentage &&
    utilizationPercentage < thresholds.underUtilizationPercentage
  ) {
    const hasAlert = existingAlerts.some(a => a.type === 'UNDER_UTILIZATION');
    if (!hasAlert) {
      const alert = await AlertModel.create({
        departmentId: budget.departmentId,
        budgetId: budget._id,
        type: 'UNDER_UTILIZATION',
        severity: 'MEDIUM',
        message: `Under-utilization detected for "${budget.scheme}". Fiscal duration is ${timeElapsedPercentage}% elapsed but utilization is only ${utilizationPercentage}%.`,
        currentValue: utilizationPercentage,
        thresholdValue: thresholds.underUtilizationPercentage,
        explanation: `With ${timeElapsedPercentage}% of the cycle passed, disbursement lags below the minimum benchmark of ${thresholds.underUtilizationPercentage}%. Risk of fund lapse at fiscal year end.`,
        status: 'OPEN',
        createdAt: new Date().toISOString()
      });
      newAlerts.push(alert);
    }
  }

  // RULE 3 & 5: HIGH / CRITICAL UTILIZATION (High Severity)
  if (utilizationPercentage >= thresholds.criticalUtilizationPercentage && totalSpent <= allocated) {
    const hasAlert = existingAlerts.some(a => a.type === 'THRESHOLD_DEVIATION' && a.severity === 'HIGH');
    if (!hasAlert) {
      const alert = await AlertModel.create({
        departmentId: budget.departmentId,
        budgetId: budget._id,
        type: 'THRESHOLD_DEVIATION',
        severity: 'HIGH',
        message: `Critical utilization threshold reached (${utilizationPercentage}%). Remaining fund is ₹${remainingAmount.toLocaleString()}.`,
        currentValue: utilizationPercentage,
        thresholdValue: thresholds.criticalUtilizationPercentage,
        explanation: `Disbursement has surpassed the critical advisory threshold of ${thresholds.criticalUtilizationPercentage}%. Upcoming vouchers may risk deficit without supplementary allocation.`,
        status: 'OPEN',
        createdAt: new Date().toISOString()
      });
      newAlerts.push(alert);
    }
  }

  // RULE 4: SPENDING SPIKE DETECTION (High Severity)
  if (expenditures.length >= 2) {
    // Sort transactions chronologically
    const sorted = [...expenditures].sort(
      (a, b) => new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime()
    );
    const latestTx = sorted[sorted.length - 1];
    const previousTxs = sorted.slice(0, sorted.length - 1);
    const avgHistorical = previousTxs.reduce((sum, tx) => sum + tx.amount, 0) / previousTxs.length;

    const surgeThreshold = avgHistorical * (1 + thresholds.spendingSpikePercentage / 100);

    if (latestTx.amount > surgeThreshold && latestTx.amount > (allocated * 0.15)) {
      const hasAlert = existingAlerts.some(a => a.type === 'SPENDING_SPIKE');
      if (!hasAlert) {
        const spikePct = Math.round(((latestTx.amount - avgHistorical) / avgHistorical) * 100);
        const alert = await AlertModel.create({
          departmentId: budget.departmentId,
          budgetId: budget._id,
          type: 'SPENDING_SPIKE',
          severity: 'HIGH',
          message: `Unusual single expenditure spike of ₹${latestTx.amount.toLocaleString()} in category "${latestTx.category}".`,
          currentValue: spikePct,
          thresholdValue: thresholds.spendingSpikePercentage,
          explanation: `Transaction of ₹${latestTx.amount.toLocaleString()} represents a ${spikePct}% increase over the previous category voucher average of ₹${Math.round(avgHistorical).toLocaleString()}.`,
          status: 'OPEN',
          createdAt: new Date().toISOString()
        });
        newAlerts.push(alert);
      }
    }
  }

  return {
    budget: updatedBudget,
    totalSpent,
    remainingAmount,
    utilizationPercentage,
    newAlerts
  };
}

/**
 * Scan all active budgets across the system.
 */
export async function runGlobalAnomalyScan(): Promise<{ scannedBudgets: number; totalNewAlerts: number }> {
  const allBudgets = await BudgetModel.find();
  let totalNew = 0;

  for (const b of allBudgets) {
    const res = await evaluateBudgetAnomalies(b._id);
    totalNew += res.newAlerts.length;
  }

  return {
    scannedBudgets: allBudgets.length,
    totalNewAlerts: totalNew
  };
}
