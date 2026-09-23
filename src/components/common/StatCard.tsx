import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  amount: string;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'default' | 'income' | 'expense' | 'savings' | 'budget';
  trend?: {
    value: string;
    isPositive: boolean;
    label?: string;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  amount,
  subtitle,
  icon: Icon,
  variant = 'default',
  trend,
}) => {
  const variantStyles = {
    default: {
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50',
      glow: 'hover:border-indigo-500/30',
    },
    income: {
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50',
      glow: 'hover:border-emerald-500/30',
    },
    expense: {
      iconBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/50',
      glow: 'hover:border-rose-500/30',
    },
    savings: {
      iconBg: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-sky-200/50 dark:border-sky-800/50',
      glow: 'hover:border-sky-500/30',
    },
    budget: {
      iconBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/50',
      glow: 'hover:border-amber-500/30',
    },
  }[variant];

  return (
    <div
      className={`relative p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 transition-all duration-200 hover:shadow-lg hover:shadow-slate-950/5 ${variantStyles.glow}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl ${variantStyles.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {amount}
        </h3>
        {(subtitle || trend) && (
          <div className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            {trend && (
              <span
                className={`inline-flex items-center font-semibold ${
                  trend.isPositive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {trend.value}
              </span>
            )}
            {trend?.label && <span>{trend.label}</span>}
            {subtitle && !trend && <span>{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
