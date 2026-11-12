import React, { useState } from 'react';
import { store } from '../lib/store';
import { StrictnessLevel, LanguageVariant } from '../types';

interface AddClientViewProps {
  onNavigate: (route: string) => void;
  onClientCreated: (clientId: string) => void;
}

export function AddClientView({ onNavigate, onClientCreated }: AddClientViewProps) {
  const [name, setName] = useState('');
  const [defaultStrictness, setDefaultStrictness] = useState<StrictnessLevel>('standard');
  const [languageVariant, setLanguageVariant] = useState<LanguageVariant>('british');
  const [toneNote, setToneNote] = useState('');
  const [initialBrandTerm, setInitialBrandTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newClient = store.addClient({
      name: name.trim(),
      defaultStrictness,
      languageVariant,
      toneNote: toneNote.trim(),
      retentionDays: 30,
    });

    if (initialBrandTerm.trim()) {
      store.addDictionaryTerm(newClient.id, initialBrandTerm.trim(), 'Primary brand name');
    }

    onClientCreated(newClient.id);
  };

  return (
    <div className="max-w-[600px] mx-auto px-6 py-10 animate-in fade-in duration-150">
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-[#EBEBEB] tracking-tight">Add client</h1>
        <p className="text-[13.5px] text-[#9B9B9B] mt-1">
          Set up a brand workspace with custom strictness and dictionary rules.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1.5">
          <label className="text-[12.5px] font-medium text-[#9B9B9B] block">
            Client or brand name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Apex Capital"
            className="w-full h-10 px-3.5 rounded-[6px] bg-[#252525] border border-[#2F2F2F] text-[13.5px] text-[#EBEBEB] outline-none focus:border-[#2383E2]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[12.5px] font-medium text-[#9B9B9B] block">
            Default strictness
          </label>
          <select
            value={defaultStrictness}
            onChange={e => setDefaultStrictness(e.target.value as StrictnessLevel)}
            className="w-full h-10 px-3 rounded-[6px] bg-[#252525] border border-[#2F2F2F] text-[13.5px] text-[#EBEBEB] outline-none"
          >
            <option value="relaxed">Relaxed (Spelling, repeated words, placeholder only)</option>
            <option value="standard">Standard (Recommended: Grammar, punctuation, consistency)</option>
            <option value="strict">Strict (Tone drift, awkward phrasing, design copy suggestions)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[12.5px] font-medium text-[#9B9B9B] block">
            Language variant
          </label>
          <select
            value={languageVariant}
            onChange={e => setLanguageVariant(e.target.value as LanguageVariant)}
            className="w-full h-10 px-3 rounded-[6px] bg-[#252525] border border-[#2F2F2F] text-[13.5px] text-[#EBEBEB] outline-none"
          >
            <option value="british">British English</option>
            <option value="american">American English</option>
            <option value="nigerian">Nigerian English</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[12.5px] font-medium text-[#9B9B9B] block">
            Initial brand dictionary term (optional)
          </label>
          <input
            type="text"
            value={initialBrandTerm}
            onChange={e => setInitialBrandTerm(e.target.value)}
            placeholder="e.g. Exact name or social handle to never flag"
            className="w-full h-10 px-3.5 rounded-[6px] bg-[#252525] border border-[#2F2F2F] text-[13.5px] text-[#EBEBEB] outline-none focus:border-[#2383E2]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[12.5px] font-medium text-[#9B9B9B] block">
            Tone note (optional)
          </label>
          <textarea
            rows={3}
            value={toneNote}
            onChange={e => setToneNote(e.target.value)}
            placeholder="e.g. Modern institutional finance, concise headlines, minimal exclamation marks."
            className="w-full p-3 rounded-[6px] bg-[#252525] border border-[#2F2F2F] text-[13px] text-[#EBEBEB] outline-none focus:border-[#2383E2]"
          />
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-[#2F2F2F]">
          <button
            type="button"
            onClick={() => onNavigate('/clients')}
            className="text-[13px] text-[#9B9B9B] hover:text-[#EBEBEB]"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={!name.trim()}
            className="h-10 px-5 rounded-[6px] bg-[#2383E2] hover:bg-[#1d73c7] disabled:opacity-50 text-white text-[13.5px] font-medium transition-colors"
          >
            Create client
          </button>
        </div>
      </form>
    </div>
  );
}
