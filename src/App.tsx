/**
 * File: src/App.tsx
 * Description: Root application orchestrator managing authentication, Core Profile persistence, job ingestion with advanced overrides, and tailored document history.
 * Author: Luke Frohling
 */

import React, { useState, useEffect } from 'react';
import { IngestionOverrides } from './types/ingestion';

import { processGuestName, applyNameReplacement, processGuestEmail } from './utils/nameProcessor';
import { Header } from './components/Header';
import { AuthScreen } from './components/AuthScreen';
import { MasterDossier } from './components/MasterDossier';
import { AdditionalUtilities } from './components/AdditionalUtilities';
import { TailorStudio } from './components/TailorStudio';
import { MasterAudit } from './components/MasterAudit';
import { ApplicationsHistory } from './components/ApplicationsHistory';
import { TodoList, INITIAL_BACKLOG_TASKS } from './components/TodoList';
import { PlatformAdvice } from './components/PlatformAdvice';
import { LogViewer } from './components/LogViewer';
import { ImportExportModal } from './components/ImportExportModal';
import { DirectoryGuideModal } from './components/DirectoryGuideModal';
import { MasterSnapshotsModal } from './components/MasterSnapshotsModal';
import { ActiveTab, MasterResume, TailoredResume, HarvestSuggestion, TodoTask, MasterSnapshot } from './types/resume';
import { INITIAL_SAMPLE_MASTER_RESUME, PURE_USER_MASTER_RESUME, JANE_DOE_MASTER_RESUME, JANE_DOE_SAMPLE_HISTORY, JANE_DOE_TODO_TASKS } from './services/sampleData';
import {
  saveMasterResumeToFirestore,
  loadMasterResumeFromFirestore,
  loadTailoredHistoryFromFirestore,
  saveTailoredResumeToFirestore,
  deleteTailoredResumeFromFirestore,
  saveMasterSnapshotToFirestore,
  loadMasterSnapshotsFromFirestore,
  deleteMasterSnapshotFromFirestore,
} from './services/firebaseDb';
import {
  exportResumeAsJson,
  exportResumeAsPlainText,
  exportResumeAsPdf,
} from './utils/storage';
import { log } from './utils/logger';
import { sanitizeText, sanitizeObject } from './utils/sanitizer';
import { CheckCircle } from 'lucide-react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const [isDirty, setIsDirty] = useState(false);
  const isDirtyRef = React.useRef(false);

  useEffect(() => {
      isDirtyRef.current = isDirty;
  }, [isDirty]);

  useEffect(() => {
    const interval = setInterval(async () => {
        if (isDirtyRef.current) {
            await handleSaveSnapshot('Auto-Snapshot (30 min)');
            setIsDirty(false);
            isDirtyRef.current = false;
        }
    }, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const OWNER_EMAIL = (import.meta.env.VITE_OWNER_EMAIL || 'lfrohling@gmail.com').trim().toLowerCase();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (isDemoMode) return;
      if (firebaseUser) {
        const email = (firebaseUser.email || '').trim().toLowerCase();
        if (email === OWNER_EMAIL) {
          setIsAuthenticated(true);
          setUser(email);
          setIsDemoMode(false);
          setLoading(false);
        } else {
          // Non-owner Google sign-in: route into Demo Mode with their name, 0 API tokens
          handleLogin(firebaseUser.displayName || 'Guest', true);
        }
      } else {
        setIsAuthenticated(false);
        setUser((prev) => (isDemoMode ? prev : null));
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [isDemoMode]);


  const [activeTab, setActiveTab] = useState<ActiveTab>('master');
  const [masterResume, setMasterResume] = useState<MasterResume | null>(null);
  const [tailoredHistory, setTailoredHistory] = useState<TailoredResume[]>([]);
  const [currentTailored, setCurrentTailored] = useState<TailoredResume | null>(null);
  const [activeTailorView, setActiveTailorView] = useState<'resume' | 'coverletter' | 'qanda' | 'suggestions'>('resume');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isJobParsing, setIsJobParsing] = useState(false);
  const [jobParseError, setJobParseError] = useState<string | null>(null);
  const [hasIngestedJob, setHasIngestedJob] = useState(false);
  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const hasInitializedTasks = React.useRef(false);
  const [isDirectoryGuideOpen, setIsDirectoryGuideOpen] = useState(false);
  const [isSnapshotsModalOpen, setIsSnapshotsModalOpen] = useState(false);
  const [masterSnapshots, setMasterSnapshots] = useState<MasterSnapshot[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const normalizeTasks = (rawTasks?: (string | TodoTask)[]): TodoTask[] => {
    if (!rawTasks || rawTasks.length === 0) return [];
    return rawTasks.map((t, idx) => {
      if (typeof t === 'string') {
        const match = t.match(/^\[(.*?)\]\s*(.*)$/);
        if (match) {
          return {
            id: `task-migrated-${idx}-${Date.now()}`,
            section: match[1],
            text: match[2],
          };
        }
        const lower = t.toLowerCase();
        let section = 'Document Generation';
        if (
          lower.includes('name') ||
          lower.includes('guest') ||
          lower.includes('click to edit') ||
          lower.includes('ux') ||
          lower.includes('user') ||
          lower.includes('backup')
        ) {
          section = 'User Experience & Personalisation';
        } else if (lower.includes('idea') || lower.includes('personal') || lower.includes('thought')) {
          section = 'Personal Ideas';
        }
        return {
          id: `task-migrated-${idx}-${Date.now()}`,
          section,
          text: t,
        };
      }
      return t;
    });
  };

  useEffect(() => {
    if (masterResume) {
      const rawTasks = masterResume.tasks || [];
      const normalized = normalizeTasks(rawTasks);
      const badPhrases = [
        'Tailor Resume for Stripe',
        'Update Skills for AI Architect role',
        'Re-ingest previous roles',
        'Add Professional Development category',
        'FIX: Reset "Use a Different Job" properly',
        'Implement "Re-Ingest Role" button',
        'Implement true dynamic page content'
      ];
      const cleaned = normalized.filter(t => !badPhrases.some(phrase => t.text.includes(phrase)));

      if (!hasInitializedTasks.current) {
        hasInitializedTasks.current = true;
        setTasks(cleaned.length > 0 ? cleaned : INITIAL_BACKLOG_TASKS);
      }
    }
  }, [masterResume?.id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleUpdateMaster = (updated: MasterResume) => {
    setMasterResume(updated);
    setIsDirty(true);
    if (user && !isDemoMode) {
      saveMasterResumeToFirestore(user, updated);
    }
  };

  const handleResetToSample = () => {
    setIsSnapshotsModalOpen(true);
  };

  const handleSaveSnapshot = React.useCallback(async (name: string) => {
    if (!masterResume) return;
    const snapshot: MasterSnapshot = {
      id: `snap-${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
      itemCounts: {
        experiences: masterResume.experiences.length,
        skills: masterResume.skillCategories.length,
        projects: masterResume.projects.length,
        certifications: masterResume.certifications?.length || 0,
        licenses: masterResume.licenses?.length || 0,
        volunteer: masterResume.volunteer?.length || 0,
        training: masterResume.training?.length || 0,
        referees: masterResume.referees?.length || 0,
      },
      data: masterResume
    };
    setMasterSnapshots(prev => [snapshot, ...prev]);
    if (user && !isDemoMode) {
      await saveMasterSnapshotToFirestore(user, snapshot);
    }
    showToast(`Snapshot "${name}" saved!`);
  }, [masterResume, user, isDemoMode]);

  const handleRestoreSnapshot = async (snapshot: MasterSnapshot) => {
    if (masterResume) {
      const autoBackup: MasterSnapshot = {
        id: `snap-auto-${Date.now()}`,
        name: `Auto-Backup before restoring "${snapshot.name}"`,
        createdAt: new Date().toISOString(),
        itemCounts: {
          experiences: masterResume.experiences.length,
          skills: masterResume.skillCategories.length,
          projects: masterResume.projects.length,
          certifications: masterResume.certifications?.length || 0,
          licenses: masterResume.licenses?.length || 0,
          volunteer: masterResume.volunteer?.length || 0,
          training: masterResume.training?.length || 0,
          referees: masterResume.referees?.length || 0,
        },
        data: masterResume
      };
      setMasterSnapshots(prev => [autoBackup, ...prev]);
      if (user && !isDemoMode) {
        saveMasterSnapshotToFirestore(user, autoBackup);
      }
    }

    const restored = { ...snapshot.data };
    setMasterResume(restored);
    if (user && !isDemoMode) {
      await saveMasterResumeToFirestore(user, restored);
    }
    showToast(`Restored snapshot: "${snapshot.name}"`);
  };

  const handleDeleteSnapshot = async (snapshotId: string) => {
    setMasterSnapshots(prev => prev.filter(s => s.id !== snapshotId));
    if (user && !isDemoMode) {
      await deleteMasterSnapshotFromFirestore(user, snapshotId);
    }
    showToast('Snapshot removed.');
  };

  const handleSyncCanonicalTruth = async () => {
    if (masterResume) {
      const preSyncSnap: MasterSnapshot = {
        id: `snap-pre-sync-${Date.now()}`,
        name: `Checkpoint before 11-Page Canonical Sync`,
        createdAt: new Date().toISOString(),
        itemCounts: {
          experiences: masterResume.experiences.length,
          skills: masterResume.skillCategories.length,
          projects: masterResume.projects.length,
          certifications: masterResume.certifications?.length || 0,
          licenses: masterResume.licenses?.length || 0,
          volunteer: masterResume.volunteer?.length || 0,
          training: masterResume.training?.length || 0,
          referees: masterResume.referees?.length || 0,
        },
        data: masterResume
      };
      setMasterSnapshots(prev => [preSyncSnap, ...prev]);
      if (user && !isDemoMode) {
        saveMasterSnapshotToFirestore(user, preSyncSnap);
      }
    }

    const canonical = { ...PURE_USER_MASTER_RESUME };
    setMasterResume(canonical);
    if (user && !isDemoMode) {
      await saveMasterResumeToFirestore(user, canonical);
    }
    showToast('Synced with full 11-page Canonical Truth Document!');
  };

  const handleAutoResetTruth = () => {
    setMasterResume(PURE_USER_MASTER_RESUME);
    if (user && !isDemoMode) {
      saveMasterResumeToFirestore(user, PURE_USER_MASTER_RESUME);
    }
    return PURE_USER_MASTER_RESUME;
  };

  const handleImportMaster = (imported: MasterResume) => {
    setMasterResume(imported);
    setActiveTab('master');
    showToast('Successfully imported and structured Core Profile!');
  };

  const handleExportJson = () => {
    if (masterResume) {
      exportResumeAsJson(masterResume);
      showToast('Exported Core Profile as JSON backup');
    }
  };

  const handleExportTxt = () => {
    if (masterResume) {
      exportResumeAsPlainText(masterResume);
      showToast('Exported Core Profile Truth Document as readable *.txt');
    }
  };

  const handleExportPdf = () => {
    if (masterResume) {
      exportResumeAsPdf(masterResume);
      showToast('Exported Core Profile Truth Document as PDF (*.pdf)');
    }
  };

  const handleSaveToHistory = (newTailored: TailoredResume) => {
    if (user && !isDemoMode) {
        saveTailoredResumeToFirestore(user, newTailored);
    }
    setTailoredHistory((prev) => {
      const filtered = prev.filter((item) => item.id !== newTailored.id);
      return [newTailored, ...filtered];
    });
  };

  const handleDeleteHistory = (id: string) => {
    if (user && !isDemoMode) {
        deleteTailoredResumeFromFirestore(user, id);
    }
    setTailoredHistory((prev) => prev.filter((item) => item.id !== id));
    if (currentTailored?.id === id) {
      setCurrentTailored(null);
    }
    showToast('Removed tailored resume from archive');
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all saved tailored resumes?')) {
      if (user && !isDemoMode) {
          tailoredHistory.forEach(item => deleteTailoredResumeFromFirestore(user, item.id));
      }
      setTailoredHistory([]);
      setCurrentTailored(null);
      showToast('Cleared tailored application history');
    }
  };

  const handleIngestJob = async (
    rawContent: string,
    type: 'url' | 'pdf' | 'text',
    industry: string = '',
    requestedPageBudget: number = 0,
    overrides?: IngestionOverrides
  ) => {
    if (!masterResume) return;
    const content = sanitizeText(rawContent);
    const safeIndustry = industry || '';
    const safePageBudget = requestedPageBudget !== undefined ? requestedPageBudget : 0;
    const budgetLabel = safePageBudget === 0 ? 'Full Version' : `${safePageBudget}-Page`;
    setIsJobParsing(true);
    setJobParseError(null);

    try {
      if (isDemoMode) {
        await new Promise(r => setTimeout(r, 900));
        const titleLine = content.split('\n')[0] || 'Senior Engineering Leader';
        const jobTitle = titleLine.length > 40 ? titleLine.slice(0, 37) + '...' : titleLine;
        const companyName = 'Global Innovation Corp';
        const isOnePage = safePageBudget === 1;
        
        const simulatedTailored: TailoredResume = {
          id: `tailor-sim-${Date.now()}`,
          jobTitle,
          companyName,
          targetJD: content,
          targetIndustry: safeIndustry,
          createdAt: new Date().toISOString(),
          executiveSummary: masterResume.executiveSummaries[0]?.text || 'Experienced technical leader with proven expertise in systems architecture and engineering management.',
          selectedSkills: masterResume.skillCategories.slice(0, isOnePage ? 3 : 6).map(cat => ({ category: cat.category, skills: cat.skills.slice(0, isOnePage ? 4 : 8) })),
          experiences: masterResume.experiences.slice(0, isOnePage ? 2 : 4).map(exp => ({
            company: exp.company,
            role: exp.role,
            location: exp.location,
            period: `${exp.startDate} - ${exp.endDate}`,
            bullets: exp.bullets.map(b => b.text),
            technologies: exp.technologies
          })),
          projects: masterResume.projects.slice(0, isOnePage ? 2 : 4).map(p => ({
            name: p.name,
            role: p.role,
            period: p.period,
            bullets: p.bullets.map(b => b.text),
            technologies: p.technologies
          })),
          education: masterResume.education,
          certifications: masterResume.certifications || [],
          atsAnalysis: {
            matchScore: 93,
            matchedKeywords: ['Architecture', 'Leadership', 'Cloud', 'Engineering', 'Systems'],
            missingKeywords: [],
            strengths: ['High alignment with core requirements', 'Strong technical and operational background', 'Proven track record of delivery'],
            recommendations: ['Emphasize cross-functional team leadership in your introduction.'],
            roleFitSummary: 'Excellent candidate fit evaluated via instant simulation (Demo Mode).'
          },
          coverLetter: `Dear Hiring Manager at ${companyName},\n\nI am writing to express my enthusiastic interest in the ${jobTitle} position. With extensive experience leading technical engineering initiatives and distributed cloud architecture, I am confident in my ability to deliver immediate impact.\n\nThroughout my career, I have successfully driven complex technical projects from conception to production, mentoring engineering teams and optimizing system performance under strict deadlines. I am excited about the opportunity to bring my dedication and technical acumen to ${companyName}.\n\nThank you for your time and consideration.\n\nSincerely,\n${masterResume.contact.fullName}`,
          pageBudget: safePageBudget,
          qaPairs: [
            { id: 'qa-1', question: 'Why are you interested in this role?', answer: 'I am drawn to this opportunity because it combines my deep technical expertise with my passion for building high-performing engineering cultures.' },
            { id: 'qa-2', question: 'Describe a complex technical challenge you solved.', answer: 'I recently led a multi-region infrastructure migration that reduced latency by 45% while maintaining 99.99% uptime.' }
          ]
        };

        setCurrentTailored(simulatedTailored);
        handleSaveToHistory(simulatedTailored);
        setActiveTab('tailor');
        setHasIngestedJob(true);
        showToast(`Successfully simulated job ingestion (${safePageBudget}-Page format)!`);
        setIsJobParsing(false);
        return;
      }

      const detailsRes = await fetch('/api/gemini/parse-job-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type, 
          content,
          model: localStorage.getItem('omibase_gemini_model') || 'gemini-3.1-flash-lite'
        }),
      });
      
      const responseText = await detailsRes.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error('Service temporarily unavailable - please wait a minute and retry.');
      }
      
      if (!detailsRes.ok) throw new Error(data.error || 'Failed to parse job details');
      const { jobTitle, companyName } = data;

      const activeEmphasis = overrides?.emphasisOverride?.enabled ? overrides.emphasisOverride.value : 'technical';
      const tailorRes = await fetch('/api/gemini/tailor-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          masterResume,
          jobPosting: content,
          jobTitle,
          companyName,
          pageBudget: safePageBudget,
          tone: 'executive',
          targetIndustry: safeIndustry,
          emphasis: activeEmphasis,
          overrides,
          model: localStorage.getItem('omibase_gemini_model') || 'gemini-3.1-flash-lite',
        }),
      });
      
      const tailorText = await tailorRes.text();
      let tailoredData;
      try {
        tailoredData = JSON.parse(tailorText);
      } catch (e) {
        throw new Error('Service temporarily unavailable - please wait a minute and retry.');
      }
      
      if (!tailorRes.ok) throw new Error(tailoredData.error || 'Failed to auto-tailor');
      
      tailoredData.targetIndustry = safeIndustry;
      (tailoredData as any).emphasis = activeEmphasis;
      (tailoredData as any).obscureOldDates = (overrides as any)?.obscureOldDates ?? true;
      setCurrentTailored(tailoredData);
      handleSaveToHistory(tailoredData);
      setActiveTab('tailor');

      setHasIngestedJob(true);
showToast(`Successfully ingested job (${budgetLabel} format)!`);
      
    } catch (e: any) {
      log('error', `Error parsing: ${e.message}`);
      setJobParseError(e.message || 'Error parsing.');
    } finally {
      setIsJobParsing(false);
    }
  };


  const handleReIngestJob = async (
    specificContent?: string,
    requestedPageBudget: number = 0,
    overrides?: IngestionOverrides
  ) => {
    if (!currentTailored && !specificContent) {
        showToast('No active role to re-ingest!');
        return;
    }
    const content = specificContent || currentTailored?.targetJD || '';
    const oldId = currentTailored?.id;
    const isUrl = content.trim().startsWith('http://') || content.trim().startsWith('https://');
    await handleIngestJob(content, isUrl ? 'url' : 'text', '', requestedPageBudget, overrides);
    if (oldId) {
      if (user && !isDemoMode) {
        deleteTailoredResumeFromFirestore(user, oldId);
      }
      setTailoredHistory((prev) => prev.filter((item) => item.id !== oldId));
    }
    showToast('Role re-ingested successfully!');
  };

  const updateTasks = (newTasks: TodoTask[]) => {
    setTasks(newTasks);
    if (masterResume) {
      const updated = { ...masterResume, tasks: newTasks };
      setMasterResume(updated);
      setIsDirty(true);
      if (user && !isDemoMode) {
        saveMasterResumeToFirestore(user, updated);
      }
    }
    if (newTasks.length === 0) {
      showToast('All tasks force cleared from database');
    }
  };

  const handleApplyHarvestItem = (item: HarvestSuggestion) => {
    if (!masterResume) return;
    let updated = { ...masterResume };

    if (item.type === 'new_skill') {
      const cat = updated.skillCategories[0];
      if (cat && !cat.skills.includes(item.suggestedContent)) {
        cat.skills.push(item.suggestedContent);
      }
    } else if (item.type === 'enhanced_bullet' || item.type === 'new_achievement') {
      if (updated.experiences.length > 0) {
        updated.experiences[0].bullets.push({
          id: `b-harvest-${Date.now()}`,
          text: item.suggestedContent,
          impactMetric: 'Newly Harvested Impact',
          tags: ['Harvested'],
        });
      }
    } else if (item.type === 'summary_variant') {
      updated.executiveSummaries.push({
        id: `sum-harvest-${Date.now()}`,
        focusTrack: 'Harvested Focus Track',
        text: item.suggestedContent,
      });
    }

    setMasterResume(updated);

    if (currentTailored) {
      const updatedTailored = {
        ...currentTailored,
        harvestedInsights: currentTailored.harvestedInsights?.map((h) =>
          h.id === item.id ? { ...h, applied: true } : h
        ),
      };
      setCurrentTailored(updatedTailored);
      handleSaveToHistory(updatedTailored);
    }

    showToast(`Harvested into Core Profile: "${item.suggestedContent.slice(0, 38)}..."`);
  };

  const handleApplyAllHarvest = (items: HarvestSuggestion[]) => {
    if (!masterResume) return;
    let updated = { ...masterResume };

    items.forEach((item) => {
      if (item.type === 'new_skill') {
        const cat = updated.skillCategories[0];
        if (cat && !cat.skills.includes(item.suggestedContent)) {
          cat.skills.push(item.suggestedContent);
        }
      } else {
        if (updated.experiences.length > 0) {
          updated.experiences[0].bullets.push({
            id: `b-harvest-${Math.random()}`,
            text: item.suggestedContent,
            impactMetric: 'Harvested Metric',
            tags: ['Harvested'],
          });
        }
      }
    });

    setMasterResume(updated);

    if (currentTailored) {
      const updatedTailored = {
        ...currentTailored,
        harvestedInsights: currentTailored.harvestedInsights?.map((h) => ({ ...h, applied: true })),
      };
      setCurrentTailored(updatedTailored);
      handleSaveToHistory(updatedTailored);
    }

    showToast(`Harvested all ${items.length} new insights into the Core Profile!`);
  };

  const unappliedCount = (currentTailored?.harvestedInsights || []).filter((h) => !h.applied).length;

  useEffect(() => {
    if (isAuthenticated && user && !isDemoMode) {
      setLoading(true);
      Promise.all([
        loadMasterResumeFromFirestore(user),
        loadTailoredHistoryFromFirestore(user),
        loadMasterSnapshotsFromFirestore(user)
      ]).then(([res, history, snaps]) => {
        setMasterSnapshots(snaps || []);
        let resumeToUse = res;
        if (!resumeToUse || !resumeToUse.experiences || resumeToUse.experiences.length < PURE_USER_MASTER_RESUME.experiences.length || !resumeToUse.referees || resumeToUse.referees.length < (PURE_USER_MASTER_RESUME.referees?.length || 20)) {
          resumeToUse = PURE_USER_MASTER_RESUME;
          saveMasterResumeToFirestore(user, PURE_USER_MASTER_RESUME);
        } else {
          const hasTechnicalMilestones = resumeToUse.debuggingMilestones && resumeToUse.debuggingMilestones.some(m => m.includes('Zero-Token') || m.includes('Factual Drift') || m.includes('Guardrails'));
          const debuggingMilestones = (!resumeToUse.debuggingMilestones || resumeToUse.debuggingMilestones.length === 0 || hasTechnicalMilestones)
            ? PURE_USER_MASTER_RESUME.debuggingMilestones
            : resumeToUse.debuggingMilestones;

          const milestoneSections = (!resumeToUse.milestoneSections || resumeToUse.milestoneSections.length === 0)
            ? PURE_USER_MASTER_RESUME.milestoneSections
            : resumeToUse.milestoneSections;

          resumeToUse = {
            ...resumeToUse,
            licenses: resumeToUse.licenses || [],
            volunteer: resumeToUse.volunteer || [],
            training: resumeToUse.training || [],
            referees: resumeToUse.referees || [],
            additionalHighlights: resumeToUse.additionalHighlights || [],
            debuggingMilestones,
            milestoneSections
          };
          if (hasTechnicalMilestones || !res?.debuggingMilestones) {
            saveMasterResumeToFirestore(user, resumeToUse);
          }
        }
        setMasterResume(resumeToUse);
        setTailoredHistory(history || []);
        setLoading(false);
      });
    } else if (!isAuthenticated && !isDemoMode) {
      setLoading(false);
    }
  }, [isAuthenticated, isDemoMode, user]);

  const handleLogin = (identifier: string, isGuest: boolean) => {
    if (isGuest) {
      const processedName = processGuestName(identifier);
      const processedEmail = processGuestEmail(processedName);
      const baseResume = JANE_DOE_MASTER_RESUME;
      const personalizedResume = applyNameReplacement(baseResume, processedName);

      setMasterResume({
        ...personalizedResume,
        _guestName: processedName,
        contact: { ...personalizedResume.contact, email: processedEmail },
        tasks: JANE_DOE_TODO_TASKS,
        licenses: personalizedResume.licenses || [],
        volunteer: personalizedResume.volunteer || [],
        training: personalizedResume.training || [],
        referees: personalizedResume.referees || [],
        additionalHighlights: personalizedResume.additionalHighlights || []
      });
      setTasks(JANE_DOE_TODO_TASKS);
      setTailoredHistory(JANE_DOE_SAMPLE_HISTORY);
      setMasterSnapshots([]);
      setCurrentTailored(null);
      setUser(processedName);
      setIsDemoMode(true);
      setLoading(false);
    } else {
      const cleanEmail = identifier.trim().toLowerCase();
      if (cleanEmail !== OWNER_EMAIL) {
        handleLogin(identifier, true);
        return;
      }
      setIsAuthenticated(true);
      setUser(cleanEmail);
      setIsDemoMode(false);
      setLoading(true);
      setMasterSnapshots([]);
      Promise.all([
        loadMasterResumeFromFirestore(cleanEmail),
        loadTailoredHistoryFromFirestore(cleanEmail),
        loadMasterSnapshotsFromFirestore(cleanEmail)
      ]).then(([res, history, snaps]) => {
        setMasterSnapshots(snaps || []);
        let resumeToUse = res;
        if (!resumeToUse || !resumeToUse.experiences || resumeToUse.experiences.length < PURE_USER_MASTER_RESUME.experiences.length || !resumeToUse.referees || resumeToUse.referees.length < (PURE_USER_MASTER_RESUME.referees?.length || 20)) {
          resumeToUse = PURE_USER_MASTER_RESUME;
          saveMasterResumeToFirestore(cleanEmail, PURE_USER_MASTER_RESUME);
        } else {
          const hasTechnicalMilestones = resumeToUse.debuggingMilestones && resumeToUse.debuggingMilestones.some(m => m.includes('Zero-Token') || m.includes('Factual Drift') || m.includes('Guardrails'));
          const debuggingMilestones = (!resumeToUse.debuggingMilestones || resumeToUse.debuggingMilestones.length === 0 || hasTechnicalMilestones)
            ? PURE_USER_MASTER_RESUME.debuggingMilestones
            : resumeToUse.debuggingMilestones;

          const milestoneSections = (!resumeToUse.milestoneSections || resumeToUse.milestoneSections.length === 0)
            ? PURE_USER_MASTER_RESUME.milestoneSections
            : resumeToUse.milestoneSections;

          resumeToUse = {
            ...resumeToUse,
            licenses: resumeToUse.licenses || [],
            volunteer: resumeToUse.volunteer || [],
            training: resumeToUse.training || [],
            referees: resumeToUse.referees || [],
            additionalHighlights: resumeToUse.additionalHighlights || [],
            debuggingMilestones,
            milestoneSections
          };
          if (hasTechnicalMilestones || !res?.debuggingMilestones) {
            saveMasterResumeToFirestore(cleanEmail, resumeToUse);
          }
        }
        setMasterResume(resumeToUse);
        setTailoredHistory(history || []);
        setLoading(false);
      });
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">Loading data...</div>;

  if (!isAuthenticated && !isDemoMode) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
            setActiveTab(tab);
            if (tab === 'tailor') setActiveTailorView('resume');
        }}
        masterResume={masterResume}
        hasTailoredResume={!!currentTailored}
        unappliedHarvestCount={unappliedCount}
        history={tailoredHistory}
        onSelectResume={(res) => {
          setCurrentTailored(res);
          setActiveTab('tailor');
          setActiveTailorView('resume');
        }}
        setActiveTailorView={setActiveTailorView}
        onSync={async () => {
            await handleSaveSnapshot('Manual Sync');
            setIsDirty(false);
            isDirtyRef.current = false;
        }}
        isDemoMode={isDemoMode}
        onShowToast={showToast}
      />

      <main className="flex-1 pb-16">
        <ErrorBoundary fallbackTitle="OmniBase View Notice">
          {activeTab === 'master' && (
            <MasterDossier
              masterResume={masterResume}
              onUpdateMaster={handleUpdateMaster}
              onOpenImportModal={() => setIsImportModalOpen(true)}
              onNavigateToTailor={() => setActiveTab('tailor')}
              onResetToSample={handleResetToSample}
              onOpenSnapshotsModal={() => setIsSnapshotsModalOpen(true)}
              onSyncCanonicalTruth={handleSyncCanonicalTruth}
              onExportJson={handleExportJson}
              onExportTxt={handleExportTxt}
              onIngestJob={handleIngestJob}
              onReIngestJob={handleReIngestJob}
              onSelectHistoryJob={(job) => {
                setCurrentTailored(job);
                setActiveTab('tailor');
                setActiveTailorView('resume');
              }}
              isJobParsing={isJobParsing}
              jobParseError={jobParseError}
              hasIngestedJob={hasIngestedJob}
              history={tailoredHistory}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'tailor' && (
            <TailorStudio
              masterResume={masterResume!}
              tailoredResume={currentTailored}
              onSetTailoredResume={(res) => setCurrentTailored(res)}
              onApplyHarvestItem={handleApplyHarvestItem}
              onApplyAllHarvest={handleApplyAllHarvest}
              onSaveToHistory={handleSaveToHistory}
              onAutoResetTruth={handleAutoResetTruth}
              onReIngestJob={handleReIngestJob}
              onIngestJob={handleIngestJob}
              isJobParsing={isJobParsing}
              jobParseError={jobParseError}
              history={tailoredHistory}
              onSelectHistoryJob={(job) => {
                setCurrentTailored(job);
                setActiveTab('tailor');
                setActiveTailorView('resume');
              }}
              onSaveQA={(pairs) => {
                  if (currentTailored && user) {
                      const updated = { ...currentTailored, qaPairs: pairs };
                      setCurrentTailored(updated);
                      saveTailoredResumeToFirestore(user, updated);
                      showToast('Q&A Saved Successfully!');
                  }
              }}
              defaultActiveView={activeTailorView}
            />
          )}

          {activeTab === 'audit' && (
            <MasterAudit
              masterResume={masterResume!}
              onUpdateMaster={handleUpdateMaster}
              onShowToast={showToast}
              user={user}
            />
          )}

          {activeTab === 'utilities' && (
            <AdditionalUtilities 
                onShowToast={showToast}
                onOpenSnapshotsModal={() => setIsSnapshotsModalOpen(true)}
                onSyncCanonicalTruth={handleSyncCanonicalTruth}
                onExportJson={handleExportJson}
                onExportTxt={handleExportTxt}
                onOpenImportModal={() => setIsImportModalOpen(true)}
                onExportPdf={handleExportPdf}
                onOpenDirectoryGuide={() => setIsDirectoryGuideOpen(true)}
                onResetToSample={handleResetToSample}
                masterResume={masterResume}
                isDemoMode={isDemoMode}
            />
          )}

          {activeTab === 'history' && (
            <ApplicationsHistory
              history={tailoredHistory}
              onSelectResume={(res) => {
                setCurrentTailored(res);
                setActiveTab('tailor');
                setActiveTailorView('resume');
              }}
              onDeleteResume={handleDeleteHistory}
              onClearHistory={handleClearHistory}
            />
          )}

          {activeTab === 'todo' && (
            <TodoList
              tasks={tasks}
              onUpdateTasks={updateTasks}
              onResetBacklog={() => {
                updateTasks(INITIAL_BACKLOG_TASKS);
                showToast('Reloaded backlog tasks into To Do List');
              }}
            />
          )}
          
          {activeTab === 'logs' && <LogViewer />}

          {activeTab === 'advice' && <PlatformAdvice />}
        </ErrorBoundary>
      </main>

      <ImportExportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportMaster={handleImportMaster}
      />

      <DirectoryGuideModal
        isOpen={isDirectoryGuideOpen}
        onClose={() => setIsDirectoryGuideOpen(false)}
      />

      <MasterSnapshotsModal
        isOpen={isSnapshotsModalOpen}
        onClose={() => setIsSnapshotsModalOpen(false)}
        currentMaster={masterResume || PURE_USER_MASTER_RESUME}
        snapshots={masterSnapshots}
        onSaveSnapshot={handleSaveSnapshot}
        onRestoreSnapshot={handleRestoreSnapshot}
        onDeleteSnapshot={handleDeleteSnapshot}
        onSyncCanonicalTruth={handleSyncCanonicalTruth}
        isDemoMode={isDemoMode}
      />

      {toastMessage && (
        <div className="no-print fixed bottom-6 right-6 z-50 bg-slate-900 border border-indigo-500/40 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
