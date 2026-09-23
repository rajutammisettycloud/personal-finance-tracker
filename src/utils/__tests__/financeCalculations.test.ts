import { describe, it, expect } from 'vitest';
import {
  calculateTotalBalance,
  calculateMonthlyIncome,
  calculateMonthlyExpense,
  calculateSavingsRate,
  calculateBudgetUtilization,
  calculateGoalProgress,
} from '../financeCalculations';
import { Transaction, Budget, SavingsGoal } from '../../types/finance';

describe('financeCalculations', () => {
  const sampleTransactions: Transaction[] = [
    {
      id: '1',
      userId: 'u1',
      date: '2026-09-01',
      type: 'income',
      category: 'Salary',
      amount: 80000,
      description: 'Salary',
      paymentMethod: 'Net Banking',
      createdAt: '2026-09-01',
    },
    {
      id: '2',
      userId: 'u1',
      date: '2026-09-02',
      type: 'expense',
      category: 'Rent',
      amount: 20000,
      description: 'Rent',
      paymentMethod: 'Net Banking',
      createdAt: '2026-09-02',
    },
    {
      id: '3',
      userId: 'u1',
      date: '2026-09-05',
      type: 'expense',
      category: 'Food',
      amount: 8000,
      description: 'Groceries',
      paymentMethod: 'UPI',
      createdAt: '2026-09-05',
    },
    {
      id: '4',
      userId: 'u1',
      date: '2026-08-15',
      type: 'income',
      category: 'Freelance',
      amount: 15000,
      description: 'Freelance August',
      paymentMethod: 'UPI',
      createdAt: '2026-08-15',
    },
  ];

  it('calculates lifetime total balance accurately', () => {
    // 80000 - 20000 - 8000 + 15000 = 67000
    const balance = calculateTotalBalance(sampleTransactions);
    expect(balance).toBe(67000);
  });

  it('calculates monthly income and expense for specific period', () => {
    const incomeSep = calculateMonthlyIncome(sampleTransactions, '2026-09');
    const expenseSep = calculateMonthlyExpense(sampleTransactions, '2026-09');
    expect(incomeSep).toBe(80000);
    expect(expenseSep).toBe(28000);

    const incomeAug = calculateMonthlyIncome(sampleTransactions, '2026-08');
    expect(incomeAug).toBe(15000);
  });

  it('calculates savings rate percentage correctly', () => {
    // income: 100000, expense: 60000 => savings: 40000 => 40%
    const rate = calculateSavingsRate(100000, 60000);
    expect(rate).toBe(40);

    // zero income
    expect(calculateSavingsRate(0, 5000)).toBe(0);

    // expenses exceed income
    expect(calculateSavingsRate(50000, 70000)).toBe(0);
  });

  it('calculates budget utilization, remaining, and status flags', () => {
    const budgets: Budget[] = [
      { id: 'b1', userId: 'u1', category: 'Food', monthlyLimit: 10000, period: '2026-09' },
      { id: 'b2', userId: 'u1', category: 'Rent', monthlyLimit: 20000, period: '2026-09' },
      { id: 'b3', userId: 'u1', category: 'Shopping', monthlyLimit: 5000, period: '2026-09' },
    ];

    const utilizations = calculateBudgetUtilization(budgets, sampleTransactions, '2026-09');

    // Food: 8000 spent out of 10000 -> 80% (status: warning)
    const foodUtil = utilizations.find((u) => u.budget.category === 'Food');
    expect(foodUtil?.spent).toBe(8000);
    expect(foodUtil?.remaining).toBe(2000);
    expect(foodUtil?.percentUsed).toBe(80);
    expect(foodUtil?.status).toBe('warning');

    // Rent: 20000 spent out of 20000 -> 100% (status: exceeded)
    const rentUtil = utilizations.find((u) => u.budget.category === 'Rent');
    expect(rentUtil?.percentUsed).toBe(100);
    expect(rentUtil?.status).toBe('exceeded');

    // Shopping: 0 spent out of 5000 -> 0% (status: ok)
    const shoppingUtil = utilizations.find((u) => u.budget.category === 'Shopping');
    expect(shoppingUtil?.spent).toBe(0);
    expect(shoppingUtil?.remaining).toBe(5000);
    expect(shoppingUtil?.status).toBe('ok');
  });

  it('computes goal progress and required monthly contributions', () => {
    const goal: SavingsGoal = {
      id: 'g1',
      userId: 'u1',
      name: 'MacBook Pro',
      targetAmount: 100000,
      currentAmount: 40000,
      deadline: '2026-12-31',
      category: 'Gadgets',
      createdAt: '2026-01-01',
    };

    const progress = calculateGoalProgress(goal);
    expect(progress.percentComplete).toBe(40);
    expect(progress.remaining).toBe(60000);
    expect(progress.isAchieved).toBe(false);
    expect(progress.monthlyRequired).toBeGreaterThan(0);
  });
});
