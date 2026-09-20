import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { Threshold, User } from '../../types';
import {
  ScanEye,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Activity,
  Zap,
  Info,
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';

interface AnomalyViewProps {
  currentUser: User | null;
  onNavigateToAlerts: () => void;
}

export const AnomalyView: React.FC<AnomalyViewProps> = ({ currentUser, onNavigateToAlerts }) => {
  const [thresholds, setThresholds] = useState<Threshold | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ scannedBudgets: number; totalNewAlerts: number } | null>(
    null
  );
  const [activeAlertStats, setActiveAlertStats] = useState<any>(null);

  const fetchThresholds = async () => {
    try {
      const [tRes, aRes] = await Promise.all([
        api.getThresholds(),
        api.getAlertAnalytics()
      ]);
      if (tRes.success) setThresholds(tRes.threshold);
      if (aRes.success) setActiveAlertStats(aRes);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchThresholds();
  }, []);

  const handleRunScan = async () => {
    try {
      setIsScanning(true);
      const res = await api.scanAnomalies();
      if (res.success) {
        setScanResult({
          scannedBudgets: res.scannedBudgets,
          totalNewAlerts: res.totalNewAlerts
        });
        fetchThresholds();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>🔍</span> Deterministic Anomaly Detection Engine
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time mathematical and rule-based verification of public fund flows
          </p>
        </div>

        <button
          onClick={handleRunScan}
          disabled={isScanning}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
          {isScanning ? 'Executing Rules Scan...' : 'Trigger Global Rules Scan'}
        </button>
      </div>

      {/* Scan Feedback Banner */}
      {scanResult && (
        <div className="p-4 bg-blue-950/40 border border-blue-800 rounded-xl flex items-center justify-between text-xs text-blue-200">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <p className="font-semibold text-white">Full Anomaly Audit Completed</p>
              <p className="text-slate-300">
                Audited {scanResult.scannedBudgets} active schemes against 5 deterministic financial rules.
                Generated {scanResult.totalNewAlerts} new unreviewed alerts.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToAlerts}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shrink-0"
          >
            Review Alerts &rarr;
          </button>
        </div>
      )}

      {/* Rules Engine Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Rule 1: Under-utilization */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-xs">
                R1
              </div>
              <h3 className="text-sm font-bold text-white">Under-Utilization Detection</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-950 text-sky-300 border border-sky-800">
              MEDIUM SEVERITY
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Flags delayed schemes where the fiscal timeline has elapsed significantly without proportional
            expenditure, indicating bureaucratic bottlenecks or impending fund lapses.
          </p>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono space-y-1 text-slate-400">
            <p className="text-blue-300 font-semibold">Mathematical Condition:</p>
            <p>Time Elapsed &gt; {thresholds?.timeElapsedPercentage || 50}%</p>
            <p>AND Utilization &lt; {thresholds?.underUtilizationPercentage || 30}%</p>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
            <span className="text-slate-400">Current Triggered Alerts:</span>
            <span className="font-bold text-sky-400 font-mono">
              {activeAlertStats?.byType?.UNDER_UTILIZATION || 0} active
            </span>
          </div>
        </div>

        {/* Rule 2: Overspending */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center font-bold text-xs">
                R2
              </div>
              <h3 className="text-sm font-bold text-white">Overspending &amp; Ceiling Breach</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-800">
              CRITICAL SEVERITY
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Instantaneous critical freeze trigger when total cumulative disbursed vouchers exceed 100% of
            approved legislative budget allocation.
          </p>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono space-y-1 text-slate-400">
            <p className="text-red-400 font-semibold">Mathematical Condition:</p>
            <p>Total Disbursed &gt; Approved Allocation</p>
            <p>Remaining Amount &lt; 0 (Deficit)</p>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
            <span className="text-slate-400">Current Triggered Alerts:</span>
            <span className="font-bold text-red-400 font-mono">
              {activeAlertStats?.byType?.OVERSPENDING || 0} critical
            </span>
          </div>
        </div>

        {/* Rule 3: Threshold Exceedance */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
                R3
              </div>
              <h3 className="text-sm font-bold text-white">Utilization Threshold Warning</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
              HIGH SEVERITY
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Proactive warning stages triggered as schemes approach ceiling exhaustion, allowing finance officers
            to submit supplementary grant requests before operations stall.
          </p>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono space-y-1 text-slate-400">
            <p className="text-amber-400 font-semibold">Mathematical Condition:</p>
            <p>Warning Tier: Utilization &gt;= {thresholds?.warningUtilizationPercentage || 85}%</p>
            <p>Critical Exhaustion Tier: Utilization &gt;= {thresholds?.criticalUtilizationPercentage || 95}%</p>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
            <span className="text-slate-400">Current Triggered Alerts:</span>
            <span className="font-bold text-amber-400 font-mono">
              {activeAlertStats?.byType?.THRESHOLD_DEVIATION || 0} active
            </span>
          </div>
        </div>

        {/* Rule 4: Spending Spikes */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-xs">
                R4
              </div>
              <h3 className="text-sm font-bold text-white">Spending Spike Anomaly</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
              HIGH SEVERITY
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Flags single transactions that exhibit a sudden statistical surge compared to the moving average of
            prior vouchers for that scheme, detecting potential procurement irregularities or rush payments.
          </p>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono space-y-1 text-slate-400">
            <p className="text-purple-300 font-semibold">Mathematical Condition:</p>
            <p>Voucher Amount &gt; (Historical Moving Avg * {1 + (thresholds?.spendingSpikePercentage || 40) / 100})</p>
            <p>AND Voucher Amount &gt; 15% of Scheme Allocation</p>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
            <span className="text-slate-400">Current Triggered Alerts:</span>
            <span className="font-bold text-purple-400 font-mono">
              {activeAlertStats?.byType?.SPENDING_SPIKE || 0} active
            </span>
          </div>
        </div>
      </div>

      {/* Institutional Scrutiny Notice */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-start gap-3 text-xs text-slate-400">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-200">Statutory Audit Alignment: </span>
          The deterministic rules adhere strictly to the guidelines established by the Comptroller and Auditor
          General of India (CAG) for scheme expenditure scrutiny. Alerts do not constitute financial guilt;
          they mandate administrative review and documented explanation.
        </div>
      </div>
    </div>
  );
};
