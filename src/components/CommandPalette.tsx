import React, { useState, useEffect, useRef } from 'react';
import { store } from '../lib/store';
import { CheckRecord, ClientRecord } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
  activeCheck?: CheckRecord | null;
  onCopyCorrections?: () => void;
}

interface PaletteItem {
  id: string;
  group: 'Actions' | 'Checks' | 'Clients';
  label: string;
  meta?: string;
  onSelect: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
  activeCheck,
  onCopyCorrections,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const clients = store.getClients();
  const checks = store.getChecks();

  const actions: PaletteItem[] = [
    {
      id: 'act_new_check',
      group: 'Actions',
      label: 'New check',
      meta: 'Drop slides to review',
      onSelect: () => onNavigate('/checks/new'),
    },
    {
      id: 'act_add_client',
      group: 'Actions',
      label: 'Add client',
      meta: 'Create new brand profile',
      onSelect: () => onNavigate('/clients/new'),
    },
    {
      id: 'act_toggle_theme',
      group: 'Actions',
      label: 'Toggle theme (Dark / Light)',
      meta: 'Switch workspace appearance',
      onSelect: () => {
        const current = store.getTheme();
        store.setTheme(current === 'dark' ? 'light' : 'dark');
      },
    },
  ];

  if (activeCheck && onCopyCorrections) {
    actions.unshift({
      id: 'act_copy_corrections',
      group: 'Actions',
      label: 'Copy corrections',
      meta: `Copy ${activeCheck.resolvedCount} resolved fixes`,
      onSelect: onCopyCorrections,
    });
  }

  const checkItems: PaletteItem[] = checks.map(c => ({
    id: `chk_${c.id}`,
    group: 'Checks',
    label: c.title,
    meta: `${c.clientName} • ${c.issueCount} issues`,
    onSelect: () => onNavigate(`/checks/${c.id}`),
  }));

  const clientItems: PaletteItem[] = clients.map(cl => ({
    id: `cl_${cl.id}`,
    group: 'Clients',
    label: cl.name,
    meta: `${cl.defaultStrictness} strictness • ${cl.languageVariant} English`,
    onSelect: () => onNavigate(`/clients/${cl.id}`),
  }));

  const allItems: PaletteItem[] = [...actions, ...checkItems, ...clientItems];

  const filteredItems = query.trim()
    ? allItems.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.meta?.toLowerCase().includes(query.toLowerCase())
      )
    : allItems;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filteredItems[selectedIndex];
      if (selected) {
        selected.onSelect();
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Group filtered items by group
  const grouped: Record<string, PaletteItem[]> = {};
  filteredItems.forEach(item => {
    if (!grouped[item.group]) grouped[item.group] = [];
    grouped[item.group].push(item);
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-100"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#252525] dark:bg-[#252525] rounded-[12px] shadow-2xl border border-[#2F2F2F] overflow-hidden"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="p-3 border-b border-[#2F2F2F]">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search checks and clients..."
            className="w-full bg-transparent px-3 py-2 text-[14px] text-[#EBEBEB] placeholder-[#6F6F6F] outline-none"
          />
        </div>

        <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-[#2F2F2F]/40">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-[13px] text-[#9B9B9B]">
              No matches found for "{query}"
            </div>
          ) : (
            Object.entries(grouped).map(([groupName, items]) => (
              <div key={groupName} className="py-1">
                <div className="px-3 py-1.5 text-[11px] font-medium text-[#9B9B9B] uppercase tracking-wider">
                  {groupName}
                </div>
                {items.map(item => {
                  const itemIndex = filteredItems.findIndex(i => i.id === item.id);
                  const isSelected = itemIndex === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        item.onSelect();
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                      className={`px-3 py-2 rounded-[6px] cursor-pointer flex items-center justify-between text-[13px] transition-colors ${
                        isSelected
                          ? 'bg-[#1F3347] text-[#EBEBEB]'
                          : 'text-[#EBEBEB] hover:bg-[#2C2C2C]'
                      }`}
                    >
                      <span className="font-normal">{item.label}</span>
                      {item.meta && (
                        <span className="text-[12px] text-[#9B9B9B] font-normal truncate max-w-[220px]">
                          {item.meta}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="px-4 py-2 bg-[#202020] border-t border-[#2F2F2F] flex items-center justify-between text-[11px] text-[#6F6F6F]">
          <span>Navigate with ↑ ↓, open with Enter</span>
          <span>Esc to dismiss</span>
        </div>
      </div>
    </div>
  );
}
