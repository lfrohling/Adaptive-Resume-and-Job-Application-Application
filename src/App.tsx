import React, { useState, useEffect } from 'react';
import { processGuestName, applyNameReplacement, processGuestEmail } from './utils/nameProcessor';
import { Header } from './components/Header';
import { AuthScreen } from './components/AuthScreen';
import { MasterDossier } from './components/MasterDossier';
import { TailorStudio } from './components/TailorStudio';
import { MasterAudit } from './components/MasterAudit';
import { ApplicationsHistory } from './components/ApplicationsHistory';
import { TodoList, INITIAL_BACKLOG_TASKS } from './components/TodoList';
import { PlatformAdvice } from './components/PlatformAdvice';
import { LogViewer } from './components/LogViewer';
import { ImportExportModal } from './components/ImportExportModal';
import { DirectoryGuideModal } from './components/DirectoryGuideModal';
import { ActiveTab, MasterResume, TailoredResume, HarvestSuggestion, TodoTask } from './types/resume';
import { INITIAL_SAMPLE_MASTER_RESUME, PURE_USER_MASTER_RESUME, JANE_DOE_MASTER_RESUME } from './services/sampleData';
// import { DUMMY_USER_DATA, DUMMY_TAILORED_HISTORY } from './services/dummyData'; // Removed
import {
  saveMasterResumeToFirestore,
  loadMasterResumeFromFirestore,
  loadTailoredHistoryFromFirestore,
  saveTailoredResumeToFirestore,
  deleteTailoredResumeFromFirestore,
} from './services/firebaseDb';
import {
  exportResumeAsJson,
  exportResumeAsPlainText,
  exportResumeAsPdf,
} from './utils/storage';
import { log } from './utils/logger';
import { CheckCircle } from 'lucide-react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setIsAuthenticated(true);
        setUser(firebaseUser.email);
        setIsDemoMode(false);
        setLoading(false);
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
  };

  const handleResetToSample = () => {
    setMasterResume(INITIAL_SAMPLE_MASTER_RESUME);
    showToast('Restored Canonical Career Truth Document (Loaded Project 4 & New Skills)');
  };

  const handleAutoResetTruth = () => {
    setMasterResume(INITIAL_SAMPLE_MASTER_RESUME);
    return INITIAL_SAMPLE_MASTER_RESUME;
  };

  const handleImportMaster = (imported: MasterResume) => {
    setMasterResume(imported);
    setActiveTab('master');
    showToast('Successfully imported and structured Master Career Dossier!');
  };

  const handleExportJson = () => {
    if (masterResume) {
      exportResumeAsJson(masterResume);
      showToast('Exported Master Career Dossier as JSON backup');
    }
  };

  const handleExportTxt = () => {
    if (masterResume) {
      exportResumeAsPlainText(masterResume);
      showToast('Exported Master Truth Document as readable *.txt');
    }
  };

  const handleExportPdf = () => {
    if (masterResume) {
      exportResumeAsPdf(masterResume);
      showToast('Exported Master Truth Document as PDF (*.pdf)');
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

  const handleIngestJob = async (content: string, type: 'url' | 'pdf' | 'text') => {
    if (!masterResume) return;
    setIsJobParsing(true);
    setJobParseError(null);
    try {
      const detailsRes = await fetch('/api/gemini/parse-job-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, content }),
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

      const tailorRes = await fetch('/api/gemini/tailor-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          masterResume,
          jobPosting: content,
          jobTitle,
          companyName,
          pageBudget: 1,
          tone: 'executive',
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
      
      setCurrentTailored(tailoredData);
      handleSaveToHistory(tailoredData);
      setActiveTab('tailor');
      setHasIngestedJob(true);
      showToast('Successfully ingested job! Generating tailored resume...');
      
    } catch (e: any) {
      log('error', `Error parsing: ${e.message}`);
      setJobParseError(e.message || 'Error parsing.');
    } finally {
      setIsJobParsing(false);
    }
  };

  const handleReIngestJob = async (specificContent?: string) => {
    if (!currentTailored && !specificContent) {
        showToast('No active role to re-ingest!');
        return;
    }
    const content = specificContent || currentTailored?.targetJD || '';
    const oldId = currentTailored?.id;
    const isUrl = content.trim().startsWith('http://') || content.trim().startsWith('https://');
    await handleIngestJob(content, isUrl ? 'url' : 'text');
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

    showToast(`Harvested into Master Base: "${item.suggestedContent.slice(0, 38)}..."`);
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

    showToast(`Harvested all ${items.length} new insights into Master Base!`);
  };

  const unappliedCount = (currentTailored?.harvestedInsights || []).filter((h) => !h.applied).length;

  const ensureGoogleAiAppDev = (resume: MasterResume | null): MasterResume | null => {
    if (!resume || !resume.certifications) return resume;
    let modified = false;
    const newCerts = resume.certifications.map((cert) => {
      if (
        cert.name.toLowerCase().includes('google ai certificate') &&
        !cert.name.includes('App Development')
      ) {
        modified = true;
        let newName = cert.name;
        if (newName.includes('App Building')) {
          newName = newName.replace('App Building', 'App Building, App Development');
        } else if (newName.endsWith(')')) {
          newName = newName.replace(/\)$/, ', App Development)');
        } else {
          newName = `${newName} (App Development)`;
        }
        return {
          ...cert,
          name: newName,
        };
      }
      return cert;
    });
    return modified ? { ...resume, certifications: newCerts } : resume;
  };

  // Initialization handled once if needed, or by admin.

  useEffect(() => {
    if (isAuthenticated && user && !isDemoMode) {
      setLoading(true);
      Promise.all([
        loadMasterResumeFromFirestore(user),
        loadTailoredHistoryFromFirestore(user)
      ]).then(([res, history]) => {
        setMasterResume(ensureGoogleAiAppDev(res || INITIAL_SAMPLE_MASTER_RESUME));
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

      const finalResume = {
        ...personalizedResume,
        _guestName: processedName,
        contact: { ...personalizedResume.contact, email: processedEmail },
        tasks: INITIAL_BACKLOG_TASKS,
      };

      setMasterResume(ensureGoogleAiAppDev(finalResume));
      setTasks(INITIAL_BACKLOG_TASKS);
      setTailoredHistory([]);
      setCurrentTailored(null);
      setUser(processedName);
      setIsDemoMode(true);
      setLoading(false);
    } else {
      setIsAuthenticated(true);
      setUser(identifier);
      setIsDemoMode(false);
      setLoading(true);
      Promise.all([
        loadMasterResumeFromFirestore(identifier),
        loadTailoredHistoryFromFirestore(identifier)
      ]).then(([res, history]) => {
        setMasterResume(ensureGoogleAiAppDev(res || INITIAL_SAMPLE_MASTER_RESUME));
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
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onExportJson={handleExportJson}
        onExportTxt={handleExportTxt}
        onExportPdf={handleExportPdf}
        onResetToSample={handleResetToSample}
        onOpenDirectoryGuide={() => setIsDirectoryGuideOpen(true)}
        history={tailoredHistory}
        onSelectResume={(res) => {
          setCurrentTailored(res);
          setActiveTab('tailor');
          setActiveTailorView('resume');
        }}
        setActiveTailorView={setActiveTailorView}
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

      {toastMessage && (
        <div className="no-print fixed bottom-6 right-6 z-50 bg-slate-900 border border-indigo-500/40 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
