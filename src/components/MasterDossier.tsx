import React, { useState } from 'react';
import { JobIngestion } from './JobIngestion';
import {
  Briefcase,
  FolderGit2,
  Code2,
  GraduationCap,
  Award,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Tag,
  Sparkles,
  Search,
  Upload,
  User,
  Book,
  Edit3,
  Check,
  Zap,
  RefreshCw,
  Download,
  MapPin,
  Globe,
  Compass,
  FileText,
  ExternalLink,
  Eye,
  EyeOff,
  X,
} from 'lucide-react';
import { MasterResume, WorkExperience, BulletPoint, SkillCategory, ProjectItem, TailoredResume, CertificationItem, ContactInfo } from '../types/resume';

const DEFAULT_CONTACT: ContactInfo = {
  fullName: '',
  headline: '',
  email: '',
  phone: '',
  location: '',
  residentialAddress: '',
  currentStatus: '',
  relocationDetails: '',
  linkedin: '',
  github: '',
  website: '',
  websiteList: []
};

interface MasterDossierProps {
  masterResume?: MasterResume | null;
  onUpdateMaster: (updated: MasterResume) => void;
  onOpenImportModal: () => void;
  onNavigateToTailor: () => void;
  onResetToSample?: () => void;
  onExportJson?: () => void;
  onExportTxt?: () => void;
  onIngestJob: (content: string, type: 'url' | 'pdf' | 'text') => Promise<void>;
  onReIngestJob: () => Promise<void>;
  onSelectHistoryJob: (job: TailoredResume) => void;
  isJobParsing: boolean;
  jobParseError: string | null;
  hasIngestedJob: boolean;
  history: TailoredResume[];
  onShowToast: (msg: string) => void;
}

