import React from 'react';
import { Plus, Share2, Calendar, TrendingUp, CheckCircle2, Flame } from 'lucide-react';

interface SupportJourneyGaugeProps {
  executedCount?: number;
  activeCount?: number;
  totalCases?: number;
}

export const SupportJourneyGauge: React.FC<SupportJourneyGaugeProps> = ({
  executedCount = 5,
  activeCount = 7,
  totalCases = 12,
}) => {
  return (
    <div className="glass-panel-elevated rounded-3xl p-6 sm:p-7 border border-white/80 dark:border-purple-500/25 shadow-xl relative overflow-hidden flex flex-col justify-between transition-colors">
      {/* Header matching SugarCRM */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-purple-500/20">
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-[#0f172a] dark:text-purple-100 tracking-tight flex items-center gap-2">
            Support Ticket Journey
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </h3>
          <p className="text-[11px] font-medium text-[#475569] dark:text-purple-300/70">
            Real-time execution status vs active operational tickets
          </p>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          <button
            className="w-8 h-8 rounded-full bg-white dark:bg-purple-950/60 hover:bg-slate-50 dark:hover:bg-purple-900 border border-slate-200 dark:border-purple-500/25 text-[#475569] dark:text-purple-300 hover:text-[#0f172a] dark:hover:text-purple-100 flex items-center justify-center transition-all shadow-sm"
            title="Add Support Ticket"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            className="w-8 h-8 rounded-full bg-white dark:bg-purple-950/60 hover:bg-slate-50 dark:hover:bg-purple-900 border border-slate-200 dark:border-purple-500/25 text-[#475569] dark:text-purple-300 hover:text-[#0f172a] dark:hover:text-purple-100 flex items-center justify-center transition-all shadow-sm"
            title="Export Metrics"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <button
            className="w-8 h-8 rounded-full bg-white dark:bg-purple-950/60 hover:bg-slate-50 dark:hover:bg-purple-900 border border-slate-200 dark:border-purple-500/25 text-[#475569] dark:text-purple-300 hover:text-[#0f172a] dark:hover:text-purple-100 flex items-center justify-center transition-all shadow-sm"
            title="Filter by Timeline"
          >
            <Calendar className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Visual Chart Area - Exact SugarCRM Dual Arc / Semicircle Shape */}
      <div className="mt-6 flex flex-col items-center justify-center">
        <div className="relative w-full max-w-sm h-48 flex items-end justify-center gap-6 pb-2">
          
          {/* 1. Left Arc: Executed (5) */}
          <div className="relative flex flex-col items-center group cursor-pointer">
            {/* Top pill badge with dark font matching SugarCRM */}
            <div className="absolute -top-10 px-3.5 py-1 rounded-full bg-white dark:bg-purple-950/80 border border-slate-200 dark:border-blue-400/40 text-[#0f172a] dark:text-blue-300 font-black text-sm shadow-md transition-transform group-hover:scale-110">
              {executedCount}
            </div>

            {/* Blue Semi-Circle Mound */}
            <div className="w-36 h-28 bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400 rounded-t-full border-t border-x border-blue-300 flex flex-col items-center justify-center pt-4 transition-all duration-300 group-hover:shadow-[0_0_25px_rgba(59,130,246,0.35)] shadow-md">
              <CheckCircle2 className="w-5 h-5 text-white mb-1" />
              <span className="text-xs font-black text-white uppercase tracking-wider">
                Executed
              </span>
              <span className="text-[10px] text-blue-100 font-bold">
                {Math.round((executedCount / (executedCount + activeCount)) * 100)}% resolved
              </span>
            </div>
          </div>

          {/* 2. Right Arc: Active (7) */}
          <div className="relative flex flex-col items-center group cursor-pointer">
            {/* Top pill badge with dark font matching SugarCRM */}
            <div className="absolute -top-10 px-3.5 py-1 rounded-full bg-white dark:bg-purple-950/80 border border-slate-200 dark:border-rose-400/40 text-[#0f172a] dark:text-rose-300 font-black text-sm shadow-md transition-transform group-hover:scale-110">
              {activeCount}
            </div>

            {/* Coral/Rose Semi-Circle Mound */}
            <div className="w-36 h-32 bg-gradient-to-t from-rose-600 via-rose-500 to-rose-400 rounded-t-full border-t border-x border-rose-300 flex flex-col items-center justify-center pt-4 transition-all duration-300 group-hover:shadow-[0_0_25px_rgba(244,63,94,0.35)] shadow-md">
              <Flame className="w-5 h-5 text-white mb-1 animate-pulse" />
              <span className="text-xs font-black text-white uppercase tracking-wider">
                Active
              </span>
              <span className="text-[10px] text-rose-100 font-bold">
                In resolution
              </span>
            </div>
          </div>

        </div>

        {/* Legend / Metrics Footer */}
        <div className="w-full mt-4 pt-3 border-t border-slate-200/80 dark:border-purple-500/15 flex items-center justify-around text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-[#475569] dark:text-purple-300 font-medium">Resolved Cases:</span>
            <span className="font-bold text-[#0f172a] dark:text-white">{executedCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-[#475569] dark:text-purple-300 font-medium">Open Tickets:</span>
            <span className="font-bold text-[#0f172a] dark:text-white">{activeCount}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-bold text-emerald-600 dark:text-emerald-400">+18% SLA speed</span>
          </div>
        </div>
      </div>
    </div>
  );
};
