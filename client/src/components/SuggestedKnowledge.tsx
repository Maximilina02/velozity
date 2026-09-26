import React, { useState } from 'react';
import { Star, Plus, Share2, Calendar, FileText, CheckCircle, Clock } from 'lucide-react';

interface KnowledgeItem {
  id: string;
  starred: boolean;
  subject: string;
  status: 'Executed' | 'Scheduled' | 'In Review';
  startDate: string;
  endDate: string;
  assignedUser: {
    name: string;
    avatar: string;
  };
}

export const SuggestedKnowledge: React.FC = () => {
  const [items, setItems] = useState<KnowledgeItem[]>([
    {
      id: 'k1',
      starred: false,
      subject: 'Design Sprint',
      status: 'Executed',
      startDate: '2026-09-30 01:12',
      endDate: '2026-10-01 01:11',
      assignedUser: {
        name: 'Sam Frank',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80',
      },
    },
    {
      id: 'k2',
      starred: true,
      subject: 'Meeting Lead',
      status: 'Scheduled',
      startDate: '2026-10-01 2:41',
      endDate: '2026-10-01 9:41',
      assignedUser: {
        name: 'Nikki Olay',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80',
      },
    },
    {
      id: 'k3',
      starred: false,
      subject: 'Technical Spec Review',
      status: 'Executed',
      startDate: '2026-10-02 10:00',
      endDate: '2026-10-02 12:30',
      assignedUser: {
        name: 'Sarah Mitchell',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80',
      },
    },
    {
      id: 'k4',
      starred: true,
      subject: 'API Gateway Authentication',
      status: 'Scheduled',
      startDate: '2026-10-03 14:00',
      endDate: '2026-10-04 18:00',
      assignedUser: {
        name: 'Ravi Kumar',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80',
      },
    },
  ]);

  const toggleStar = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, starred: !item.starred } : item))
    );
  };

  return (
    <div className="glass-panel-elevated rounded-3xl p-6 sm:p-7 border border-white/80 dark:border-purple-500/25 shadow-xl relative overflow-hidden flex flex-col justify-between transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-purple-500/20">
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-[#0f172a] dark:text-purple-100 tracking-tight flex items-center gap-2">
            Suggested Knowledge
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
          </h3>
          <p className="text-[11px] font-medium text-[#475569] dark:text-purple-300/70">
            Standard operating procedures and runbooks linked to active journey cases
          </p>
        </div>

        {/* Top Right Action Buttons (matching screenshot) */}
        <div className="flex items-center gap-2">
          <button
            className="w-8 h-8 rounded-full bg-white dark:bg-purple-950/60 hover:bg-slate-50 dark:hover:bg-purple-900 border border-slate-200 dark:border-purple-500/25 text-[#475569] dark:text-purple-300 hover:text-[#0f172a] dark:hover:text-purple-100 flex items-center justify-center transition-all shadow-sm"
            title="Create Knowledge Article"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            className="w-8 h-8 rounded-full bg-white dark:bg-purple-950/60 hover:bg-slate-50 dark:hover:bg-purple-900 border border-slate-200 dark:border-purple-500/25 text-[#475569] dark:text-purple-300 hover:text-[#0f172a] dark:hover:text-purple-100 flex items-center justify-center transition-all shadow-sm"
            title="Export / Share Knowledge"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <button
            className="w-8 h-8 rounded-full bg-white dark:bg-purple-950/60 hover:bg-slate-50 dark:hover:bg-purple-900 border border-slate-200 dark:border-purple-500/25 text-[#475569] dark:text-purple-300 hover:text-[#0f172a] dark:hover:text-purple-100 flex items-center justify-center transition-all shadow-sm"
            title="Schedule Sync"
          >
            <Calendar className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Table matching the SugarCRM design & exact font colors */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[11px] font-bold text-[#64748b] dark:text-purple-300/70 border-b border-slate-200/80 dark:border-purple-500/15 uppercase tracking-wider">
              <th className="py-2.5 px-3 w-8 text-center"></th>
              <th className="py-2.5 px-3">Subject</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Start Date</th>
              <th className="py-2.5 px-3">End Date</th>
              <th className="py-2.5 px-3 text-right">Assigned User</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-purple-500/10 text-xs">
            {items.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-slate-50/80 dark:hover:bg-purple-900/20 transition-colors group"
              >
                {/* Star icon */}
                <td className="py-3 px-3 text-center">
                  <button
                    onClick={() => toggleStar(item.id)}
                    className="text-slate-400 hover:text-amber-500 transition-colors"
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        item.starred ? 'fill-amber-400 text-amber-500' : ''
                      }`}
                    />
                  </button>
                </td>

                {/* Subject */}
                <td className="py-3 px-3 font-semibold text-[#1e293b] dark:text-purple-100 group-hover:text-indigo-600 dark:group-hover:text-purple-200 transition-colors">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-slate-400 dark:text-purple-400/70 shrink-0" />
                    <span className="truncate max-w-[200px]">{item.subject}</span>
                  </div>
                </td>

                {/* Status Pill matching SugarCRM colors */}
                <td className="py-3 px-3">
                  {item.status === 'Executed' ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                      <CheckCircle className="w-2.5 h-2.5 text-blue-500" />
                      Executed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30">
                      <Clock className="w-2.5 h-2.5 text-rose-500" />
                      Scheduled
                    </span>
                  )}
                </td>

                {/* Start Date */}
                <td className="py-3 px-3 text-[11px] text-[#475569] dark:text-purple-300/80 font-mono">
                  {item.startDate}
                </td>

                {/* End Date */}
                <td className="py-3 px-3 text-[11px] text-[#475569] dark:text-purple-300/80 font-mono">
                  {item.endDate}
                </td>

                {/* Assigned User */}
                <td className="py-3 px-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-[11px] font-bold text-[#1e293b] dark:text-purple-200">
                      {item.assignedUser.name}
                    </span>
                    <img
                      src={item.assignedUser.avatar}
                      alt={item.assignedUser.name}
                      className="w-6 h-6 rounded-full object-cover border border-slate-300 dark:border-purple-400/40"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
