import { describe, it, expect } from 'vitest';
import { generateSmartInsights } from '../smartInsights';
import { Transaction, Budget, SavingsGoal } from '../../types/finance';

describe('smartInsights Engine', () => {
  const currentPeriod = '2026-09';
  const todayDate = new Date(2026, 8, 15); // Sep 15th (15 days elapsed)

  const transactions: Transaction[] = [
    // Income
    {
      id: 'tx-inc-1',
      userId: 'u1',
      date: '2026-09-01',
      type: 'income',
      category: 'Salary',
      amount: 60000,
      description: 'Monthly Salary',
      paymentMethod: 'Net Banking',
      createdAt: '2026-09-01',
    },
    // Current month Food (high spend)
    {
      id: 'tx-food-cur',
      userId: 'u1',
      date: '2026-09-05',
      type: 'expense',
      category: 'Food',
      amount: 10000,
      description: 'Groceries & Dining Out',
      paymentMethod: 'UPI',
      createdAt: '2026-09-05',
    },
    // Previous month Food (lower spend: 6000 -> 66% increase)
    {
      id: 'tx-food-prev',
      userId: 'u1',
      date: '2026-08-10',
      type: 'expense',
      category: 'Food',
      amount: 6000,
      description: 'Groceries Last Month',
      paymentMethod: 'UPI',
      createdAt: '2026-08-10',
    },
    // Subscriptions across months (Netflix 649)
    {
      id: 'tx-sub-sep',
      userId: 'u1',
      date: '2026-09-03',
      type: 'expense',
      category: 'Entertainment',
      amount: 649,
      description: 'Netflix Premium',
      paymentMethod: 'Credit Card',
      isRecurring: true,
      createdAt: '2026-09-03',
    },
    {
      id: 'tx-sub-aug',
      userId: 'u1',
      date: '2026-08-03',
      type: 'expense',
      category: 'Entertainment',
      amount: 649,
      description: 'Netflix Premium',
      paymentMethod: 'Credit Card',
      isRecurring: true,
      createdAt: '2026-08-03',
    },
    // Shopping spend for budget burn test: spent 4500 in 15 days (300/day) on 5000 budget
    {
      id: 'tx-shop-sep',
      userId: 'u1',
      date: '2026-09-07',
      type: 'expense',
      category: 'Shopping',
      amount: 4500,
      description: 'Clothes & Shoes',
      paymentMethod: 'Credit Card',
      createdAt: '2026-09-07',
    },
    // Entertainment spend for goal trade-off test
    {
      id: 'tx-ent-sep',
      userId: 'u1',
      date: '2026-09-10',
      type: 'expense',
      category: 'Entertainment',
      amount: 2500,
      description: 'Concert and Weekend Outing',
      paymentMethod: 'UPI',
      createdAt: '2026-09-10',
    },
  ];

  const budgets: Budget[] = [
    {
      id: 'b-shop',
      userId: 'u1',
      category: 'Shopping',
      monthlyLimit: 5000,
      period: currentPeriod,
    },
  ];

  const goals: SavingsGoal[] = [
    {
      id: 'g-laptop',
      userId: 'u1',
      name: 'Laptop',
      targetAmount: 80000,
      currentAmount: 10000,
      deadline: '2026-11-30', // 2.5 months away, remaining 70,000 -> needs ~28,000/mo
      category: 'Gadgets',
      createdAt: '2026-08-01',
    },
  ];

  it('detects month-over-month category drift with exact percentage', () => {
    const insights = generateSmartInsights({
      transactions,
      budgets,
      goals,
      currentPeriod,
      todayDate,
    });

    const foodInsight = insights.find((i) => i.category === 'Food' && i.title.includes('Surge'));
    expect(foodInsight).toBeDefined();
    expect(foodInsight?.description).toContain('67% higher than last month');
    expect(foodInsight?.calculationDetail).toContain('₹6,000');
    expect(foodInsight?.calculationDetail).toContain('₹10,000');
  });

  it('predicts budget exhaustion based on daily burn rate', () => {
    const insights = generateSmartInsights({
      transactions,
      budgets,
      goals,
      currentPeriod,
      todayDate,
    });

    const shoppingBurn = insights.find((i) => i.id.startsWith('budget-burn-Shopping'));
    expect(shoppingBurn).toBeDefined();
    expect(shoppingBurn?.description).toMatch(/exceed your Shopping budget in \d+ days/);
    expect(shoppingBurn?.calculationDetail).toContain('avg');
  });

  it('detects repeated recurring subscription patterns', () => {
    const insights = generateSmartInsights({
      transactions,
      budgets,
      goals,
      currentPeriod,
      todayDate,
    });

    const subInsight = insights.find((i) => i.id.startsWith('recurring-subscriptions'));
    expect(subInsight).toBeDefined();
    expect(subInsight?.description).toContain('Netflix');
    expect(subInsight?.calculationDetail).toContain('₹649');
  });

  it('generates practical goal trade-off recommendations with reduction tips', () => {
    // With lower income (25000) and expenses (17649), net cashflow is ~7351, which is less than required (23334)
    const tightIncomeTransactions: Transaction[] = transactions.map((t) =>
      t.id === 'tx-inc-1' ? { ...t, amount: 25000 } : t
    );

    const insights = generateSmartInsights({
      transactions: tightIncomeTransactions,
      budgets,
      goals,
      currentPeriod,
      todayDate,
    });

    const goalTip = insights.find((i) => i.id.startsWith('goal-feasibility-g-laptop'));
    expect(goalTip).toBeDefined();
    expect(goalTip?.description).toContain('Entertainment');
    expect(goalTip?.description).toContain('help meet your Laptop goal on time');
    expect(goalTip?.calculationDetail).toContain('Required savings rate');
  });
});
