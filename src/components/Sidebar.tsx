import React, { useState } from 'react';
import { SidebarToggleGlyph, ChevronGlyph, HorodeLogo } from './Glyphs';
import { store } from '../lib/store';
import { ClientRecord, CheckRecord } from '../types';

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenSearch: () => void;
  onOpenShortcuts: () => void;
}

export function Sidebar({
  currentRoute,
  onNavigate,
  onOpenSearch,
  onOpenShortcuts,
}: SidebarProps) {
  const [expandedClients, setExpandedClients] = useState<Record<string, boolean>>({
    client_apex: true,
  });
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isCollapsed = store.isSidebarCollapsed();
  const clients = store.getClients();
  const checks = store.getChecks();
  const theme = store.getTheme();

  const toggleClient = (clientId: string) => {
    setExpandedClients(prev => ({
      ...prev,
      [clientId]: !prev[clientId],
    }));
  };

  // Recent checks (up to 4)
  const recentChecks = checks.slice(0, 4);

  if (isCollapsed) {
    return (
      <div className="fixed top-3 left-3 z-30">
        <button
          onClick={() => store.toggleSidebar()}
          className="p-2 rounded-[6px] bg-[#252525] text-[#9B9B9B] hover:text-[#EBEBEB] hover:bg-[#2C2C2C] border border-[#2F2F2F] shadow-md transition-colors"
          title="Open sidebar"
          aria-label="Open sidebar"
        >
          <SidebarToggleGlyph className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <aside
      className="w-[260px] h-screen bg-[#202020] border-r border-[#2F2F2F] flex flex-col justify-between shrink-0 select-none z-20 text-[13px] relative"
      aria-label="Main Navigation"
    >
      {/* Top Workspace Identity & Navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-4">
        {/* Workspace Brand Header */}
        <div className="flex items-center justify-between px-2 pt-1 pb-2">
          <div className="flex items-center gap-2.5">
            <HorodeLogo className="w-5 h-5 rounded-[4px]" />
            <div className="leading-tight">
              <div className="font-semibold text-[#EBEBEB] text-[13.5px] tracking-tight">Horode Studio</div>
              <div className="text-[11px] text-[#9B9B9B]">Proofreading Workspace</div>
            </div>
          </div>
          <button
            onClick={() => store.toggleSidebar()}
            className="p-1 rounded-[4px] text-[#9B9B9B] hover:text-[#EBEBEB] hover:bg-[#2C2C2C] transition-colors"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <SidebarToggleGlyph className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Search / Command palette launcher */}
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-[6px] bg-[#252525] hover:bg-[#2C2C2C] text-[#9B9B9B] hover:text-[#EBEBEB] transition-colors text-left"
        >
          <span className="text-[13px]">Search</span>
          <kbd className="text-[10.5px] px-1.5 py-0.5 rounded-[3px] bg-[#191919] border border-[#2F2F2F] font-mono text-[#9B9B9B]">
            Ctrl+K
          </kbd>
        </button>

        {/* Primary Navigation */}
        <div className="space-y-0.5">
          <button
            onClick={() => onNavigate('/')}
            className={`w-full text-left px-2.5 py-1.5 rounded-[6px] transition-colors font-normal flex items-center justify-between ${
              currentRoute === '/'
                ? 'bg-[#1F3347] text-[#EBEBEB] font-medium'
                : 'text-[#EBEBEB] hover:bg-[#2C2C2C]'
            }`}
          >
            <span>Home</span>
          </button>

          <button
            onClick={() => onNavigate('/checks/new')}
            className={`w-full text-left px-2.5 py-1.5 rounded-[6px] transition-colors font-normal flex items-center justify-between ${
              currentRoute === '/checks/new'
                ? 'bg-[#1F3347] text-[#EBEBEB] font-medium'
                : 'text-[#EBEBEB] hover:bg-[#2C2C2C]'
            }`}
          >
            <span>New check</span>
          </button>
        </div>

        {/* Clients Section */}
        <div className="pt-2">
          <div className="flex items-center justify-between px-2.5 py-1">
            <span className="text-[11.5px] font-medium text-[#9B9B9B] uppercase tracking-wider">
              Clients
            </span>
            <button
              onClick={() => onNavigate('/clients/new')}
              className="text-[11px] text-[#529CCA] hover:underline"
            >
              Add
            </button>
          </div>

          <div className="mt-1 space-y-0.5">
            {clients.map(client => {
              const isExpanded = !!expandedClients[client.id];
              const clientChecks = checks.filter(c => c.clientId === client.id).slice(0, 3);
              const isActive = currentRoute === `/clients/${client.id}`;

              return (
                <div key={client.id} className="space-y-0.5">
                  <div
                    className={`flex items-center justify-between px-2 py-1.5 rounded-[6px] transition-colors cursor-pointer group ${
                      isActive ? 'bg-[#1F3347] text-[#EBEBEB]' : 'hover:bg-[#2C2C2C] text-[#EBEBEB]'
                    }`}
                  >
                    <button
                      onClick={() => toggleClient(client.id)}
                      className="p-1 -ml-1 text-[#9B9B9B] hover:text-[#EBEBEB]"
                      aria-label="Toggle client checks"
                    >
                      <ChevronGlyph direction={isExpanded ? 'down' : 'right'} className="w-3 h-3" />
                    </button>
                    <span
                      onClick={() => onNavigate(`/clients/${client.id}`)}
                      className="flex-1 truncate text-[13px] ml-1"
                    >
                      {client.name}
                    </span>
                  </div>

                  {/* Expanded checks under client */}
                  {isExpanded && clientChecks.length > 0 && (
                    <div className="pl-6 space-y-0.5">
                      {clientChecks.map(chk => (
                        <button
                          key={chk.id}
                          onClick={() => onNavigate(`/checks/${chk.id}`)}
                          className={`w-full text-left px-2 py-1 rounded-[4px] text-[12px] truncate transition-colors block ${
                            currentRoute === `/checks/${chk.id}`
                              ? 'text-[#529CCA] font-medium bg-[#1F3347]/50'
                              : 'text-[#9B9B9B] hover:text-[#EBEBEB] hover:bg-[#2C2C2C]'
                          }`}
                        >
                          {chk.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <button
              onClick={() => onNavigate('/clients')}
              className="w-full text-left px-2.5 py-1 text-[12px] text-[#529CCA] hover:underline mt-1 block"
            >
              All clients
            </button>
          </div>
        </div>

        {/* Recents Section */}
        {recentChecks.length > 0 && (
          <div className="pt-2">
            <div className="px-2.5 py-1 text-[11.5px] font-medium text-[#9B9B9B] uppercase tracking-wider">
              Recents
            </div>
            <div className="mt-1 space-y-0.5">
              {recentChecks.map(chk => (
                <button
                  key={chk.id}
                  onClick={() => onNavigate(`/checks/${chk.id}`)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-[6px] text-[12.5px] truncate transition-colors block ${
                    currentRoute === `/checks/${chk.id}`
                      ? 'bg-[#1F3347] text-[#EBEBEB] font-medium'
                      : 'text-[#9B9B9B] hover:text-[#EBEBEB] hover:bg-[#2C2C2C]'
                  }`}
                >
                  {chk.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom User Profile & Settings Menu */}
      <div className="p-3 border-t border-[#2F2F2F] relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="w-full flex items-center justify-between px-2.5 py-2 rounded-[6px] hover:bg-[#2C2C2C] text-[#EBEBEB] transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#1F3347] border border-[#2383E2]/40 text-[#2383E2] flex items-center justify-center text-[10px] font-bold">
              T
            </div>
            <span className="font-medium text-[13px]">Tega</span>
          </div>
          <ChevronGlyph direction={showUserMenu ? 'down' : 'up'} className="w-3.5 h-3.5 text-[#9B9B9B]" />
        </button>

        {showUserMenu && (
          <div className="absolute bottom-14 left-3 right-3 bg-[#252525] rounded-[8px] shadow-2xl border border-[#2F2F2F] py-1.5 z-30 animate-in fade-in slide-in-from-bottom-2 duration-100">
            <button
              onClick={() => {
                setShowUserMenu(false);
                onNavigate('/settings');
              }}
              className="w-full text-left px-3 py-1.5 text-[12.5px] text-[#EBEBEB] hover:bg-[#2C2C2C] transition-colors"
            >
              Settings
            </button>
            <button
              onClick={() => {
                setShowUserMenu(false);
                store.setTheme(theme === 'dark' ? 'light' : 'dark');
              }}
              className="w-full text-left px-3 py-1.5 text-[12.5px] text-[#EBEBEB] hover:bg-[#2C2C2C] transition-colors flex items-center justify-between"
            >
              <span>Appearance</span>
              <span className="text-[11px] text-[#9B9B9B] capitalize">{theme}</span>
            </button>
            <button
              onClick={() => {
                setShowUserMenu(false);
                onOpenShortcuts();
              }}
              className="w-full text-left px-3 py-1.5 text-[12.5px] text-[#EBEBEB] hover:bg-[#2C2C2C] transition-colors"
            >
              Keyboard shortcuts
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
