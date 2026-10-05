import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  TrendingUp,
  BarChart3,
  GitCompare,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Calendar,
  Building2,
  Activity,
  Flame,
  CheckCircle2,
  Info
} from 'lucide-react';
import { MonthlySpendingTrend, DepartmentYoY, SpendingAnalyticsSummary } from '../../types';
import { formatCroreLakh } from '../../utils/formatters';

interface BudgetTrendsChartProps {
  monthlyData: MonthlySpendingTrend[];
  departmentYoY?: DepartmentYoY[];
  summary?: SpendingAnalyticsSummary;
  financialYearCurrent?: string;
  financialYearPrevious?: string;
  isLoading?: boolean;
}

type ChartTab = 'TRENDS' | 'YOY_MONTHLY' | 'CUMULATIVE' | 'DEPT_YOY';

export const BudgetTrendsChart: React.FC<BudgetTrendsChartProps> = ({
  monthlyData = [],
  departmentYoY = [],
  summary,
  financialYearCurrent = 'FY 2025–26',
  financialYearPrevious = 'FY 2024–25',
  isLoading = false
}) => {
  const [activeTab, setActiveTab] = useState<ChartTab>('TRENDS');
  const [selectedQuarter, setSelectedQuarter] = useState<string>('ALL');

  // Filter data by quarter if selected
  const filteredData = selectedQuarter === 'ALL'
    ? monthlyData
    : monthlyData.filter(d => d.quarter === selectedQuarter);

  // Derive metrics if summary not provided
  const currentTotal = summary?.currentTotal ?? monthlyData.reduce((acc, m) => acc + (m.currentFY || m.amount || 0), 0);
  const previousTotal = summary?.previousTotal ?? monthlyData.reduce((acc, m) => acc + (m.previousFY || 0), 0);
  const growthRate = summary?.growthPercentage ?? (previousTotal > 0
    ? Math.round(((currentTotal - previousTotal) / previousTotal) * 1000) / 10
    : 0);

  // Find peak months
  const peakCurrentMonth = monthlyData.reduce((prev, curr) =>
    (curr.currentFY || curr.amount || 0) > (prev.currentFY || prev.amount || 0) ? curr : prev,
    monthlyData[0] || { month: 'N/A', currentFY: 0, amount: 0 }
  );

  // Custom Tooltip for Recharts
  const CustomSpendingTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload as MonthlySpendingTrend;
      const current = dataPoint.currentFY ?? dataPoint.amount ?? 0;
      const previous = dataPoint.previousFY ?? 0;
      const variance = current - previous;
      const growth = dataPoint.yoyGrowthPct ?? 0;

      return (
        <div className="bg-slate-900/95 border border-slate-700 rounded-lg p-3.5 shadow-2xl backdrop-blur-md text-xs z-50 min-w-[210px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <span className="font-bold text-white tracking-wide flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              {label} ({dataPoint.quarter || 'Fiscal'})
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              growth > 0
                ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
            }`}>
              {growth > 0 ? `+${growth}%` : `${growth}%`} YoY
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block"></span>
                {financialYearCurrent}:
              </span>
              <span className="font-mono font-bold text-white">
                {formatCroreLakh(current)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-400/60 inline-block"></span>
                {financialYearPrevious}:
              </span>
              <span className="font-mono text-slate-300">
                {formatCroreLakh(previous)}
              </span>
            </div>

            <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between font-mono">
              <span className="text-slate-400">Net YoY Delta:</span>
              <span className={`font-semibold ${variance >= 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {variance >= 0 ? `+${formatCroreLakh(variance)}` : formatCroreLakh(variance)}
              </span>
            </div>

            {dataPoint.cumulativeCurrentFY !== undefined && (
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Cumulative YTD:</span>
                <span className="font-mono text-emerald-400 font-medium">
                  {formatCroreLakh(dataPoint.cumulativeCurrentFY)}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Department Tooltip
  const CustomDeptTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload as DepartmentYoY;
      return (
        <div className="bg-slate-900/95 border border-slate-700 rounded-lg p-3.5 shadow-2xl backdrop-blur-md text-xs z-50 min-w-[220px]">
          <div className="font-bold text-white border-b border-slate-800 pb-2 mb-2">
            {dataPoint.name} ({dataPoint.code})
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Current FY Spend:</span>
              <span className="font-mono font-bold text-blue-400">{formatCroreLakh(dataPoint.currentFY)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Prior FY Spend:</span>
              <span className="font-mono text-slate-300">{formatCroreLakh(dataPoint.previousFY)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Current Allocation:</span>
              <span className="font-mono text-slate-200">{formatCroreLakh(dataPoint.allocated)}</span>
            </div>
            <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">YoY Growth:</span>
              <span className={`font-mono font-bold ${dataPoint.growthPercentage >= 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {dataPoint.growthPercentage >= 0 ? `+${dataPoint.growthPercentage}%` : `${dataPoint.growthPercentage}%`}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center min-h-[360px]">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs text-slate-400">Rendering Financial Analytics with Recharts...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-5">
      {/* Header with Title and Mode Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Real-Time Fiscal Spending Velocity &amp; Year-over-Year (YoY) Analysis
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
            <span>Synchronized with Treasury Ledger:</span>
            <span className="text-blue-400 font-semibold">{financialYearCurrent}</span>
            <span>vs</span>
            <span className="text-slate-300 font-semibold">{financialYearPrevious}</span>
            <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 text-[10px]">
              Live Recharts Engine
            </span>
          </p>
        </div>

        {/* View Selection Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quarter filter */}
          <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/80 text-[11px]">
            {['ALL', 'Q1', 'Q2', 'Q3', 'Q4'].map((q) => (
              <button
                key={q}
                onClick={() => setSelectedQuarter(q)}
                className={`px-2 py-1 rounded-md font-medium transition-all ${
                  selectedQuarter === q
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/80 text-[11px]">
            <button
              onClick={() => setActiveTab('TRENDS')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
                activeTab === 'TRENDS'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="View Monthly Spending Velocity & Benchmark Run-Rate"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Spending Velocity</span>
            </button>

            <button
              onClick={() => setActiveTab('YOY_MONTHLY')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
                activeTab === 'YOY_MONTHLY'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Compare Monthly Expenditures FY 2025-26 vs FY 2024-25"
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>YoY Monthly</span>
            </button>

            <button
              onClick={() => setActiveTab('CUMULATIVE')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
                activeTab === 'CUMULATIVE'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Analyze Cumulative Trajectory & Budget Depletion Path"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Cumulative Trajectory</span>
            </button>

            {departmentYoY.length > 0 && (
              <button
                onClick={() => setActiveTab('DEPT_YOY')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
                  activeTab === 'DEPT_YOY'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Departmental Year-over-Year Comparative Outlay"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Department YoY</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Real-time KPI Metric Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-lg p-3">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-semibold">
            <span>{financialYearCurrent} YTD Disbursed</span>
            <Activity className="w-3 h-3 text-blue-400" />
          </div>
          <div className="text-base sm:text-lg font-bold text-white font-mono mt-1">
            {formatCroreLakh(currentTotal)}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Verified voucher disbursements
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/60 rounded-lg p-3">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-semibold">
            <span>{financialYearPrevious} Baseline</span>
            <Calendar className="w-3 h-3 text-indigo-400" />
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-200 font-mono mt-1">
            {formatCroreLakh(previousTotal)}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Audited prior fiscal year
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/60 rounded-lg p-3">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-semibold">
            <span>YoY Expenditure Shift</span>
            {growthRate >= 0 ? (
              <ArrowUpRight className="w-3 h-3 text-amber-400" />
            ) : (
              <ArrowDownRight className="w-3 h-3 text-emerald-400" />
            )}
          </div>
          <div className={`text-base sm:text-lg font-bold font-mono mt-1 ${
            growthRate >= 0 ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {growthRate >= 0 ? `+${growthRate}%` : `${growthRate}%`}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {growthRate >= 0 ? 'Acceleration over prior fiscal' : 'Fiscal contraction / savings'}
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/60 rounded-lg p-3">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-semibold">
            <span>Peak Disbursement Month</span>
            <Flame className="w-3 h-3 text-orange-400" />
          </div>
          <div className="text-base sm:text-lg font-bold text-orange-300 font-mono mt-1 flex items-baseline gap-1.5">
            <span>{peakCurrentMonth.month}</span>
            <span className="text-xs text-slate-400 font-normal">
              ({formatCroreLakh(peakCurrentMonth.currentFY || peakCurrentMonth.amount || 0)})
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Highest monthly capital liquidation
          </p>
        </div>
      </div>

      {/* Chart Canvas Container */}
      <div className="w-full h-[340px] pt-2">
        {activeTab === 'TRENDS' && (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={filteredData}
              margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
            >
              <defs>
                <linearGradient id="currentFYGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.4} />
                </linearGradient>
                <linearGradient id="cumulativeAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                tickLine={false}
                tickFormatter={(val) => formatCroreLakh(val).replace('₹', '')}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#10b981"
                tick={{ fill: '#34d399', fontSize: 10 }}
                tickLine={false}
                tickFormatter={(val) => formatCroreLakh(val).replace('₹', '')}
              />
              <Tooltip content={<CustomSpendingTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }}
                iconType="circle"
              />
              <Bar
                yAxisId="left"
                dataKey="currentFY"
                name={`${financialYearCurrent} Monthly Spend`}
                fill="url(#currentFYGradient)"
                radius={[4, 4, 0, 0]}
                barSize={24}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="previousFY"
                name={`${financialYearPrevious} Monthly Spend`}
                stroke="#a855f7"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: '#a855f7' }}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="cumulativeCurrentFY"
                name="Cumulative YTD Trajectory"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#cumulativeAreaGradient)"
              />
              {filteredData[0]?.monthlyBenchmark > 0 && (
                <ReferenceLine
                  yAxisId="left"
                  y={filteredData[0].monthlyBenchmark}
                  label={{
                    value: `Linear Run-Rate Pace: ${formatCroreLakh(filteredData[0].monthlyBenchmark)}`,
                    fill: '#f59e0b',
                    fontSize: 10,
                    position: 'top'
                  }}
                  stroke="#f59e0b"
                  strokeDasharray="5 5"
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'YOY_MONTHLY' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredData}
              margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
            >
              <defs>
                <linearGradient id="yoyCurrentBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="yoyPrevBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity={0.85} />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.65} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={false}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                tickLine={false}
                tickFormatter={(val) => formatCroreLakh(val).replace('₹', '')}
              />
              <Tooltip content={<CustomSpendingTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
              <Bar
                dataKey="previousFY"
                name={`${financialYearPrevious} Baseline`}
                fill="url(#yoyPrevBar)"
                radius={[4, 4, 0, 0]}
                barSize={18}
              />
              <Bar
                dataKey="currentFY"
                name={`${financialYearCurrent} Spend`}
                fill="url(#yoyCurrentBar)"
                radius={[4, 4, 0, 0]}
                barSize={18}
              />
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'CUMULATIVE' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={filteredData}
              margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
            >
              <defs>
                <linearGradient id="cumCurrentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="cumPrevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={false}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                tickLine={false}
                tickFormatter={(val) => formatCroreLakh(val).replace('₹', '')}
              />
              <Tooltip content={<CustomSpendingTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
              <Area
                type="monotone"
                dataKey="cumulativePreviousFY"
                name={`${financialYearPrevious} Cumulative Trajectory`}
                stroke="#a78bfa"
                strokeWidth={2}
                strokeDasharray="4 4"
                fill="url(#cumPrevGrad)"
              />
              <Area
                type="monotone"
                dataKey="cumulativeCurrentFY"
                name={`${financialYearCurrent} Cumulative Outlay`}
                stroke="#38bdf8"
                strokeWidth={2.5}
                fill="url(#cumCurrentGrad)"
              />
              <Line
                type="monotone"
                dataKey="targetBenchmark"
                name="Planned Linear Benchmark"
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'DEPT_YOY' && departmentYoY.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={departmentYoY}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 40, bottom: 20 }}
            >
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                tickLine={false}
                tickFormatter={(val) => formatCroreLakh(val).replace('₹', '')}
              />
              <YAxis
                type="category"
                dataKey="code"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={false}
              />
              <Tooltip content={<CustomDeptTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
              <Bar
                dataKey="previousFY"
                name={`${financialYearPrevious} Disbursed`}
                fill="#818cf8"
                radius={[0, 4, 4, 0]}
                barSize={12}
              />
              <Bar
                dataKey="currentFY"
                name={`${financialYearCurrent} Disbursed`}
                fill="#38bdf8"
                radius={[0, 4, 4, 0]}
                barSize={12}
              />
              <Bar
                dataKey="allocated"
                name="Sanctioned Allocation"
                fill="#334155"
                radius={[0, 4, 4, 0]}
                barSize={12}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Analytical Footer Note & Interpretation */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>
            Real-time variance is recalculated continuously as department vouchers are recorded and cleared.
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span> Current FY
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span> Prior Year Baseline
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Cumulative Run-Rate
          </span>
        </div>
      </div>
    </div>
  );
};
