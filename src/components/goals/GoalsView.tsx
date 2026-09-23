import React, { useState } from 'react';
import {
  Target,
  Plus,
  Calendar,
  Sparkles,
  TrendingUp,
  Edit2,
  Trash2,
  CheckCircle,
  Coins,
  Clock,
} from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { calculateGoalProgress } from '../../utils/financeCalculations';
import { formatINR } from '../../utils/currencyFormatter';
import { SavingsGoal } from '../../types/finance';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface GoalsViewProps {
  onAddGoal: () => void;
  onEditGoal: (goal: SavingsGoal) => void;
  onContributeGoal: (goal: SavingsGoal) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  onAddGoal,
  onEditGoal,
  onContributeGoal,
}) => {
  const { goals, deleteGoal } = useFinanceStore();
  const [goalToDelete, setGoalToDelete] = useState<SavingsGoal | null>(null);

  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalPercentage =
    totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Savings Goals
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Set ambitious financial targets, track deadlines, and allocate funds
          </p>
        </div>

        <button
          type="button"
          onClick={onAddGoal}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Goal</span>
        </button>
      </div>

      {/* Aggregate Overview Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Goals Portfolio
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                {formatINR(totalSaved)}
              </h3>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                accumulated toward {formatINR(totalTarget)} target
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400">Active Goals: </span>
              <span className="text-slate-900 dark:text-white font-bold">
                {goals.length}
              </span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400">Overall Progress: </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {totalPercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${Math.min(100, totalPercentage)}%` }}
          />
        </div>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-full bg-sky-50 dark:bg-sky-950/50 text-sky-500 flex items-center justify-center mx-auto">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No savings goals set yet
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Create goals like an Emergency Fund, new Laptop, or Holiday Trip to build financial discipline.
          </p>
          <button
            type="button"
            onClick={onAddGoal}
            className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all"
          >
            Create First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((goal) => {
            const progress = calculateGoalProgress(goal);
            const goalColor = goal.color || '#6366f1';

            return (
              <div
                key={goal.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between hover:shadow-lg hover:shadow-slate-950/5 transition-all group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                        style={{ backgroundColor: goalColor }}
                      >
                        <Target className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {goal.name}
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          {goal.category}
                        </span>
                      </div>
                    </div>

                    {progress.isAchieved && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle className="w-3 h-3" /> Reached!
                      </span>
                    )}
                  </div>

                  {/* Saved vs Target Amount */}
                  <div className="mt-4 mb-2 flex items-baseline justify-between">
                    <div>
                      <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                        {formatINR(goal.currentAmount)}
                      </span>
                      <span className="text-xs text-slate-400 ml-1">
                        / {formatINR(goal.targetAmount)}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      {progress.percentComplete}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden mb-3">
                    <div
                      className="h-2.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, progress.percentComplete)}%`,
                        backgroundColor: goalColor,
                      }}
                    />
                  </div>

                  {/* Metric Details */}
                  <div className="space-y-1.5 pt-1 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> Deadline:
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {goal.deadline}
                      </span>
                    </div>

                    {!progress.isAchieved && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" /> Monthly Target:
                        </span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                          {formatINR(progress.monthlyRequired)}/mo
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onContributeGoal(goal)}
                    className="flex-1 py-1.5 px-3 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>Contribute</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEditGoal(goal)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit goal"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setGoalToDelete(goal)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Delete goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog before Deletion */}
      <ConfirmDialog
        isOpen={Boolean(goalToDelete)}
        onClose={() => setGoalToDelete(null)}
        onConfirm={() => {
          if (goalToDelete) {
            deleteGoal(goalToDelete.id);
            setGoalToDelete(null);
          }
        }}
        title="Delete Savings Goal"
        message={`Are you sure you want to delete the "${goalToDelete?.name}" savings goal? Target was ${formatINR(
          goalToDelete?.targetAmount || 0
        )}.`}
        confirmText="Delete Goal"
        isDestructive={true}
      />
    </div>
  );
};
