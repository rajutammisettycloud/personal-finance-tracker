import React from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  TrendingUp,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Receipt,
  Plus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useFinanceStore } from '../../store/useFinanceStore';
import {
  calculateFinancialSummary,
  calculateCategoryTotals,
  filterTransactionsByMonth,
} from '../../utils/financeCalculations';
import { generateSmartInsights } from '../../utils/smartInsights';
import { formatINR, formatPercentage } from '../../utils/currencyFormatter';
import { getCategoryMeta } from '../../utils/categoryHelpers';
import { StatCard } from '../common/StatCard';
import { ActiveTab } from '../layout/Sidebar';
import { Transaction } from '../../types/finance';

interface DashboardViewProps {
  onNavigateTab: (tab: ActiveTab) => void;
  onAddTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onAddTransaction,
  onEditTransaction,
}) => {
  const { transactions, budgets, goals, selectedPeriod, isDarkMode } =
    useFinanceStore();

  const summary = calculateFinancialSummary(
    transactions,
    budgets,
    selectedPeriod
  );
  const currentMonthTx = filterTransactionsByMonth(
    transactions,
    selectedPeriod
  );
  const insights = generateSmartInsights({
    transactions,
    budgets,
    goals,
    currentPeriod: selectedPeriod,
  });

  // Category breakdown for Donut chart
  const categorySpend = calculateCategoryTotals(
    transactions,
    'expense',
    selectedPeriod
  );
  const donutData = Object.entries(categorySpend).map(([category, value]) => {
    const meta = getCategoryMeta(category as any);
    return {
      name: category,
      value,
      color: meta.color,
    };
  });

  // Historical 6-month Income vs Expense data for Bar Chart
  const historicalData = [];
  const [yearStr, monthStr] = selectedPeriod.split('-');
  const baseYear = parseInt(yearStr, 10);
  const baseMonth = parseInt(monthStr, 10);

  for (let i = 5; i >= 0; i--) {
    const d = new Date(baseYear, baseMonth - 1 - i, 1);
    const p = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const mLabel = d.toLocaleDateString('en-US', { month: 'short' });

    const inc = transactions
      .filter((t) => t.date.startsWith(p) && t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const exp = transactions
      .filter((t) => t.date.startsWith(p) && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    historicalData.push({
      month: mLabel,
      Income: inc,
      Expense: exp,
    });
  }

  // Recent 5 transactions
  const recentTransactions = [...currentMonthTx]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const topInsight = insights[0];

  return (
    <div className="space-y-6">
      {/* Top Banner if High Priority Insight exists */}
      {topInsight && (
        <div
          onClick={() => onNavigateTab('insights')}
          className="cursor-pointer group relative overflow-hidden rounded-2xl p-4 bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/50 border border-indigo-500/30 backdrop-blur-md shadow-sm transition-all hover:border-indigo-500/50"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    Smart Financial Insight
                  </span>
                  <span className="text-[11px] px-2 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold">
                    {topInsight.type.toUpperCase()}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-white mt-0.5 group-hover:text-indigo-200 transition-colors">
                  {topInsight.title}: {topInsight.description}
                </h4>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-xs font-medium text-indigo-300 shrink-0">
              <span>View Analysis</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      )}

      {/* Primary Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Net Balance"
          amount={formatINR(summary.totalBalance)}
          subtitle="Lifetime cumulative cashflow"
          icon={Wallet}
          variant="default"
        />
        <StatCard
          title="Monthly Income"
          amount={formatINR(summary.monthlyIncome)}
          trend={{
            value: `+${currentMonthTx.filter((t) => t.type === 'income').length} deposits`,
            isPositive: true,
          }}
          icon={ArrowUpRight}
          variant="income"
        />
        <StatCard
          title="Monthly Expenses"
          amount={formatINR(summary.monthlyExpenses)}
          trend={{
            value: `${currentMonthTx.filter((t) => t.type === 'expense').length} transactions`,
            isPositive: false,
          }}
          icon={ArrowDownRight}
          variant="expense"
        />
        <StatCard
          title="Net Savings & Rate"
          amount={formatINR(summary.monthlySavings)}
          subtitle={`Savings Rate: ${formatPercentage(summary.savingsRate)}`}
          icon={PiggyBank}
          variant="savings"
        />
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Income vs Expense 6-Month Comparison */}
        <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Income vs. Expenses
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                6-Month historical cashflow trend
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Income
              </span>
              <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Expense
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={historicalData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDarkMode ? '#1e293b' : '#f1f5f9'}
                />
                <XAxis
                  dataKey="month"
                  stroke={isDarkMode ? '#64748b' : '#94a3b8'}
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke={isDarkMode ? '#64748b' : '#94a3b8'}
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: any) => [formatINR(Number(value)), '']}
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                    borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                    borderRadius: '0.75rem',
                    color: isDarkMode ? '#f8fafc' : '#0f172a',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spending by Category Donut Chart */}
        <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Spending by Category
              </h3>
              <span className="text-xs text-slate-400 font-semibold">
                {selectedPeriod}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              Outgoings breakdown across primary categories
            </p>
          </div>

          {donutData.length === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center text-slate-400 text-xs text-center p-4">
              <Receipt className="w-8 h-8 mb-2 opacity-40" />
              <span>No expenses recorded for this month yet.</span>
            </div>
          ) : (
            <div className="relative h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [formatINR(Number(value)), 'Amount']}
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                      borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                      borderRadius: '0.75rem',
                      color: isDarkMode ? '#f8fafc' : '#0f172a',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[11px] text-slate-400 font-medium">
                  Total Spent
                </span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {formatINR(summary.monthlyExpenses)}
                </span>
              </div>
            </div>
          )}

          {/* Quick Legend Chips */}
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            {donutData.slice(0, 4).map((entry) => (
              <div
                key={entry.name}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-[11px] text-slate-600 dark:text-slate-300"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="truncate max-w-[80px]">{entry.name}</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatINR(entry.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Transactions & Budget Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Transactions Table */}
        <div className="lg:col-span-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Recent Transactions
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Latest transactions for {selectedPeriod}
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('transactions')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs">
              No transactions found for this period. Click "Add Transaction" to create one.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {recentTransactions.map((tx) => {
                const meta = getCategoryMeta(tx.category);
                const Icon = meta.icon;
                const isIncome = tx.type === 'income';

                return (
                  <div
                    key={tx.id}
                    onClick={() => onEditTransaction(tx)}
                    className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="p-2.5 rounded-xl shrink-0"
                        style={{
                          backgroundColor: isDarkMode ? meta.darkBgColor : meta.bgColor,
                          color: meta.color,
                        }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {tx.description}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span>{tx.category}</span>
                          <span>•</span>
                          <span>{tx.date}</span>
                          <span>•</span>
                          <span className="font-medium text-slate-500 dark:text-slate-400">
                            {tx.paymentMethod}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-sm font-bold ${
                          isIncome
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {isIncome ? '+' : '-'}{formatINR(tx.amount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Budget Remaining Widget */}
        <div className="lg:col-span-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Monthly Budget Health
              </h3>
              <button
                onClick={() => onNavigateTab('budgets')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Manage
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Overall monthly expenditure vs limit
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-500 dark:text-slate-400">Spent so far:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatINR(summary.totalBudgetSpent)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-500 dark:text-slate-400">Total Budget:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatINR(summary.totalBudget)}
                </span>
              </div>

              {/* Overall progress bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    summary.totalBudgetSpent > summary.totalBudget
                      ? 'bg-rose-500'
                      : summary.totalBudgetSpent / (summary.totalBudget || 1) > 0.8
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      summary.totalBudget > 0
                        ? (summary.totalBudgetSpent / summary.totalBudget) * 100
                        : 0
                    )}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Remaining Buffer:
                </span>
                <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                  {formatINR(summary.budgetRemaining)}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={onAddTransaction}
              className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Record New Transaction</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
