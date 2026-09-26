import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { NotificationDropdown } from './NotificationDropdown';
import { OnlineUsersBadge } from './OnlineUsersBadge';
import { Zap, LogOut, LayoutDashboard, FolderGit2, CheckSquare, ShieldCheck, Briefcase, Code } from 'lucide-react';

interface NavbarProps {
  currentTab: 'dashboard' | 'projects' | 'tasks';
  onTabChange: (tab: 'dashboard' | 'projects' | 'tasks') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onTabChange }) => {
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();

  const getRoleBadge = () => {
    switch (user?.role) {
      case 'ADMIN':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            ADMIN
          </span>
        );
      case 'PROJECT_MANAGER':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Briefcase className="w-3.5 h-3.5" />
            PROJECT MANAGER
          </span>
        );
      case 'DEVELOPER':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Code className="w-3.5 h-3.5" />
            DEVELOPER
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => onTabChange('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-100 tracking-wider text-sm sm:text-base">
                  VELOZITY
                </span>
                <span className="text-[10px] font-bold tracking-widest text-brand-400 bg-brand-950/60 px-1.5 py-0.5 rounded border border-brand-800/40">
                  REAL-TIME
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider hidden sm:block">
                GLOBAL SOLUTIONS
              </p>
            </div>
          </div>

          {/* Navigation items */}
          <nav className="hidden md:flex items-center gap-1.5 ml-4">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            {user?.role !== 'DEVELOPER' && (
              <button
                onClick={() => onTabChange('projects')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  currentTab === 'projects'
                    ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <FolderGit2 className="w-4 h-4" />
                <span>Projects</span>
              </button>
            )}

            <button
              onClick={() => onTabChange('tasks')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'tasks'
                  ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>{user?.role === 'DEVELOPER' ? 'My Assigned Tasks' : 'All Tasks'}</span>
            </button>
          </nav>
        </div>

        {/* Right side controls: Online Presence, Role, Notification, User */}
        <div className="flex items-center gap-3">
          {/* Real-time Socket Indicator */}
          <div
            className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800"
            title={isConnected ? 'WebSocket is connected' : 'WebSocket is reconnecting'}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-[11px] font-mono text-slate-300">
              {isConnected ? 'WS Live' : 'WS Reconnecting'}
            </span>
          </div>

          {/* Online Users Badge */}
          <OnlineUsersBadge />

          {/* Notifications Dropdown */}
          <NotificationDropdown />

          {/* Role Badge */}
          <div className="hidden sm:block">{getRoleBadge()}</div>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
            <div className="text-right hidden lg:block">
              <p className="text-xs font-bold text-slate-200">{user?.name}</p>
              <p className="text-[10px] text-slate-400">{user?.email}</p>
            </div>

            <button
              onClick={logout}
              className="p-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 border border-slate-700 hover:border-rose-500/30 text-slate-400 hover:text-rose-300 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
