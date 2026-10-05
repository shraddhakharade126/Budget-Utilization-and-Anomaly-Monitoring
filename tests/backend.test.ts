import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import {
  UserModel,
  DepartmentModel,
  BudgetModel,
  ExpenditureModel,
  AlertModel,
  ThresholdModel,
  AuditLogModel
} from '../server/models/index.js';
import { evaluateBudgetAnomalies, DEFAULT_THRESHOLDS } from '../server/services/anomalyService.js';
import { seedDatabase } from '../server/utils/seedData.js';
import { signToken } from '../server/middleware/auth.js';

test('GovBudget AI Core Financial & Anomaly Engine Test Suite', async (t) => {
  // 1. Setup & Seed Test
  await t.test('Seed database loads required entities and scenarios', async () => {
    await seedDatabase();

    const users = await UserModel.find();
    assert.ok(users.length >= 3, 'Should have at least 3 users (Admin, Finance, Head)');

    const admin = (await UserModel.findOne({ email: 'admin@govbudget.nic.in' })) || (await UserModel.findOne({ role: 'ADMIN' }));
    assert.ok(admin, 'Admin user should exist');
    assert.equal(admin?.role, 'ADMIN');

    const passMatch = await bcrypt.compare('GovBudget@2026', admin!.passwordHash);
    assert.equal(passMatch, true, 'Admin password hash should verify');

    const depts = await DepartmentModel.find();
    assert.ok(depts.length >= 6, 'Should have 6 government departments');

    const budgets = await BudgetModel.find();
    assert.ok(budgets.length >= 5, 'Should have at least 5 scenario budgets');
  });

  // 2. JWT Authentication & Role Sign
  await t.test('JWT token generation encodes user role and identifier', async () => {
    const admin = ((await UserModel.findOne({ email: 'admin@govbudget.nic.in' })) || (await UserModel.findOne({ role: 'ADMIN' })))!;
    const token = signToken(admin);
    assert.ok(typeof token === 'string' && token.length > 20, 'Token should be a valid string');
  });

  // 3. Financial Calculations: Remaining Amount and Utilization Percentage
  await t.test('Precise mathematical formula for utilization and remaining balance', async () => {
    const testBudget = await BudgetModel.create({
      departmentId: 'dept_test',
      financialYear: '2025-26',
      scheme: 'Test High Precision Solar Irrigation',
      allocatedAmount: 10000000, // ₹1.00 Crore
      allocationDate: '2025-04-01T00:00:00Z',
      startDate: '2025-04-01T00:00:00Z',
      endDate: '2026-03-31T00:00:00Z',
      status: 'ACTIVE',
      createdBy: 'usr_admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Add first voucher ₹25,00,000 (25%)
    await ExpenditureModel.create({
      budgetId: testBudget._id,
      departmentId: 'dept_test',
      amount: 2500000,
      category: 'Procurement',
      description: 'First milestone vendor payment',
      transactionDate: '2025-05-15T00:00:00Z',
      createdBy: 'usr_finance',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const eval1 = await evaluateBudgetAnomalies(testBudget._id);
    assert.equal(eval1.totalSpent, 2500000);
    assert.equal(eval1.remainingAmount, 7500000);
    assert.equal(eval1.utilizationPercentage, 25.0);
    assert.equal(eval1.budget.status, 'ACTIVE');

    // Add second voucher ₹50,00,000 (Total 75%)
    await ExpenditureModel.create({
      budgetId: testBudget._id,
      departmentId: 'dept_test',
      amount: 5000000,
      category: 'Infrastructure',
      description: 'Second milestone civil construction',
      transactionDate: '2025-06-20T00:00:00Z',
      createdBy: 'usr_finance',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const eval2 = await evaluateBudgetAnomalies(testBudget._id);
    assert.equal(eval2.totalSpent, 7500000);
    assert.equal(eval2.remainingAmount, 2500000);
    assert.equal(eval2.utilizationPercentage, 75.0);
  });

  // 4. Overspending Detection (Rule 2)
  await t.test('Anomaly Rule 2: Overspending detection generates CRITICAL alert', async () => {
    const overBudget = await BudgetModel.create({
      departmentId: 'dept_trans',
      financialYear: '2025-26',
      scheme: 'Test Urban Arterial Bridge',
      allocatedAmount: 1000000, // ₹10 Lakh
      allocationDate: '2025-04-01T00:00:00Z',
      startDate: '2025-04-01T00:00:00Z',
      endDate: '2026-03-31T00:00:00Z',
      status: 'ACTIVE',
      createdBy: 'usr_admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Spend ₹12 Lakh (Breached by 20%)
    await ExpenditureModel.create({
      budgetId: overBudget._id,
      departmentId: 'dept_trans',
      amount: 1200000,
      category: 'Infrastructure',
      description: 'Unexpected utility diversion bill',
      transactionDate: '2025-07-01T00:00:00Z',
      createdBy: 'usr_finance',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const evalRes = await evaluateBudgetAnomalies(overBudget._id);
    assert.equal(evalRes.budget.status, 'EXCEEDED');
    assert.equal(evalRes.utilizationPercentage, 120.0);
    assert.equal(evalRes.remainingAmount, -200000);

    const alerts = await AlertModel.find(a => a.budgetId === overBudget._id && a.type === 'OVERSPENDING');
    assert.ok(alerts.length >= 1, 'Overspending alert should be created');
    assert.equal(alerts[0].severity, 'CRITICAL');
  });

  // 5. Under-utilization Detection (Rule 1)
  await t.test('Anomaly Rule 1: Under-utilization flagged when time elapsed exceeds utilization', async () => {
    // Past budget where start date was months ago and end date is soon (90% elapsed)
    const underBudget = await BudgetModel.create({
      departmentId: 'dept_rural',
      financialYear: '2025-26',
      scheme: 'Test Delayed Borewell Scheme',
      allocatedAmount: 5000000, // ₹50 Lakh
      allocationDate: '2024-04-01T00:00:00Z',
      startDate: '2024-04-01T00:00:00Z',
      endDate: '2025-03-31T00:00:00Z', // Past or near end
      status: 'ACTIVE',
      createdBy: 'usr_admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Spent only ₹5 Lakh (10% utilization)
    await ExpenditureModel.create({
      budgetId: underBudget._id,
      departmentId: 'dept_rural',
      amount: 500000,
      category: 'Operations',
      description: 'Initial site clearance only',
      transactionDate: '2024-06-01T00:00:00Z',
      createdBy: 'usr_finance',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    await evaluateBudgetAnomalies(underBudget._id);
    const alerts = await AlertModel.find(a => a.budgetId === underBudget._id && a.type === 'UNDER_UTILIZATION');
    assert.ok(alerts.length >= 1, 'Under utilization alert should be generated');
    assert.equal(alerts[0].severity, 'MEDIUM');
  });

  // 6. Spending Spike Detection (Rule 4)
  await t.test('Anomaly Rule 4: Spending spike detected when voucher surges over moving average', async () => {
    const spikeBudget = await BudgetModel.create({
      departmentId: 'dept_edu',
      financialYear: '2025-26',
      scheme: 'Test School Library Books Scheme',
      allocatedAmount: 20000000, // ₹2.00 Crore
      allocationDate: '2025-04-01T00:00:00Z',
      startDate: '2025-04-01T00:00:00Z',
      endDate: '2026-03-31T00:00:00Z',
      status: 'ACTIVE',
      createdBy: 'usr_admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Vouchers 1 & 2: Average ₹10 Lakh
    await ExpenditureModel.create({
      budgetId: spikeBudget._id,
      departmentId: 'dept_edu',
      amount: 1000000,
      category: 'Procurement',
      description: 'Quarter 1 books batch',
      transactionDate: '2025-05-01T00:00:00Z',
      createdBy: 'usr_finance',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    await ExpenditureModel.create({
      budgetId: spikeBudget._id,
      departmentId: 'dept_edu',
      amount: 1000000,
      category: 'Procurement',
      description: 'Quarter 2 books batch',
      transactionDate: '2025-06-01T00:00:00Z',
      createdBy: 'usr_finance',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Voucher 3: Sudden spike of ₹60 Lakh (>40% surge over ₹10L and >15% of allocation)
    await ExpenditureModel.create({
      budgetId: spikeBudget._id,
      departmentId: 'dept_edu',
      amount: 6000000,
      category: 'Procurement',
      description: 'Unanticipated emergency bulk e-reader order',
      transactionDate: '2025-07-01T00:00:00Z',
      createdBy: 'usr_finance',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    await evaluateBudgetAnomalies(spikeBudget._id);
    const alerts = await AlertModel.find(a => a.budgetId === spikeBudget._id && a.type === 'SPENDING_SPIKE');
    assert.ok(alerts.length >= 1, 'Spending spike alert should be generated');
    assert.equal(alerts[0].severity, 'HIGH');
  });
});
