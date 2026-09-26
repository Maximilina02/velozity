import React from 'react';
import { useAuth } from '../context/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';
import {
  Search,
  SlidersHorizontal,
  Plus,
  ShieldCheck,
  Briefcase,
  Code,
  ArrowUpDown,
  Filter,
} from 'lucide-react';

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  onAddTaskClick: () => void;
  onAddClientClick: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortByChange,
  showFilters,
  onToggleFilters,
  onAddTaskClick,
  onAddClientClick,
}) => {
  const { user, quickLoginAs } = useAuth();

  const demoAccounts = [
    { role: 'Admin', name: 'Alex', email: 'admin@velozity.com', icon: ShieldCheck, color: 'text-rose-500' },
    { role: 'PM 1', name: 'Sarah', email: 'pm.sarah@velozity.com', icon: Briefcase, color: 'text-amber-500' },
    { role: 'PM 2', name: 'Marcus', email: 'pm.marcus@velozity.com', icon: Briefcase, color: 'text-amber-500' },
    { role: 'Dev 1', name: 'Ravi', email: 'dev.ravi@velozity.com', icon: Code, color: 'text-emerald-500' },
    { role: 'Dev 2', name: 'Elena', email: 'dev.elena@velozity.com', icon: Code, color: 'text-emerald-500' },
  ];

  return (
    <div className="glass-panel rounded-2xl p-3 border border-white/80 dark:border-purple-500/20 shadow-lg flex flex-wrap items-center justify-between gap-3 mb-6 transition-colors">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[220px] max-w-md">
        <Search className="w-4 h-4 text-slate-400 dark:text-purple-400/70 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search customer, project, task..."
          className="w-full glass-input rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-[#0f172a] dark:text-purple-100 placeholder-slate-400 dark:placeholder-purple-400/50 focus:outline-none"
        />
      </div>

      {/* Center & Right Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Sort By Dropdown */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-input text-xs text-[#1e293b] dark:text-purple-200">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 dark:text-purple-400" />
          <span className="text-[11px] font-bold text-[#64748b] dark:text-purple-400/70">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="bg-transparent text-xs font-bold text-[#0f172a] dark:text-purple-200 focus:outline-none cursor-pointer"
          >
            <option value="priority" className="bg-white dark:bg-slate-900 text-[#0f172a] dark:text-purple-200">Priority</option>
            <option value="dueDate" className="bg-white dark:bg-slate-900 text-[#0f172a] dark:text-purple-200">Due Date</option>
            <option value="taskNumber" className="bg-white dark:bg-slate-900 text-[#0f172a] dark:text-purple-200">Task #</option>
          </select>
        </div>

        {/* Toggle Filters Button */}
        <button
          onClick={onToggleFilters}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
            showFilters
              ? 'bg-slate-900 text-white dark:bg-purple-600/30 dark:text-purple-200 dark:border dark:border-purple-400/40 shadow-sm'
              : 'glass-input text-[#334155] dark:text-purple-300 hover:text-[#0f172a] dark:hover:text-white'
          }`}
        >
          <Filter className="w-3.5 h-3.5 text-indigo-500" />
          <span>Filters</span>
        </button>

        {/* Notification Dropdown */}
        <NotificationDropdown />

        {/* RBAC Quick Role Switcher Pill for Assessment Evaluator */}
        <div className="hidden xl:flex items-center gap-1 p-1 rounded-xl glass-input border border-slate-200 dark:border-purple-500/20 text-xs">
          <span className="text-[10px] uppercase font-bold text-[#64748b] dark:text-purple-400/60 px-1.5">Role:</span>
          {demoAccounts.map((acc) => {
            const isCurrent = user?.email === acc.email;
            return (
              <button
                key={acc.email}
                onClick={() => quickLoginAs(acc.email)}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  isCurrent
                    ? 'bg-slate-900 text-white dark:bg-gradient-to-r dark:from-purple-600 dark:to-indigo-600 shadow-md'
                    : 'text-[#475569] hover:text-[#0f172a] dark:text-purple-300/70 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-purple-900/30'
                }`}
                title={`Switch to ${acc.role} (${acc.name})`}
              >
                {acc.role}
              </button>
            );
          })}
        </div>

        {/* Primary CTA Buttons */}
        {user?.role !== 'DEVELOPER' && (
          <div className="flex items-center gap-2">
            <button
              onClick={onAddClientClick}
              className="hidden sm:flex items-center gap-1 px-3 py-2 rounded-xl glass-input hover:border-slate-300 text-[#0f172a] dark:text-purple-200 text-xs font-bold transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-500" />
              <span>Add Customer</span>
            </button>

            <button
              onClick={onAddTaskClick}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white dark:bg-gradient-to-r dark:from-purple-600 dark:to-violet-600 text-xs font-extrabold shadow-md transition-all transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Task</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
