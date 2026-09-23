import React from 'react';
import {
  Briefcase,
  Code2,
  UtensilsCrossed,
  Car,
  Home,
  Receipt,
  ShoppingBag,
  HeartPulse,
  Film,
  GraduationCap,
  PiggyBank,
  HelpCircle,
} from 'lucide-react';
import { TransactionCategory } from '../types/finance';

export interface CategoryMeta {
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  darkBgColor: string;
  borderColor: string;
}

export const CATEGORY_CONFIG: Record<TransactionCategory, CategoryMeta> = {
  Salary: {
    label: 'Salary',
    icon: Briefcase,
    color: '#10b981', // emerald
    bgColor: '#ecfdf5',
    darkBgColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#a7f3d0',
  },
  Freelance: {
    label: 'Freelance',
    icon: Code2,
    color: '#06b6d4', // cyan
    bgColor: '#ecfeff',
    darkBgColor: 'rgba(6, 182, 212, 0.15)',
    borderColor: '#a5f3fc',
  },
  Food: {
    label: 'Food & Dining',
    icon: UtensilsCrossed,
    color: '#f97316', // orange
    bgColor: '#fff7ed',
    darkBgColor: 'rgba(249, 115, 22, 0.15)',
    borderColor: '#fed7aa',
  },
  Transport: {
    label: 'Transport',
    icon: Car,
    color: '#3b82f6', // blue
    bgColor: '#eff6ff',
    darkBgColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: '#bfdbfe',
  },
  Rent: {
    label: 'Rent & Housing',
    icon: Home,
    color: '#8b5cf6', // purple
    bgColor: '#f5f3ff',
    darkBgColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: '#ddd6fe',
  },
  Bills: {
    label: 'Bills & Utilities',
    icon: Receipt,
    color: '#eab308', // yellow
    bgColor: '#fefce8',
    darkBgColor: 'rgba(234, 179, 8, 0.15)',
    borderColor: '#fef08a',
  },
  Shopping: {
    label: 'Shopping',
    icon: ShoppingBag,
    color: '#ec4899', // pink
    bgColor: '#fdf2f8',
    darkBgColor: 'rgba(236, 72, 153, 0.15)',
    borderColor: '#fbcfe8',
  },
  Health: {
    label: 'Health & Medical',
    icon: HeartPulse,
    color: '#ef4444', // red
    bgColor: '#fef2f2',
    darkBgColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#fecaca',
  },
  Entertainment: {
    label: 'Entertainment',
    icon: Film,
    color: '#a855f7', // purple
    bgColor: '#faf5ff',
    darkBgColor: 'rgba(168, 85, 247, 0.15)',
    borderColor: '#e9d5ff',
  },
  Education: {
    label: 'Education',
    icon: GraduationCap,
    color: '#14b8a6', // teal
    bgColor: '#f0fdfa',
    darkBgColor: 'rgba(20, 184, 166, 0.15)',
    borderColor: '#99f6e4',
  },
  Investment: {
    label: 'Investment & Savings',
    icon: PiggyBank,
    color: '#6366f1', // indigo
    bgColor: '#eef2ff',
    darkBgColor: 'rgba(99, 102, 241, 0.15)',
    borderColor: '#c7d2fe',
  },
  Other: {
    label: 'Other',
    icon: HelpCircle,
    color: '#64748b', // slate
    bgColor: '#f8fafc',
    darkBgColor: 'rgba(100, 116, 139, 0.15)',
    borderColor: '#e2e8f0',
  },
};

export const ALL_CATEGORIES: TransactionCategory[] = [
  'Salary',
  'Freelance',
  'Food',
  'Transport',
  'Rent',
  'Bills',
  'Shopping',
  'Health',
  'Entertainment',
  'Education',
  'Investment',
  'Other',
];

export const EXPENSE_CATEGORIES: TransactionCategory[] = [
  'Food',
  'Transport',
  'Rent',
  'Bills',
  'Shopping',
  'Health',
  'Entertainment',
  'Education',
  'Investment',
  'Other',
];

export const INCOME_CATEGORIES: TransactionCategory[] = [
  'Salary',
  'Freelance',
  'Investment',
  'Other',
];

export function getCategoryMeta(category: TransactionCategory): CategoryMeta {
  return CATEGORY_CONFIG[category] || CATEGORY_CONFIG.Other;
}
