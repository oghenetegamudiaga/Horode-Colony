import React, { useState, useEffect, useMemo, useRef } from 'react';
import { store } from '../lib/store';
import {
  CheckRecord,
  SlideIssue,
  CrossSlideIssue,
  IssueStatus,
  IssueType,
  StrictnessLevel,
} from '../types';
import { IssueTag } from '../components/IssueTag';
import { EllipsisGlyph, ChevronGlyph } from '../components/Glyphs';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { compressImageForAnalysis } from '../lib/imageUtils';

interface ResultsViewProps {
  checkId: string;
  onNavigate: (route: string) => void;
  onShowToast: (text: string, undoAction?: () => void) => void;
  onOpenShortcuts: () => void;
}

type GroupBy = 'slide' | 'type' | 'confidence';
type StatusFilter = 'all' | 'open' | 'accepted' | 'ignored';

export function ResultsView({
  checkId,
  onNavigate,
  onShowToast,
  onOpenShortcuts,
}: ResultsViewProps) {
  const check = store.getCheck(checkId);

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<GroupBy>('slide');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<IssueType | 'all'>('all');

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [openCardOverflowId, setOpenCardOverflowId] = useState<string | null>(null);
  const [showHeaderOverflow, setShowHeaderOverflow] = useState(false);

  // If check doesn't exist
  if (!check) {
    return (
      <div className="max-w-md mx-auto py-24 text-center px-4">
        <h2 className="text-[18px] font-semibold text-[#EBEBEB] mb-2">Check not found</h2>
        <p className="text-[13px] text-[#9B9B9B] mb-6">This check may have been deleted.</p>
        <button
          onClick={() => onNavigate('/')}
          className="h-9 px-4 rounded-[6px] bg-[#2383E2] text-white text-[13px]"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const currentSlide = check.slides[currentSlideIndex];

  // Flat list of all slide issues
  const allSlideIssues: SlideIssue[] = useMemo(() => {
    return check.slides.flatMap(s => s.issues);
  }, [check]);

  // Combined issues for keyboard navigation
  const navigableIssues = useMemo(() => {
    return allSlideIssues.filter(i => {
      if (statusFilter !== 'all' && i.status !== statusFilter) return false;
      if (typeFilter !== 'all' && i.type !== typeFilter) return false;
      return true;
    });
  }, [allSlideIssues, statusFilter, typeFilter]);

  // Select first issue by default if none selected
  useEffect(() => {
    if (!selectedIssueId && navigableIssues.length > 0) {
      setSelectedIssueId(navigableIssues[0].id);
    }
  }, [navigableIssues, selectedIssueId]);

  // Handle slide change when selected issue changes
  const handleSelectIssue = (issue: SlideIssue) => {
    setSelectedIssueId(issue.id);
    const targetIndex = check.slides.findIndex(s => s.position === issue.slidePosition);
    if (targetIndex !== -1 && targetIndex !== currentSlideIndex) {
      setCurrentSlideIndex(targetIndex);
    }
  };

  // Keyboard navigation (FR-18 & Style Guide Section 10)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (navigableIssues.length === 0) return;
        const currentIdx = navigableIssues.findIndex(i => i.id === selectedIssueId);
        const nextIdx = (currentIdx + 1) % navigableIssues.length;
        handleSelectIssue(navigableIssues[nextIdx]);
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (navigableIssues.length === 0) return;
        const currentIdx = navigableIssues.findIndex(i => i.id === selectedIssueId);
        const prevIdx = (currentIdx - 1 + navigableIssues.length) % navigableIssues.length;
        handleSelectIssue(navigableIssues[prevIdx]);
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        if (selectedIssueId) {
          handleStatusChange(selectedIssueId, 'accepted', 'slide');
        }
      } else if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        if (selectedIssueId) {
          handleStatusChange(selectedIssueId, 'ignored', 'slide');
        }
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        if (selectedIssueId) {
          const currentIssue = allSlideIssues.find(i => i.id === selectedIssueId);
          if (currentIssue) {
            handleNeverFlag(currentIssue);
          }
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentSlideIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentSlideIndex(prev => Math.min(check.slides.length - 1, prev + 1));
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        handleCopyCorrections();
      } else if (e.key === '?') {
        e.preventDefault();
        onOpenShortcuts();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigableIssues, selectedIssueId, currentSlideIndex, allSlideIssues, check]);

  // Issue Action Handlers
  const handleStatusChange = (
    issueId: string,
    newStatus: IssueStatus,
    scope: 'slide' | 'cross_slide'
  ) => {
    const prevStatus =
      scope === 'cross_slide'
        ? check.crossSlideIssues.find(i => i.id === issueId)?.status
        : allSlideIssues.find(i => i.id === issueId)?.status;

    store.updateIssueStatus(check.id, issueId, newStatus, scope);

    onShowToast(
      newStatus === 'accepted' ? 'Accepted fix' : 'Ignored issue',
      () => {
        if (prevStatus) {
          store.updateIssueStatus(check.id, issueId, prevStatus, scope);
        }
      }
    );
  };

  const handleNeverFlag = (issue: SlideIssue) => {
    store.addIgnoreRule(check.clientId, issue.original);
    store.updateIssueStatus(check.id, issue.id, 'ignored', 'slide');
    setOpenCardOverflowId(null);
    onShowToast(`Never flagging "${issue.original}" for ${check.clientName}`);
  };

  // Copy Corrections Checklist (FR-13 & M5)
  const generateCorrectionsText = () => {
    const lines: string[] = [
      `# Corrections Checklist — ${check.title}`,
      `Client: ${check.clientName}`,
      `Date: ${new Date(check.createdAt).toLocaleDateString('en-GB')}`,
      '',
    ];

    let count = 0;
    // Slide issues
    check.slides.forEach(slide => {
      const issues = slide.issues.filter(i => i.status === 'accepted' || i.status === 'open');
      if (issues.length > 0) {
        issues.forEach(iss => {
          count++;
          const statusNote = iss.status === 'open' ? ' [Pending review]' : '';
          lines.push(
            `- Slide ${slide.position}: Change "${iss.original}" → "${iss.suggestion}" (${iss.reason})${statusNote}`
          );
        });
      }
    });

    // Cross slide issues
    const activeCross = check.crossSlideIssues.filter(i => i.status !== 'ignored');
    if (activeCross.length > 0) {
      lines.push('');
      lines.push('## Consistency & Cross-Slide Fixes:');
      activeCross.forEach(c => {
        count++;
        lines.push(
          `- Slides ${c.affectedSlidePositions.join(', ')}: "${c.original}" → ${c.suggestion} (${c.reason})`
        );
      });
    }

    if (count === 0) {
      lines.push('Nothing to fix. This carousel is clean.');
    }

    return lines.join('\n');
  };

  const handleCopyCorrections = () => {
    const text = generateCorrectionsText();
    navigator.clipboard.writeText(text);
    onShowToast('Corrections copied to clipboard');
  };

  const handleDownloadList = () => {
    const text = generateCorrectionsText();
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Corrections_${check.title.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast('Downloaded corrections checklist');
  };

  // Re-run single slide (Flow E: Recover from a failed slide)
  const handleRetrySlide = async (slideIndex: number) => {
    const targetSlide = check.slides[slideIndex];
    if (!targetSlide) return;

    targetSlide.status = 'reading';
    targetSlide.errorMessage = undefined;
    store.updateCheck(check.id, { slides: [...check.slides] });

    try {
      const optimizedImage = await compressImageForAnalysis(targetSlide.imageUrl);

      const response = await fetch('/api/analyze-slide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: optimizedImage,
          mimeType: 'image/jpeg',
          strictness: check.strictness,
          languageVariant: check.languageVariant,
          dictionaryTerms: store.getDictionaryForClient(check.clientId),
          ignoreRules: store.getIgnoreRulesForClient(check.clientId),
          slidePosition: targetSlide.position,
        }),
      });

      if (!response.ok) {
        let errorText = `Server error (HTTP ${response.status})`;
        try {
          const errJson = await response.json();
          errorText = errJson.details || errJson.error || errorText;
        } catch {
          const raw = await response.text();
          if (raw.includes('<!doctype') || response.status === 404) {
            errorText = 'API route not found (404). Check Vercel serverless function deployment.';
          }
        }
        throw new Error(errorText);
      }

      const data = await response.json();
      targetSlide.status = 'done';
      targetSlide.slideText = data.slide_text || '';
      targetSlide.unreadableRegions = data.unreadable_regions || [];
      targetSlide.issues = (data.issues || []).map((iss: any) => ({
        ...iss,
        slideId: targetSlide.id,
        slidePosition: targetSlide.position,
      }));

      store.updateCheck(check.id, {
        slides: [...check.slides],
        status: 'completed',
      });
      onShowToast(`Slide ${targetSlide.position} finished`);
    } catch (err: any) {
      targetSlide.status = 'failed';
      targetSlide.errorMessage = err?.message || 'Failed to analyze slide.';
      store.updateCheck(check.id, { slides: [...check.slides] });
      onShowToast(`Slide ${targetSlide.position}: ${targetSlide.errorMessage}`);
    }
  };

  const handleDeleteCheck = () => {
    store.deleteCheck(check.id);
    onNavigate('/');
    onShowToast('Check deleted');
  };

  // Slide-specific markers
  const currentSlideIssues = currentSlide?.issues || [];

  return (
    <div className="h-screen flex flex-col bg-[#191919] text-[#EBEBEB] overflow-hidden select-none">
      {/* Top Results Header Bar */}
      <header className="h-14 border-b border-[#2F2F2F] px-6 flex items-center justify-between shrink-0 bg-[#202020]">
        <div className="flex items-center gap-4 min-w-0">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[15px] font-semibold text-[#EBEBEB] truncate">
                {check.title}
              </h1>
              <span className="text-[11px] px-1.5 py-0.5 rounded-[4px] bg-[#252525] text-[#9B9B9B] capitalize font-mono">
                {check.strictness}
              </span>
            </div>
            <div className="text-[12px] text-[#9B9B9B]">
              {check.clientName} • {check.slideCount} slides •{' '}
              {check.issueCount === 0
                ? 'Clean carousel'
                : `${check.issueCount} issues (${check.resolvedCount} resolved)`}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopyCorrections}
            className="h-8 px-3 rounded-[6px] bg-[#2383E2] hover:bg-[#1d73c7] text-white text-[12.5px] font-medium transition-colors"
          >
            Copy corrections
          </button>

          <button
            onClick={handleDownloadList}
            className="h-8 px-3 rounded-[6px] bg-[#252525] hover:bg-[#2C2C2C] text-[#EBEBEB] text-[12.5px] font-medium transition-colors"
          >
            Download list
          </button>

          {/* Header Overflow Menu */}
          <div className="relative">
            <button
              onClick={() => setShowHeaderOverflow(!showHeaderOverflow)}
              className="p-1.5 rounded-[6px] text-[#9B9B9B] hover:text-[#EBEBEB] hover:bg-[#2C2C2C] transition-colors"
              aria-label="Check options"
            >
              <EllipsisGlyph className="w-4 h-4" />
            </button>

            {showHeaderOverflow && (
              <div className="absolute right-0 top-10 w-48 bg-[#252525] rounded-[8px] shadow-2xl border border-[#2F2F2F] py-1 z-40 animate-in fade-in duration-100">
                <button
                  onClick={() => {
                    setShowHeaderOverflow(false);
                    onNavigate('/checks/new');
                  }}
                  className="w-full text-left px-3 py-1.5 text-[12.5px] text-[#EBEBEB] hover:bg-[#2C2C2C]"
                >
                  New check
                </button>
                <button
                  onClick={() => {
                    setShowHeaderOverflow(false);
                    handleRetrySlide(currentSlideIndex);
                  }}
                  className="w-full text-left px-3 py-1.5 text-[12.5px] text-[#EBEBEB] hover:bg-[#2C2C2C]"
                >
                  Re-check current slide
                </button>
                <button
                  onClick={() => {
                    setShowHeaderOverflow(false);
                    onOpenShortcuts();
                  }}
                  className="w-full text-left px-3 py-1.5 text-[12.5px] text-[#EBEBEB] hover:bg-[#2C2C2C]"
                >
                  Keyboard shortcuts
                </button>
                <div className="my-1 border-t border-[#2F2F2F]" />
                <button
                  onClick={() => {
                    setShowHeaderOverflow(false);
                    setShowDeleteDialog(true);
                  }}
                  className="w-full text-left px-3 py-1.5 text-[12.5px] text-[#E5675B] hover:bg-[#2C2C2C]"
                >
                  Delete this check now
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Two-Zone Work Area (Viewer on left ~60%, Issue List on right ~40%) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Zone 1: Slide Viewer (~60%) */}
        <section
          className="flex-1 bg-[#161616] flex flex-col justify-between overflow-hidden relative border-r border-[#2F2F2F]"
          aria-label="Slide Viewer"
        >
          {/* Slide Navigation Header */}
          <div className="h-10 px-4 flex items-center justify-between text-[12px] text-[#9B9B9B] border-b border-[#2F2F2F]/40 bg-[#191919]">
            <div className="flex items-center gap-2">
              <span className="font-medium text-[#EBEBEB]">
                Slide {currentSlide ? currentSlide.position : 0} of {check.slides.length}
              </span>
              {currentSlide?.status === 'reading' && (
                <span className="text-[#2383E2] animate-pulse">
                  Reading slide...
                </span>
              )}
              {currentSlide?.status === 'failed' && (
                <span className="text-[#E5675B]">
                  Failed to read •{' '}
                  <button
                    onClick={() => handleRetrySlide(currentSlideIndex)}
                    className="text-[#529CCA] underline"
                  >
                    Try again
                  </button>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))}
                disabled={currentSlideIndex === 0}
                className="px-2 py-0.5 rounded text-[#9B9B9B] hover:text-[#EBEBEB] disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentSlideIndex(prev => Math.min(check.slides.length - 1, prev + 1))
                }
                disabled={currentSlideIndex === check.slides.length - 1}
                className="px-2 py-0.5 rounded text-[#9B9B9B] hover:text-[#EBEBEB] disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>

          {/* Slide Canvas Area */}
          <div className="flex-1 flex items-center justify-center p-6 overflow-hidden relative">
            {currentSlide ? (
              <div className="relative max-h-full max-w-full aspect-square shadow-2xl rounded-[8px] overflow-hidden bg-[#101010]">
                {/* The Slide Image */}
                <img
                  src={currentSlide.imageUrl}
                  alt={currentSlide.name}
                  className="max-h-[calc(100vh-220px)] max-w-full object-contain block select-none"
                />

                {/* Overlaid Numbered Markers & Bounding Boxes (FR-09) */}
                {currentSlideIssues.map((issue, idx) => {
                  if (!issue.bbox) return null;
                  const [bx, by, bw, bh] = issue.bbox;
                  const isSelected = selectedIssueId === issue.id;
                  const isResolved = issue.status !== 'open';

                  return (
                    <React.Fragment key={issue.id}>
                      {/* Highlight Box if selected */}
                      {isSelected && (
                        <div
                          style={{
                            left: `${bx * 100}%`,
                            top: `${by * 100}%`,
                            width: `${bw * 100}%`,
                            height: `${bh * 100}%`,
                          }}
                          className="absolute border-2 border-[#2383E2] bg-[#2383E2]/15 rounded-[4px] pointer-events-none transition-all duration-150 z-10"
                        />
                      )}

                      {/* Numbered Circle Marker */}
                      <button
                        onClick={() => handleSelectIssue(issue)}
                        style={{
                          left: `${(bx + bw) * 100}%`,
                          top: `${by * 100}%`,
                        }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ring-2 ring-white shadow-lg transition-transform duration-150 z-20 cursor-pointer ${
                          isSelected
                            ? 'scale-125 bg-[#2383E2] text-white ring-[#2383E2]'
                            : isResolved
                            ? 'bg-[#4DAB9A] text-white opacity-80'
                            : 'bg-[#CB912F] text-black hover:scale-110'
                        }`}
                        title={`${issue.type}: ${issue.original} -> ${issue.suggestion}`}
                      >
                        {idx + 1}
                      </button>
                    </React.Fragment>
                  );
                })}

                {/* Unreadable Regions (FR-08) */}
                {currentSlide.unreadableRegions?.map((region, rIdx) => {
                  const [rx, ry, rw, rh] = region.bbox;
                  return (
                    <div
                      key={rIdx}
                      style={{
                        left: `${rx * 100}%`,
                        top: `${ry * 100}%`,
                        width: `${rw * 100}%`,
                        height: `${rh * 100}%`,
                      }}
                      className="absolute border border-dashed border-[#E8A24A] bg-[#E8A24A]/10 rounded-[4px] p-1 flex items-start pointer-events-none z-10"
                      title={region.description}
                    >
                      <span className="text-[10px] bg-[#E8A24A] text-black font-semibold px-1 rounded-[2px] leading-tight">
                        Unreadable
                      </span>
                    </div>
                  );
                })}

                {/* Clean slide badge */}
                {currentSlideIssues.length === 0 && currentSlide.status === 'done' && (
                  <div className="absolute bottom-4 left-4 right-4 py-2 px-3 rounded-[6px] bg-black/75 backdrop-blur-xs text-[12px] text-[#4DAB9A] text-center font-medium">
                    Nothing to fix. This slide is clean.
                  </div>
                )}

                {/* Failed slide error overlay */}
                {currentSlide.status === 'failed' && (
                  <div className="absolute inset-x-4 bottom-4 p-3.5 rounded-[8px] bg-[#3D2224]/95 border border-[#ff8a80]/40 text-[#ff8a80] text-[12.5px] z-20 backdrop-blur-xs shadow-xl flex items-center justify-between">
                    <div className="pr-3">
                      <div className="font-semibold text-white text-[13px]">Slide Analysis Incomplete</div>
                      <div className="text-[#ff8a80] text-[12px] mt-0.5 leading-snug">
                        {currentSlide.errorMessage || 'Server or API key issue encountered.'}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRetrySlide(currentSlideIndex)}
                      className="px-3 py-1.5 rounded-[4px] bg-[#ff8a80] text-black font-semibold text-[11.5px] hover:bg-white shrink-0 transition-colors"
                    >
                      Retry Slide
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-[13px] text-[#9B9B9B]">No slide selected</div>
            )}
          </div>
        </section>

        {/* Zone 2: Synced Issue List (~40%) */}
        <section
          className="w-[420px] lg:w-[460px] bg-[#202020] flex flex-col justify-between shrink-0 overflow-hidden"
          aria-label="Issues List"
        >
          {/* Filter & Group Controls Bar */}
          <div className="p-3 border-b border-[#2F2F2F] space-y-2 bg-[#202020]">
            <div className="flex items-center justify-between text-[12px]">
              <div className="flex items-center gap-1.5">
                {(['all', 'open', 'accepted', 'ignored'] as StatusFilter[]).map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2 py-0.5 rounded-[4px] capitalize transition-colors ${
                      statusFilter === st
                        ? 'bg-[#252525] text-[#EBEBEB] font-medium'
                        : 'text-[#9B9B9B] hover:text-[#EBEBEB]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 text-[11px] text-[#9B9B9B]">
                <span>Group:</span>
                <select
                  value={groupBy}
                  onChange={e => setGroupBy(e.target.value as GroupBy)}
                  className="bg-[#252525] border border-[#2F2F2F] rounded-[4px] px-1.5 py-0.5 text-[#EBEBEB] outline-none"
                >
                  <option value="slide">By slide</option>
                  <option value="type">By type</option>
                  <option value="confidence">By confidence</option>
                </select>
              </div>
            </div>
          </div>

          {/* Scrollable Issue Cards */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Cross-Slide Consistency Issues Section (M5 & FR-10) */}
            {check.crossSlideIssues.length > 0 && (
              <div className="mb-4">
                <div className="text-[11.5px] font-medium text-[#9B9B9B] uppercase tracking-wider mb-2">
                  Cross-Slide Inconsistencies
                </div>
                <div className="space-y-2.5">
                  {check.crossSlideIssues.map(cIssue => {
                    const isAccepted = cIssue.status === 'accepted';
                    const isIgnored = cIssue.status === 'ignored';

                    if (isAccepted || isIgnored) {
                      return (
                        <div
                          key={cIssue.id}
                          className="p-2.5 rounded-[8px] bg-[#252525] text-[12px] flex items-center justify-between text-[#9B9B9B]"
                        >
                          <span className="truncate">
                            <span className="capitalize">{cIssue.status}</span>:{' '}
                            {cIssue.suggestion}
                          </span>
                          <button
                            onClick={() => handleStatusChange(cIssue.id, 'open', 'cross_slide')}
                            className="text-[#529CCA] hover:underline text-[11.5px]"
                          >
                            Undo
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={cIssue.id}
                        className="p-3.5 rounded-[10px] bg-[#252525] border border-[#2F2F2F] space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <IssueTag type={cIssue.type} />
                          <span className="text-[11px] text-[#9B9B9B]">
                            Slides {cIssue.affectedSlidePositions.join(', ')}
                          </span>
                        </div>

                        <div className="text-[13px] font-mono text-[#ff8a80] bg-[#191919] p-2 rounded-[4px]">
                          {cIssue.original}
                        </div>

                        <div className="text-[13px] font-mono text-[#5FD3C4] bg-[#191919] p-2 rounded-[4px]">
                          → {cIssue.suggestion}
                        </div>

                        <p className="text-[12.5px] text-[#9B9B9B] leading-relaxed">
                          {cIssue.reason}
                        </p>

                        <div className="pt-2 flex items-center gap-2">
                          <button
                            onClick={() => handleStatusChange(cIssue.id, 'accepted', 'cross_slide')}
                            className="h-7 px-3 rounded-[4px] bg-[#2383E2] text-white text-[12px] font-medium hover:bg-[#1d73c7]"
                          >
                            Accept fix
                          </button>
                          <button
                            onClick={() => handleStatusChange(cIssue.id, 'ignored', 'cross_slide')}
                            className="h-7 px-3 rounded-[4px] text-[#9B9B9B] hover:text-[#EBEBEB] hover:bg-[#2C2C2C] text-[12px]"
                          >
                            Ignore
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Slide Issues */}
            {navigableIssues.length === 0 ? (
              <div className="py-16 text-center text-[13px] text-[#9B9B9B]">
                {check.issueCount === 0
                  ? 'Nothing to fix. This carousel is clean.'
                  : 'No issues match the selected filter.'}
              </div>
            ) : (
              navigableIssues.map(issue => {
                const isSelected = selectedIssueId === issue.id;
                const isAccepted = issue.status === 'accepted';
                const isIgnored = issue.status === 'ignored';

                // Collapsed resolved state (7.9)
                if (isAccepted || isIgnored) {
                  return (
                    <div
                      key={issue.id}
                      onClick={() => handleSelectIssue(issue)}
                      className="p-2.5 rounded-[8px] bg-[#252525] text-[12px] flex items-center justify-between text-[#9B9B9B] hover:bg-[#2C2C2C] cursor-pointer transition-colors"
                    >
                      <span className="truncate">
                        Slide {issue.slidePosition}: {isAccepted ? 'Accepted' : 'Ignored'} (
                        {issue.original} → {issue.suggestion})
                      </span>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleStatusChange(issue.id, 'open', 'slide');
                        }}
                        className="text-[#529CCA] hover:underline text-[11.5px] ml-2"
                      >
                        Undo
                      </button>
                    </div>
                  );
                }

                // Full Open Issue Card (7.9)
                return (
                  <div
                    key={issue.id}
                    onClick={() => handleSelectIssue(issue)}
                    className={`p-4 rounded-[12px] transition-all duration-150 cursor-pointer space-y-2.5 relative border ${
                      isSelected
                        ? 'bg-[#1F3347] border-[#2383E2]/60 shadow-md'
                        : 'bg-[#252525] border-[#2F2F2F] hover:bg-[#2C2C2C]'
                    }`}
                  >
                    {/* Header: Tag + Confidence + Slide number */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IssueTag type={issue.type} />
                        <span className="text-[11.5px] text-[#9B9B9B]">
                          Slide {issue.slidePosition}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Confidence Label (7.10) */}
                        {issue.confidence === 'high' ? (
                          <span className="text-[11px] text-[#9B9B9B]">High confidence</span>
                        ) : issue.confidence === 'medium' ? (
                          <span className="text-[11px] text-[#CB912F]">Worth checking</span>
                        ) : (
                          <span className="text-[11px] px-1.5 py-0.5 rounded border border-dashed border-[#CB912F]/60 text-[#CB912F]">
                            Not sure
                          </span>
                        )}

                        {/* Card Overflow */}
                        <div className="relative">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              setOpenCardOverflowId(
                                openCardOverflowId === issue.id ? null : issue.id
                              );
                            }}
                            className="p-1 rounded text-[#9B9B9B] hover:text-[#EBEBEB]"
                            aria-label="More actions"
                          >
                            <EllipsisGlyph className="w-3.5 h-3.5" />
                          </button>

                          {openCardOverflowId === issue.id && (
                            <div
                              onClick={e => e.stopPropagation()}
                              className="absolute right-0 top-6 w-52 bg-[#252525] rounded-[8px] shadow-2xl border border-[#2F2F2F] py-1 z-30 animate-in fade-in duration-100"
                            >
                              <button
                                onClick={() => handleNeverFlag(issue)}
                                className="w-full text-left px-3 py-1.5 text-[12px] text-[#EBEBEB] hover:bg-[#2C2C2C]"
                              >
                                Never flag this for {check.clientName}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Text Diff (original in mono with red tint -> suggestion with green tint) */}
                    <div className="space-y-1.5">
                      <div className="text-[13px] font-mono px-2.5 py-1.5 rounded-[4px] bg-[#3D2224]/80 text-[#ff8a80] line-through decoration-[#ff8a80]/60">
                        {issue.original}
                      </div>
                      <div className="text-[13px] font-mono px-2.5 py-1.5 rounded-[4px] bg-[#183633]/80 text-[#5FD3C4] font-medium">
                        {issue.suggestion}
                      </div>
                    </div>

                    {/* Reason */}
                    <p className="text-[13px] text-[#EBEBEB] leading-relaxed">
                      {issue.reason}
                    </p>

                    {/* Actions */}
                    <div className="pt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleStatusChange(issue.id, 'accepted', 'slide');
                          }}
                          className="h-7 px-3 rounded-[6px] bg-[#2383E2] hover:bg-[#1d73c7] text-white text-[12px] font-medium transition-colors"
                        >
                          Accept fix
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleStatusChange(issue.id, 'ignored', 'slide');
                          }}
                          className="h-7 px-3 rounded-[6px] bg-[#252525] hover:bg-[#2C2C2C] text-[#EBEBEB] text-[12px] transition-colors"
                        >
                          Ignore
                        </button>
                      </div>

                      <span className="text-[11px] text-[#6F6F6F]">
                        Shortcut: <kbd className="font-mono">A</kbd> / <kbd className="font-mono">I</kbd>
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Shortcuts Footer */}
          <div className="p-3 border-t border-[#2F2F2F] bg-[#191919] flex items-center justify-between text-[11px] text-[#6F6F6F]">
            <span>Navigate: <kbd className="font-mono">J</kbd> / <kbd className="font-mono">K</kbd></span>
            <span>Slides: <kbd className="font-mono">←</kbd> / <kbd className="font-mono">→</kbd></span>
            <button
              onClick={onOpenShortcuts}
              className="text-[#529CCA] hover:underline"
            >
              All shortcuts (?)
            </button>
          </div>
        </section>
      </div>

      {/* Bottom Thumbnail Strip (7.8) */}
      <footer className="h-20 bg-[#202020] border-t border-[#2F2F2F] px-4 flex items-center gap-3 overflow-x-auto shrink-0 select-none">
        {check.slides.map((slide, idx) => {
          const isCurrent = currentSlideIndex === idx;
          const openCount = slide.issues.filter(i => i.status === 'open').length;

          return (
            <button
              key={slide.id}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`h-16 w-20 rounded-[6px] relative overflow-hidden shrink-0 border transition-all ${
                isCurrent
                  ? 'border-[#2383E2] ring-2 ring-[#2383E2]/40'
                  : 'border-[#2F2F2F] opacity-75 hover:opacity-100'
              }`}
            >
              <img
                src={slide.imageUrl}
                alt={slide.name}
                className="w-full h-full object-cover"
              />

              {/* Slide Number */}
              <div className="absolute top-1 left-1 px-1 py-0.2 rounded-[2px] bg-black/70 text-[9px] font-mono text-white">
                #{slide.position}
              </div>

              {/* Status or Issue Count */}
              {slide.status === 'reading' ? (
                <div className="absolute bottom-1 right-1 px-1 py-0.2 rounded-[2px] bg-[#2383E2] text-[9px] font-medium text-white">
                  Reading
                </div>
              ) : slide.status === 'failed' ? (
                <div className="absolute bottom-1 right-1 px-1 py-0.2 rounded-[2px] bg-[#E5675B] text-[9px] font-medium text-white">
                  Failed
                </div>
              ) : openCount > 0 ? (
                <div className="absolute bottom-1 right-1 px-1 py-0.2 rounded-[2px] bg-[#CB912F] text-[9px] font-bold text-black">
                  {openCount}
                </div>
              ) : (
                <div className="absolute bottom-1 right-1 px-1 py-0.2 rounded-[2px] bg-[#4DAB9A] text-[9px] font-medium text-white">
                  Clean
                </div>
              )}
            </button>
          );
        })}
      </footer>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete this check now"
        message="This will permanently delete this check, its slides, and all flagged issues from your workspace. This action cannot be undone."
        confirmLabel="Delete check"
        isDestructive={true}
        onConfirm={handleDeleteCheck}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  );
}
