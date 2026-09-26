import React, { useEffect, useState } from 'react';
import { Filter, X, Calendar, RotateCcw } from 'lucide-react';
import { TaskStatus, TaskPriority } from '../types';

interface TaskFiltersProps {
  onFiltersChange: (filters: {
    status?: string;
    priority?: string;
    dueDateFrom?: string;
    dueDateTo?: string;
  }) => void;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({ onFiltersChange }) => {
  const [status, setStatus] = useState<string>('');
  const [priority, setPriority] = useState<string>('');
  const [dueDateFrom, setDueDateFrom] = useState<string>('');
  const [dueDateTo, setDueDateTo] = useState<string>('');

  // 1. Initialize from URL query parameters on mount (Shareable URLs)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialStatus = params.get('status') || '';
    const initialPriority = params.get('priority') || '';
    const initialDueDateFrom = params.get('dueDateFrom') || '';
    const initialDueDateTo = params.get('dueDateTo') || '';

    setStatus(initialStatus);
    setPriority(initialPriority);
    setDueDateFrom(initialDueDateFrom);
    setDueDateTo(initialDueDateTo);

    onFiltersChange({
      status: initialStatus || undefined,
      priority: initialPriority || undefined,
      dueDateFrom: initialDueDateFrom || undefined,
      dueDateTo: initialDueDateTo || undefined,
    });
  }, []);

  // 2. Synchronize filters to URL Query Parameters
  const updateUrlAndNotify = (newStatus: string, newPriority: string, newFrom: string, newTo: string) => {
    const params = new URLSearchParams();
    if (newStatus) params.set('status', newStatus);
    if (newPriority) params.set('priority', newPriority);
    if (newFrom) params.set('dueDateFrom', newFrom);
    if (newTo) params.set('dueDateTo', newTo);

    const queryString = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState(null, '', queryString);

    onFiltersChange({
      status: newStatus || undefined,
      priority: newPriority || undefined,
      dueDateFrom: newFrom || undefined,
      dueDateTo: newTo || undefined,
    });
  };

  const handleStatusChange = (val: string) => {
    setStatus(val);
    updateUrlAndNotify(val, priority, dueDateFrom, dueDateTo);
  };

  const handlePriorityChange = (val: string) => {
    setPriority(val);
    updateUrlAndNotify(status, val, dueDateFrom, dueDateTo);
  };

  const handleFromChange = (val: string) => {
    setDueDateFrom(val);
    updateUrlAndNotify(status, priority, val, dueDateTo);
  };

  const handleToChange = (val: string) => {
    setDueDateTo(val);
    updateUrlAndNotify(status, priority, dueDateFrom, val);
  };

  const handleReset = () => {
    setStatus('');
    setPriority('');
    setDueDateFrom('');
    setDueDateTo('');
    updateUrlAndNotify('', '', '', '');
  };

  const hasActiveFilters = Boolean(status || priority || dueDateFrom || dueDateTo);

  return (
    <div className="glass-panel rounded-xl p-4 border border-slate-800 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand-400" />
          <span className="text-xs font-bold text-slate-200">Shareable URL Filters:</span>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Active
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear Filters</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Status Filter */}
        <div>
          <label className="block text-slate-400 mb-1 text-[11px] font-medium">Status</label>
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-brand-500"
          >
            <option value="">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="DONE">Done</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-slate-400 mb-1 text-[11px] font-medium">Priority</label>
          <select
            value={priority}
            onChange={(e) => handlePriorityChange(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-brand-500"
          >
            <option value="">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        {/* Due Date From */}
        <div>
          <label className="block text-slate-400 mb-1 text-[11px] font-medium">Due Date From</label>
          <input
            type="date"
            value={dueDateFrom}
            onChange={(e) => handleFromChange(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Due Date To */}
        <div>
          <label className="block text-slate-400 mb-1 text-[11px] font-medium">Due Date To</label>
          <input
            type="date"
            value={dueDateTo}
            onChange={(e) => handleToChange(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>
    </div>
  );
};
