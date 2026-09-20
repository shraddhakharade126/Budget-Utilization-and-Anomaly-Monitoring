import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { Alert, AlertSeverity, AlertType, AlertStatus, Department, User } from '../../types';
import { formatDate } from '../../utils/formatters';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Search,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Eye,
  FileCheck2
} from 'lucide-react';

interface AlertsViewProps {
  currentUser: User | null;
  onOpenAIWithAlert?: (budgetId: string, anomalyType: string) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  currentUser,
  onOpenAIWithAlert
}) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [severityFilter, setSeverityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Selected Alert for Details modal
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const fetchAlerts = async () => {
    try {
      setIsLoading(true);
      const [altRes, deptRes] = await Promise.all([
        api.getAlerts({
          severity: severityFilter || undefined,
          type: typeFilter || undefined,
          status: statusFilter || undefined,
          departmentId: deptFilter || undefined
        }),
        api.getDepartments()
      ]);

      if (altRes.success) setAlerts(altRes.alerts);
      if (deptRes.success) setDepartments(deptRes.departments);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [severityFilter, typeFilter, statusFilter, deptFilter, currentUser]);

  const handleReview = async (id: string) => {
    try {
      const res = await api.reviewAlert(id);
      if (res.success) {
        setAlerts((prev) =>
          prev.map((a) => (a._id === id ? { ...a, status: 'REVIEWED' } : a))
        );
        if (selectedAlert && selectedAlert._id === id) {
          setSelectedAlert((prev) => (prev ? { ...prev, status: 'REVIEWED' } : null));
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to review alert.');
    }
  };

  const handleResolve = async (id: string) => {
    try {
      const res = await api.resolveAlert(id);
      if (res.success) {
        setAlerts((prev) =>
          prev.map((a) => (a._id === id ? { ...a, status: 'RESOLVED' } : a))
        );
        if (selectedAlert && selectedAlert._id === id) {
          setSelectedAlert((prev) => (prev ? { ...prev, status: 'RESOLVED' } : null));
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to resolve alert.');
    }
  };

  const filtered = alerts.filter((a) => {
    const q = searchQuery.toLowerCase();
    return (
      a.message.toLowerCase().includes(q) ||
      a.budget?.scheme.toLowerCase().includes(q) ||
      a.department?.name.toLowerCase().includes(q) ||
      a.type.toLowerCase().includes(q)
    );
  });

  const getSeverityBadge = (s: AlertSeverity) => {
    switch (s) {
      case 'CRITICAL':
        return 'bg-red-950/70 text-red-300 border-red-800';
      case 'HIGH':
        return 'bg-amber-950/70 text-amber-300 border-amber-800';
      case 'MEDIUM':
        return 'bg-sky-950/70 text-sky-300 border-sky-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getStatusBadge = (st: AlertStatus) => {
    switch (st) {
      case 'RESOLVED':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-800';
      case 'REVIEWED':
        return 'bg-blue-950/60 text-blue-300 border-blue-800';
      default:
        return 'bg-red-950/40 text-red-400 border-red-800/80 animate-pulse';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>⚠️</span> Financial Alerts &amp; Audit Scrutiny Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Institutional oversight and administrative action log for budget irregularities
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300">
            Total Alerts: {alerts.length}
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-950/80 border border-red-800 text-red-300">
            Open: {alerts.filter((a) => a.status === 'OPEN').length}
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search alert message, scheme..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-full md:w-40 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300"
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full md:w-44 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300"
          >
            <option value="">All Anomaly Types</option>
            <option value="OVERSPENDING">Overspending</option>
            <option value="UNDER_UTILIZATION">Under-Utilization</option>
            <option value="SPENDING_SPIKE">Spending Spike</option>
            <option value="THRESHOLD_DEVIATION">Threshold Deviation</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-36 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full md:w-48 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Detected</th>
                <th className="p-3.5">Severity</th>
                <th className="p-3.5">Rule / Type</th>
                <th className="p-3.5">Department &amp; Scheme</th>
                <th className="p-3.5">Audit Observation</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">
                    No anomaly alerts matching current filter parameters.
                  </td>
                </tr>
              ) : (
                filtered.map((alt) => (
                  <tr key={alt._id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-mono text-slate-400 whitespace-nowrap">
                      {formatDate(alt.createdAt)}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getSeverityBadge(
                          alt.severity
                        )}`}
                      >
                        {alt.severity}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-medium text-white">
                      {alt.type}
                    </td>
                    <td className="p-3.5 max-w-xs">
                      <p className="font-semibold text-white truncate">
                        {alt.budget?.scheme || 'General Scheme'}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {alt.department?.name || 'Department'}
                      </p>
                    </td>
                    <td className="p-3.5 text-slate-300 max-w-sm">
                      <p className="line-clamp-2">{alt.message}</p>
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${getStatusBadge(
                          alt.status
                        )}`}
                      >
                        {alt.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Open AI Advisor */}
                        {onOpenAIWithAlert && (
                          <button
                            onClick={() => onOpenAIWithAlert(alt.budgetId, alt.type)}
                            className="p-1.5 rounded hover:bg-blue-950 text-blue-400 hover:text-blue-300"
                            title="Generate Gemini 3 Analysis"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* View Modal */}
                        <button
                          onClick={() => setSelectedAlert(alt)}
                          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                          title="View Audit Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Mark Reviewed */}
                        {alt.status === 'OPEN' && (
                          <button
                            onClick={() => handleReview(alt._id)}
                            className="p-1.5 rounded hover:bg-slate-800 text-blue-400 hover:text-blue-300"
                            title="Mark Reviewed"
                          >
                            <FileCheck2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Mark Resolved */}
                        {alt.status !== 'RESOLVED' && currentUser?.role !== 'DEPARTMENT_HEAD' && (
                          <button
                            onClick={() => handleResolve(alt._id)}
                            className="p-1.5 rounded hover:bg-emerald-950 text-emerald-400 hover:text-emerald-300"
                            title="Mark Resolved"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getSeverityBadge(
                    selectedAlert.severity
                  )}`}
                >
                  {selectedAlert.severity}
                </span>
                <h3 className="text-base font-bold text-white">{selectedAlert.type}</h3>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="text-slate-400 hover:text-white text-lg"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400">Target Scheme:</span>
                <p className="text-white font-semibold mt-0.5">
                  {selectedAlert.budget?.scheme}
                </p>
                <p className="text-slate-400 text-[11px]">
                  {selectedAlert.department?.name} ({selectedAlert.department?.code})
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <span className="text-slate-400 font-medium">Audit Finding:</span>
                <p className="text-slate-200">{selectedAlert.message}</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <span className="text-slate-400 font-medium">Underlying Cause / Logic:</span>
                <p className="text-slate-300">{selectedAlert.explanation}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                  <span className="text-slate-400 text-[11px]">Current Metric Value</span>
                  <p className="text-sm font-bold text-amber-400 font-mono mt-0.5">
                    {selectedAlert.currentValue}%
                  </p>
                </div>
                <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                  <span className="text-slate-400 text-[11px]">Statutory Threshold</span>
                  <p className="text-sm font-bold text-slate-300 font-mono mt-0.5">
                    {selectedAlert.thresholdValue}%
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center justify-between border-t border-slate-800">
              {onOpenAIWithAlert && (
                <button
                  onClick={() => {
                    const bId = selectedAlert.budgetId;
                    const aType = selectedAlert.type;
                    setSelectedAlert(null);
                    onOpenAIWithAlert(bId, aType);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30 text-xs font-semibold"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Consult Gemini Advisor
                </button>
              )}

              <div className="flex items-center gap-2">
                {selectedAlert.status === 'OPEN' && (
                  <button
                    onClick={() => handleReview(selectedAlert._id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
                  >
                    Mark Reviewed
                  </button>
                )}
                {selectedAlert.status !== 'RESOLVED' && currentUser?.role !== 'DEPARTMENT_HEAD' && (
                  <button
                    onClick={() => handleResolve(selectedAlert._id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-medium text-white"
                  >
                    Resolve Anomaly
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
