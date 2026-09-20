import React, { useState, useEffect } from 'react';
import { api } from './api';
import { User, Alert } from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginComponent } from './components/LoginComponent';
import { DashboardView } from './components/views/DashboardView';
import { BudgetView } from './components/views/BudgetView';
import { ExpenditureView } from './components/views/ExpenditureView';
import { AnomalyView } from './components/views/AnomalyView';
import { AlertsView } from './components/views/AlertsView';
import { AIInsightsView } from './components/views/AIInsightsView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { AdminView } from './components/views/AdminView';
import { DataSourcesView } from './components/views/DataSourcesView';
import { CodeExplorerView } from './components/views/CodeExplorerView';
import { SystemGuideView } from './components/views/SystemGuideView';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [unreadAlertsCount, setUnreadAlertsCount] = useState<number>(0);
  const [aiInitialBudgetId, setAiInitialBudgetId] = useState<string | undefined>();
  const [aiInitialAnomalyType, setAiInitialAnomalyType] = useState<string | undefined>();
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Initialize Auth on startup with token verification
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = api.getStoredUser();
      const storedToken = api.getStoredToken();

      if (storedUser && storedToken) {
        try {
          const meRes = await api.getMe();
          if (meRes.success && meRes.user) {
            setCurrentUser(meRes.user);
            setIsInitializing(false);
            return;
          }
        } catch {
          // Token expired or invalid, reset session
          api.clearSession();
        }
      }

      // Auto login as default treasury administrator for instant official access
      try {
        const res = await api.login('admin@govbudget.nic.in', 'GovBudget@2026');
        if (res.success && res.user) {
          setCurrentUser(res.user);
        }
      } catch (err) {
        console.warn('Authentication prompt active:', err);
      } finally {
        setIsInitializing(false);
      }
    };
    initAuth();
  }, []);

  // Poll alerts count periodically
  const fetchAlertCount = async () => {
    if (!currentUser) return;
    try {
      const res = await api.getAlertAnalytics();
      if (res.success) {
        setUnreadAlertsCount(res.unreviewedCount || 0);
      }
    } catch {
      // benign
    }
  };

  useEffect(() => {
    fetchAlertCount();
    const interval = setInterval(fetchAlertCount, 15000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setCurrentTab('dashboard');
    fetchAlertCount();
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
  };

  const handleSwitchUser = async (email: string) => {
    try {
      const res = await api.login(email, 'GovBudget@2026');
      if (res.success && res.user) {
        setCurrentUser(res.user);
        if (res.user.role !== 'ADMIN' && currentTab === 'admin') {
          setCurrentTab('dashboard');
        }
        fetchAlertCount();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to switch officer profile');
    }
  };

  const handleRefreshData = async () => {
    try {
      await api.syncLedger();
      await fetchAlertCount();
    } catch (err: any) {
      console.warn('Ledger sync completed with notes:', err);
    }
  };

  const handleOpenAIWithAlert = (budgetId: string, anomalyType: string) => {
    setAiInitialBudgetId(budgetId);
    setAiInitialAnomalyType(anomalyType);
    setCurrentTab('ai-insights');
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-white">Initializing GovBudget AI...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginComponent onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        onLogout={handleLogout}
        onRefreshData={handleRefreshData}
        unreadAlertCount={unreadAlertsCount}
        onNavigateToAlerts={() => setCurrentTab('alerts')}
      />

      {/* Main Applet Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Responsive Left Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          userRole={currentUser.role}
          alertCount={unreadAlertsCount}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {currentTab === 'dashboard' && (
            <DashboardView
              currentUser={currentUser}
              onNavigate={(tab) => setCurrentTab(tab)}
              onNavigateToBudgets={() => setCurrentTab('budgets')}
              onNavigateToExpenditures={() => setCurrentTab('expenditures')}
              onNavigateToAlerts={() => setCurrentTab('alerts')}
              onNavigateToAI={() => setCurrentTab('ai-insights')}
            />
          )}

          {currentTab === 'budgets' && <BudgetView currentUser={currentUser} />}

          {currentTab === 'expenditures' && (
            <ExpenditureView
              currentUser={currentUser}
              onNavigateToAlerts={() => setCurrentTab('alerts')}
            />
          )}

          {currentTab === 'anomalies' && (
            <AnomalyView
              currentUser={currentUser}
              onNavigateToAlerts={() => setCurrentTab('alerts')}
            />
          )}

          {currentTab === 'alerts' && (
            <AlertsView
              currentUser={currentUser}
              onOpenAIWithAlert={handleOpenAIWithAlert}
            />
          )}

          {currentTab === 'ai-insights' && (
            <AIInsightsView
              initialBudgetId={aiInitialBudgetId}
              initialAnomalyType={aiInitialAnomalyType}
            />
          )}

          {currentTab === 'analytics' && <AnalyticsView />}

          {currentTab === 'system-guide' && <SystemGuideView />}

          {currentTab === 'admin' && currentUser.role === 'ADMIN' && <AdminView />}

          {currentTab === 'data-sources' && <DataSourcesView />}

          {currentTab === 'code-explorer' && <CodeExplorerView />}
        </main>
      </div>
    </div>
  );
}
