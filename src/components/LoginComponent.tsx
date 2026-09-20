import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { User, Department } from '../types';
import { Shield, Lock, Mail, ArrowRight, UserCheck, AlertCircle, UserPlus, Building2, UserCircle2 } from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher';

interface LoginComponentProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginComponent: React.FC<LoginComponentProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  
  // Sign-in states
  const [email, setEmail] = useState('admin@govbudget.nic.in');
  const [password, setPassword] = useState('GovBudget@2026');
  
  // Register states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'ADMIN' | 'FINANCE_OFFICER' | 'DEPARTMENT_HEAD'>('FINANCE_OFFICER');
  const [regDepartmentId, setRegDepartmentId] = useState('');
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch departments for registration dropdown
  useEffect(() => {
    const loadDepts = async () => {
      try {
        const res = await api.getDepartments();
        if (res.success && res.departments) {
          setDepartments(res.departments);
          if (res.departments.length > 0) {
            setRegDepartmentId(res.departments[0]._id);
          }
        }
      } catch (err) {
        console.error('Could not load departments:', err);
      }
    };
    loadDepts();
  }, []);

  const handleSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await api.login(email, password);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMessage('Authentication rejected by government identity provider.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid credentials or connection error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMessage('Please provide full name, email, and password.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.register({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword.trim(),
        role: regRole,
        departmentId: regDepartmentId || null
      });

      if (res.success && res.user) {
        setSuccessMessage('Official account registered successfully. Access granted.');
        setTimeout(() => {
          onLoginSuccess(res.user);
        }, 600);
      } else {
        setErrorMessage('Registration failed. Please verify submitted details.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectDirectoryUser = async (userEmail: string, pass: string) => {
    setEmail(userEmail);
    setPassword(pass);
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await api.login(userEmail, pass);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 selection:bg-blue-600 selection:text-white relative">
      {/* Top Accessibility Theme Bar */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeSwitcher variant="compact" />
      </div>

      {/* Container */}
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center text-3xl shadow-lg border border-blue-400/30">
            🏛️
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">GovBudget AI</h1>
          <p className="text-xs text-slate-400">
            National Public Financial Management &amp; Anomaly Detection Portal
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-slate-950 border border-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setActiveTab('signin');
              setErrorMessage('');
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'signin'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Official Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrorMessage('');
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'register'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Register Officer
          </button>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <UserCheck className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Sign In Form */}
        {activeTab === 'signin' && (
          <div className="space-y-5">
            <form onSubmit={handleSignIn} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-slate-300 font-semibold">Government / Organization Email ID</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="officer@govbudget.nic.in"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-300 font-semibold">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition shadow-md"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Authenticate Officer</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Access Directory */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block text-center">
                Institutional Officer Directory &bull; Fast Access
              </span>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => selectDirectoryUser('admin@govbudget.nic.in', 'GovBudget@2026')}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-blue-600/60 text-left flex items-center justify-between text-xs transition"
                >
                  <div>
                    <p className="font-semibold text-white">Dr. Rajesh Sharma (IAS) — Treasury Admin</p>
                    <p className="text-[10px] text-slate-400">admin@govbudget.nic.in</p>
                  </div>
                  <span className="text-[10px] font-bold text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-900">
                    Full Authority
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => selectDirectoryUser('finance@govbudget.nic.in', 'GovBudget@2026')}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-600/60 text-left flex items-center justify-between text-xs transition"
                >
                  <div>
                    <p className="font-semibold text-white">Priya Narayanan — Finance &amp; Accounts Officer</p>
                    <p className="text-[10px] text-slate-400">finance@govbudget.nic.in</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-900">
                    Disbursements
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => selectDirectoryUser('head@govbudget.nic.in', 'GovBudget@2026')}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-600/60 text-left flex items-center justify-between text-xs transition"
                >
                  <div>
                    <p className="font-semibold text-white">Sunil Verma — Principal Secretary (Health)</p>
                    <p className="text-[10px] text-slate-400">head@govbudget.nic.in</p>
                  </div>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-900">
                    Departmental
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Register Officer Form */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="block text-slate-300 font-semibold">Official Full Name</label>
              <div className="relative">
                <UserCircle2 className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Arun Kumar (Deputy Secretary)"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-slate-300 font-semibold">Official Email ID</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="e.g. arun.kumar@finance.gov.in"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-slate-300 font-semibold">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-slate-300 font-semibold">Institutional Role</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="FINANCE_OFFICER">Finance Officer</option>
                  <option value="DEPARTMENT_HEAD">Department Head</option>
                  <option value="ADMIN">Treasury Administrator</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-300 font-semibold">Assigned Department</label>
                <div className="relative">
                  <select
                    value={regDepartmentId}
                    onChange={(e) => setRegDepartmentId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Central Treasury / Cross-Departmental</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 mt-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition shadow-md"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account &amp; Access System</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Security badge */}
        <div className="text-center pt-2">
          <span className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
            <Shield className="w-3 h-3 text-slate-500" />
            Statutory Public Finance System &bull; 256-Bit Cryptographic Ledger
          </span>
        </div>
      </div>
    </div>
  );
};
