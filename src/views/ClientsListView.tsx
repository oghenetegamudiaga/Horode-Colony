import React, { useState } from 'react';
import { store } from '../lib/store';
import { ClientRecord } from '../types';

interface ClientsListViewProps {
  onNavigate: (route: string) => void;
  onOpenClient: (clientId: string) => void;
}

export function ClientsListView({ onNavigate, onOpenClient }: ClientsListViewProps) {
  const [search, setSearch] = useState('');
  const clients = store.getClients();
  const checks = store.getChecks();

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return 'Never checked';
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffHours = Math.round(diffMs / 3600000);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.round(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return '';
    }
  };

  return (
    <div className="max-w-[960px] mx-auto px-8 py-10 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-[#EBEBEB] tracking-tight">Clients</h1>
          <p className="text-[13.5px] text-[#9B9B9B] mt-1">
            Manage client brands, custom dictionaries, and ignore rules.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/clients/new')}
          className="h-9 px-4 rounded-[6px] bg-[#2383E2] hover:bg-[#1d73c7] text-white text-[13px] font-medium transition-colors"
        >
          Add client
        </button>
      </div>

      {/* Filter bar */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filter clients..."
          className="w-full max-w-xs h-9 px-3 rounded-[6px] bg-[#252525] border border-[#2F2F2F] text-[13px] text-[#EBEBEB] placeholder-[#6F6F6F] outline-none focus:border-[#2383E2]"
        />
      </div>

      {/* Clients Database List (7.4) */}
      <div className="bg-[#252525] rounded-[12px] border border-[#2F2F2F] overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-12 px-4 py-2.5 text-[11.5px] font-medium text-[#9B9B9B] border-b border-[#2F2F2F] uppercase tracking-wider bg-[#202020]">
          <div className="col-span-5">Client name</div>
          <div className="col-span-2">Checks</div>
          <div className="col-span-3">Default strictness</div>
          <div className="col-span-2 text-right">Last checked</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-[#2F2F2F]">
          {filteredClients.length === 0 ? (
            <div className="py-12 text-center text-[13px] text-[#9B9B9B]">
              No clients found.
            </div>
          ) : (
            filteredClients.map(client => {
              const clientChecks = checks.filter(c => c.clientId === client.id);
              return (
                <div
                  key={client.id}
                  onClick={() => onOpenClient(client.id)}
                  className="grid grid-cols-12 px-4 py-3 text-[13px] hover:bg-[#2C2C2C] cursor-pointer transition-colors items-center"
                >
                  <div className="col-span-5 font-medium text-[#EBEBEB] truncate">
                    {client.name}
                  </div>
                  <div className="col-span-2 text-[#9B9B9B]">
                    {clientChecks.length} {clientChecks.length === 1 ? 'check' : 'checks'}
                  </div>
                  <div className="col-span-3 text-[#9B9B9B] capitalize">
                    {client.defaultStrictness}
                  </div>
                  <div className="col-span-2 text-right text-[#9B9B9B]">
                    {formatRelativeTime(client.lastCheckDate)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
