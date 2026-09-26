import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Project, Role } from '../types';
import { ProjectModal } from '../components/ProjectModal';
import { TaskModal } from '../components/TaskModal';
import {
  FolderGit2,
  PlusCircle,
  Building2,
  Calendar,
  CheckCircle2,
  Layers,
  ShieldAlert,
} from 'lucide-react';
import { format } from 'date-fns';

export const ProjectsPage: React.FC<{ onSelectProjectTasks: (projectId: string) => void }> = ({
  onSelectProjectTasks,
}) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [selectedProjectIdForTask, setSelectedProjectIdForTask] = useState<string | undefined>();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await api.projects.getAll();
      setProjects(res.projects);
    } catch (e) {
      console.error('Error fetching projects:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleOpenAddTask = (projectId: string) => {
    setSelectedProjectIdForTask(projectId);
    setIsTaskModalOpen(true);
  };

  if (user?.role === 'DEVELOPER') {
    return (
      <div className="glass-panel rounded-2xl p-10 border border-slate-800 text-center max-w-lg mx-auto mt-10">
        <ShieldAlert className="w-12 h-12 text-amber-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-100">Project Management Restricted</h3>
        <p className="text-xs text-slate-400 mt-2">
          Developers only have access to their direct assigned task board.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
            Client Projects
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {user?.role === 'ADMIN'
              ? 'Global registry of all enterprise client accounts and assignments'
              : 'Projects created and managed exclusively by your PM account'}
          </p>
        </div>

        <button
          onClick={() => setIsProjectModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-20 text-slate-400">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800">
          <FolderGit2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-200">No Projects Found</h3>
          <p className="text-xs text-slate-400 mt-1">
            Create your first client project to start assigning tasks to developers.
          </p>
          <button
            onClick={() => setIsProjectModalOpen(true)}
            className="mt-4 px-4 py-2 rounded-lg bg-brand-600 text-white text-xs font-semibold"
          >
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <div
              key={project.id}
              className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
                    <FolderGit2 className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-brand-400" />
                    {project._count?.tasks ?? 0} Tasks
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-100 mb-1 leading-snug">
                  {project.name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                  {project.description || 'No description provided.'}
                </p>

                <div className="space-y-1.5 text-xs text-slate-400 pt-3 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-300 font-medium">
                      {project.client?.company || 'Direct Client'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Manager: <span className="text-brand-300">{project.manager?.name}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleOpenAddTask(project.id)}
                  className="text-xs text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add Task</span>
                </button>

                <button
                  onClick={() => onSelectProjectTasks(project.id)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                >
                  View Tasks →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onProjectCreated={() => fetchProjects()}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        defaultProjectId={selectedProjectIdForTask}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedProjectIdForTask(undefined);
        }}
        onTaskCreated={() => fetchProjects()}
      />
    </div>
  );
};
