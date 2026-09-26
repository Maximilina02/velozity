import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Calendar, AlertCircle, ArrowRight, UserCheck, ShieldAlert } from 'lucide-react';
import { format, isPast } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onTaskUpdated?: (updated: Task) => void;
  canEditDetails?: boolean;
  onEdit?: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onTaskUpdated, canEditDetails, onEdit }) => {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const canChangeStatus =
    user?.role === 'ADMIN' ||
    (user?.role === 'PROJECT_MANAGER' && task.project?.managerId === user.id) ||
    (user?.role === 'DEVELOPER' && task.assignedToId === user.id);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (newStatus === task.status || isUpdating) return;
    setIsUpdating(true);
    try {
      const res = await api.tasks.updateStatus(task.id, newStatus);
      if (onTaskUpdated) {
        onTaskUpdated(res.task);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update task status');
    } finally {
      setIsUpdating(false);
    }
  };

  const getPriorityBadge = (p: TaskPriority) => {
    switch (p) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">MEDIUM</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-700/60 text-slate-300 border border-slate-600/50">LOW</span>;
    }
  };

  const getStatusBadge = (s: TaskStatus) => {
    switch (s) {
      case 'TODO':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">To Do</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/40">In Progress</span>;
      case 'IN_REVIEW':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/40">In Review</span>;
      case 'DONE':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">Done</span>;
    }
  };

  const isDuePast = task.isOverdue || (isPast(new Date(task.dueDate)) && task.status !== 'DONE');

  return (
    <div className={`p-4 rounded-xl glass-panel glass-panel-hover border transition-all ${
      isDuePast ? 'border-rose-900/50 hover:border-rose-600/50' : 'border-slate-800'
    }`}>
      {/* Top Header: Task Number, Priority, Status */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-brand-400 bg-brand-950/60 px-2 py-0.5 rounded border border-brand-800/40">
            #{task.taskNumber}
          </span>
          {getPriorityBadge(task.priority)}
          {isDuePast && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-600/20 text-rose-400 border border-rose-500/40 animate-pulse">
              <AlertCircle className="w-3 h-3" />
              OVERDUE
            </span>
          )}
        </div>
        {getStatusBadge(task.status)}
      </div>

      {/* Title & Description */}
      <h4 className="text-sm font-bold text-slate-100 mb-1 leading-snug">{task.title}</h4>
      <p className="text-xs text-slate-400 mb-3 line-clamp-2 leading-relaxed">{task.description}</p>

      {/* Project & Due Date Details */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-3 border-t border-slate-800/70">
        <div className="flex items-center gap-1.5">
          <Calendar className={`w-3.5 h-3.5 ${isDuePast ? 'text-rose-400' : 'text-slate-400'}`} />
          <span className={isDuePast ? 'text-rose-400 font-semibold' : 'text-slate-400'}>
            Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}
          </span>
        </div>

        {/* Assigned Developer */}
        <div className="flex items-center gap-1.5">
          {task.assignedTo ? (
            <div className="flex items-center gap-1.5" title={`Assigned to ${task.assignedTo.name}`}>
              <div className="w-5 h-5 rounded-full bg-brand-700 text-white flex items-center justify-center text-[10px] font-bold">
                {task.assignedTo.name.charAt(0)}
              </div>
              <span className="text-slate-300 text-xs truncate max-w-[100px]">{task.assignedTo.name}</span>
            </div>
          ) : (
            <span className="text-slate-500 italic text-[11px]">Unassigned</span>
          )}
        </div>
      </div>

      {/* Status Transition Control (for allowed roles) */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/50 flex flex-wrap items-center justify-between gap-2">
        {canChangeStatus ? (
          <div className="flex items-center gap-1.5 w-full">
            <span className="text-[11px] text-slate-500">Change Status:</span>
            <div className="grid grid-cols-4 gap-1 flex-1">
              {(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] as TaskStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusChange(st)}
                  disabled={isUpdating || task.status === st}
                  className={`text-[10px] py-1 px-1 rounded text-center font-semibold transition-all ${
                    task.status === st
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {st === 'TODO' ? 'To Do' : st === 'IN_PROGRESS' ? 'Prog' : st === 'IN_REVIEW' ? 'Review' : 'Done'}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-[11px] text-slate-500 italic flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-slate-500" />
            Status locked (Assigned to another dev)
          </div>
        )}

        {canEditDetails && onEdit && (
          <button
            onClick={() => onEdit(task)}
            className="text-[11px] text-brand-400 hover:text-brand-300 font-medium ml-auto"
          >
            Edit Task
          </button>
        )}
      </div>
    </div>
  );
};
