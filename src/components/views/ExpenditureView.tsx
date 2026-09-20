import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../api';
import { Budget, Expenditure, User, ExpenditureCategory } from '../../types';
import { formatCroreLakh, formatDate } from '../../utils/formatters';
import {
  Plus,
  Search,
  Filter,
  Receipt,
  FileText,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Info
} from 'lucide-react';

interface ExpenditureViewProps {
  currentUser: User | null;
  onNavigateToAlerts?: () => void;
}

const CATEGORIES: ExpenditureCategory[] = [
  'Infrastructure',
  'Equipment',
  'Salaries',
  'Procurement',
  'Operations',
  'Training',
  'Maintenance',
  'Other'
];

export const ExpenditureView: React.FC<ExpenditureViewProps> = ({
  currentUser,
  onNavigateToAlerts
}) => {
  const [expenditures, setExpenditures] = useState<Expenditure[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [amountInput, setAmountInput] = useState('');
  const [category, setCategory] = useState<ExpenditureCategory>('Procurement');
  const [description, setDescription] = useState('');
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postSubmitAlerts, setPostSubmitAlerts] = useState<any[] | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [expRes, bRes] = await Promise.all([
        api.getExpenditures(
          selectedCategoryFilter ? { category: selectedCategoryFilter } : undefined
        ),
        api.getBudgets()
      ]);

      if (expRes.success) setExpenditures(expRes.expenditures);
      if (bRes.success) {
        setBudgets(bRes.budgets);
        if (bRes.budgets.length > 0 && !selectedBudget) {
          setSelectedBudget(bRes.budgets[0]);
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
  }, [selectedCategoryFilter, currentUser]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setFormError('Supporting document exceeds 10MB limit.');
        return;
      }
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => setFilePreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleBudgetChange = (budgetId: string) => {
    const b = budgets.find((x) => x._id === budgetId) || null;
    setSelectedBudget(b);
  };

  // Real-time calculation helper
  const parsedAmount = Number(amountInput) || 0;
  const currentRemaining = selectedBudget ? selectedBudget.allocatedAmount - (selectedBudget.totalSpent || 0) : 0;
  const projectedRemaining = currentRemaining - parsedAmount;
  const isOverspendingWarning = selectedBudget && projectedRemaining < 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedBudget) {
      setFormError('Please select a target budget scheme.');
      return;
    }

    if (!amountInput || parsedAmount <= 0) {
      setFormError('Please enter a strictly positive disbursement amount.');
      return;
    }

    if (!description.trim()) {
      setFormError('Voucher purpose / Invoice description is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('budgetId', selectedBudget._id);
      formData.append('amount', String(parsedAmount));
      formData.append('category', category);
      formData.append('description', description);
      formData.append('transactionDate', transactionDate);

      if (selectedFile) {
        formData.append('supportingDocument', selectedFile);
      }

      const res = await api.createExpenditure(formData);
      if (res.success) {
        if (res.newAlerts && res.newAlerts.length > 0) {
          setPostSubmitAlerts(res.newAlerts);
        } else {
          setIsModalOpen(false);
        }
        // Reset inputs
        setAmountInput('');
        setDescription('');
        setSelectedFile(null);
        setFilePreview(null);
        fetchData();
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to disburse expenditure.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (currentUser?.role !== 'ADMIN') return;
    if (!window.confirm('Are you sure you want to cancel and delete this expenditure voucher?')) {
      return;
    }

    try {
      await api.deleteExpenditure(id);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Error deleting voucher');
    }
  };

  const filtered = expenditures.filter((e) => {
    const q = searchQuery.toLowerCase();
    return (
      e.description.toLowerCase().includes(q) ||
      e.budget?.scheme.toLowerCase().includes(q) ||
      e.department?.name.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header & Disburse Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>💳</span> Expenditure Ledger &amp; Disbursement Vouchers
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time voucher recording, document validation, and anomaly triggers
          </p>
        </div>

        {currentUser?.role !== 'DEPARTMENT_HEAD' && (
          <button
            onClick={() => {
              setPostSubmitAlerts(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" /> Disburse &amp; Record Expenditure
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search invoice description, scheme, voucher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="w-full sm:w-56 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenditures Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Voucher Date</th>
                <th className="p-3.5">Scheme &amp; Purpose</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Description / Bill Ref</th>
                <th className="p-3.5 text-right">Disbursed Amount</th>
                <th className="p-3.5 text-center">Supporting Doc</th>
                {currentUser?.role === 'ADMIN' && <th className="p-3.5 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-500">
                    No expenditure vouchers recorded.
                  </td>
                </tr>
              ) : (
                filtered.map((exp) => (
                  <tr key={exp._id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-mono text-slate-400 whitespace-nowrap">
                      {formatDate(exp.transactionDate)}
                    </td>
                    <td className="p-3.5 font-medium text-white max-w-xs truncate">
                      {exp.budget?.scheme || 'General Allocation'}
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-slate-300">
                        {exp.department?.code || 'N/A'}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 border border-slate-700 text-slate-300">
                        {exp.category}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300 max-w-sm">
                      <p className="truncate">{exp.description}</p>
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-indigo-300">
                      {formatCroreLakh(exp.amount)}
                    </td>
                    <td className="p-3.5 text-center">
                      {exp.supportingDocumentUrl ? (
                        <a
                          href={exp.supportingDocumentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 underline"
                          title={exp.supportingDocumentName || 'Supporting Bill'}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span className="max-w-[100px] truncate">
                            {exp.supportingDocumentName || 'Bill'}
                          </span>
                        </a>
                      ) : (
                        <span className="text-[10px] text-slate-600">None</span>
                      )}
                    </td>
                    {currentUser?.role === 'ADMIN' && (
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleDelete(exp._id)}
                          className="p-1 rounded hover:bg-red-950 text-slate-500 hover:text-red-400 transition"
                          title="Revoke and cancel voucher"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disburse / Record Expenditure Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[95vh] overflow-y-auto">
            {/* If New Alerts Triggered on Submit */}
            {postSubmitAlerts ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-red-400">
                  <div className="w-10 h-10 rounded-full bg-red-950/60 border border-red-800 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-400 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Financial Anomaly Triggered!</h3>
                    <p className="text-xs text-red-300">
                      Expenditure recorded successfully, but triggered governance rules.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {postSubmitAlerts.map((alt: any) => (
                    <div
                      key={alt._id}
                      className="p-3 bg-red-950/40 border border-red-800 rounded-lg text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-bold text-red-200">
                        <span>Rule: {alt.type}</span>
                        <span className="px-2 py-0.5 bg-red-900 rounded text-[10px]">
                          {alt.severity}
                        </span>
                      </div>
                      <p className="text-slate-200">{alt.message}</p>
                      <p className="text-slate-400 text-[11px]">{alt.explanation}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setPostSubmitAlerts(null);
                    }}
                    className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white"
                  >
                    Close
                  </button>
                  {onNavigateToAlerts && (
                    <button
                      onClick={() => {
                        setIsModalOpen(false);
                        setPostSubmitAlerts(null);
                        onNavigateToAlerts();
                      }}
                      className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 font-medium text-white transition text-xs"
                    >
                      View Alerts Center &rarr;
                    </button>
                  )}
                </div>
              </div>
            ) : (
              // Main Form
              <>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white">Record Expenditure Voucher</h3>
                    <p className="text-xs text-slate-400">
                      Disbursement will automatically trigger deterministic anomaly analysis
                    </p>
                  </div>
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

                <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                  {/* Select Scheme */}
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Target Scheme Allocation
                    </label>
                    <select
                      value={selectedBudget?._id || ''}
                      onChange={(e) => handleBudgetChange(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                    >
                      {budgets.map((b) => (
                        <option key={b._id} value={b._id}>
                          {b.scheme} ({b.department?.code}) — Rem: {formatCroreLakh(b.remainingAmount || 0)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Real-time Scheme Balance Bar */}
                  {selectedBudget && (
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Approved Ceiling:</span>
                        <span className="font-mono text-white">
                          {formatCroreLakh(selectedBudget.allocatedAmount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Current Balance:</span>
                        <span className="font-mono text-emerald-400">
                          {formatCroreLakh(currentRemaining)}
                        </span>
                      </div>
                      {parsedAmount > 0 && (
                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-900">
                          <span className="text-slate-400">Projected Balance:</span>
                          <span
                            className={`font-mono font-bold ${
                              isOverspendingWarning ? 'text-red-400' : 'text-emerald-400'
                            }`}
                          >
                            {formatCroreLakh(projectedRemaining)}
                          </span>
                        </div>
                      )}
                      {isOverspendingWarning && (
                        <div className="flex items-center gap-1.5 text-red-400 text-[10px] font-semibold mt-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>
                            Warning: This disbursement exceeds remaining ceiling by{' '}
                            {formatCroreLakh(Math.abs(projectedRemaining))}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Amount & Date */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        Disbursed Amount (INR)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 1500000"
                        value={amountInput}
                        onChange={(e) => setAmountInput(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                      />
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {parsedAmount > 0 ? formatCroreLakh(parsedAmount) : 'Enter amount in INR'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        Transaction Date
                      </label>
                      <input
                        type="date"
                        value={transactionDate}
                        onChange={(e) => setTransactionDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Expenditure Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Description / Bill Reference */}
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Voucher Narration / Invoice Reference
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g., Sanctioned Phase-2 civil work milestone payment to vendor XYZ"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 resize-none"
                    />
                  </div>

                  {/* Document Upload (Drag and Drop / Click) */}
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Supporting Document (PDF, JPG, PNG &lt; 10MB)
                    </label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/80 rounded-lg p-4 text-center cursor-pointer transition"
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".pdf,image/png,image/jpeg,image/webp"
                        className="hidden"
                      />
                      <Upload className="w-5 h-5 mx-auto text-slate-500 mb-1" />
                      {selectedFile ? (
                        <div>
                          <p className="text-white font-medium truncate">{selectedFile.name}</p>
                          <p className="text-[10px] text-slate-400">
                            {(selectedFile.size / 1024).toFixed(1)} KB &bull; Click to replace
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-slate-300">Click to select or drag &amp; drop</p>
                          <p className="text-[10px] text-slate-500">
                            Scanned bill, sanction order, or invoice
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
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
                      className={`px-4 py-1.5 rounded-lg font-medium text-white transition disabled:opacity-50 ${
                        isOverspendingWarning
                          ? 'bg-amber-600 hover:bg-amber-500'
                          : 'bg-blue-600 hover:bg-blue-500'
                      }`}
                    >
                      {isSubmitting ? 'Recording...' : 'Disburse Voucher'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
