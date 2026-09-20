import bcrypt from 'bcryptjs';
import {
  UserModel,
  DepartmentModel,
  BudgetModel,
  ExpenditureModel,
  AlertModel,
  ThresholdModel,
  AuditLogModel,
  IDepartment,
  IUser,
  IBudget,
  IExpenditure,
  IAlert,
  IThreshold
} from '../models/index.js';
import { DEFAULT_THRESHOLDS } from '../services/anomalyService.js';

export const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'GovBudget@2026';

export const DATA_SOURCES = [
  {
    sourceName: 'Union Budget of India (Open Access Portal)',
    sourceDocument: 'Expenditure Profile & Demand for Grants, Ministry of Finance',
    sourceYear: '2024-2025 & 2025-2026',
    sourceUrl: 'https://www.indiabudget.gov.in',
    description: 'Statutory departmental heads of expenditure, capital outlays, and centrally sponsored schemes.'
  },
  {
    sourceName: 'Open Government Data (OGD) Platform',
    sourceDocument: 'National Health Mission & PMGSY Scheme Financial Progress Datasets',
    sourceYear: '2024-2025',
    sourceUrl: 'https://data.gov.in',
    description: 'Granular state-level and departmental expenditure vouchers and scheme monitoring metrics.'
  },
  {
    sourceName: 'Comptroller and Auditor General (CAG) Public Reports',
    sourceDocument: 'Civil & Commercial Audit Reports on State Finances & Fiscal Deviation Benchmarks',
    sourceYear: '2023-2024',
    sourceUrl: 'https://cag.gov.in',
    description: 'Guidelines on fiscal thresholds, lapse prevention, and anomaly categorization benchmarks.'
  }
];

