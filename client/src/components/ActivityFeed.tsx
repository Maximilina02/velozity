import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { Activity, Clock, RefreshCw, Zap, ShieldCheck, Database, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const ActivityFeed: React.FC = () => {
  const { activities, refreshActivities, isConnected } = useSocket();
  const { user } = useAuth();
  const [filterType, setFilterType] = useState<'ALL' | 'STATUS_CHANGE' | 'TASK_ASSIGNED' | 'TASK_OVERDUE'>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualSync = async () => {
    setIsRefreshing(true);
    await refreshActivities();
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const filteredActivities = activities.filter((act) => {
    if (filterType === 'ALL') return true;
    return act.action === filterType;
  });

  const getRoleScopeDescription = () => {
    switch (user?.role) {
      case 'ADMIN':
        return 'Global Activity Feed (All Projects)';
      case 'PROJECT_MANAGER':
        return 'Team Activity Feed (Managed Projects Only)';
      case 'DEVELOPER':
        return 'Personal Feed (My Assigned Tasks Only)';
      default:
        return 'Activity Feed';
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'STATUS_CHANGE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">Status Update</span>;
      case 'TASK_ASSIGNED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">Assigned</span>;
      case 'TASK_OVERDUE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">Overdue</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-700 text-slate-300">Action</span>;
    }
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
            <Zap className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-100">Live Activity Feed</h3>
              <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live WebSocket
              </span>
            </div>
            <p className="text-xs text-slate-400">{getRoleScopeDescription()}</p>
          </div>
        </div>

        {/* Sync from Database (Offline catchup trigger & indicator) */}
        <button
          onClick={handleManualSync}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-all"
          title="Fetches last 20 events directly from PostgreSQL database (Offline catch-up)"
        >
          <Database className="w-3.5 h-3.5 text-brand-400" />
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Sync from DB</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 py-3 border-b border-slate-800/60 overflow-x-auto text-xs">
        <span className="text-slate-500 text-[11px] mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3" /> Filter:
        </span>
        {(['ALL', 'STATUS_CHANGE', 'TASK_ASSIGNED', 'TASK_OVERDUE'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              filterType === type
                ? 'bg-brand-600/30 text-brand-300 border border-brand-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            {type === 'ALL' ? 'All' : type === 'STATUS_CHANGE' ? 'Status' : type === 'TASK_ASSIGNED' ? 'Assignments' : 'Overdue'}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto mt-3 space-y-2.5 pr-1 min-h-[300px]">
        {filteredActivities.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-xs">
            No activity logs found for your role scope.
          </div>
        ) : (
          filteredActivities.map((act) => (
            <div
              key={act.id}
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all flex items-start gap-3 group"
            >
              {/* User Avatar */}
              <div className="relative mt-0.5">
                {act.user?.avatarUrl ? (
                  <img
                    src={act.user.avatarUrl}
                    alt={act.user.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-700"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                    {act.user?.name?.charAt(0) || 'U'}
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <Activity className="w-2 h-2 text-brand-400" />
                </span>
              </div>

              {/* Activity Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-xs font-bold text-slate-200">{act.user?.name}</span>
                    {getActionBadge(act.action)}
                  </div>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1 whitespace-nowrap">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(act.createdAt), { addSuffix: true })}
                  </span>
                </div>

                {/* Formatted Text: "Ravi moved Task #12 from In Progress → In Review · 2 mins ago" */}
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  {act.details}
                </p>

                {act.project && (
                  <div className="mt-1 text-[11px] text-slate-500 truncate">
                    Project: <span className="text-slate-400">{act.project.name}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Role-filtered via database & socket rooms
        </span>
        <span>Showing {filteredActivities.length} recent events</span>
      </div>
    </div>
  );
};
