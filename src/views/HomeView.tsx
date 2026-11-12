import React from 'react';
import { store } from '../lib/store';
import { CheckRecord } from '../types';

interface HomeViewProps {
  onNavigate: (route: string) => void;
  onOpenCheck: (id: string) => void;
}

export function HomeView({ onNavigate, onOpenCheck }: HomeViewProps) {
  const checks = store.getChecks();
  const clients = store.getClients();

  // Dynamic greeting based on current local hour
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? 'Good morning, Tega'
      : hour < 17
      ? 'Good afternoon, Tega'
      : 'Good evening, Tega';

  // Recently checked cards (up to 4)
  const recentlyChecked = checks.slice(0, 4);

  // Needs attention: checks that have open issues
  const needsAttention = checks.filter(c => {
    const openCount = c.issueCount - c.resolvedCount;
    return openCount > 0;
  });

  const formatRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffHours = Math.round(diffMs / 3600000);
      if (diffHours < 1) return 'Just now';
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.round(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return '';
    }
  };

  return (
    <div className="max-w-[1120px] mx-auto px-8 py-12 animate-in fade-in duration-150">
      {/* Notion-style Greeting */}
      <div className="mb-10 text-center">
        <h1 className="text-[36px] font-bold text-[#EBEBEB] tracking-tight">
          {greeting}
        </h1>
        <p className="text-[14px] text-[#9B9B9B] mt-1">
          Proofread social carousels and slide designs before client delivery.
        </p>
      </div>

      {checks.length === 0 ? (
        /* Empty State */
        <div className="py-20 text-center max-w-md mx-auto">
          <p className="text-[15px] text-[#9B9B9B] mb-5">
            Nothing here yet. Start with a new check.
          </p>
          <button
            onClick={() => onNavigate('/checks/new')}
            className="h-10 px-5 rounded-[6px] bg-[#2383E2] text-white hover:bg-[#1d73c7] font-medium text-[13.5px] transition-colors"
          >
            Check slides
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Recently Checked Section */}
          <section>
            <div className="flex items-center justify-between mb-3.5">
              <span className="text-[13px] font-medium text-[#9B9B9B]">
                Recently checked
              </span>
              <button
                onClick={() => onNavigate('/checks/new')}
                className="text-[12.5px] text-[#529CCA] hover:underline"
              >
                + New check
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {recentlyChecked.map(check => {
                const coverImage = check.slides[0]?.imageUrl;
                const openCount = check.issueCount - check.resolvedCount;

                return (
                  <div
                    key={check.id}
                    onClick={() => onOpenCheck(check.id)}
                    className="group bg-[#252525] hover:bg-[#2C2C2C] rounded-[12px] overflow-hidden cursor-pointer transition-colors duration-150 flex flex-col justify-between"
                  >
                    {/* Cover Strip */}
                    <div className="h-32 bg-[#191919] overflow-hidden relative border-b border-[#2F2F2F]/40 flex items-center justify-center">
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt={check.title}
                          className="w-full h-full object-cover object-top opacity-90 group-hover:opacity-100 transition-opacity"
                        />
                      ) : (
                        <span className="text-[12px] text-[#6F6F6F]">No preview</span>
                      )}
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-[4px] bg-black/60 backdrop-blur-xs text-[10px] text-white/80 font-mono">
                        {check.slideCount} slides
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        <h2 className="text-[14px] font-semibold text-[#EBEBEB] leading-snug line-clamp-2">
                          {check.title}
                        </h2>
                        <div className="text-[12px] text-[#9B9B9B] mt-1 truncate">
                          {check.clientName} • {formatRelativeTime(check.createdAt)}
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-[#2F2F2F]/40 flex items-center justify-between text-[11.5px]">
                        <span className="text-[#9B9B9B] capitalize">{check.strictness}</span>
                        {openCount === 0 ? (
                          <span className="text-[#4DAB9A] font-medium">Clean</span>
                        ) : (
                          <span className="text-[#CB912F] font-medium">
                            {openCount} open {openCount === 1 ? 'issue' : 'issues'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Needs Attention List */}
          <section>
            <div className="mb-3">
              <span className="text-[13px] font-medium text-[#9B9B9B]">
                Needs attention
              </span>
            </div>

            {needsAttention.length === 0 ? (
              <div className="p-6 rounded-[8px] bg-[#252525] text-center text-[13px] text-[#9B9B9B]">
                All checks are resolved. Nothing requires attention.
              </div>
            ) : (
              <div className="bg-[#252525] rounded-[12px] divide-y divide-[#2F2F2F] overflow-hidden">
                {needsAttention.map(check => {
                  const openCount = check.issueCount - check.resolvedCount;
                  return (
                    <div
                      key={check.id}
                      onClick={() => onOpenCheck(check.id)}
                      className="px-4 py-3.5 hover:bg-[#2C2C2C] cursor-pointer flex items-center justify-between transition-colors text-[13px]"
                    >
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="font-semibold text-[#EBEBEB] truncate">
                          {check.title}
                        </div>
                        <div className="text-[12px] text-[#9B9B9B] truncate mt-0.5">
                          {check.clientName} • {check.slideCount} slides
                        </div>
                      </div>

                      <div className="flex items-center gap-6 shrink-0">
                        <div className="text-right">
                          <span className="text-[#CB912F] font-medium">
                            {openCount} open {openCount === 1 ? 'issue' : 'issues'}
                          </span>
                          <div className="text-[11px] text-[#6F6F6F]">
                            {check.resolvedCount} of {check.issueCount} resolved
                          </div>
                        </div>

                        <span className="text-[#529CCA] text-[12.5px] hover:underline">
                          Review
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Fast Actions & Demo Presets */}
          <section className="p-4 rounded-[12px] bg-[#202020] border border-[#2F2F2F] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="font-medium text-[13.5px] text-[#EBEBEB]">
                Ready to review a new deck?
              </div>
              <div className="text-[12px] text-[#9B9B9B]">
                Drag in PNG, JPEG, or multi-page PDFs to check for typos, repeated words, and cross-slide inconsistency.
              </div>
            </div>
            <button
              onClick={() => onNavigate('/checks/new')}
              className="h-9 px-4 rounded-[6px] bg-[#2383E2] text-white hover:bg-[#1d73c7] font-medium text-[13px] shrink-0 transition-colors"
            >
              Start new check
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
