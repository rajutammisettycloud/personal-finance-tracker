import React, { useState, useEffect } from 'react';
import { useFinanceStore } from './store/useFinanceStore';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { TransactionsView } from './components/transactions/TransactionsView';
import { BudgetsView } from './components/budgets/BudgetsView';
import { GoalsView } from './components/goals/GoalsView';
import { ReportsView } from './components/reports/ReportsView';
import { SmartInsightsView } from './components/insights/SmartInsightsView';
import { TransactionModal } from './components/transactions/TransactionModal';
import { BudgetModal } from './components/budgets/BudgetModal';
import { GoalModal } from './components/goals/GoalModal';
import { ContributeModal } from './components/goals/ContributeModal';
import { AuthModal } from './components/auth/AuthModal';
import { generateSmartInsights } from './utils/smartInsights';
import { Transaction, Budget, SavingsGoal } from './types/finance';

export const App: React.FC = () => {
  const {
    isDarkMode,
    transactions,
    budgets,
    goals,
    selectedPeriod,
    addTransaction,
    updateTransaction,
    addBudget,
    updateBudget,
    addGoal,
    updateGoal,
    contributeToGoal,
  } = useFinanceStore();

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  const [contributingGoal, setContributingGoal] = useState<SavingsGoal | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sync theme with DOM root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Insights for sidebar badge
  const insights = generateSmartInsights({
    transactions,
    budgets,
    goals,
    currentPeriod: selectedPeriod,
  });
  const highPriorityInsights = insights.filter(
    (i) => i.type === 'alert' || i.urgency === 'high'
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        onOpenAddTransaction={() => {
          setEditingTx(null);
          setIsTxModalOpen(true);
        }}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area with Sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto pb-20 md:pb-8">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          insightAlertCount={highPriorityInsights}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">
          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigateTab={setActiveTab}
              onAddTransaction={() => {
                setEditingTx(null);
                setIsTxModalOpen(true);
              }}
              onEditTransaction={(tx) => {
                setEditingTx(tx);
                setIsTxModalOpen(true);
              }}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsView
              onAddTransaction={() => {
                setEditingTx(null);
                setIsTxModalOpen(true);
              }}
              onEditTransaction={(tx) => {
                setEditingTx(tx);
                setIsTxModalOpen(true);
              }}
            />
          )}

          {activeTab === 'budgets' && (
            <BudgetsView
              onAddBudget={() => {
                setEditingBudget(null);
                setIsBudgetModalOpen(true);
              }}
              onEditBudget={(budget) => {
                setEditingBudget(budget);
                setIsBudgetModalOpen(true);
              }}
            />
          )}

          {activeTab === 'goals' && (
            <GoalsView
              onAddGoal={() => {
                setEditingGoal(null);
                setIsGoalModalOpen(true);
              }}
              onEditGoal={(goal) => {
                setEditingGoal(goal);
                setIsGoalModalOpen(true);
              }}
              onContributeGoal={(goal) => {
                setContributingGoal(goal);
                setIsContributeModalOpen(true);
              }}
            />
          )}

          {activeTab === 'reports' && <ReportsView />}

          {activeTab === 'insights' && <SmartInsightsView />}
        </main>
      </div>

      {/* Global Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTx(null);
        }}
        onSubmit={(data) => {
          if (editingTx) {
            updateTransaction(editingTx.id, data as any);
          } else {
            addTransaction(data as any);
          }
        }}
        initialData={editingTx}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => {
          setIsBudgetModalOpen(false);
          setEditingBudget(null);
        }}
        onSubmit={(data) => {
          if (editingBudget) {
            updateBudget(editingBudget.id, data as any);
          } else {
            addBudget(data as any);
          }
        }}
        currentPeriod={selectedPeriod}
        initialData={editingBudget}
      />

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setEditingGoal(null);
        }}
        onSubmit={(data) => {
          if (editingGoal) {
            updateGoal(editingGoal.id, data as any);
          } else {
            addGoal(data as any);
          }
        }}
        initialData={editingGoal}
      />

      <ContributeModal
        isOpen={isContributeModalOpen}
        onClose={() => {
          setIsContributeModalOpen(false);
          setContributingGoal(null);
        }}
        goal={contributingGoal}
        onContribute={(goalId, amount, note) => {
          contributeToGoal(goalId, amount, note);
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default App;
