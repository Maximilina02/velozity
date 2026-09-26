import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Project, Role } from '../types';
import {
  LayoutDashboard,
  CheckSquare,
  Activity,
  Users,
  FolderGit2,
  Settings,
  Plus,
  LogOut,
  Zap,
  ShieldCheck,
  Briefcase,
  Code,
  Radio,
  Moon,
  Sun,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: any) => void;
  projects: Project[];
  tasksCount: number;
  onAddProjectClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  projects,
  tasksCount,
  onAddProjectClick,
}) => {
  const { user, logout } = useAuth();
  const { isConnected, onlineUsers, onlineCount } = useSocket();
  const { theme, setTheme } = useTheme();

  // Static list of seeded team members for the sidebar team presence panel (matching screenshot)
  const teamMembers = [
    { name: 'Alex Admin', role: 'System Admin', email: 'admin@velozity.com', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80' },
    { name: 'Sarah Mitchell', role: 'Product Manager', email: 'pm.sarah@velozity.com', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80' },
    { name: 'Marcus Vance', role: 'Delivery Lead', email: 'pm.marcus@velozity.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80' },
    { name: 'Ravi Kumar', role: 'Full Stack Dev', email: 'dev.ravi@velozity.com', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80' },
    { name: 'Elena Rostova', role: 'Frontend Engineer', email: 'dev.elena@velozity.com', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80' },
  ];

  return (
    <aside className="w-64 glass-sidebar h-screen sticky top-0 flex flex-col justify-between p-4 select-none z-30 overflow-y-auto">
      <div className="space-y-6">
        {/* Brand Header */}
        <div
          onClick={() => onTabChange('dashboard')}
          className="flex items-center gap-3 cursor-pointer group px-2 pt-2"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 fill-white" />
          </div>
          <div>
            <span className="font-extrabold text-base text-purple-100 tracking-wider flex items-center gap-1.5">
              VELOZITY
            </span>
            <p className="text-[10px] text-purple-400/80 font-medium tracking-wide">
              AGENCY SUITE
            </p>
          </div>
        </div>

        {/* Main Navigation Menu (Matching BizLink screenshot) */}
        <nav className="space-y-1 text-xs">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all ${
              currentTab === 'dashboard'
                ? theme === 'light' ? 'bg-slate-900 text-white shadow-sm' : 'bg-purple-600/25 text-purple-200 border border-purple-500/30 shadow-sm'
                : theme === 'light' ? 'text-[#334155] hover:text-[#0f172a] hover:bg-slate-100' : 'text-purple-300/70 hover:text-purple-100 hover:bg-purple-900/20'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className="w-4 h-4 text-indigo-500" />
              <span>Dashboard</span>
            </div>
          </button>

          <button
            onClick={() => onTabChange('journeys')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all ${
              currentTab === 'journeys'
                ? theme === 'light' ? 'bg-slate-900 text-white shadow-sm' : 'bg-purple-600/25 text-purple-200 border border-purple-500/30 shadow-sm'
                : theme === 'light' ? 'text-[#334155] hover:text-[#0f172a] hover:bg-slate-100' : 'text-purple-300/70 hover:text-purple-100 hover:bg-purple-900/20'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Customer Journeys</span>
            </div>
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-purple-500/20 dark:text-purple-300 border border-amber-200 dark:border-purple-500/30">
              NEW
            </span>
          </button>

          <button
            onClick={() => onTabChange('tasks')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all ${
              currentTab === 'tasks'
                ? theme === 'light' ? 'bg-slate-900 text-white shadow-sm' : 'bg-purple-600/25 text-purple-200 border border-purple-500/30 shadow-sm'
                : theme === 'light' ? 'text-[#334155] hover:text-[#0f172a] hover:bg-slate-100' : 'text-purple-300/70 hover:text-purple-100 hover:bg-purple-900/20'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CheckSquare className="w-4 h-4 text-emerald-500" />
              <span>Tasks</span>
            </div>
            {tasksCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-200 text-slate-800 dark:bg-purple-500/20 dark:text-purple-300 border border-slate-300 dark:border-purple-500/30">
                {tasksCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('activity')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all ${
              currentTab === 'activity'
                ? theme === 'light' ? 'bg-slate-900 text-white shadow-sm' : 'bg-purple-600/25 text-purple-200 border border-purple-500/30 shadow-sm'
                : theme === 'light' ? 'text-[#334155] hover:text-[#0f172a] hover:bg-slate-100' : 'text-purple-300/70 hover:text-purple-100 hover:bg-purple-900/20'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Activity className="w-4 h-4 text-blue-500" />
              <span>Activity</span>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE
            </span>
          </button>

          <button
            onClick={() => onTabChange('clients')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-all ${
              currentTab === 'clients'
                ? 'bg-purple-600/25 text-purple-200 border border-purple-500/30 shadow-sm'
                : 'text-purple-300/70 hover:text-purple-100 hover:bg-purple-900/20'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-purple-400" />
              <span>Customers / Clients</span>
            </div>
          </button>

          {user?.role !== 'DEVELOPER' && (
            <button
              onClick={() => onTabChange('projects')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-all ${
                currentTab === 'projects'
                  ? 'bg-purple-600/25 text-purple-200 border border-purple-500/30 shadow-sm'
                  : 'text-purple-300/70 hover:text-purple-100 hover:bg-purple-900/20'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FolderGit2 className="w-4 h-4 text-purple-400" />
                <span>Projects</span>
              </div>
              <span className="text-[11px] text-purple-400 font-semibold">{projects.length}</span>
            </button>
          )}
        </nav>

        {/* Projects Section in Sidebar (Matching Screenshot) */}
        {projects.length > 0 && (
          <div className="pt-2 border-t border-purple-500/15">
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400/70">
                Projects
              </span>
              {user?.role !== 'DEVELOPER' && (
                <button
                  onClick={onAddProjectClick}
                  className="p-1 rounded hover:bg-purple-900/30 text-purple-400 hover:text-purple-200"
                  title="Create Project"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="space-y-1">
              {projects.slice(0, 4).map((p) => (
                <button
                  key={p.id}
                  onClick={() => onTabChange('tasks')}
                  className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-purple-300/80 hover:text-purple-100 hover:bg-purple-900/20 text-left transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    <span className="truncate">{p.name}</span>
                  </div>
                  {p._count?.tasks !== undefined && (
                    <span className="text-[10px] text-purple-400 font-mono ml-1">
                      {p._count.tasks}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Members / Team Section in Sidebar (Matching Screenshot) */}
        <div className="pt-2 border-t border-purple-500/15">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400/70 flex items-center gap-1.5">
              <span>Members</span>
              <span className="text-[10px] text-emerald-400 font-normal">({onlineCount} online)</span>
            </span>
          </div>

          <div className="space-y-2">
            {teamMembers.map((m) => {
              const isOnline = onlineUsers.some((u) => u.email === m.email);
              return (
                <div key={m.email} className="flex items-center justify-between px-2 py-1">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <img
                        src={m.avatar}
                        alt={m.name}
                        className="w-7 h-7 rounded-full object-cover border border-purple-500/30"
                      />
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-slate-900 ${
                          isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-purple-200 leading-tight">
                        {m.name}
                      </p>
                      <p className="text-[9px] text-purple-400/70 leading-tight">{m.role}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SugarCRM Moon / Sun Theme Switcher Pill (Matching Bottom Left of Screenshot) */}
      <div className="pt-2 border-t border-slate-200/80 dark:border-purple-500/20">
        <div className="flex items-center justify-between px-2 py-2 mb-2 bg-slate-100 dark:bg-purple-950/60 rounded-2xl border border-slate-200 dark:border-purple-500/25">
          <span className="text-[11px] font-bold text-[#475569] dark:text-purple-300">Theme</span>
          <div className="flex items-center bg-white dark:bg-slate-900 rounded-xl p-0.5 border border-slate-200 dark:border-purple-500/30 shadow-sm">
            <button
              onClick={() => setTheme('light')}
              className={`p-1.5 rounded-lg transition-all ${
                theme === 'light'
                  ? 'bg-black text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="SugarCRM Light Mode"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded-lg transition-all ${
                theme === 'dark'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Ambient Dark Mode"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Footer Profile & Logout */}
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-gradient-to-tr dark:from-purple-600 dark:to-indigo-600 border border-slate-300 dark:border-purple-400/40 flex items-center justify-center text-xs font-bold text-white shadow-md">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#0f172a] dark:text-purple-100 truncate">{user?.name}</p>
              <p className="text-[10px] text-[#64748b] dark:text-purple-400 capitalize">{user?.role?.toLowerCase().replace('_', ' ')}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:text-purple-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/20 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