export const MasterDossier: React.FC<MasterDossierProps> = ({
  masterResume,
  onUpdateMaster,
  onOpenImportModal,
  onNavigateToTailor,
  onResetToSample,
  onExportJson,
  onExportTxt,
  onIngestJob,
  onReIngestJob,
  onSelectHistoryJob,
  isJobParsing,
  jobParseError,
  hasIngestedJob,
  history,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'experience' | 'skills' | 'projects' | 'summaries' | 'education' | 'volunteer' | 'development' | 'awards'>('experience');
  const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>({});
  const [draftContact, setDraftContact] = useState<ContactInfo>(masterResume?.contact || DEFAULT_CONTACT);
  const [editingCertId, setEditingCertId] = useState<string | null>(null);
  const [certDraft, setCertDraft] = useState<Partial<CertificationItem>>({});
  const [isAddingCert, setIsAddingCert] = useState(false);
  const [newCert, setNewCert] = useState<Partial<CertificationItem>>({
    name: '',
    issuer: '',
    date: new Date().getFullYear().toString(),
    credentialId: '',
    url: '',
    hidden: false,
  });

  React.useEffect(() => {
    if (masterResume?.contact) {
      setDraftContact(masterResume.contact);
    }
  }, [masterResume?.contact]);

  if (!masterResume) {
    return <div className="p-8 text-center text-slate-400">Loading master dossier...</div>;
  }

  const handleUpdateMaster = (updated: MasterResume) => {
    const cleaned = {
        ...updated,
        education: updated.education.map(edu => ({ ...edu, graduationYear: '' }))
    };
    onUpdateMaster(cleaned);
  };

  const toggleRole = (id: string) => {
    setExpandedRoles((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleUpdateContact = (field: string, value: string) => {
    setDraftContact((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveContact = () => {
    handleUpdateMaster({
      ...masterResume,
      contact: draftContact,
    });
    onShowToast('Profile updated successfully!');
  };

  const handleStartEditCert = (c: CertificationItem) => {
    setEditingCertId(c.id);
    setCertDraft({ ...c });
  };

  const handleSaveCert = () => {
    if (!editingCertId || !certDraft.name?.trim()) return;
    const updated = {
      ...masterResume,
      certifications: (masterResume.certifications || []).map((c) =>
        c.id === editingCertId ? ({ ...c, ...certDraft, name: certDraft.name?.trim() || c.name } as CertificationItem) : c
      ),
    };
    handleUpdateMaster(updated);
    setEditingCertId(null);
    setCertDraft({});
    onShowToast('Certification updated successfully!');
  };

  const handleToggleCertVisibility = (id: string) => {
    const updated = {
      ...masterResume,
      certifications: (masterResume.certifications || []).map((c) =>
        c.id === id ? { ...c, hidden: !c.hidden } : c
      ),
    };
    handleUpdateMaster(updated);
    const target = masterResume.certifications.find((c) => c.id === id);
    const stateStr = target?.hidden ? 'included in' : 'hidden from';
    onShowToast(`Certification will now be ${stateStr} generated resumes.`);
  };

  const handleDeleteCert = (id: string) => {
    if (window.confirm('Are you sure you want to remove this certification from your master record?')) {
      const updated = {
        ...masterResume,
        certifications: (masterResume.certifications || []).filter((c) => c.id !== id),
      };
      handleUpdateMaster(updated);
      setEditingCertId(null);
      onShowToast('Certification deleted.');
    }
  };

  const handleAddCert = () => {
    if (!newCert.name?.trim()) return;
    const item: CertificationItem = {
      id: `cert-${Date.now()}`,
      name: newCert.name.trim(),
      issuer: newCert.issuer?.trim() || 'Google',
      date: newCert.date?.trim() || new Date().getFullYear().toString(),
      credentialId: newCert.credentialId?.trim() || '',
      url: newCert.url?.trim() || '',
      hidden: false,
    };
    const updated = {
      ...masterResume,
      certifications: [...(masterResume.certifications || []), item],
    };
    handleUpdateMaster(updated);
    setIsAddingCert(false);
    setNewCert({
      name: '',
      issuer: '',
      date: new Date().getFullYear().toString(),
      credentialId: '',
      url: '',
      hidden: false,
    });
    onShowToast('Certification added!');
  };

  const handleQuickAddAppDev = (c: CertificationItem) => {
    let newName = c.name;
    if (newName.includes('App Building')) {
      newName = newName.replace('App Building', 'App Building, App Development');
    } else if (newName.endsWith(')')) {
      newName = newName.replace(/\)$/, ', App Development)');
    } else {
      newName = `${newName} (App Development)`;
    }
    const updated = {
      ...masterResume,
      certifications: (masterResume.certifications || []).map((item) =>
        item.id === c.id ? { ...item, name: newName } : item
      ),
    };
    handleUpdateMaster(updated);
    onShowToast('Added "App Development" to Google AI Certificate!');
  };

  const handleAddBullet = (expId: string) => {
    const updated = {
      ...masterResume,
      experiences: (masterResume?.experiences || []).map((exp) => {
        if (exp.id === expId) {
          const newBullet: BulletPoint = {
            id: `b-${Date.now()}`,
            text: 'Spearheaded implementation of [Feature/System], improving [Metric] by [Percentage/Amount].',
            impactMetric: '+XX% Improvement',
            tags: ['Engineering'],
          };
          return { ...exp, bullets: [...(exp.bullets || []), newBullet] };
        }
        return exp;
      }),
    };
    handleUpdateMaster(updated);
  };

  const handleUpdateBullet = (expId: string, bulletId: string, newText: string, newMetric?: string) => {
    const updated = {
      ...masterResume,
      experiences: (masterResume?.experiences || []).map((exp) => {
        if (exp.id === expId) {
          return {
            ...exp,
            bullets: (exp.bullets || []).map((b) =>
              b.id === bulletId ? { ...b, text: newText, impactMetric: newMetric ?? b.impactMetric } : b
            ),
          };
        }
        return exp;
      }),
    };
    handleUpdateMaster(updated);
  };

  const handleDeleteBullet = (expId: string, bulletId: string) => {
    const updated = {
      ...masterResume,
      experiences: (masterResume?.experiences || []).map((exp) => {
        if (exp.id === expId) {
          return {
            ...exp,
            bullets: (exp.bullets || []).filter((b) => b.id !== bulletId),
          };
        }
        return exp;
      }),
    };
    handleUpdateMaster(updated);
  };
  
  const handleAddDataDrivenBullets = () => {
    const updated = {
      ...masterResume,
      experiences: (masterResume?.experiences || []).map((exp) => {
        if (exp.company === 'Ready Team One') {
           const newBullets: BulletPoint[] = [
             { id: `b-${Date.now()}-1`, text: 'Analyzed user engagement metrics within VR environments to identify and optimize performance bottlenecks, leading to a 15% increase in session retention.', impactMetric: '+15% Retention' },
             { id: `b-${Date.now()}-2`, text: 'Implemented automated data collection pipelines to track player behavior, providing actionable insights that prioritized VR feature development and bug fixes.', impactMetric: 'Actionable Insights' },
             { id: `b-${Date.now()}-3`, text: 'Developed and maintained visualization dashboards to track operational KPIs for distributed remote teams, ensuring local productivity aligned with international business targets.', impactMetric: 'KPI Tracking' }
           ];
           return { ...exp, bullets: [...exp.bullets, ...newBullets] };
        }
        return exp;
      }),
    };
    handleUpdateMaster(updated);
  };

  const handleAddSkillToCategory = (catId: string, skill: string) => {
    if (!skill.trim()) return;
    const updated = {
      ...masterResume,
      skillCategories: masterResume.skillCategories.map((c) => {
        if (c.id === catId && !c.skills.includes(skill.trim())) {
          return { ...c, skills: [...c.skills, skill.trim()] };
        }
        return c;
      }),
    };
    handleUpdateMaster(updated);
  };

  const handleRemoveSkillFromCategory = (catId: string, skillToRemove: string) => {
    const updated = {
      ...masterResume,
      skillCategories: masterResume.skillCategories.map((c) => {
        if (c.id === catId) {
          return { ...c, skills: c.skills.filter((s) => s !== skillToRemove) };
        }
        return c;
      }),
    };
    handleUpdateMaster(updated);
  };

  const totalBullets = masterResume.experiences.reduce((sum, e) => sum + e.bullets.length, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Hero Ingestion Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-900/50 rounded-2xl p-6 shadow-xl mb-6">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-medium border border-indigo-500/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Comprehensive Career Single Source of Truth
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Master Career Dossier</h1>
            <p className="text-slate-300 text-sm max-w-2xl mt-1">
              Store <strong>every single project, metric, technology, and bullet point</strong> without fear of length.
              When applying to any job, the Gemini engine cherry-picks and rephrases the exact facts needed to propagate a targeted 1 or 2 page resume.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onNavigateToTailor}
              disabled={!hasIngestedJob}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/30 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="w-4 h-4 text-white" />
              <span>Tailor For A Job</span>
            </button>
            {onExportTxt && (
              <button
                onClick={onExportTxt}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/50 rounded-xl text-xs font-semibold transition shadow-sm"
                title="Download full canonical Master Truth Document as readable plain text (*.txt)"
              >
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Export Master</span>
              </button>
            )}
            {onExportJson && (
              <button
                onClick={onExportJson}
                className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                title="Download full Master Dossier as JSON backup"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Export JSON</span>
              </button>
            )}
            {onResetToSample && (
              <button
                onClick={onResetToSample}
                className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-900/90 hover:bg-rose-950/20 text-rose-400 border border-slate-700 hover:border-rose-900/50 rounded-xl text-xs font-semibold transition cursor-pointer"
                title="Reset active screen data to the codebase static baseline (loads Project 4 and new skills)"
              >
                <RefreshCw className="w-3.5 h-3.5 text-rose-400" />
                <span>Reset to Codebase</span>
              </button>
            )}
          </div>
        </div>
      </div>


      <JobIngestion 
        onIngestJob={onIngestJob} 
        onReIngestJob={onReIngestJob}
        onSelectHistoryJob={onSelectHistoryJob} 
        isParsing={isJobParsing} 
        errorMsg={jobParseError} 
        history={history} 
      />

      {/* Contact & Executive Profile Quick Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <User className="w-4 h-4 text-indigo-400" />
            <span>Candidate Master Profile</span>
          </div>
          <span className="text-xs text-slate-400">Used across all tailored exports</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs mb-3">
          <div>
            <label className="text-slate-400 block mb-1">Full Legal / Display Name</label>
            <input
              type="text"
              value={draftContact.fullName ?? ''}
              onChange={(e) => handleUpdateContact('fullName', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Primary Headline</label>
            <input
              type="text"
              value={draftContact.headline ?? ''}
              onChange={(e) => handleUpdateContact('headline', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Email</label>
            <input
              type="text"
              value={draftContact.email ?? ''}
              onChange={(e) => handleUpdateContact('email', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Public Resume Location Line</label>
            <input
              type="text"
              value={draftContact.location ?? ''}
              onChange={(e) => handleUpdateContact('location', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Global Mobility & Residential Address Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-3 border-t border-slate-800/70">
          <div>
            <label className="text-slate-400 block mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>Official Residential Address (Australia)</span>
            </label>
            <input
              type="text"
              value={draftContact.residentialAddress ?? ''}
              onChange={(e) => handleUpdateContact('residentialAddress', e.target.value)}
              placeholder="Unit 10, 187 Walcott St, Mount Lawley, WA, Australia, 6050"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Remote Work Availability</span>
            </label>
            <input
              type="text"
              value={draftContact.currentStatus ?? ''}
              onChange={(e) => handleUpdateContact('currentStatus', e.target.value)}
              placeholder="Immediate"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Geo-Restricted Work Availability</span>
            </label>
            <input
              type="text"
              value={draftContact.relocationDetails ?? ''}
              onChange={(e) => handleUpdateContact('relocationDetails', e.target.value)}
              placeholder="One Month, Japan Preferred"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex items-end justify-end">
            <button
              onClick={handleSaveContact}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition"
            >
              <Check className="w-3.5 h-3.5" />
              Update Profile
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Section Navigation & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveSubTab('experience')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              activeSubTab === 'experience'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Experience ({masterResume.experiences.length})</span>
            <span className="text-[10px] bg-indigo-950/60 px-1.5 py-0.2 rounded-full border border-indigo-500/30">
              {totalBullets} bullets
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('skills')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              activeSubTab === 'skills'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Skills Taxonomy ({masterResume.skillCategories.length} categories)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('projects')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              activeSubTab === 'projects'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Key Projects ({masterResume.projects.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('summaries')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              activeSubTab === 'summaries'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Summary Tracks ({masterResume.executiveSummaries.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('education')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              activeSubTab === 'education'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Education & Certs</span>
          </button>
          <button
            onClick={() => setActiveSubTab('volunteer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              activeSubTab === 'volunteer'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Volunteer</span>
          </button>
          <button
            onClick={() => setActiveSubTab('development')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              activeSubTab === 'development'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Book className="w-3.5 h-3.5" />
            <span>Dev/Training</span>
          </button>
          <button
            onClick={() => setActiveSubTab('awards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              activeSubTab === 'awards'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Awards</span>
          </button>
        </div>

        {/* Search filter within master */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search bullets & skills..."
            value={searchTerm ?? ''}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* 1. EXPERIENCE TAB */}
      {activeSubTab === 'experience' && (
        <div className="space-y-4">
          {masterResume.experiences
            .filter((exp) => {
              if (!searchTerm) return true;
              const term = searchTerm.toLowerCase();
              return (
                exp.company.toLowerCase().includes(term) ||
                exp.role.toLowerCase().includes(term) ||
                exp.bullets.some((b) => b.text.toLowerCase().includes(term)) ||
                exp.technologies.some((t) => t.toLowerCase().includes(term))
              );
            })
            .map((exp) => {
              const isExpanded = expandedRoles[exp.id] ?? false;

              return (
                <div
                  key={exp.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm transition hover:border-slate-700"
                >
                  {/* Role Header Strip */}
                  <div
                    onClick={() => toggleRole(exp.id)}
                    className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer bg-slate-900 hover:bg-slate-850"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base">{exp.role}</span>
                        <span className="text-slate-400">@</span>
                        <span className="font-semibold text-indigo-400">{exp.company}</span>
                        {exp.isCurrent && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-3">
                        <span>
                          {exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate}
                        </span>
                        {exp.location && <span>• {exp.location}</span>}
                        <span>• {exp.bullets.length} master bullets</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex flex-wrap gap-1 max-w-sm justify-end">
                        {exp.technologies.slice(0, 4).map((tech, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded"
                          >
                            {tech}
                          </span>
                        ))}
                        {exp.technologies.length > 4 && (
                          <span className="text-[10px] text-slate-500">+{exp.technologies.length - 4} more</span>
                        )}
                      </div>
                      <div className="p-1 text-slate-400 hover:text-white">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Body */}
                  {isExpanded && (
                    <div className="p-4 border-t border-slate-800/80 bg-slate-950/50 space-y-4">
                      {exp.summary && (
                        <p className="text-xs text-slate-400 italic bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                          {exp.summary}
                        </p>
                      )}

                      {/* Bullets List */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                          <span>Historical Bullets & Impact Records ({exp.bullets.length})</span>
                          <button
                            onClick={() => handleAddBullet(exp.id)}
                            className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add Bullet Point
                          </button>
                        </div>

                        {exp.bullets.map((bullet) => (
                          <div
                            key={bullet.id}
                            className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-2 hover:border-slate-700 transition"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <textarea
                                rows={2}
                                value={bullet.text ?? ''}
                                onChange={(e) => handleUpdateBullet(exp.id, bullet.id, e.target.value)}
                                className="w-full bg-slate-950/80 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed resize-y"
                              />
                              <button
                                onClick={() => handleDeleteBullet(exp.id, bullet.id)}
                                className="text-slate-500 hover:text-rose-400 p-1 transition"
                                title="Delete bullet"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/50 text-[11px]">
                              <div className="flex items-center gap-2">
                                <span className="text-slate-500">Metric Badge:</span>
                                <input
                                  type="text"
                                  value={bullet.impactMetric || ''}
                                  placeholder="e.g. 40% latency reduction"
                                  onChange={(e) => handleUpdateBullet(exp.id, bullet.id, bullet.text, e.target.value)}
                                  className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-emerald-400 text-[11px] placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                                />
                              </div>

                              <div className="flex items-center gap-1">
                                {(bullet.tags || []).map((t, idx) => (
                                  <span
                                    key={idx}
                                    className="bg-indigo-950/40 text-indigo-300 border border-indigo-900/50 px-1.5 py-0.2 rounded text-[10px]"
                                  >
                                    #{t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Tech stack tags */}
                      <div className="pt-2">
                        <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-semibold text-slate-400 block">
                              Role Technologies & Tools:
                            </label>
                            {exp.company === 'Ready Team One' && (
                                <button onClick={handleAddDataDrivenBullets} className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium">Add Data-Driven Bullets</button>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {exp.technologies.map((t, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-slate-800 text-slate-200 border border-slate-700 px-2 py-1 rounded-md"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {/* 2. SKILLS TAXONOMY TAB */}
      {activeSubTab === 'skills' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {masterResume.skillCategories.map((cat) => {
            return (
              <div key={cat.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-slate-200 text-sm">{cat.category}</span>
                  <span className="text-xs text-slate-500">{cat.skills.length} skills</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {cat.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="group inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs px-2.5 py-1 rounded-lg border border-slate-700"
                    >
                      <span>{skill}</span>
                      <button
                        onClick={() => handleRemoveSkillFromCategory(cat.id, skill)}
                        className="text-slate-500 hover:text-rose-400 opacity-60 group-hover:opacity-100 transition"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                {/* Quick Add Skill Input */}
                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Add skill to ${cat.category}...`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddSkillToCategory(cat.id, (e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-slate-500">Press Enter</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. PROJECTS TAB */}
      {activeSubTab === 'projects' && (
        <div className="space-y-4">
          {masterResume.projects.map((proj) => (
            <div key={proj.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-base">{proj.name}</h3>
                  <div className="text-xs text-indigo-400 flex flex-wrap items-center gap-2 mt-0.5">
                    {proj.role && <span>{proj.role}</span>}
                    {proj.period && <span>• {proj.period}</span>}
                    {proj.link && (
                      <span className="flex items-center gap-1 text-cyan-400 hover:underline">
                        •{' '}
                        <a
                          href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {proj.link}
                        </a>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {proj.description && <p className="text-xs text-slate-300">{proj.description}</p>}

              <div className="space-y-1.5">
                {proj.bullets.map((b) => (
                  <div key={b.id} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-indigo-400">•</span>
                    <span>{b.text}</span>
                    {b.impactMetric && (
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
                        {b.impactMetric}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-1 pt-1">
                {proj.technologies.map((t, idx) => (
                  <span key={idx} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. EXECUTIVE SUMMARIES TAB */}
      {activeSubTab === 'summaries' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Maintain ready-made executive summaries tailored to different career tracks. When generating a targeted resume, Gemini will select or blend these according to the target job description.
          </p>
          {masterResume.executiveSummaries.map((summary) => (
            <div key={summary.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-300 text-sm">{summary.focusTrack}</span>
              </div>
              <textarea
                rows={3}
                value={summary.text ?? ''}
                onChange={(e) => {
                  const updated = {
                    ...masterResume,
                    executiveSummaries: masterResume.executiveSummaries.map((s) =>
                      s.id === summary.id ? { ...s, text: e.target.value } : s
                    ),
                  };
                  onUpdateMaster(updated);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-indigo-500"
              />
            </div>
          ))}
        </div>
      )}

      {/* 5. EDUCATION TAB */}
      {activeSubTab === 'education' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <span>Education</span>
            </h3>
            {masterResume.education.map((edu) => (
              <div key={edu.id} className="border-b border-slate-800 last:border-0 pb-3 last:pb-0 space-y-1 text-xs">
                <div className="font-semibold text-white">{edu.degree} in {edu.fieldOfStudy}</div>
                <div className="text-slate-400">{edu.institution}</div>
                {edu.honors && <div className="text-indigo-400 text-[11px]">{edu.honors}</div>}
              </div>
            ))}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-cyan-400" />
                <span>Certifications</span>
                <span className="text-xs font-normal text-slate-500">
                  ({masterResume.certifications?.length || 0})
                </span>
              </h3>
              <button
                onClick={() => setIsAddingCert(!isAddingCert)}
                className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 hover:text-white rounded-lg text-xs font-medium border border-indigo-500/30 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Certificate</span>
              </button>
            </div>

            {/* Quick Add Form */}
            {isAddingCert && (
              <div className="p-3.5 bg-slate-950/80 border border-indigo-500/30 rounded-lg space-y-3">
                <div className="text-xs font-semibold text-indigo-300">New Certification</div>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Certificate Title (e.g. Google AI Certificate (...))"
                    value={newCert.name || ''}
                    onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Issuer (e.g. Google)"
                      value={newCert.issuer || ''}
                      onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                      className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      placeholder="Year / Date (e.g. 2026)"
                      value={newCert.date || ''}
                      onChange={(e) => setNewCert({ ...newCert, date: e.target.value })}
                      className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Verification URL (optional)"
                    value={newCert.url || ''}
                    onChange={(e) => setNewCert({ ...newCert, url: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => setIsAddingCert(false)}
                    className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCert}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded shadow-sm"
                  >
                    Save Certificate
                  </button>
                </div>
              </div>
            )}

            {/* Certifications List */}
            <div className="space-y-3">
              {masterResume.certifications.map((c) => {
                const isEditing = editingCertId === c.id;
                const isGoogleAi = c.name.toLowerCase().includes('google ai certificate');
                const missingAppDev = isGoogleAi && !c.name.includes('App Development');

                if (isEditing) {
                  return (
                    <div key={c.id} className="p-3 bg-slate-950/90 border border-indigo-500/40 rounded-lg space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-indigo-300">Edit Certification</span>
                        {missingAppDev && (
                          <button
                            type="button"
                            onClick={() => {
                              const cur = certDraft.name || '';
                              let updated = cur;
                              if (updated.includes('App Building')) {
                                updated = updated.replace('App Building', 'App Building, App Development');
                              } else if (updated.endsWith(')')) {
                                updated = updated.replace(/\)$/, ', App Development)');
                              } else {
                                updated = `${updated} (App Development)`;
                              }
                              setCertDraft({ ...certDraft, name: updated });
                            }}
                            className="text-[10px] bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:text-white px-2 py-0.5 rounded transition flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3 text-cyan-400" />
                            <span>+ Insert "App Development"</span>
                          </button>
                        )}
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Certificate Title & Modules:</label>
                        <textarea
                          rows={2}
                          value={certDraft.name || ''}
                          onChange={(e) => setCertDraft({ ...certDraft, name: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">Issuer:</label>
                          <input
                            type="text"
                            value={certDraft.issuer || ''}
                            onChange={(e) => setCertDraft({ ...certDraft, issuer: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">Date / Year:</label>
                          <input
                            type="text"
                            value={certDraft.date || ''}
                            onChange={(e) => setCertDraft({ ...certDraft, date: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Credential URL:</label>
                        <input
                          type="text"
                          value={certDraft.url || ''}
                          onChange={(e) => setCertDraft({ ...certDraft, url: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => handleDeleteCert(c.id)}
                          className="text-rose-400 hover:text-rose-300 text-xs flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCertId(null);
                              setCertDraft({});
                            }}
                            className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveCert}
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded flex items-center gap-1 shadow-sm"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Save Changes</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={c.id}
                    className={`border-b border-slate-800 last:border-0 pb-3 last:pb-0 space-y-1.5 text-xs transition ${
                      c.hidden ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="font-semibold text-white flex flex-wrap items-center gap-1.5">
                          <span>{c.name}</span>
                          {c.hidden && (
                            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded border border-slate-700">
                              Hidden from resumes
                            </span>
                          )}
                          {c.url && (
                            <a
                              href={c.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-400 hover:text-cyan-300 text-[11px] inline-flex items-center gap-0.5 hover:underline ml-1"
                              title="View Verified Credential"
                            >
                              <span>Verify</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>

                        {/* Quick 1-click fix button if Google AI Cert is missing App Development */}
                        {missingAppDev && (
                          <div className="pt-0.5">
                            <button
                              type="button"
                              onClick={() => handleQuickAddAppDev(c)}
                              className="inline-flex items-center gap-1 text-[11px] font-medium bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-200 px-2 py-0.5 rounded-md transition shadow-sm"
                              title="Click to automatically add App Development into the brackets"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                              <span>+ Add "App Development" to certificate</span>
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <button
                          type="button"
                          onClick={() => handleToggleCertVisibility(c.id)}
                          className={`p-1.5 rounded transition ${
                            c.hidden
                              ? 'text-slate-500 hover:text-slate-300 bg-slate-800/40'
                              : 'text-cyan-400 hover:text-cyan-300 hover:bg-slate-800'
                          }`}
                          title={c.hidden ? 'Show on tailored resumes' : 'Hide from tailored resumes'}
                        >
                          {c.hidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartEditCert(c)}
                          className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded transition"
                          title="Edit certification"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCert(c.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition"
                          title="Delete certification"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-slate-400 text-[11px]">
                      {c.issuer} • {c.date}
                      {c.credentialId && <span className="ml-2 text-slate-500">ID: {c.credentialId}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      </div>
    );
  };


