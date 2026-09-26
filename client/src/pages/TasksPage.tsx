import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { Task, Project } from '../types';
import { TaskCard } from '../components/TaskCard';
import { TaskFilters } from '../components/TaskFilters';
import { TaskModal } from '../components/TaskModal';
import { CheckSquare, PlusCircle, RefreshCw, Layers } from 'lucide-react';

interface TasksPageProps {
  initialProjectId?: string;
}

export const TasksPage: React.FC<TasksPageProps> = ({ initialProjectId }) => {
  const { user } = useAuth();
  const { socket, lastUpdatedTask } = useSocket();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId || '');
  const [currentFilters, setCurrentFilters] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Fetch projects for project filter selector
  useEffect(() => {
    if (user?.role !== 'DEVELOPER') {
      api.projects.getAll()
        .then((res) => setProjects(res.projects))
        .catch((e) => console.error('Error fetching projects list:', e));
    }
  }, [user]);

  const fetchTasks = useCallback(async (filters: any = currentFilters, projId = selectedProjectId) => {
    setIsLoading(true);
    try {
      const queryParams: Record<string, string> = {};
      if (filters.status) queryParams.status = filters.status;
      if (filters.priority) queryParams.priority = filters.priority;
      if (filters.dueDateFrom) queryParams.dueDateFrom = filters.dueDateFrom;
      if (filters.dueDateTo) queryParams.dueDateTo = filters.dueDateTo;
      if (projId) queryParams.projectId = projId;

      const res = await api.tasks.getAll(queryParams);
      setTasks(res.tasks);
    } catch (e) {
      console.error('Error fetching tasks:', e);
    } finally {
      setIsLoading(false);
    }
  }, [currentFilters, selectedProjectId]);

  useEffect(() => {
    fetchTasks(currentFilters, selectedProjectId);
  }, [currentFilters, selectedProjectId, fetchTasks]);

  // Real-time task update listener (updates task in-place without page refresh)
  useEffect(() => {
    if (!lastUpdatedTask) return;

    setTasks((prev) => {
      const index = prev.findIndex((t) => t.id === lastUpdatedTask.id);
      if (index !== -1) {
        const next = [...prev];
        next[index] = { ...next[index], ...lastUpdatedTask };
        return next;
      }
      return prev;
    });
  }, [lastUpdatedTask]);

  // Join Socket.io project room when a project is selected
  useEffect(() => {
    if (selectedProjectId && socket) {
      socket.emit('join:project', selectedProjectId);
      return () => {
        socket.emit('leave:project', selectedProjectId);
      };
    }
  }, [selectedProjectId, socket]);

  const handleFiltersChange = (filters: any) => {
    setCurrentFilters(filters);
  };

  const handleProjectFilterChange = (projId: string) => {
    setSelectedProjectId(projId);

    // Sync project param into URL query params
    const params = new URLSearchParams(window.location.search);
    if (projId) {
      params.set('projectId', projId);
    } else {
      params.delete('projectId');
    }
    const queryString = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState(null, '', queryString);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
            {user?.role === 'DEVELOPER' ? 'My Assigned Tasks' : 'Project Tasks Hub'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time interactive backlog · Filtered and shareable via URL parameters
          </p>
        </div>

        {user?.role !== 'DEVELOPER' && (
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create & Assign Task</span>
          </button>
        )}
      </div>

      {/* Project Selector (for Admin & PM) */}
      {user?.role !== 'DEVELOPER' && projects.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 text-xs font-medium mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Project:
          </span>
          <button
            onClick={() => handleProjectFilterChange('')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
              !selectedProjectId
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            All Projects
          </button>
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => handleProjectFilterChange(p.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                selectedProjectId === p.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      {/* Shareable URL Filters Component */}
      <TaskFilters onFiltersChange={handleFiltersChange} />

      {/* Task List / Board */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-slate-400 font-semibold">
            Showing {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          </span>

          <button
            onClick={() => fetchTasks(currentFilters, selectedProjectId)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-brand-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-20 text-slate-400">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800">
            <CheckSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-200">No Tasks Match Filters</h3>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your status, priority, or date range filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onTaskUpdated={(updated) => {
                  setTasks((prev) =>
                    prev.map((t) => (t.id === updated.id ? updated : t))
                  );
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        defaultProjectId={selectedProjectId || undefined}
        onClose={() => setIsTaskModalOpen(false)}
        onTaskCreated={() => fetchTasks()}
      />
    </div>
  );
};
