import React, { useState } from 'react';
import {
  BookOpen,
  Target,
  CheckCircle2,
  Shield,
  Layers,
  Cpu,
  Activity,
  BarChart3,
  Users,
  Wallet,
  Receipt,
  AlertTriangle,
  FileText,
  Clock,
  ArrowRight,
  Database,
  Lock,
  Server,
  Zap,
  TrendingUp,
  Scale
} from 'lucide-react';

export const SystemGuideView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<
    'overview' | 'requirements' | 'algorithms' | 'architecture' | 'kpis'
  >('overview');

  return (
    <div className="space-y-6 pb-12 animate-fadeIn" id="system-guide-view">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-lg">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-950 text-blue-300 border border-blue-800">
                Official Engineering Specification
              </span>
              <span className="text-xs text-slate-400">&bull; Standard Operating Architecture</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <BookOpen className="w-7 h-7 text-blue-400" />
              AI-Based Budget Utilization Monitoring System
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Comprehensive Architectural Guide, Analytical Requirements Specification, and Governance Framework for Real-Time Public Fund Surveillance.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">System Compliance</span>
              <span className="text-xs font-semibold text-emerald-400 flex items-center justify-end gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> GFR 2017 &amp; PFMS Ready
              </span>
            </div>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={() => setActiveSection('overview')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeSection === 'overview'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Target className="w-4 h-4" /> 1. Context &amp; Objectives
          </button>
          <button
            onClick={() => setActiveSection('requirements')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeSection === 'requirements'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" /> 2. Functional Spec &amp; User Flow
          </button>
          <button
            onClick={() => setActiveSection('algorithms')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeSection === 'algorithms'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Cpu className="w-4 h-4" /> 3. Detection Rules &amp; AI Engine
          </button>
          <button
            onClick={() => setActiveSection('architecture')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeSection === 'architecture'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Server className="w-4 h-4" /> 4. Non-Functional &amp; Stack
          </button>
          <button
            onClick={() => setActiveSection('kpis')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              activeSection === 'kpis'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> 5. Target KPIs &amp; Impact
          </button>
        </div>
      </div>

      {/* =========================================================================
          SECTION 1: CONTEXT, PROBLEM STATEMENT & OBJECTIVES
          ========================================================================= */}
      {activeSection === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Context & Problem Definition */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center font-bold">
                  ⚠️
                </div>
                <h2 className="text-base font-bold text-white">The Governance Challenge</h2>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Government ministries, statutory departments, and large enterprises oversee substantial public funds allocated across hundreds of development schemes, administrative divisions, and operational spending units. However, tracking actual utilization in real time remains a fundamental barrier to good governance:
              </p>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold shrink-0">&bull;</span>
                  <span><strong>Spreadsheet Dependency:</strong> Reliance on manual quarterly spreadsheets and retrospective paper vouchers produces delayed financial visibility (often lagging 60–90 days).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold shrink-0">&bull;</span>
                  <span><strong>March Rush &amp; Fund Lapse:</strong> Under-utilization is commonly noticed only in Q4, leading to hurried panic disbursements ("March Rush") or forfeiture of unutilized allocations.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold shrink-0">&bull;</span>
                  <span><strong>Fund Leakage &amp; Allocation Breaches:</strong> Absence of real-time ceiling enforcement enables unapproved over-expenditures and unchecked single-vendor disbursement surges.</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                  🎯
                </div>
                <h2 className="text-base font-bold text-white">System Vision &amp; Core Mandate</h2>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                The <strong>AI-Based Budget Utilization Monitoring System</strong> transforms retrospective accounting into proactive, automated financial surveillance. It unites continuous ledger synchronization with dual-engine analytics:
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                  <span className="text-xs font-bold text-blue-400 block mb-1">Deterministic Rules</span>
                  <p className="text-[11px] text-slate-400">
                    Mathematically enforces statutory thresholds, ceiling limits, and velocity benchmarks.
                  </p>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
                  <span className="text-xs font-bold text-indigo-400 block mb-1">Gemini 3 AI Scrutiny</span>
                  <p className="text-[11px] text-slate-400">
                    Provides forensic narrative audits, root-cause explanations, and predictive burn forecasts.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Primary & Secondary Objectives */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Primary Objectives
              </h3>
              <div className="space-y-2.5">
                {[
                  { title: 'Digitally Track Budget Allocation & Expenditure', desc: 'Maintain an immutable digital ledger of approved legislative appropriations and disaggregated vouchers.' },
                  { title: 'Monitor Utilization Percentage Across Departments', desc: 'Calculate real-time expenditure rates across administrative tiers, categories, and quarterly benchmarks.' },
                  { title: 'Detect Anomalies in Spending Patterns', desc: 'Instantly flag sudden expenditure spikes, prolonged dormancy, and deviations from approved schedules.' },
                  { title: 'Identify Potential Fund Leakage Risks', desc: 'Detect suspicious transactions, single-day vendor concentrations, and unverified voucher surges.' },
                  { title: 'Improve Transparency & Accountability', desc: 'Provide verified audit trails and clear executive sign-offs for all fiscal actions.' }
                ].map((item, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-950/50 rounded-lg border border-slate-800/80">
                    <p className="text-xs font-semibold text-slate-200">{item.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" /> Secondary Objectives
              </h3>
              <div className="space-y-2.5">
                {[
                  { title: 'Enable Data-Driven Financial Decision-Making', desc: 'Equip finance ministers and committee secretaries with predictive re-appropriation models.' },
                  { title: 'Reduce Dependency on Manual Reporting', desc: 'Eliminate manual reconciliation cycles through automated sub-second aggregations and scheduled reports.' },
                  { title: 'Support Compliance with Governance Standards', desc: 'Enforce General Financial Rules (GFR 2017) and public finance regulatory frameworks.' },
                  { title: 'Provide Visual Dashboards for Easy Monitoring', desc: 'Offer at-a-glance status KPI cards, departmental burn-rate rankings, and quarterly trajectories.' }
                ].map((item, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-950/50 rounded-lg border border-slate-800/80">
                    <p className="text-xs font-semibold text-slate-200">{item.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scope Matrix */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-400" /> In Scope System Boundaries
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { title: 'Budget Allocation Entry & Management', detail: 'Annual and quarterly appropriations, scheme classifications, and financial year partitions.' },
                { title: 'Department-Wise Expenditure Tracking', detail: 'Line-item voucher recording, vendor mappings, category tags, and supporting document uploads.' },
                { title: 'Utilization Percentage Calculation', detail: 'Real-time mathematical division of total disbursements against approved appropriations.' },
                { title: 'Rule-Based & Analytical Anomaly Engine', detail: 'Automated evaluation of under-spending, overspending, velocity spikes, and dormancy.' },
                { title: 'Interactive Dashboard with Charts & Reports', detail: 'At-a-glance summary cards, pie charts, monthly burn bars, and official PDF/CSV downloads.' },
                { title: 'Multi-Role Access Control (RBAC)', detail: 'Rigorous permission barriers for Finance Officers, Department Heads, and Super Admins.' }
              ].map((scope, idx) => (
                <div key={idx} className="p-3 bg-slate-950/70 rounded-lg border border-slate-800 flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">{scope.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{scope.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 2: FUNCTIONAL REQUIREMENTS & USER FLOW
          ========================================================================= */}
      {activeSection === 'requirements' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Functional Requirements Modules */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Module 1 */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-blue-400">
                <Users className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">1. User Management</h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-1.5">
                  <span className="text-blue-400 font-bold">&bull;</span>
                  <span><strong>Secure Authentication:</strong> JWT token sessions with encrypted password hashing.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-blue-400 font-bold">&bull;</span>
                  <span><strong>Role-Based Access (RBAC):</strong> Granular permissions for Admin, Finance Officer, Department Head, and Auditor.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-blue-400 font-bold">&bull;</span>
                  <span><strong>Department Mapping:</strong> Strict scoping binding Department Heads strictly to their departmental funds.</span>
                </li>
              </ul>
            </div>

            {/* Module 2 */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <Wallet className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">2. Budget Management</h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold">&bull;</span>
                  <span><strong>Appropriation Lifecycle:</strong> Create and version annual and quarterly budget allocations.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold">&bull;</span>
                  <span><strong>Fund Assignment:</strong> Allocate capital and revenue grants to schemes, projects, and departments.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold">&bull;</span>
                  <span><strong>Target Schedules:</strong> Set quarterly disbursement milestones (Q1–Q4) for planned progress tracking.</span>
                </li>
              </ul>
            </div>

            {/* Module 3 */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-400">
                <Receipt className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">3. Expenditure Tracking</h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-400 font-bold">&bull;</span>
                  <span><strong>Transaction Recording:</strong> Disburse expenditure vouchers with date, amount, payee, and vendor ID.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-400 font-bold">&bull;</span>
                  <span><strong>Documentation Upload:</strong> Attach invoices, sanction orders, and receipts with preview links.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-400 font-bold">&bull;</span>
                  <span><strong>Expense Categorization:</strong> Classify outlays into Capital, Operational, Salary, Grants, and Infrastructure.</span>
                </li>
              </ul>
            </div>

            {/* Module 4 */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-indigo-400">
                <Activity className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">4. Monitoring &amp; Detection</h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-1.5">
                  <span className="text-indigo-400 font-bold">&bull;</span>
                  <span><strong>Real-time Utilization:</strong> Instant recalculation of spent ratio, remaining balance, and burn velocity.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-indigo-400 font-bold">&bull;</span>
                  <span><strong>Under-utilization Flag:</strong> Triggers when &lt;40% of fund is spent after 70% of fiscal duration has elapsed.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-indigo-400 font-bold">&bull;</span>
                  <span><strong>Anomaly Identification:</strong> Automated detection of spending spikes, dormancy, and ceiling breaches.</span>
                </li>
              </ul>
            </div>

            {/* Module 5 */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">5. Alerts &amp; Reporting</h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-1.5">
                  <span className="text-rose-400 font-bold">&bull;</span>
                  <span><strong>Automated Notifications:</strong> Severity-calibrated alerts (Low, Medium, High, Critical) with triage actions.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-rose-400 font-bold">&bull;</span>
                  <span><strong>Visual Dashboards:</strong> Rich interactive analytics, utilization bars, category pies, and quarterly timelines.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-rose-400 font-bold">&bull;</span>
                  <span><strong>Exportable Reports:</strong> One-click generation of statutory PDF summary reports and CSV ledger data.</span>
                </li>
              </ul>
            </div>

            {/* Module 6 */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-purple-400">
                <Shield className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">6. Admin Governance</h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-1.5">
                  <span className="text-purple-400 font-bold">&bull;</span>
                  <span><strong>Configurable Thresholds:</strong> Dynamic adjustment of alert percentages without restarting the server.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-purple-400 font-bold">&bull;</span>
                  <span><strong>Department Management:</strong> Setup administrative codes, heads of department, and operational divisions.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-purple-400 font-bold">&bull;</span>
                  <span><strong>Immutable Audit Trails:</strong> Cryptographically logged record of all financial mutations and user actions.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* End-to-End High-Level User Flow */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" /> High-Level System Operational Lifecycle
            </h3>

            <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-6">
              {[
                {
                  step: '01',
                  role: 'Super Admin / Finance Secretariat',
                  action: 'User Authentication & Session Initialization',
                  desc: 'Authorized officials log in through encrypted JWT sessions with institutional role elevation.'
                },
                {
                  step: '02',
                  role: 'Finance Ministry / Admin',
                  action: 'Budget Allocation Provisioning',
                  desc: 'Annual grants, scheme ceilings, and quarterly expenditure targets are established for each ministry and department.'
                },
                {
                  step: '03',
                  role: 'Department Heads / Disbursing Officers',
                  action: 'Expenditure Voucher Submission',
                  desc: 'Line-item expenses are disbursed with vendor metadata, category classification, and supporting document uploads.'
                },
                {
                  step: '04',
                  role: 'Analytical Calculation Engine',
                  action: 'Real-Time Financial Telemetry Evaluation',
                  desc: 'Continuous calculation of aggregate outlays, remaining balances, burn velocity, and time-elapsed ratios.'
                },
                {
                  step: '05',
                  role: 'Deterministic & AI Anomaly Engine',
                  action: 'Automated Threshold Verification',
                  desc: 'Scans for under-utilization (<40% at 70% duration), spending spikes (>40% moving avg), and allocation breaches.'
                },
                {
                  step: '06',
                  role: 'Governance Triage & Audit',
                  action: 'Executive Dashboard & PDF Audit Export',
                  desc: 'Finance officers review anomaly warnings, assign corrective actions, and export statutory PDF compliance reports.'
                }
              ].map((item, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute -left-[33px] top-0 w-4 h-4 rounded-full bg-slate-900 border-2 border-blue-500 group-hover:bg-blue-500 transition-colors"></div>
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <span className="text-xs font-bold text-blue-400">STEP {item.step}: {item.action}</span>
                    <span className="text-[11px] font-medium text-slate-500">{item.role}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 3: DETECTION ALGORITHMS & MATHEMATICAL MODELS
          ========================================================================= */}
      {activeSection === 'algorithms' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rule 1: Under-utilization */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Rule 1: Under-Utilization Detection
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                  Medium Severity
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Flags schemes that risk lapsing allocations due to sluggish execution, specifically when fund spending lags far behind elapsed calendar duration.
              </p>
              <div className="p-3 bg-slate-950 rounded-lg font-mono text-[11px] text-slate-300 border border-slate-800 space-y-1">
                <p className="text-slate-500">// Trigger Condition</p>
                <p className="text-amber-300">IF (TimeElapsed% &ge; 70% AND Utilization% &lt; 40%)</p>
                <p className="text-emerald-400">THEN Trigger Alert: "UNDER_UTILIZATION" (Risk of Fund Lapse)</p>
              </div>
            </div>

            {/* Rule 2: Overspending / Ceiling Breach */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Rule 2: Overspending / Ceiling Breach
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-800">
                  Critical Severity
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Prevents unauthorized deficit spending by instantly detecting when cumulative disbursements breach approved legislative appropriations.
              </p>
              <div className="p-3 bg-slate-950 rounded-lg font-mono text-[11px] text-slate-300 border border-slate-800 space-y-1">
                <p className="text-slate-500">// Trigger Condition</p>
                <p className="text-red-400">IF (TotalExpenditure &gt; AllocatedAmount)</p>
                <p className="text-emerald-400">THEN Trigger Alert: "OVERSPENDING" (Ceiling Breach)</p>
              </div>
            </div>

            {/* Rule 3: Spending Spike Detection */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" /> Rule 3: Abnormal Spending Spike
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                  High Severity
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Evaluates historical rolling averages across prior vouchers to identify sudden, single-transaction surges or unusual vendor payment concentrations.
              </p>
              <div className="p-3 bg-slate-950 rounded-lg font-mono text-[11px] text-slate-300 border border-slate-800 space-y-1">
                <p className="text-slate-500">// Moving Average Surge Condition</p>
                <p className="text-rose-300">AvgHistorical = &sum;(Tx[1..N-1]) / (N - 1)</p>
                <p className="text-rose-300">IF (Tx[N] &gt; AvgHistorical * 1.40 AND Tx[N] &gt; 15% Allocated)</p>
                <p className="text-emerald-400">THEN Trigger Alert: "SPENDING_SPIKE"</p>
              </div>
            </div>

            {/* Rule 4: Critical Threshold Deviation */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <Activity className="w-4 h-4" /> Rule 4: Threshold Deviation
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800">
                  High Severity
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Flags schemes that have depleted significant shares of their allocation early in the cycle, alerting officers before full exhaustion occurs.
              </p>
              <div className="p-3 bg-slate-950 rounded-lg font-mono text-[11px] text-slate-300 border border-slate-800 space-y-1">
                <p className="text-slate-500">// Threshold Monitoring Condition</p>
                <p className="text-blue-300">IF (Utilization% &ge; CriticalThreshold% [e.g. 95%])</p>
                <p className="text-emerald-400">THEN Trigger Alert: "THRESHOLD_DEVIATION" (Impending Exhaustion)</p>
              </div>
            </div>
          </div>

          {/* AI Forensic Scrutiny Pipeline */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                ✨
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Gemini 3 AI Forensic Scrutiny &amp; Predictive Forecasting</h3>
                <p className="text-[11px] text-slate-400">Complementary generative and predictive analysis layered above rule-based detection</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                <span className="text-indigo-400 font-bold uppercase text-[10px] tracking-wider block">Feature 1</span>
                <h4 className="font-semibold text-white">Forensic Risk Explanation</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Synthesizes transaction categories, vendor concentration, and timing patterns to articulate <em>why</em> an anomaly occurred in statutory governance prose.
                </p>
              </div>
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                <span className="text-indigo-400 font-bold uppercase text-[10px] tracking-wider block">Feature 2</span>
                <h4 className="font-semibold text-white">Mitigation &amp; Re-appropriation</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Recommends specific administrative remedies (e.g. surrender of unutilized balances, inter-scheme diversion, or supplementary demand approvals).
                </p>
              </div>
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                <span className="text-indigo-400 font-bold uppercase text-[10px] tracking-wider block">Feature 3</span>
                <h4 className="font-semibold text-white">Predictive Burn Forecasting</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Simulates month-by-month expenditure velocity to project year-end surplus or deficit with risk scoring and quarterly milestones.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 4: NON-FUNCTIONAL REQUIREMENTS & ARCHITECTURE
          ========================================================================= */}
      {activeSection === 'architecture' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Non-Functional Requirements Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white">Data Security &amp; RBAC</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                SHA-256 password salting, JWT stateless tokens, strict department-scoped queries, and sanitized inputs.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white">Sub-Second Execution</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Indexed telemetry computations ensure dashboard metrics and anomaly scans execute in under 120ms.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Server className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white">Scalable Architecture</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Stateless backend tier supporting hundreds of concurrent departments, thousands of schemes, and millions in vouchers.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white">Statutory Report Export</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Client-side and server-side PDF and CSV report engines generate publication-grade financial records.
              </p>
            </div>
          </div>

          {/* Technology Mapping */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" /> Technology Stack &amp; Deployment Topology
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">Presentation Layer</span>
                <h4 className="text-xs font-semibold text-white">Angular / React 18 + Tailwind CSS</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Responsive single-page application with accessible WCAG AA contrast, Lucide icons, Recharts interactive data visualizers, and jsPDF vector export.
                </p>
              </div>

              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">API &amp; Computation Layer</span>
                <h4 className="text-xs font-semibold text-white">Node.js + Express + TypeScript</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Strictly typed RESTful endpoints (`/api/*`), deterministic rule evaluation engine, background anomaly scanning, and secure Gemini 3 SDK integration.
                </p>
              </div>

              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block">Persistence &amp; Hosting</span>
                <h4 className="text-xs font-semibold text-white">MongoDB + Dual In-Memory Engine</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Production MongoDB Mongoose persistence with seamless zero-dependency in-memory failover, deployed on secure containerized cloud hosting.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 5: TARGET KPIS & BENCHMARKS
          ========================================================================= */}
      {activeSection === 'kpis' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">KPI 1</span>
              <h3 className="text-sm font-bold text-white">Utilization Accuracy</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-emerald-400">100%</span>
                <span className="text-[11px] text-slate-400">deterministic</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Exact two-decimal mathematical precision with zero rounding drift across line-item voucher totals.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">KPI 2</span>
              <h3 className="text-sm font-bold text-white">Under-Utilized Fund Reduction</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-blue-400">&gt; 35%</span>
                <span className="text-[11px] text-slate-400">recovery</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Early Q2/Q3 detection enables timely reallocation before statutory fiscal year-end lapse.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">KPI 3</span>
              <h3 className="text-sm font-bold text-white">Anomalies Detected</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-amber-400">&lt; 1 min</span>
                <span className="text-[11px] text-slate-400">detection lag</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Instant identification upon voucher creation rather than traditional 90-day post-audit discovery.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">KPI 4</span>
              <h3 className="text-sm font-bold text-white">Alert Response Time</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-indigo-400">&lt; 48 hrs</span>
                <span className="text-[11px] text-slate-400">triage cycle</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Structured review queues and assignment workflows ensure swift finance officer resolution.
              </p>
            </div>
          </div>

          {/* Institutional Compliance Checklist */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Statutory Readiness &amp; Governance Checklist
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { title: 'Zero Unapproved Deficit Spending', desc: 'Overspending is automatically blocked or immediately escalated with critical priority.' },
                { title: 'Full Scheme Disaggregation', desc: 'Expenditures are strictly partitioned across departments, fiscal years, and expenditure heads.' },
                { title: 'Public Finance Management System (PFMS) Data Schema', desc: 'Data structures align with statutory Treasury, GeM, and CFMS formats.' },
                { title: 'Immutable Digital Audit Trail', desc: 'Every threshold alteration, voucher insertion, and alert triage is time-stamped.' }
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-950/70 rounded-lg border border-slate-800 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    ✓
                  </span>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">{item.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
