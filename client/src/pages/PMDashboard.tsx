import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { PMStats, Project, Task } from '../types';
import { ActivityFeed } from '../components/ActivityFeed';
import { ProjectModal } from '../components/ProjectModal';
import { TaskModal } from '../components/TaskModal';
import { useSocket } from '../context/SocketContext';
import {
  FolderGit2,
  Calendar,
  AlertCircle,
  PlusCircle,
  FolderPlus,
  Clock,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { format } from 'date-fns';

export const PMDashboard: React.FC<{ onNavigateToTasks: () => void }> = ({ onNavigateToTasks }) => {
  const { lastUpdatedTask } = useSocket();
  const [stats, setStats] = useState<PMStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const fetchStats = async () => {
    try {
      const data = await api.dashboard.getStats();
      if (data.role === 'PROJECT_MANAGER') {
        setStats(data as PMStats);
      }
    } catch (e) {
      console.error('Error fetching PM dashboard stats:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (lastUpdatedTask) {
      fetchStats();
    }
  }, [lastUpdatedTask]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20 text-slate-400">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const priorityMap = stats?.tasksByPriority || {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
  };

  const managedProjects = stats?.projectsSummary?.projects || [];
  const upcomingTasks = stats?.upcomingDueDatesThisWeek || [];

  return (
    <div className="space-y-6">
      {/* Header with Project & Task Creation Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
            Project Manager Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tracking your managed projects, priority backlogs, and upcoming deliverables
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsProjectModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all shadow-sm"
          >
            <FolderPlus className="w-4 h-4 text-brand-400" />
            <span>New Project</span>
          </button>

          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create & Assign Task</span>
          </button>
        </div>
      </div>

      {/* Top 3 Metric Cards: Projects Summary, Tasks by Priority, Overdue count */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Managed Projects Summary */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">My Managed Projects</span>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-100">
              {stats?.projectsSummary?.totalManagedProjects ?? 0}
            </span>
            <span className="text-xs text-amber-400/90 font-medium">Ownership Enforced</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            You cannot view or edit projects created by other PMs
          </p>
        </div>

        {/* Tasks by Priority Breakdown */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Tasks by Priority</span>
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 pt-1 text-center">
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <p className="text-lg font-bold text-rose-400">{priorityMap.CRITICAL}</p>
              <p className="text-[10px] font-semibold text-rose-300">Critical</p>
            </div>
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-lg font-bold text-amber-400">{priorityMap.HIGH}</p>
              <p className="text-[10px] font-semibold text-amber-300">High</p>
            </div>
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-lg font-bold text-blue-400">{priorityMap.MEDIUM}</p>
              <p className="text-[10px] font-semibold text-blue-300">Medium</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
              <p className="text-lg font-bold text-slate-300">{priorityMap.LOW}</p>
              <p className="text-[10px] font-semibold text-slate-400">Low</p>
            </div>
          </div>
        </div>

        {/* Overdue Count in Managed Projects */}
        <div className="glass-panel rounded-2xl p-5 border border-rose-900/40">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-300">
              Overdue in My Projects
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-rose-400">
              {stats?.overdueCount ?? 0}
            </span>
            <span className="text-xs text-rose-400/80 font-medium">Automatic cron flagged</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Tasks past due date automatically marked by node-cron background job
          </p>
        </div>
      </div>

      {/* Main Grid: Upcoming due dates for this week + PM Live Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Upcoming Due Dates for this week & Project Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Upcoming Due Dates For This Week */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-400" />
                  Upcoming Due Dates (This Week)
                </h3>
                <p className="text-xs text-slate-400">
                  Deliverables scheduled between now and Sunday
                </p>
              </div>
              <button
                onClick={onNavigateToTasks}
                className="text-xs text-brand-400 hover:text-brand-300 font-semibold"
              >
                View all tasks →
              </button>
            </div>

            {upcomingTasks.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                No tasks due this week in your managed projects.
              </div>
            ) : (
              <div className="space-y-2.5">
                {upcomingTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-brand-400 bg-brand-950/60 px-1.5 py-0.5 rounded">
                          #{t.taskNumber}
                        </span>
                        <h4 className="text-xs font-bold text-slate-200 truncate">{t.title}</h4>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Project: <span className="text-slate-300">{t.project?.name}</span> · Assigned: <span className="text-brand-300">{t.assignedTo?.name || 'Unassigned'}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-amber-300 border border-slate-700 flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 text-amber-400" />
                        {format(new Date(t.dueDate), 'MMM dd')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Managed Projects List */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <h3 className="text-sm font-bold text-slate-100 mb-3">My Managed Projects</h3>
            <div className="space-y-3">
              {managedProjects.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">{p.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Client: {p.client?.company}</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                    {p._count?.tasks ?? 0} Tasks
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: PM-Specific Live Activity Feed (5 cols) */}
        <div className="lg:col-span-5 h-[620px]">
          <ActivityFeed />
        </div>
      </div>

      {/* Modals */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onProjectCreated={() => {
          fetchStats();
        }}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onTaskCreated={() => {
          fetchStats();
        }}
      />
    </div>
  );
};
