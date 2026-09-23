import React, { useState, useMemo } from 'react';
import {
  Download,
  Calendar,
  TrendingUp,
  PieChart as PieIcon,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useFinanceStore } from '../../store/useFinanceStore';
import {
  calculateCategoryTotals,
  calculateSavingsRate,
} from '../../utils/financeCalculations';
import { formatINR, formatPercentage } from '../../utils/currencyFormatter';
import { getCategoryMeta } from '../../utils/categoryHelpers';

export const ReportsView: React.FC = () => {
  const { transactions, selectedPeriod, isDarkMode } = useFinanceStore();

  const [dateRangeType, setDateRangeType] = useState<'month' | 'custom'>('month');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  // Transactions filtered by report range
  const reportTransactions = useMemo(() => {
    if (dateRangeType === 'month') {
      return transactions.filter((t) => t.date.startsWith(selectedPeriod));
    }
    if (customStart && customEnd) {
      return transactions.filter(
        (t) => t.date >= customStart && t.date <= customEnd
      );
    }
    return transactions;
  }, [transactions, dateRangeType, selectedPeriod, customStart, customEnd]);

  const totalIncome = reportTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = reportTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = Math.max(0, totalIncome - totalExpense);
  const savingsRate = calculateSavingsRate(totalIncome, totalExpense);

  // Top 5 largest single expenses
  const topExpenses = useMemo(() => {
    return [...reportTransactions]
      .filter((t) => t.type === 'expense')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [reportTransactions]);

  // Category breakdown for report
  const categorySpend = useMemo(() => {
    return calculateCategoryTotals(reportTransactions, 'expense');
  }, [reportTransactions]);

  const categoryArray = Object.entries(categorySpend)
    .map(([cat, amount]) => ({
      category: cat,
      amount,
      percentage:
        totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Top category
  const topCategory = categoryArray[0];

  // Daily spend trend data
  const dailySpendMap: Record<string, number> = {};
  reportTransactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      dailySpendMap[t.date] = (dailySpendMap[t.date] || 0) + t.amount;
    });

  const dailySpendData = Object.entries(dailySpendMap)
    .map(([date, amount]) => ({
      date: date.slice(5), // MM-DD
      amount,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Export CSV
  const handleExportCSV = () => {
    if (reportTransactions.length === 0) return;

    const headers = [
      'ID',
      'Date',
      'Type',
      'Category',
      'Amount (INR)',
      'Description',
      'Payment Method',
    ];

    const rows = reportTransactions.map((t) => [
      t.id,
      t.date,
      t.type,
      t.category,
      t.amount,
      `"${t.description.replace(/"/g, '""')}"`,
      t.paymentMethod,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `finpulse_report_${dateRangeType === 'month' ? selectedPeriod : 'custom'}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header and Date Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Financial Reports & Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Deep dive into historical cashflow, category distribution, and top expenses
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Range Mode Toggle */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setDateRangeType('month')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                dateRangeType === 'month'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Current Month ({selectedPeriod})
            </button>
            <button
              onClick={() => setDateRangeType('custom')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                dateRangeType === 'custom'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Custom Date Range
            </button>
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            disabled={reportTransactions.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report CSV</span>
          </button>
        </div>
      </div>

      {/* Custom Date Picker Bar */}
      {dateRangeType === 'custom' && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600 dark:text-slate-400">
              Start Date:
            </span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600 dark:text-slate-400">
              End Date:
            </span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Income
          </span>
          <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatINR(totalIncome)}
          </h3>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Across selected date range
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Expenses
          </span>
          <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {formatINR(totalExpense)}
          </h3>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Across selected date range
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Savings Rate
          </span>
          <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {formatPercentage(savingsRate)}
          </h3>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Net: {formatINR(netSavings)}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Primary Cost Driver
          </span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1 truncate">
            {topCategory ? topCategory.category : 'N/A'}
          </h3>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {topCategory
              ? `${topCategory.percentage}% of expenses (${formatINR(topCategory.amount)})`
              : 'No expenses'}
          </span>
        </div>
      </div>

      {/* Daily Expense Burn Trend Chart */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Daily Expense Distribution
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Day-by-day spending spikes across the chosen timeframe
          </p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={dailySpendData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDarkMode ? '#1e293b' : '#f1f5f9'}
              />
              <XAxis
                dataKey="date"
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
                formatter={(val: any) => [formatINR(Number(val)), 'Spent']}
                contentStyle={{
                  backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                  borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                  borderRadius: '0.75rem',
                  color: isDarkMode ? '#f8fafc' : '#0f172a',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#expenseGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Category Breakdown Table & Top 5 Largest Outgoings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Table */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Category Breakdown
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ranking categories by percentage of total spend
            </p>
          </div>

          {categoryArray.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No expenses in this report period.
            </div>
          ) : (
            <div className="space-y-3">
              {categoryArray.map((item) => {
                const meta = getCategoryMeta(item.category as any);
                return (
                  <div key={item.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: meta.color }}
                        />
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {item.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 font-medium">
                          {item.percentage}%
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {formatINR(item.amount)}
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: meta.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top 5 Largest Single Expenses */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Top 5 Largest Expenses
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Biggest single purchases in this period
              </p>
            </div>
            <Flame className="w-5 h-5 text-rose-500" />
          </div>

          {topExpenses.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No expenses recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {topExpenses.map((tx, idx) => (
                <div
                  key={tx.id}
                  className="py-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 dark:text-slate-400 text-[10px] shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-slate-900 dark:text-white truncate">
                        {tx.description}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {tx.category} • {tx.date}
                      </p>
                    </div>
                  </div>

                  <span className="font-bold text-rose-600 dark:text-rose-400 shrink-0">
                    -{formatINR(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
