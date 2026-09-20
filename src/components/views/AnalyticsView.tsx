import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { Department, Budget, Expenditure, Alert } from '../../types';
import { formatCroreLakh, formatDate } from '../../utils/formatters';
import { jsPDF } from 'jspdf';
import { exportConsolidatedForecastsPDF } from '../../utils/pdfForecastExport';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  PieChart,
  TrendingUp,
  Building,
  CheckCircle2,
  Calendar,
  Printer,
  Sparkles
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [monthly, setMonthly] = useState<any[]>([]);
  const [alertsSummary, setAlertsSummary] = useState<any>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenditures, setExpenditures] = useState<Expenditure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExportingAIPDF, setIsExportingAIPDF] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [dRes, mRes, aRes, bRes, eRes] = await Promise.all([
          api.getDepartmentAnalytics(),
          api.getMonthlyAnalytics(),
          api.getAlertAnalytics(),
          api.getBudgets(),
          api.getExpenditures()
        ]);

        if (dRes.success) setDepartments(dRes.departments);
        if (mRes.success) setMonthly(mRes.monthly);
        if (aRes.success) setAlertsSummary(aRes);
        if (bRes.success) setBudgets(bRes.budgets);
        if (eRes.success) setExpenditures(eRes.expenditures);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Category breakdown calculation
  const categoryMap: { [cat: string]: number } = {};
  expenditures.forEach((e) => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
  });
  const categoryList = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
  const totalCategorySpend = categoryList.reduce((s, [, amt]) => s + amt, 0) || 1;

  // CSV Export functions
  const exportCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const rows = data.map((obj) =>
      headers
        .map((h) => {
          let val = obj[h];
          if (val === null || val === undefined) return '""';
          if (typeof val === 'object') val = JSON.stringify(val);
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportBudgetCSV = () => {
    const flat = budgets.map((b) => ({
      ID: b._id,
      Scheme: b.scheme,
      Department: b.department?.name || '',
      Code: b.department?.code || '',
      FinancialYear: b.financialYear,
      AllocatedAmount: b.allocatedAmount,
      TotalSpent: b.totalSpent || 0,
      RemainingAmount: b.remainingAmount || 0,
      UtilizationPercentage: b.utilizationPercentage || 0,
      Status: b.status,
      StartDate: b.startDate,
      EndDate: b.endDate
    }));
    exportCSV(flat, 'govbudget-schemes-ledger');
  };

  const exportExpenditureCSV = () => {
    const flat = expenditures.map((e) => ({
      VoucherID: e._id,
      Date: e.transactionDate,
      Scheme: e.budget?.scheme || '',
      Department: e.department?.name || '',
      Category: e.category,
      AmountINR: e.amount,
      Narration: e.description,
      DocumentAttached: Boolean(e.supportingDocumentUrl)
    }));
    exportCSV(flat, 'govbudget-expenditure-vouchers');
  };

  // Professional PDF Export using jsPDF
  const exportPDFReport = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    let y = 18;

    // Header
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text('GovBudget AI — Institutional Financial Audit Report', 14, y);

    y += 7;
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`Generated on: ${new Date().toLocaleString('en-IN')} | Financial Year 2025-26`, 14, y);

    y += 5;
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.line(14, y, 196, y);

    y += 8;
    // Executive Metrics Summary
    doc.setFontSize(13);
    doc.setTextColor(30, 41, 59);
    doc.text('1. Executive Fiscal Summary', 14, y);

    y += 7;
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    const totalAlloc = budgets.reduce((s, b) => s + b.allocatedAmount, 0);
    const totalSpent = expenditures.reduce((s, e) => s + e.amount, 0);
    const utilPct = totalAlloc > 0 ? ((totalSpent / totalAlloc) * 100).toFixed(1) : '0';

    doc.text(`• Total Approved Allocation: ${formatCroreLakh(totalAlloc)}`, 16, y);
    y += 5;
    doc.text(`• Total Disbursed Vouchers: ${formatCroreLakh(totalSpent)}`, 16, y);
    y += 5;
    doc.text(`• Treasury Uncommitted Balance: ${formatCroreLakh(totalAlloc - totalSpent)}`, 16, y);
    y += 5;
    doc.text(`• Overall Utilization Rate: ${utilPct}%`, 16, y);

    y += 10;
    // Departmental Scrutiny Table
    doc.setFontSize(13);
    doc.setTextColor(30, 41, 59);
    doc.text('2. Departmental Allocation Scrutiny Ledger', 14, y);

    y += 7;
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text('Department', 14, y);
    doc.text('Code', 75, y);
    doc.text('Allocated', 100, y);
    doc.text('Disbursed', 135, y);
    doc.text('Utilization', 170, y);

    y += 2;
    doc.line(14, y, 196, y);
    y += 5;

    departments.forEach((dept) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(dept.name.substring(0, 32), 14, y);
      doc.text(dept.code, 75, y);
      doc.text(formatCroreLakh(dept.allocated), 100, y);
      doc.text(formatCroreLakh(dept.spent), 135, y);
      doc.text(`${dept.utilization}%`, 170, y);
      y += 6;
    });

    y += 6;
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    // Statutory Signoff
    doc.setDrawColor(203, 213, 225);
    doc.line(14, y, 196, y);
    y += 8;
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Official statutory document generated for internal governance evaluation. Verified under deterministic anomaly rules.',
      14,
      y
    );

    doc.save(`govbudget-audit-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportAIForecastPDF = async () => {
    try {
      setIsExportingAIPDF(true);
      const res = await api.getConsolidatedAIBudgetForecast();
      if (res.success && res.consolidated && res.forecasts) {
        exportConsolidatedForecastsPDF(res.consolidated, res.forecasts);
      }
    } catch (err) {
      console.error('Failed to export AI budget forecasts PDF:', err);
    } finally {
      setIsExportingAIPDF(false);
    }
  };

  const maxDeptAlloc = Math.max(...(departments.map((d) => d.allocated) || [1]), 1);

  return (
    <div className="space-y-6">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>📈</span> Institutional Analytics &amp; Statutory Reports
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cross-departmental budget reconciliation, category velocity, and audit downloads
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportAIForecastPDF}
            disabled={isExportingAIPDF}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition"
            title="Export AI-generated predictive budget forecast summary PDF"
          >
            <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${isExportingAIPDF ? 'animate-spin' : ''}`} />
            {isExportingAIPDF ? 'Exporting AI Forecast...' : 'Export AI Forecasts PDF'}
          </button>
          <button
            onClick={exportBudgetCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> Export Schemes CSV
          </button>
          <button
            onClick={exportExpenditureCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" /> Export Vouchers CSV
          </button>
          <button
            onClick={exportPDFReport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition"
          >
            <Printer className="w-3.5 h-3.5" /> Download Official Audit PDF
          </button>
        </div>
      </div>

      {/* Grid: Department Comparison & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Allocation vs Spend (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Departmental Allocation vs Disbursed Comparison
              </h3>
              <p className="text-[11px] text-slate-400">
                Visualizing fiscal headroom across ministerial portfolios
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span> Allocated
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Disbursed
              </span>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {departments.map((dept) => {
              const allocWidth = Math.max((dept.allocated / maxDeptAlloc) * 100, 4);
              const spentWidth = Math.max((dept.spent / maxDeptAlloc) * 100, 2);
              const isOver = dept.utilization > 100;

              return (
                <div key={dept.departmentId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">
                      {dept.name} ({dept.code})
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      Disbursed: <strong className="text-white">{formatCroreLakh(dept.spent)}</strong> of{' '}
                      {formatCroreLakh(dept.allocated)} ({dept.utilization}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-950 rounded-full h-3 relative overflow-hidden border border-slate-800">
                    {/* Allocated base bar */}
                    <div
                      className="absolute top-0 left-0 h-full bg-slate-700/60 rounded-full"
                      style={{ width: `${allocWidth}%` }}
                    ></div>
                    {/* Spent bar */}
                    <div
                      className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
                        isOver ? 'bg-red-500' : dept.utilization > 85 ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(spentWidth, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown (1 col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Expenditure by Economic Category
            </h3>
            <p className="text-[11px] text-slate-400">Capital vs Operational Distribution</p>
          </div>

          <div className="space-y-3 pt-2">
            {categoryList.map(([cat, amt]) => {
              const pct = Math.round((amt / totalCategorySpend) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-300">{cat}</span>
                    <span className="font-mono font-bold text-slate-200">
                      {formatCroreLakh(amt)} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Anomaly Frequency Distribution */}
      {alertsSummary && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Anomaly Alert Incidence Distribution
            </h3>
            <p className="text-[11px] text-slate-400">
              Breakdown of triggered irregularities across statutory rules
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400">Overspending Breaches</span>
              <p className="text-2xl font-bold text-red-400 font-mono mt-1">
                {alertsSummary.byType?.OVERSPENDING || 0}
              </p>
              <span className="text-[10px] text-red-500 font-medium">Critical Ceiling Violation</span>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400">Under-Utilization Warnings</span>
              <p className="text-2xl font-bold text-sky-400 font-mono mt-1">
                {alertsSummary.byType?.UNDER_UTILIZATION || 0}
              </p>
              <span className="text-[10px] text-sky-500 font-medium">Lapse Risk Bottlenecks</span>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400">Spending Spikes</span>
              <p className="text-2xl font-bold text-purple-400 font-mono mt-1">
                {alertsSummary.byType?.SPENDING_SPIKE || 0}
              </p>
              <span className="text-[10px] text-purple-500 font-medium">Statistical Outliers</span>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400">Exhaustion Warnings</span>
              <p className="text-2xl font-bold text-amber-400 font-mono mt-1">
                {alertsSummary.byType?.THRESHOLD_DEVIATION || 0}
              </p>
              <span className="text-[10px] text-amber-500 font-medium">Near-Cap Stages</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
