import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../common/Modal';
import {
  Transaction,
  TransactionCategory,
  TransactionType,
  PaymentMethod,
} from '../../types/finance';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  ALL_CATEGORIES,
} from '../../utils/categoryHelpers';

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'Category is required'),
  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be greater than 0'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(2, 'Description must be at least 2 characters'),
  paymentMethod: z.enum([
    'UPI',
    'Credit Card',
    'Debit Card',
    'Net Banking',
    'Cash',
  ]),
  isRecurring: z.boolean().optional(),
  notes: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TransactionFormData) => void;
  initialData?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      category: 'Food',
      amount: undefined,
      date: new Date().toISOString().split('T')[0],
      description: '',
      paymentMethod: 'UPI',
      isRecurring: false,
      notes: '',
    },
  });

  const currentType = watch('type');

  useEffect(() => {
    if (initialData) {
      reset({
        type: initialData.type,
        category: initialData.category,
        amount: initialData.amount,
        date: initialData.date,
        description: initialData.description,
        paymentMethod: initialData.paymentMethod,
        isRecurring: Boolean(initialData.isRecurring),
        notes: initialData.notes || '',
      });
    } else {
      reset({
        type: 'expense',
        category: 'Food',
        amount: undefined,
        date: new Date().toISOString().split('T')[0],
        description: '',
        paymentMethod: 'UPI',
        isRecurring: false,
        notes: '',
      });
    }
  }, [initialData, isOpen, reset]);

  const handleFormSubmit = (data: TransactionFormData) => {
    onSubmit(data);
    onClose();
  };

  const categories =
    currentType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Transaction' : 'Add New Transaction'}
      subtitle="Record income or expenditure with payment tracking"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Type Selector (Income vs Expense) */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setValue('type', 'expense');
              if (!EXPENSE_CATEGORIES.includes(watch('category') as any)) {
                setValue('category', 'Food');
              }
            }}
            className={`py-2 text-sm font-semibold rounded-lg transition-all ${
              currentType === 'expense'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => {
              setValue('type', 'income');
              if (!INCOME_CATEGORIES.includes(watch('category') as any)) {
                setValue('category', 'Salary');
              }
            }}
            className={`py-2 text-sm font-semibold rounded-lg transition-all ${
              currentType === 'income'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Income
          </button>
        </div>

        {/* Amount & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Amount (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-semibold">
                ₹
              </span>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                {...register('amount', { valueAsNumber: true })}
                className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-rose-500 mt-1">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Date *
            </label>
            <input
              type="date"
              {...register('date')}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.date && (
              <p className="text-xs text-rose-500 mt-1">{errors.date.message}</p>
            )}
          </div>
        </div>

        {/* Category & Payment Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Category *
            </label>
            <select
              {...register('category')}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {categories.map((cat) => (
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
              Payment Method *
            </label>
            <select
              {...register('paymentMethod')}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Net Banking">Net Banking</option>
              <option value="Cash">Cash</option>
            </select>
            {errors.paymentMethod && (
              <p className="text-xs text-rose-500 mt-1">
                {errors.paymentMethod.message}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Description *
          </label>
          <input
            type="text"
            placeholder="e.g. Swiggy Dinner, Groceries, Salary, Uber"
            {...register('description')}
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.description && (
            <p className="text-xs text-rose-500 mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Recurring Switch */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="isRecurring"
            {...register('isRecurring')}
            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300 dark:border-slate-700 cursor-pointer"
          />
          <label
            htmlFor="isRecurring"
            className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            Mark as Recurring / Subscription (e.g. Netflix, Rent, WiFi)
          </label>
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Notes (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="Add any extra details or tags..."
            {...register('notes')}
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Actions */}
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
            {initialData ? 'Save Changes' : 'Add Transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
