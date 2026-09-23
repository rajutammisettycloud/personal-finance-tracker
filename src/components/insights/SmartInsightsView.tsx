import React, { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { generateSmartInsights } from '../../utils/smartInsights';
import { SmartInsight, InsightType } from '../../types/finance';
import { getCategoryMeta } from '../../utils/categoryHelpers';

export const SmartInsightsView: React.FC = () => {
  const { transactions, budgets, goals, selectedPeriod } = useFinanceStore();
  const [expandedInsightId, setExpandedInsightId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  const insights = generateSmartInsights({
    transactions,
    budgets,
    goals,
    currentPeriod: selectedPeriod,
  });

  const filteredInsights =
    filterType === 'all'
      ? insights
      : insights.filter((i) => i.type === filterType);

  const getInsightStyles = (type: InsightType) => {
    switch (type) {
      case 'alert':
        return {
          badge: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800',
          icon: AlertCircle,
          iconBg: 'bg-rose-50 dark:bg-rose-950/50 text-rose-500',
          border: 'border-rose-200 dark:border-rose-900/50',
        };
      case 'warning':
        return {
          badge: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
          icon: AlertTriangle,
          iconBg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-500',
          border: 'border-amber-200 dark:border-amber-900/50',
        };
      case 'tip':
        return {
          badge: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
          icon: Lightbulb,
          iconBg: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500',
          border: 'border-indigo-200 dark:border-indigo-900/50',
        };
      case 'success':
        return {
          badge: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
          icon: CheckCircle2,
          iconBg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500',
          border: 'border-emerald-200 dark:border-emerald-900/50',
        };
      default:
        return {
          badge: 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800',
          icon: Info,
          iconBg: 'bg-sky-50 dark:bg-sky-950/50 text-sky-500',
          border: 'border-sky-200 dark:border-sky-900/50',
        };
    }
  };

  const alertCount = insights.filter((i) => i.type === 'alert').length;
  const warningCount = insights.filter((i) => i.type === 'warning').length;
  const tipCount = insights.filter((i) => i.type === 'tip').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Smart Financial Insights
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              Deterministic Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time rule-based analysis evaluating drift, burn rates, and savings feasibility
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterType === 'all'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            All ({insights.length})
          </button>
          <button
            onClick={() => setFilterType('alert')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterType === 'alert'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Alerts ({alertCount})
          </button>
          <button
            onClick={() => setFilterType('warning')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterType === 'warning'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Warnings ({warningCount})
          </button>
          <button
            onClick={() => setFilterType('tip')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterType === 'tip'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Tips ({tipCount})
          </button>
        </div>
      </div>

      {/* Engine Principles Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              Transparent, Local & Privacy-First Engine
            </h4>
            <p className="text-xs text-slate-300">
              Runs 100% locally on your device without third-party LLMs or paid APIs. Every insight includes an explicit mathematical formula breakdown.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 text-xs text-indigo-200">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Deterministic
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Private
          </span>
        </div>
      </div>

      {/* Insights List */}
      {filteredInsights.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            All Clear! No alerts matching this filter.
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Your spending patterns, budgets, and savings goals are operating within healthy baseline parameters for {selectedPeriod}.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInsights.map((insight) => {
            const styles = getInsightStyles(insight.type);
            const Icon = styles.icon;
            const isExpanded = expandedInsightId === insight.id;

            return (
              <div
                key={insight.id}
                className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border ${styles.border} transition-all hover:shadow-md`}
              >
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className={`p-2.5 rounded-xl shrink-0 ${styles.iconBg}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">
                          {insight.title}
                        </h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles.badge}`}
                        >
                          {insight.type}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                        {insight.description}
                      </p>

                      {/* Actionable Tip */}
                      {insight.actionableTip && (
                        <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <strong className="font-semibold text-slate-900 dark:text-white">
                              Actionable Recommendation:
                            </strong>{' '}
                            <span>{insight.actionableTip}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {insight.metricValue && (
                    <div className="shrink-0 text-right">
                      <span className="inline-block px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-black text-slate-900 dark:text-white">
                        {insight.metricValue}
                      </span>
                    </div>
                  )}
                </div>

                {/* Mathematical Calculation Accordion */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedInsightId(isExpanded ? null : insight.id)
                    }
                    className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>
                      {isExpanded
                        ? 'Hide Calculation Details'
                        : 'How this was calculated'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="mt-2.5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      <div className="font-sans font-bold text-slate-800 dark:text-slate-200 mb-1 text-[11px] uppercase tracking-wider">
                        Formula & Verification Data:
                      </div>
                      {insight.calculationDetail}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
