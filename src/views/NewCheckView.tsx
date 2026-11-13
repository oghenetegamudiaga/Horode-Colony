import React, { useState, useEffect, useRef } from 'react';
import { store } from '../lib/store';
import { StrictnessLevel, LanguageVariant, CheckRecord, SlideData } from '../types';
import { generateSampleApexCarousel, generateSampleCleanCarousel } from '../lib/goldenSet';
import { compressImageForAnalysis } from '../lib/imageUtils';
import { AccessCodeDialog } from '../components/AccessCodeDialog';
import { fetchWithAccessCode } from '../lib/apiClient';

interface NewCheckViewProps {
  onNavigate: (route: string) => void;
  onCheckCreated: (checkId: string) => void;
  initialClientId?: string;
}

interface UploadedSlide {
  id: string;
  name: string;
  dataUrl: string;
  size: number;
  mimeType: string;
}

export function NewCheckView({
  onNavigate,
  onCheckCreated,
  initialClientId,
}: NewCheckViewProps) {
  const clients = store.getClients();
  const [selectedClientId, setSelectedClientId] = useState<string>(
    initialClientId || clients[0]?.id || ''
  );

  const selectedClient = clients.find(c => c.id === selectedClientId);

  const defaultDateStr = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const [title, setTitle] = useState(
    selectedClient ? `${selectedClient.name} Carousel - ${defaultDateStr}` : `New Carousel - ${defaultDateStr}`
  );
  const [strictness, setStrictness] = useState<StrictnessLevel>(
    selectedClient?.defaultStrictness || 'standard'
  );
  const [languageVariant, setLanguageVariant] = useState<LanguageVariant>(
    selectedClient?.languageVariant || 'british'
  );

  const [slides, setSlides] = useState<UploadedSlide[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [accessCodeResolver, setAccessCodeResolver] = useState<{
    resolve: (code: string | null) => void;
  } | null>(null);

  const requestAccessCode = (): Promise<string | null> => {
    return new Promise(resolve => {
      setAccessCodeResolver({ resolve });
    });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  // When client changes, update title & defaults
  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setTitle(`${client.name} Carousel - ${defaultDateStr}`);
      setStrictness(client.defaultStrictness);
      setLanguageVariant(client.languageVariant);
    }
  };

  // Clipboard paste support (FR-14)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = event => {
              const result = event.target?.result as string;
              if (result) {
                setSlides(prev => [
                  ...prev,
                  {
                    id: `slide_paste_${Date.now()}`,
                    name: `Pasted_Slide_${prev.length + 1}.png`,
                    dataUrl: result,
                    size: blob.size,
                    mimeType: blob.type,
                  },
                ]);
              }
            };
            reader.readAsDataURL(blob);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Process files (PNG, JPEG, PDF)
  const processFiles = async (fileList: FileList | File[]) => {
    setErrorMessage(null);
    const filesArray = Array.from(fileList);

    if (slides.length + filesArray.length > 30) {
      setErrorMessage('Up to 30 slides allowed per check. Please reduce file count.');
      return;
    }

    setIsProcessing(true);

    try {
      const newSlides: UploadedSlide[] = [];

      for (const file of filesArray) {
        // Validate size (< 20MB per file)
        if (file.size > 20 * 1024 * 1024) {
          setErrorMessage(`File "${file.name}" is over the 20MB limit.`);
          continue;
        }

        // PDF Handling (FR-03: split into per-page images)
        if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
          try {
            const pdfjsLib = await import('pdfjs-dist');
            // Configure worker
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
              if (slides.length + newSlides.length >= 30) break;

              const page = await pdf.getPage(pageNum);
              const viewport = page.getViewport({ scale: 1.5 });
              const canvas = document.createElement('canvas');
              canvas.width = viewport.width;
              canvas.height = viewport.height;
              const ctx = canvas.getContext('2d');

              if (ctx) {
                await page.render({ canvasContext: ctx, viewport }).promise;
                newSlides.push({
                  id: `pdf_${Date.now()}_p${pageNum}`,
                  name: `${file.name.replace('.pdf', '')}_Page_${pageNum}.png`,
                  dataUrl: canvas.toDataURL('image/png'),
                  size: file.size / pdf.numPages,
                  mimeType: 'image/png',
                });
              }
            }
          } catch (pdfErr) {
            console.error('PDF rendering fallback:', pdfErr);
            setErrorMessage(`Could not read PDF "${file.name}". Please export pages as PNG or JPEG.`);
          }
        } else if (file.type.startsWith('image/')) {
          // Standard Image file
          await new Promise<void>(resolve => {
            const reader = new FileReader();
            reader.onload = ev => {
              const dataUrl = ev.target?.result as string;
              if (dataUrl) {
                newSlides.push({
                  id: `img_${Date.now()}_${Math.random()}`,
                  name: file.name,
                  dataUrl,
                  size: file.size,
                  mimeType: file.type || 'image/png',
                });
              }
              resolve();
            };
            reader.readAsDataURL(file);
          });
        } else {
          setErrorMessage(`Unsupported format "${file.name}". Please use PNG, JPEG, or PDF.`);
        }
      }

      // Natural filename sorting (FR-04)
      newSlides.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
      );

      setSlides(prev => [...prev, ...newSlides]);
    } catch (err) {
      console.error('Error processing files:', err);
      setErrorMessage('Failed to process one or more files.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeSlide = (index: number) => {
    setSlides(prev => prev.filter((_, i) => i !== index));
  };

  const moveSlide = (from: number, to: number) => {
    if (to < 0 || to >= slides.length) return;
    setSlides(prev => {
      const copy = [...prev];
      const item = copy.splice(from, 1)[0];
      copy.splice(to, 0, item);
      return copy;
    });
  };

  // Preset Loaders
  const loadApexSample = () => {
    const sample = generateSampleApexCarousel();
    setSlides(
      sample.map((s, idx) => ({
        id: `sample_apex_${idx}`,
        name: s.name,
        dataUrl: s.imageUrl,
        size: 85000,
        mimeType: 'image/png',
      }))
    );
    setSelectedClientId('client_apex');
    setTitle(`Apex Capital Series A Announcement - ${defaultDateStr}`);
  };

  const loadCleanSample = () => {
    const sample = generateSampleCleanCarousel();
    setSlides(
      sample.map((s, idx) => ({
        id: `sample_clean_${idx}`,
        name: s.name,
        dataUrl: s.imageUrl,
        size: 75000,
        mimeType: 'image/png',
      }))
    );
    setSelectedClientId('client_horode');
    setTitle(`Horode Studio Identity Showcase - ${defaultDateStr}`);
  };

  // Submit & Start Check
  const handleStartCheck = async () => {
    if (slides.length === 0) {
      setErrorMessage('Please add at least one slide.');
      return;
    }

    const client = clients.find(c => c.id === selectedClientId) || clients[0];
    const checkId = `chk_${Date.now()}`;

    const newSlidesData: SlideData[] = slides.map((s, idx) => ({
      id: `s_${checkId}_${idx + 1}`,
      checkId,
      position: idx + 1,
      name: s.name,
      imageUrl: s.dataUrl,
      status: 'pending',
      unreadableRegions: [],
      issues: [],
    }));

    const newCheck: CheckRecord = {
      id: checkId,
      clientId: client.id,
      clientName: client.name,
      title: title.trim() || `${client.name} Check - ${defaultDateStr}`,
      strictness,
      languageVariant,
      status: 'analyzing',
      slideCount: slides.length,
      issueCount: 0,
      resolvedCount: 0,
      createdAt: new Date().toISOString(),
      slides: newSlidesData,
      crossSlideIssues: [],
    };

    // Save initial check record
    store.addCheck(newCheck);

    // Navigate to results page immediately to show progressive loading (M3)
    onCheckCreated(checkId);

    // Asynchronously trigger server-side analysis
    runServerAnalysis(checkId, newSlidesData, client, strictness, languageVariant);
  };

  // Run async progressive analysis
  const runServerAnalysis = async (
    checkId: string,
    initialSlides: SlideData[],
    client: any,
    strictLevel: StrictnessLevel,
    langVariant: LanguageVariant
  ) => {
    const dictionaryTerms = store.getDictionaryForClient(client.id);
    const ignoreRules = store.getIgnoreRulesForClient(client.id);

    const completedSlides: SlideData[] = [...initialSlides];

    // Analyze each slide with concurrency limit
    for (let i = 0; i < initialSlides.length; i++) {
      const slide = initialSlides[i];

      // Mark slide as reading
      slide.status = 'reading';
      store.updateCheck(checkId, { slides: [...completedSlides] });

      try {
        // Compress to ~150-250KB JPEG to stay well within Vercel's 4.5MB limit
        const optimizedImage = await compressImageForAnalysis(slide.imageUrl);

        const response = await fetchWithAccessCode(
          '/api/analyze-slide',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: optimizedImage,
              mimeType: 'image/jpeg',
              strictness: strictLevel,
              languageVariant: langVariant,
              dictionaryTerms,
              ignoreRules,
              slidePosition: slide.position,
            }),
          },
          requestAccessCode
        );

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
        slide.status = 'done';
        slide.slideText = data.slide_text || '';
        slide.unreadableRegions = data.unreadable_regions || [];
        slide.issues = (data.issues || []).map((iss: any) => ({
          ...iss,
          slideId: slide.id,
          slidePosition: slide.position,
        }));
      } catch (err: any) {
        console.warn(`Slide ${slide.position} analysis failed:`, err);
        slide.status = 'failed';
        slide.errorMessage = err?.message || "This slide didn't finish. Try again.";
      }

      completedSlides[i] = { ...slide };
      store.updateCheck(checkId, { slides: [...completedSlides] });
    }

    // Cross-slide analysis pass
    const doneSlides = completedSlides.filter(s => s.status === 'done' && s.slideText);
    let crossIssues: any[] = [];

    if (doneSlides.length >= 2) {
      try {
        const crossRes = await fetchWithAccessCode(
          '/api/analyze-cross-slide',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              slides: doneSlides.map(s => ({
                position: s.position,
                text: s.slideText,
              })),
              strictness: strictLevel,
              languageVariant: langVariant,
              dictionaryTerms,
              ignoreRules,
            }),
          },
          requestAccessCode
        );

        if (crossRes.ok) {
          const crossData = await crossRes.json();
          crossIssues = (crossData.issues || []).map((iss: any) => ({
            ...iss,
            checkId,
          }));
        }
      } catch (e) {
        console.warn('Cross-slide analysis failed:', e);
      }
    }

    const hasFailed = completedSlides.some(s => s.status === 'failed');
    store.updateCheck(checkId, {
      status: hasFailed ? 'partial' : 'completed',
      slides: completedSlides,
      crossSlideIssues: crossIssues,
      costEstimate: `$${(completedSlides.length * 0.0015).toFixed(4)}`,
    });
  };

  const strictnessDescriptions: Record<StrictnessLevel, string> = {
    relaxed: 'Spelling, repeated words, placeholder text, and cut-off copy.',
    standard: 'Everything in Relaxed, plus grammar, punctuation, and capitalization consistency.',
    strict: 'Everything in Standard, plus awkward phrasing, tone drift, and style suggestions.',
  };

  return (
    <div className="max-w-[800px] mx-auto px-6 py-10 animate-in fade-in duration-150">
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-[#EBEBEB] tracking-tight">
          New check
        </h1>
        <p className="text-[13.5px] text-[#9B9B9B] mt-1">
          Upload exported slides to proofread before client delivery.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-3.5 rounded-[8px] bg-[#3D2224] border border-[#ff8a80]/30 text-[#ff8a80] text-[13px] flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-[12px] underline hover:no-underline ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="space-y-6">
        {/* Title & Client row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-[12.5px] font-medium text-[#9B9B9B] block">
              Check title
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Apex Series A Announcement"
              className="w-full h-10 px-3.5 rounded-[6px] bg-[#252525] border border-[#2F2F2F] text-[13.5px] text-[#EBEBEB] outline-none focus:border-[#2383E2] transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[12.5px] font-medium text-[#9B9B9B] block">
              Client
            </label>
            <select
              value={selectedClientId}
              onChange={e => handleClientChange(e.target.value)}
              className="w-full h-10 px-3 rounded-[6px] bg-[#252525] border border-[#2F2F2F] text-[13.5px] text-[#EBEBEB] outline-none focus:border-[#2383E2] transition-colors cursor-pointer"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Strictness Control (7.6) */}
        <div className="space-y-2">
          <label className="text-[12.5px] font-medium text-[#9B9B9B] block">
            Strictness level
          </label>
          <div className="grid grid-cols-3 p-1 rounded-[8px] bg-[#202020] border border-[#2F2F2F]">
            {(['relaxed', 'standard', 'strict'] as StrictnessLevel[]).map(level => (
              <button
                key={level}
                type="button"
                onClick={() => setStrictness(level)}
                className={`h-8 rounded-[6px] text-[13px] font-medium capitalize transition-colors ${
                  strictness === level
                    ? 'bg-[#252525] text-[#EBEBEB] shadow-xs'
                    : 'text-[#9B9B9B] hover:text-[#EBEBEB]'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
          <p className="text-[12px] text-[#9B9B9B]">
            {strictnessDescriptions[strictness]}
          </p>
        </div>

        {/* Language Variant */}
        <div className="space-y-1.5">
          <label className="text-[12.5px] font-medium text-[#9B9B9B] block">
            Language variant
          </label>
          <div className="flex gap-4 text-[13px]">
            {[
              { id: 'british', label: 'British English' },
              { id: 'american', label: 'American English' },
              { id: 'nigerian', label: 'Nigerian English' },
            ].map(opt => (
              <label key={opt.id} className="flex items-center gap-2 cursor-pointer text-[#EBEBEB]">
                <input
                  type="radio"
                  name="languageVariant"
                  value={opt.id}
                  checked={languageVariant === opt.id}
                  onChange={() => setLanguageVariant(opt.id as LanguageVariant)}
                  className="accent-[#2383E2]"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Dropzone (7.7) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[12.5px] font-medium text-[#9B9B9B] block">
              Slides ({slides.length}/30)
            </label>
            <div className="flex items-center gap-3 text-[12px]">
              <span className="text-[#6F6F6F]">or test sample:</span>
              <button
                type="button"
                onClick={loadApexSample}
                className="text-[#529CCA] hover:underline"
              >
                Apex Carousel
              </button>
              <span className="text-[#6F6F6F]">•</span>
              <button
                type="button"
                onClick={loadCleanSample}
                className="text-[#529CCA] hover:underline"
              >
                Clean Deck
              </button>
            </div>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-[16px] p-8 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-[#2383E2] bg-[#1F3347]/30'
                : 'border-[#2F2F2F] bg-[#252525] hover:bg-[#2C2C2C]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp,application/pdf"
              onChange={e => {
                if (e.target.files) processFiles(e.target.files);
              }}
              className="hidden"
            />

            <div className="text-[14.5px] font-medium text-[#EBEBEB]">
              Drop your slides here, or click to choose files
            </div>
            <div className="text-[12.5px] text-[#9B9B9B] mt-1">
              PNG, JPEG, or PDF. Up to 30 slides. Paste with Ctrl+V supported.
            </div>

            {isProcessing && (
              <div className="mt-4 text-[12.5px] text-[#2383E2] font-medium">
                Reading slides...
              </div>
            )}
          </div>
        </div>

        {/* Thumbnail Strip with reorder (7.7) */}
        {slides.length > 0 && (
          <div className="space-y-2">
            <div className="text-[12px] text-[#9B9B9B]">
              Review order (drag or use arrows to rearrange):
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[320px] overflow-y-auto p-1">
              {slides.map((slide, idx) => (
                <div
                  key={slide.id}
                  className="bg-[#202020] rounded-[8px] border border-[#2F2F2F] overflow-hidden flex flex-col justify-between group"
                >
                  <div className="h-28 bg-[#191919] relative flex items-center justify-center overflow-hidden">
                    <img
                      src={slide.dataUrl}
                      alt={slide.name}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-[4px] bg-black/70 text-[10px] font-mono text-white">
                      #{idx + 1}
                    </div>
                  </div>

                  <div className="p-2 flex items-center justify-between text-[11px] border-t border-[#2F2F2F]/40">
                    <span className="truncate max-w-[90px] text-[#9B9B9B]">
                      {slide.name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => moveSlide(idx, idx - 1)}
                          className="text-[#9B9B9B] hover:text-[#EBEBEB] px-1"
                          title="Move left"
                        >
                          ←
                        </button>
                      )}
                      {idx < slides.length - 1 && (
                        <button
                          type="button"
                          onClick={() => moveSlide(idx, idx + 1)}
                          className="text-[#9B9B9B] hover:text-[#EBEBEB] px-1"
                          title="Move right"
                        >
                          →
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeSlide(idx)}
                        className="text-[#E5675B] hover:underline ml-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4 border-t border-[#2F2F2F] flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="text-[13px] text-[#9B9B9B] hover:text-[#EBEBEB] transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleStartCheck}
            disabled={slides.length === 0 || isProcessing}
            className="h-10 px-6 rounded-[6px] bg-[#2383E2] hover:bg-[#1d73c7] disabled:opacity-50 text-white font-medium text-[13.5px] transition-colors shadow-xs"
          >
            Check slides
          </button>
        </div>
      </div>

      <AccessCodeDialog
        isOpen={accessCodeResolver !== null}
        onContinue={code => {
          accessCodeResolver?.resolve(code);
          setAccessCodeResolver(null);
        }}
        onCancel={() => {
          accessCodeResolver?.resolve(null);
          setAccessCodeResolver(null);
        }}
      />
    </div>
  );
}
