import React, { useState } from 'react';
import { store } from '../lib/store';
import { ClientRecord, StrictnessLevel, LanguageVariant } from '../types';
import { ConfirmDialog } from '../components/ConfirmDialog';

interface ClientDetailViewProps {
  clientId: string;
  onNavigate: (route: string) => void;
  onOpenCheck: (checkId: string) => void;
  onShowToast: (text: string) => void;
}

type Tab = 'overview' | 'dictionary' | 'ignore' | 'history' | 'settings';

export function ClientDetailView({
  clientId,
  onNavigate,
  onOpenCheck,
  onShowToast,
}: ClientDetailViewProps) {
  const client = store.getClient(clientId);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Inline add dictionary term
  const [newTerm, setNewTerm] = useState('');
  const [newTermNote, setNewTermNote] = useState('');

  // Inline add ignore rule
  const [newIgnoreText, setNewIgnoreText] = useState('');

  // Settings form state
  const [name, setName] = useState(client?.name || '');
  const [defaultStrictness, setDefaultStrictness] = useState<StrictnessLevel>(
    client?.defaultStrictness || 'standard'
  );
  const [languageVariant, setLanguageVariant] = useState<LanguageVariant>(
    client?.languageVariant || 'british'
  );
  const [toneNote, setToneNote] = useState(client?.toneNote || '');
  const [retentionDays, setRetentionDays] = useState(client?.retentionDays || 30);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (!client) {
    return (
      <div className="max-w-md mx-auto py-24 text-center px-4">
        <h2 className="text-[18px] font-semibold text-[#EBEBEB] mb-2">Client not found</h2>
        <button
          onClick={() => onNavigate('/clients')}
          className="h-9 px-4 rounded-[6px] bg-[#2383E2] text-white text-[13px]"
        >
          View all clients
        </button>
      </div>
    );
  }

  const dictionaryTerms = store.getDictionaryForClient(clientId);
  const ignoreRules = store.getIgnoreRulesForClient(clientId);
  const clientChecks = store.getChecks().filter(c => c.clientId === clientId);

  const handleAddDictionary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTerm.trim()) return;
    store.addDictionaryTerm(clientId, newTerm, newTermNote);
    setNewTerm('');
    setNewTermNote('');
    onShowToast(`Added "${newTerm}" to brand dictionary`);
  };

  const handleAddIgnore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIgnoreText.trim()) return;
    store.addIgnoreRule(clientId, newIgnoreText);
    setNewIgnoreText('');
    onShowToast(`Added ignore rule for "${newIgnoreText}"`);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateClient(clientId, {
      name,
      defaultStrictness,
      languageVariant,
      toneNote,
      retentionDays: Number(retentionDays) || 30,
    });
    onShowToast('Client settings saved');
  };

  const handleDeleteClient = () => {
    store.deleteClient(clientId);
    onNavigate('/clients');
    onShowToast('Client and associated checks deleted');
  };

  return (
    <div className="max-w-[960px] mx-auto px-8 py-10 animate-in fade-in duration-150">
      {/* Notion-style Page Header */}
      <div className="mb-6">
        <div className="text-[12px] text-[#9B9B9B] mb-1">
          <button onClick={() => onNavigate('/clients')} className="hover:underline">
            Clients
          </button>{' '}
          / {client.name}
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-[32px] font-bold text-[#EBEBEB] tracking-tight">
            {client.name}
          </h1>
          <button
            onClick={() => onNavigate(`/checks/new?clientId=${clientId}`)}
            className="h-9 px-4 rounded-[6px] bg-[#2383E2] hover:bg-[#1d73c7] text-white text-[13px] font-medium transition-colors"
          >
            New check for this client
          </button>
        </div>
      </div>

      {/* Plain Text Tabs (6.5) */}
      <div className="flex items-center gap-6 border-b border-[#2F2F2F] mb-8 text-[13.5px]">
        {(['overview', 'dictionary', 'ignore', 'history', 'settings'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2.5 font-medium transition-colors relative capitalize ${
              activeTab === tab
                ? 'text-[#EBEBEB]'
                : 'text-[#9B9B9B] hover:text-[#EBEBEB]'
            }`}
          >
            {tab === 'ignore' ? 'Ignore list' : tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2383E2]" />
            )}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-[10px] bg-[#252525] border border-[#2F2F2F]">
              <div className="text-[12px] text-[#9B9B9B]">Total checks run</div>
              <div className="text-[22px] font-bold text-[#EBEBEB] mt-1">{clientChecks.length}</div>
            </div>
            <div className="p-4 rounded-[10px] bg-[#252525] border border-[#2F2F2F]">
              <div className="text-[12px] text-[#9B9B9B]">Brand dictionary terms</div>
              <div className="text-[22px] font-bold text-[#EBEBEB] mt-1">{dictionaryTerms.length}</div>
            </div>
            <div className="p-4 rounded-[10px] bg-[#252525] border border-[#2F2F2F]">
              <div className="text-[12px] text-[#9B9B9B]">Active ignore rules</div>
              <div className="text-[22px] font-bold text-[#EBEBEB] mt-1">{ignoreRules.length}</div>
            </div>
          </div>

          {/* Tone Note */}
          {client.toneNote && (
            <div className="p-4 rounded-[10px] bg-[#202020] border border-[#2F2F2F]">
              <div className="text-[11.5px] font-medium text-[#9B9B9B] uppercase tracking-wider mb-1">
                Tone & Style Guidelines
              </div>
              <p className="text-[13px] text-[#EBEBEB]">{client.toneNote}</p>
            </div>
          )}

          {/* Recent Checks as cards */}
          <div>
            <div className="text-[13px] font-medium text-[#9B9B9B] mb-3">
              Recent checks
            </div>
            {clientChecks.length === 0 ? (
              <div className="p-8 text-center bg-[#252525] rounded-[10px] text-[13px] text-[#9B9B9B]">
                No checks for this client yet. Start a new check.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {clientChecks.slice(0, 3).map(chk => (
                  <div
                    key={chk.id}
                    onClick={() => onOpenCheck(chk.id)}
                    className="p-4 rounded-[10px] bg-[#252525] hover:bg-[#2C2C2C] cursor-pointer border border-[#2F2F2F] transition-colors"
                  >
                    <div className="font-semibold text-[#EBEBEB] text-[13.5px] truncate">
                      {chk.title}
                    </div>
                    <div className="text-[12px] text-[#9B9B9B] mt-1">
                      {chk.slideCount} slides • {chk.issueCount} issues
                    </div>
                    <div className="mt-3 text-[11.5px] text-[#529CCA]">View results →</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Brand Dictionary */}
      {activeTab === 'dictionary' && (
        <div className="space-y-6">
          <div className="p-4 rounded-[10px] bg-[#202020] border border-[#2F2F2F] text-[12.5px] text-[#9B9B9B]">
            Brand terms (names, products, social handles, jargon) that should <strong className="text-[#EBEBEB]">never</strong> be flagged as typos for this client.
          </div>

          {/* Inline Add */}
          <form onSubmit={handleAddDictionary} className="flex gap-2">
            <input
              type="text"
              value={newTerm}
              onChange={e => setNewTerm(e.target.value)}
              placeholder="e.g. ApexFlow, @apexcapital"
              className="flex-1 h-9 px-3 rounded-[6px] bg-[#252525] border border-[#2F2F2F] text-[13px] text-[#EBEBEB] outline-none focus:border-[#2383E2]"
            />
            <input
              type="text"
              value={newTermNote}
              onChange={e => setNewTermNote(e.target.value)}
              placeholder="Note (optional)"
              className="w-48 h-9 px-3 rounded-[6px] bg-[#252525] border border-[#2F2F2F] text-[13px] text-[#EBEBEB] outline-none focus:border-[#2383E2]"
            />
            <button
              type="submit"
              className="h-9 px-4 rounded-[6px] bg-[#2383E2] text-white text-[13px] font-medium hover:bg-[#1d73c7] shrink-0"
            >
              Add term
            </button>
          </form>

          {/* Dictionary list */}
          <div className="bg-[#252525] rounded-[10px] border border-[#2F2F2F] divide-y divide-[#2F2F2F] overflow-hidden">
            {dictionaryTerms.length === 0 ? (
              <div className="p-6 text-center text-[13px] text-[#9B9B9B]">
                No brand terms added yet.
              </div>
            ) : (
              dictionaryTerms.map(term => (
                <div
                  key={term.id}
                  className="px-4 py-3 flex items-center justify-between text-[13px]"
                >
                  <div>
                    <span className="font-mono text-[#EBEBEB]">{term.term}</span>
                    {term.note && (
                      <span className="text-[12px] text-[#9B9B9B] ml-2">({term.note})</span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      store.removeDictionaryTerm(term.id);
                      onShowToast(`Removed "${term.term}"`);
                    }}
                    className="text-[#E5675B] hover:underline text-[12px]"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Ignore List */}
      {activeTab === 'ignore' && (
        <div className="space-y-6">
          <div className="p-4 rounded-[10px] bg-[#202020] border border-[#2F2F2F] text-[12.5px] text-[#9B9B9B]">
            Phrases and stylistic choices marked with "Never flag this" during check reviews.
          </div>

          <form onSubmit={handleAddIgnore} className="flex gap-2">
            <input
              type="text"
              value={newIgnoreText}
              onChange={e => setNewIgnoreText(e.target.value)}
              placeholder="e.g. fee-free, Built different"
              className="flex-1 h-9 px-3 rounded-[6px] bg-[#252525] border border-[#2F2F2F] text-[13px] text-[#EBEBEB] outline-none focus:border-[#2383E2]"
            />
            <button
              type="submit"
              className="h-9 px-4 rounded-[6px] bg-[#2383E2] text-white text-[13px] font-medium hover:bg-[#1d73c7] shrink-0"
            >
              Add ignore rule
            </button>
          </form>

          <div className="bg-[#252525] rounded-[10px] border border-[#2F2F2F] divide-y divide-[#2F2F2F] overflow-hidden">
            {ignoreRules.length === 0 ? (
              <div className="p-6 text-center text-[13px] text-[#9B9B9B]">
                No ignore rules created yet.
              </div>
            ) : (
              ignoreRules.map(rule => (
                <div
                  key={rule.id}
                  className="px-4 py-3 flex items-center justify-between text-[13px]"
                >
                  <span className="font-mono text-[#EBEBEB]">"{rule.original}"</span>
                  <button
                    onClick={() => {
                      store.removeIgnoreRule(rule.id);
                      onShowToast(`Removed ignore rule for "${rule.original}"`);
                    }}
                    className="text-[#E5675B] hover:underline text-[12px]"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 4: History */}
      {activeTab === 'history' && (
        <div className="bg-[#252525] rounded-[10px] border border-[#2F2F2F] divide-y divide-[#2F2F2F] overflow-hidden">
          {clientChecks.length === 0 ? (
            <div className="p-8 text-center text-[13px] text-[#9B9B9B]">
              No checks run for this client yet.
            </div>
          ) : (
            clientChecks.map(chk => (
              <div
                key={chk.id}
                onClick={() => onOpenCheck(chk.id)}
                className="px-4 py-3.5 hover:bg-[#2C2C2C] cursor-pointer flex items-center justify-between text-[13px] transition-colors"
              >
                <div>
                  <div className="font-semibold text-[#EBEBEB]">{chk.title}</div>
                  <div className="text-[12px] text-[#9B9B9B] mt-0.5">
                    {chk.slideCount} slides • {chk.issueCount} issues • {new Date(chk.createdAt).toLocaleDateString('en-GB')}
                  </div>
                </div>
                <div className="text-[12.5px] text-[#529CCA]">Open →</div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 5: Settings */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-6 max-w-lg">
          <div className="space-y-1.5">
            <label className="text-[12.5px] font-medium text-[#9B9B9B] block">
              Client name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full h-9 px-3 rounded-[6px] bg-[#252525] border border-[#2F2F2F] text-[13px] text-[#EBEBEB] outline-none focus:border-[#2383E2]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[12.5px] font-medium text-[#9B9B9B] block">
              Default strictness
            </label>
            <select
              value={defaultStrictness}
              onChange={e => setDefaultStrictness(e.target.value as StrictnessLevel)}
              className="w-full h-9 px-3 rounded-[6px] bg-[#252525] border border-[#2F2F2F] text-[13px] text-[#EBEBEB] outline-none"
            >
              <option value="relaxed">Relaxed</option>
              <option value="standard">Standard (recommended)</option>
              <option value="strict">Strict</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[12.5px] font-medium text-[#9B9B9B] block">
              Language variant
            </label>
            <select
              value={languageVariant}
              onChange={e => setLanguageVariant(e.target.value as LanguageVariant)}
              className="w-full h-9 px-3 rounded-[6px] bg-[#252525] border border-[#2F2F2F] text-[13px] text-[#EBEBEB] outline-none"
            >
              <option value="british">British English</option>
              <option value="american">American English</option>
              <option value="nigerian">Nigerian English</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[12.5px] font-medium text-[#9B9B9B] block">
              Tone & style note
            </label>
            <textarea
              rows={3}
              value={toneNote}
              onChange={e => setToneNote(e.target.value)}
              placeholder="e.g. Modern B2B fintech, confident, British spelling."
              className="w-full p-3 rounded-[6px] bg-[#252525] border border-[#2F2F2F] text-[13px] text-[#EBEBEB] outline-none focus:border-[#2383E2]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[12.5px] font-medium text-[#9B9B9B] block">
              Retention period (days)
            </label>
            <input
              type="number"
              value={retentionDays}
              onChange={e => setRetentionDays(Number(e.target.value))}
              className="w-32 h-9 px-3 rounded-[6px] bg-[#252525] border border-[#2F2F2F] text-[13px] text-[#EBEBEB] outline-none"
            />
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-[#2F2F2F]">
            <button
              type="button"
              onClick={() => setShowDeleteDialog(true)}
              className="text-[12.5px] text-[#E5675B] hover:underline"
            >
              Delete this client
            </button>

            <button
              type="submit"
              className="h-9 px-4 rounded-[6px] bg-[#2383E2] text-white text-[13px] font-medium hover:bg-[#1d73c7]"
            >
              Save settings
            </button>
          </div>
        </form>
      )}

      {/* Delete Client Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete client"
        message={`Are you sure you want to delete ${client.name}? All ${clientChecks.length} checks, brand dictionary terms, and ignore rules will be permanently removed.`}
        confirmLabel="Delete client"
        isDestructive={true}
        onConfirm={handleDeleteClient}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  );
}
