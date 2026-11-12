import React, { useEffect, useRef } from 'react';
import { CloseGlyph } from './Glyphs';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      cancelBtnRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div className="w-full max-w-md bg-[#252525] dark:bg-[#252525] light:bg-[#F1F1EF] rounded-[12px] p-6 shadow-2xl border border-[#2F2F2F] dark:border-[#2F2F2F] light:border-[#E6E6E3]">
        <div className="flex items-start justify-between mb-3">
          <h2 id="dialog-title" className="text-[17px] font-semibold text-[#EBEBEB] dark:text-[#EBEBEB] light:text-[#37352F]">
            {title}
          </h2>
          <button
            onClick={onCancel}
            className="text-[#9B9B9B] hover:text-[#EBEBEB] transition-colors p-1 -mr-1 rounded-[6px]"
            aria-label="Close dialog"
          >
            <CloseGlyph className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[14px] text-[#9B9B9B] dark:text-[#9B9B9B] light:text-[#787774] leading-relaxed mb-6">
          {message}
        </p>

        <div className="flex justify-end items-center gap-2.5">
          <button
            ref={cancelBtnRef}
            onClick={onCancel}
            className="h-9 px-4 rounded-[6px] text-[13px] font-medium text-[#9B9B9B] hover:text-[#EBEBEB] hover:bg-[#2C2C2C] dark:hover:bg-[#2C2C2C] transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`h-9 px-4 rounded-[6px] text-[13px] font-medium transition-colors ${
              isDestructive
                ? 'bg-[#E5675B] text-white hover:bg-[#d4564a]'
                : 'bg-[#2383E2] text-white hover:bg-[#1d73c7]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
