import React from 'react';
import { CloseGlyph } from './Glyphs';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + K', action: 'Open search and command palette' },
    { key: 'J / ↓', action: 'Next issue in list' },
    { key: 'K / ↑', action: 'Previous issue in list' },
    { key: 'A', action: 'Accept suggested fix' },
    { key: 'I', action: 'Ignore flagged issue' },
    { key: 'N', action: 'Never flag for this client (add ignore rule)' },
    { key: '← / →', action: 'Previous or next slide' },
    { key: 'C', action: 'Copy all accepted corrections to clipboard' },
    { key: '?', action: 'Show this keyboard shortcuts guide' },
    { key: 'Esc', action: 'Close modal or panel' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg bg-[#252525] dark:bg-[#252525] rounded-[12px] p-6 shadow-2xl border border-[#2F2F2F]">
        <div className="flex items-center justify-between pb-4 border-b border-[#2F2F2F]">
          <div>
            <h2 className="text-[16px] font-semibold text-[#EBEBEB]">Keyboard shortcuts</h2>
            <p className="text-[12px] text-[#9B9B9B] mt-0.5">Speed through review without touching the mouse.</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#9B9B9B] hover:text-[#EBEBEB] p-1.5 rounded-[6px] hover:bg-[#2C2C2C] transition-colors"
            aria-label="Close shortcuts"
          >
            <CloseGlyph className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-[#2F2F2F] mt-2 max-h-[60vh] overflow-y-auto">
          {shortcuts.map((sc, i) => (
            <div key={i} className="py-2.5 flex items-center justify-between text-[13px]">
              <span className="text-[#9B9B9B]">{sc.action}</span>
              <kbd className="px-2 py-0.5 rounded-[4px] bg-[#191919] border border-[#2F2F2F] text-[#EBEBEB] font-mono text-[11px]">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-3 border-t border-[#2F2F2F] flex justify-end">
          <button
            onClick={onClose}
            className="h-8 px-4 rounded-[6px] text-[13px] bg-[#2C2C2C] text-[#EBEBEB] hover:bg-[#333333] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
