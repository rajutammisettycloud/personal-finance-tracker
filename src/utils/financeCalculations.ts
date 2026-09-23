import { Transaction, Budget, SavingsGoal, FinancialSummary } from '../types/finance';

/**
 * Returns month string YYYY-MM for any date string or Date object
 */
export function getMonthPeriod(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Total lifetime balance across all transactions
 */
export function calculateTotalBalance(transactions: Transaction[]): number {
  return transactions.reduce((acc, t) => {
    return t.type === 'income' ? acc + t.amount : acc - t.amount;
  }, 0);
}

/**
 * Filter transactions by month period (YYYY-MM)
 */
export function filterTransactionsByMonth(
  transactions: Transaction[],
  period: string
): Transaction[] {
  return transactions.filter((t) => t.date.startsWith(period));
}

/**
 * Monthly income total
 */
export function calculateMonthlyIncome(
  transactions: Transaction[],
  period: string
): number {
  return transactions
    .filter((t) => t.date.startsWith(period) && t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Monthly expense total
 */
export function calculateMonthlyExpense(
  transactions: Transaction[],
  period: string
): number {
  return transactions
    .filter((t) => t.date.startsWith(period) && t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Savings rate as a percentage (0 to 100)
 */
export function calculateSavingsRate(income: number, expenses: number): number {
  if (income <= 0) return 0;
  const savings = income - expenses;
  if (savings <= 0) return 0;
  return Math.min(100, Math.round((savings / income) * 1000) / 10);
}

/**
 * Aggregates expenses or income by category
 */
export function calculateCategoryTotals(
  transactions: Transaction[],
  type: 'expense' | 'income' = 'expense',
  period?: string
): Record<string, number> {
  const filtered = transactions.filter((t) => {
    const matchesType = t.type === type;
    const matchesPeriod = period ? t.date.startsWith(period) : true;
    return matchesType && matchesPeriod;
  });

  const totals: Record<string, number> = {};
  filtered.forEach((t) => {
    totals[t.category] = (totals[t.category] || 0) + t.amount;
  });

  return totals;
}

export interface BudgetUtilization {
  budget: Budget;
  spent: number;
  remaining: number;
  percentUsed: number;
  status: 'ok' | 'warning' | 'exceeded';
}

/**
 * Calculates budget consumption and warning flags
 */
export function calculateBudgetUtilization(
  budgets: Budget[],
  transactions: Transaction[],
  period: string
): BudgetUtilization[] {
  const monthExpenses = transactions.filter(
    (t) => t.date.startsWith(period) && t.type === 'expense'
  );

  return budgets.map((b) => {
    const spent = monthExpenses
      .filter((t) => t.category === b.category)
      .reduce((sum, t) => sum + t.amount, 0);

    const remaining = b.monthlyLimit - spent;
    const percentUsed =
      b.monthlyLimit > 0 ? Math.round((spent / b.monthlyLimit) * 100) : 0;

    let status: 'ok' | 'warning' | 'exceeded' = 'ok';
    if (percentUsed >= 100) {
      status = 'exceeded';
    } else if (percentUsed >= 80) {
      status = 'warning';
    }

    return {
      budget: b,
      spent,
      remaining,
      percentUsed,
      status,
    };
  });
}

/**
 * Comprehensive financial summary for dashboard
 */
export function calculateFinancialSummary(
  transactions: Transaction[],
  budgets: Budget[],
  period: string
): FinancialSummary {
  const totalBalance = calculateTotalBalance(transactions);
  const monthlyIncome = calculateMonthlyIncome(transactions, period);
  const monthlyExpenses = calculateMonthlyExpense(transactions, period);
  const monthlySavings = Math.max(0, monthlyIncome - monthlyExpenses);
  const savingsRate = calculateSavingsRate(monthlyIncome, monthlyExpenses);

  const budgetStats = calculateBudgetUtilization(budgets, transactions, period);
  const totalBudget = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
  const totalBudgetSpent = budgetStats.reduce((sum, b) => sum + b.spent, 0);
  const budgetRemaining = Math.max(0, totalBudget - totalBudgetSpent);

  return {
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    monthlySavings,
    savingsRate,
    totalBudget,
    totalBudgetSpent,
    budgetRemaining,
  };
}

/**
 * Goal progress & required monthly contribution
 */
export function calculateGoalProgress(goal: SavingsGoal) {
  const percentComplete =
    goal.targetAmount > 0
      ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
      : 0;

  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  const now = new Date();
  const deadlineDate = new Date(goal.deadline);
  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const monthsRemaining = Math.max(1, Math.ceil(diffDays / 30.4));

  const monthlyRequired =
    remaining > 0 ? Math.ceil(remaining / monthsRemaining) : 0;

  return {
    percentComplete,
    remaining,
    diffDays,
    monthsRemaining,
    monthlyRequired,
    isAchieved: goal.currentAmount >= goal.targetAmount,
    isOverdue: diffDays < 0 && goal.currentAmount < goal.targetAmount,
  };
}
