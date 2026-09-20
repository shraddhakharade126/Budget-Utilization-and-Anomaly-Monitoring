import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { User, Department, Threshold, AuditLog } from '../../types';
import { formatDate } from '../../utils/formatters';
import {
  ShieldAlert,
  Users,
  Building,
  Sliders,
  History,
  Plus,
  Edit2,
  CheckCircle,
  XCircle,
  Save,
  AlertCircle
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'departments' | 'thresholds' | 'audit'>('users');

  // State
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [thresholds, setThresholds] = useState<Threshold | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // User modal
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'FINANCE_OFFICER' as const,
    departmentId: ''
  });
  const [userFormError, setUserFormError] = useState('');

  // Department modal
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [deptFormData, setDeptFormData] = useState({
    name: '',
    code: '',
    description: ''
  });
  const [deptFormError, setDeptFormError] = useState('');

  // Threshold form
  const [thresholdForm, setThresholdForm] = useState<Partial<Threshold>>({});
  const [thresholdSaveSuccess, setThresholdSaveSuccess] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [uRes, dRes, tRes, aRes] = await Promise.all([
        api.getUsers(),
        api.getDepartments(),
        api.getThresholds(),
        api.getAuditLogs()
      ]);

      if (uRes.success) setUsers(uRes.users);
      if (dRes.success) {
        setDepartments(dRes.departments);
        if (dRes.departments.length > 0 && !userFormData.departmentId) {
          setUserFormData((prev) => ({ ...prev, departmentId: dRes.departments[0]._id }));
        }
      }
      if (tRes.success) {
        setThresholds(tRes.threshold);
        setThresholdForm(tRes.threshold);
      }
      if (aRes.success) setAuditLogs(aRes.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormError('');
    if (!userFormData.name || !userFormData.email || !userFormData.password) {
      setUserFormError('All fields are required.');
      return;
    }

    try {
      const res = await api.createUser(userFormData);
      if (res.success) {
        setIsUserModalOpen(false);
        setUserFormData({
          name: '',
          email: '',
          password: '',
          role: 'FINANCE_OFFICER',
          departmentId: departments[0]?._id || ''
        });
        fetchData();
      }
    } catch (err: any) {
      setUserFormError(err.message || 'Failed to create user');
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    try {
      await api.setUserStatus(user._id, !user.isActive);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update user status');
    }
  };

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeptFormError('');
    if (!deptFormData.name || !deptFormData.code) {
      setDeptFormError('Department name and code are mandatory.');
      return;
    }

    try {
      const res = await api.createDepartment(deptFormData);
      if (res.success) {
        setIsDeptModalOpen(false);
        setDeptFormData({ name: '', code: '', description: '' });
        fetchData();
      }
    } catch (err: any) {
      setDeptFormError(err.message || 'Failed to create department');
    }
  };

  const handleSaveThresholds = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.updateThresholds(thresholdForm);
      if (res.success) {
        setThresholds(res.threshold);
        setThresholdSaveSuccess(true);
        setTimeout(() => setThresholdSaveSuccess(false), 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update thresholds');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>⚙️</span> Institutional Administration &amp; Governance Center
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Role-Based Access Control, Department Registry, Anomaly Thresholds, and Immutable Audit Trail
          </p>
        </div>

        {/* Submodule Tabs */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Users &amp; Roles
          </button>
          <button
            onClick={() => setActiveTab('departments')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'departments'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building className="w-3.5 h-3.5" /> Departments
          </button>
          <button
            onClick={() => setActiveTab('thresholds')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'thresholds'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> Thresholds
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'audit'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" /> Audit Logs
          </button>
        </div>
      </div>

      {/* =========================================================================
          SUBMODULE 1: USERS & RBAC
          ========================================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Authorized Institutional Personnel</h3>
            <button
              onClick={() => setIsUserModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" /> Add Authorized User
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Officer Name</th>
                  <th className="p-3.5">Official Email</th>
                  <th className="p-3.5">Governance Role</th>
                  <th className="p-3.5">Department Assignment</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map((u) => {
                  const dept = departments.find((d) => d._id === u.departmentId);
                  return (
                    <tr key={u._id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-medium text-white">{u.name}</td>
                      <td className="p-3.5 text-slate-300 font-mono">{u.email}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.role === 'ADMIN'
                              ? 'bg-blue-950 text-blue-300 border border-blue-800'
                              : u.role === 'FINANCE_OFFICER'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400">
                        {dept ? `${dept.name} (${dept.code})` : 'All Departments (Treasury)'}
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            u.isActive
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-red-950 text-red-300 border border-red-800'
                          }`}
                        >
                          {u.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleToggleUserStatus(u)}
                          className={`px-2 py-1 rounded text-[11px] font-medium transition ${
                            u.isActive
                              ? 'bg-red-950/60 hover:bg-red-900 text-red-300'
                              : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300'
                          }`}
                        >
                          {u.isActive ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUBMODULE 2: DEPARTMENTS
          ========================================================================= */}
      {activeTab === 'departments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Government Portfolios &amp; Ministries</h3>
            <button
              onClick={() => setIsDeptModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" /> Add Department
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Department Name</th>
                  <th className="p-3.5">Official Code</th>
                  <th className="p-3.5">Mission / Portfolio Scope</th>
                  <th className="p-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {departments.map((d) => (
                  <tr key={d._id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-medium text-white">{d.name}</td>
                    <td className="p-3.5 font-mono font-bold text-blue-400">{d.code}</td>
                    <td className="p-3.5 text-slate-400">{d.description}</td>
                    <td className="p-3.5 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        Operational
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUBMODULE 3: THRESHOLDS CONFIGURATION
          ========================================================================= */}
      {activeTab === 'thresholds' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 max-w-2xl">
          <div>
            <h3 className="text-sm font-bold text-white">Deterministic Financial Rules Configuration</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Modify statutory trigger thresholds across all automated anomaly audit checks
            </p>
          </div>

          {thresholdSaveSuccess && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Threshold parameters updated and active scan re-run.
            </div>
          )}

          <form onSubmit={handleSaveThresholds} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <label className="block text-slate-300 font-semibold">
                  Rule 1: Under-Utilization Min Ceiling (%)
                </label>
                <input
                  type="number"
                  value={thresholdForm.underUtilizationPercentage || 30}
                  onChange={(e) =>
                    setThresholdForm({
                      ...thresholdForm,
                      underUtilizationPercentage: Number(e.target.value)
                    })
                  }
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-white"
                />
                <p className="text-[10px] text-slate-500">Default: 30%</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <label className="block text-slate-300 font-semibold">
                  Rule 1: Time Elapsed Min Trigger (%)
                </label>
                <input
                  type="number"
                  value={thresholdForm.timeElapsedPercentage || 50}
                  onChange={(e) =>
                    setThresholdForm({
                      ...thresholdForm,
                      timeElapsedPercentage: Number(e.target.value)
                    })
                  }
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-white"
                />
                <p className="text-[10px] text-slate-500">Default: 50%</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <label className="block text-slate-300 font-semibold">
                  Rule 3: Warning Utilization Tier (%)
                </label>
                <input
                  type="number"
                  value={thresholdForm.warningUtilizationPercentage || 85}
                  onChange={(e) =>
                    setThresholdForm({
                      ...thresholdForm,
                      warningUtilizationPercentage: Number(e.target.value)
                    })
                  }
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-white"
                />
                <p className="text-[10px] text-slate-500">Default: 85%</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <label className="block text-slate-300 font-semibold">
                  Rule 3: Critical Utilization Tier (%)
                </label>
                <input
                  type="number"
                  value={thresholdForm.criticalUtilizationPercentage || 95}
                  onChange={(e) =>
                    setThresholdForm({
                      ...thresholdForm,
                      criticalUtilizationPercentage: Number(e.target.value)
                    })
                  }
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-white"
                />
                <p className="text-[10px] text-slate-500">Default: 95%</p>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
              <label className="block text-slate-300 font-semibold">
                Rule 4: Spending Spike Surge Percentage (%)
              </label>
              <input
                type="number"
                value={thresholdForm.spendingSpikePercentage || 40}
                onChange={(e) =>
                  setThresholdForm({
                    ...thresholdForm,
                    spendingSpikePercentage: Number(e.target.value)
                  })
                }
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-white"
              />
              <p className="text-[10px] text-slate-500">
                Surge over historical moving average. Default: 40%
              </p>
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition"
            >
              <Save className="w-4 h-4" /> Save &amp; Re-evaluate Anomaly Rules
            </button>
          </form>
        </div>
      )}

      {/* =========================================================================
          SUBMODULE 4: AUDIT LOGS
          ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Immutable Institutional Audit Trail</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive chronological log of logins, allocations, voucher disbursements, and alert resolutions
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm max-h-[600px] overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] tracking-wider sticky top-0">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Actor</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Action Executed</th>
                  <th className="p-3.5">Entity</th>
                  <th className="p-3.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {auditLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-800/40 transition text-[11px]">
                    <td className="p-3.5 text-slate-400 whitespace-nowrap">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="p-3.5 font-sans font-medium text-white">{log.userName}</td>
                    <td className="p-3.5 text-blue-300">{log.userRole || 'USER'}</td>
                    <td className="p-3.5 font-bold text-slate-200">{log.action}</td>
                    <td className="p-3.5 text-slate-400">{log.entity}</td>
                    <td className="p-3.5 font-sans text-slate-400 max-w-xs truncate">
                      {log.newValue ? JSON.stringify(log.newValue) : 'Completed'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white">Enroll Authorized Officer</h4>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            {userFormError && (
              <div className="p-2.5 bg-red-950/60 border border-red-800 rounded text-xs text-red-300">
                {userFormError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Full Officer Name</label>
                <input
                  type="text"
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-white"
                  placeholder="e.g. Dr. Rajesh Verma"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Official Email</label>
                <input
                  type="email"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-white"
                  placeholder="r.verma@finance.gov.in"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Temporary Password</label>
                <input
                  type="password"
                  value={userFormData.password}
                  onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-white"
                  placeholder="Min 6 characters"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Role Authorization</label>
                <select
                  value={userFormData.role}
                  onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-white"
                >
                  <option value="ADMIN">ADMIN — Full Institutional Control</option>
                  <option value="FINANCE_OFFICER">FINANCE_OFFICER — Voucher Entry &amp; Audit</option>
                  <option value="DEPARTMENT_HEAD">DEPARTMENT_HEAD — Scrutiny &amp; Review</option>
                </select>
              </div>

              {userFormData.role !== 'ADMIN' && (
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Department Assignment</label>
                  <select
                    value={userFormData.departmentId}
                    onChange={(e) =>
                      setUserFormData({ ...userFormData, departmentId: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-white"
                  >
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 font-medium text-white rounded"
                >
                  Save Officer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white">Create Department Portfolio</h4>
              <button
                onClick={() => setIsDeptModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            {deptFormError && (
              <div className="p-2.5 bg-red-950/60 border border-red-800 rounded text-xs text-red-300">
                {deptFormError}
              </div>
            )}

            <form onSubmit={handleCreateDept} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Department Name</label>
                <input
                  type="text"
                  value={deptFormData.name}
                  onChange={(e) => setDeptFormData({ ...deptFormData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-white"
                  placeholder="e.g. Ministry of Renewable Energy"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Official Code</label>
                <input
                  type="text"
                  value={deptFormData.code}
                  onChange={(e) =>
                    setDeptFormData({ ...deptFormData, code: e.target.value.toUpperCase() })
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-white uppercase font-mono"
                  placeholder="e.g. MNRE"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description / Scope</label>
                <textarea
                  rows={2}
                  value={deptFormData.description}
                  onChange={(e) => setDeptFormData({ ...deptFormData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-white resize-none"
                  placeholder="Mandate and statutory jurisdiction..."
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDeptModalOpen(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 font-medium text-white rounded"
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
