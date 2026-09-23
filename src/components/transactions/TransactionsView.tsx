import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Plus,
  Trash2,
  Edit2,
  Receipt,
  CheckCircle2,
  Calendar,
  CreditCard,
} from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import {
  Transaction,
  TransactionCategory,
  PaymentMethod,
} from '../../types/finance';
import { formatINR } from '../../utils/currencyFormatter';
import { getCategoryMeta, ALL_CATEGORIES } from '../../utils/categoryHelpers';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface TransactionsViewProps {
  onAddTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  onAddTransaction,
  onEditTransaction,
}) => {
  const {
    transactions,
    deleteTransaction,
    selectedPeriod,
    isDarkMode,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    categoryFilter,
    setCategoryFilter,
    paymentMethodFilter,
    setPaymentMethodFilter,
    sortBy,
    setSortBy,
  } = useFinanceStore();

  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);
  const [filterPeriod, setFilterPeriod] = useState<string>('all');

  // Filtered and sorted transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        // Search query
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchDesc = t.description.toLowerCase().includes(q);
          const matchCat = t.category.toLowerCase().includes(q);
          const matchNotes = t.notes?.toLowerCase().includes(q);
          if (!matchDesc && !matchCat && !matchNotes) return false;
        }

        // Type filter
        if (typeFilter !== 'all' && t.type !== typeFilter) {
          return false;
        }

        // Category filter
        if (categoryFilter !== 'all' && t.category !== categoryFilter) {
          return false;
        }

        // Payment method filter
        if (
          paymentMethodFilter !== 'all' &&
          t.paymentMethod !== paymentMethodFilter
        ) {
          return false;
        }

        // Period filter (All or Selected Month)
        if (filterPeriod === 'current' && !t.date.startsWith(selectedPeriod)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        if (sortBy === 'date-asc') {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        if (sortBy === 'amount-desc') {
          return b.amount - a.amount;
        }
        if (sortBy === 'amount-asc') {
          return a.amount - b.amount;
        }
        return 0;
      });
  }, [
    transactions,
    searchQuery,
    typeFilter,
    categoryFilter,
    paymentMethodFilter,
    filterPeriod,
    selectedPeriod,
    sortBy,
  ]);

  // Aggregate sums of filtered results
  const filteredIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const filteredExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const filteredNet = filteredIncome - filteredExpense;

  // Export to CSV functionality
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;

    const headers = [
      'ID',
      'Date',
      'Type',
      'Category',
      'Amount (INR)',
      'Description',
      'Payment Method',
      'Recurring',
      'Notes',
    ];

    const rows = filteredTransactions.map((t) => [
      t.id,
      t.date,
      t.type,
      t.category,
      t.amount,
      `"${t.description.replace(/"/g, '""')}"`,
      t.paymentMethod,
      t.isRecurring ? 'Yes' : 'No',
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `finpulse_transactions_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Transactions
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Search, filter, categorize, and audit your financial activities
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={filteredTransactions.length === 0}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={onAddTransaction}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-4 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search description, category, note..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Type Filter */}
          <div className="sm:col-span-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="income">Income Only</option>
              <option value="expense">Expenses Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Categories</option>
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Filter */}
          <div className="sm:col-span-2">
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Methods</option>
              <option value="UPI">UPI</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Net Banking">Net Banking</option>
              <option value="Cash">Cash</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="sm:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Filter Summary Metrics */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400">
              Showing{' '}
              <strong className="text-slate-900 dark:text-white">
                {filteredTransactions.length}
              </strong>{' '}
              transactions
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-400">Income: </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                +{formatINR(filteredIncome)}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Expenses: </span>
              <span className="font-bold text-rose-600 dark:text-rose-400">
                -{formatINR(filteredExpense)}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Net: </span>
              <span
                className={`font-bold ${
                  filteredNet >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {filteredNet >= 0 ? '+' : ''}
                {formatINR(filteredNet)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table & Cards */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No transactions match your filters
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search query, type, or category filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Transaction / Category</th>
                  <th className="py-3.5 px-4 hidden sm:table-cell">Date</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Payment Method</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredTransactions.map((tx) => {
                  const meta = getCategoryMeta(tx.category);
                  const Icon = meta.icon;
                  const isIncome = tx.type === 'income';

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="py-3.5 px-4">
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
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900 dark:text-white text-sm">
                                {tx.description}
                              </span>
                              {tx.isRecurring && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                                  Recurring
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 mt-0.5">
                              <span>{tx.category}</span>
                              <span className="sm:hidden">•</span>
                              <span className="sm:hidden">{tx.date}</span>
                              {tx.notes && (
                                <>
                                  <span>•</span>
                                  <span className="italic text-slate-500">
                                    {tx.notes}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 hidden sm:table-cell text-slate-600 dark:text-slate-300 font-medium">
                        {tx.date}
                      </td>

                      <td className="py-3.5 px-4 hidden md:table-cell">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                          <CreditCard className="w-3 h-3 text-slate-400" />
                          <span>{tx.paymentMethod}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`text-sm font-extrabold ${
                            isIncome
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {isIncome ? '+' : '-'}{formatINR(tx.amount)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => onEditTransaction(tx)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Edit transaction"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setTxToDelete(tx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Delete transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Dialog before Deletion */}
      <ConfirmDialog
        isOpen={Boolean(txToDelete)}
        onClose={() => setTxToDelete(null)}
        onConfirm={() => {
          if (txToDelete) {
            deleteTransaction(txToDelete.id);
            setTxToDelete(null);
          }
        }}
        title="Delete Transaction"
        message={`Are you sure you want to delete "${txToDelete?.description}" (${formatINR(
          txToDelete?.amount || 0
        )})? This action cannot be undone.`}
        confirmText="Delete Transaction"
        isDestructive={true}
      />
    </div>
  );
};
