import React, { useState } from 'react';
import {
  PiggyBank,
  Plus,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Edit2,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import {
  calculateBudgetUtilization,
  calculateMonthlyExpense,
} from '../../utils/financeCalculations';
import { formatINR, formatPercentage } from '../../utils/currencyFormatter';
import { getCategoryMeta, EXPENSE_CATEGORIES } from '../../utils/categoryHelpers';
import { Budget } from '../../types/finance';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface BudgetsViewProps {
  onAddBudget: () => void;
  onEditBudget: (budget: Budget) => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  onAddBudget,
  onEditBudget,
}) => {
  const {
    budgets,
    transactions,
    selectedPeriod,
    deleteBudget,
    isDarkMode,
  } = useFinanceStore();

  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);

  // Budgets for currently selected period
  const periodBudgets = budgets.filter((b) => b.period === selectedPeriod);
  const utilizations = calculateBudgetUtilization(
    periodBudgets,
    transactions,
    selectedPeriod
  );

  const totalLimit = periodBudgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
  const totalSpent = utilizations.reduce((sum, u) => sum + u.spent, 0);
  const totalRemaining = Math.max(0, totalLimit - totalSpent);
  const totalPercent =
    totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

  // Unbudgeted categories in this month
  const budgetedCategories = periodBudgets.map((b) => b.category);
  const unbudgetedCategories = EXPENSE_CATEGORIES.filter(
    (c) => !budgetedCategories.includes(c)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Monthly Budgets
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Set and monitor category spending thresholds for {selectedPeriod}
          </p>
        </div>

        <button
          type="button"
          onClick={onAddBudget}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category Budget</span>
        </button>
      </div>

      {/* Aggregate Budget Health Bar */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Budget Overview
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                {formatINR(totalSpent)}
              </h3>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                of {formatINR(totalLimit)} limit
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400">Buffer Remaining: </span>
              <span
                className={
                  totalRemaining > 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }
              >
                {formatINR(totalRemaining)}
              </span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400">Utilization: </span>
              <span
                className={
                  totalPercent > 100
                    ? 'text-rose-600'
                    : totalPercent > 80
                    ? 'text-amber-500'
                    : 'text-indigo-600 dark:text-indigo-400'
                }
              >
                {totalPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              totalPercent >= 100
                ? 'bg-rose-500'
                : totalPercent >= 80
                ? 'bg-amber-500'
                : 'bg-indigo-600'
            }`}
            style={{ width: `${Math.min(100, totalPercent)}%` }}
          />
        </div>
      </div>

      {/* Category Budgets Grid */}
      {utilizations.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 flex items-center justify-center mx-auto">
            <PiggyBank className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No budgets created for {selectedPeriod}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Setting monthly category limits helps prevent overspending and gives you early warnings.
          </p>
          <button
            type="button"
            onClick={onAddBudget}
            className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all"
          >
            Create First Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {utilizations.map((u) => {
            const meta = getCategoryMeta(u.budget.category);
            const Icon = meta.icon;
            const isExceeded = u.status === 'exceeded';
            const isWarning = u.status === 'warning';

            return (
              <div
                key={u.budget.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between hover:shadow-lg hover:shadow-slate-950/5 transition-all group"
              >
                <div>
                  {/* Category Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2.5 rounded-xl shrink-0"
                        style={{
                          backgroundColor: isDarkMode
                            ? meta.darkBgColor
                            : meta.bgColor,
                          color: meta.color,
                        }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {u.budget.category}
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          {selectedPeriod}
                        </span>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div>
                      {isExceeded ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                          <AlertCircle className="w-3 h-3" /> Over Budget
                        </span>
                      ) : isWarning ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                          <AlertTriangle className="w-3 h-3" /> Near Limit
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle className="w-3 h-3" /> On Track
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="mt-4 mb-2 flex items-baseline justify-between">
                    <div>
                      <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                        {formatINR(u.spent)}
                      </span>
                      <span className="text-xs text-slate-400 ml-1">
                        / {formatINR(u.budget.monthlyLimit)}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      {u.percentUsed}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden mb-3">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        isExceeded
                          ? 'bg-rose-500'
                          : isWarning
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, u.percentUsed)}%` }}
                    />
                  </div>

                  {/* Remaining / Over text */}
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isExceeded ? (
                      <span className="text-rose-500 font-semibold">
                        Over budget by {formatINR(u.spent - u.budget.monthlyLimit)}
                      </span>
                    ) : (
                      <span>
                        <strong className="text-slate-900 dark:text-white">
                          {formatINR(u.remaining)}
                        </strong>{' '}
                        remaining for rest of month
                      </span>
                    )}
                  </p>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => onEditBudget(u.budget)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs flex items-center gap-1 font-medium"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBudgetToDelete(u.budget)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs flex items-center gap-1 font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Deletion Dialog */}
      <ConfirmDialog
        isOpen={Boolean(budgetToDelete)}
        onClose={() => setBudgetToDelete(null)}
        onConfirm={() => {
          if (budgetToDelete) {
            deleteBudget(budgetToDelete.id);
            setBudgetToDelete(null);
          }
        }}
        title="Delete Category Budget"
        message={`Are you sure you want to remove the ${budgetToDelete?.category} monthly budget of ${formatINR(
          budgetToDelete?.monthlyLimit || 0
        )}?`}
        confirmText="Delete Budget"
        isDestructive={true}
      />
    </div>
  );
};
