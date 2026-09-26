import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, UserCheck, Briefcase, Code } from 'lucide-react';

export const RoleDemoBar: React.FC = () => {
  const { user, quickLoginAs } = useAuth();

  const demoAccounts = [
    {
      role: 'ADMIN',
      name: 'Alex Admin',
      email: 'admin@velozity.com',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      icon: ShieldAlert,
    },
    {
      role: 'PM 1',
      name: 'Sarah Mitchell',
      email: 'pm.sarah@velozity.com',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: Briefcase,
    },
    {
      role: 'PM 2',
      name: 'Marcus Vance',
      email: 'pm.marcus@velozity.com',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: Briefcase,
    },
    {
      role: 'Dev 1',
      name: 'Ravi Kumar',
      email: 'dev.ravi@velozity.com',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: Code,
    },
    {
      role: 'Dev 2',
      name: 'Elena Rostova',
      email: 'dev.elena@velozity.com',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: Code,
    },
  ];

  return (
    <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-400">
          <UserCheck className="w-3.5 h-3.5 text-brand-400" />
          <span className="font-semibold text-slate-200">Assessment RBAC Quick-Switcher:</span>
          <span className="hidden sm:inline text-slate-400">Test role-specific views & API authorization with 1-click:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {demoAccounts.map((acc) => {
            const isCurrent = user?.email === acc.email;
            const Icon = acc.icon;
            return (
              <button
                key={acc.email}
                onClick={() => quickLoginAs(acc.email)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
                  isCurrent
                    ? `${acc.badgeColor} ring-1 ring-white/20 font-bold shadow-sm`
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200 hover:bg-slate-700/60'
                }`}
                title={`Switch to ${acc.name} (${acc.role})`}
              >
                <Icon className="w-3 h-3" />
                <span>{acc.role}: {acc.name.split(' ')[0]}</span>
                {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
