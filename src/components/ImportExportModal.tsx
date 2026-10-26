import React, { useState } from 'react';
import { X, Upload, Sparkles, FileText, AlertCircle, Loader2, Check } from 'lucide-react';
import { MasterResume } from '../types/resume';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportMaster: (resume: MasterResume) => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  onImportMaster,
}) => {
  const [mode, setMode] = useState<'url' | 'pdf' | 'text' | 'upload'>('text');
  const [url, setUrl] = useState('');
  const [rawText, setRawText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleParse = async (content: string, type: 'url' | 'pdf' | 'text') => {
    setIsParsing(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/gemini/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, content }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to parse');
      }

      const parsedMaster: MasterResume = await res.json();
      onImportMaster(parsedMaster);
      onClose();
    } catch (e: any) {
      setErrorMsg(e.message || 'Error parsing. Try a different method.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        handleParse(event.target?.result as string, 'pdf');
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Import & Ingest Master Resume</h3>
              <p className="text-xs text-slate-400">
                Upload your comprehensive source file or paste raw text. Gemini will structure it into your Master Dossier.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-slate-800 pb-2">
            {(['text', 'url', 'upload'] as const).map((m) => (
                <button key={m} onClick={() => setMode(m)} className={`px-3 py-1 text-xs rounded-lg ${mode === m ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                    {m === 'upload' ? 'UPLOAD' : m.toUpperCase()}
                </button>
            ))}
          </div>
          
          {mode === 'url' && (
            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Enter job posting URL" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200" />
          )}

          {mode === 'upload' && (
          <div className="border border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-4 text-center bg-slate-950/50 transition">
            <input type="file" accept=".pdf,.txt,.md,.rtf" onChange={handleFileUpload} className="hidden" id="modal-file-upload" />
            <label htmlFor="modal-file-upload" className="cursor-pointer flex flex-col items-center justify-center space-y-1">
              <FileText className="w-6 h-6 text-indigo-400" />
              <span className="text-xs font-semibold text-slate-200">Choose a file (PDF, TXT, MD, RTF)</span>
            </label>
          </div>
          )}

          {mode === 'text' && (
            <textarea
              rows={6}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste webpage/resume text here..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono leading-relaxed placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex flex-col gap-2">
              <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}</span>
              <div className="border-t border-rose-500/30 pt-2 mt-1">
                  Try another method:
                  <div className="flex gap-2 mt-1">
                      {(['text', 'url', 'pdf'] as const).filter(m => m !== mode).map(m => (
                          <button key={m} onClick={() => {setMode(m); setErrorMsg(null);}} className="text-indigo-400 hover:underline">{m.toUpperCase()}</button>
                      ))}
                  </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
                if (mode === 'url') handleParse(url, 'url');
                else if (mode === 'text') handleParse(rawText, 'text');
                else if (mode === 'upload') handleParse(rawText, 'pdf'); // Using 'pdf' as the backend type for now
            }}
            disabled={isParsing || (mode === 'url' && !url.trim()) || (mode === 'text' && !rawText.trim())}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
          >
            {isParsing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Structuring with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Parse & Ingest into Master Dossier</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
