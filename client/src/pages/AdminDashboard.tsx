import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { AdminStats, Project } from '../types';
import { ActivityFeed } from '../components/ActivityFeed';
import {
  FolderGit2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Radio,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

export const AdminDashboard: React.FC<{ onNavigateToTasks: () => void; onNavigateToProjects: () => void }> = ({
  onNavigateToTasks,
  onNavigateToProjects,
}) => {
  const { onlineCount, onlineUsers, lastUpdatedTask } = useSocket();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const [sRes, pRes] = await Promise.all([api.dashboard.getStats(), api.projects.getAll()]);
      if (sRes.role === 'ADMIN') {
        setStats(sRes as AdminStats);
      }
      setProjects(pRes.projects);
    } catch (e) {
      console.error('Error fetching admin dashboard stats:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Update stats whenever a task status is changed in real time via WebSocket
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

  const tasksByStatus = stats?.tasksByStatus || {
    todo: 0,
    inProgress: 0,
    inReview: 0,
    done: 0,
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Subheading */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
            Administrator Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global overview of client projects, task health, and real-time team presence
          </p>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Projects */}
        <div
          onClick={onNavigateToProjects}
          className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800 cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Projects</span>
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-100">{stats?.totalProjects ?? 0}</span>
            <span className="text-xs text-blue-400 flex items-center font-medium">
              View all <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Active client engagements</p>
        </div>

        {/* Total Tasks by Status */}
        <div
          onClick={onNavigateToTasks}
          className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800 cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Tasks</span>
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-3xl font-extrabold text-slate-100">{stats?.totalTasks ?? 0}</span>
            <span className="text-xs text-purple-400 flex items-center font-medium">
              Task board <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1 text-[10px] text-center font-semibold pt-1 border-t border-slate-800">
            <span className="text-slate-400" title="To Do">TODO: {tasksByStatus.todo}</span>
            <span className="text-blue-400" title="In Progress">PROG: {tasksByStatus.inProgress}</span>
            <span className="text-purple-400" title="In Review">REV: {tasksByStatus.inReview}</span>
            <span className="text-emerald-400" title="Done">DONE: {tasksByStatus.done}</span>
          </div>
        </div>

        {/* Overdue Tasks */}
        <div
          onClick={onNavigateToTasks}
          className="glass-panel glass-panel-hover rounded-2xl p-5 border border-rose-900/40 cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-300">
              Overdue Tasks
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-rose-400">
              {stats?.overdueTaskCount ?? 0}
            </span>
            <span className="text-xs text-rose-400/80 font-medium">Needs Attention</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Flagged automatically by background job</p>
        </div>

        {/* Active Users Currently Online (LIVE via WebSocket Presence) */}
        <div className="glass-panel rounded-2xl p-5 border border-emerald-900/40 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Active Users Online
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-emerald-400">{onlineCount}</span>
            <span className="text-[11px] font-mono text-emerald-400/80 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              LIVE PRESENCE
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 truncate">
            {onlineUsers.length > 0
              ? onlineUsers.map((u) => u.name.split(' ')[0]).join(', ')
              : 'Connecting...'}
          </p>
        </div>
      </div>

      {/* Main Grid: Projects overview + Live Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Projects Health (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-100">All Client Projects</h3>
                <p className="text-xs text-slate-400">Total {projects.length} projects under agency management</p>
              </div>
              <button
                onClick={onNavigateToProjects}
                className="text-xs text-brand-400 hover:text-brand-300 font-semibold"
              >
                Manage Projects →
              </button>
            </div>

            <div className="space-y-3">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">{p.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Client: <span className="text-slate-300 font-medium">{p.client?.company || 'Direct'}</span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Managed by: <span className="text-brand-400">{p.manager?.name}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                      {p._count?.tasks ?? 0} Tasks
                    </span>
                    <button
                      onClick={onNavigateToTasks}
                      className="text-xs text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800/80"
                      title="Inspect tasks"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Real-Time Live Activity Feed (5 cols) */}
        <div className="lg:col-span-5 h-[620px]">
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
};
