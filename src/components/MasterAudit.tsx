import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Loader2, 
  Plus, 
  History, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  Save, 
  Clock, 
  CheckCircle,
  FileText,
  Download,
  Eye,
  X,
  FileJson
} from 'lucide-react';
import { MasterResume } from '../types/resume';

interface MasterAuditProps {
  masterResume: MasterResume;
  onUpdateMaster: (updated: MasterResume) => void;
  onShowToast?: (msg: string) => void;
}

// Client Helper to format any MasterResume JSON to a beautiful plain text / machine readable layout
function formatSnapshotAsPlainText(resume: any): string {
  const divider = '='.repeat(80);
  const subDivider = '-'.repeat(80);
  const lines: string[] = [];

  lines.push(divider);
  lines.push(`MASTER CAREER DOSSIER - HISTORICAL BASELINE CHECKPOINT`);
  lines.push(`Candidate Name: ${resume.contact?.fullName || 'Luke Frohling'}`);
  lines.push(`Headline:       ${resume.contact?.headline || ''}`);
  lines.push(`Checkpoint ID:  ${resume.id || 'canonical-master-truth'}`);
  lines.push(`Last Updated:   ${resume.lastUpdated ? new Date(resume.lastUpdated).toLocaleString() : ''}`);
  lines.push(divider);
  lines.push('');

  // Contact Info
  lines.push('1. CONTACT INFO & RESIDENCE PROFILE');
  lines.push(subDivider);
  lines.push(`Email Address:       ${resume.contact?.email || ''}`);
  lines.push(`Phone:               ${resume.contact?.phone || ''}`);
  lines.push(`Location Summary:    ${resume.contact?.location || ''}`);
  lines.push(`Residential Address: ${resume.contact?.residentialAddress || ''}`);
  lines.push(`Current Status:      ${resume.contact?.currentStatus || ''}`);
  lines.push(`Relocation Details:  ${resume.contact?.relocationDetails || ''}`);
  lines.push(`LinkedIn Profile:    ${resume.contact?.linkedin || ''}`);
  lines.push(`GitHub Portfolio:    ${resume.contact?.github || ''}`);
  lines.push(`Website/Portfolio:   ${resume.contact?.website || ''}`);
  lines.push('');

  // Executive Summaries
  if (resume.executiveSummaries && resume.executiveSummaries.length > 0) {
    lines.push('2. EXECUTIVE SUMMARIES (MULTI-TRACK CAPABILITIES)');
    lines.push(subDivider);
    resume.executiveSummaries.forEach((s: any, idx: number) => {
      lines.push(`[Track ${idx + 1}: ${s.focusTrack || 'General Focus'}]`);
      lines.push(s.text || '');
      lines.push('');
    });
  }

  // Work Experiences
  if (resume.experiences && resume.experiences.length > 0) {
    lines.push('3. CHRONOLOGICAL EXPERIENCE HISTORY');
    lines.push(subDivider);
    resume.experiences.forEach((exp: any, idx: number) => {
      lines.push(`[${idx + 1}] ${exp.role} at ${exp.company} (${exp.location || 'Remote'})`);
      lines.push(`Period: ${exp.startDate} to ${exp.endDate || 'Present'}`);
      if (exp.summary) lines.push(`Summary: ${exp.summary}`);
      if (exp.bullets && exp.bullets.length > 0) {
        lines.push('Key Accomplishments:');
        exp.bullets.forEach((b: any) => {
          lines.push(`  * ${b.text} [Impact: ${b.impactMetric || 'N/A'}]`);
        });
      }
      if (exp.technologies && exp.technologies.length > 0) {
        lines.push(`Technologies Used: ${exp.technologies.join(', ')}`);
      }
      lines.push('');
    });
  }

  // Projects
  if (resume.projects && resume.projects.length > 0) {
    lines.push('4. DETAILED PROJECTS & SYSTEM INVENTIONS');
    lines.push(subDivider);
    resume.projects.forEach((proj: any, idx: number) => {
      lines.push(`[Project ${idx + 1}] ${proj.name} - ${proj.role || 'Lead AI Engineer'}`);
      if (proj.period) lines.push(`Period: ${proj.period}`);
      lines.push(`Description: ${proj.description}`);
      if (proj.bullets && proj.bullets.length > 0) {
        lines.push('Core Project Responsibilities:');
        proj.bullets.forEach((b: any) => {
          lines.push(`  * ${b.text} [Impact: ${b.impactMetric || 'N/A'}]`);
        });
      }
      if (proj.technologies && proj.technologies.length > 0) {
        lines.push(`Technologies Used: ${proj.technologies.join(', ')}`);
      }
      lines.push('');
    });
  }

  // Skills
  if (resume.skillCategories && resume.skillCategories.length > 0) {
    lines.push('5. DETAILED SKILLS TAXONOMY');
    lines.push(subDivider);
    resume.skillCategories.forEach((cat: any) => {
      lines.push(`[${cat.category}]`);
      lines.push(`  ${cat.skills.join(', ')}`);
      lines.push('');
    });
  }

  // Certifications
  if (resume.certifications && resume.certifications.length > 0) {
    lines.push('6. PROFESSIONAL CERTIFICATIONS & LANGUAGES');
    lines.push(subDivider);
    resume.certifications.forEach((cert: any) => {
      lines.push(`* ${cert.name} (Issued by: ${cert.issuer})`);
      if (cert.date) lines.push(`  Date: ${cert.date}`);
      lines.push('');
    });
  }

  // Milestones
  if (resume.debuggingMilestones && resume.debuggingMilestones.length > 0) {
    lines.push('7. PRODUCTION ENGINEERING TRIUMPHS & DEBUGGING MILESTONES');
    lines.push(subDivider);
    resume.debuggingMilestones.forEach((m: string) => {
      lines.push(`* ${m}`);
    });
  }

  return lines.join('\n');
}

