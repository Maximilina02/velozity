import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Calendar,
  MoreVertical,
  MessageSquare,
  Paperclip,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { format, isPast } from 'date-fns';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskUpdated?: (updated: Task) => void;
  searchQuery?: string;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, onTaskUpdated, searchQuery = '' }) => {
  const { user } = useAuth();
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const columns: { status: TaskStatus; title: string; countLabel: string }[] = [
    { status: 'TODO', title: 'To Do', countLabel: 'Contacted' },
    { status: 'IN_PROGRESS', title: 'In Progress', countLabel: 'Negotiation' },
    { status: 'IN_REVIEW', title: 'In Review', countLabel: 'Offer Sent' },
    { status: 'DONE', title: 'Done', countLabel: 'Deal Closed' },
  ];

  const filteredTasks = tasks.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.project?.name.toLowerCase().includes(q) ||
      t.assignedTo?.name.toLowerCase().includes(q)
    );
  });

  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    if (newStatus === task.status || updatingTaskId) return;

    if (user?.role === 'DEVELOPER' && task.assignedToId !== user.id) {
      alert('Access Denied: Developers can only modify tasks assigned to them.');
      return;
    }

    setUpdatingTaskId(task.id);
    try {
      const res = await api.tasks.updateStatus(task.id, newStatus);
      if (onTaskUpdated) {
        onTaskUpdated(res.task);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update task status');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
      {columns.map((col) => {
        const colTasks = filteredTasks.filter((t) => t.status === col.status);

        return (
          <div key={col.status} className="flex flex-col space-y-3.5">
            {/* Column Header */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-[#0f172a] dark:text-purple-100">{col.title}</h3>
                <span className="text-[11px] text-[#64748b] dark:text-purple-400 font-bold">({col.countLabel})</span>
              </div>

              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white dark:bg-purple-950/70 border border-slate-200 dark:border-purple-500/25 text-[#0f172a] dark:text-purple-300 shadow-sm">
                {colTasks.length} ↑
              </span>
            </div>

            {/* Column Tasks List */}
            <div className="space-y-3 min-h-[350px]">
              {colTasks.length === 0 ? (
                <div className="bg-white/60 dark:bg-purple-950/20 rounded-2xl p-8 text-center border-dashed border border-slate-300 dark:border-purple-500/20 text-[#64748b] dark:text-purple-400/50 text-xs font-semibold">
                  No tasks in this stage
                </div>
              ) : (
                colTasks.map((task, idx) => {
                  const isDuePast = task.isOverdue || (isPast(new Date(task.dueDate)) && task.status !== 'DONE');
                  const isFeatured = task.priority === 'CRITICAL' || idx === 1;

                  const canModify =
                    user?.role === 'ADMIN' ||
                    (user?.role === 'PROJECT_MANAGER' && task.project?.managerId === user.id) ||
                    (user?.role === 'DEVELOPER' && task.assignedToId === user.id);

                  return (
                    <div
                      key={task.id}
                      className={`rounded-2xl p-4 transition-all glass-card-hover border relative group ${
                        isFeatured
                          ? 'bg-slate-900 text-white dark:bg-gradient-to-br dark:from-[#1c133a] dark:to-[#25184d] border-slate-700 dark:border-purple-400/40 shadow-xl ring-1 ring-slate-800 dark:ring-purple-500/20'
                          : 'bg-white/95 dark:glass-panel border-slate-200/90 dark:border-purple-500/20 shadow-md'
                      }`}
                    >
                      {/* Top Header: Title & 3-dots menu */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <span className={`text-[10px] font-bold font-mono uppercase tracking-wider ${
                            isFeatured ? 'text-indigo-400' : 'text-[#64748b] dark:text-purple-400'
                          }`}>
                            #{task.taskNumber} · {task.project?.name || 'Project'}
                          </span>
                          <h4 className={`text-xs font-bold leading-snug mt-0.5 truncate ${
                            isFeatured ? 'text-white' : 'text-[#0f172a] dark:text-purple-100'
                          }`}>
                            {task.title}
                          </h4>
                        </div>
                        <button
                          className={`p-1 rounded-lg ${
                            isFeatured ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-[#0f172a] dark:text-purple-400/60 dark:hover:text-purple-200'
                          }`}
                          title="Options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Description Snippet */}
                      <p className={`text-[11px] mb-3.5 line-clamp-2 leading-relaxed font-medium ${
                        isFeatured ? 'text-slate-300' : 'text-[#475569] dark:text-purple-300/70'
                      }`}>
                        {task.description}
                      </p>

                      {/* Footer Details: Date, Comments */}
                      <div className={`flex flex-wrap items-center justify-between gap-2 text-[11px] pt-3 border-t ${
                        isFeatured ? 'border-slate-800' : 'border-slate-100 dark:border-purple-500/15'
                      }`}>
                        {/* Due Date pill with calendar icon */}
                        <div
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                            isDuePast
                              ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30'
                              : isFeatured
                              ? 'bg-slate-800 text-slate-300 border border-slate-700'
                              : 'bg-slate-100 text-[#475569] dark:bg-purple-950/60 dark:text-purple-300 border border-slate-200 dark:border-purple-500/20'
                          }`}
                        >
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{format(new Date(task.dueDate), 'dd MMM')}</span>
                          {isDuePast && <span className="text-[9px] uppercase ml-0.5 text-rose-600">Overdue</span>}
                        </div>

                        {/* Comments / Subtask counter */}
                        <div className={`flex items-center gap-2.5 ${isFeatured ? 'text-slate-400' : 'text-slate-400 dark:text-purple-400/80'}`}>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            <span>{(task.taskNumber % 3) + 1}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Paperclip className="w-3 h-3" />
                            <span>{(task.taskNumber % 2) + 1}</span>
                          </span>
                        </div>
                      </div>

                      {/* Assigned Manager / Developer */}
                      <div className={`mt-3 pt-2.5 border-t flex items-center justify-between gap-2 ${
                        isFeatured ? 'border-slate-800' : 'border-slate-100 dark:border-purple-500/10'
                      }`}>
                        {task.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                              {task.assignedTo.name.charAt(0)}
                            </div>
                            <span className={`text-[11px] font-bold truncate max-w-[120px] ${
                              isFeatured ? 'text-slate-200' : 'text-[#1e293b] dark:text-purple-200'
                            }`}>
                              {task.assignedTo.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] italic text-slate-400">Unassigned</span>
                        )}

                        {/* Status Transition Action */}
                        {canModify ? (
                          <select
                            value={task.status}
                            disabled={updatingTaskId === task.id}
                            onChange={(e) => handleStatusChange(task, e.target.value as TaskStatus)}
                            className={`text-[10px] font-bold rounded-lg px-2 py-1 focus:outline-none cursor-pointer ${
                              isFeatured
                                ? 'bg-slate-800 border border-slate-700 text-white'
                                : 'bg-slate-100 dark:bg-purple-950/80 border border-slate-200 dark:border-purple-500/30 text-[#0f172a] dark:text-purple-200'
                            }`}
                          >
                            <option value="TODO">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="IN_REVIEW">In Review</option>
                            <option value="DONE">Done</option>
                          </select>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" /> Assigned
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
