/**
 * File: src/components/JobIngestion.tsx
 * Description: Job opportunity ingestion interface supporting URL, text, file upload, history selection, 3-tier page budgets, and collapsible Advanced Ingestion Overrides.
 * Author: Luke Frohling
 */

import React, { useState, useEffect } from 'react';
import {
  Upload,
  Sparkles,
  FileText,
  AlertCircle,
  Loader2,
  History,
  Search,
  RefreshCw,
  Link as LinkIcon,
  X,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { MasterResume, TailoredResume } from '../types/resume';
import {
  IngestionOverrides,
  SectionOverrideState,
  createDefaultIngestionOverrides,
} from '../types/ingestion';
import { sanitizeText } from '../utils/sanitizer';

interface JobIngestionProps {
  masterResume?: MasterResume | null;
  onIngestJob: (
    content: string,
    type: 'url' | 'pdf' | 'text',
    industry: string,
    pageBudget?: number,
    overrides?: IngestionOverrides
  ) => Promise<void>;
  onReIngestJob: (
    specificContent?: string,
    pageBudget?: number,
    overrides?: IngestionOverrides
  ) => Promise<void>;
  onSelectHistoryJob: (job: TailoredResume) => void;
  isParsing: boolean;
  errorMsg: string | null;
  history: TailoredResume[];
  initialMode?: 'url' | 'pdf' | 'text' | 'history' | 'upload';
  initialText?: string;
  initialUrl?: string;
  onCancel?: () => void;
  showCancel?: boolean;
  compact?: boolean;
  customTitle?: string;
  customSubtitle?: string;
  targetIndustry?: string;
  onTargetIndustryChange?: (industry: string) => void;
}

type OverrideSectionKey = Exclude<keyof IngestionOverrides, 'emphasisOverride'>;

export const JobIngestion: React.FC<JobIngestionProps> = ({
  masterResume,
  onIngestJob,
  onReIngestJob,
  onSelectHistoryJob,
  isParsing,
  errorMsg,
  history,
  initialMode,
  initialText = '',
  initialUrl = '',
  onCancel,
  showCancel = false,
  compact = false,
  customTitle,
  customSubtitle,
  targetIndustry = '',
  onTargetIndustryChange,
}) => {
  const [mode, setMode] = useState<'url' | 'pdf' | 'text' | 'history' | 'upload'>(initialMode || 'url');
  const [url, setUrl] = useState(initialUrl);
  const [rawText, setRawText] = useState(initialText);
  const [searchTerm, setSearchTerm] = useState('');
  const [localIndustry, setLocalIndustry] = useState(targetIndustry || '');
  const [pageBudget, setPageBudget] = useState<number>(0);
  const [localEmphasis, setLocalEmphasis] = useState<string>('cross_industry_ai');
  const [obscureOldDates, setObscureOldDates] = useState<boolean>(true);

  // Collapsible Advanced Ingestion Overrides state
   
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [overrides, setOverrides] = useState<IngestionOverrides>(createDefaultIngestionOverrides);

  useEffect(() => {
    setLocalIndustry(targetIndustry || '');
  }, [targetIndustry]);

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode]);

  useEffect(() => {
    if (initialText !== undefined) {
      setRawText(initialText);
    }
  }, [initialText]);

  useEffect(() => {
    if (initialUrl !== undefined) {
      setUrl(initialUrl);
    }
  }, [initialUrl]);

  const toggleSectionManualMode = (section: OverrideSectionKey) => {
    setOverrides((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        manualMode: !prev[section].manualMode,
      },
    }));
  };

  const toggleItemFlag = (section: OverrideSectionKey, itemId: string, flag: 'include' | 'exclude') => {
    setOverrides((prev) => {
      const current: SectionOverrideState = prev[section];
      let nextIncluded = [...current.includedIds];
      let nextExcluded = [...current.excludedIds];

      if (flag === 'include') {
        if (nextIncluded.includes(itemId)) {
          nextIncluded = nextIncluded.filter((id) => id !== itemId);
        } else {
          nextIncluded.push(itemId);
          nextExcluded = nextExcluded.filter((id) => id !== itemId);
        }
      } else {
        if (nextExcluded.includes(itemId)) {
          nextExcluded = nextExcluded.filter((id) => id !== itemId);
        } else {
          nextExcluded.push(itemId);
          nextIncluded = nextIncluded.filter((id) => id !== itemId);
        }
      }

      return {
        ...prev,
        [section]: {
          ...current,
          includedIds: nextIncluded,
          excludedIds: nextExcluded,
        },
      };
    });
  };

  const filteredHistory = history.filter(
    (h) =>
      h.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      onIngestJob(sanitizeText(text), 'text', localIndustry, pageBudget, overrides);
    };
    reader.readAsText(file);
  };

  const isReIngestingWithPrefilled = Boolean(
    (mode === 'text' && rawText && rawText === initialText) ||
      (mode === 'url' && url && url === initialUrl)
  );

  const budgetDisplayLabel =
    pageBudget === 0 ? 'Full Version' : pageBudget === 2 ? '2 Pages' : '1 Page';

  // Extract items from Core Profile for Advanced Ingestion Overrides
  const expItems = (masterResume?.experiences || []).map((e) => ({
    id: e.id,
    label: `${e.role} — ${e.company}`,
    sub: `${e.startDate || ''} to ${e.isCurrent ? 'Present' : e.endDate || ''}`,
  }));

  const certItems = (masterResume?.certifications || []).map((c) => ({
    id: c.id,
    label: c.name,
    sub: c.issuer,
  }));

  const trainingItems = (masterResume?.training || []).map((t) => ({
    id: t.id,
    label: t.course,
    sub: `${t.provider}${t.year ? ` (${t.year})` : ''}`,
  }));

  const licenseItems = (masterResume?.licenses || []).map((l) => ({
    id: l.id,
    label: l.name,
    sub: l.authority,
  }));

  const languageCats = (masterResume?.skillCategories || []).filter((c) =>
    c.category.toLowerCase().includes('language')
  );
  const nonLanguageCats = (masterResume?.skillCategories || []).filter(
    (c) => !c.category.toLowerCase().includes('language')
  );

  const skillItems = nonLanguageCats.flatMap((cat) =>
    (cat.skills || []).map((skill) => ({
      id: `${cat.id}::${skill}`,
      label: skill,
      sub: cat.category,
    }))
  );

  const languageItems = languageCats.flatMap((cat) =>
    (cat.skills || []).map((skill) => ({
      id: `${cat.id}::${skill}`,
      label: skill,
      sub: cat.category,
    }))
  );

  const hobbyItems = (masterResume?.milestoneSections || []).map((m) => ({
    id: m.id,
    label: m.title,
    sub: `${(m.items || []).length} highlight(s)`,
  }));
  const renderOverrideSection = (
    sectionKey: OverrideSectionKey,
    title: string,
    items: { id: string; label: string; sub?: string }[]
  ) => {
    const state = overrides[sectionKey];
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-slate-200">{title}</span>
            <span className="text-[10px] text-slate-500 block">
              {state.manualMode
                ? 'Manual Override: Tick 1 = Force Include • Tick 2 = Force Exclude'
                : 'AI Auto-Selection Active'}
            </span>
          </div>
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <span className="text-[10px] font-semibold text-slate-400">
              {state.manualMode ? 'Override' : 'AI Choice'}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={state.manualMode}
              onClick={() => toggleSectionManualMode(sectionKey)}
              className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                state.manualMode ? 'bg-indigo-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                  state.manualMode ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </label>
        </div>

        {state.manualMode && (
          <div className="pt-2 border-t border-slate-800/80 space-y-1.5 max-h-44 overflow-y-auto pr-1">
            {items.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic">No items found in Core Profile for this section.</p>
            ) : (
              <>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold px-1 pb-1">
                  <span>Item</span>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-emerald-400">Include</span>
                    <span className="text-rose-400">Exclude</span>
                  </div>
                </div>
                {items.map((item) => {
                  const isIncluded = state.includedIds.includes(item.id);
                  const isExcluded = state.excludedIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800/70 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <span
                          className={`block truncate font-medium ${
                            isExcluded
                              ? 'line-through text-slate-500'
                              : isIncluded
                              ? 'text-emerald-300'
                              : 'text-slate-200'
                          }`}
                        >
                          {item.label}
                        </span>
                        {item.sub && (
                          <span
                            className={`block truncate text-[10px] ${
                              isExcluded ? 'line-through text-slate-600' : 'text-slate-500'
                            }`}
                          >
                            {item.sub}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-5 shrink-0 pr-1">
                        <input
                          type="checkbox"
                          checked={isIncluded}
                          onChange={() => toggleItemFlag(sectionKey, item.id, 'include')}
                          title="Force Include (even if not directly relevant)"
                          className="rounded border-slate-600 text-emerald-500 focus:ring-0 cursor-pointer"
                        />
                        <input
                          type="checkbox"
                          checked={isExcluded}
                          onChange={() => toggleItemFlag(sectionKey, item.id, 'exclude')}
                          title="Force Exclude (strike out and omit from output)"
                          className="rounded border-slate-600 text-rose-500 focus:ring-0 cursor-pointer"
                        />
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>
    );
  };
  return (
    <div className={compact ? 'space-y-4' : 'bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl'}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-bold text-white text-base">
            {customTitle || 'Ingest / Switch Job Opportunity'}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {customSubtitle || 'Insert a URL, paste job description text, upload a document, or pick from history.'}
          </p>
        </div>
        {showCancel && onCancel && (
          <button
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg border border-slate-800 hover:bg-slate-800 transition flex items-center gap-1 cursor-pointer"
            title="Return to viewing current job"
          >
            <X className="w-3.5 h-3.5" />
            <span>Close</span>
          </button>
        )}
      </div>

      {/* Tabs & Ordered Page Depth Selector (Full -> 2 Pages -> 1 Page) */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-800 pb-2.5 items-center">
        <button
          onClick={() => setMode('url')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
            mode === 'url'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>INSERT URL</span>
        </button>

        <button
          onClick={() => setMode('text')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
            mode === 'text'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>PASTE TEXT</span>
        </button>

        <button
          onClick={() => setMode('upload')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
            mode === 'upload'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>UPLOAD FILE</span>
        </button>

        <select
          value={localIndustry}
          onChange={(e) => {
            setLocalIndustry(e.target.value);
            if (onTargetIndustryChange) onTargetIndustryChange(e.target.value);
          }}
          className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 cursor-pointer"
          title="Optional industry override (leave blank for general tailoring)"
        >
          <option value="">General (No Industry Override)</option>
          <option value="Mining & Industry (Japan)">Mining & Industry (Japan)</option>
          <option value="IT">IT</option>
          <option value="VR / AR">VR / AR</option>
          <option value="Creative">Creative</option>
          <option value="AI">AI</option>
        </select>
        <select
          value={pageBudget}
          onChange={(e) => setPageBudget(Number(e.target.value))}
          className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 cursor-pointer"
          title="Select target resume page length (Full Version -> 2 Pages -> 1 Page)"
        >
          <option value={0}>Full Version (Unlimited)</option>
          <option value={2}>2 Pages (Detailed)</option>
          <option value={1}>1 Page (Concise)</option>
        </select>

        <select
          value={localEmphasis}
          onChange={(e) => {
            const val = e.target.value;
            setLocalEmphasis(val);
            setOverrides((prev) => ({
              ...prev,
              emphasisOverride: { enabled: true, value: val },
            }));
          }}
          className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 cursor-pointer"
          title="Select strategic positioning emphasis"
        >
          <option value="cross_industry_ai">Emphasis: Cross-Industry + Agentic AI</option>
          <option value="technical">Emphasis: Technical</option>
          <option value="leadership">Emphasis: Leadership</option>
          <option value="ai_data">Emphasis: AI & Data</option>
          <option value="scale">Emphasis: Scale</option>
        </select>

        <label className="flex items-center gap-1.5 text-xs text-slate-200 bg-slate-800 border border-slate-700 px-2.5 py-1.5 rounded-lg cursor-pointer select-none">
          <input
            type="checkbox"
            checked={obscureOldDates}
            onChange={(e) => setObscureOldDates(e.target.checked)}
            className="rounded border-slate-600 text-indigo-600 focus:ring-0"
          />
          <span>Obscure Dates &gt;15 Yrs</span>
        </label>

        <button
          onClick={() => setMode('history')}

          className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
            mode === 'history'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>JOB HISTORY ({history.length})</span>
        </button>
      </div>
      {mode === 'url' && (
        <div className="space-y-2">
          <label className="text-xs text-slate-400 block font-medium">Job Posting / Opportunity URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://linkedin.com... or careers page URL"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
          {url.startsWith('http') && (
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>Direct Link recognized</span>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 underline flex items-center gap-1"
              >
                <span>Open target link</span>
              </a>
            </div>
          )}
        </div>
      )}

      {mode === 'text' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-400 block font-medium">Job Description Text / Responsibilities</label>
            {rawText && (
              <button
                onClick={() => setRawText('')}
                className="text-[11px] text-slate-500 hover:text-slate-300 transition"
              >
                Clear text
              </button>
            )}
          </div>
          <textarea
            rows={5}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste complete job description, requirements, and responsibilities..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono leading-relaxed placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />
        </div>
      )}

      {mode === 'upload' && (
        <div className="border border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 text-center bg-slate-950/50 transition">
          <input
            type="file"
            accept=".pdf,.txt,.md,.rtf,.html,.mhtml"
            onChange={handleFileUpload}
            className="hidden"
            id="job-file-upload-input"
          />
          <label
            htmlFor="job-file-upload-input"
            className="cursor-pointer flex flex-col items-center justify-center space-y-2"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-200 block">Choose a job description file</span>
              <span className="text-[11px] text-slate-500">Supports PDF, TXT, MD, RTF, HTML, MHTML</span>
            </div>
          </label>
        </div>
      )}

      {mode === 'history' && (
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search previous ingested jobs..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="max-h-56 overflow-y-auto bg-slate-950 border border-slate-800 rounded-xl divide-y divide-slate-850">
            {filteredHistory.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                {history.length === 0
                  ? 'No previous jobs in history yet. Use "INSERT URL" or "PASTE TEXT" to ingest your first role.'
                  : 'No jobs match your search filter.'}
              </div>
            ) : (
              filteredHistory
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((job) => (
                  <button
                    key={job.id}
                    onClick={() => onSelectHistoryJob(job)}
                    className="w-full text-left px-3 py-2.5 text-xs text-slate-300 hover:bg-slate-800/80 transition flex items-center justify-between group cursor-pointer"
                  >
                    <div className="truncate pr-2">
                      <span className="font-semibold text-white group-hover:text-indigo-300 transition">
                        {job.companyName}
                      </span>
                      <span className="text-slate-400 block truncate text-[11px]">{job.jobTitle}</span>
                      <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                        {new Date(job.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {job.atsAnalysis && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 shrink-0">
                        {job.atsAnalysis.matchScore}% ATS
                      </span>
                    )}
                  </button>
                ))
            )}
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {mode !== 'history' && (
        <div className="space-y-2.5 pt-1">
          <button
            onClick={() => {
              const mergedOverrides = {
                ...overrides,
                emphasisOverride: { enabled: true, value: localEmphasis },
                obscureOldDates,
              } as any;
              if (mode === 'url') onIngestJob(url, 'url', localIndustry, pageBudget, mergedOverrides);
              else if (mode === 'text') onIngestJob(rawText, 'text', localIndustry, pageBudget, mergedOverrides);
              else if (mode === 'upload') onIngestJob(rawText, 'text', localIndustry, pageBudget, mergedOverrides);
            }}

            disabled={isParsing || (mode === 'url' && !url.trim()) || (mode === 'text' && !rawText.trim())}
            className="w-full px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
          >
            {isParsing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Structuring with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>
                  {isReIngestingWithPrefilled
                    ? `Re-Ingest & Re-Tailor (${budgetDisplayLabel})`
                    : `Ingest & Tailor (${budgetDisplayLabel})`}
                </span>
              </>
            )}
          </button>

          <button
            onClick={async () => {
              const activeContent = mode === 'url' ? url : rawText;
              if (
                window.confirm(
                  'Are you sure you want to re-ingest this role? This will refresh tailored documents for this target job.'
                )
              ) {
                const mergedOverrides = {
                  ...overrides,
                  emphasisOverride: { enabled: true, value: localEmphasis },
                  obscureOldDates,
                } as any;
                await onReIngestJob(activeContent || undefined, pageBudget, mergedOverrides);

              }
            }}
            disabled={isParsing}
            className="w-full px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isParsing ? 'animate-spin' : ''}`} />
            <span>Re-Ingest Role</span>
          </button>

          {/* COLLAPSIBLE ADVANCED INGESTION OVERRIDES */}
          <div className="pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-xl text-xs font-semibold text-indigo-300 transition cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                <span>Advanced Ingestion Overrides (Optional)</span>
              </span>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAdvanced && (
              <div className="mt-2.5 p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Leave switches on <strong className="text-slate-200">AI Choice</strong> for automatic selection, or flip any switch to <strong className="text-indigo-300">Override</strong> to force-include or strike-out specific items.
                </p>

                {/* (a) Emphasis Override Switch + Dropdown */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-slate-200">Strategic Emphasis</span>
                      <span className="text-[10px] text-slate-500 block">
                        {overrides.emphasisOverride.enabled
                          ? 'Manual Emphasis Selected'
                          : 'Default Technical / AI Balance'}
                      </span>
                    </div>
                    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                      <span className="text-[10px] font-semibold text-slate-400">
                        {overrides.emphasisOverride.enabled ? 'Override' : 'AI Choice'}
                      </span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={overrides.emphasisOverride.enabled}
                        onClick={() =>
                          setOverrides((prev) => ({
                            ...prev,
                            emphasisOverride: {
                              ...prev.emphasisOverride,
                              enabled: !prev.emphasisOverride.enabled,
                            },
                          }))
                        }
                        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          overrides.emphasisOverride.enabled ? 'bg-indigo-600' : 'bg-slate-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                            overrides.emphasisOverride.enabled ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </label>
                  </div>

                  {overrides.emphasisOverride.enabled && (
                    <select
                      value={overrides.emphasisOverride.value}
                      onChange={(e) =>
                        setOverrides((prev) => ({
                          ...prev,
                          emphasisOverride: { ...prev.emphasisOverride, value: e.target.value },
                        }))
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 cursor-pointer"
                    >
                      <option value="cross_industry_ai">Cross-Industry Leader + Agentic AI</option>
                      <option value="technical">Technical & Architecture</option>
                      <option value="ai_data">AI & Data</option>
                      <option value="leadership">Leadership & Operations</option>
                      <option value="scale">Scale & Delivery</option>
                    </select>
                  )}
                </div>

                {/* (b) Certifications, Dev/Training, Licenses & Skills */}
                {renderOverrideSection('certifications', 'Certifications', certItems)}
                {renderOverrideSection('training', 'Dev & Training', trainingItems)}
                {renderOverrideSection('licenses', 'Licenses & Accreditations', licenseItems)}
                {renderOverrideSection('skills', 'Technical & Core Skills', skillItems)}

                {/* (c) Languages & Hobbies / Milestones */}
                {renderOverrideSection('languages', 'Languages & Cultural Competency', languageItems)}
                {renderOverrideSection('hobbies', 'Hobbies & Personal Milestones', hobbyItems)}

                {/* (d) Experiences */}
                {renderOverrideSection('experiences', 'Experiences (Roles & Positions)', expItems)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
