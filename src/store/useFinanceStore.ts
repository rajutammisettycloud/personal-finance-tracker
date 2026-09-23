import { create } from 'zustand';
import {
  Transaction,
  Budget,
  SavingsGoal,
  UserProfile,
  TransactionCategory,
  PaymentMethod,
} from '../types/finance';
import {
  DEMO_USER,
  SEED_TRANSACTIONS,
  SEED_BUDGETS,
  SEED_SAVINGS_GOALS,
} from '../data/seedData';
import { getMonthPeriod } from '../utils/financeCalculations';

const STORAGE_KEY_TX = 'finpulse_transactions';
const STORAGE_KEY_BUDGETS = 'finpulse_budgets';
const STORAGE_KEY_GOALS = 'finpulse_goals';
const STORAGE_KEY_USER = 'finpulse_user';
const STORAGE_KEY_THEME = 'finpulse_dark_mode';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to save ${key} to localStorage:`, err);
  }
}

interface FinanceState {
  user: UserProfile | null;
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  selectedPeriod: string;
  isDarkMode: boolean;

  // Filters and Sorting
  searchQuery: string;
  typeFilter: 'all' | 'income' | 'expense';
  categoryFilter: 'all' | TransactionCategory;
  paymentMethodFilter: 'all' | PaymentMethod;
  sortBy: 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

  // Actions
  setUser: (user: UserProfile | null) => void;
  loginDemoUser: () => void;
  logout: () => void;
  toggleDarkMode: () => void;
  setSelectedPeriod: (period: string) => void;

  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt' | 'userId'>) => void;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  addBudget: (budget: Omit<Budget, 'id' | 'userId'>) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;

  addGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'userId' | 'contributions'>) => void;
  updateGoal: (id: string, goal: Partial<SavingsGoal>) => void;
  deleteGoal: (id: string) => void;
  contributeToGoal: (goalId: string, amount: number, note?: string) => void;

  resetToSampleData: () => void;

  setSearchQuery: (query: string) => void;
  setTypeFilter: (filter: 'all' | 'income' | 'expense') => void;
  setCategoryFilter: (category: 'all' | TransactionCategory) => void;
  setPaymentMethodFilter: (method: 'all' | PaymentMethod) => void;
  setSortBy: (sort: 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc') => void;
}

export const useFinanceStore = create<FinanceState>((set, get) => {
  const initialUser = loadFromStorage<UserProfile | null>(
    STORAGE_KEY_USER,
    DEMO_USER
  );
  const initialTx = loadFromStorage<Transaction[]>(
    STORAGE_KEY_TX,
    SEED_TRANSACTIONS
  );
  const initialBudgets = loadFromStorage<Budget[]>(
    STORAGE_KEY_BUDGETS,
    SEED_BUDGETS
  );
  const initialGoals = loadFromStorage<SavingsGoal[]>(
    STORAGE_KEY_GOALS,
    SEED_SAVINGS_GOALS
  );
  const initialTheme = loadFromStorage<boolean>(STORAGE_KEY_THEME, true);

  const now = new Date();
  const initialPeriod = getMonthPeriod(now);

  return {
    user: initialUser,
    transactions: initialTx,
    budgets: initialBudgets,
    goals: initialGoals,
    selectedPeriod: initialPeriod,
    isDarkMode: initialTheme,

    searchQuery: '',
    typeFilter: 'all',
    categoryFilter: 'all',
    paymentMethodFilter: 'all',
    sortBy: 'date-desc',

    setUser: (user) => {
      saveToStorage(STORAGE_KEY_USER, user);
      set({ user });
    },

    loginDemoUser: () => {
      saveToStorage(STORAGE_KEY_USER, DEMO_USER);
      saveToStorage(STORAGE_KEY_TX, SEED_TRANSACTIONS);
      saveToStorage(STORAGE_KEY_BUDGETS, SEED_BUDGETS);
      saveToStorage(STORAGE_KEY_GOALS, SEED_SAVINGS_GOALS);
      set({
        user: DEMO_USER,
        transactions: SEED_TRANSACTIONS,
        budgets: SEED_BUDGETS,
        goals: SEED_SAVINGS_GOALS,
      });
    },

    logout: () => {
      saveToStorage(STORAGE_KEY_USER, null);
      set({ user: null });
    },

    toggleDarkMode: () => {
      const nextMode = !get().isDarkMode;
      saveToStorage(STORAGE_KEY_THEME, nextMode);
      if (nextMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      set({ isDarkMode: nextMode });
    },

    setSelectedPeriod: (period) => set({ selectedPeriod: period }),

    addTransaction: (txData) => {
      const userId = get().user?.id || 'demo-user-001';
      const newTx: Transaction = {
        ...txData,
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        userId,
        createdAt: new Date().toISOString(),
      };
      const updated = [newTx, ...get().transactions];
      saveToStorage(STORAGE_KEY_TX, updated);
      set({ transactions: updated });
    },

    updateTransaction: (id, txUpdate) => {
      const updated = get().transactions.map((t) =>
        t.id === id ? { ...t, ...txUpdate } : t
      );
      saveToStorage(STORAGE_KEY_TX, updated);
      set({ transactions: updated });
    },

    deleteTransaction: (id) => {
      const updated = get().transactions.filter((t) => t.id !== id);
      saveToStorage(STORAGE_KEY_TX, updated);
      set({ transactions: updated });
    },

    addBudget: (budgetData) => {
      const userId = get().user?.id || 'demo-user-001';
      const newBudget: Budget = {
        ...budgetData,
        id: `b-${Date.now()}`,
        userId,
      };
      // If budget for this category and period exists, update it
      const existing = get().budgets.find(
        (b) =>
          b.category === budgetData.category && b.period === budgetData.period
      );
      let updated: Budget[];
      if (existing) {
        updated = get().budgets.map((b) =>
          b.id === existing.id ? { ...b, monthlyLimit: budgetData.monthlyLimit } : b
        );
      } else {
        updated = [...get().budgets, newBudget];
      }
      saveToStorage(STORAGE_KEY_BUDGETS, updated);
      set({ budgets: updated });
    },

    updateBudget: (id, budgetUpdate) => {
      const updated = get().budgets.map((b) =>
        b.id === id ? { ...b, ...budgetUpdate } : b
      );
      saveToStorage(STORAGE_KEY_BUDGETS, updated);
      set({ budgets: updated });
    },

    deleteBudget: (id) => {
      const updated = get().budgets.filter((b) => b.id !== id);
      saveToStorage(STORAGE_KEY_BUDGETS, updated);
      set({ budgets: updated });
    },

    addGoal: (goalData) => {
      const userId = get().user?.id || 'demo-user-001';
      const newGoal: SavingsGoal = {
        ...goalData,
        id: `g-${Date.now()}`,
        userId,
        createdAt: new Date().toISOString().split('T')[0],
        contributions: [],
      };
      const updated = [...get().goals, newGoal];
      saveToStorage(STORAGE_KEY_GOALS, updated);
      set({ goals: updated });
    },

    updateGoal: (id, goalUpdate) => {
      const updated = get().goals.map((g) =>
        g.id === id ? { ...g, ...goalUpdate } : g
      );
      saveToStorage(STORAGE_KEY_GOALS, updated);
      set({ goals: updated });
    },

    deleteGoal: (id) => {
      const updated = get().goals.filter((g) => g.id !== id);
      saveToStorage(STORAGE_KEY_GOALS, updated);
      set({ goals: updated });
    },

    contributeToGoal: (goalId, amount, note) => {
      const date = new Date().toISOString().split('T')[0];
      const newContribution = {
        id: `gc-${Date.now()}`,
        goalId,
        amount,
        date,
        note: note || 'Manual savings contribution',
      };

      const updatedGoals = get().goals.map((g) => {
        if (g.id === goalId) {
          const newCurrent = g.currentAmount + amount;
          const contributions = [...(g.contributions || []), newContribution];
          return { ...g, currentAmount: newCurrent, contributions };
        }
        return g;
      });

      // Optionally record an expense or savings transfer transaction
      const goal = get().goals.find((g) => g.id === goalId);
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        userId: get().user?.id || 'demo-user-001',
        date,
        type: 'expense',
        category: 'Investment',
        amount,
        description: `Savings Goal: ${goal?.name || 'Savings deposit'}`,
        paymentMethod: 'UPI',
        notes: note,
        createdAt: new Date().toISOString(),
      };

      const updatedTx = [newTx, ...get().transactions];
      saveToStorage(STORAGE_KEY_GOALS, updatedGoals);
      saveToStorage(STORAGE_KEY_TX, updatedTx);
      set({ goals: updatedGoals, transactions: updatedTx });
    },

    resetToSampleData: () => {
      saveToStorage(STORAGE_KEY_TX, SEED_TRANSACTIONS);
      saveToStorage(STORAGE_KEY_BUDGETS, SEED_BUDGETS);
      saveToStorage(STORAGE_KEY_GOALS, SEED_SAVINGS_GOALS);
      saveToStorage(STORAGE_KEY_USER, DEMO_USER);
      set({
        transactions: SEED_TRANSACTIONS,
        budgets: SEED_BUDGETS,
        goals: SEED_SAVINGS_GOALS,
        user: DEMO_USER,
      });
    },

    setSearchQuery: (query) => set({ searchQuery: query }),
    setTypeFilter: (filter) => set({ typeFilter: filter }),
    setCategoryFilter: (category) => set({ categoryFilter: category }),
    setPaymentMethodFilter: (method) => set({ paymentMethodFilter: method }),
    setSortBy: (sort) => set({ sortBy: sort }),
  };
});
