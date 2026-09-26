import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider, useSocket } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import { Login } from './pages/Login';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { AnalyticsHeader } from './components/AnalyticsHeader';
import { KanbanBoard } from './components/KanbanBoard';
import { ActivityFeed } from './components/ActivityFeed';
import { ClientsPage } from './pages/ClientsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { TasksPage } from './pages/TasksPage';
import { ProjectModal } from './components/ProjectModal';
import { TaskModal } from './components/TaskModal';
import { ClientModal } from './components/ClientModal';
import { TaskFilters } from './components/TaskFilters';
import { RoleDemoBar } from './components/RoleDemoBar';
import { WorkflowJourney } from './components/WorkflowJourney';
import { SuggestedKnowledge } from './components/SuggestedKnowledge';
import { SupportJourneyGauge } from './components/SupportJourneyGauge';
import { api } from './services/api';
import { Task, Project } from './types';

const MainApp: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { lastUpdatedTask } = useSocket();

  const [currentTab, setCurrentTab] = useState<'dashboard' | 'journeys' | 'tasks' | 'activity' | 'clients' | 'projects'>('dashboard');
  const [dashboardView, setDashboardView] = useState<'both' | 'journey' | 'kanban'>('both');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('priority');
  const [showFilters, setShowFilters] = useState(false);
  const [taskFilters, setTaskFilters] = useState<any>({});
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  // Fetch initial tasks & projects
  const refreshData = async () => {
    try {
      const [tRes, pRes] = await Promise.all([
        api.tasks.getAll(taskFilters),
        user?.role !== 'DEVELOPER' ? api.projects.getAll() : Promise.resolve({ projects: [] }),
      ]);
      setTasks(tRes.tasks);
      setProjects(pRes.projects);
    } catch (e) {
      console.error('Error refreshing app data:', e);
    }
  };

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user, taskFilters]);

  // Real-time task update listener (updates Kanban task in-place)
  useEffect(() => {
    if (lastUpdatedTask) {
      setTasks((prev) => {
        const index = prev.findIndex((t) => t.id === lastUpdatedTask.id);
        if (index !== -1) {
          const next = [...prev];
          next[index] = { ...next[index], ...lastUpdatedTask };
          return next;
        }
        return [lastUpdatedTask, ...prev];
      });
    }
  }, [lastUpdatedTask]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0d0a1a] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin shadow-lg shadow-purple-500/30" />
        <p className="text-xs text-purple-300 mt-4 font-semibold tracking-wider">
          Connecting to Velozity Secure Real-Time Engine...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  // Sorted tasks based on sortBy state
  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortBy === 'priority') {
      const pWeights: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      return (pWeights[b.priority] || 0) - (pWeights[a.priority] || 0);
    }
    if (sortBy === 'dueDate') {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    return b.taskNumber - a.taskNumber;
  });

  const todoCount = tasks.filter((t) => t.status === 'TODO').length;
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const inReviewCount = tasks.filter((t) => t.status === 'IN_REVIEW').length;
  const doneCount = tasks.filter((t) => t.status === 'DONE').length;
  const overdueCount = tasks.filter((t) => t.isOverdue).length;

  return (
    <div className="min-h-screen flex flex-col text-[var(--text-primary)] transition-colors">
      {/* 1. Evaluator RBAC Quick-Switcher Bar */}
      <RoleDemoBar />

      <div className="flex-1 flex w-full">
        {/* 2. Left Sidebar (Matching BizLink screenshot) */}
        <Sidebar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          projects={projects}
          tasksCount={tasks.length}
          onAddProjectClick={() => setIsProjectModalOpen(true)}
        />

        {/* 3. Main Dashboard Canvas */}
        <div className="flex-1 flex flex-col min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-screen">
          {/* Top Bar with Search, Sort, Filters, and Action Buttons */}
          <TopBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            onAddTaskClick={() => setIsTaskModalOpen(true)}
            onAddClientClick={() => setIsClientModalOpen(true)}
          />

          {/* Collapsible URL Filter Controls */}
          {showFilters && (
            <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-200">
              <TaskFilters onFiltersChange={setTaskFilters} />
            </div>
          )}

          {/* Main Views */}
          {currentTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Analytics Header Section (Mini Bar Chart, Speedometer Arc Gauge, Stat Blocks) */}
              <AnalyticsHeader
                totalTasks={tasks.length}
                inProgressTasks={inProgressCount}
                doneTasks={doneCount}
                overdueCount={overdueCount}
                onNavigateToTasks={() => setCurrentTab('tasks')}
              />

              {/* View Mode Segmented Controls */}
              <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-200/80 dark:border-purple-500/20">
                <div className="flex items-center gap-1.5 p-1 bg-white/80 dark:bg-purple-950/70 rounded-2xl border border-slate-200 dark:border-purple-500/25 shadow-sm">
                  <button
                    onClick={() => setDashboardView('both')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      dashboardView === 'both'
                        ? 'bg-slate-900 text-white shadow-sm dark:bg-purple-600'
                        : 'text-[#475569] hover:text-[#0f172a] hover:bg-slate-100 dark:text-purple-300 dark:hover:text-white dark:hover:bg-purple-900/40'
                    }`}
                  >
                    Combined Executive View
                  </button>
                  <button
                    onClick={() => setDashboardView('journey')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      dashboardView === 'journey'
                        ? 'bg-slate-900 text-white shadow-sm dark:bg-purple-600'
                        : 'text-[#475569] hover:text-[#0f172a] hover:bg-slate-100 dark:text-purple-300 dark:hover:text-white dark:hover:bg-purple-900/40'
                    }`}
                  >
                    Customer Journeys Map
                  </button>
                  <button
                    onClick={() => setDashboardView('kanban')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      dashboardView === 'kanban'
                        ? 'bg-slate-900 text-white shadow-sm dark:bg-purple-600'
                        : 'text-[#475569] hover:text-[#0f172a] hover:bg-slate-100 dark:text-purple-300 dark:hover:text-white dark:hover:bg-purple-900/40'
                    }`}
                  >
                    Client Pipeline Kanban
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#475569] dark:text-purple-300/80">
                    Live Status:
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Synced & Active
                  </span>
                </div>
              </div>

              {/* 1. SugarCRM: Customer Journeys Flow */}
              {(dashboardView === 'journey' || dashboardView === 'both') && (
                <div className="space-y-6">
                  <WorkflowJourney
                    tasks={tasks}
                    onTaskUpdated={() => refreshData()}
                    onAddTaskClick={() => setIsTaskModalOpen(true)}
                  />

                  {/* SugarCRM Bottom Grid: Suggested Knowledge + Support Ticket Journey */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SuggestedKnowledge />
                    <SupportJourneyGauge
                      executedCount={doneCount > 0 ? doneCount : 5}
                      activeCount={inProgressCount > 0 ? inProgressCount : 7}
                      totalCases={tasks.length}
                    />
                  </div>
                </div>
              )}

              {/* 2. BizLink CRM: 4-Column Kanban Pipeline Board */}
              {(dashboardView === 'kanban' || dashboardView === 'both') && (
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-black text-[#0f172a] dark:text-purple-100 tracking-tight">
                        Client Engagement Pipeline
                      </h2>
                      <p className="text-xs text-[#475569] dark:text-purple-400 font-medium">
                        Live status updates across client deliverables with instant WebSocket propagation
                      </p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-white dark:bg-purple-900/40 border border-slate-200 dark:border-purple-500/25 text-[#0f172a] dark:text-purple-300 shadow-sm">
                      {tasks.length} Active Tasks
                    </span>
                  </div>

                  <KanbanBoard
                    tasks={sortedTasks}
                    searchQuery={searchQuery}
                    onTaskUpdated={() => refreshData()}
                  />
                </div>
              )}
            </div>
          )}

          {currentTab === 'journeys' && (
            <div className="space-y-6">
              <WorkflowJourney
                tasks={tasks}
                onTaskUpdated={() => refreshData()}
                onAddTaskClick={() => setIsTaskModalOpen(true)}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SuggestedKnowledge />
                <SupportJourneyGauge
                  executedCount={doneCount > 0 ? doneCount : 5}
                  activeCount={inProgressCount > 0 ? inProgressCount : 7}
                  totalCases={tasks.length}
                />
              </div>
            </div>
          )}

          {currentTab === 'tasks' && (
            <TasksPage initialProjectId={selectedProjectId} />
          )}

          {currentTab === 'activity' && (
            <div className="max-w-4xl mx-auto w-full h-[650px]">
              <ActivityFeed />
            </div>
          )}

          {currentTab === 'clients' && (
            <ClientsPage />
          )}

          {currentTab === 'projects' && (
            <ProjectsPage
              onSelectProjectTasks={(projId) => {
                setSelectedProjectId(projId);
                setCurrentTab('tasks');
              }}
            />
          )}
        </div>
      </div>

      {/* Global Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onTaskCreated={() => refreshData()}
      />

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onProjectCreated={() => refreshData()}
      />

      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onClientCreated={() => refreshData()}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <MainApp />
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
