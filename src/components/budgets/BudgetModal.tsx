import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../common/Modal';
import { Budget, TransactionCategory } from '../../types/finance';
import { EXPENSE_CATEGORIES } from '../../utils/categoryHelpers';

const budgetSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  monthlyLimit: z
    .number({ invalid_type_error: 'Monthly limit must be a number' })
    .positive('Limit must be greater than 0'),
  period: z.string().min(1, 'Period is required'),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BudgetFormData) => void;
  currentPeriod: string;
  initialData?: Budget | null;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentPeriod,
  initialData,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category: 'Food',
      monthlyLimit: undefined,
      period: currentPeriod,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        category: initialData.category,
        monthlyLimit: initialData.monthlyLimit,
        period: initialData.period,
      });
    } else {
      reset({
        category: 'Food',
        monthlyLimit: undefined,
        period: currentPeriod,
      });
    }
  }, [initialData, currentPeriod, isOpen, reset]);

  const handleFormSubmit = (data: BudgetFormData) => {
    onSubmit(data);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Budget' : 'Set Category Budget'}
      subtitle={`Monthly spending limit for ${currentPeriod}`}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Category *
          </label>
          <select
            {...register('category')}
            disabled={Boolean(initialData)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer disabled:opacity-60"
          >
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-xs text-rose-500 mt-1">{errors.category.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Monthly Limit (₹) *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400 font-semibold">
              ₹
            </span>
            <input
              type="number"
              step="any"
              placeholder="e.g. 8000"
              {...register('monthlyLimit', { valueAsNumber: true })}
              className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {errors.monthlyLimit && (
            <p className="text-xs text-rose-500 mt-1">
              {errors.monthlyLimit.message}
            </p>
          )}
        </div>

        <input type="hidden" {...register('period')} />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-md shadow-indigo-600/20 transition-all"
          >
            {initialData ? 'Update Budget' : 'Save Budget'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
