import React, { useState, useEffect } from 'react';
import { Upload, Sparkles, FileText, AlertCircle, Loader2, History, Search, RefreshCw, Link as LinkIcon, X } from 'lucide-react';
import { TailoredResume } from '../types/resume';

interface JobIngestionProps {
  onIngestJob: (content: string, type: 'url' | 'pdf' | 'text') => Promise<void>;
  onReIngestJob: (specificContent?: string) => Promise<void>;
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
}

export const JobIngestion: React.FC<JobIngestionProps> = ({
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
}) => {
  const [mode, setMode] = useState<'url' | 'pdf' | 'text' | 'history' | 'upload'>(initialMode || 'url');
  const [url, setUrl] = useState(initialUrl);
  const [rawText, setRawText] = useState(initialText);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredHistory = history.filter((h) =>
    h.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      onIngestJob(event.target?.result as string, 'text');
    };
    reader.readAsText(file);
  };

  const isReIngestingWithPrefilled = Boolean(
    (mode === 'text' && rawText && rawText === initialText) ||
    (mode === 'url' && url && url === initialUrl)
  );

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

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-800 pb-2.5">
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

        <button
          onClick={() => setMode('history')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
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
            placeholder="https://www.linkedin.com/jobs/view/... or careers page URL"
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
        <div className="space-y-2 pt-1">
          <button
            onClick={() => {
              if (mode === 'url') onIngestJob(url, 'url');
              else if (mode === 'text') onIngestJob(rawText, 'text');
              else if (mode === 'upload') onIngestJob(rawText, 'text');
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
                  {isReIngestingWithPrefilled ? 'Re-Ingest & Re-Tailor Resume' : 'Ingest & Tailor Resume'}
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
                await onReIngestJob(activeContent || undefined);
              }
            }}
            disabled={isParsing}
            className="w-full px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isParsing ? 'animate-spin' : ''}`} />
            <span>Re-Ingest Role</span>
          </button>
        </div>
      )}
    </div>
  );
};
