import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Target,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  BookmarkPlus,
  Loader2,
  Sliders,
  ChevronRight,
  Zap,
  Info,
  Check,
  FolderSync,
  RefreshCw,
  X,
} from 'lucide-react';
import { MasterResume, TailoredResume, TailoredResumeVariant, HarvestSuggestion } from '../types/resume';
import { ResumeDocument } from './ResumeDocument';
import { QAStudio } from './QAStudio';
import { JobIngestion } from './JobIngestion';
import { db } from '../firebase'; // Correct import path
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Hashing function for job content
async function hashContent(content: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

interface TailorStudioProps {
  masterResume: MasterResume;
  tailoredResume: TailoredResume | null;
  onSetTailoredResume: (res: TailoredResume) => void;
  onApplyHarvestItem: (item: HarvestSuggestion) => void;
  onApplyAllHarvest: (items: HarvestSuggestion[]) => void;
  onSaveToHistory: (res: TailoredResume) => void;
  onAutoResetTruth?: () => MasterResume;
  onReIngestJob: (specificContent?: string) => Promise<void>;
  onIngestJob: (content: string, type: 'url' | 'pdf' | 'text') => Promise<void>;
  isJobParsing: boolean;
  jobParseError: string | null;
  history: TailoredResume[];
  onSelectHistoryJob: (job: TailoredResume) => void;
  defaultActiveView?: 'resume' | 'coverletter' | 'qanda' | 'suggestions';
  onSaveQA: (pairs: { id: string; question: string; answer: string; }[]) => void;
}
// ... (rest of the file content)

const SAMPLE_JOB_POSTINGS = [
  {
    title: 'Staff Distributed Systems Engineer',
    company: 'Stripe',
    description: `About the Role:
We are looking for a Staff Distributed Systems Engineer to lead the architecture of our global real-time event pipeline and settlement ledger. You will be responsible for systems processing over 500,000 requests per second with strict five-nines (99.999%) availability.

Requirements:
- 10+ years of deep hands-on experience building distributed systems in Go, Rust, or modern C++.
- Extensive production knowledge of Kafka, consensus algorithms (Raft, Paxos), and multi-region failover.
- Demonstrated experience in latency reduction (sub-50ms p99 at high volume).
- Experience leading large-scale architectural migrations from monoliths to event-driven microservices.
- Track record of mentoring staff and senior engineers and driving technical RFC standards.
- Strong knowledge of zero-trust security and SOC-2 compliance frameworks.`,
  },
  {
    title: 'Principal AI Solutions Architect',
    company: 'Anthropic / Scale AI',
    description: `Role Overview:
We are seeking a Principal AI Solutions Architect to design and deploy enterprise-scale generative AI workflows, vector search pipelines, and agentic reasoning systems for Fortune 500 clients.

Key Responsibilities:
- Architect high-throughput, low-latency RAG (Retrieval-Augmented Generation) applications integrating LLM APIs (Gemini, Claude) with vector databases (Qdrant, Pinecone).
- Design evaluation frameworks for hallucination prevention, latency budgeting, and context window optimization.
- Lead full-stack engineering initiatives using TypeScript, Next.js, Python, and cloud infrastructure (AWS/GCP).
- Partner directly with CTOs and VP of Engineering clients to craft technical roadmaps and demonstrate quantifiable business ROI.`,
  },
  {
    title: 'Engineering Director / Head of Infrastructure',
    company: 'Datadog',
    description: `Position Summary:
Lead our Core Telemetry and Cloud Infrastructure organization. You will manage 4 engineering managers and 30+ distributed systems engineers responsible for ingestion of petabytes of metric data daily.

What We Look For:
- Proven experience managing multi-team organizations (25+ engineers) in high-growth environments.
- Deep background in Kubernetes, Terraform, cloud cost optimization ($1M+ cloud savings), and developer velocity.
- Experience modernizing CI/CD pipelines to reduce cycle times from weeks to hours.
- Exceptional ability to hire, retain top engineering talent, and build engineering career ladders.`,
  },
];

export const TailorStudio: React.FC<TailorStudioProps> = ({
  masterResume,
  tailoredResume,
  onSetTailoredResume,
  onApplyHarvestItem,
  onApplyAllHarvest,
  onSaveToHistory,
  onAutoResetTruth,
  onReIngestJob,
  onIngestJob,
  isJobParsing,
  jobParseError,
  history,
  onSelectHistoryJob,
  defaultActiveView = 'resume',
  onSaveQA,
}) => {
  const [controls, setControls] = useState({
    resume: { pageBudget: 1, emphasis: 'technical' as const },
    coverletter: { pageBudget: 1, emphasis: 'technical' as const },
  });
  const [activeView, setActiveView] = useState<'resume' | 'coverletter' | 'qanda' | 'suggestions'>(defaultActiveView);

  useEffect(() => {
    setActiveView(defaultActiveView);
  }, [defaultActiveView]);
  
  const handleSetActiveView = (view: 'resume' | 'coverletter' | 'qanda' | 'suggestions') => {
      console.log("DEBUG: TailorStudio setActiveView called with =", view);
      setActiveView(view);
      // Force immediate re-render by setting local state
  };
  
  const activeDoc = activeView === 'coverletter' ? 'cover_letter' : 'resume';
  console.log("DEBUG: TailorStudio activeDoc =", activeDoc, "activeView =", activeView);
  const activeControls = controls[activeView === 'coverletter' ? 'coverletter' : 'resume'];

  const [isGeneratingVariant, setIsGeneratingVariant] = useState(false);
  const [variantStatusMsg, setVariantStatusMsg] = useState<string | null>(null);

  const [isJobEntryOpen, setIsJobEntryOpen] = useState(false);
  const [jobEntryMode, setJobEntryMode] = useState<'url' | 'pdf' | 'text' | 'history' | 'upload'>('history');
  const [jobEntryInitialText, setJobEntryInitialText] = useState('');
  const [jobEntryInitialUrl, setJobEntryInitialUrl] = useState('');

  useEffect(() => {
    if (tailoredResume) {
      setIsJobEntryOpen(false);
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

  const updateControls = (key: 'pageBudget' | 'emphasis', value: any) => {
    setControls(prev => ({
      ...prev,
      resume: { ...prev.resume, [key]: key === 'pageBudget' ? (prev.resume.pageBudget === 1 ? 2 : 1) : value },
      coverletter: { ...prev.coverletter, [key]: key === 'pageBudget' ? (prev.coverletter.pageBudget === 1 ? 2 : 1) : value }
    }));
  };

  const updatePageCount = (pageBudget: number) => {
    setControls(prev => ({
        ...prev,
        [activeDoc === 'cover_letter' ? 'coverletter' : 'resume']: {
            ...prev[activeDoc === 'cover_letter' ? 'coverletter' : 'resume'],
            pageBudget
        }
    }));
  };

  const handleSwitchPageBudget = async (targetBudget: number) => {
    updatePageCount(targetBudget);
    
    if (!tailoredResume) return;

    // Check if variant already exists
    if (tailoredResume.variants?.[targetBudget]) {
      const variant = tailoredResume.variants[targetBudget]!;
      const updated: TailoredResume = {
        ...tailoredResume,
        pageBudget: targetBudget,
        executiveSummary: variant.executiveSummary,
        coverLetter: variant.coverLetter || tailoredResume.coverLetter,
        selectedSkills: variant.selectedSkills,
        experiences: variant.experiences,
        projects: variant.projects,
      };
      onSetTailoredResume(updated);
      onSaveToHistory(updated);
      setVariantStatusMsg(`Switched to cached ${targetBudget}-Page ${targetBudget === 1 ? 'High-Impact' : 'Executive Depth'} variant`);
      setTimeout(() => setVariantStatusMsg(null), 3000);
      return;
    }

    if (isGeneratingVariant) return;

    setIsGeneratingVariant(true);
    setVariantStatusMsg(`Synthesizing distinct ${targetBudget}-Page ${targetBudget === 1 ? 'high-impact concise' : 'comprehensive executive depth'} variant via AI...`);
    
    const isOnePage = targetBudget === 1;
    const effectiveJD = tailoredResume.targetJD?.trim() || `Target Role: ${tailoredResume.jobTitle || 'Executive Position'} at ${tailoredResume.companyName || 'Target Organization'}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 18000);

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
          };

          const updated: TailoredResume = {
            ...tailoredResume,
            pageBudget: targetBudget,
            executiveSummary: newVariant.executiveSummary,
            coverLetter: newVariant.coverLetter || tailoredResume.coverLetter,
            selectedSkills: newVariant.selectedSkills,
            experiences: newVariant.experiences,
            projects: newVariant.projects,
            variants: {
              ...(tailoredResume.variants || {}),
              [targetBudget]: newVariant,
            },
          };

          onSetTailoredResume(updated);
          onSaveToHistory(updated);
          setVariantStatusMsg(`Generated distinct ${targetBudget}-Page AI content tailored specifically to this target!`);
          setTimeout(() => setVariantStatusMsg(null), 3500);
          return;
        }
      } catch (fetchErr: any) {
        clearTimeout(timeoutId);
        console.warn('AI generation timed out or network error, applying structured synthesis fallback:', fetchErr?.message);
      }

      // Client-side structured fallback: generate distinct depth-appropriate variant from masterResume
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
        bullets: (exp.bullets || []).slice(0, isOnePage ? 3 : 5).map((b: any) => typeof b === 'string' ? b : (b.text || '')),
        technologies: exp.technologies || [],
      }));

      const projects = (masterResume.projects || []).slice(0, isOnePage ? 2 : 4).map((p) => ({
        name: p.name,
        role: p.role,
        period: p.period,
        bullets: (p.bullets || []).slice(0, isOnePage ? 2 : 3).map((b: any) => typeof b === 'string' ? b : (b.text || '')),
        technologies: p.technologies || [],
      }));

      const executiveSummary = isOnePage
        ? (tailoredResume.executiveSummary || masterResume.executiveSummaries?.[0]?.text?.slice(0, 280) || '')
        : (masterResume.executiveSummaries?.[0]?.text || tailoredResume.executiveSummary || '');

      // Build relevant links for cover letter according to user protocol
      const availableLinks: { url: string; desc: string }[] = [];
      if (masterResume.contact?.website) {
        availableLinks.push({ url: masterResume.contact.website, desc: 'Personal Portfolio & Technical Solutions' });
      }
      if (masterResume.contact?.linkedin) {
        availableLinks.push({ url: masterResume.contact.linkedin, desc: 'Professional Profile & Career Endorsements' });
      }
      (masterResume.projects || []).forEach((p) => {
        if (p.link && (p.link.startsWith('http') || p.link.includes('.')) && !p.link.includes('PASTE_YOUR')) {
          const fullUrl = p.link.startsWith('http') ? p.link : `https://${p.link}`;
          availableLinks.push({ url: fullUrl, desc: `Live Project: ${p.name}` });
        }
      });
      const maxLinks = isOnePage ? 3 : 5;
      const selectedLinks = availableLinks.slice(0, maxLinks);
      const linksBlock = selectedLinks.length > 0
        ? `\n\nRelevant Project & Professional Links:\n${selectedLinks.map(l => `${l.url} (${l.desc})`).join('\n')}`
        : '';

      const fallbackCoverLetter = tailoredResume.coverLetter || (
        isOnePage
          ? `Dear Hiring Team,\n\nI am writing to express my strong interest in the ${tailoredResume.jobTitle || 'Target Position'} role at ${tailoredResume.companyName || 'your organization'}. With proven expertise delivering high-velocity technical outcomes, I specialise in translating strategic vision into resilient execution.\n\nThroughout my career, I have demonstrated exceptional adaptability, rapidly mastering new technologies and aligning engineering investments with commercial priorities. My background in software architecture and cross-functional leadership directly aligns with your objectives.\n\nThank you for considering my application. I look forward to discussing how my experience can deliver immediate value.${linksBlock}\n\nSincerely,\n${masterResume.contact?.fullName || 'Candidate'}`
          : `Dear Hiring Team at ${tailoredResume.companyName || 'Hiring Organization'},\n\nI am writing to express my enthusiastic interest in the ${tailoredResume.jobTitle || 'Executive Position'} role. With over a decade of dedicated professional experience leading complex technology transformations, I have consistently steered initiatives that enhance operational scale, system reliability, and product-led growth.\n\nMy leadership philosophy centres on cross-functional alignment, technical adaptability, and resilient engineering. When modernising platforms or adopting new toolchains, I leverage foundational architecture principles to master modern frameworks rapidly and mentor engineering teams through critical milestones.\n\nAt ${tailoredResume.companyName || 'your organization'}, I look forward to contributing deep strategic vision and technical leadership. My focus remains on delivering high-availability architectures, optimising release velocity, and driving sustainable business value.${linksBlock}\n\nSincerely,\n${masterResume.contact?.fullName || 'Candidate'}`
      );

      const synthesizedVariant = {
        executiveSummary,
        coverLetter: fallbackCoverLetter,
        selectedSkills,
        experiences,
        projects,
        pageBudget: targetBudget,
      };

      const fallbackUpdated: TailoredResume = {
        ...tailoredResume,
        pageBudget: targetBudget,
        executiveSummary,
        coverLetter: fallbackCoverLetter,
        selectedSkills,
        experiences,
        projects,
        variants: {
          ...(tailoredResume.variants || {}),
          [targetBudget]: synthesizedVariant,
        },
      };

      onSetTailoredResume(fallbackUpdated);
      onSaveToHistory(fallbackUpdated);
      setVariantStatusMsg(`Configured distinct ${targetBudget}-Page ${isOnePage ? 'High-Impact' : 'Executive Depth'} format!`);
      setTimeout(() => setVariantStatusMsg(null), 3000);
    } finally {
      setIsGeneratingVariant(false);
    }
  };

  const unappliedHarvests = (tailoredResume?.harvestedInsights || []).filter((h) => !h.applied);

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
              {/* 1 - Switch positions: "Re-Ingest Role" comes first */}
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

              {/* 1 & 2 - "Use a different job" comes second and is a clickable box! */}
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

          {/* If entry view is active or there is no tailoredResume, render the full job entry mechanism */}
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
                onIngestJob={async (content, type) => {
                  await onIngestJob(content, type);
                  setIsJobEntryOpen(false);
                }}
                onReIngestJob={async (specificContent) => {
                  await onReIngestJob(specificContent);
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
                  {activeView === 'qanda' && (
                    <QAStudio 
                        tailoredResume={tailoredResume} 
                        onSave={onSaveQA}
                    />
                  )}

                  {activeView === 'suggestions' && (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-6">
                      {/* ATS Keyword & Role Fit Score (Moved here) */}
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

                      {/* Harvest content */}
                      <div className="space-y-3">
                        {tailoredResume.harvestedInsights?.map((item) => (
                          <div
                            key={item.id}
                            className={`p-4 rounded-xl border transition ${
                              item.applied
                                ? 'bg-slate-950/40 border-slate-800 opacity-60'
                                : 'bg-slate-950 border-indigo-500/30'
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

                  {/* View 3: Document Canvas */}
                  {(activeView === 'resume' || activeView === 'coverletter') && (
                    <div className="space-y-4">
                      {/* Independent Controls */}
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                        <div className="flex flex-wrap gap-4 items-center justify-between">
                          <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1.5">
                              <Target className="w-3 h-3 text-cyan-400" />
                              <span>Dynamic Page Depth Target</span>
                            </label>
                            <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800 gap-1">
                              <button
                                onClick={() => handleSwitchPageBudget(1)}
                                disabled={isGeneratingVariant}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                  activeControls.pageBudget === 1
                                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                                }`}
                              >
                                <span>📄 1-Page Target</span>
                                <span className="text-[10px] font-normal opacity-80">(Concise High-Impact)</span>
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
                                <span>📄📄 2-Page Target</span>
                                <span className="text-[10px] font-normal opacity-80">(Executive Portfolio)</span>
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-3 items-center">
                            <div>
                              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Emphasis</label>
                              <select
                                value={activeControls.emphasis}
                                onChange={(e: any) => updateControls('emphasis', e.target.value)}
                                className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 cursor-pointer"
                              >
                                <option value="technical">Technical</option>
                                <option value="leadership">Leadership</option>
                                <option value="ai_data">AI & Data</option>
                                <option value="scale">Scale</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">AI Re-synthesis</label>
                              <button
                                onClick={() => handleSwitchPageBudget(activeControls.pageBudget)}
                                disabled={isGeneratingVariant}
                                className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 hover:text-white rounded-lg text-xs font-semibold border border-indigo-500/40 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                title="Re-synthesize depth and narrative using AI"
                              >
                                {isGeneratingVariant ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                                ) : (
                                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                                )}
                                <span>{isGeneratingVariant ? 'Generating...' : `Re-tailor for ${activeControls.pageBudget}-Page`}</span>
                              </button>
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
                      
                      <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
                        <ResumeDocument
                          tailoredResume={tailoredResume}
                          masterResume={masterResume}
                          isMasterView={false}
                          resumeOptions={activeControls}
                          activeDoc={activeDoc}
                          onLog={() => console.log("DEBUG: TailorStudio passing activeDoc =", activeDoc)}
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
                                  <span className="text-[10px] text-indigo-400 shrink-0">
                                    Load &rarr;
                                  </span>
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
