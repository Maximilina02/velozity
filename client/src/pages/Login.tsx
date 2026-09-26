import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Zap, Lock, Mail, ShieldAlert, ArrowRight, ShieldCheck, Briefcase, Code } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, quickLoginAs } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoClick = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    quickLoginAs(demoEmail).catch((err) => setError(err.message));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-700 shadow-xl shadow-brand-500/20 mb-3">
            <Zap className="w-8 h-8 text-white fill-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            VELOZITY GLOBAL SOLUTIONS
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-Time Client Project Dashboard & RBAC Platform
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-panel rounded-2xl p-7 border border-slate-800 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-100">Sign in to your account</h2>
            <p className="text-xs text-slate-400 mt-1">
              Protected by JWT access tokens & secure HttpOnly refresh cookies
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@velozity.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Logins for Evaluator */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <p className="text-[11px] font-bold text-slate-400 mb-3 text-center uppercase tracking-wider">
              Quick One-Click Demo Logins
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleDemoClick('admin@velozity.com')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-rose-400" />
                  <span className="font-semibold">Admin (Full Access & Presence)</span>
                </div>
                <span className="text-[11px] opacity-75 font-mono">admin@velozity.com</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick('pm.sarah@velozity.com')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold">PM 1 — Sarah Mitchell</span>
                </div>
                <span className="text-[11px] opacity-75 font-mono">pm.sarah@velozity.com</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick('pm.marcus@velozity.com')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold">PM 2 — Marcus Vance</span>
                </div>
                <span className="text-[11px] opacity-75 font-mono">pm.marcus@velozity.com</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick('dev.ravi@velozity.com')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold">Developer — Ravi Kumar</span>
                </div>
                <span className="text-[11px] opacity-75 font-mono">dev.ravi@velozity.com</span>
              </button>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-center text-slate-500 mt-6">
          Velozity Global Solutions · Confidential Technical Assessment Submission
        </p>
      </div>
    </div>
  );
};
