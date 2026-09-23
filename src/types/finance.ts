export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  | 'Salary'
  | 'Freelance'
  | 'Food'
  | 'Transport'
  | 'Rent'
  | 'Bills'
  | 'Shopping'
  | 'Health'
  | 'Entertainment'
  | 'Education'
  | 'Investment'
  | 'Other';

export type PaymentMethod =
  | 'UPI'
  | 'Credit Card'
  | 'Debit Card'
  | 'Net Banking'
  | 'Cash';

export interface Transaction {
  id: string;
  userId: string;
  date: string; // ISO format: YYYY-MM-DD
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  paymentMethod: PaymentMethod;
  isRecurring?: boolean;
  notes?: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  category: TransactionCategory;
  monthlyLimit: number;
  period: string; // YYYY-MM
  createdAt?: string;
}

export interface GoalContribution {
  id: string;
  goalId: string;
  amount: number;
  date: string;
  note?: string;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM-DD
  category: string;
  color?: string;
  createdAt: string;
  contributions?: GoalContribution[];
}

export type InsightType = 'alert' | 'warning' | 'info' | 'success' | 'tip';

export interface SmartInsight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  calculationDetail: string;
  actionableTip?: string;
  category?: TransactionCategory;
  metricValue?: string | number;
  urgency: 'high' | 'medium' | 'low';
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  currency: string; // e.g., 'INR'
  currencySymbol: string; // e.g., '₹'
  isDemo?: boolean;
}

export interface FinancialSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  savingsRate: number; // percentage (0-100)
  totalBudget: number;
  totalBudgetSpent: number;
  budgetRemaining: number;
}
