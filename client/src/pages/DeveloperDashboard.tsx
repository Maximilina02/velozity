import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DeveloperStats, Task } from '../types';
import { ActivityFeed } from '../components/ActivityFeed';
import { TaskCard } from '../components/TaskCard';
import { useSocket } from '../context/SocketContext';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ShieldCheck,
  Send,
} from 'lucide-react';

export const DeveloperDashboard: React.FC = () => {
  const { lastUpdatedTask } = useSocket();
  const [stats, setStats] = useState<DeveloperStats | null>(null);
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const data = await api.dashboard.getStats();
      if (data.role === 'DEVELOPER') {
        const devStats = data as DeveloperStats;
        setStats(devStats);
        setAssignedTasks(devStats.assignedTasks || []);
      }
    } catch (e) {
      console.error('Error fetching developer dashboard:', e);
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

  const summary = stats?.summary || {
    totalAssigned: 0,
    inProgressCount: 0,
    doneCount: 0,
    overdueCount: 0,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
            Developer Workspace
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tasks strictly assigned to you — sorted by priority, then sorted by due date
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Strict Developer Isolation (Other devs' tasks hidden)</span>
        </div>
      </div>

      {/* 4 Developer Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Assigned */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Assigned to Me</span>
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-slate-100">{summary.totalAssigned}</span>
          <p className="text-[11px] text-slate-400 mt-2">Active backlog queue</p>
        </div>

        {/* In Progress */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">In Progress</span>
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-purple-400">{summary.inProgressCount}</span>
          <p className="text-[11px] text-slate-400 mt-2">Currently being implemented</p>
        </div>

        {/* Completed */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-emerald-400">{summary.doneCount}</span>
          <p className="text-[11px] text-slate-400 mt-2">Verified deliverables</p>
        </div>

        {/* Overdue */}
        <div className="glass-panel rounded-2xl p-5 border border-rose-900/40">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-300">
              Overdue Tasks
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <span className="text-3xl font-extrabold text-rose-400">{summary.overdueCount}</span>
          <p className="text-[11px] text-slate-400 mt-2">Requires immediate attention</p>
        </div>
      </div>

      {/* Main Grid: Developer Tasks list (Priority sorted then due date) + Dev Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Tasks List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel rounded-2xl p-5 border border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-400" />
                  Assigned Backlog
                </h3>
                <p className="text-xs text-slate-400">
                  Ordered by Priority (Critical → High → Medium → Low) then Due Date
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                {assignedTasks.length} tasks
              </span>
            </div>

            {assignedTasks.length === 0 ? (
              <div className="p-10 text-center text-slate-500 text-xs">
                No tasks assigned to your account.
              </div>
            ) : (
              <div className="space-y-3">
                {assignedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onTaskUpdated={(updated) => {
                      setAssignedTasks((prev) =>
                        prev.map((t) => (t.id === updated.id ? updated : t))
                      );
                      fetchStats();
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Developer-Scoped Live Activity Feed (5 cols) */}
        <div className="lg:col-span-5 h-[620px]">
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
};
