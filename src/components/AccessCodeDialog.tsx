import React, { useState, useEffect, useRef } from 'react';

interface AccessCodeDialogProps {
  isOpen: boolean;
  onContinue: (code: string) => void;
  onCancel: () => void;
}

export function AccessCodeDialog({
  isOpen,
  onContinue,
  onCancel,
}: AccessCodeDialogProps) {
  const [code, setCode] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCode('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      onContinue(code.trim());
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="access-dialog-title"
    >
      <div className="w-full max-w-md bg-[#252525] dark:bg-[#252525] light:bg-[#F1F1EF] rounded-[12px] p-6 shadow-2xl border border-[#2F2F2F] dark:border-[#2F2F2F] light:border-[#E6E6E3]">
        <div className="mb-4">
          <h2
            id="access-dialog-title"
            className="text-[17px] font-semibold text-[#EBEBEB] dark:text-[#EBEBEB] light:text-[#37352F]"
          >
            Enter access code
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              ref={inputRef}
              type="password"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="Access code"
              className="w-full h-10 px-3 rounded-[6px] bg-[#1E1E1E] border border-[#2F2F2F] text-[#EBEBEB] text-[13px] placeholder-[#666] focus:outline-none focus:border-[#2383E2]"
            />
          </div>

          <div className="flex justify-end items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="h-9 px-4 rounded-[6px] text-[13px] font-medium text-[#9B9B9B] hover:text-[#EBEBEB] hover:bg-[#2C2C2C] dark:hover:bg-[#2C2C2C] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!code.trim()}
              className="h-9 px-4 rounded-[6px] text-[13px] font-medium bg-[#2383E2] text-white hover:bg-[#1d73c7] transition-colors disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

