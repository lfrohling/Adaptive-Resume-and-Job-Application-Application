/**
 * File: src/components/TailorStudio.tsx
 * Description: Manages target job ingestion, tailoring controls (page depth, target industry, emphasis positioning, and 15-year date obscuring), and document preview rendering.
 * Author: Luke Frohling
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Target,
  CheckCircle2,
  Loader2,
  FolderSync,
  RefreshCw,
  Check,
} from 'lucide-react';
import { MasterResume, TailoredResume, TailoredResumeVariant, HarvestSuggestion } from '../types/resume';
import { IngestionOverrides } from '../types/ingestion';

import { ResumeDocument } from './ResumeDocument';
import { QAStudio } from './QAStudio';
import { JobIngestion } from './JobIngestion';

interface TailorStudioProps {
  masterResume: MasterResume;
  tailoredResume: TailoredResume | null;
  onSetTailoredResume: (res: TailoredResume) => void;
  onApplyHarvestItem: (item: HarvestSuggestion) => void;
  onApplyAllHarvest: (items: HarvestSuggestion[]) => void;
  onSaveToHistory: (res: TailoredResume) => void;
  onAutoResetTruth?: () => MasterResume;
  onReIngestJob: (specificContent?: string, pageBudget?: number, overrides?: IngestionOverrides) => Promise<void>;
  onIngestJob: (content: string, type: 'url' | 'pdf' | 'text', industry: string, pageBudget?: number, overrides?: IngestionOverrides) => Promise<void>;
  isJobParsing: boolean;
  jobParseError: string | null;
  history: TailoredResume[];
  onSelectHistoryJob: (job: TailoredResume) => void;
  defaultActiveView?: 'resume' | 'coverletter' | 'qanda' | 'suggestions';
  onSaveQA: (pairs: { id: string; question: string; answer: string }[]) => void;
}

export const TailorStudio: React.FC<TailorStudioProps> = ({
  masterResume,
  tailoredResume,
  onSetTailoredResume,
  onApplyHarvestItem,
  onApplyAllHarvest,
  onSaveToHistory,
  onReIngestJob,
  onIngestJob,
  isJobParsing,
  jobParseError,
  history,
  onSelectHistoryJob,
  defaultActiveView = 'resume',
  onSaveQA,
}) => {
  const [controls, setControls] = useState<{
    resume: { pageBudget: number; emphasis: string; obscureOldDates: boolean };
    coverletter: { pageBudget: number; emphasis: string; obscureOldDates: boolean };
  }>({
    resume: { pageBudget: 0, emphasis: 'technical', obscureOldDates: true },
    coverletter: { pageBudget: 0, emphasis: 'technical', obscureOldDates: true },
  });

  const [targetIndustry, setTargetIndustry] = useState<string>('');
  const [activeView, setActiveView] = useState<'resume' | 'coverletter' | 'qanda' | 'suggestions'>(defaultActiveView);

  useEffect(() => {
    setActiveView(defaultActiveView);
  }, [defaultActiveView]);

  const handleSetActiveView = (view: 'resume' | 'coverletter' | 'qanda' | 'suggestions') => {
    setActiveView(view);
  };

  const activeDoc = activeView === 'coverletter' ? 'cover_letter' : 'resume';
  const currentViewKey: 'resume' | 'coverletter' = activeView === 'coverletter' ? 'coverletter' : 'resume';
  const activeControls = controls[currentViewKey];

  const [isGeneratingVariant, setIsGeneratingVariant] = useState(false);
  const [variantStatusMsg, setVariantStatusMsg] = useState<string | null>(null);

  const [isJobEntryOpen, setIsJobEntryOpen] = useState(false);
  const [jobEntryMode, setJobEntryMode] = useState<'url' | 'pdf' | 'text' | 'history' | 'upload'>('history');
  const [jobEntryInitialText, setJobEntryInitialText] = useState('');
  const [jobEntryInitialUrl, setJobEntryInitialUrl] = useState('');

  const [generatedParams, setGeneratedParams] = useState<{
    resume: { pageBudget: number; targetIndustry: string; emphasis: string };
    coverletter: { pageBudget: number; targetIndustry: string; emphasis: string };
  }>({
    resume: { pageBudget: 1, targetIndustry: '', emphasis: 'technical' },
    coverletter: { pageBudget: 1, targetIndustry: '', emphasis: 'technical' },
  });

  useEffect(() => {
    if (tailoredResume) {
      setIsJobEntryOpen(false);
      const syncedBudget = tailoredResume.pageBudget !== undefined ? Number(tailoredResume.pageBudget) : 0;

      const syncedIndustry = tailoredResume.targetIndustry || '';
      const syncedEmphasis = (tailoredResume as any).emphasis || 'cross_industry_ai';
      const syncedObscure = (tailoredResume as any).obscureOldDates ?? true;

      setTargetIndustry(syncedIndustry);
      setControls({
        resume: { pageBudget: syncedBudget, emphasis: syncedEmphasis, obscureOldDates: syncedObscure },
        coverletter: { pageBudget: syncedBudget, emphasis: syncedEmphasis, obscureOldDates: syncedObscure },
      });

      setGeneratedParams({
        resume: { pageBudget: syncedBudget, targetIndustry: syncedIndustry, emphasis: syncedEmphasis },
        coverletter: { pageBudget: syncedBudget, targetIndustry: syncedIndustry, emphasis: syncedEmphasis },
      });
    }
  }, [tailoredResume?.id]);

  const handleUseDifferentJob = () => {
    setIsJobEntryOpen(true);
    setJobEntryMode('history');
    setJobEntryInitialText('');
    setJobEntryInitialUrl('');
  };

  const handleReIngestRole = () => {
    if (!tailoredResume) return;
    const jd = tailoredResume.targetJD || '';
    const isUrl = jd.trim().startsWith('http://') || jd.trim().startsWith('https://');
    setIsJobEntryOpen(true);
    setJobEntryMode(isUrl ? 'url' : 'text');
    if (isUrl) {
      setJobEntryInitialUrl(jd);
      setJobEntryInitialText('');
    } else {
      setJobEntryInitialText(jd);
      setJobEntryInitialUrl('');
    }
  };

  const applyCachedVariantIfAvailable = (
    viewKey: 'resume' | 'coverletter',
    nextBudget: number,
    nextIndustry: string,
    nextEmphasis: string
  ) => {
    if (!tailoredResume?.variants) return false;
    const cacheKey = `${viewKey}_${nextBudget}_${nextIndustry || 'default'}_${nextEmphasis}`;
    const legacyKey = String(nextBudget);
    const cached =
      tailoredResume.variants[cacheKey] ||
      ((nextIndustry || '') === (tailoredResume.targetIndustry || '') && nextEmphasis === 'technical'
        ? tailoredResume.variants[legacyKey]
        : undefined);

    if (cached) {
      const updated: TailoredResume = {
        ...tailoredResume,
        pageBudget: nextBudget,
        targetIndustry: nextIndustry,
        executiveSummary: cached.executiveSummary || tailoredResume.executiveSummary,
        coverLetter: cached.coverLetter || tailoredResume.coverLetter,
        selectedSkills: cached.selectedSkills || tailoredResume.selectedSkills,
        experiences: cached.experiences || tailoredResume.experiences,
        projects: cached.projects || tailoredResume.projects,
      };
      onSetTailoredResume(updated);
      setGeneratedParams((prev) => ({
        ...prev,
        [viewKey]: { pageBudget: nextBudget, targetIndustry: nextIndustry, emphasis: nextEmphasis },
      }));
      setVariantStatusMsg(
        `Switched instantly to cached ${nextBudget}-Page ${viewKey === 'coverletter' ? 'Cover Letter' : 'Resume'} (${nextIndustry || 'General'}, ${nextEmphasis}) — 0 API tokens used.`
      );
      setTimeout(() => setVariantStatusMsg(null), 2800);
      return true;
    }
    return false;
  };

  const updateControls = (key: 'pageBudget' | 'emphasis' | 'obscureOldDates', value: any) => {
    const nextBudget = key === 'pageBudget' ? Number(value) : activeControls.pageBudget;
    const nextEmphasis = key === 'emphasis' ? String(value) : activeControls.emphasis;
    const nextObscure = key === 'obscureOldDates' ? Boolean(value) : activeControls.obscureOldDates;

    setControls((prev) => ({
      ...prev,
      [currentViewKey]: {
        pageBudget: nextBudget,
        emphasis: nextEmphasis,
        obscureOldDates: nextObscure,
      },
    }));

    if (key !== 'obscureOldDates') {
      applyCachedVariantIfAvailable(currentViewKey, nextBudget, targetIndustry, nextEmphasis);
    }
  };

  const handleIndustryDropdownChange = (newIndustry: string) => {
    setTargetIndustry(newIndustry);
    applyCachedVariantIfAvailable(currentViewKey, activeControls.pageBudget, newIndustry, activeControls.emphasis);
  };

  const handleSwitchPageBudget = (targetBudget: number) => {
    updateControls('pageBudget', targetBudget);
  };

  const handleReTailor = async (
    viewKey: 'resume' | 'coverletter',
    targetParams: { pageBudget: number; targetIndustry: string; emphasis: string }
  ) => {
    if (!tailoredResume) return;
    const cacheKey = `${viewKey}_${targetParams.pageBudget}_${targetParams.targetIndustry || 'default'}_${targetParams.emphasis}`;

    if (applyCachedVariantIfAvailable(viewKey, targetParams.pageBudget, targetParams.targetIndustry, targetParams.emphasis)) {
      return;
    }

    if (isGeneratingVariant) return;

    setIsGeneratingVariant(true);
    setVariantStatusMsg(
      `Synthesising ${viewKey === 'coverletter' ? 'Cover Letter' : 'Resume'} (${targetParams.pageBudget}-Page, ${targetParams.targetIndustry || 'General'}, ${targetParams.emphasis}) via AI...`
    );

    const targetBudget = targetParams.pageBudget;
    const isOnePage = targetBudget === 1;
    const effectiveJD =
      tailoredResume.targetJD?.trim() ||
      `Target Role: ${tailoredResume.jobTitle || 'Executive Position'} at ${tailoredResume.companyName || 'Target Organization'}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      try {
        const res = await fetch('/api/gemini/tailor-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            masterResume,
            jobPosting: effectiveJD.slice(0, 3500),
            jobTitle: tailoredResume.jobTitle || 'Target Role',
            companyName: tailoredResume.companyName || 'Target Company',
            pageBudget: targetBudget,
            tone: 'executive',
            targetIndustry: targetParams.targetIndustry,
            emphasis: targetParams.emphasis,
          }),
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          const data: TailoredResume = await res.json();
          const newVariant: TailoredResumeVariant = data.variants?.[targetBudget] || {
            executiveSummary: data.executiveSummary,
            coverLetter: data.coverLetter,
            selectedSkills: data.selectedSkills,
            experiences: data.experiences,
            projects: data.projects,
            atsAnalysis: data.atsAnalysis,
            pageBudget: targetBudget,
            targetIndustry: targetParams.targetIndustry,
            emphasis: targetParams.emphasis,
          };

          const initialCacheKey = `${viewKey}_${generatedParams[viewKey].pageBudget}_${generatedParams[viewKey].targetIndustry || 'default'}_${generatedParams[viewKey].emphasis}`;
          const existingVariants = { ...(tailoredResume.variants || {}) };
          if (!existingVariants[initialCacheKey]) {
            existingVariants[initialCacheKey] = {
              executiveSummary: tailoredResume.executiveSummary,
              coverLetter: tailoredResume.coverLetter,
              selectedSkills: tailoredResume.selectedSkills,
              experiences: tailoredResume.experiences,
              projects: tailoredResume.projects,
              atsAnalysis: tailoredResume.atsAnalysis,
              pageBudget: generatedParams[viewKey].pageBudget,
              targetIndustry: generatedParams[viewKey].targetIndustry,
              emphasis: generatedParams[viewKey].emphasis,
            };
          }

          const updated: TailoredResume = {
            ...tailoredResume,
            pageBudget: targetBudget,
            targetIndustry: targetParams.targetIndustry,
            executiveSummary: newVariant.executiveSummary,
            coverLetter: newVariant.coverLetter || tailoredResume.coverLetter,
            selectedSkills: newVariant.selectedSkills,
            experiences: newVariant.experiences,
            projects: newVariant.projects,
            variants: {
              ...existingVariants,
              [cacheKey]: newVariant,
              [targetBudget]: newVariant,
            },
          };

          onSetTailoredResume(updated);
          onSaveToHistory(updated);
          setGeneratedParams((prev) => ({ ...prev, [viewKey]: targetParams }));
          setVariantStatusMsg(`Generated and saved ${targetBudget}-Page variant to history!`);
          setTimeout(() => setVariantStatusMsg(null), 3500);
          return;
        }
      } catch (fetchErr: any) {
        clearTimeout(timeoutId);
        console.warn('AI generation timed out or network error, applying structured synthesis fallback:', fetchErr?.message);
      }

      const rawSkills = (masterResume.skillCategories || []).map((cat) => ({
        category: cat.category,
        skills: isOnePage ? cat.skills.slice(0, 5) : cat.skills,
      }));
      const selectedSkills = isOnePage ? rawSkills.slice(0, 3) : rawSkills;

      const experiences = (masterResume.experiences || []).slice(0, isOnePage ? 3 : 6).map((exp) => ({
        company: exp.company,
        role: exp.role,
        location: exp.location,
        period: `${exp.startDate} - ${exp.isCurrent ? 'Present' : exp.endDate}`,
        bullets: (exp.bullets || []).slice(0, isOnePage ? 3 : 5).map((b: any) => (typeof b === 'string' ? b : b.text || '')),
        technologies: exp.technologies || [],
      }));

      const projects = (masterResume.projects || []).slice(0, isOnePage ? 2 : 4).map((p) => ({
        name: p.name,
        role: p.role,
        period: p.period,
        bullets: (p.bullets || []).slice(0, isOnePage ? 2 : 3).map((b: any) => (typeof b === 'string' ? b : b.text || '')),
        technologies: p.technologies || [],
      }));

      const executiveSummary = isOnePage
        ? tailoredResume.executiveSummary || masterResume.executiveSummaries?.[0]?.text?.slice(0, 280) || ''
        : masterResume.executiveSummaries?.[0]?.text || tailoredResume.executiveSummary || '';

      const availableLinks: { url: string; desc: string }[] = [];
      if (masterResume.contact?.website) {
        availableLinks.push({ url: masterResume.contact.website, desc: 'Personal Portfolio' });
      }
      if (masterResume.contact?.linkedin) {
        availableLinks.push({ url: masterResume.contact.linkedin, desc: 'Professional Profile' });
      }
      (masterResume.projects || []).forEach((p) => {
        if (p.link && (p.link.startsWith('http') || p.link.includes('.')) && !p.link.includes('PASTE_YOUR')) {
          const fullUrl = p.link.startsWith('http') ? p.link : `https://${p.link}`;
          availableLinks.push({ url: fullUrl, desc: p.name.split(' ').slice(0, 3).join(' ') });
        }
      });
      const selectedLinks = availableLinks.slice(0, 3);
      const linksBlock =
        selectedLinks.length > 0 ? `\n\n${selectedLinks.map((l) => `${l.url} (${l.desc})`).join('\n')}` : '';

      const fallbackCoverLetter =
        tailoredResume.coverLetter ||
        (isOnePage
          ? `Dear Hiring Team,\n\nI am writing to express my strong interest in the ${tailoredResume.jobTitle || 'Target Position'} role at ${tailoredResume.companyName || 'your organisation'}. With proven expertise delivering high-velocity technical outcomes, I specialise in translating strategic vision into resilient execution.\n\nThank you for considering my application.${linksBlock}\n\nSincerely,\n${masterResume.contact?.fullName || 'Candidate'}`
          : `Dear Hiring Team at ${tailoredResume.companyName || 'Hiring Organisation'},\n\nI am writing to express my enthusiastic interest in the ${tailoredResume.jobTitle || 'Executive Position'} role. With over a decade of dedicated professional experience leading complex technology transformations, I have consistently steered initiatives that enhance operational scale, system reliability, and product-led growth.\n\nThank you for your time and consideration.${linksBlock}\n\nSincerely,\n${masterResume.contact?.fullName || 'Candidate'}`);

      const synthesizedVariant: TailoredResumeVariant = {
        executiveSummary,
        coverLetter: fallbackCoverLetter,
        selectedSkills,
        experiences,
        projects,
        pageBudget: targetBudget,
        targetIndustry: targetParams.targetIndustry,
        emphasis: targetParams.emphasis,
      };

      const fallbackUpdated: TailoredResume = {
        ...tailoredResume,
        pageBudget: targetBudget,
        targetIndustry: targetParams.targetIndustry,
        executiveSummary,
        coverLetter: fallbackCoverLetter,
        selectedSkills,
        experiences,
        projects,
        variants: {
          ...(tailoredResume.variants || {}),
          [cacheKey]: synthesizedVariant,
          [targetBudget]: synthesizedVariant,
        },
      };

      onSetTailoredResume(fallbackUpdated);
      onSaveToHistory(fallbackUpdated);
      setGeneratedParams((prev) => ({ ...prev, [viewKey]: targetParams }));
      setVariantStatusMsg(`Configured and saved ${targetBudget}-Page variant to history!`);
      setTimeout(() => setVariantStatusMsg(null), 3000);
    } finally {
      setIsGeneratingVariant(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-400" />
              <h2 className="font-bold text-white text-base">Target Opportunity</h2>
            </div>

            <div className="flex items-center gap-2">
              {tailoredResume && (
                <button
                  onClick={handleReIngestRole}
                  disabled={isJobParsing}
                  className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  title="Reset & re-ingest this role with options"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isJobParsing ? 'animate-spin' : ''}`} />
                  <span>Re-Ingest Role</span>
                </button>
              )}

              <button
                onClick={handleUseDifferentJob}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm cursor-pointer ${
                  isJobEntryOpen && jobEntryMode === 'history'
                    ? 'bg-indigo-600 text-white border border-indigo-500'
                    : 'bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40'
                }`}
                title="Switch job: search history or enter a new job"
              >
                <FolderSync className="w-3.5 h-3.5" />
                <span>Use a different job</span>
              </button>
            </div>
          </div>

          {isJobEntryOpen || !tailoredResume ? (
            <div className="space-y-3">
              {tailoredResume && (
                <div className="p-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <div className="truncate mr-2">
                    <span className="text-slate-400 text-[11px] block">Current Active Role:</span>
                    <span className="font-semibold text-white truncate">
                      {tailoredResume.companyName} — {tailoredResume.jobTitle}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsJobEntryOpen(false)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium px-2 py-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 transition shrink-0 cursor-pointer"
                  >
                    Keep Current Job
                  </button>
                </div>
              )}

              <JobIngestion
                masterResume={masterResume}
                onIngestJob={async (content, type, industry, pageBudget, overrides) => {
                  setTargetIndustry(industry || '');
                  await onIngestJob(content, type, industry, pageBudget, overrides);
                  setIsJobEntryOpen(false);
                }}
                onReIngestJob={async (specificContent, pageBudget, overrides) => {
                  await onReIngestJob(specificContent, pageBudget, overrides);
                  setIsJobEntryOpen(false);
                }}

                onSelectHistoryJob={(job) => {
                  onSelectHistoryJob(job);
                  setIsJobEntryOpen(false);
                }}
                isParsing={isJobParsing}
                errorMsg={jobParseError}
                history={history}
                initialMode={jobEntryMode}
                initialText={jobEntryInitialText}
                initialUrl={jobEntryInitialUrl}
                onCancel={tailoredResume ? () => setIsJobEntryOpen(false) : undefined}
                showCancel={Boolean(tailoredResume)}
                compact={true}
                customTitle={
                  jobEntryMode === 'history'
                    ? 'Select from Ingested Job History'
                    : jobEntryInitialText
                    ? 'Re-Ingest & Customize Target Role'
                    : 'Ingest / Switch Opportunity'
                }
                customSubtitle={
                  jobEntryMode === 'history'
                    ? 'Click any saved role below to switch immediately, or click the tabs above to insert a new job.'
                    : 'Insert a URL, paste job description text, or upload a document.'
                }
                targetIndustry={targetIndustry}
                onTargetIndustryChange={setTargetIndustry}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Target Job Title</label>
                  <input
                    type="text"
                    value={tailoredResume?.jobTitle || ''}
                    readOnly
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Company / Organisation</label>
                  <input
                    type="text"
                    value={tailoredResume?.companyName || ''}
                    readOnly
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-400 block">Full Job Description / Posting / URL</label>
                  <button
                    onClick={handleReIngestRole}
                    className="text-[11px] text-rose-400 hover:text-rose-300 transition flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Edit & Re-Ingest</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={tailoredResume?.targetJD || ''}
                  readOnly
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 leading-relaxed font-mono overflow-y-auto"
                />
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {history.length} saved job{history.length === 1 ? '' : 's'} in history
                </span>
                <button
                  onClick={handleUseDifferentJob}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <FolderSync className="w-3.5 h-3.5" />
                  <span>Switch to another job...</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-7 space-y-4">
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-2xl">
            <button
              onClick={() => handleSetActiveView('resume')}
              className={`flex-1 px-4 py-2 rounded-xl text-sm font-bold transition ${
                activeView === 'resume' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tailored Resume
            </button>
            <button
              onClick={() => handleSetActiveView('coverletter')}
              className={`flex-1 px-4 py-2 rounded-xl text-sm font-bold transition ${
                activeView === 'coverletter' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Cover Letter
            </button>
            <button
              onClick={() => handleSetActiveView('qanda')}
              className={`flex-1 px-4 py-2 rounded-xl text-sm font-bold transition ${
                activeView === 'qanda' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Q & A's
            </button>
            <button
              onClick={() => handleSetActiveView('suggestions')}
              className={`flex-1 px-4 py-2 rounded-xl text-sm font-bold transition ${
                activeView === 'suggestions' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              AI Suggestions
            </button>
          </div>

          {tailoredResume ? (
            <>
              {activeView === 'qanda' && <QAStudio tailoredResume={tailoredResume} onSave={onSaveQA} />}

              {activeView === 'suggestions' && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-6">
                  <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
                    <div className="relative w-16 h-16 flex items-center justify-center rounded-2xl bg-indigo-950 border border-indigo-500/30">
                      <span className="text-xl font-black text-cyan-400">
                        {tailoredResume.atsAnalysis?.matchScore ?? 92}%
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">ATS Keyword & Role Fit Score</h3>
                      <p className="text-xs text-slate-300 mt-0.5 line-clamp-2">
                        {tailoredResume.atsAnalysis?.roleFitSummary}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {tailoredResume.harvestedInsights?.map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 rounded-xl border transition ${
                          item.applied ? 'bg-slate-950/40 border-slate-800 opacity-60' : 'bg-slate-950 border-indigo-500/30'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="font-semibold text-indigo-400 uppercase tracking-wider text-[10px]">
                            {item.targetSection}
                          </span>
                          {!item.applied && (
                            <button
                              onClick={() => onApplyHarvestItem(item)}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium transition"
                            >
                              Add to Master
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed font-medium">"{item.suggestedContent}"</p>
                        <p className="text-[11px] text-slate-400 mt-2 italic">Why: {item.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(activeView === 'resume' || activeView === 'coverletter') && (
                <div className="space-y-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1.5">
                          <Target className="w-3 h-3 text-cyan-400" />
                          <span>Dynamic Page Depth Target</span>
                        </label>

                        <div className="inline-flex flex-wrap rounded-xl bg-slate-950 p-1 border border-slate-800 gap-1">
                          <button
                            onClick={() => handleSwitchPageBudget(0)}
                            disabled={isGeneratingVariant}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                              activeControls.pageBudget === 0
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                            }`}
                          >
                            <span>Full Version</span>
                            <span className="text-[10px] font-normal opacity-80">(Unlimited)</span>
                          </button>
                          <button
                            onClick={() => handleSwitchPageBudget(2)}
                            disabled={isGeneratingVariant}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                              activeControls.pageBudget === 2
                                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                            }`}
                          >
                            <span>2-Page Target</span>
                            <span className="text-[10px] font-normal opacity-80">(Executive)</span>
                          </button>
                          <button
                            onClick={() => handleSwitchPageBudget(1)}
                            disabled={isGeneratingVariant}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                              activeControls.pageBudget === 1
                                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                            }`}
                          >
                            <span>1-Page Target</span>
                            <span className="text-[10px] font-normal opacity-80">(Concise)</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 items-end">
                        <div>
                          <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Target Industry</label>
                          <select
                            value={targetIndustry}
                            onChange={(e) => handleIndustryDropdownChange(e.target.value)}
                            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 cursor-pointer"
                          >
                            <option value="">General (No Industry Override)</option>
                            <option value="Mining & Industry (Japan)">Mining & Industry (Japan)</option>
                            <option value="IT">IT</option>
                            <option value="VR / AR">VR / AR</option>
                            <option value="Creative">Creative</option>
                            <option value="AI">AI</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Emphasis</label>
                          <select
                            value={activeControls.emphasis}
                            onChange={(e) => updateControls('emphasis', e.target.value)}
                            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 cursor-pointer"
                          >
                            <option value="technical">Technical</option>
                            <option value="cross_industry_ai">Cross-Industry Leader + Agentic AI</option>
                            <option value="leadership">Leadership</option>
                            <option value="ai_data">AI & Data</option>
                            <option value="scale">Scale</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Age Privacy</label>
                          <label className="flex items-center gap-1.5 text-xs text-slate-200 bg-slate-800 border border-slate-700 px-2.5 py-1.5 rounded-lg cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={activeControls.obscureOldDates}
                              onChange={(e) => updateControls('obscureOldDates', e.target.checked)}
                              className="rounded border-slate-600 text-indigo-600 focus:ring-0"
                            />
                            <span>Obscure Dates &gt;15 Yrs</span>
                          </label>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">AI Re-synthesis</label>
                          {(() => {
                            const currentSelected = {
                              pageBudget: activeControls.pageBudget,
                              targetIndustry: targetIndustry,
                              emphasis: activeControls.emphasis,
                            };
                            const currentGenerated = generatedParams[currentViewKey];
                            const isUnchanged =
                              currentSelected.pageBudget === currentGenerated.pageBudget &&
                              currentSelected.targetIndustry === currentGenerated.targetIndustry &&
                              currentSelected.emphasis === currentGenerated.emphasis;

                            return (
                              <button
                                onClick={() => handleReTailor(currentViewKey, currentSelected)}
                                disabled={isUnchanged || isGeneratingVariant}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                                  isUnchanged
                                    ? 'bg-black text-slate-500 border border-slate-800 cursor-not-allowed'
                                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30'
                                }`}
                                title={isUnchanged ? 'Parameters match current output' : 'Re-synthesize with selected parameters'}
                              >
                                {isGeneratingVariant ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                                ) : isUnchanged ? (
                                  <Check className="w-3.5 h-3.5 text-slate-500" />
                                ) : (
                                  <Sparkles className="w-3.5 h-3.5 text-white" />
                                )}
                                <span>{isGeneratingVariant ? 'Generating...' : isUnchanged ? 'Unchanged' : 'Re-Tailor'}</span>
                              </button>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    {variantStatusMsg && (
                      <div className="p-2 px-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-xs text-indigo-300 flex items-center gap-2 animate-in fade-in duration-200">
                        {isGeneratingVariant ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400 shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        )}
                        <span>{variantStatusMsg}</span>
                      </div>
                    )}
                  </div>

                  {(() => {
                    const activeGen = generatedParams[currentViewKey];
                    const depthLabel =
                      activeGen.pageBudget === 0
                        ? 'Full Version (Unlimited)'
                        : activeGen.pageBudget === 2
                        ? '2 Pages (Executive)'
                        : '1 Page (Concise)';
                    const emphasisLabels: Record<string, string> = {
                      cross_industry_ai: 'Cross-Industry Leader + Agentic AI',
                      technical: 'Technical',
                      leadership: 'Leadership',
                      ai_data: 'AI & Data',
                      scale: 'Scale',
                    };
                    return (
                      <div className="px-3.5 py-2 bg-slate-900/90 border border-indigo-500/30 rounded-xl flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300">
                        <span className="font-bold text-indigo-300 uppercase tracking-wider text-[10px]">
                          Currently Previewing:
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-300 font-semibold">
                            {depthLabel}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-200">
                            Industry: <strong>{activeGen.targetIndustry || 'General'}</strong>
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-purple-300">
                            Emphasis: <strong>{emphasisLabels[activeGen.emphasis] || activeGen.emphasis}</strong>
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-emerald-300">
                            Dates &gt;15 Yrs: <strong>{activeControls.obscureOldDates ? 'Obscured' : 'Shown'}</strong>
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
                    <ResumeDocument
                      tailoredResume={tailoredResume}

                      masterResume={masterResume}
                      isMasterView={false}
                      resumeOptions={activeControls}
                      activeDoc={activeDoc}
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Target Opportunity Required</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Use the Target Opportunity panel on the left to insert a URL, paste job description text, or select any previously ingested role from your history.
                </p>
              </div>
              {history.length > 0 && (
                <div className="pt-4 border-t border-slate-800 max-w-md mx-auto text-left">
                  <span className="text-xs font-semibold text-slate-300 block mb-2">
                    Quick Select from Recent Ingested Roles:
                  </span>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {[...history]
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .slice(0, 5)
                      .map((job) => {
                        const dateObj = new Date(job.createdAt);
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
                            key={job.id}
                            onClick={() => onSelectHistoryJob(job)}
                            className="w-full text-left p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-xl text-xs flex flex-col gap-1 group transition cursor-pointer"
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="font-semibold text-white group-hover:text-indigo-300 truncate mr-2">
                                {job.companyName}
                              </span>
                              <span className="text-[10px] text-indigo-400 shrink-0">Load &rarr;</span>
                            </div>
                            <span className="text-slate-400 text-[11px] block truncate">{job.jobTitle}</span>
                            <span className="text-[10px] text-slate-500 block">
                              {dateStr} at {timeStr}
                            </span>
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
