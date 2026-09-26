import React, { useState } from 'react';
import { Task } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Check,
  Calendar,
  MoreHorizontal,
  Plus,
  Share2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface WorkflowJourneyProps {
  tasks?: Task[];
  onTaskUpdated?: (updated: Task) => void;
  onAddTaskClick?: () => void;
}

export const WorkflowJourney: React.FC<WorkflowJourneyProps> = ({
  tasks = [],
  onTaskUpdated,
  onAddTaskClick,
}) => {
  const { user } = useAuth();
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null);

  // Team avatar roster matching the exact SugarCRM top strip
  const teamMembers = [
    { id: '1', name: 'Alex Admin', badge: '2', badgeBg: 'bg-blue-500', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80' },
    { id: '2', name: 'Sarah Mitchell', badge: '3', badgeBg: 'bg-sky-400', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80' },
    { id: '3', name: 'Marcus Vance', badge: '2', badgeBg: 'bg-rose-500', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80' },
    { id: '4', name: 'Elena Rostova', badge: '1', badgeBg: 'bg-rose-500', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80' },
    { id: '5', name: 'Ravi Kumar', badge: '+', badgeBg: 'bg-slate-200 text-slate-700 border border-slate-300', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80' },
    { id: '6', name: 'David Chen', badge: '1', badgeBg: 'bg-rose-500', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80' },
    { id: '7', name: 'Priya Sharma', badge: '+', badgeBg: 'bg-slate-200 text-slate-700 border border-slate-300', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80' },
    { id: '8', name: 'Lucas Scott', badge: '+', badgeBg: 'bg-slate-200 text-slate-700 border border-slate-300', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80' },
  ];

  return (
    <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-white/80 dark:border-purple-500/25 shadow-xl relative overflow-hidden mb-8 transition-colors">
      {/* Top Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-purple-500/20">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] dark:text-purple-100 tracking-tight">
              Customer Journeys
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200/80 dark:bg-purple-500/20 text-[#334155] dark:text-purple-300 border border-slate-300 dark:border-purple-500/30">
              Interactive Workflow Map
            </span>
          </div>
          <p className="text-xs font-semibold text-[#475569] dark:text-purple-300/70 mt-1">
            New Case Management & Lifecycle Progression
          </p>
        </div>

        {/* Center Floating Avatar Strip with count pills matching screenshot */}
        <div className="flex items-center gap-2 bg-white/80 dark:bg-purple-950/70 p-1.5 rounded-full border border-slate-200 dark:border-purple-500/25 shadow-sm">
          {teamMembers.map((member) => {
            const isSelected = selectedAssignee === member.name;
            return (
              <button
                key={member.id}
                onClick={() => setSelectedAssignee(isSelected ? null : member.name)}
                className={`relative group p-0.5 rounded-full transition-all ${
                  isSelected ? 'scale-110 ring-2 ring-indigo-500' : 'hover:scale-105'
                }`}
                title={`${member.name}`}
              >
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-8 h-8 rounded-full object-cover border border-white shadow-sm"
                />
                <span
                  className={`absolute -bottom-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full text-[9px] font-extrabold flex items-center justify-center ${
                    member.badge === '+' ? 'text-slate-700 bg-slate-200 border border-slate-300' : 'text-white ' + member.badgeBg
                  } shadow-sm`}
                >
                  {member.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Top Right Action Icons matching SugarCRM */}
        <div className="flex items-center gap-2">
          {onAddTaskClick && user?.role !== 'DEVELOPER' && (
            <button
              onClick={onAddTaskClick}
              className="w-9 h-9 rounded-full bg-white dark:bg-purple-950/60 hover:bg-slate-50 dark:hover:bg-purple-900 border border-slate-200 dark:border-purple-500/25 text-[#475569] dark:text-purple-300 hover:text-[#0f172a] dark:hover:text-purple-100 flex items-center justify-center transition-all shadow-sm"
              title="Add New Journey Task"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
          <button
            className="w-9 h-9 rounded-full bg-white dark:bg-purple-950/60 hover:bg-slate-50 dark:hover:bg-purple-900 border border-slate-200 dark:border-purple-500/25 text-[#475569] dark:text-purple-300 hover:text-[#0f172a] dark:hover:text-purple-100 flex items-center justify-center transition-all shadow-sm"
            title="Share Journey Board"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <button
            className="w-9 h-9 rounded-full bg-white dark:bg-purple-950/60 hover:bg-slate-50 dark:hover:bg-purple-900 border border-slate-200 dark:border-purple-500/25 text-[#475569] dark:text-purple-300 hover:text-[#0f172a] dark:hover:text-purple-100 flex items-center justify-center transition-all shadow-sm"
            title="Calendar View"
          >
            <Calendar className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main 4-Stage Interconnected Workflow Board */}
      <div className="mt-8 relative overflow-x-auto pb-4">
        <div className="min-w-[1040px] grid grid-cols-4 gap-8 items-start relative">
          
          {/* ================= STAGE 1: CASE ALLOCATION ================= */}
          <div className="space-y-4 relative">
            <div className="bg-white/90 dark:bg-purple-950/40 rounded-3xl p-5 border border-slate-200/90 dark:border-purple-500/20 space-y-4 relative shadow-md">
              {/* Item 1: Allocate Case to User! */}
              <div className="p-4 rounded-2xl bg-white dark:bg-purple-900/30 border border-slate-200/80 dark:border-purple-500/25 hover:border-slate-300 dark:hover:border-purple-400/50 transition-all shadow-sm group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <img
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80"
                      alt="User"
                      className="w-7 h-7 rounded-full object-cover border border-slate-300"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="flex items-center text-emerald-500">
                      <Check className="w-3.5 h-3.5 -mr-1 stroke-[3]" />
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
                <h4 className="text-xs font-bold text-[#1e293b] dark:text-purple-100 leading-snug">
                  Allocate Case to User!
                </h4>
              </div>

              {/* Separator / Divider */}
              <div className="h-px bg-slate-200 dark:bg-purple-500/15" />

              {/* Item 2: Acknowledge Case receipt to customer! */}
              <div className="p-4 rounded-2xl bg-white dark:bg-purple-900/30 border border-slate-200/80 dark:border-purple-500/25 hover:border-slate-300 dark:hover:border-purple-400/50 transition-all shadow-sm group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <img
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80"
                      alt="User"
                      className="w-7 h-7 rounded-full object-cover border border-slate-300"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="flex items-center text-emerald-500">
                      <Check className="w-3.5 h-3.5 -mr-1 stroke-[3]" />
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
                <h4 className="text-xs font-bold text-[#1e293b] dark:text-purple-100 leading-snug">
                  Acknowledge Case receipt to customer!
                </h4>
              </div>

              {/* Connector anchor dot on right */}
              <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-slate-400 dark:bg-purple-500 border-2 border-white dark:border-purple-950 shadow-sm" />
            </div>

            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1e293b] dark:text-purple-300">
                Case Allocation
              </span>
            </div>
          </div>

          {/* ================= STAGE 2: ISSUE IDENTIFICATION ================= */}
          <div className="space-y-4 relative">
            <div className="bg-white/90 dark:bg-purple-950/40 rounded-3xl p-5 border border-slate-200/90 dark:border-purple-500/20 space-y-3 relative shadow-md">
              {/* Connector anchor dot on left */}
              <div className="hidden lg:block absolute -left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-slate-400 dark:bg-purple-500 border-2 border-white dark:border-purple-950" />

              {/* 1. Identify Issue Category */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-purple-900/25 border border-slate-200/80 dark:border-purple-500/15 hover:border-slate-300 transition-all">
                <div className="flex items-center gap-2">
                  <img
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60"
                    alt="Elena"
                    className="w-6 h-6 rounded-full object-cover border border-slate-300"
                  />
                  <span className="text-[11px] font-semibold text-[#1e293b] dark:text-purple-100">
                    Identify Issue Category
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span className="flex items-center text-emerald-500">
                    <Check className="w-3 h-3 -mr-1 stroke-[3]" />
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                  <Calendar className="w-3 h-3 text-slate-400" />
                </div>
              </div>

              {/* 2. Identify Issue Severity */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-purple-900/25 border border-slate-200/80 dark:border-purple-500/15 hover:border-slate-300 transition-all">
                <div className="flex items-center gap-2">
                  <img
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60"
                    alt="Elena"
                    className="w-6 h-6 rounded-full object-cover border border-slate-300"
                  />
                  <span className="text-[11px] font-semibold text-[#1e293b] dark:text-purple-100">
                    Identify Issue Severity
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span className="flex items-center text-emerald-500">
                    <Check className="w-3 h-3 -mr-1 stroke-[3]" />
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                  <Calendar className="w-3 h-3 text-slate-400" />
                </div>
              </div>

              {/* 3. Identify Issue Impact */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-purple-900/25 border border-slate-200/80 dark:border-purple-500/15 hover:border-slate-300 transition-all">
                <div className="flex items-center gap-2">
                  <img
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60"
                    alt="Priya"
                    className="w-6 h-6 rounded-full object-cover border border-slate-300"
                  />
                  <span className="text-[11px] font-semibold text-[#1e293b] dark:text-purple-100">
                    Identify Issue Impact
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span className="flex items-center text-emerald-500">
                    <Check className="w-3 h-3 -mr-1 stroke-[3]" />
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                  <Calendar className="w-3 h-3 text-slate-400" />
                </div>
              </div>

              {/* 4. Allocate to Resolution Team */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-purple-900/25 border border-slate-200/80 dark:border-purple-500/15 hover:border-slate-300 transition-all">
                <div className="flex items-center gap-2">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60"
                    alt="Sarah"
                    className="w-6 h-6 rounded-full object-cover border border-slate-300"
                  />
                  <span className="text-[11px] font-semibold text-[#1e293b] dark:text-purple-100">
                    Allocate to Resolution Team
                  </span>
                </div>
                <MoreHorizontal className="w-3.5 h-3.5 text-slate-400" />
              </div>

              {/* 5. Advise Customer of Resolution estimate */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-purple-900/25 border border-slate-200/80 dark:border-purple-500/15 hover:border-slate-300 transition-all">
                <div className="flex items-center gap-2">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60"
                    alt="Marcus"
                    className="w-6 h-6 rounded-full object-cover border border-slate-300"
                  />
                  <span className="text-[11px] font-semibold text-[#1e293b] dark:text-purple-100">
                    Advise Customer of estimate
                  </span>
                </div>
                <MoreHorizontal className="w-3.5 h-3.5 text-slate-400" />
              </div>

              {/* Connector anchor dot on right */}
              <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-slate-400 dark:bg-purple-500 border-2 border-white dark:border-purple-950 shadow-sm" />
            </div>

            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1e293b] dark:text-purple-300">
                Issue Identification
              </span>
            </div>
          </div>

          {/* ================= STAGE 3: TECHNICAL RESOLUTION ================= */}
          <div className="space-y-4 relative">
            <div className="bg-white/90 dark:bg-purple-950/40 rounded-3xl p-5 border border-slate-200/90 dark:border-purple-500/20 space-y-3 relative shadow-md">
              {/* Connector anchor dot on left */}
              <div className="hidden lg:block absolute -left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-slate-400 dark:bg-purple-500 border-2 border-white dark:border-purple-950" />

              {/* 1. Identify Issue Dependencies */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-purple-900/25 border border-slate-200/80 dark:border-purple-500/15 hover:border-slate-300 transition-all">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-purple-800/60 flex items-center justify-center text-slate-700 dark:text-purple-300">
                    <Plus className="w-3 h-3" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#1e293b] dark:text-purple-100">
                    Identify Issue Dependencies
                  </span>
                </div>
              </div>

              {/* 2. Identify Issue Resolution */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-purple-900/25 border border-slate-200/80 dark:border-purple-500/15 hover:border-slate-300 transition-all">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-purple-800/60 flex items-center justify-center text-slate-700 dark:text-purple-300">
                    <Plus className="w-3 h-3" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#1e293b] dark:text-purple-100">
                    Identify Issue Resolution
                  </span>
                </div>
              </div>

              {/* 3. Estimate Resolution Time */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-purple-900/25 border border-slate-200/80 dark:border-purple-500/15 hover:border-slate-300 transition-all">
                <div className="flex items-center gap-2">
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60"
                    alt="David"
                    className="w-6 h-6 rounded-full object-cover border border-slate-300"
                  />
                  <span className="text-[11px] font-semibold text-[#1e293b] dark:text-purple-100">
                    Estimate Resolution Time
                  </span>
                </div>
                <MoreHorizontal className="w-3.5 h-3.5 text-slate-400" />
              </div>

              {/* 4. Advise Customer of Resolution Estimate */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-purple-900/25 border border-slate-200/80 dark:border-purple-500/15 hover:border-slate-300 transition-all">
                <div className="flex items-center gap-2">
                  <img
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60"
                    alt="Priya"
                    className="w-6 h-6 rounded-full object-cover border border-slate-300"
                  />
                  <span className="text-[11px] font-semibold text-[#1e293b] dark:text-purple-100">
                    Advise Customer of Estimate
                  </span>
                </div>
                <MoreHorizontal className="w-3.5 h-3.5 text-slate-400" />
              </div>

              {/* 5. Advise Customer Issue Resolved */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-purple-900/25 border border-slate-200/80 dark:border-purple-500/15 hover:border-slate-300 transition-all">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-purple-800/60 flex items-center justify-center text-slate-700 dark:text-purple-300">
                    <Plus className="w-3 h-3" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#1e293b] dark:text-purple-100">
                    Advise Customer Resolved
                  </span>
                </div>
              </div>

              {/* Curved Pointer Arrow leading to Stage 4 matching image */}
              <div className="hidden lg:block absolute -right-6 top-6 pointer-events-none">
                <svg width="40" height="30" viewBox="0 0 40 30" fill="none" className="text-slate-600 dark:text-purple-300">
                  <path d="M 2 20 Q 20 4, 38 12" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" fill="none" />
                  <polygon points="38,12 30,10 33,16" fill="currentColor" />
                </svg>
              </div>
            </div>

            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1e293b] dark:text-purple-300">
                Technical Resolution
              </span>
            </div>
          </div>

          {/* ================= STAGE 4: NEW TASKS GRID TILES ================= */}
          <div className="space-y-4 relative">
            <div className="bg-white/90 dark:bg-purple-950/40 rounded-3xl p-5 border border-slate-200/90 dark:border-purple-500/20 grid grid-cols-2 gap-3 relative shadow-md">
              
              {/* Highlighted Black / Dark Pill with bold white text matching image! */}
              <div className="p-3.5 rounded-2xl bg-black border-2 border-slate-800 shadow-xl col-span-1 text-center flex flex-col justify-center items-center relative group cursor-pointer">
                <span className="text-xs font-black text-white tracking-wide leading-tight">
                  Request
                  <br />
                  Processing
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mt-1.5" />
              </div>

              {/* Tile 2: Problem Resolution */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-purple-900/25 border border-slate-200/80 dark:border-purple-500/15 hover:border-slate-300 text-center flex items-center justify-center transition-all cursor-pointer">
                <span className="text-[11px] font-bold text-[#1e293b] dark:text-purple-200 leading-tight">
                  Problem
                  <br />
                  Resolution
                </span>
              </div>

              {/* Tile 3: Customer Communication */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-purple-900/25 border border-slate-200/80 dark:border-purple-500/15 hover:border-slate-300 text-center flex items-center justify-center transition-all cursor-pointer">
                <span className="text-[11px] font-bold text-[#1e293b] dark:text-purple-200 leading-tight">
                  Customer
                  <br />
                  Communication
                </span>
              </div>

              {/* Tile 4: Testing and Verification */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-purple-900/25 border border-slate-200/80 dark:border-purple-500/15 hover:border-slate-300 text-center flex items-center justify-center transition-all cursor-pointer">
                <span className="text-[11px] font-bold text-[#1e293b] dark:text-purple-200 leading-tight">
                  Testing and
                  <br />
                  Verification
                </span>
              </div>

              {/* Tile 5: Customer Notification */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-purple-900/25 border border-slate-200/80 dark:border-purple-500/15 hover:border-slate-300 text-center flex items-center justify-center transition-all cursor-pointer">
                <span className="text-[11px] font-bold text-[#1e293b] dark:text-purple-200 leading-tight">
                  Customer
                  <br />
                  Notification
                </span>
              </div>

              {/* Tile 6: Customer Satisfaction */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-purple-900/25 border border-slate-200/80 dark:border-purple-500/15 hover:border-slate-300 text-center flex items-center justify-center transition-all cursor-pointer">
                <span className="text-[11px] font-bold text-[#1e293b] dark:text-purple-200 leading-tight">
                  Customer
                  <br />
                  Satisfaction
                </span>
              </div>
            </div>

            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1e293b] dark:text-purple-300">
                New Tasks
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
