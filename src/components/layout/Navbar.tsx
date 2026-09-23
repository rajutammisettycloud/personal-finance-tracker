import React from 'react';
import {
  Sun,
  Moon,
  Plus,
  RotateCcw,
  Sparkles,
  Wallet,
  Calendar,
  LogOut,
  User,
} from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';

interface NavbarProps {
  onOpenAddTransaction: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAddTransaction,
  onOpenAuth,
}) => {
  const {
    user,
    isDarkMode,
    toggleDarkMode,
    selectedPeriod,
    setSelectedPeriod,
    resetToSampleData,
    logout,
  } = useFinanceStore();

  // Generate list of available months (e.g. past 6 months to current)
  const now = new Date();
  const availableMonths: { value: string; label: string }[] = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    availableMonths.push({ value, label });
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Fin<span className="text-indigo-600 dark:text-indigo-400">Pulse</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 rounded-full">
                <Sparkles className="w-2.5 h-2.5" /> Pro
              </span>
            </div>
          </div>
        </div>

        {/* Center Controls: Month Period Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
            >
              {availableMonths.map((m) => (
                <option
                  key={m.value}
                  value={m.value}
                  className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Controls: Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Add Button */}
          <button
            type="button"
            onClick={onOpenAddTransaction}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Transaction</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl transition-colors"
            aria-label="Toggle theme"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Reset Demo Data Button */}
          <button
            type="button"
            onClick={resetToSampleData}
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs transition-colors"
            title="Reset to initial 3-month sample Indian Rupee data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>

          {/* User Account / Demo Profile */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-indigo-500/20">
                {user.name.charAt(0)}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                  {user.name}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {user.isDemo ? 'Demo Mode (INR)' : user.email}
                </p>
              </div>
              <button
                type="button"
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-xl text-xs font-semibold transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
