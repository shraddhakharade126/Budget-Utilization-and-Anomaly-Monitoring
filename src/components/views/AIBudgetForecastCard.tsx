import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { Budget, BudgetForecastOutput, ConsolidatedForecastSummary } from '../../types';
import { formatCroreLakh } from '../../utils/formatters';
import {
  exportSingleForecastPDF,
  exportConsolidatedForecastsPDF
} from '../../utils/pdfForecastExport';
import {
  TrendingUp,
  Sparkles,
  Printer,
  FileDown,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Sliders,
  Check
} from 'lucide-react';

interface AIBudgetForecastCardProps {
  budgets: Budget[];
  selectedBudgetId: string;
  onSelectBudgetId: (id: string) => void;
}

export const AIBudgetForecastCard: React.FC<AIBudgetForecastCardProps> = ({
  budgets,
  selectedBudgetId,
  onSelectBudgetId
}) => {
  const [forecast, setForecast] = useState<BudgetForecastOutput | null>(null);
  const [consolidatedData, setConsolidatedData] = useState<{
    consolidated: ConsolidatedForecastSummary;
    forecasts: BudgetForecastOutput[];
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isExportingSingle, setIsExportingSingle] = useState(false);
  const [isExportingConsolidated, setIsExportingConsolidated] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch forecast for selected budget
  const loadForecast = async (budgetId: string) => {
    if (!budgetId) return;
    try {
      setIsLoading(true);
      setError('');
      const res = await api.getAIBudgetForecast(budgetId);
      if (res.success && res.forecast) {
        setForecast(res.forecast);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate predictive budget forecast.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBudgetId) {
      loadForecast(selectedBudgetId);
    }
  }, [selectedBudgetId]);

  const handleGenerateForecast = () => {
    if (selectedBudgetId) {
      loadForecast(selectedBudgetId);
    }
  };

  const handleExportSinglePDF = () => {
    if (!forecast) return;
    try {
      setIsExportingSingle(true);
      const filename = exportSingleForecastPDF(forecast);
      setSuccessMessage(`Forecast PDF downloaded successfully: ${filename}`);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err: any) {
      setError(`PDF generation failed: ${err.message}`);
    } finally {
      setIsExportingSingle(false);
    }
  };

  const handleExportConsolidatedPDF = async () => {
    try {
      setIsExportingConsolidated(true);
      let data = consolidatedData;
      if (!data) {
        const res = await api.getConsolidatedAIBudgetForecast();
        if (res.success && res.consolidated && res.forecasts) {
          data = { consolidated: res.consolidated, forecasts: res.forecasts };
          setConsolidatedData(data);
        }
      }
      if (data) {
        const filename = exportConsolidatedForecastsPDF(data.consolidated, data.forecasts);
        setSuccessMessage(`Consolidated Portfolio PDF downloaded: ${filename}`);
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (err: any) {
      setError(`Consolidated export failed: ${err.message}`);
    } finally {
      setIsExportingConsolidated(false);
    }
  };

  const selectedBudget = budgets.find((b) => b._id === selectedBudgetId);

  // Status visual mapping
  const getStatusBadge = (status?: BudgetForecastOutput['forecastedStatus']) => {
    switch (status) {
      case 'ON_TRACK':
        return {
          label: 'OPTIMAL UTILIZATION TRAJECTORY',
          desc: 'Scheme spending is in balanced alignment with planned quarterly appropriations.',
          badgeBg: 'bg-emerald-950/80 border-emerald-800/80 text-emerald-300',
          indicator: 'bg-emerald-400'
        };
      case 'PROJECTED_SURPLUS':
        return {
          label: 'FUND LAPSE HAZARD (UNDER-UTILIZATION)',
          desc: 'Sluggish billing indicates anticipated surplus funds at risk of lapsing on March 31.',
          badgeBg: 'bg-amber-950/80 border-amber-800/80 text-amber-300',
          indicator: 'bg-amber-400'
        };
      case 'PROJECTED_DEFICIT':
        return {
          label: 'APPROPRIATION DEFICIT WARNING',
          desc: 'Current run-rate projects expenditure exceeding approved legislative grants.',
          badgeBg: 'bg-orange-950/80 border-orange-800/80 text-orange-300',
          indicator: 'bg-orange-400'
        };
      case 'SEVERE_BREACH':
      default:
        return {
          label: 'CRITICAL CEILING BREACH',
          desc: 'High expenditure spike exceeds fiscal safety margin; immediate freeze required.',
          badgeBg: 'bg-red-950/80 border-red-800/80 text-red-300',
          indicator: 'bg-red-500'
        };
    }
  };

  const statusBadge = getStatusBadge(forecast?.forecastedStatus);

  return (
    <div className="space-y-6">
      {/* Selector & Actions Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              AI-Generated Budget Forecast &amp; Predictive Expenditure Outlay
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Powered by <code className="text-emerald-300 font-mono">gemini-3.8-flash</code> &bull;
              Automated fiscal year-end projections with official statutory PDF export
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportConsolidatedPDF}
              disabled={isExportingConsolidated}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 border border-slate-700 text-xs font-medium transition"
              title="Export all departmental schemes to a consolidated portfolio PDF summary"
            >
              <Layers className={`w-3.5 h-3.5 text-indigo-400 ${isExportingConsolidated ? 'animate-spin' : ''}`} />
              {isExportingConsolidated ? 'Exporting...' : 'Export Portfolio PDF'}
            </button>
            <button
              onClick={handleExportSinglePDF}
              disabled={!forecast || isExportingSingle}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition"
              title="Download official PDF summary file for reporting purposes"
            >
              <Printer className={`w-3.5 h-3.5 ${isExportingSingle ? 'animate-spin' : ''}`} />
              {isExportingSingle ? 'Exporting PDF...' : 'Export Forecast PDF'}
            </button>
          </div>
        </div>

        {/* Scheme Selector */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="md:col-span-3">
            <label className="block text-slate-300 font-medium mb-1 flex items-center gap-1.5">
              <Sliders className="w-3 h-3 text-slate-400" /> Select Budget Scheme for AI Forecasting
            </label>
            <select
              value={selectedBudgetId}
              onChange={(e) => onSelectBudgetId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {budgets.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.scheme} ({b.department?.code || 'DEPT'}) &bull; Allocated:{' '}
                  {formatCroreLakh(b.allocatedAmount)} | Spent: {b.utilizationPercentage || 0}%
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGenerateForecast}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition"
            >
              <Sparkles className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Forecasting...' : 'Re-Run AI Forecast'}
            </button>
          </div>
        </div>

        {/* Selected Scheme Quick Stats */}
        {selectedBudget && (
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-400">Department:</span>{' '}
              <span className="text-white font-semibold">{selectedBudget.department?.name}</span>
            </div>
            <div>
              <span className="text-slate-400">Fiscal Year:</span>{' '}
              <span className="text-indigo-300 font-mono font-medium">
                {selectedBudget.financialYear || '2025-26'}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Approved Ceiling:</span>{' '}
              <span className="text-white font-mono font-semibold">
                {formatCroreLakh(selectedBudget.allocatedAmount)}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Current Disbursed:</span>{' '}
              <span className="text-indigo-300 font-mono font-semibold">
                {formatCroreLakh(selectedBudget.totalSpent || 0)} ({selectedBudget.utilizationPercentage || 0}%)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-950/70 border border-emerald-700/80 rounded-xl text-xs text-emerald-200 flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded">
            PDF Ready
          </span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-950/60 border border-red-800 rounded-xl text-xs text-red-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Forecast Content Area */}
      {forecast && (
        <div className="space-y-6">
          {/* Key Metric Telemetry Grid (4 Metrics) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: Approved Grant */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Approved Legislative Grant
              </span>
              <p className="text-xl font-bold text-white font-mono">
                {formatCroreLakh(forecast.allocatedAmount)}
              </p>
              <p className="text-[11px] text-slate-500">Fixed Statutory Appropriation</p>
            </div>

            {/* Metric 2: Current Disbursed */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Current Disbursed To Date
              </span>
              <p className="text-xl font-bold text-indigo-400 font-mono">
                {formatCroreLakh(forecast.currentDisbursed)}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Utilization Rate:</span>
                <span className="font-semibold text-white">{forecast.currentUtilizationPercentage}%</span>
              </div>
            </div>

            {/* Metric 3: Projected Year-End Spend */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Projected Year-End Outlay
              </span>
              <p
                className={`text-xl font-bold font-mono ${
                  forecast.projectedUtilizationPercentage > 100
                    ? 'text-red-400'
                    : forecast.projectedUtilizationPercentage < 75
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {formatCroreLakh(forecast.projectedYearEndSpend)}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Expected Util:</span>
                <span className="font-semibold text-white">
                  {forecast.projectedUtilizationPercentage}%
                </span>
              </div>
            </div>

            {/* Metric 4: Projected Net Variance */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Forecasted Net Variance
              </span>
              <p
                className={`text-xl font-bold font-mono flex items-center gap-1 ${
                  forecast.projectedVariance >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {forecast.projectedVariance >= 0 ? (
                  <ArrowDownRight className="w-5 h-5 text-emerald-400" />
                ) : (
                  <ArrowUpRight className="w-5 h-5 text-red-400" />
                )}
                {formatCroreLakh(forecast.projectedVariance)}
              </p>
              <p className="text-[11px] text-slate-400">
                {forecast.projectedVariance >= 0 ? 'Surplus (Lapse Risk)' : 'Estimated Deficit'}
              </p>
            </div>
          </div>

          {/* Burn Rate & Velocity Details Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400">Monthly Burn Velocity</span>
                <p className="text-sm font-bold text-white font-mono mt-0.5">
                  {formatCroreLakh(forecast.burnRatePerMonth)} / mo
                </p>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  forecast.burnRateVelocity === 'CRITICAL_SPIKE'
                    ? 'bg-red-950 text-red-300 border border-red-800'
                    : forecast.burnRateVelocity === 'ACCELERATING'
                    ? 'bg-blue-950 text-blue-300 border border-blue-800'
                    : forecast.burnRateVelocity === 'DECELERATING'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}
              >
                {forecast.burnRateVelocity}
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400">Model Confidence</span>
                <p className="text-sm font-bold text-indigo-300 font-mono mt-0.5">
                  {forecast.confidenceScore}% Reliability
                </p>
              </div>
              <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-1 rounded">
                Verified Engine
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400">Elapsed Fiscal Time</span>
                <p className="text-sm font-bold text-white font-mono mt-0.5">
                  {forecast.elapsedMonths} of 12 Months
                </p>
              </div>
              <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-1 rounded">
                FY 2025-26
              </span>
            </div>
          </div>

          {/* Classification Status Banner */}
          <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${statusBadge.badgeBg}`}>
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${statusBadge.indicator} animate-pulse shrink-0`} />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider">{statusBadge.label}</h4>
                <p className="text-xs text-slate-300 mt-0.5">{statusBadge.desc}</p>
              </div>
            </div>
            <button
              onClick={handleExportSinglePDF}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-900 border border-slate-700 text-white rounded-lg text-xs font-medium transition"
            >
              <Printer className="w-3.5 h-3.5" /> PDF Summary
            </button>
          </div>

          {/* Quarterly Trajectory Schedule */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                Quarterly Trajectory &amp; Target Milestones
              </h3>
              <span className="text-[11px] text-slate-400">Cumulative Target Outlay</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {forecast.quarterlyBreakdown.map((q, idx) => (
                <div key={idx} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{q.quarter}</span>
                    <span className="text-indigo-300 font-semibold">{q.utilizationTargetPct}% Target</span>
                  </div>

                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, q.utilizationTargetPct)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Qtr Spend:</span>
                    <span className="font-mono text-slate-300">{formatCroreLakh(q.projectedSpend)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Cumulative:</span>
                    <span className="font-mono text-indigo-300 font-semibold">
                      {formatCroreLakh(q.cumulativeSpend)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Narrative Scrutiny Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Executive Synthesis */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> AI Executive Forecast Synthesis
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {forecast.executiveForecastSummary}
              </p>
            </div>

            {/* Risk Horizon & Execution Bottlenecks */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Risk Horizon &amp; Execution Bottlenecks
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {forecast.riskHorizonAnalysis}
              </p>
            </div>
          </div>

          {/* Actionable Measures & Reallocation Proposal */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Strategic Measures for Finance Department
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {forecast.strategicRecommendations.map((rec, i) => (
                <div
                  key={i}
                  className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 flex items-start gap-2.5 text-slate-300"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{rec}</span>
                </div>
              ))}
            </div>

            {/* Fiscal Adjustment Proposal */}
            {forecast.recommendedAdjustment && (
              <div className="p-3.5 bg-indigo-950/40 border border-indigo-800/60 rounded-lg flex items-start gap-3 text-xs">
                <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-indigo-300 uppercase tracking-wider text-[11px] block">
                    Recommended Fiscal Adjustment Proposal
                  </span>
                  <p className="text-slate-200 mt-1 leading-relaxed">{forecast.recommendedAdjustment}</p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Export Action Footer */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0" />
              <span>
                {forecast.disclaimer} Calculations calibrated via {forecast.modelUsed}.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportConsolidatedPDF}
                disabled={isExportingConsolidated}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded-lg text-xs font-medium transition"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-400" /> Export All Schemes (PDF)
              </button>
              <button
                onClick={handleExportSinglePDF}
                disabled={isExportingSingle}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-md transition"
              >
                <FileDown className="w-4 h-4" /> Download Scheme Forecast (PDF)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
