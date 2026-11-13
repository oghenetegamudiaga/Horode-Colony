import React, { useState, useEffect } from 'react';
import { store } from '../lib/store';

interface SettingsViewProps {
  onShowShortcuts: () => void;
  onShowToast: (text: string) => void;
}

export function SettingsView({ onShowShortcuts, onShowToast }: SettingsViewProps) {
  const currentTheme = store.getTheme();
  const [retentionDays, setRetentionDays] = useState(30);

  const [apiStatus, setApiStatus] = useState<{
    loading: boolean;
    connected: boolean;
    error?: string;
  }>({
    loading: true,
    connected: false,
  });

  const checkApiHealth = async () => {
    setApiStatus(prev => ({ ...prev, loading: true, error: undefined }));
    try {
      const res = await fetch('/api/health');
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      const data = await res.json();
      setApiStatus({
        loading: false,
        connected: data?.status === 'ok',
      });
    } catch (err: any) {
      setApiStatus({
        loading: false,
        connected: false,
        error: err.message || 'Unable to reach backend /api/health',
      });
    }
  };

  useEffect(() => {
    checkApiHealth();
  }, []);

  const handleThemeChange = (theme: 'dark' | 'light' | 'system') => {
    store.setTheme(theme);
    onShowToast(`Theme switched to ${theme}`);
  };

  return (
    <div className="max-w-[760px] mx-auto px-8 py-10 animate-in fade-in duration-150 space-y-10">
      <div>
        <h1 className="text-[28px] font-bold text-[#EBEBEB] tracking-tight">Settings</h1>
        <p className="text-[13.5px] text-[#9B9B9B] mt-1">
          Workspace appearance, shortcuts, and confidentiality preferences.
        </p>
      </div>

      {/* Vision AI API Status Section */}
      <section className="space-y-3 p-5 rounded-[12px] bg-[#202020] border border-[#2F2F2F]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-[#EBEBEB]">Vision AI Connection</h2>
            <p className="text-[12.5px] text-[#9B9B9B] mt-0.5">
              Powers automatic text extraction, typography reading, and error detection.
            </p>
          </div>
          <button
            onClick={checkApiHealth}
            disabled={apiStatus.loading}
            className="h-8 px-3 rounded-[6px] bg-[#252525] hover:bg-[#2C2C2C] text-[#EBEBEB] text-[12px] font-medium border border-[#2F2F2F] transition-colors"
          >
            {apiStatus.loading ? 'Checking...' : 'Test connection'}
          </button>
        </div>

        <div className="pt-2">
          {apiStatus.loading ? (
            <div className="text-[12.5px] text-[#9B9B9B]">Checking API status...</div>
          ) : apiStatus.connected ? (
            <div className="flex items-center gap-2.5 text-[12.5px] text-[#4DAB9A]">
              <span className="w-2 h-2 rounded-full bg-[#4DAB9A] inline-block" />
              <span className="font-medium">Analysis: connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 text-[12.5px] text-[#ff8a80]">
              <span className="w-2 h-2 rounded-full bg-[#ff8a80] inline-block" />
              <span className="font-medium">Analysis: not reachable</span>
            </div>
          )}
        </div>
      </section>

      {/* Appearance Section */}
      <section className="space-y-3">
        <h2 className="text-[15px] font-semibold text-[#EBEBEB]">Appearance</h2>
        <p className="text-[12.5px] text-[#9B9B9B]">
          Choose your workspace theme. Dark mode is the design-first default.
        </p>

        <div className="grid grid-cols-3 gap-3 max-w-md pt-1">
          {[
            { id: 'dark', label: 'Dark (Default)' },
            { id: 'light', label: 'Light' },
            { id: 'system', label: 'System follow' },
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => handleThemeChange(opt.id as any)}
              className={`h-11 px-3 rounded-[8px] text-[13px] font-medium border text-center transition-colors ${
                currentTheme === opt.id
                  ? 'bg-[#1F3347] border-[#2383E2] text-[#EBEBEB]'
                  : 'bg-[#252525] border-[#2F2F2F] text-[#9B9B9B] hover:text-[#EBEBEB] hover:bg-[#2C2C2C]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* Keyboard Shortcuts Section */}
      <section className="space-y-3 pt-6 border-t border-[#2F2F2F]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-[#EBEBEB]">Keyboard shortcuts</h2>
            <p className="text-[12.5px] text-[#9B9B9B] mt-0.5">
              Review carousels in under 2 minutes with keyboard-first navigation.
            </p>
          </div>
          <button
            onClick={onShowShortcuts}
            className="h-8 px-3 rounded-[6px] bg-[#252525] hover:bg-[#2C2C2C] text-[#EBEBEB] text-[12.5px] font-medium border border-[#2F2F2F] transition-colors"
          >
            View all shortcuts
          </button>
        </div>

        <div className="bg-[#252525] rounded-[10px] p-4 border border-[#2F2F2F] grid grid-cols-2 gap-3 text-[12.5px]">
          <div>
            <span className="text-[#9B9B9B]">Next / Previous issue:</span>{' '}
            <kbd className="font-mono text-[#EBEBEB] bg-[#191919] px-1.5 py-0.5 rounded border border-[#2F2F2F]">J</kbd> / <kbd className="font-mono text-[#EBEBEB] bg-[#191919] px-1.5 py-0.5 rounded border border-[#2F2F2F]">K</kbd>
          </div>
          <div>
            <span className="text-[#9B9B9B]">Accept fix / Ignore:</span>{' '}
            <kbd className="font-mono text-[#EBEBEB] bg-[#191919] px-1.5 py-0.5 rounded border border-[#2F2F2F]">A</kbd> / <kbd className="font-mono text-[#EBEBEB] bg-[#191919] px-1.5 py-0.5 rounded border border-[#2F2F2F]">I</kbd>
          </div>
          <div>
            <span className="text-[#9B9B9B]">Command palette:</span>{' '}
            <kbd className="font-mono text-[#EBEBEB] bg-[#191919] px-1.5 py-0.5 rounded border border-[#2F2F2F]">Ctrl + K</kbd>
          </div>
          <div>
            <span className="text-[#9B9B9B]">Copy corrections:</span>{' '}
            <kbd className="font-mono text-[#EBEBEB] bg-[#191919] px-1.5 py-0.5 rounded border border-[#2F2F2F]">C</kbd>
          </div>
        </div>
      </section>

      {/* Security & Confidentiality Section */}
      <section className="space-y-3 pt-6 border-t border-[#2F2F2F]">
        <h2 className="text-[15px] font-semibold text-[#EBEBEB]">Security & Confidentiality</h2>
        <p className="text-[12.5px] text-[#9B9B9B]">
          Client designs are confidential. Horode Proof operates under strict privacy guarantees:
        </p>

        <div className="bg-[#202020] rounded-[10px] p-4 border border-[#2F2F2F] space-y-2 text-[12.5px] text-[#9B9B9B]">
          <div className="flex items-start gap-2">
            <span className="text-[#4DAB9A] font-bold">•</span>
            <span><strong className="text-[#EBEBEB]">Zero training:</strong> Client slide content is used only to compute proofreading results and never stored for model training.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-[#4DAB9A] font-bold">•</span>
            <span><strong className="text-[#EBEBEB]">Prompt isolation:</strong> Text within slides is treated as pure DATA, never as instructions.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-[#4DAB9A] font-bold">•</span>
            <span><strong className="text-[#EBEBEB]">One-click deletion:</strong> "Delete this check now" immediately wipes files, extracted text, and flagged issues.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-[#4DAB9A] font-bold">•</span>
            <span><strong className="text-[#EBEBEB]">Location trust:</strong> Bounding boxes are verified against recognized text to prevent hallucinated markers.</span>
          </div>
        </div>
      </section>
    </div>
  );
}
