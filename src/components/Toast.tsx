import React from 'react';

export interface ToastMessage {
  id: string;
  text: string;
  undoAction?: () => void;
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-6 z-50 flex items-center gap-3 px-4 py-2.5 bg-[#252525] text-[#EBEBEB] dark:bg-[#252525] dark:text-[#EBEBEB] rounded-[8px] shadow-xl border border-[#2F2F2F] text-[13px] animate-in fade-in slide-in-from-bottom-2 duration-150"
    >
      <span>{toast.text}</span>
      {toast.undoAction && (
        <button
          onClick={() => {
            toast.undoAction?.();
            onDismiss();
          }}
          className="text-[#529CCA] hover:underline font-medium ml-1"
        >
          Undo
        </button>
      )}
    </div>
  );
}
