import React from 'react';
import { ArrowRight, TrendingUp, CheckCircle, Clock } from 'lucide-react';

interface AnalyticsHeaderProps {
  totalTasks: number;
  inProgressTasks: number;
  doneTasks: number;
  overdueCount: number;
  onNavigateToTasks?: () => void;
}

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  totalTasks,
  inProgressTasks,
  doneTasks,
  overdueCount,
  onNavigateToTasks,
}) => {
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 68;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 mb-6">
      {/* 1. Bar Chart Widget (Mon - Fri with striped & solid bars matching screenshot) - 4 cols */}
      <div className="lg:col-span-4 glass-panel rounded-2xl p-5 border border-white/80 dark:border-purple-500/20 shadow-lg flex flex-col justify-between transition-colors">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-[#0f172a] dark:text-purple-200">Weekly Task Velocity</span>
          <span className="text-[10px] text-[#475569] dark:text-purple-400 font-bold bg-slate-100 dark:bg-purple-900/30 px-2 py-0.5 rounded-full border border-slate-200 dark:border-purple-500/20">
            This Week
          </span>
        </div>

        {/* Mini Chart Graphic matching the image */}
        <div className="flex items-end justify-between h-24 pt-3 pb-1 px-2">
          {/* Y-axis labels */}
          <div className="flex flex-col justify-between h-full text-[9px] text-[#64748b] dark:text-purple-400/60 font-mono pr-2">
            <span>10</span>
            <span>5</span>
            <span>0</span>
          </div>

          {/* Mon */}
          <div className="flex flex-col items-center gap-1.5 flex-1">
            <div className="w-5 h-16 rounded-t-md solid-bar transition-all hover:scale-105" />
            <span className="text-[10px] text-[#475569] dark:text-purple-300 font-bold">Mon</span>
          </div>

          {/* Tue */}
          <div className="flex flex-col items-center gap-1.5 flex-1">
            <div className="w-5 h-10 rounded-t-md striped-bar border-t border-indigo-400/50 transition-all hover:scale-105" />
            <span className="text-[10px] text-[#475569] dark:text-purple-300 font-bold">Tue</span>
          </div>

          {/* Wed */}
          <div className="flex flex-col items-center gap-1.5 flex-1">
            <div className="w-5 h-20 rounded-t-md solid-bar transition-all hover:scale-105" />
            <span className="text-[10px] text-[#475569] dark:text-purple-300 font-bold">Wed</span>
          </div>

          {/* Thu */}
          <div className="flex flex-col items-center gap-1.5 flex-1">
            <div className="w-5 h-12 rounded-t-md striped-bar border-t border-indigo-400/50 transition-all hover:scale-105" />
            <span className="text-[10px] text-[#475569] dark:text-purple-300 font-bold">Thu</span>
          </div>

          {/* Fri */}
          <div className="flex flex-col items-center gap-1.5 flex-1">
            <div className="w-5 h-18 rounded-t-md solid-bar transition-all hover:scale-105" />
            <span className="text-[10px] text-[#475569] dark:text-purple-300 font-bold">Fri</span>
          </div>
        </div>
      </div>

      {/* 2. Semi-Circular Radial Gauge Widget (Matching 68% Successful deals in screenshot) - 4 cols */}
      <div className="lg:col-span-4 glass-panel rounded-2xl p-5 border border-white/80 dark:border-purple-500/20 shadow-lg flex flex-col justify-between items-center text-center relative overflow-hidden transition-colors">
        <span className="text-xs font-bold text-[#0f172a] dark:text-purple-200 self-start">Execution Health</span>

        {/* SVG Semi-Circle Arc Speedometer Gauge */}
        <div className="relative w-44 h-24 mt-1 flex items-end justify-center">
          <svg className="w-44 h-24 overflow-visible" viewBox="0 0 176 90">
            {/* Background track arc */}
            <path
              d="M 18 85 A 70 70 0 0 1 158 85"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="14"
              strokeLinecap="round"
            />
            {/* Filled progress arc */}
            <path
              d="M 18 85 A 70 70 0 0 1 158 85"
              fill="none"
              stroke="url(#speedometerGradient)"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray="220"
              strokeDashoffset={220 - (220 * completionRate) / 100}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="speedometerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
            </defs>
          </svg>

          {/* Gauge Center Percentage */}
          <div className="absolute bottom-1 flex flex-col items-center">
            <span className="text-2xl font-black text-[#0f172a] dark:text-purple-100 tracking-tight">
              {completionRate}%
            </span>
          </div>
        </div>

        <p className="text-[11px] text-[#475569] dark:text-purple-300 font-bold mt-1">
          {doneTasks} of {totalTasks} deliverables completed
        </p>
      </div>

      {/* 3. Metric Block: In Progress Tasks - 2 cols */}
      <div
        onClick={onNavigateToTasks}
        className="lg:col-span-2 glass-panel glass-card-hover rounded-2xl p-5 border border-white/80 dark:border-purple-500/20 shadow-lg flex flex-col justify-between cursor-pointer group transition-colors"
      >
        <span className="text-xs font-bold text-[#64748b] dark:text-purple-300/80">In Progress</span>
        <div>
          <span className="text-4xl font-black text-[#0f172a] dark:text-purple-100 group-hover:text-indigo-600 dark:group-hover:text-purple-300 transition-colors">
            {inProgressTasks}
          </span>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 dark:border-purple-500/15">
            <span className="text-[11px] text-[#475569] dark:text-purple-400 font-bold">Tasks active</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500 dark:text-purple-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* 4. Metric Block: Overdue - 2 cols */}
      <div
        onClick={onNavigateToTasks}
        className="lg:col-span-2 glass-panel glass-card-hover rounded-2xl p-5 border border-white/80 dark:border-purple-500/20 shadow-lg flex flex-col justify-between cursor-pointer group transition-colors"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#64748b] dark:text-purple-300/80">Attention</span>
          {overdueCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          )}
        </div>
        <div>
          <span className="text-4xl font-black text-rose-600 dark:text-rose-300">
            {overdueCount}
          </span>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 dark:border-purple-500/15">
            <span className="text-[11px] text-rose-600 dark:text-rose-300/80 font-bold">Overdue flagged</span>
            <ArrowRight className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};
