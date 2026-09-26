import React, { useState } from 'react';
import { api } from '../services/api';
import { Client } from '../types';
import { X, Building2 } from 'lucide-react';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientCreated: (client: Client) => void;
}

export const ClientModal: React.FC<ClientModalProps> = ({ isOpen, onClose, onClientCreated }) => {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !company.trim() || !email.trim()) {
      setError('All fields are required');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const res = await api.clients.create({ name, company, email });
      onClientCreated(res.client);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create client');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="glass-panel-elevated w-full max-w-md rounded-2xl p-6 border border-purple-500/25 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-purple-500/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-purple-100">Add New Client</h3>
          </div>
          <button
            onClick={onClose}
            className="text-purple-300 hover:text-white p-1.5 rounded-lg hover:bg-purple-900/40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block text-purple-200 font-semibold mb-1.5">Company Name *</label>
            <input
              type="text"
              required
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Apex Global Technologies"
              className="w-full glass-input rounded-lg px-3 py-2 text-purple-100 placeholder-purple-400/50 focus:outline-none focus:border-purple-400"
            />
          </div>

          <div>
            <label className="block text-purple-200 font-semibold mb-1.5">Contact Person *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Robert Vance"
              className="w-full glass-input rounded-lg px-3 py-2 text-purple-100 placeholder-purple-400/50 focus:outline-none focus:border-purple-400"
            />
          </div>

          <div>
            <label className="block text-purple-200 font-semibold mb-1.5">Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. contact@apextech.com"
              className="w-full glass-input rounded-lg px-3 py-2 text-purple-100 placeholder-purple-400/50 focus:outline-none focus:border-purple-400"
            />
          </div>

          <div className="pt-3 border-t border-purple-500/20 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-purple-600/30 transition-all"
            >
              {isSubmitting ? 'Saving...' : 'Add Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
