import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { Users, Radio, X } from 'lucide-react';

export const OnlineUsersBadge: React.FC = () => {
  const { onlineCount, onlineUsers, isConnected } = useSocket();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 transition-all text-xs font-medium group"
        title="View active team members online"
      >
        <span className="relative flex h-2.5 w-2.5">
          {isConnected && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          )}
          <span
            className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              isConnected ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          ></span>
        </span>
        <span className="text-slate-400 group-hover:text-slate-200">Online:</span>
        <span className="font-bold text-slate-100">{onlineCount}</span>
        <Users className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-400 ml-0.5" />
      </button>

      {/* Online Users Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-slate-700 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Radio className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Live Team Presence</h3>
                  <p className="text-xs text-slate-400">
                    {onlineCount} {onlineCount === 1 ? 'user' : 'users'} connected via WebSocket
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 max-h-72 overflow-y-auto space-y-2">
              {onlineUsers.length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-xs">
                  No active users detected.
                </div>
              ) : (
                onlineUsers.map((u) => (
                  <div
                    key={u.userId}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-600/30 border border-brand-500/40 flex items-center justify-center text-xs font-bold text-brand-300">
                        {u.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-200">{u.name}</p>
                        <p className="text-[11px] text-slate-400">{u.email}</p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        u.role === 'ADMIN'
                          ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                          : u.role === 'PROJECT_MANAGER'
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {u.role.replace('_', ' ')}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