export const MasterAudit: React.FC<MasterAuditProps> = ({ masterResume, onUpdateMaster, onShowToast }) => {
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditReport, setAuditReport] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Snapshot States
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [isLoadingSnapshots, setIsLoadingSnapshots] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSavingSnapshot, setIsSavingSnapshot] = useState(false);
  const [snapshotSuccess, setSnapshotSuccess] = useState<string | null>(null);
  const [expandedSnapshot, setExpandedSnapshot] = useState<number | null>(null);

  // Preview Modal States
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    title: string;
    text: string;
    jsonRaw?: any;
    filename: string;
  } | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // Load snapshot history
  const fetchSnapshotHistory = async () => {
    setIsLoadingSnapshots(true);
    try {
      const res = await fetch('/api/snapshots/history');
      if (res.ok) {
        const data = await res.json();
        setSnapshots(data);
      }
    } catch (e) {
      console.error('Failed to load snapshot history', e);
    } finally {
      setIsLoadingSnapshots(false);
    }
  };

  useEffect(() => {
    fetchSnapshotHistory();
  }, [masterResume]);

  // Save manual snapshot
  const handleSaveSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingSnapshot) return;

    setIsSavingSnapshot(true);
    setSnapshotSuccess(null);
    try {
      const res = await fetch('/api/snapshots/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          masterResume,
          comment: commentText.trim() || 'Manual Baseline Checkpoint'
        })
      });

      if (!res.ok) {
        throw new Error('Failed to save snapshot');
      }

      const result = await res.json();
      setCommentText('');
      
      if (result.driftDetected) {
        setSnapshotSuccess(`Snapshot baseline saved. ALERT: ${result.drifts.length} factual drifts/edits detected against preceding baseline.`);
      } else {
        setSnapshotSuccess('New snapshot baseline saved successfully with 0 factual drift.');
      }
      
      await fetchSnapshotHistory();
      setTimeout(() => setSnapshotSuccess(null), 5000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to save snapshot baseline');
    } finally {
      setIsSavingSnapshot(false);
    }
  };

  // Restore snapshot
  const handleRestoreSnapshot = async (timestamp: number) => {
    if (!window.confirm('Are you sure you want to restore this historical Master Resume? Your active screen data will be overwritten with this historical baseline.')) {
      return;
    }

    try {
      const res = await fetch(`/api/snapshots/restore/${timestamp}`);
      if (!res.ok) {
        throw new Error('Failed to restore snapshot');
      }

      const restored: MasterResume = await res.json();
      onUpdateMaster(restored);
      alert('Master Career Dossier restored successfully from historical baseline snapshot!');
    } catch (e: any) {
      console.error(e);
      alert('Error restoring snapshot: ' + e.message);
    }
  };

  // View historical baseline in plain text (Query & Format)
  const handleViewBaseline = async (snap: any) => {
    setIsPreviewLoading(true);
    try {
      const res = await fetch(`/api/snapshots/restore/${snap.timestamp}`);
      if (!res.ok) throw new Error('Failed to fetch historical baseline');
      const doc = await res.json();
      const formatted = formatSnapshotAsPlainText(doc);
      
      setPreviewModal({
        isOpen: true,
        title: `Baseline: ${snap.comment}`,
        text: formatted,
        jsonRaw: doc,
        filename: `master_baseline_${snap.comment.replace(/\s+/g, '_').toLowerCase()}_${snap.timestamp}`
      });
    } catch (e: any) {
      alert('Failed to construct baseline preview: ' + e.message);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // View changes (drifts) between baseline snapshots
  const handleViewChanges = (snap: any) => {
    const divider = '-'.repeat(80);
    const lines: string[] = [];
    lines.push(`FACTUAL DRIFT REPORT FOR SNAPSHOT: "${snap.comment}"`);
    lines.push(`Saved on: ${new Date(snap.date).toLocaleString()}`);
    lines.push(divider);
    lines.push('');

    if (!snap.drifts || snap.drifts.length === 0) {
      lines.push(`0 FACTUAL DRIFTS DETECTED.`);
      lines.push(`This document matches the preceding snapshot with 100% precision. Factual consistency is perfectly protected.`);
    } else {
      lines.push(`${snap.drifts.length} DRIFTS ENCOUNTERED BETWEEN TIMELINES:`);
      lines.push('');
      snap.drifts.forEach((d: any, idx: number) => {
        lines.push(`[${idx + 1}] SECTION: ${d.section} (${d.type.replace('_', ' ').toUpperCase()})`);
        lines.push(`    Alert: ${d.message}`);
        lines.push('');
      });
    }

    setPreviewModal({
      isOpen: true,
      title: `Changes / Drifts: ${snap.comment}`,
      text: lines.join('\n'),
      filename: `drift_changes_${snap.comment.replace(/\s+/g, '_').toLowerCase()}_${snap.timestamp}`
    });
  };

  // Trigger txt / json downloads
  const downloadTextFile = (content: string, filename: string, extension: '.txt' | '.json' = '.txt') => {
    const dataStr = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content);
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `${filename}${extension}`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  };

  const runAudit = async () => {
    setIsAuditing(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/gemini/audit-master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ masterResume }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to audit master resume');
      }

      const data = await res.json();
      setAuditReport(data);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || 'Audit failed');
    } finally {
      setIsAuditing(false);
    }
  };

  const applyRewrite = (currentText: string, rewriteText: string) => {
    let replaced = false;

    // Helper to normalize strings for comparison, ignoring punctuation, spacing, capitalization
    const cleanStr = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanCurrent = cleanStr(currentText);

    const updatedExperiences = masterResume.experiences.map((exp) => {
      const updatedBullets = exp.bullets.map((b) => {
        const cleanBullet = cleanStr(b.text);
        
        // Match strictly, by exact, substring, or fuzzy similarity parameters
        const isMatch = 
          cleanBullet === cleanCurrent || 
          cleanBullet.includes(cleanCurrent) || 
          cleanCurrent.includes(cleanBullet) ||
          (cleanCurrent.length > 15 && cleanBullet.includes(cleanCurrent.slice(0, 15))) ||
          (b.text.length > 20 && currentText.includes(b.text.slice(0, 20))) ||
          b.text === currentText;

        if (isMatch) {
          replaced = true;
          return { ...b, text: rewriteText };
        }
        return b;
      });
      return { ...exp, bullets: updatedBullets };
    });

    const updatedProjects = masterResume.projects.map((proj) => {
      const updatedBullets = proj.bullets.map((b) => {
        const cleanBullet = cleanStr(b.text);
        const isMatch = 
          cleanBullet === cleanCurrent || 
          cleanBullet.includes(cleanCurrent) || 
          cleanCurrent.includes(cleanBullet) ||
          (cleanCurrent.length > 15 && cleanBullet.includes(cleanCurrent.slice(0, 15))) ||
          (b.text.length > 20 && currentText.includes(b.text.slice(0, 20))) ||
          b.text === currentText;

        if (isMatch) {
          replaced = true;
          return { ...b, text: rewriteText };
        }
        return b;
      });
      return { ...proj, bullets: updatedBullets };
    });

    if (replaced) {
      onUpdateMaster({ 
        ...masterResume, 
        experiences: updatedExperiences,
        projects: updatedProjects
      });
      if (auditReport) {
        setAuditReport({
          ...auditReport,
          metricOpportunities: auditReport.metricOpportunities.filter((o: any) => o.currentText !== currentText),
        });
      }
      if (onShowToast) {
        onShowToast('Factual Upgrade Saved: Master Resume updated with the metric-aligned rewrite!');
      } else {
        alert('Success! Master Resume has been updated with the metric-aligned rewrite.');
      }
    } else {
      if (onShowToast) {
        onShowToast('Matching bullet point not found in your current Master Resume. Please verify that the experience has not been modified or cleared.');
      } else {
        alert('Could not locate matching bullet point in your active Master Resume. Please check that the experience has not been edited or deleted.');
      }
    }
  };

  const applyAddSkill = (skill: string, categoryName: string) => {
    const updatedCategories = masterResume.skillCategories.map((c) => {
      const isTargetCategory = c.category.toLowerCase().includes(categoryName.toLowerCase()) || 
                               c.id === masterResume.skillCategories[0]?.id;
      if (isTargetCategory && !c.skills.includes(skill)) {
        return { ...c, skills: [...c.skills, skill] };
      }
      return c;
    });

    onUpdateMaster({ ...masterResume, skillCategories: updatedCategories });
    if (auditReport) {
      setAuditReport({
        ...auditReport,
        unindexedSkillsFound: auditReport.unindexedSkillsFound.filter((s: any) => s.skill !== skill),
      });
    }
    if (onShowToast) {
      onShowToast(`Skill Added: "${skill}" is now in your Master Skills Taxonomy!`);
    } else {
      alert(`Success! "${skill}" has been added to your Master Skills Taxonomy.`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* ---------------------------------- */}
      {/* SECTION 1: SYSTEM SNAPSHOTS & FACTUAL DRIFT CONTROLLER */}
      {/* ---------------------------------- */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold border border-cyan-500/20 mb-2">
              <History className="w-3.5 h-3.5" />
              <span>Free Local Server Database & Drift Detection</span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">Canonical Baseline Snapshots</h2>
            <p className="text-xs text-slate-400 max-w-xl mt-1 leading-relaxed">
              Snapshots are stored <strong>directly on your server files for free</strong> next to the source code (instant sub-millisecond retrieve). 
              Every save automatically runs a factual drift check to protect you from AI hallucinations or unwanted changes.
            </p>
          </div>

          <form onSubmit={handleSaveSnapshot} className="flex gap-2 w-full md:w-auto">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Tag this snapshot (e.g. Added Project 3)..."
              className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 w-full md:w-64"
            />
            <button
              type="submit"
              disabled={isSavingSnapshot}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              {isSavingSnapshot ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>Save Baseline</span>
            </button>
          </form>
        </div>

        {snapshotSuccess && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{snapshotSuccess}</span>
          </div>
        )}

        {/* Snapshots History List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Snapshot Timeline & Drift Analysis</h3>
            {isPreviewLoading && (
              <span className="text-[10px] text-cyan-400 animate-pulse font-semibold">Constructing baseline text...</span>
            )}
          </div>
          
          {isLoadingSnapshots && snapshots.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Retrieving local snapshots...</span>
            </div>
          ) : snapshots.length === 0 ? (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs">
              No historical baseline snapshots found on server disk. Enter a tag above and click "Save Baseline" to create your first secure factual checkpoint.
            </div>
          ) : (
            <div className="space-y-2.5">
              {snapshots.map((snap, index) => (
                <div 
                  key={snap.timestamp} 
                  className={`bg-slate-950 border rounded-xl overflow-hidden transition ${
                    snap.driftCount > 0 ? 'border-amber-500/30 bg-amber-950/5' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Snapshot Header Row */}
                  <div 
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                    onClick={() => setExpandedSnapshot(expandedSnapshot === index ? null : index)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg shrink-0 ${
                        snap.driftCount > 0 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-900 text-cyan-400 border border-slate-800'
                      }`}>
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white">{snap.comment}</span>
                          {index === 0 && (
                            <span className="text-[9px] font-semibold bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">
                              Active Baseline
                            </span>
                          )}
                          {snap.driftCount > 0 && (
                            <span className="text-[9px] font-semibold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>{snap.driftCount} Drift Detected</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Saved: {new Date(snap.date).toLocaleString()} • {snap.experienceCount} Roles • {snap.projectCount} Projects • {snap.skillsCount} Skills
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewBaseline(snap);
                        }}
                        className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-cyan-400 hover:text-cyan-300 border border-slate-800 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        title="View plain text representation"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View/Download Baseline</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewChanges(snap);
                        }}
                        className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-purple-400 hover:text-purple-300 border border-slate-800 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        title="View historical changes log"
                      >
                        <FileText className="w-3 h-3" />
                        <span>View/Download Changes</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestoreSnapshot(snap.timestamp);
                        }}
                        className="px-2.5 py-1.5 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 hover:text-white rounded-lg text-[10px] font-bold border border-cyan-800/30 transition flex items-center gap-1 cursor-pointer"
                        title="Restore this baseline snapshot"
                      >
                        <RotateCcw className="w-3 h-3 text-cyan-400 animate-spin-hover" />
                        <span>Restore Baseline</span>
                      </button>
                      
                      <div className="text-slate-400 hover:text-white ml-1">
                        {expandedSnapshot === index ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Snapshot Expanded Drift Details */}
                  {expandedSnapshot === index && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-900/60 bg-slate-950/80 space-y-3">
                      <div className="text-[11px] text-slate-400 font-semibold border-b border-slate-900 pb-1.5">
                        Factual Audit Details:
                      </div>
                      {snap.drifts && snap.drifts.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-[11px] text-amber-400 font-semibold flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>The following factual drifts/anomalies were introduced when comparing this document to the snapshot before it:</span>
                          </p>
                          <div className="grid grid-cols-1 gap-1.5 pl-5">
                            {snap.drifts.map((drift: any, dIdx: number) => (
                              <div key={dIdx} className="text-xs text-slate-300 flex items-start gap-1.5 bg-slate-900/50 p-2 rounded-lg border border-slate-800/60">
                                <span className="font-bold text-amber-400 shrink-0 uppercase text-[9px] tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 mt-0.5">
                                  {drift.type.replace('_', ' ')}
                                </span>
                                <div>
                                  <span className="text-slate-500 font-medium text-[10px] block mb-0.5">Section: {drift.section}</span>
                                  <span className="text-slate-300 leading-relaxed">{drift.message}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 bg-emerald-500/5 p-2.5 rounded-lg border border-emerald-500/10">
                          <CheckCircle className="w-4 h-4" />
                          <span>0 factual drifts detected. This snapshot is 100% aligned with its preceding baseline. Factual consistency is perfectly protected.</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ---------------------------------- */}
      {/* SECTION 2: GEMINI COMPILATION QUALITY AUDIT */}
      {/* ---------------------------------- */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Master Dossier Quality Assurance</span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">Structural Metrics & Style Audit</h2>
            <p className="text-xs text-slate-400 max-w-xl mt-1 leading-relaxed">
              Analyze your master portfolio with Gemini to spot weak verbs, unindexed technology tags, and lack of metrics. Ensure your facts are polished and ATS-primed.
            </p>
          </div>
          <button
            onClick={runAudit}
            disabled={isAuditing}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 disabled:opacity-60 cursor-pointer shrink-0"
          >
            {isAuditing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Auditing with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>{auditReport ? 'Re-run Master Audit' : 'Run Master Base Audit'}</span>
              </>
            )}
          </button>
        </div>

        {errorMsg && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
            {errorMsg}
          </div>
        )}

        {auditReport ? (
          <div className="space-y-6">
            {/* Health Score Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-indigo-950 border border-indigo-500/30 flex items-center justify-center font-black text-2xl text-cyan-400">
                  {auditReport.overallHealthScore}/100
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Health Rating</span>
                  <h3 className="text-sm font-bold text-white">Structural Rigor</h3>
                </div>
              </div>

              <div className="md:col-span-3 bg-slate-950 border border-slate-800 rounded-xl p-5 flex items-center">
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{auditReport.summaryAssessment}"
                </p>
              </div>
            </div>

            {/* Metric Upgrades */}
            {auditReport.metricOpportunities && auditReport.metricOpportunities.length > 0 && (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-bold text-white text-sm">
                      Quantifiable Metric Upgrades ({auditReport.metricOpportunities.length})
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400">Google XYZ Formula: "Accomplished [X] by doing [Z], as measured by [Y]"</span>
                </div>

                <div className="space-y-3">
                  {auditReport.metricOpportunities.map((item: any, idx: number) => (
                    <div key={idx} className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-semibold">{item.location}</span>
                        <button
                          onClick={() => applyRewrite(item.currentText, item.suggestedRewrite)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium transition cursor-pointer"
                        >
                          Apply Rewrite to Master
                        </button>
                      </div>
                      <div className="text-xs text-slate-400 line-through">
                        "{item.currentText}"
                      </div>
                      <div className="text-xs text-emerald-300 font-medium">
                        ➜ "{item.suggestedRewrite}"
                      </div>
                      {item.enhancementReason && (
                        <p className="text-[11px] text-slate-500 italic">Insight: {item.enhancementReason}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unindexed Skills Found */}
            {auditReport.unindexedSkillsFound && auditReport.unindexedSkillsFound.length > 0 && (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Unindexed Skills Discovered in Text</span>
                </h3>
                <p className="text-xs text-slate-400">
                  These capabilities were mentioned inside your role descriptions, but were missing from your explicit Skills Taxonomy.
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  {auditReport.unindexedSkillsFound.map((s: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-lg text-xs"
                    >
                      <span className="font-medium text-slate-200">{s.skill}</span>
                      <span className="text-[10px] text-slate-500">({s.category})</span>
                      <button
                        onClick={() => applyAddSkill(s.skill, s.category)}
                        className="p-1 text-cyan-400 hover:text-cyan-300 transition"
                        title="Add to Master Skills"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-950/40 border border-dashed border-slate-850 rounded-2xl p-12 text-center">
            <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">QA Report Ready</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
              Click "Run Master Base Audit" to analyze your master resume dossier for metrics density, active keywords, and unindexed tags.
            </p>
          </div>
        )}
      </div>

      {/* ---------------------------------- */}
      {/* LOCAL TEXTUAL BASLINE & DRIFT PREVIEW DIALOG MODAL */}
      {/* ---------------------------------- */}
      {previewModal && previewModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-2 text-cyan-400">
                <FileText className="w-5 h-5" />
                <h3 className="font-bold text-white text-sm">{previewModal.title}</h3>
              </div>
              <button
                onClick={() => setPreviewModal(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 bg-slate-950/60">
              <textarea
                readOnly
                rows={20}
                value={previewModal.text}
                className="w-full h-full min-h-[350px] bg-slate-950 border border-slate-850 rounded-xl p-4 text-[11px] text-slate-300 font-mono leading-relaxed focus:outline-none focus:ring-0"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
              <span className="text-[10px] text-slate-500 italic">
                * Highly readable Markdown formatting; suitable for direct human verification or automated machine parsing.
              </span>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Close Preview
                </button>

                {previewModal.jsonRaw && (
                  <button
                    onClick={() => downloadTextFile(JSON.stringify(previewModal.jsonRaw, null, 2), previewModal.filename, '.json')}
                    className="flex items-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition"
                    title="Download raw machine functional JSON backup file"
                  >
                    <FileJson className="w-3.5 h-3.5 text-slate-400" />
                    <span>Download JSON</span>
                  </button>
                )}

                <button
                  onClick={() => downloadTextFile(previewModal.text, previewModal.filename, '.txt')}
                  className="flex items-center gap-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-cyan-600/10 cursor-pointer"
                  title="Download formatted text file"
                >
                  <Download className="w-3.5 h-3.5 text-white" />
                  <span>Download Plain Text (.TXT)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
