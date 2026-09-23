import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { SavingsGoal } from '../../types/finance';
import { formatINR } from '../../utils/currencyFormatter';
import confetti from 'canvas-confetti';

interface ContributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
  onContribute: (goalId: string, amount: number, note?: string) => void;
}

export const ContributeModal: React.FC<ContributeModalProps> = ({
  isOpen,
  onClose,
  goal,
  onContribute,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!goal) return null;

  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    onContribute(goal.id, numAmount, note);

    // If this contribution completes the goal, fire confetti!
    if (goal.currentAmount + numAmount >= goal.targetAmount) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    setAmount('');
    setNote('');
    setError('');
    onClose();
  };

  const quickPicks = [1000, 2500, 5000, 10000].filter((val) => val <= remaining || remaining === 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Contribute to ${goal.name}`}
      subtitle={`Target: ${formatINR(goal.targetAmount)} • Remaining: ${formatINR(remaining)}`}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Deposit Amount (₹) *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400 font-semibold">
              ₹
            </span>
            <input
              type="number"
              step="any"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError('');
              }}
              placeholder="e.g. 5000"
              className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}

          {/* Quick pick chips */}
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[11px] text-slate-400 font-medium">Quick:</span>
            {quickPicks.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val.toString())}
                className="px-2 py-0.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                +{formatINR(val)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Note / Source (Optional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Salary transfer, bonus allocation"
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
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
            className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-md shadow-emerald-600/20 transition-all"
          >
            Add Contribution
          </button>
        </div>
      </form>
    </Modal>
  );
};
