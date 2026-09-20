import React, { useState } from 'react';
import { User } from '../types';
import { Shield, RefreshCw, LogOut, Bell, CheckCircle2, ChevronDown, UserCircle2 } from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher';

interface NavbarProps {
  currentUser: User | null;
  onSwitchUser: (email: string) => void;
  onLogout: () => void;
  onRefreshData?: () => Promise<any> | void;
  unreadAlertCount: number;
  onNavigateToAlerts: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSwitchUser,
  onLogout,
  onRefreshData,
  unreadAlertCount,
  onNavigateToAlerts
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      if (onRefreshData) {
        await onRefreshData();
      }
      setSyncNotice('Telemetry Synchronized');
      setTimeout(() => setSyncNotice(null), 3000);
    } catch {
      setSyncNotice('Sync Error');
      setTimeout(() => setSyncNotice(null), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return {
          label: 'Treasury Admin',
          classes: 'bg-blue-950 text-blue-300 border-blue-800'
        };
      case 'FINANCE_OFFICER':
        return {
          label: 'Finance Officer',
          classes: 'bg-emerald-950 text-emerald-300 border-emerald-800'
        };
      case 'DEPARTMENT_HEAD':
        return {
          label: 'Department Head',
          classes: 'bg-amber-950 text-amber-300 border-amber-800'
        };
      default:
        return {
          label: 'Public Officer',
          classes: 'bg-slate-800 text-slate-300 border-slate-700'
        };
    }
  };

  const roleInfo = getRoleBadge(currentUser?.role);

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 px-4 lg:px-6 py-2.5">
      <div className="flex items-center justify-between">
        {/* Brand & Emblem */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-700 to-indigo-900 flex items-center justify-center text-lg shadow-md border border-blue-500/30">
            🏛️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-white tracking-tight">GovBudget AI</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-950/90 text-emerald-300 border border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Live System
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden md:block">
              National Public Financial Management &amp; Utilization Surveillance
            </p>
          </div>
        </div>

        {/* Action Controls & Role Context */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Accessibility Theme Switcher */}
          <ThemeSwitcher variant="compact" />

          {/* Real-Time Sync Button */}
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition shadow-sm"
            title="Perform real-time ledger audit and refresh anomaly telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">
              {isSyncing ? 'Syncing...' : syncNotice || 'Sync Ledger'}
            </span>
          </button>

          {/* Unread Alerts notification button */}
          <button
            onClick={onNavigateToAlerts}
            className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="View Active Financial Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {unreadAlertCount}
              </span>
            )}
          </button>

          {/* Officer Account Switcher & Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-950 border border-slate-800 text-left transition"
              title="Active Officer Profile"
            >
              <UserCircle2 className="w-5 h-5 text-slate-400 shrink-0" />
              <div className="text-right hidden sm:block max-w-[150px]">
                <p className="text-xs font-semibold text-white truncate">{currentUser?.name}</p>
                <span className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded border ${roleInfo.classes}`}>
                  {roleInfo.label}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>

            {/* Dropdown Menu */}
            {isAccountMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50 space-y-3">
                <div className="pb-2 border-b border-slate-800">
                  <p className="text-xs font-semibold text-white">{currentUser?.name}</p>
                  <p className="text-[11px] text-slate-400">{currentUser?.email}</p>
                  <div className="mt-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${roleInfo.classes}`}>
                      {roleInfo.label}
                    </span>
                  </div>
                </div>

                {/* Quick Switch Profiles */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Active Personnel
                  </p>
                  <button
                    onClick={() => {
                      onSwitchUser('admin@govbudget.nic.in');
                      setIsAccountMenuOpen(false);
                    }}
                    className="w-full text-left p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800/80 text-xs transition"
                  >
                    <p className="font-medium text-white">Dr. Rajesh Sharma (IAS)</p>
                    <p className="text-[10px] text-blue-400">admin@govbudget.nic.in &bull; Treasury Admin</p>
                  </button>

                  <button
                    onClick={() => {
                      onSwitchUser('finance@govbudget.nic.in');
                      setIsAccountMenuOpen(false);
                    }}
                    className="w-full text-left p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800/80 text-xs transition"
                  >
                    <p className="font-medium text-white">Priya Narayanan</p>
                    <p className="text-[10px] text-emerald-400">finance@govbudget.nic.in &bull; Finance Officer</p>
                  </button>

                  <button
                    onClick={() => {
                      onSwitchUser('head@govbudget.nic.in');
                      setIsAccountMenuOpen(false);
                    }}
                    className="w-full text-left p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800/80 text-xs transition"
                  >
                    <p className="font-medium text-white">Sunil Verma</p>
                    <p className="text-[10px] text-amber-400">head@govbudget.nic.in &bull; Health Dept Head</p>
                  </button>
                </div>

                {/* Display Theme & Accessibility Setting */}
                <div className="pt-2 border-t border-slate-800 space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Accessibility & Display
                  </p>
                  <ThemeSwitcher variant="full" />
                </div>

                {/* Sign Out */}
                <div className="pt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setIsAccountMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-semibold border border-red-800/60 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out Official Session
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
