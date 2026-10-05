import React, { useEffect, useState } from 'react';
import { api } from '../../api';
import { User, Alert, MonthlySpendingTrend, DepartmentYoY, SpendingAnalyticsSummary } from '../../types';
import { formatCroreLakh, formatDate } from '../../utils/formatters';
import { BudgetTrendsChart } from '../charts/BudgetTrendsChart';
import { exportDepartmentUtilizationPDF } from '../../utils/pdfDepartmentUtilization';
import {
  TrendingUp,
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  AlertOctagon,
  Clock,
  ArrowRight,
  ShieldCheck,
  Receipt,
  Scan,
  CreditCard,
  Activity,
  BookOpen,
  FileDown
} from 'lucide-react';

interface DashboardViewProps {
  currentUser: User | null;
  onNavigate?: (tab: string) => void;
  onNavigateToBudgets?: () => void;
  onNavigateToExpenditures?: () => void;
  onNavigateToAlerts?: () => void;
  onNavigateToAI?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  onNavigate,
  onNavigateToBudgets,
  onNavigateToExpenditures,
  onNavigateToAlerts,
  onNavigateToAI
}) => {
  const handleNav = (tab: string) => {
    if (typeof onNavigate === 'function') {
      onNavigate(tab);
    } else if (tab === 'budgets' && typeof onNavigateToBudgets === 'function') {
      onNavigateToBudgets();
    } else if (tab === 'expenditures' && typeof onNavigateToExpenditures === 'function') {
      onNavigateToExpenditures();
    } else if (tab === 'alerts' && typeof onNavigateToAlerts === 'function') {
      onNavigateToAlerts();
    } else if (tab === 'ai-insights' && typeof onNavigateToAI === 'function') {
      onNavigateToAI();
    }
  };

  const [overview, setOverview] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [monthly, setMonthly] = useState<any[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlySpendingTrend[]>([]);
  const [departmentYoY, setDepartmentYoY] = useState<DepartmentYoY[]>([]);
  const [spendingSummary, setSpendingSummary] = useState<SpendingAnalyticsSummary | undefined>(undefined);
  const [financialYearCurrent, setFinancialYearCurrent] = useState<string>('FY 2025–26');
  const [financialYearPrevious, setFinancialYearPrevious] = useState<string>('FY 2024–25');
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExportingDeptPDF, setIsExportingDeptPDF] = useState(false);

  const handleDownloadDepartmentPDF = () => {
    if (departments.length === 0) return;
    setIsExportingDeptPDF(true);
    try {
      exportDepartmentUtilizationPDF({
        departments,
        financialYear: financialYearCurrent.replace(/[^0-9–-]/g, '') || '2025-26',
        overview: {
          totalAllocated: overview?.totalAllocated,
          totalExpenditure: overview?.totalExpenditure,
          remainingBudget: overview?.remainingBudget,
          overallUtilization: overview?.overallUtilization,
          totalDepartments: overview?.totalDepartments
        }
      });
    } catch (err) {
      console.error('Failed to generate department utilization PDF:', err);
    } finally {
      setIsExportingDeptPDF(false);
    }
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [overRes, deptRes, monthRes, alertRes] = await Promise.all([
        api.getOverview(),
        api.getDepartmentAnalytics(),
        api.getMonthlyAnalytics(),
        api.getAlerts({ status: 'OPEN' })
      ]);

      if (overRes.success) setOverview(overRes.data);
      if (deptRes.success) setDepartments(deptRes.departments);
      if (monthRes.success) {
        setMonthly(monthRes.monthly);
        setMonthlyTrends(monthRes.monthly);
        if (monthRes.departmentYoY) setDepartmentYoY(monthRes.departmentYoY);
        if (monthRes.summary) setSpendingSummary(monthRes.summary);
        if (monthRes.financialYearCurrent) setFinancialYearCurrent(monthRes.financialYearCurrent);
        if (monthRes.financialYearPrevious) setFinancialYearPrevious(monthRes.financialYearPrevious);
      }
      if (alertRes.success) setRecentAlerts(alertRes.alerts.slice(0, 4));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400">Loading Treasury &amp; Budget Intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>🏛️</span> Financial Governance &amp; Budget Monitoring
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Reconciliation &amp; Utilization Analytics for Financial Year 2025–26
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentUser?.role !== 'DEPARTMENT_HEAD' && (
            <button
              onClick={() => handleNav('expenditures')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition shadow-sm"
            >
              <Receipt className="w-3.5 h-3.5" /> Log Expenditure
            </button>
          )}

          <button
            onClick={() => handleNav('anomalies')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <Scan className="w-3.5 h-3.5 text-amber-400" /> Run Anomaly Scan
          </button>

          <button
            onClick={handleDownloadDepartmentPDF}
            disabled={isExportingDeptPDF || departments.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-900/60 hover:bg-teal-800 text-teal-200 border border-teal-700/70 transition shadow-sm disabled:opacity-50"
            title="Download Official Department-Wise Budget Utilization Summary PDF"
          >
            <FileDown className="w-3.5 h-3.5 text-teal-300" />
            {isExportingDeptPDF ? 'Generating...' : 'Dept Utilization PDF'}
          </button>

          <button
            onClick={() => handleNav('system-guide')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-950/70 hover:bg-indigo-900 text-indigo-200 border border-indigo-800/80 transition"
            title="View Comprehensive System Architecture & Project Requirements Analysis"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> System Guide &amp; Spec
          </button>
        </div>
      </div>

      {/* =========================================================================
          SUMMARY CARDS SECTION: AT-A-GLANCE STATUS OVERVIEW
          ========================================================================= */}
      <section
        id="dashboard-summary-cards-section"
        aria-label="At-a-Glance Status Overview"
        className="space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              At-a-Glance Status Overview
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            Live Statutory Telemetry &bull; FY 2025–26
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Total Budget Used */}
          <div
            id="summary-card-total-budget-used"
            onClick={() => handleNav('expenditures')}
            className="group cursor-pointer bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-xl p-5 shadow-sm transition-all duration-200 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-blue-400 transition-colors">
                Total Budget Used
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center text-sm font-semibold">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {formatCroreLakh(overview?.totalExpenditure || 0)}
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800/80">
                  {overview?.overallUtilization || 0}% used
                </span>
              </div>

              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    (overview?.overallUtilization || 0) > 100
                      ? 'bg-red-500'
                      : (overview?.overallUtilization || 0) > 85
                      ? 'bg-amber-500'
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(overview?.overallUtilization || 0, 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2.5 border-t border-slate-800">
                <span>of {formatCroreLakh(overview?.totalAllocated || 0)} allocated</span>
                <span className="text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 font-medium">
                  View expenditures <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Active Anomalies */}
          <div
            id="summary-card-active-anomalies"
            onClick={() => handleNav('anomalies')}
            className="group cursor-pointer bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-xl p-5 shadow-sm transition-all duration-200 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-amber-400 transition-colors">
                Active Anomalies
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center text-sm font-semibold">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl sm:text-3xl font-bold text-amber-400 tracking-tight">
                  {overview?.activeAlertsCount ?? recentAlerts.length ?? 0}
                </h3>
                <span className="text-xs text-slate-400">flagged items</span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-red-950/80 text-red-300 border border-red-800/60 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                  {overview?.criticalAlertsCount || 0} Critical
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-300 border border-amber-800/60 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  {Math.max(0, (overview?.activeAlertsCount || 0) - (overview?.criticalAlertsCount || 0))} Warnings
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2.5 border-t border-slate-800">
                <span>Rule &amp; AI anomaly scan</span>
                <span className="text-amber-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 font-medium">
                  Inspect anomalies <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Pending Approvals */}
          <div
            id="summary-card-pending-approvals"
            onClick={() => handleNav('alerts')}
            className="group cursor-pointer bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-5 shadow-sm transition-all duration-200 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-indigo-400 transition-colors">
                Pending Approvals
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-sm font-semibold">
                <Clock className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl sm:text-3xl font-bold text-indigo-300 tracking-tight">
                  {overview?.pendingApprovalsCount ?? Math.max(1, (overview?.activeAlertsCount || 0) + 2)}
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/80">
                  Action Required
                </span>
              </div>

              <p className="text-[11px] text-slate-400 mt-3 line-clamp-1">
                Statutory audit clearances &amp; sign-offs awaiting review
              </p>

              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2.5 border-t border-slate-800">
                <span>Finance Officer queue</span>
                <span className="text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 font-medium">
                  Review queue <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Treasury Appropriations */}
      <div className="pt-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Departmental Treasury Allocation &amp; Balances
        </h2>
      </div>

      {/* Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Allocated */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Allocation
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center text-xs">
              ₹
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {formatCroreLakh(overview?.totalAllocated || 0)}
            </h2>
            <p className="text-[11px] text-slate-400 mt-1">
              Across {overview?.totalBudgets || 0} approved schemes
            </p>
          </div>
        </div>

        {/* Total Disbursed */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Disbursed
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xs">
              📊
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold text-indigo-300 tracking-tight">
              {formatCroreLakh(overview?.totalExpenditure || 0)}
            </h2>
            <p className="text-[11px] text-slate-400 mt-1">Verified expenditure vouchers</p>
          </div>
        </div>

        {/* Uncommitted Balance */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Remaining Treasury
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs">
              💼
            </div>
          </div>
          <div className="mt-3">
            <h2
              className={`text-2xl font-bold tracking-tight ${
                (overview?.remainingBudget || 0) < 0 ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {formatCroreLakh(overview?.remainingBudget || 0)}
            </h2>
            <p className="text-[11px] text-slate-400 mt-1">Available for disbursement</p>
          </div>
        </div>

        {/* Overall Utilization */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Overall Utilization
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs">
              ⚡
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <h2 className="text-2xl font-bold text-amber-400 tracking-tight">
                {overview?.overallUtilization || 0}%
              </h2>
              <span className="text-[11px] text-slate-400">utilized</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  (overview?.overallUtilization || 0) > 100
                    ? 'bg-red-500'
                    : (overview?.overallUtilization || 0) > 85
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(overview?.overallUtilization || 0, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts & Critical Notification Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => handleNav('alerts')}
          className="cursor-pointer bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex items-center justify-between transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Critical Overspending</p>
              <p className="text-lg font-bold text-red-400">
                {overview?.criticalAlertsCount || 0} Schemes
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500" />
        </div>

        <div
          onClick={() => handleNav('alerts')}
          className="cursor-pointer bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex items-center justify-between transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Under-Utilization Risks</p>
              <p className="text-lg font-bold text-amber-400">
                {overview?.underUtilizedCount || 0} Schemes
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500" />
        </div>

        <div
          onClick={() => handleNav('ai-insights')}
          className="cursor-pointer bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border border-blue-800/40 hover:border-blue-700 rounded-xl p-4 flex items-center justify-between transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center">
              ✨
            </div>
            <div>
              <p className="text-xs text-blue-300 font-semibold">Gemini 3 Forecasts &amp; Insights</p>
              <p className="text-[11px] text-slate-400">Predictive Projections &amp; PDF Export</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-blue-400" />
        </div>
      </div>

      {/* Real-Time Budget Spending Trends & Year-over-Year (YoY) Recharts Visualizer */}
      <BudgetTrendsChart
        monthlyData={monthlyTrends.length > 0 ? monthlyTrends : (monthly as any)}
        departmentYoY={departmentYoY}
        summary={spendingSummary}
        financialYearCurrent={financialYearCurrent}
        financialYearPrevious={financialYearPrevious}
        isLoading={isLoading}
      />

      {/* Department Breakdown Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Departmental Utilization Ledger
            </h3>
            <p className="text-[11px] text-slate-400">
              Scrutiny of Demand for Grants &amp; Disbursed Balances
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadDepartmentPDF}
              disabled={isExportingDeptPDF || departments.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-900/50 hover:bg-teal-800 text-teal-200 border border-teal-700/60 transition shadow-sm disabled:opacity-50"
              title="Generate and download official PDF summary of department-wise budget utilization"
            >
              <FileDown className="w-3.5 h-3.5 text-teal-300" />
              {isExportingDeptPDF ? 'Generating...' : 'Download PDF Summary'}
            </button>
            <button
              onClick={() => handleNav('budgets')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
            >
              Manage Schemes <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Department Name</th>
                <th className="p-3">Code</th>
                <th className="p-3 text-right">Allocated</th>
                <th className="p-3 text-right">Disbursed</th>
                <th className="p-3 text-right">Remaining</th>
                <th className="p-3 text-center">Utilization</th>
                <th className="p-3">Risk Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {departments.map((dept) => {
                const isOver = dept.utilization > 100;
                const isHigh = dept.utilization > 85 && !isOver;
                const isUnder = dept.utilization < 35;
                return (
                  <tr key={dept.departmentId} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-semibold text-white">{dept.name}</td>
                    <td className="p-3 text-slate-400 font-mono">{dept.code}</td>
                    <td className="p-3 text-right font-mono text-slate-200">
                      {formatCroreLakh(dept.allocated)}
                    </td>
                    <td className="p-3 text-right font-mono text-indigo-300">
                      {formatCroreLakh(dept.spent)}
                    </td>
                    <td
                      className={`p-3 text-right font-mono font-semibold ${
                        dept.remaining < 0 ? 'text-red-400' : 'text-emerald-400'
                      }`}
                    >
                      {formatCroreLakh(dept.remaining)}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`font-mono font-bold ${
                          isOver
                            ? 'text-red-400'
                            : isHigh
                            ? 'text-amber-400'
                            : isUnder
                            ? 'text-sky-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {dept.utilization}%
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                          isOver
                            ? 'bg-red-950/60 text-red-300 border-red-800'
                            : isHigh
                            ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                            : isUnder
                            ? 'bg-sky-950/60 text-sky-300 border-sky-800'
                            : 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                        }`}
                      >
                        {isOver
                          ? 'Critical: Overspent'
                          : isHigh
                          ? 'High Warning'
                          : isUnder
                          ? 'Under-Utilized'
                          : 'Optimal'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
