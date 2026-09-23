import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useFinanceStore } from '../../store/useFinanceStore';
import { isSupabaseConfigured, supabase } from '../../services/supabaseClient';
import { Sparkles, Database, ShieldCheck, User } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginDemoUser, setUser } = useFinanceStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleDemoLogin = () => {
    loginDemoUser();
    onClose();
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        if (isSignUp) {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: name },
            },
          });
          if (error) throw error;
          if (data.user) {
            setUser({
              id: data.user.id,
              email: data.user.email || email,
              name: name || email.split('@')[0],
              currency: 'INR',
              currencySymbol: '₹',
            });
            onClose();
          }
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          if (data.user) {
            setUser({
              id: data.user.id,
              email: data.user.email || email,
              name: data.user.user_metadata?.full_name || email.split('@')[0],
              currency: 'INR',
              currencySymbol: '₹',
            });
            onClose();
          }
        }
      } else {
        // Local Auth Fallback
        setUser({
          id: `local-user-${Date.now()}`,
          email,
          name: name || email.split('@')[0],
          currency: 'INR',
          currencySymbol: '₹',
        });
        onClose();
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isSignUp ? 'Create Your Account' : 'Sign in to FinPulse'}
      subtitle="Manage your personal wealth, budgets, and savings goals"
      maxWidth="sm"
    >
      <div className="space-y-4">
        {/* Supabase status indicator */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Database className="w-3.5 h-3.5 text-indigo-500" />
            <span>Database Backend</span>
          </div>
          <span
            className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
              isSupabaseConfigured
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
            }`}
          >
            {isSupabaseConfigured ? 'Supabase Active' : 'Local Mock & Storage'}
          </span>
        </div>

        {/* Demo Login Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 text-center">
          <div className="flex items-center justify-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Demo Showcase Mode
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
            Instant 1-click access pre-seeded with 3 months of realistic Indian financial data.
          </p>
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
          >
            <User className="w-4 h-4" />
            <span>Continue as Demo User (Arjun Sharma)</span>
          </button>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          <span className="flex-shrink mx-3 text-slate-400 text-xs uppercase font-semibold">
            Or Use Credentials
          </span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
        </div>

        {authError && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs">
            {authError}
          </div>
        )}

        <form onSubmit={handleAuthSubmit} className="space-y-3">
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Patel"
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60"
          >
            {loading ? 'Authenticating...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setAuthError('');
            }}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            {isSignUp
              ? 'Already have an account? Sign In'
              : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </Modal>
  );
};