export async function seedDatabase(): Promise<void> {
  // Clear all stores to establish a clean state
  await UserModel.clear();
  await DepartmentModel.clear();
  await BudgetModel.clear();
  await ExpenditureModel.clear();
  await AlertModel.clear();
  await ThresholdModel.clear();
  await AuditLogModel.clear();

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // 1. Seed Departments
  const departments: IDepartment[] = [
    {
      _id: 'dept_health',
      name: 'Public Health & Family Welfare',
      code: 'PHFW',
      description: 'Primary healthcare centers, disease surveillance, medical infrastructure, and essential drug procurement.',
      isActive: true,
      createdAt: '2025-04-01T00:00:00Z',
      updatedAt: '2025-04-01T00:00:00Z'
    },
    {
      _id: 'dept_edu',
      name: 'School Education & Literacy',
      code: 'SEDL',
      description: 'Samagra Shiksha, digital smart classrooms, midday nutrition logistics, and teacher skill training.',
      isActive: true,
      createdAt: '2025-04-01T00:00:00Z',
      updatedAt: '2025-04-01T00:00:00Z'
    },
    {
      _id: 'dept_trans',
      name: 'Public Works & Transport',
      code: 'PWTR',
      description: 'State highway expansion, arterial corridor maintenance, bridge safety retrofits, and EV bus fleet subsidies.',
      isActive: true,
      createdAt: '2025-04-01T00:00:00Z',
      updatedAt: '2025-04-01T00:00:00Z'
    },
    {
      _id: 'dept_agri',
      name: 'Agriculture & Farmer Welfare',
      code: 'AGFW',
      description: 'Micro-irrigation subsidies, soil health card labs, climate-resilient crop seeds, and cold-chain hubs.',
      isActive: true,
      createdAt: '2025-04-01T00:00:00Z',
      updatedAt: '2025-04-01T00:00:00Z'
    },
    {
      _id: 'dept_rural',
      name: 'Rural Development & Panchayati Raj',
      code: 'RDPR',
      description: 'Gram panchayat road connectivity, rural watershed management, and village community center solarization.',
      isActive: true,
      createdAt: '2025-04-01T00:00:00Z',
      updatedAt: '2025-04-01T00:00:00Z'
    },
    {
      _id: 'dept_wcd',
      name: 'Women & Child Development',
      code: 'WCDD',
      description: 'Anganwadi modernization, Poshan Abhiyaan nutritional supplements, and adolescent girl skill programs.',
      isActive: true,
      createdAt: '2025-04-01T00:00:00Z',
      updatedAt: '2025-04-01T00:00:00Z'
    }
  ];
  await DepartmentModel.seed(departments);

  // 2. Seed Users
  const users: IUser[] = [
    {
      _id: 'usr_admin',
      name: 'Dr. Rajesh Sharma (IAS)',
      email: 'admin@govbudget.nic.in',
      username: 'admin',
      passwordHash,
      role: 'ADMIN',
      departmentId: null,
      isActive: true,
      createdAt: '2025-04-01T00:00:00Z',
      updatedAt: '2025-04-01T00:00:00Z'
    },
    {
      _id: 'usr_finance',
      name: 'Priya Narayanan (Accounts Officer)',
      email: 'finance@govbudget.nic.in',
      username: 'finance',
      passwordHash,
      role: 'FINANCE_OFFICER',
      departmentId: 'dept_health',
      isActive: true,
      createdAt: '2025-04-01T00:00:00Z',
      updatedAt: '2025-04-01T00:00:00Z'
    },
    {
      _id: 'usr_head',
      name: 'Sunil Verma (Principal Secretary)',
      email: 'head@govbudget.nic.in',
      username: 'head',
      passwordHash,
      role: 'DEPARTMENT_HEAD',
      departmentId: 'dept_health',
      isActive: true,
      createdAt: '2025-04-01T00:00:00Z',
      updatedAt: '2025-04-01T00:00:00Z'
    },
    {
      _id: 'usr_fin_edu',
      name: 'Meenakshi Sundaram',
      email: 'finance.edu@govbudget.nic.in',
      username: 'finance.edu',
      passwordHash,
      role: 'FINANCE_OFFICER',
      departmentId: 'dept_edu',
      isActive: true,
      createdAt: '2025-04-01T00:00:00Z',
      updatedAt: '2025-04-01T00:00:00Z'
    },
    {
      _id: 'usr_fin_trans',
      name: 'Vikramaditya Chauhan',
      email: 'finance.transport@govbudget.nic.in',
      username: 'finance.transport',
      passwordHash,
      role: 'FINANCE_OFFICER',
      departmentId: 'dept_trans',
      isActive: true,
      createdAt: '2025-04-01T00:00:00Z',
      updatedAt: '2025-04-01T00:00:00Z'
    }
  ];
  await UserModel.seed(users);

  // 3. Seed Thresholds
  const thresholds: IThreshold = {
    _id: 'thresh_global',
    ...DEFAULT_THRESHOLDS
  };
  await ThresholdModel.seed([thresholds]);

  // 4. Seed Budgets (Demonstrating all 5 required scenarios)
  // Current fiscal year: 2025-26 (Apr 1, 2025 to Mar 31, 2026)
  const budgets: IBudget[] = [
    // Scenario 1: Normal Utilization (~58% spent on target)
    {
      _id: 'bgt_health_icu',
      financialYear: '2025-26',
      departmentId: 'dept_health',
      scheme: 'Critical Care ICU Block & Oxygen Grid Expansion',
      allocatedAmount: 45000000, // ₹4.5 Crore
      allocationDate: '2025-04-10T00:00:00Z',
      startDate: '2025-04-01T00:00:00Z',
      endDate: '2026-03-31T00:00:00Z',
      status: 'ACTIVE',
      totalSpent: 26200000,
      remainingAmount: 18800000,
      utilizationPercentage: 58.22,
      createdBy: 'usr_admin',
      createdAt: '2025-04-10T00:00:00Z',
      updatedAt: '2025-08-15T00:00:00Z'
    },
    // Scenario 2: Under-utilization (Time elapsed ~70%, utilization only 23.4%)
    {
      _id: 'bgt_rural_watershed',
      financialYear: '2025-26',
      departmentId: 'dept_rural',
      scheme: 'Integrated Micro-Watershed & Recharge Borewell Network',
      allocatedAmount: 38000000, // ₹3.8 Crore
      allocationDate: '2025-04-12T00:00:00Z',
      startDate: '2025-04-01T00:00:00Z',
      endDate: '2026-03-31T00:00:00Z',
      status: 'ACTIVE',
      totalSpent: 8900000,
      remainingAmount: 29100000,
      utilizationPercentage: 23.42,
      createdBy: 'usr_admin',
      createdAt: '2025-04-12T00:00:00Z',
      updatedAt: '2025-08-20T00:00:00Z'
    },
    // Scenario 3: Overspending (Breached 100% allocation cap: ₹2.5 Cr allocated, ₹2.72 Cr spent -> 108.8%)
    {
      _id: 'bgt_trans_flyover',
      financialYear: '2025-26',
      departmentId: 'dept_trans',
      scheme: 'Urban Congestion Bypass & Railway Overbridge (ROB) Phase-II',
      allocatedAmount: 25000000, // ₹2.5 Crore
      allocationDate: '2025-04-15T00:00:00Z',
      startDate: '2025-04-01T00:00:00Z',
      endDate: '2026-03-31T00:00:00Z',
      status: 'EXCEEDED',
      totalSpent: 27200000,
      remainingAmount: -2200000,
      utilizationPercentage: 108.8,
      createdBy: 'usr_admin',
      createdAt: '2025-04-15T00:00:00Z',
      updatedAt: '2025-09-02T00:00:00Z'
    },
    // Scenario 4: Spending Spike (Sudden single voucher surge of ₹1.45 Cr after modest ₹20L monthly average)
    {
      _id: 'bgt_edu_smartlabs',
      financialYear: '2025-26',
      departmentId: 'dept_edu',
      scheme: 'STEM Innovation & Digital Smart Labs for 120 Model Schools',
      allocatedAmount: 32000000, // ₹3.2 Crore
      allocationDate: '2025-04-18T00:00:00Z',
      startDate: '2025-04-01T00:00:00Z',
      endDate: '2026-03-31T00:00:00Z',
      status: 'ACTIVE',
      totalSpent: 22800000,
      remainingAmount: 9200000,
      utilizationPercentage: 71.25,
      createdBy: 'usr_admin',
      createdAt: '2025-04-18T00:00:00Z',
      updatedAt: '2025-09-05T00:00:00Z'
    },
    // Scenario 5: High Utilization (96.8% spent - near critical exhaustion limit)
    {
      _id: 'bgt_agri_solarpump',
      financialYear: '2025-26',
      departmentId: 'dept_agri',
      scheme: 'PM-KUSUM Solar Agri-Pump Installation & Feeder Solarization',
      allocatedAmount: 50000000, // ₹5.0 Crore
      allocationDate: '2025-04-05T00:00:00Z',
      startDate: '2025-04-01T00:00:00Z',
      endDate: '2026-03-31T00:00:00Z',
      status: 'ACTIVE',
      totalSpent: 48400000,
      remainingAmount: 1600000,
      utilizationPercentage: 96.8,
      createdBy: 'usr_admin',
      createdAt: '2025-04-05T00:00:00Z',
      updatedAt: '2025-08-30T00:00:00Z'
    },
    // Additional budget for Women & Child Dev
    {
      _id: 'bgt_wcd_nutrition',
      financialYear: '2025-26',
      departmentId: 'dept_wcd',
      scheme: 'Early Childhood Nutrition Kits & Anganwadi Smart Weighing Kits',
      allocatedAmount: 20000000, // ₹2.0 Crore
      allocationDate: '2025-05-01T00:00:00Z',
      startDate: '2025-04-01T00:00:00Z',
      endDate: '2026-03-31T00:00:00Z',
      status: 'ACTIVE',
      totalSpent: 9600000,
      remainingAmount: 10400000,
      utilizationPercentage: 48.0,
      createdBy: 'usr_admin',
      createdAt: '2025-05-01T00:00:00Z',
      updatedAt: '2025-08-10T00:00:00Z'
    }
  ];
  await BudgetModel.seed(budgets);

  // 5. Seed Expenditures
  const expenditures: IExpenditure[] = [
    // Health ICU
    {
      _id: 'exp_h_01',
      budgetId: 'bgt_health_icu',
      departmentId: 'dept_health',
      amount: 8500000,
      category: 'Equipment',
      description: 'Procurement of 25 High-Frequency Ventilators & Multi-Para Monitors (GeM Tender #GEM/2025/B/91823)',
      transactionDate: '2025-05-14T00:00:00Z',
      supportingDocumentUrl: '/docs/gem_ventilator_sanction_order.pdf',
      supportingDocumentName: 'gem_ventilator_sanction_order.pdf',
      createdBy: 'usr_finance',
      createdAt: '2025-05-14T00:00:00Z',
      updatedAt: '2025-05-14T00:00:00Z'
    },
    {
      _id: 'exp_h_02',
      budgetId: 'bgt_health_icu',
      departmentId: 'dept_health',
      amount: 11200000,
      category: 'Infrastructure',
      description: 'Civil retrofitting and cryo-piping for liquid medical oxygen manifold (Running Account Bill #3)',
      transactionDate: '2025-06-22T00:00:00Z',
      supportingDocumentUrl: '/docs/oxygen_manifold_pwd_ra_bill.pdf',
      supportingDocumentName: 'oxygen_manifold_pwd_ra_bill.pdf',
      createdBy: 'usr_finance',
      createdAt: '2025-06-22T00:00:00Z',
      updatedAt: '2025-06-22T00:00:00Z'
    },
    {
      _id: 'exp_h_03',
      budgetId: 'bgt_health_icu',
      departmentId: 'dept_health',
      amount: 6500000,
      category: 'Operations',
      description: 'Annual Maintenance Contract (AMC) payment and biomedical technician staffing stipend Q1',
      transactionDate: '2025-07-30T00:00:00Z',
      supportingDocumentUrl: '/docs/amc_technician_voucher_q1.pdf',
      supportingDocumentName: 'amc_technician_voucher_q1.pdf',
      createdBy: 'usr_finance',
      createdAt: '2025-07-30T00:00:00Z',
      updatedAt: '2025-07-30T00:00:00Z'
    },
    // Rural Watershed (Under-utilized)
    {
      _id: 'exp_r_01',
      budgetId: 'bgt_rural_watershed',
      departmentId: 'dept_rural',
      amount: 4200000,
      category: 'Procurement',
      description: 'Geophysical hydrogeological surveys and satellite soil-moisture remote sensing maps',
      transactionDate: '2025-05-20T00:00:00Z',
      supportingDocumentUrl: '/docs/geo_survey_invoice.pdf',
      supportingDocumentName: 'geo_survey_invoice.pdf',
      createdBy: 'usr_admin',
      createdAt: '2025-05-20T00:00:00Z',
      updatedAt: '2025-05-20T00:00:00Z'
    },
    {
      _id: 'exp_r_02',
      budgetId: 'bgt_rural_watershed',
      departmentId: 'dept_rural',
      amount: 4700000,
      category: 'Infrastructure',
      description: 'Pilot check-dam masonry wall construction in block-A cluster (First milestone disbursal)',
      transactionDate: '2025-06-18T00:00:00Z',
      supportingDocumentUrl: '/docs/check_dam_cluster_voucher.pdf',
      supportingDocumentName: 'check_dam_cluster_voucher.pdf',
      createdBy: 'usr_admin',
      createdAt: '2025-06-18T00:00:00Z',
      updatedAt: '2025-06-18T00:00:00Z'
    },
    // Transport Flyover (Overspending)
    {
      _id: 'exp_t_01',
      budgetId: 'bgt_trans_flyover',
      departmentId: 'dept_trans',
      amount: 9800000,
      category: 'Infrastructure',
      description: 'Pier piling foundations and utility duct shifting compensation to municipal water utility',
      transactionDate: '2025-05-02T00:00:00Z',
      supportingDocumentUrl: '/docs/utility_shifting_cert.pdf',
      supportingDocumentName: 'utility_shifting_cert.pdf',
      createdBy: 'usr_fin_trans',
      createdAt: '2025-05-02T00:00:00Z',
      updatedAt: '2025-05-02T00:00:00Z'
    },
    {
      _id: 'exp_t_02',
      budgetId: 'bgt_trans_flyover',
      departmentId: 'dept_trans',
      amount: 10400000,
      category: 'Infrastructure',
      description: 'Pre-stressed girder fabrication and heavy crane launch sequence milestone bill #4',
      transactionDate: '2025-06-28T00:00:00Z',
      supportingDocumentUrl: '/docs/girder_launch_bill4.pdf',
      supportingDocumentName: 'girder_launch_bill4.pdf',
      createdBy: 'usr_fin_trans',
      createdAt: '2025-06-28T00:00:00Z',
      updatedAt: '2025-06-28T00:00:00Z'
    },
    {
      _id: 'exp_t_03',
      budgetId: 'bgt_trans_flyover',
      departmentId: 'dept_trans',
      amount: 7000000,
      category: 'Infrastructure',
      description: 'Bituminous overlay, crash barrier installation, and railway safety clearance fees (Exceeded allocated ceiling)',
      transactionDate: '2025-08-25T00:00:00Z',
      supportingDocumentUrl: '/docs/railway_safety_final_settlement.pdf',
      supportingDocumentName: 'railway_safety_final_settlement.pdf',
      createdBy: 'usr_fin_trans',
      createdAt: '2025-08-25T00:00:00Z',
      updatedAt: '2025-08-25T00:00:00Z'
    },
    // Education Smart Labs (Spending Spike)
    {
      _id: 'exp_e_01',
      budgetId: 'bgt_edu_smartlabs',
      departmentId: 'dept_edu',
      amount: 2200000,
      category: 'Operations',
      description: 'Pre-implementation school electrical wiring audits and interactive board mounting frames',
      transactionDate: '2025-05-10T00:00:00Z',
      supportingDocumentUrl: '/docs/lab_wiring_audit_report.pdf',
      supportingDocumentName: 'lab_wiring_audit_report.pdf',
      createdBy: 'usr_fin_edu',
      createdAt: '2025-05-10T00:00:00Z',
      updatedAt: '2025-05-10T00:00:00Z'
    },
    {
      _id: 'exp_e_02',
      budgetId: 'bgt_edu_smartlabs',
      departmentId: 'dept_edu',
      amount: 2600000,
      category: 'Training',
      description: 'Master teacher digital pedagogy and STEM robotics workshop facilitation stipends',
      transactionDate: '2025-06-15T00:00:00Z',
      supportingDocumentUrl: '/docs/teacher_pedagogy_stipend.pdf',
      supportingDocumentName: 'teacher_pedagogy_stipend.pdf',
      createdBy: 'usr_fin_edu',
      createdAt: '2025-06-15T00:00:00Z',
      updatedAt: '2025-06-15T00:00:00Z'
    },
    {
      _id: 'exp_e_03',
      budgetId: 'bgt_edu_smartlabs',
      departmentId: 'dept_edu',
      amount: 18000000, // Spike: ₹1.8 Crore bulk hardware batch compared to previous ₹2.4M average
      category: 'Procurement',
      description: 'Bunched central procurement: 1,440 Interactive Smart Flat Panels and VR Science Toolkits',
      transactionDate: '2025-08-14T00:00:00Z',
      supportingDocumentUrl: '/docs/gem_smart_panel_bulk_delivery.pdf',
      supportingDocumentName: 'gem_smart_panel_bulk_delivery.pdf',
      createdBy: 'usr_fin_edu',
      createdAt: '2025-08-14T00:00:00Z',
      updatedAt: '2025-08-14T00:00:00Z'
    },
    // Agri Solar Pump (High Utilization - 96.8%)
    {
      _id: 'exp_a_01',
      budgetId: 'bgt_agri_solarpump',
      departmentId: 'dept_agri',
      amount: 24000000,
      category: 'Procurement',
      description: 'Tranche-1 capital subsidy disbursal for 1,200 grid-connected 5HP DC surface solar pumps',
      transactionDate: '2025-05-08T00:00:00Z',
      supportingDocumentUrl: '/docs/solar_subsidy_tranche1.pdf',
      supportingDocumentName: 'solar_subsidy_tranche1.pdf',
      createdBy: 'usr_admin',
      createdAt: '2025-05-08T00:00:00Z',
      updatedAt: '2025-05-08T00:00:00Z'
    },
    {
      _id: 'exp_a_02',
      budgetId: 'bgt_agri_solarpump',
      departmentId: 'dept_agri',
      amount: 24400000,
      category: 'Operations',
      description: 'Tranche-2 vendor commissioning verification payout and net-metering telemetry integration',
      transactionDate: '2025-07-28T00:00:00Z',
      supportingDocumentUrl: '/docs/solar_subsidy_tranche2.pdf',
      supportingDocumentName: 'solar_subsidy_tranche2.pdf',
      createdBy: 'usr_admin',
      createdAt: '2025-07-28T00:00:00Z',
      updatedAt: '2025-07-28T00:00:00Z'
    }
  ];
  await ExpenditureModel.seed(expenditures);

  // 6. Seed Realistic Alerts Generated from the Scenarios
  const alerts: IAlert[] = [
    {
      _id: 'alt_overspending_trans',
      departmentId: 'dept_trans',
      budgetId: 'bgt_trans_flyover',
      type: 'OVERSPENDING',
      severity: 'CRITICAL',
      message: 'Critical Overspending: Expenditure exceeded allocated budget by ₹22,00,000 (108.8% utilization).',
      currentValue: 108.8,
      thresholdValue: 100,
      explanation: 'Disbursements have exceeded the approved legislative outlay by ₹22,00,000. Supplementary grant or diversion re-appropriation required immediately.',
      status: 'OPEN',
      createdAt: '2025-08-25T14:30:00Z'
    },
    {
      _id: 'alt_underutil_rural',
      departmentId: 'dept_rural',
      budgetId: 'bgt_rural_watershed',
      type: 'UNDER_UTILIZATION',
      severity: 'MEDIUM',
      message: 'Under-utilization risk: Only 23.42% utilized despite 60%+ elapsed fiscal timeline.',
      currentValue: 23.42,
      thresholdValue: 35,
      explanation: 'Progress rate indicates substantial danger of fiscal fund lapse by March 31 unless contracting and field sanction hurdles are cleared.',
      status: 'OPEN',
      createdAt: '2025-08-20T10:15:00Z'
    },
    {
      _id: 'alt_spike_edu',
      departmentId: 'dept_edu',
      budgetId: 'bgt_edu_smartlabs',
      type: 'SPENDING_SPIKE',
      severity: 'HIGH',
      message: 'Unusual spending surge: Voucher of ₹1,80,00,000 represents 650% surge over historical monthly voucher average.',
      currentValue: 650,
      thresholdValue: 40,
      explanation: 'Single voucher in Procurement category spiked drastically over the previous ₹24,00,000 run-rate. Verification recommended.',
      status: 'OPEN',
      createdAt: '2025-08-14T16:45:00Z'
    },
    {
      _id: 'alt_highutil_agri',
      departmentId: 'dept_agri',
      budgetId: 'bgt_agri_solarpump',
      type: 'THRESHOLD_DEVIATION',
      severity: 'HIGH',
      message: 'Critical ceiling proximity: 96.8% allocated funds exhausted. Remaining uncommitted balance is ₹16,00,000.',
      currentValue: 96.8,
      thresholdValue: 95,
      explanation: 'Remaining funds cannot absorb upcoming maintenance vouchers without a supplementary budget allocation.',
      status: 'REVIEWED',
      createdAt: '2025-07-28T11:20:00Z',
      reviewedBy: 'usr_admin',
      reviewedAt: '2025-07-29T09:00:00Z'
    }
  ];
  await AlertModel.seed(alerts);

  // 7. Seed Audit Logs
  const auditLogs = [
    {
      _id: 'log_seed_01',
      userId: 'usr_admin',
      userName: 'Dr. Rajesh Sharma (IAS)',
      userRole: 'ADMIN',
      action: 'SYSTEM_SEED',
      entity: 'DATABASE',
      entityId: 'ALL',
      oldValue: null,
      newValue: { status: 'INITIALIZED', recordsCount: 28 },
      timestamp: '2025-04-01T00:00:00Z',
      ipAddress: '10.0.4.12'
    },
    {
      _id: 'log_seed_02',
      userId: 'usr_admin',
      userName: 'Dr. Rajesh Sharma (IAS)',
      userRole: 'ADMIN',
      action: 'BUDGET_CREATED',
      entity: 'BUDGET',
      entityId: 'bgt_health_icu',
      oldValue: null,
      newValue: { scheme: 'Critical Care ICU Block', allocatedAmount: 45000000 },
      timestamp: '2025-04-10T10:00:00Z',
      ipAddress: '10.0.4.12'
    },
    {
      _id: 'log_seed_03',
      userId: 'usr_finance',
      userName: 'Priya Narayanan',
      userRole: 'FINANCE_OFFICER',
      action: 'EXPENDITURE_RECORDED',
      entity: 'EXPENDITURE',
      entityId: 'exp_h_01',
      oldValue: null,
      newValue: { amount: 8500000, category: 'Equipment' },
      timestamp: '2025-05-14T11:30:00Z',
      ipAddress: '10.0.8.45'
    },
    {
      _id: 'log_seed_04',
      userId: 'usr_fin_trans',
      userName: 'Vikramaditya Chauhan',
      userRole: 'FINANCE_OFFICER',
      action: 'EXPENDITURE_RECORDED',
      entity: 'EXPENDITURE',
      entityId: 'exp_t_03',
      oldValue: null,
      newValue: { amount: 7000000, note: 'Exceeded budget allocation' },
      timestamp: '2025-08-25T14:30:00Z',
      ipAddress: '10.0.12.19'
    },
    {
      _id: 'log_seed_05',
      userId: 'usr_admin',
      userName: 'Dr. Rajesh Sharma (IAS)',
      userRole: 'ADMIN',
      action: 'ALERT_REVIEWED',
      entity: 'ALERT',
      entityId: 'alt_highutil_agri',
      oldValue: { status: 'OPEN' },
      newValue: { status: 'REVIEWED', comments: 'Reviewed with Agricultural Commissioner' },
      timestamp: '2025-07-29T09:00:00Z',
      ipAddress: '10.0.4.12'
    }
  ];
  await AuditLogModel.seed(auditLogs as any);

  console.log('[Database] GovBudget AI financial monitoring ledger initialized with statutory schemes.');
}
