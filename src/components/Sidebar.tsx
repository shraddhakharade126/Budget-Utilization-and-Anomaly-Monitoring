import React from 'react';
import { UserRole } from '../types';
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  ScanEye,
  AlertTriangle,
  BrainCircuit,
  BarChart3,
  Sliders,
  Database,
  Code2,
  FileCheck,
  BookOpen
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  userRole: UserRole;
  alertCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  userRole,
  alertCount
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'budgets', label: 'Budget Management', icon: Wallet },
    { id: 'expenditures', label: 'Expenditure Tracking', icon: Receipt },
    { id: 'anomalies', label: 'Anomaly Engine', icon: ScanEye },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle, badge: alertCount },
    { id: 'ai-insights', label: 'AI Insights & Media', icon: BrainCircuit, tag: 'Gemini 3' },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
    { id: 'system-guide', label: 'System Guide & Spec', icon: BookOpen, tag: 'Spec' },
    ...(userRole === 'ADMIN'
      ? [{ id: 'admin', label: 'Admin Governance', icon: Sliders, tag: 'Admin Only' }]
      : [])
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 shrink-0 min-h-[calc(100vh-61px)]">
      <div className="space-y-6">
        <div>
          <p className="text-[11px] uppercase font-bold tracking-wider text-slate-500 px-3 mb-2">
            Governance Navigation
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-600 text-white">
                        {item.badge}
                      </span>
                    )}
                    {item.tag && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                          isActive
                            ? 'bg-blue-800 text-blue-100'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {item.tag}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Info Box - Institutional Public Finance Status */}
      <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center justify-between text-slate-300 font-semibold">
          <span>Audit Status</span>
          <span className="text-emerald-400 font-medium text-[10px] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Real-time Active
          </span>
        </div>
        <p className="text-[10px] text-slate-500 leading-tight">
          Ministry of Finance &bull; Public Financial Surveillance System
        </p>
      </div>
    </aside>
  );
};
