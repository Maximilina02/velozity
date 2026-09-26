import React, { useState, useRef, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { Bell, Check, CheckCheck, Clock, AlertTriangle, UserCheck, Eye, Layers } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const NotificationDropdown: React.FC = () => {
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'TASK_IN_REVIEW':
        return <Eye className="w-4 h-4 text-purple-400" />;
      case 'TASK_ASSIGNED':
        return <UserCheck className="w-4 h-4 text-blue-400" />;
      case 'TASK_OVERDUE':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      default:
        return <Layers className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/50"
        title="Live Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold text-white bg-rose-600 rounded-full animate-bounce shadow-md">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-panel rounded-xl shadow-2xl border border-slate-700/70 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-100 text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/50">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">
                No notifications yet
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => !item.isRead && markNotificationRead(item.id)}
                  className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                    item.isRead
                      ? 'bg-transparent hover:bg-slate-800/40 text-slate-400'
                      : 'bg-brand-950/30 hover:bg-brand-900/40 text-slate-200'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 mt-0.5">
                    {getNotificationIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <p className="text-xs font-semibold text-slate-200 truncate">{item.title}</p>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 whitespace-nowrap">
                        <Clock className="w-2.5 h-2.5" />
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed break-words">{item.message}</p>
                  </div>
                  {!item.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markNotificationRead(item.id);
                      }}
                      className="text-slate-500 hover:text-brand-400 p-1"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
