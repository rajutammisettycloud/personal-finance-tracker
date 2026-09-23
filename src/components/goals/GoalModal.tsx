import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../common/Modal';
import { SavingsGoal } from '../../types/finance';

const goalSchema = z.object({
  name: z.string().min(2, 'Goal name must be at least 2 characters'),
  targetAmount: z
    .number({ invalid_type_error: 'Target must be a number' })
    .positive('Target amount must be greater than 0'),
  currentAmount: z
    .number({ invalid_type_error: 'Current saved must be a number' })
    .min(0, 'Current saved amount cannot be negative'),
  deadline: z.string().min(1, 'Target deadline date is required'),
  category: z.string().min(1, 'Category is required'),
  color: z.string().optional(),
});

type GoalFormData = z.infer<typeof goalSchema>;

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GoalFormData) => void;
  initialData?: SavingsGoal | null;
}

const COLOR_PRESETS = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#0ea5e9', // Sky
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Violet
];

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: '',
      targetAmount: undefined,
      currentAmount: 0,
      deadline: '',
      category: 'General',
      color: '#6366f1',
    },
  });

  const selectedColor = watch('color');

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        targetAmount: initialData.targetAmount,
        currentAmount: initialData.currentAmount,
        deadline: initialData.deadline,
        category: initialData.category,
        color: initialData.color || '#6366f1',
      });
    } else {
      // Default deadline: 6 months ahead
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() + 6);
      reset({
        name: '',
        targetAmount: undefined,
        currentAmount: 0,
        deadline: targetDate.toISOString().split('T')[0],
        category: 'General',
        color: '#6366f1',
      });
    }
  }, [initialData, isOpen, reset]);

  const handleFormSubmit = (data: GoalFormData) => {
    onSubmit(data);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Savings Goal' : 'Create Savings Goal'}
      subtitle="Set target savings milestones and deadlines"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Goal Name *
          </label>
          <input
            type="text"
            placeholder="e.g. Emergency Fund, MacBook Pro, Goa Vacation"
            {...register('name')}
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.name && (
            <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Amount (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-semibold">
                ₹
              </span>
              <input
                type="number"
                step="any"
                placeholder="e.g. 150000"
                {...register('targetAmount', { valueAsNumber: true })}
                className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {errors.targetAmount && (
              <p className="text-xs text-rose-500 mt-1">
                {errors.targetAmount.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Current Saved (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-semibold">
                ₹
              </span>
              <input
                type="number"
                step="any"
                placeholder="0"
                {...register('currentAmount', { valueAsNumber: true })}
                className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {errors.currentAmount && (
              <p className="text-xs text-rose-500 mt-1">
                {errors.currentAmount.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Deadline Date *
            </label>
            <input
              type="date"
              {...register('deadline')}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.deadline && (
              <p className="text-xs text-rose-500 mt-1">
                {errors.deadline.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <select
              {...register('category')}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="Emergency Fund">Emergency Fund</option>
              <option value="Gadgets">Gadgets & Tech</option>
              <option value="Travel">Travel & Vacations</option>
              <option value="Vehicle">Vehicle / Bike / Car</option>
              <option value="Home">Home & Renovation</option>
              <option value="Family">Family & Events</option>
              <option value="General">General Savings</option>
            </select>
          </div>
        </div>

        {/* Color Theme Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Theme Accent Color
          </label>
          <div className="flex items-center gap-3">
            {COLOR_PRESETS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setValue('color', color)}
                className={`w-8 h-8 rounded-full transition-transform ${
                  selectedColor === color
                    ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-110'
                    : 'hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

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
            {initialData ? 'Update Goal' : 'Create Goal'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
