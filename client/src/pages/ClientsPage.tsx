import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Client } from '../types';
import { ClientModal } from '../components/ClientModal';
import {
  Users,
  Building2,
  Mail,
  FolderGit2,
  Plus,
  Trash2,
  ShieldAlert,
  Search,
} from 'lucide-react';

export const ClientsPage: React.FC = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const res = await api.clients.getAll();
      setClients(res.clients);
    } catch (e) {
      console.error('Error fetching clients:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete client "${name}"?`)) return;
    try {
      await api.clients.delete(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete client');
    }
  };

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-purple-100 tracking-tight">
            Client & Customer Management
          </h1>
          <p className="text-xs text-purple-300/70 mt-1">
            Enterprise clients, associated contracted projects, and account contact registries
          </p>
        </div>

        {user?.role !== 'DEVELOPER' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Customer / Client</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-purple-400 absolute left-3 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter clients by company, name, or email..."
          className="w-full glass-input rounded-xl pl-9 pr-4 py-2.5 text-xs text-purple-100 placeholder-purple-400/50 focus:outline-none"
        />
      </div>

      {/* Clients Cards Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center p-20 text-purple-400">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center border border-purple-500/20 text-purple-300">
          <Building2 className="w-12 h-12 text-purple-400/50 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-purple-100">No Clients Found</h3>
          <p className="text-xs text-purple-400/70 mt-1">
            Create your first client account to assign projects to.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((client) => (
            <div
              key={client.id}
              className="glass-panel glass-card-hover rounded-2xl p-5 border border-purple-500/20 shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="p-3 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300">
                    <Building2 className="w-5 h-5" />
                  </div>

                  {user?.role === 'ADMIN' && (
                    <button
                      onClick={() => handleDelete(client.id, client.company)}
                      className="text-purple-400/60 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                      title="Delete client"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <h3 className="text-base font-extrabold text-purple-100 mb-1">
                  {client.company}
                </h3>
                <p className="text-xs text-purple-300/80 font-medium mb-3">
                  Contact: <span className="text-purple-100">{client.name}</span>
                </p>

                <div className="flex items-center gap-2 text-xs text-purple-400/90 mb-4 bg-purple-950/40 p-2.5 rounded-xl border border-purple-500/15">
                  <Mail className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                  <span className="truncate">{client.email}</span>
                </div>

                {/* Contracted Projects */}
                <div className="pt-3 border-t border-purple-500/15">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400/70 flex items-center gap-1.5 mb-2">
                    <FolderGit2 className="w-3 h-3 text-purple-400" />
                    Contracted Projects ({client.projects?.length || 0})
                  </span>

                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {client.projects && client.projects.length > 0 ? (
                      client.projects.map((proj: any) => (
                        <div
                          key={proj.id}
                          className="px-2.5 py-1.5 rounded-lg bg-purple-900/25 border border-purple-500/15 text-xs text-purple-200 flex items-center justify-between"
                        >
                          <span className="truncate">{proj.name}</span>
                          <span className="text-[10px] text-purple-400 font-mono">
                            {proj._count?.tasks ?? 0} tasks
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-[11px] text-purple-400/50 italic">
                        No projects assigned yet
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onClientCreated={() => fetchClients()}
      />
    </div>
  );
};
