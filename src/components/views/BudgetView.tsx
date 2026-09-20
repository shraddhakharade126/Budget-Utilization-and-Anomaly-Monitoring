import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { Budget, Department, User } from '../../types';
import { formatCroreLakh, formatDate } from '../../utils/formatters';
import { Plus, Search, Filter, AlertCircle, CheckCircle, ShieldAlert, FileText, Trash2, Eye } from 'lucide-react';

interface BudgetViewProps {
  currentUser: User | null;
}

export const BudgetView: React.FC<BudgetViewProps> = ({ currentUser }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailBudget, setDetailBudget] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    departmentId: '',
    financialYear: '2025-26',
    scheme: '',
    allocatedAmount: '',
    startDate: '2025-04-01',
    endDate: '2026-03-31'
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [bRes, dRes] = await Promise.all([
        api.getBudgets(selectedDeptFilter || undefined),
        api.getDepartments()
      ]);

      if (bRes.success) setBudgets(bRes.budgets);
      if (dRes.success) {
        setDepartments(dRes.departments);
        if (dRes.departments.length > 0 && !formData.departmentId) {
          setFormData((prev) => ({ ...prev, departmentId: dRes.departments[0]._id }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDeptFilter, currentUser]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.departmentId || !formData.scheme || !formData.allocatedAmount) {
      setFormError('Please fill in all mandatory fields.');
      return;
    }

    const amount = Number(formData.allocatedAmount);
    if (isNaN(amount) || amount <= 0) {
      setFormError('Allocation amount must be a positive number.');
      return;
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      setFormError('End date must be after start date.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.createBudget({
        departmentId: formData.departmentId,
        financialYear: formData.financialYear,
        scheme: formData.scheme,
        allocatedAmount: amount,
        startDate: formData.startDate,
        endDate: formData.endDate
      });

      if (res.success) {
        setIsModalOpen(false);
        setFormData({
          departmentId: departments[0]?._id || '',
          financialYear: '2025-26',
          scheme: '',
          allocatedAmount: '',
          startDate: '2025-04-01',
          endDate: '2026-03-31'
        });
        fetchData();
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to register budget scheme.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, scheme: string) => {
    if (currentUser?.role !== 'ADMIN') return;
    if (!window.confirm(`Are you sure you want to revoke and delete the budget allocation for "${scheme}"?`)) {
      return;
    }

    try {
      await api.deleteBudget(id);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Error deleting budget');
    }
  };

  const handleViewDetails = async (id: string) => {
    try {
      const res = await api.getBudgetById(id);
      if (res.success) {
        setDetailBudget(res.budget);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = budgets.filter((b) => {
    const matchesSearch =
      b.scheme.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.department?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.department?.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>💼</span> Budget Scheme Allocations
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Demand for Grants and Scheme-Level Ceiling Authorizations
          </p>
        </div>

        {currentUser?.role === 'ADMIN' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" /> Allocate New Scheme Budget
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search scheme name, department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="w-full sm:w-56 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
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

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Scheme &amp; Purpose</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">FY</th>
                <th className="p-3.5 text-right">Allocation</th>
                <th className="p-3.5 text-right">Disbursed</th>
                <th className="p-3.5 text-right">Remaining</th>
                <th className="p-3.5 text-center">Utilization</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-500">
                    No budget schemes match the search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => {
                  const util = b.utilizationPercentage || 0;
                  const isOver = util > 100;
                  const isExhausted = util >= 95 && util <= 100;
                  const isLow = util < 35;

                  return (
                    <tr key={b._id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-semibold text-white max-w-xs">
                        <p className="truncate">{b.scheme}</p>
                        <p className="text-[10px] text-slate-400 font-normal mt-0.5">
                          {formatDate(b.startDate)} &rarr; {formatDate(b.endDate)}
                        </p>
                      </td>
                      <td className="p-3.5">
                        <span className="font-medium text-slate-200">
                          {b.department?.code || 'N/A'}
                        </span>
                        <span className="block text-[10px] text-slate-400 truncate max-w-[120px]">
                          {b.department?.name}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-400">{b.financialYear}</td>
                      <td className="p-3.5 text-right font-mono font-medium text-slate-200">
                        {formatCroreLakh(b.allocatedAmount)}
                      </td>
                      <td className="p-3.5 text-right font-mono text-indigo-300">
                        {formatCroreLakh(b.totalSpent || 0)}
                      </td>
                      <td
                        className={`p-3.5 text-right font-mono font-medium ${
                          (b.remainingAmount || 0) < 0 ? 'text-red-400 font-bold' : 'text-emerald-400'
                        }`}
                      >
                        {formatCroreLakh(b.remainingAmount ?? (b.allocatedAmount - (b.totalSpent || 0)))}
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`font-mono font-bold ${
                            isOver
                              ? 'text-red-400'
                              : isExhausted
                              ? 'text-amber-400'
                              : isLow
                              ? 'text-sky-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {util}%
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                            b.status === 'EXCEEDED' || isOver
                              ? 'bg-red-950/60 text-red-300 border-red-800'
                              : b.status === 'EXHAUSTED' || isExhausted
                              ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                              : isLow
                              ? 'bg-sky-950/60 text-sky-300 border-sky-800'
                              : 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                          }`}
                        >
                          {b.status === 'EXCEEDED' || isOver
                            ? 'Exceeded'
                            : b.status === 'EXHAUSTED' || isExhausted
                            ? 'Exhausted'
                            : isLow
                            ? 'Under-Utilized'
                            : 'Active'}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleViewDetails(b._id)}
                            className="p-1.5 rounded hover:bg-slate-800 text-blue-400 hover:text-blue-300"
                            title="View Scheme Breakdown"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {currentUser?.role === 'ADMIN' && (
                            <button
                              onClick={() => handleDelete(b._id, b.scheme)}
                              className="p-1.5 rounded hover:bg-red-950 text-slate-500 hover:text-red-400"
                              title="Delete Budget"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Allocate New Scheme Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Create New Budget Scheme</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg"
              >
                &times;
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-xs text-red-300">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Department</label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                >
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Scheme / Programme Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., Rural Solar Powered Micro-Cold Chain Storage"
                  value={formData.scheme}
                  onChange={(e) => setFormData({ ...formData, scheme: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Financial Year</label>
                  <select
                    value={formData.financialYear}
                    onChange={(e) => setFormData({ ...formData, financialYear: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  >
                    <option value="2025-26">2025-26</option>
                    <option value="2024-25">2024-25</option>
                    <option value="2026-27">2026-27</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Allocated Amount (INR)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 50000000"
                    value={formData.allocatedAmount}
                    onChange={(e) => setFormData({ ...formData, allocatedAmount: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {Number(formData.allocatedAmount) > 0
                      ? formatCroreLakh(Number(formData.allocatedAmount))
                      : 'Enter raw amount in rupees'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Execution Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Financial Close Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 font-medium text-white transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering...' : 'Confirm Allocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scheme Breakdown Details Modal */}
      {detailBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">{detailBudget.scheme}</h3>
                <p className="text-xs text-slate-400">
                  {detailBudget.department?.name} &bull; FY {detailBudget.financialYear}
                </p>
              </div>
              <button
                onClick={() => setDetailBudget(null)}
                className="text-slate-400 hover:text-white text-lg"
              >
                &times;
              </button>
            </div>

            {/* Financial Metrics */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-400">Total Allocation</span>
                <p className="text-sm font-bold text-white mt-1">
                  {formatCroreLakh(detailBudget.allocatedAmount)}
                </p>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-400">Total Disbursed</span>
                <p className="text-sm font-bold text-indigo-300 mt-1">
                  {formatCroreLakh(detailBudget.totalSpent || 0)}
                </p>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-400">Utilization Rate</span>
                <p className="text-sm font-bold text-amber-400 mt-1">
                  {detailBudget.utilizationPercentage || 0}%
                </p>
              </div>
            </div>

            {/* Vouchers Attached */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Disbursement Vouchers ({detailBudget.expenditures?.length || 0})
              </h4>
              {detailBudget.expenditures?.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">
                  No expenditure vouchers have been logged against this scheme yet.
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {detailBudget.expenditures?.map((e: any) => (
                    <div
                      key={e._id}
                      className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-semibold text-white">{e.description}</p>
                        <p className="text-[10px] text-slate-400">
                          {formatDate(e.transactionDate)} &bull; Category: {e.category}
                        </p>
                      </div>
                      <span className="font-mono font-bold text-indigo-300">
                        {formatCroreLakh(e.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Related Alerts */}
            {detailBudget.alerts?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-400 mb-2">
                  Active Anomaly Alerts ({detailBudget.alerts.length})
                </h4>
                <div className="space-y-2">
                  {detailBudget.alerts.map((a: any) => (
                    <div
                      key={a._id}
                      className="p-2.5 bg-red-950/30 border border-red-800 rounded-lg text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-semibold text-red-300">
                        <span>{a.type}</span>
                        <span className="text-[10px] px-2 py-0.2 rounded bg-red-900 text-red-200">
                          {a.severity}
                        </span>
                      </div>
                      <p className="text-slate-300 text-[11px]">{a.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
