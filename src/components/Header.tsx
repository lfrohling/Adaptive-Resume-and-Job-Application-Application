import React, { useState, useRef, useEffect } from 'react';
import {
  FileSpreadsheet,
  Crosshair,
  Sparkles,
  History,
  ShieldCheck,
  Compass,
  Download,
  Upload,
  Layers,
  Folder,
  FileText,
  ChevronDown,
  Building,
  RefreshCw,
  ArrowRight,
  ListChecks
} from 'lucide-react';
import { getLogs } from '../utils/logger';
import { ActiveTab, MasterResume, TailoredResume } from '../types/resume';
import { auth } from '../firebase';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  masterResume?: MasterResume | null;
  hasTailoredResume: boolean;
  unappliedHarvestCount: number;
  onOpenImportModal: () => void;
  onExportJson: () => void;
  onExportTxt?: () => void;
  onExportPdf?: () => void;
  onResetToSample: () => void;
  onOpenDirectoryGuide?: () => void;
  history?: TailoredResume[];
  onSelectResume?: (res: TailoredResume) => void;
  setActiveTailorView?: (view: 'resume' | 'coverletter' | 'qanda' | 'suggestions') => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  masterResume,
  hasTailoredResume,
  unappliedHarvestCount,
  onOpenImportModal,
  onExportJson,
  onExportTxt,
  onExportPdf,
  onResetToSample,
  onOpenDirectoryGuide,
  history = [],
  onSelectResume,
  setActiveTailorView,
}) => {
  const totalBullets = masterResume?.experiences?.reduce((acc, curr) => acc + curr.bullets.length, 0) || 0;
  const totalSkills = masterResume?.skillCategories?.reduce((acc, curr) => acc + curr.skills.length, 0) || 0;

  // Dropdown States
  const [isCoreOpen, setIsCoreOpen] = useState(false);
  const [isAppsOpen, setIsAppsOpen] = useState(false);

  const coreRef = useRef<HTMLDivElement>(null);
  const appsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (coreRef.current && !coreRef.current.contains(event.target as Node)) {
        setIsCoreOpen(false);
      }
      if (appsRef.current && !appsRef.current.contains(event.target as Node)) {
        setIsAppsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getCoreLabel = () => {
    if (activeTab === 'master') return 'Master Career Dossier';
    if (activeTab === 'audit') return 'Master Base Audit & Checkpoints';
    if (activeTab === 'advice') return 'AI Studio vs Perplexity Guide';
    return 'OmniBase Master Center';
  };

  const getAppsLabel = () => {
    if (activeTab === 'tailor') return 'Job Tailor & ATS Studio';
    if (activeTab === 'history') return 'Applications Archive';
    return 'Targeted Applications';
  };

  return (
    <header className="no-print bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo & Dossier Stats */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-white text-xs sm:text-base tracking-tight">OmniBase</span>
                <span className="text-[9px] font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded-full">
                  Resume
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 hidden xs:block">
                {masterResume?.experiences?.length || 0} Roles • {totalBullets} Bullets
              </p>
            </div>
          </div>

          {/* Right quick actions - highly responsive padding, gap, and text hiding */}
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 max-w-full overflow-x-auto py-1 scrollbar-none">
            
            <button
              onClick={async () => {
                  await auth.signOut();
                  localStorage.clear();
                  window.location.href = '/';
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-200 rounded-lg text-xs font-bold border border-rose-500/30 transition shadow-sm cursor-pointer shrink-0"
              title="Logout and change user"
            >
              <RefreshCw className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Logout</span>
            </button>
            
            {/* RESET BASELINE BUTTON - Highly Prominent in the Header */}
            {onResetToSample && (
              <button
                onClick={onResetToSample}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-medium border border-slate-700 transition shadow-sm cursor-pointer shrink-0"
                title="Reset active screen data to static codebase baseline (loads Project 4 & new skills)"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Reset Baseline</span>
              </button>
            )}

            <button
              onClick={onOpenImportModal}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-medium border border-slate-700 transition shadow-sm cursor-pointer shrink-0"
              title="Upload existing resume file or paste raw text to parse with Gemini"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Import</span>
            </button>

            {onExportTxt && (
              <button
                onClick={onExportTxt}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 hover:text-emerald-200 rounded-lg text-xs font-medium border border-emerald-600/40 transition shadow-sm cursor-pointer shrink-0"
                title="Download full canonical Master Truth Document as plain text (*.txt)"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Export Master</span>
                <span>*.TXT</span>
              </button>
            )}
            {onExportPdf && (
              <button
                onClick={onExportPdf}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-200 rounded-lg text-xs font-medium border border-rose-600/40 transition shadow-sm cursor-pointer shrink-0"
                title="Download full canonical Master Truth Document as PDF (*.pdf)"
              >
                <FileText className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Export Master</span>
                <span>*.PDF</span>
              </button>
            )}


            <button
              onClick={onExportJson}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-medium border border-slate-700 transition shadow-sm cursor-pointer shrink-0"
              title="Download Master Dossier as JSON backup"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Export JSON</span>
              <span>JSON</span>
            </button>

            {onOpenDirectoryGuide && (
              <button
                onClick={onOpenDirectoryGuide}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 text-xs font-medium transition shadow-sm cursor-pointer shrink-0"
                title="Manage local save folder (C:\Storage\Google AI Studio - Local Files)"
              >
                <Folder className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden md:inline">Local Folder</span>
                <span className="md:hidden">Folder</span>
              </button>
            )}
            <button
              onClick={() => {
                const logs = getLogs();
                const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'app_logs.json';
                a.click();
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-medium border border-slate-700 transition shadow-sm cursor-pointer shrink-0"
              title="Download application logs"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Logs</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 py-2 border-t border-slate-800/60">
          
          {/* DROPDOWN 1: OMNIBASE MASTER CENTER */}
          <div className="relative" ref={coreRef}>
            <button
              onClick={() => {
                setIsCoreOpen(!isCoreOpen);
                setIsAppsOpen(false);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-bold rounded-xl border transition cursor-pointer select-none ${
                ['master', 'audit', 'advice'].includes(activeTab)
                  ? 'bg-indigo-600/10 text-indigo-300 border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-950/20 border-slate-800/40'
              }`}
            >
              <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />
              <span className="tracking-wide hidden xs:inline">OmniBase Master:</span>
              <span className="text-white font-black truncate max-w-[120px] sm:max-w-none">{getCoreLabel()}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isCoreOpen ? 'rotate-180' : ''}`} />
            </button>

            {isCoreOpen && (
              <div className="absolute left-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 py-1.5 animate-in fade-in slide-in-from-top-1">
                <button
                  onClick={() => {
                    setActiveTab('master');
                    setIsCoreOpen(false);
                  }}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-950/50 transition ${
                    activeTab === 'master' ? 'bg-indigo-600/10 border-l-2 border-indigo-500' : ''
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white">Master Career Dossier</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Manage your central legal history, skills timeline, and verified projects.</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('audit');
                    setIsCoreOpen(false);
                  }}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-950/50 transition ${
                    activeTab === 'audit' ? 'bg-indigo-600/10 border-l-2 border-indigo-500' : ''
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white">Master Base Audit & Checkpoints</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Run quality diagnostics and review free file snapshots & factual drift checks.</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('advice');
                    setIsCoreOpen(false);
                  }}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-950/50 transition ${
                    activeTab === 'advice' ? 'bg-emerald-600/10 border-l-2 border-emerald-500' : ''
                  }`}
                >
                  <Compass className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white">AI Studio vs Perplexity Guide</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Learn prompts, technical configurations, and platform rate constraints.</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* DROPDOWN 2: TARGETED APPLICATIONS */}
          <div className="relative" ref={appsRef}>
            <button
              onClick={() => {
                setIsAppsOpen(!isAppsOpen);
                setIsCoreOpen(false);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-bold rounded-xl border transition cursor-pointer select-none ${
                ['tailor', 'history'].includes(activeTab)
                  ? 'bg-cyan-600/10 text-cyan-300 border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-950/20 border-slate-800/40'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
              <span className="tracking-wide hidden xs:inline">Applications:</span>
              <span className="text-white font-black truncate max-w-[120px] sm:max-w-none">{getAppsLabel()}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isAppsOpen ? 'rotate-180' : ''}`} />
            </button>

            {isAppsOpen && (
              <div className="absolute left-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 py-1.5 max-h-[480px] overflow-y-auto animate-in fade-in slide-in-from-top-1">
                <button
                  onClick={() => {
                    setActiveTab('tailor');
                    setIsAppsOpen(false);
                  }}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-950/50 transition ${
                    activeTab === 'tailor' ? 'bg-cyan-600/10 border-l-2 border-cyan-500' : ''
                  }`}
                >
                  <Crosshair className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white">Tailor New Application (ATS Studio)</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Paste a corporate JD to align metrics and generate PDFs or cover letters.</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('tailor');
                    if (setActiveTailorView) setActiveTailorView('qanda');
                    setIsAppsOpen(false);
                  }}
                  className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-950/50 transition"
                >
                  <ListChecks className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white">Q & A's for Job Applications</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Prepare answers for common application questions.</div>
                  </div>
                </button>


                <button
                  onClick={() => {
                    setActiveTab('history');
                    setIsAppsOpen(false);
                  }}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-950/50 transition ${
                    activeTab === 'history' ? 'bg-cyan-600/10 border-l-2 border-cyan-500' : ''
                  }`}
                >
                  <History className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-white">Browse Applications Archive</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Manage, review, or clear all of your historically tailored resumes ({history.length}).</div>
                  </div>
                </button>

                {history.length > 0 && (
                  <div className="border-t border-slate-800/80 my-1">
                    <div className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Recently Saved Applications
                    </div>
                    {[...history].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5).map((item) => {
                      const dateObj = new Date(item.createdAt);
                      const dateStr = dateObj.toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                      });
                      const timeStr = dateObj.toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit',
                      });
                      return (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (onSelectResume) {
                            onSelectResume(item);
                          }
                          setIsAppsOpen(false);
                        }}
                        className="w-full flex items-start gap-2.5 px-4 py-2 text-left hover:bg-slate-950/50 transition text-xs"
                      >
                        <Building className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                        <div className="truncate w-full">
                          <div className="text-xs font-semibold text-slate-200 truncate">{item.jobTitle}</div>
                          <div className="text-[10px] text-slate-400 flex flex-col mt-0.5">
                            <span className="font-bold text-indigo-400">{item.companyName}</span>
                            <span className="text-cyan-400 font-bold">{item.atsAnalysis?.matchScore}% ATS</span>
                            <span className="text-[9px] text-slate-500">{dateStr} at {timeStr}</span>
                          </div>
                        </div>
                      </button>
                    )})}
                    {history.length > 5 && (
                      <button
                        onClick={() => {
                          setActiveTab('history');
                          setIsAppsOpen(false);
                        }}
                        className="w-full text-center py-2 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 hover:bg-slate-950/40 transition flex items-center justify-center gap-1 border-t border-slate-800/60 mt-1"
                      >
                        <span>View All {history.length} Saved Applications</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* TAB 3: TO DO LIST */}
          <button
            onClick={() => {
              setActiveTab('todo');
              setIsCoreOpen(false);
              setIsAppsOpen(false);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-bold rounded-xl border transition cursor-pointer select-none ${
              activeTab === 'todo'
                ? 'bg-amber-600/10 text-amber-300 border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 bg-slate-950/20 border-slate-800/40'
            }`}
          >
            <ListChecks className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            <span>To Do List</span>
          </button>

        </div>
      </div>
    </header>
  );
};
