/**
 * File: src/components/MasterDossier.tsx
 * Description: Core Career Profile editor and canonical dossier manager.
 * Author: Luke Frohling
 */

import React, { useState } from 'react';
import { JobIngestion } from './JobIngestion';
import { PURE_USER_MASTER_RESUME } from '../services/sampleData';
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
  ShieldCheck,
  HeartHandshake,
  Users,
  Phone,
  Mail,
  HelpCircle,
  Clock,
  Layers,
  History,
  Copy,
} from 'lucide-react';
import {
  MasterResume,
  WorkExperience,
  BulletPoint,
  SkillCategory,
  ProjectItem,
  TailoredResume,
  CertificationItem,
  ContactInfo,
  LicenseItem,
  VolunteerItem,
  TrainingItem,
  RefereeItem,
  MilestoneSection,
} from '../types/resume';

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
  onOpenSnapshotsModal?: () => void;
  onSyncCanonicalTruth?: () => void;
  onExportJson?: () => void;
  onExportTxt?: () => void;
  onIngestJob: (content: string, type: 'url' | 'pdf' | 'text', industry: string, pageBudget?: number, overrides?: any) => Promise<void>;
  onReIngestJob: (specificContent?: string, pageBudget?: number, overrides?: any) => Promise<void>;


  onSelectHistoryJob: (job: TailoredResume) => void;
  isJobParsing: boolean;
  jobParseError: string | null;
  hasIngestedJob: boolean;
  history: TailoredResume[];
  onShowToast: (msg: string) => void;
}

type SubTabKey =
  | 'experience'
  | 'skills'
  | 'projects'
  | 'summaries'
  | 'education'
  | 'licenses'
  | 'volunteer'
  | 'development'
  | 'referees'
  | 'awards';

export const MasterDossier: React.FC<MasterDossierProps> = ({
  masterResume,
  onUpdateMaster,
  onOpenImportModal,
  onNavigateToTailor,
  onResetToSample,
  onOpenSnapshotsModal,
  onSyncCanonicalTruth,
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
  const [activeSubTab, setActiveSubTab] = useState<SubTabKey>('experience');
  const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>({});
  
    // Experience editing state
  const [isEditingExperience, setIsEditingExperience] = useState(false);
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [expDraft, setExpDraft] = useState<Partial<WorkExperience>>({});
  const [expTechInput, setExpTechInput] = useState('');

  const [draftContact, setDraftContact] = useState<ContactInfo>(masterResume?.contact || DEFAULT_CONTACT);

  // Skills Editing Mode state
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [newCatTitle, setNewCatTitle] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [deletingSkill, setDeletingSkill] = useState<{catId: string, skill: string} | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);

  // Certifications state
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

  // Licenses state
  const [isAddingLicense, setIsAddingLicense] = useState(false);
  const [editingLicenseId, setEditingLicenseId] = useState<string | null>(null);
  const [licenseDraft, setLicenseDraft] = useState<Partial<LicenseItem>>({});
  const [newLicense, setNewLicense] = useState<Partial<LicenseItem>>({
    name: '',
    authority: '',
    date: '',
    details: '',
    hidden: false,
  });

  // Projects state
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [projectAddMode, setProjectAddMode] = useState<'manual' | 'auto'>('auto');
  const [projectAutoRawText, setProjectAutoRawText] = useState('');
  const [newProject, setNewProject] = useState<Partial<ProjectItem>>({
    name: '',
    role: '',
    link: '',
    period: '',
    description: '',
    bullets: [],
    technologies: [],
  });
  const [projectBulletInput, setProjectBulletInput] = useState('');
  const [projectTechInput, setProjectTechInput] = useState('');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectDraft, setProjectDraft] = useState<Partial<ProjectItem>>({});
  const [projectEditBulletInput, setProjectEditBulletInput] = useState('');
  const [projectEditTechInput, setProjectEditTechInput] = useState('');

  // Exec Summaries editing state
  const [isEditingSummaries, setIsEditingSummaries] = useState(false);
  const [isAddingSummary, setIsAddingSummary] = useState(false);
  const [newSummaryTrack, setNewSummaryTrack] = useState('');
  const [newSummaryText, setNewSummaryText] = useState('');

  // Projects delete toggle state
  const [isDeletingProjects, setIsDeletingProjects] = useState(false);

  // Milestone Sections editing state
  const [isEditingMilestones, setIsEditingMilestones] = useState(false);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [activeSectionIdForMilestone, setActiveSectionIdForMilestone] = useState<string | null>(null);
  const [newMilestoneText, setNewMilestoneText] = useState('');

  // Volunteer state
  const [isAddingVolunteer, setIsAddingVolunteer] = useState(false);
  const [editingVolunteerId, setEditingVolunteerId] = useState<string | null>(null);
  const [volunteerDraft, setVolunteerDraft] = useState<Partial<VolunteerItem>>({});
  const [newVolunteer, setNewVolunteer] = useState<Partial<VolunteerItem>>({
    role: '',
    organization: '',
    period: '',
    location: '',
    description: '',
    bullets: [],
  });
  const [volunteerBulletInput, setVolunteerBulletInput] = useState('');

  // Development & Training state
  const [isAddingTraining, setIsAddingTraining] = useState(false);
  const [editingTrainingId, setEditingTrainingId] = useState<string | null>(null);
  const [trainingDraft, setTrainingDraft] = useState<Partial<TrainingItem>>({});
  const [newTraining, setNewTraining] = useState<Partial<TrainingItem>>({
    title: '',
    institution: '',
    year: '',
    description: '',
    skillsLearned: [],
  });
  const [trainingSkillInput, setTrainingSkillInput] = useState('');

  // Referees state
  const [refereeSearch, setRefereeSearch] = useState('');
  const [isAddingReferee, setIsAddingReferee] = useState(false);
  const [editingRefereeId, setEditingRefereeId] = useState<string | null>(null);
  const [refereeDraft, setRefereeDraft] = useState<Partial<RefereeItem>>({});
  const [newReferee, setNewReferee] = useState<Partial<RefereeItem>>({
    name: '',
    role: '',
    organization: '',
    contactPhone: '',
    contactEmail: '',
    relationship: '',
    notes: '',
  });

  React.useEffect(() => {
    if (masterResume?.contact) {
      setDraftContact(masterResume.contact);
    }
  }, [masterResume?.contact]);

  if (!masterResume) {
    return <div className="p-8 text-center text-slate-400">Loading Core Profile...</div>;
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
    onShowToast('Candidate profile updated and persisted!');
  };

  const handleToggleVisibility = (section: keyof MasterResume, id: string) => {
    const currentSection = masterResume[section as keyof MasterResume];
    if (!Array.isArray(currentSection)) return;

    const updated = {
      ...masterResume,
      [section]: currentSection.map((item: any) =>
        item.id === id ? { ...item, hidden: !item.hidden } : item
      ),
    };
    handleUpdateMaster(updated);
    onShowToast(`Item visibility toggled.`);
  };

  // --- CERTIFICATIONS HANDLERS ---
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
    if (window.confirm('Are you sure you want to remove this certification?')) {
      const updated = {
        ...masterResume,
        certifications: (masterResume.certifications || []).filter((c) => c.id !== id),
      };
      handleUpdateMaster(updated);
      setEditingCertId(null);
      onShowToast('Certification removed.');
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

  // --- LICENSES HANDLERS ---
  const handleAddLicense = () => {
    if (!newLicense.name?.trim()) return;
    const item: LicenseItem = {
      id: `lic-${Date.now()}`,
      name: newLicense.name.trim(),
      authority: newLicense.authority?.trim() || 'Government / Authorized Body',
      date: newLicense.date?.trim() || 'Current',
      details: newLicense.details?.trim() || '',
      hidden: false,
    };
    const updated = {
      ...masterResume,
      licenses: [...(masterResume.licenses || []), item],
    };
    handleUpdateMaster(updated);
    setIsAddingLicense(false);
    setNewLicense({ name: '', authority: '', date: '', details: '', hidden: false });
    onShowToast('License saved to Master Dossier!');
  };

  const handleSaveLicense = () => {
    if (!editingLicenseId || !licenseDraft.name?.trim()) return;
    const updated = {
      ...masterResume,
      licenses: (masterResume.licenses || []).map((l) =>
        l.id === editingLicenseId ? ({ ...l, ...licenseDraft, name: licenseDraft.name?.trim() || l.name } as LicenseItem) : l
      ),
    };
    handleUpdateMaster(updated);
    setEditingLicenseId(null);
    setLicenseDraft({});
    onShowToast('License updated!');
  };

  const handleToggleLicenseVisibility = (id: string) => {
    const updated = {
      ...masterResume,
      licenses: (masterResume.licenses || []).map((l) =>
        l.id === id ? { ...l, hidden: !l.hidden } : l
      ),
    };
    handleUpdateMaster(updated);
    const target = (masterResume.licenses || []).find((l) => l.id === id);
    const stateStr = target?.hidden ? 'included in' : 'hidden from';
    onShowToast(`License will now be ${stateStr} tailored resumes.`);
  };

  const handleDeleteLicense = (id: string) => {
    if (window.confirm('Delete this license from master record?')) {
      const updated = {
        ...masterResume,
        licenses: (masterResume.licenses || []).filter((l) => l.id !== id),
      };
      handleUpdateMaster(updated);
      setEditingLicenseId(null);
      onShowToast('License removed.');
    }
  };

  // --- VOLUNTEER HANDLERS ---
  const handleAddVolunteer = () => {
    if (!newVolunteer.role?.trim() || !newVolunteer.organization?.trim()) return;
    const item: VolunteerItem = {
      id: `vol-${Date.now()}`,
      role: newVolunteer.role.trim(),
      organization: newVolunteer.organization.trim(),
      period: newVolunteer.period?.trim() || 'Ongoing',
      location: newVolunteer.location?.trim() || 'Australia',
      description: newVolunteer.description?.trim() || '',
      bullets: newVolunteer.bullets || [],
    };
    const updated = {
      ...masterResume,
      volunteer: [...(masterResume.volunteer || []), item],
    };
    handleUpdateMaster(updated);
    setIsAddingVolunteer(false);
    setNewVolunteer({ role: '', organization: '', period: '', location: '', description: '', bullets: [] });
    setVolunteerBulletInput('');
    onShowToast('Volunteer record added!');
  };

  const handleSaveVolunteer = () => {
    if (!editingVolunteerId || !volunteerDraft.role?.trim()) return;
    const updated = {
      ...masterResume,
      volunteer: (masterResume.volunteer || []).map((v) =>
        v.id === editingVolunteerId ? ({ ...v, ...volunteerDraft } as VolunteerItem) : v
      ),
    };
    handleUpdateMaster(updated);
    setEditingVolunteerId(null);
    setVolunteerDraft({});
    onShowToast('Volunteer record updated!');
  };

  const handleDeleteVolunteer = (id: string) => {
    if (window.confirm('Delete this volunteer entry?')) {
      const updated = {
        ...masterResume,
        volunteer: (masterResume.volunteer || []).filter((v) => v.id !== id),
      };
      handleUpdateMaster(updated);
      setEditingVolunteerId(null);
      onShowToast('Volunteer record deleted.');
    }
  };

  // --- PROJECTS HANDLERS ---
  const handleAutoParseProject = (rawText: string) => {
    if (!rawText.trim()) return;
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    
    let name = '';
    let role = '';
    let period = '';
    let link = '';
    let tech: string[] = [];
    const bullets: { id: string; text: string; impactMetric?: string }[] = [];
    const descLines: string[] = [];

    lines.forEach((line) => {
      if (line.includes('|') && !name) {
        const parts = line.split('|').map(p => p.trim());
        name = parts[0];
        if (parts[1]) role = parts[1];
        return;
      }
      if (line.startsWith('Period:')) {
        period = line.replace('Period:', '').trim();
        return;
      }
      if (line.startsWith('Link:')) {
        link = line.replace('Link:', '').trim();
        return;
      }
      if (line.startsWith('Stack:')) {
        tech = line.replace('Stack:', '').split(',').map(s => s.trim()).filter(Boolean);
        return;
      }
      if (line.startsWith('•') || line.startsWith('-')) {
        const bText = line.replace(/^[•-]\s*/, '').trim();
        bullets.push({
          id: `proj-b-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          text: bText,
        });
        return;
      }
      if (!name) {
        name = line;
      } else {
        descLines.push(line);
      }
    });

    setNewProject({
      name: name || 'Untitled Project',
      role: role || 'Full-Stack Developer',
      period: period || '2026',
      link: link || '',
      description: descLines.join(' '),
      bullets: bullets,
      technologies: tech,
    });
  };

  const handleAddProject = () => {
    if (!newProject.name?.trim()) return;
    const item: ProjectItem = {
      id: `proj-${Date.now()}`,
      name: newProject.name.trim(),
      role: newProject.role?.trim() || 'Developer',
      link: newProject.link?.trim() || '',
      period: newProject.period?.trim() || '2026',
      description: newProject.description?.trim() || '',
      bullets: newProject.bullets || [],
      technologies: newProject.technologies || [],
      hidden: false,
    };
    const updated = {
      ...masterResume,
      projects: [...(masterResume.projects || []), item],
    };
    handleUpdateMaster(updated);
    setIsAddingProject(false);
    setNewProject({ name: '', role: '', link: '', period: '', description: '', bullets: [], technologies: [] });
    setProjectAutoRawText('');
    onShowToast('Project added successfully!');
  };

  const handleStartEditProject = (p: ProjectItem) => {
    setEditingProjectId(p.id);
    setProjectDraft({ ...p });
    setProjectEditTechInput((p.technologies || []).join(', '));
  };

  const handleDeleteProject = (id: string) => {
    if (window.confirm('Delete this project from your showcase?')) {
      const updated = {
        ...masterResume,
        projects: (masterResume.projects || []).filter((p) => p.id !== id),
      };
      handleUpdateMaster(updated);
      setEditingProjectId(null);
      onShowToast('Project removed.');
    }
  };

  const handleDeleteExecutiveSummary = (id: string) => {
    if (masterResume.executiveSummaries.length <= 1) {
      alert('You must keep at least one executive summary track.');
      return;
    }
    if (window.confirm('Delete this executive summary track?')) {
      const updated = {
        ...masterResume,
        executiveSummaries: masterResume.executiveSummaries.filter(s => s.id !== id),
      };
      handleUpdateMaster(updated);
      onShowToast('Exec. Summary section removed.');
    }
  };

  const handleAddExecutiveSummary = () => {
    if (!newSummaryTrack.trim() || !newSummaryText.trim()) return;
    const item = {
      id: `sum-${Date.now()}`,
      focusTrack: newSummaryTrack.trim(),
      text: newSummaryText.trim(),
    };
    const updated = {
      ...masterResume,
      executiveSummaries: [...masterResume.executiveSummaries, item],
    };
    handleUpdateMaster(updated);
    setIsAddingSummary(false);
    setNewSummaryTrack('');
    setNewSummaryText('');
    onShowToast('Exec. Summary section added!');
  };

  const handleAddSection = () => {
    if (!newSectionTitle.trim()) return;
    const currentSections = masterResume.milestoneSections || PURE_USER_MASTER_RESUME.milestoneSections || [];
    const updatedSections = [
      ...currentSections,
      {
        id: `msec-${Date.now()}`,
        title: newSectionTitle.trim(),
        items: []
      }
    ];
    const updated = {
      ...masterResume,
      milestoneSections: updatedSections
    };
    handleUpdateMaster(updated);
    setNewSectionTitle('');
    setIsAddingSection(false);
    onShowToast('New milestone section added!');
  };

  const handleDeleteSection = (sectionId: string) => {
    if (window.confirm('Delete this entire milestone section?')) {
      const currentSections = masterResume.milestoneSections || PURE_USER_MASTER_RESUME.milestoneSections || [];
      const updatedSections = currentSections.filter((s: MilestoneSection) => s.id !== sectionId);
      const updated = {
        ...masterResume,
        milestoneSections: updatedSections
      };
      handleUpdateMaster(updated);
      onShowToast('Milestone section removed.');
    }
  };

  const handleUpdateSectionTitle = (sectionId: string, newTitle: string) => {
    const currentSections = masterResume.milestoneSections || PURE_USER_MASTER_RESUME.milestoneSections || [];
    const updatedSections = currentSections.map((s: MilestoneSection) => s.id === sectionId ? { ...s, title: newTitle } : s);
    const updated = {
      ...masterResume,
      milestoneSections: updatedSections
    };
    handleUpdateMaster(updated);
  };

  const handleAddMilestoneToSection = (sectionId: string) => {
    if (!newMilestoneText.trim()) return;
    const currentSections = masterResume.milestoneSections || PURE_USER_MASTER_RESUME.milestoneSections || [];
    const updatedSections = currentSections.map((s: MilestoneSection) => {
      if (s.id === sectionId) {
        return {
          ...s,
          items: [...s.items, newMilestoneText.trim()]
        };
      }
      return s;
    });
    const updated = {
      ...masterResume,
      milestoneSections: updatedSections
    };
    handleUpdateMaster(updated);
    setNewMilestoneText('');
    setActiveSectionIdForMilestone(null);
    onShowToast('Milestone added to section!');
  };

  const handleDeleteMilestoneFromSection = (sectionId: string, itemIdx: number) => {
    if (window.confirm('Delete this milestone?')) {
      const currentSections = masterResume.milestoneSections || PURE_USER_MASTER_RESUME.milestoneSections || [];
      const updatedSections = currentSections.map((s: MilestoneSection) => {
        if (s.id === sectionId) {
          return {
            ...s,
            items: s.items.filter((_: string, idx: number) => idx !== itemIdx)
          };
        }
        return s;
      });
      const updated = {
        ...masterResume,
        milestoneSections: updatedSections
      };
      handleUpdateMaster(updated);
      onShowToast('Milestone deleted.');
    }
  };

  const handleUpdateMilestoneText = (sectionId: string, itemIdx: number, newText: string) => {
    const currentSections = masterResume.milestoneSections || PURE_USER_MASTER_RESUME.milestoneSections || [];
    const updatedSections = currentSections.map((s: MilestoneSection) => {
      if (s.id === sectionId) {
        const updatedItems = [...s.items];
        updatedItems[itemIdx] = newText;
        return { ...s, items: updatedItems };
      }
      return s;
    });
    const updated = {
      ...masterResume,
      milestoneSections: updatedSections
    };
    handleUpdateMaster(updated);
  };

  // --- DEV/TRAINING HANDLERS ---
  const handleAddTraining = () => {
    if (!newTraining.title?.trim() || !newTraining.institution?.trim()) return;
    const item: TrainingItem = {
      id: `tr-${Date.now()}`,
      title: newTraining.title.trim(),
      institution: newTraining.institution.trim(),
      year: newTraining.year?.trim() || 'Completed',
      description: newTraining.description?.trim() || '',
      skillsLearned: newTraining.skillsLearned || [],
    };
    const updated = {
      ...masterResume,
      training: [...(masterResume.training || []), item],
    };
    handleUpdateMaster(updated);
    setIsAddingTraining(false);
    setNewTraining({ title: '', institution: '', year: '', description: '', skillsLearned: [] });
    setTrainingSkillInput('');
    onShowToast('Training course added!');
  };

  const handleSaveTraining = () => {
    if (!editingTrainingId || !trainingDraft.title?.trim()) return;
    const updated = {
      ...masterResume,
      training: (masterResume.training || []).map((t) =>
        t.id === editingTrainingId ? ({ ...t, ...trainingDraft } as TrainingItem) : t
      ),
    };
    handleUpdateMaster(updated);
    setEditingTrainingId(null);
    setTrainingDraft({});
    onShowToast('Training record updated!');
  };

  const handleDeleteTraining = (id: string) => {
    if (window.confirm('Delete this training course?')) {
      const updated = {
        ...masterResume,
        training: (masterResume.training || []).filter((t) => t.id !== id),
      };
      handleUpdateMaster(updated);
      setEditingTrainingId(null);
      onShowToast('Training record deleted.');
    }
  };

  // --- REFEREES HANDLERS ---
  const handleAddReferee = () => {
    if (!newReferee.name?.trim() || !newReferee.organization?.trim()) return;
    const item: RefereeItem = {
      id: `ref-${Date.now()}`,
      name: newReferee.name.trim(),
      role: newReferee.role?.trim() || 'Reference',
      organization: newReferee.organization.trim(),
      contactPhone: newReferee.contactPhone?.trim() || '',
      contactEmail: newReferee.contactEmail?.trim() || '',
      relationship: newReferee.relationship?.trim() || '',
      notes: newReferee.notes?.trim() || '',
    };
    const updated = {
      ...masterResume,
      referees: [...(masterResume.referees || []), item],
    };
    handleUpdateMaster(updated);
    setIsAddingReferee(false);
    setNewReferee({ name: '', role: '', organization: '', contactPhone: '', contactEmail: '', relationship: '', notes: '' });
    onShowToast('Referee added to directory!');
  };

  const handleSaveReferee = () => {
    if (!editingRefereeId || !refereeDraft.name?.trim()) return;
    const updated = {
      ...masterResume,
      referees: (masterResume.referees || []).map((r) =>
        r.id === editingRefereeId ? ({ ...r, ...refereeDraft } as RefereeItem) : r
      ),
    };
    handleUpdateMaster(updated);
    setEditingRefereeId(null);
    setRefereeDraft({});
    onShowToast('Referee updated!');
  };

  const handleDeleteReferee = (id: string) => {
    if (window.confirm('Delete this referee entry?')) {
      const updated = {
        ...masterResume,
        referees: (masterResume.referees || []).filter((r) => r.id !== id),
      };
      handleUpdateMaster(updated);
      setEditingRefereeId(null);
      onShowToast('Referee deleted.');
    }
  };

  // --- BULLETS & EXPERIENCE HANDLERS ---
    const handleStartEditExp = (exp: WorkExperience) => {
    setEditingExpId(exp.id);
    setExpDraft({ ...exp });
    setExpTechInput((exp.technologies || []).join(', '));
    setExpandedRoles((prev) => ({ ...prev, [exp.id]: true }));
  };

  const handleSaveExperience = () => {
    if (!editingExpId || !expDraft.role?.trim()) return;
    const parsedTech = expTechInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const updated = {
      ...masterResume,
      experiences: (masterResume?.experiences || []).map((exp) =>
        exp.id === editingExpId
          ? ({
              ...exp,
              ...expDraft,
              role: expDraft.role?.trim() || exp.role,
              company: expDraft.company?.trim() || exp.company,
              endDate: expDraft.isCurrent ? 'Present' : (expDraft.endDate || ''),
              technologies: parsedTech,
            } as WorkExperience)
          : exp
      ),
    };
    handleUpdateMaster(updated);
    setEditingExpId(null);
    setExpDraft({});
    onShowToast('Position updated and saved to database!');
  };

  const handleDeleteExperience = (expId: string) => {
    if (window.confirm('Are you sure you want to delete this position from your Core Profile?')) {
      const updated = {
        ...masterResume,
        experiences: (masterResume?.experiences || []).filter((exp) => exp.id !== expId),
      };
      handleUpdateMaster(updated);
      if (editingExpId === expId) {
        setEditingExpId(null);
        setExpDraft({});
      }
      onShowToast('Position removed from Core Profile.');
    }
  };

  const handleAddBullet = (expId: string) => {
    const updated = {
      ...masterResume,
      experiences: (masterResume?.experiences || []).map((exp) => {
        if (exp.id === expId) {
          const newBullet: BulletPoint = {
            id: `b-${Date.now()}`,
            text: 'Spearheaded key initiative improving operations and customer satisfaction.',
            impactMetric: 'Key Achievement',
            tags: ['Operations'],
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

  // --- SKILLS TAXONOMY HANDLERS ---
  const handleAddSkillToCategory = (catId: string, rawInput: string) => {
    if (!rawInput.trim()) return;
    const newSkills = rawInput.split(';').map(s => s.trim()).filter(Boolean);
    if (newSkills.length === 0) return;

    const updated = {
      ...masterResume,
      skillCategories: masterResume.skillCategories.map((c) => {
        if (c.id === catId) {
          const existing = new Set(c.skills);
          const toAdd = newSkills.filter(s => !existing.has(s));
          if (toAdd.length === 0) return c;
          return { ...c, skills: [...c.skills, ...toAdd] };
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

  const handleAddSkillCategory = () => {
    if (!newCatTitle.trim()) return;
    const newCat: SkillCategory = {
      id: `cat-${Date.now()}`,
      category: newCatTitle.trim(),
      skills: [],
    };
    const updated = {
      ...masterResume,
      skillCategories: [...masterResume.skillCategories, newCat],
    };
    handleUpdateMaster(updated);
    setNewCatTitle('');
    setIsAddingCategory(false);
    onShowToast(`Created new skill category "${newCatTitle.trim()}"`);
  };

  const handleDeleteSkillCategory = (catId: string) => {
    console.log('Delete button clicked', catId);
    alert('Debug: Confirmation box should have appeared');
    const updated = {
      ...masterResume,
      skillCategories: masterResume.skillCategories.filter((c) => c.id !== catId),
    };
    handleUpdateMaster(updated);
    onShowToast('Skill category removed.');
  };

  const totalBullets = (masterResume.experiences || []).reduce((sum, e) => sum + (e.bullets?.length || 0), 0);
  const totalSkillsCount = (masterResume.skillCategories || []).reduce((sum, c) => sum + (c.skills?.length || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Hero Ingestion Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-900/50 rounded-2xl p-6 shadow-xl mb-6">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Core Career Profile</h1>
            <p className="text-slate-300 text-sm max-w-2xl mt-1">
              Store <strong>every position, project, license, referee, and skill</strong> across your entire career.
              When tailoring for any job, Gemini cherry-picks and highlights the exact facts needed to build a target 1 or 2 page resume.
            </p>
          </div>
        </div>
      </div>



      <JobIngestion 
        masterResume={masterResume}
        onIngestJob={(c, t, ind, pageBudget, overrides) => onIngestJob(c, t, ind || 'Default', pageBudget, overrides)} 
        onReIngestJob={onReIngestJob}
        onSelectHistoryJob={onSelectHistoryJob} 
        isParsing={isJobParsing} 
        errorMsg={jobParseError} 
        history={history}
        targetIndustry="Default"
        onTargetIndustryChange={() => {}}
      />

      {/* Candidate Profile Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <User className="w-4 h-4 text-indigo-400" />
            <span>Candidate Core Profile</span>
          </div>
          <span className="text-xs text-slate-400">Used across all tailored exports</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs mb-3">
          <div>
            <label className="text-slate-400 block mb-1">Full Display Name</label>
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
            <label className="text-slate-400 block mb-1">Phone Number</label>
            <input
              type="text"
              value={draftContact.phone ?? ''}
              onChange={(e) => handleUpdateContact('phone', e.target.value)}
              placeholder="0466 797 280"
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
              placeholder="100 Enterprise Way, Sydney, NSW, Australia, 2000"
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
              <span>Relocation & International Availability</span>
            </label>
            <input
              type="text"
              value={draftContact.relocationDetails ?? ''}
              onChange={(e) => handleUpdateContact('relocationDetails', e.target.value)}
              placeholder="Seeking permanent relocation to Japan"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
        <div className="flex items-center justify-end pt-3">
          <button
            onClick={handleSaveContact}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition"
          >
            <Check className="w-3.5 h-3.5" />
            Update Profile Record
          </button>
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
            <span>Skills Taxonomy ({masterResume.skillCategories.length})</span>
            <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded-full text-slate-300">
              {totalSkillsCount}
            </span>
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
            <span>Exec. Summaries ({masterResume.executiveSummaries.length})</span>
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
            <span>Education & Certs ({masterResume.certifications?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('licenses')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              activeSubTab === 'licenses'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Licenses ({masterResume.licenses?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('volunteer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              activeSubTab === 'volunteer'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Volunteer ({masterResume.volunteer?.length || 0})</span>
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
            <span>Dev / Training ({masterResume.training?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('referees')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              activeSubTab === 'referees'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Referees ({masterResume.referees?.length || 0})</span>
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
            <span>Milestones ({(masterResume.milestoneSections || PURE_USER_MASTER_RESUME.milestoneSections || []).length})</span>
          </button>
        </div>

        {/* Search filter within master */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Core Profile..."
            value={searchTerm ?? ''}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* 1. EXPERIENCE TAB */}
      {activeSubTab === 'experience' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 px-1">
            <div className="text-xs text-slate-400">
              <span>Showing all {masterResume.experiences.length} career positions ingested from canonical records.</span>
              <span className="text-slate-500 block sm:inline sm:ml-2">Click any card to expand/collapse bullets</span>
            </div>
            <button
              type="button"
              onClick={() => {
                if (isEditingExperience) {
                  if (editingExpId && expDraft.role?.trim()) {
                    handleSaveExperience();
                  } else {
                    onShowToast('Experience records saved and database updated!');
                  }
                  setEditingExpId(null);
                }
                setIsEditingExperience(!isEditingExperience);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition cursor-pointer shrink-0 ${
                isEditingExperience
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700'
              }`}
            >
              {isEditingExperience ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save & Lock</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Section(s)</span>
                </>
              )}
            </button>
          </div>
         

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
              const isEditingThisRole = isEditingExperience && editingExpId === exp.id;

              return (
                <div
                  key={exp.id}
                  className={`border rounded-xl overflow-hidden shadow-sm transition hover:border-slate-700 ${exp.hidden ? 'bg-slate-950 border-slate-900 opacity-30' : 'bg-slate-900 border-slate-800'}`}
                >
                  {/* Role Header Strip */}
                  <div
                    onClick={() => toggleRole(exp.id)}
                    className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:bg-slate-850 text-slate-100"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-base text-white">{exp.role}</span>
                        <span className="text-slate-400">@</span>
                        <span className="font-semibold text-indigo-400">{exp.company}</span>
                        {exp.isCurrent && !exp.hidden && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3 mt-1">
                        <span>{exp.location}</span>
                        <span>•</span>
                        <span>{exp.startDate} — {exp.endDate}</span>
                        <span>•</span>
                        <span className="text-indigo-400 font-medium">{exp.bullets.length} bullets</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleVisibility('experiences', exp.id);
                        }}
                        className="p-1 rounded-full text-slate-400 hover:text-slate-200 transition"
                        title={exp.hidden ? 'Show on tailored resumes' : 'Hide from tailored resumes'}
                      >
                        {exp.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      {isEditingExperience && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isEditingThisRole) {
                                handleSaveExperience();
                              } else {
                                handleStartEditExp(exp);
                              }
                            }}
                            className={`p-1.5 rounded-lg transition ${
                              isEditingThisRole
                                ? 'bg-emerald-600 text-white'
                                : 'text-indigo-300 hover:bg-slate-800'
                            }`}
                            title={isEditingThisRole ? 'Save role details' : 'Edit role details'}
                          >
                            {isEditingThisRole ? <Check className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteExperience(exp.id);
                            }}
                            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-slate-800 rounded-lg transition"
                            title="Delete position"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const bullets = exp.bullets.map(b => b.text).join('\n');
                          navigator.clipboard.writeText(bullets);
                          onShowToast('Text Copied');
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs font-medium border border-slate-700 transition flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Copy Skills</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddBullet(exp.id);
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg text-xs font-medium border border-slate-700 transition flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Bullet</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRole(exp.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Bullets & Tech */}
                  {isExpanded && (
                    <div className={`p-4 border-t ${exp.hidden ? 'border-slate-800' : 'border-slate-800/80'} ${exp.hidden ? 'bg-slate-950' : 'bg-slate-950/60'} space-y-3`}>
                      {isEditingThisRole && (
                        <div className="bg-slate-900 border border-indigo-500/40 rounded-xl p-4 space-y-3 mb-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-indigo-300">Edit Position Details</span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingExpId(null)}
                                className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={handleSaveExperience}
                                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg"
                              >
                                Save Position
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div>
                              <label className="text-slate-400 block mb-1">Role Title *</label>
                              <input
                                type="text"
                                value={expDraft.role || ''}
                                onChange={(e) => setExpDraft({ ...expDraft, role: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                              />
                            </div>
                            <div>
                              <label className="text-slate-400 block mb-1">Company / Client *</label>
                              <input
                                type="text"
                                value={expDraft.company || ''}
                                onChange={(e) => setExpDraft({ ...expDraft, company: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                              />
                            </div>
                            <div>
                              <label className="text-slate-400 block mb-1">Location</label>
                              <input
                                type="text"
                                value={expDraft.location || ''}
                                onChange={(e) => setExpDraft({ ...expDraft, location: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs items-end">
                            <div>
                              <label className="text-slate-400 block mb-1">Start Date</label>
                              <input
                                type="text"
                                value={expDraft.startDate || ''}
                                onChange={(e) => setExpDraft({ ...expDraft, startDate: e.target.value })}
                                placeholder="e.g. 2009-01 or Jan 2009"
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                              />
                            </div>
                            <div>
                              <label className="text-slate-400 block mb-1">End Date</label>
                              <input
                                type="text"
                                disabled={!!expDraft.isCurrent}
                                value={expDraft.isCurrent ? 'Present' : (expDraft.endDate || '')}
                                onChange={(e) => setExpDraft({ ...expDraft, endDate: e.target.value })}
                                placeholder="e.g. 2024-12 or Present"
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white disabled:opacity-50"
                              />
                            </div>
                            <label className="flex items-center gap-2 text-slate-300 py-1.5 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={!!expDraft.isCurrent}
                                onChange={(e) =>
                                  setExpDraft({
                                    ...expDraft,
                                    isCurrent: e.target.checked,
                                    endDate: e.target.checked ? 'Present' : '',
                                  })
                                }
                                className="rounded border-slate-700 text-indigo-600"
                              />
                              <span>Current Role</span>
                            </label>
                          </div>

                          <div className="text-xs">
                            <label className="text-slate-400 block mb-1">Role Summary / Context (Optional)</label>
                            <textarea
                              rows={2}
                              value={expDraft.summary || ''}
                              onChange={(e) => setExpDraft({ ...expDraft, summary: e.target.value })}
                              placeholder="Optional overview of engagement model (e.g. Retainer-based consultancy)..."
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                            />
                          </div>

                          <div className="text-xs">
                            <label className="text-slate-400 block mb-1">Technologies & Tools (comma separated)</label>
                            <input
                              type="text"
                              value={expTechInput}
                              onChange={(e) => setExpTechInput(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                            />
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        {exp.bullets.map((b) => (
                          <div
                            key={b.id}
                            className={`p-2.5 rounded-lg border flex items-start justify-between gap-3 text-xs ${exp.hidden ? 'bg-slate-900 border-slate-800 text-slate-600' : 'bg-slate-900 border-slate-800 text-slate-200'}`}
                          >
                            <div className="flex-1 space-y-1">
                              <textarea
                                rows={2}
                                value={b.text}
                                onChange={(e) => handleUpdateBullet(exp.id, b.id, e.target.value)}
                                className={`w-full border rounded px-2 py-1 focus:outline-none focus:border-indigo-500 ${exp.hidden ? 'bg-slate-950 border-slate-800 text-slate-600' : 'bg-slate-950 border-slate-800 text-slate-200'}`}
                              />
                              <div className="flex items-center gap-2">
                                <label className={`text-[10px] ${exp.hidden ? 'text-slate-900' : 'text-slate-500'}`}>Metric Tag:</label>
                                <input
                                  type="text"
                                  value={b.impactMetric ?? ''}
                                  placeholder="+XX% Impact"
                                  onChange={(e) => handleUpdateBullet(exp.id, b.id, b.text, e.target.value)}
                                  className={`border rounded px-2 py-0.5 text-[11px] focus:outline-none ${exp.hidden ? 'bg-slate-950 border-slate-800 text-slate-950' : 'bg-slate-950 border-slate-800 text-emerald-400'}`}
                                />
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteBullet(exp.id, b.id)}
                              className={`p-1 ${exp.hidden ? 'text-slate-950' : 'text-slate-500 hover:text-rose-400'}`}
                              title="Delete bullet"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Technologies tags */}
                      <div className="pt-2">
                        <label className={`text-[11px] font-semibold block mb-1 ${exp.hidden ? 'text-slate-900' : 'text-slate-400'}`}>
                          Role Technologies & Tools:
                        </label>
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {exp.technologies.map((t, idx) => (
                            <span
                              key={idx}
                              className={`text-xs border px-2 py-1 rounded-md ${exp.hidden ? 'bg-slate-900 text-slate-900 border-slate-800' : 'bg-slate-800 text-slate-200 border-slate-700'}`}
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
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-400" />
                <span>Skills Taxonomy</span>
                <span className="text-xs font-normal text-slate-400">
                  ({masterResume.skillCategories.length} categories • {totalSkillsCount} total skills)
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Organised competency matrix spanning AI tools, programming runtimes, game dev, data analytics, video, and leadership. To enter multiple skills separate those skills with a semi-colon ';'.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddingCategory(!isAddingCategory)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Category</span>
              </button>
              <button
                onClick={() => setIsEditingSkills(!isEditingSkills)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  isEditingSkills
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                }`}
              >
                {isEditingSkills ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Done</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Click to Delete Skills</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Add Category Form */}
          {isAddingCategory && (
            <div className="p-4 bg-slate-900 border border-indigo-500/40 rounded-xl flex items-center gap-3">
              <input
                type="text"
                placeholder="Category Title (e.g. Cloud Architecture, Mobile Development)..."
                value={newCatTitle}
                onChange={(e) => setNewCatTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSkillCategory()}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleAddSkillCategory}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                Add Category
              </button>
              <button
                onClick={() => setIsAddingCategory(false)}
                className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {masterResume.skillCategories.map((cat) => (
              <div key={cat.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-slate-200 text-sm">{cat.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{cat.skills.length} skills</span>
                    {isEditingSkills && (
                      <button
                        onClick={() => setDeletingCategory(cat.id)}
                        className="text-rose-400 hover:text-rose-300 p-1"
                        title="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {deletingCategory === cat.id && (
                      <div className="absolute right-0 top-0 mt-8 z-10 bg-slate-800 p-2 rounded shadow-lg border border-slate-700 text-xs">
                        <p className="text-white mb-2">Delete {cat.category}?</p>
                        <div className="flex gap-2">
                          <button onClick={() => {
                            handleDeleteSkillCategory(cat.id);
                            setDeletingCategory(null);
                          }} className="text-rose-400">Yes</button>
                          <button onClick={() => setDeletingCategory(null)} className="text-slate-400">No</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {cat.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="group inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs px-2.5 py-1 rounded-lg border border-slate-700"
                    >
                      <span>{skill}</span>
                      {isEditingSkills && (
                        <button
                          onClick={() => {
                            setDeletingSkill({ catId: cat.id, skill: skill });
                          }}
                          className="text-slate-500 hover:text-rose-400 opacity-60 group-hover:opacity-100 transition"
                          title="Remove skill"
                        >
                          ×
                        </button>
                      )}
                      {deletingSkill?.skill === skill && deletingSkill?.catId === cat.id && (
                        <div className="absolute z-10 bg-slate-800 p-2 rounded shadow-lg border border-slate-700 text-xs">
                          <p className="text-white mb-2">Delete {skill}?</p>
                          <div className="flex gap-2">
                            <button onClick={() => {
                              handleRemoveSkillFromCategory(cat.id, skill);
                              setDeletingSkill(null);
                            }} className="text-rose-400">Yes</button>
                            <button onClick={() => setDeletingSkill(null)} className="text-slate-400">No</button>
                          </div>
                        </div>
                      )}
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
            ))}
          </div>
        </div>
      )}

      {/* 3. KEY PROJECTS TAB */}
      {activeSubTab === 'projects' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-indigo-400" />
                <span>Key Projects & GitHub Showcase</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Highlighting the 3 pinned repositories from GitHub (<a href="https://github.com/example" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">github.com/example</a>) formatted with Title Case, space-delimited titles, concise descriptions, and direct links.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsDeletingProjects(!isDeletingProjects)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition cursor-pointer ${
                  isDeletingProjects
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeletingProjects ? 'Disable Delete Mode' : 'Enable Delete Mode'}</span>
              </button>
              <button
                onClick={() => setIsAddingProject(!isAddingProject)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Project</span>
              </button>
            </div>
          </div>

          {/* Add Project Modal / Form */}
          {isAddingProject && (
            <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white">Add New Project</h3>
                <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800 gap-1">
                  <button
                    onClick={() => setProjectAddMode('auto')}
                    className={`px-3 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                      projectAddMode === 'auto' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ✨ Auto-Fill Paste
                  </button>
                  <button
                    onClick={() => setProjectAddMode('manual')}
                    className={`px-3 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                      projectAddMode === 'manual' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🛠️ Manual Entry
                  </button>
                </div>
              </div>

              {projectAddMode === 'auto' ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1 font-medium">
                      Paste Project Data (Name | Role, Period, Link, Stack, and Bullet Points starting with • or -):
                    </label>
                    <textarea
                      rows={6}
                      value={projectAutoRawText}
                      onChange={(e) => {
                        setProjectAutoRawText(e.target.value);
                        handleAutoParseProject(e.target.value);
                      }}
                      placeholder={`OmniBase AI Career Intelligence | Full-Stack AI Architect\nPeriod: 2026\nLink: https://lukefrohling.com/projects\nStack: TypeScript, React, Gemini SDK\n• Architected and shipped a full-stack AI career intelligence platform...\n• Engineered a zero-token demo gatekeeper...`}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  {newProject.name && (
                    <div className="p-3 bg-slate-950 border border-emerald-500/30 rounded-xl space-y-1.5 text-xs">
                      <span className="text-emerald-400 font-bold block">✓ Parsed Preview:</span>
                      <div className="text-white font-semibold">{newProject.name} ({newProject.role} • {newProject.period})</div>
                      <div className="text-indigo-300">Link: {newProject.link || 'None'}</div>
                      <div className="text-slate-300 line-clamp-2">{newProject.description}</div>
                      <div className="text-cyan-300">Bullets: {newProject.bullets?.length || 0} extracted</div>
                      <div className="text-slate-400">Stack: {(newProject.technologies || []).join(', ')}</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Project Name *</label>
                      <input
                        type="text"
                        value={newProject.name || ''}
                        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                        placeholder="e.g. OmniBase AI Platform"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Role / Subtitle</label>
                      <input
                        type="text"
                        value={newProject.role || ''}
                        onChange={(e) => setNewProject({ ...newProject, role: e.target.value })}
                        placeholder="e.g. Full-Stack AI Architect"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Link URL</label>
                      <input
                        type="text"
                        value={newProject.link || ''}
                        onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                        placeholder="e.g. https://github.com/..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Period / Year</label>
                      <input
                        type="text"
                        value={newProject.period || ''}
                        onChange={(e) => setNewProject({ ...newProject, period: e.target.value })}
                        placeholder="e.g. 2026"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={newProject.description || ''}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      placeholder="Brief overview..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Technologies / Stack (comma separated)</label>
                    <input
                      type="text"
                      value={projectTechInput}
                      onChange={(e) => {
                        setProjectTechInput(e.target.value);
                        setNewProject({
                          ...newProject,
                          technologies: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
                        });
                      }}
                      placeholder="TypeScript, React, Gemini SDK, Tailwind CSS"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Bullet Points</label>
                    <div className="space-y-1.5 mb-2">
                      {(newProject.bullets || []).map((b, bIdx) => (
                        <div key={b.id || bIdx} className="flex items-center justify-between bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs">
                          <span className="text-slate-200">• {b.text}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const updatedBullets = (newProject.bullets || []).filter((_, idx) => idx !== bIdx);
                              setNewProject({ ...newProject, bullets: updatedBullets });
                            }}
                            className="text-rose-400 hover:text-rose-300 text-[10px]"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={projectBulletInput}
                        onChange={(e) => setProjectBulletInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && projectBulletInput.trim()) {
                            e.preventDefault();
                            const newB = { id: `b-${Date.now()}`, text: projectBulletInput.trim() };
                            setNewProject({ ...newProject, bullets: [...(newProject.bullets || []), newB] });
                            setProjectBulletInput('');
                          }
                        }}
                        placeholder="Add achievement bullet and press Enter..."
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (projectBulletInput.trim()) {
                            const newB = { id: `b-${Date.now()}`, text: projectBulletInput.trim() };
                            setNewProject({ ...newProject, bullets: [...(newProject.bullets || []), newB] });
                            setProjectBulletInput('');
                          }
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs"
                      >
                        Add Bullet
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddingProject(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddProject}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
                >
                  Save Project to Core Profile
                </button>
              </div>
            </div>
          )}

          {masterResume.projects.map((proj) => {
            const isEditing = editingProjectId === proj.id;

            if (isEditing) {
              return (
                <div key={proj.id} className="bg-slate-900 border border-indigo-500/50 rounded-xl p-5 space-y-3 shadow-lg">
                  <div className="text-xs font-bold text-indigo-300">Edit Project</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Project Name</label>
                      <input
                        type="text"
                        value={projectDraft.name || ''}
                        onChange={(e) => setProjectDraft({ ...projectDraft, name: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Role / Subtitle</label>
                      <input
                        type="text"
                        value={projectDraft.role || ''}
                        onChange={(e) => setProjectDraft({ ...projectDraft, role: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Link URL</label>
                      <input
                        type="text"
                        value={projectDraft.link || ''}
                        onChange={(e) => setProjectDraft({ ...projectDraft, link: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Period / Year</label>
                      <input
                        type="text"
                        value={projectDraft.period || ''}
                        onChange={(e) => setProjectDraft({ ...projectDraft, period: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={projectDraft.description || ''}
                      onChange={(e) => setProjectDraft({ ...projectDraft, description: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Technologies (comma separated)</label>
                    <input
                      type="text"
                      value={projectEditTechInput}
                      onChange={(e) => {
                        setProjectEditTechInput(e.target.value);
                        setProjectDraft({
                          ...projectDraft,
                          technologies: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
                        });
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setEditingProjectId(null)}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!editingProjectId || !projectDraft.name?.trim()) return;
                        const updated = {
                          ...masterResume,
                          projects: (masterResume.projects || []).map((p) =>
                            p.id === editingProjectId ? ({ ...p, ...projectDraft } as ProjectItem) : p
                          ),
                        };
                        handleUpdateMaster(updated);
                        setEditingProjectId(null);
                        setProjectDraft({});
                        onShowToast('Project updated successfully!');
                      }}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div key={proj.id} className={`border rounded-xl p-5 space-y-3 shadow-sm transition hover:border-slate-700 ${proj.hidden ? 'bg-slate-950 border-slate-900 opacity-30' : 'bg-slate-900 border-slate-800'}`}>
                <div className="flex items-start justify-between">
                  <div className="text-slate-100">
                    <h3 className="font-bold text-base text-white">{proj.name}</h3>
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
                            className="hover:underline flex items-center gap-1"
                          >
                            <span>{proj.link}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility('projects', proj.id)}
                      className="p-1 rounded-full text-slate-400 hover:text-slate-200 transition"
                      title={proj.hidden ? 'Show on resumes' : 'Hide from resumes'}
                    >
                      {proj.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStartEditProject(proj)}
                      className="p-1 text-slate-400 hover:text-indigo-300 transition"
                      title="Edit project"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {isDeletingProjects && (
                      <button
                        type="button"
                        onClick={() => handleDeleteProject(proj.id)}
                        className="p-1 text-rose-400 hover:text-rose-300 transition animate-in fade-in duration-200"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {proj.description && <p className="text-xs leading-relaxed text-slate-300">{proj.description}</p>}

                <div className="space-y-1.5">
                  {proj.bullets.map((b) => (
                    <div key={b.id} className="text-xs flex items-start gap-2 text-slate-300">
                      <span className="text-indigo-400">•</span>
                      <span>{b.text}</span>
                      {b.impactMetric && !proj.hidden && (
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
                          {b.impactMetric}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {proj.technologies.map((t, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded border bg-slate-800 text-slate-300 border-slate-700">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. EXECUTIVE SUMMARIES TAB */}
      {activeSubTab === 'summaries' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Executive Summaries</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Maintain ready-made executive summaries tailored to different career tracks. When generating a targeted resume, Gemini will select or blend these according to the target job description.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsAddingSummary(!isAddingSummary)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Section</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isEditingSummaries) {
                    onShowToast('Executive summaries saved and database updated!');
                  }
                  setIsEditingSummaries(!isEditingSummaries);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition cursor-pointer ${
                  isEditingSummaries
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700'
                }`}
              >
                {isEditingSummaries ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save & Lock</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Sections</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Add Summary Section Form */}
          {isAddingSummary && (
            <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-4 space-y-3 shadow-lg">
              <div className="text-xs font-bold text-white">Add New Executive Summary Track</div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Focus Track / Title</label>
                <input
                  type="text"
                  value={newSummaryTrack}
                  onChange={(e) => setNewSummaryTrack(e.target.value)}
                  placeholder="e.g. Principal AI Architect & Engineering Lead"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Summary Text</label>
                <textarea
                  rows={3}
                  value={newSummaryText}
                  onChange={(e) => setNewSummaryText(e.target.value)}
                  placeholder="Detailed summary text..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingSummary(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddExecutiveSummary}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Add Track
                </button>
              </div>
            </div>
          )}

          {masterResume.executiveSummaries.map((summary) => (
            <div key={summary.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-300 text-sm">{summary.focusTrack}</span>
                {isEditingSummaries && masterResume.executiveSummaries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteExecutiveSummary(summary.id)}
                    className="p-1 text-slate-400 hover:text-rose-400 transition"
                    title="Delete track"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <textarea
                rows={3}
                value={summary.text ?? ''}
                readOnly={!isEditingSummaries}
                onChange={(e) => {
                  if (!isEditingSummaries) return;
                  const updated = {
                    ...masterResume,
                    executiveSummaries: masterResume.executiveSummaries.map((s) =>
                      s.id === summary.id ? { ...s, text: e.target.value } : s
                    ),
                  };
                  handleUpdateMaster(updated);
                }}
                className={`w-full rounded-lg p-3 text-xs leading-relaxed transition ${
                  isEditingSummaries
                    ? 'bg-slate-950 border border-indigo-500/50 text-slate-100 focus:outline-none focus:border-indigo-400'
                    : 'bg-slate-950/60 border border-slate-800/80 text-slate-300 cursor-not-allowed select-none'
                }`}
              />
            </div>
          ))}
        </div>
      )}

      {/* 5. EDUCATION & CERTS TAB */}
      {activeSubTab === 'education' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <span>Formal Higher Education</span>
            </h3>
            {masterResume.education.map((edu) => (
              <div
                key={edu.id}
                className={`border-b border-slate-800 last:border-0 pb-3 last:pb-0 space-y-1 text-xs transition ${
                  edu.hidden ? 'opacity-30' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold text-white">{edu.degree} in {edu.fieldOfStudy}</div>
                  <button
                    type="button"
                    onClick={() => handleToggleVisibility('education', edu.id)}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-200 transition shrink-0"
                    title={edu.hidden ? 'Show on tailored resumes' : 'Hide from tailored resumes'}
                  >
                    {edu.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="text-slate-400">{edu.institution} {edu.location && `• ${edu.location}`}</div>
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
                    placeholder="Certificate Title"
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
                      placeholder="Year / Date"
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

                if (isEditing) {
                  return (
                    <div key={c.id} className="p-3 bg-slate-950/90 border border-indigo-500/40 rounded-lg space-y-2.5">
                      <div className="text-[11px] font-semibold text-indigo-300">Edit Certification</div>
                      <div>
                        <input
                          type="text"
                          value={certDraft.name || ''}
                          onChange={(e) => setCertDraft({ ...certDraft, name: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={certDraft.issuer || ''}
                          onChange={(e) => setCertDraft({ ...certDraft, issuer: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white"
                          placeholder="Issuer"
                        />
                        <input
                          type="text"
                          value={certDraft.date || ''}
                          onChange={(e) => setCertDraft({ ...certDraft, date: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white"
                          placeholder="Date"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={certDraft.url || ''}
                          onChange={(e) => setCertDraft({ ...certDraft, url: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white placeholder-slate-500"
                          placeholder="Verify Link URL (https://...)"
                        />
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingCertId(null)}
                          className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveCert}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={c.id}
                    className={`border-b border-slate-800 last:border-0 pb-3 last:pb-0 space-y-1 text-xs transition ${
                      c.hidden ? 'opacity-30' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-white">
                        <span>{c.name}</span>
                        {c.url && (
                          <a
                            href={c.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 text-[11px] inline-flex items-center gap-0.5 ml-1.5 hover:underline"
                          >
                            <span>Verify</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <button
                          type="button"
                          onClick={() => handleToggleVisibility('certifications', c.id)}
                          className="p-1 rounded-full text-slate-400 hover:text-slate-200 transition"
                          title={c.hidden ? 'Show on resumes' : 'Hide from resumes'}
                        >
                          {c.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartEditCert(c)}
                          className="p-1 text-slate-400 hover:text-indigo-300"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCert(c.id)}
                          className="p-1 text-slate-400 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      {c.issuer} • {c.date}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 6. LICENSES TAB */}
      {activeSubTab === 'licenses' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Licenses & Statutory Authorizations</span>
                <span className="text-xs font-normal text-slate-400">
                  ({masterResume.licenses?.length || 0})
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Official regulatory, maritime, trade, and safety licenses (e.g. PADI SCUBA, WA Driver's License, Liquor Approved Manager, First Aid).
              </p>
            </div>
            <button
              onClick={() => setIsAddingLicense(!isAddingLicense)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 hover:text-white rounded-lg text-xs font-semibold border border-emerald-500/30 transition self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add License</span>
            </button>
          </div>

          {/* Quick Add Form */}
          {isAddingLicense && (
            <div className="p-4 bg-slate-900 border border-emerald-500/40 rounded-xl space-y-3">
              <div className="text-xs font-semibold text-emerald-300">Add New License or Permit</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="License Name (e.g. Western Australia Driver's License)"
                  value={newLicense.name || ''}
                  onChange={(e) => setNewLicense({ ...newLicense, name: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  placeholder="Issuing Authority (e.g. Department of Transport WA, PADI)"
                  value={newLicense.authority || ''}
                  onChange={(e) => setNewLicense({ ...newLicense, authority: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  placeholder="Date / Status (e.g. Certified 13-07-1993, Current)"
                  value={newLicense.date || ''}
                  onChange={(e) => setNewLicense({ ...newLicense, date: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  placeholder="Details (e.g. Open Class C - manual & automatic, certified in Fiji)"
                  value={newLicense.details || ''}
                  onChange={(e) => setNewLicense({ ...newLicense, details: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => setIsAddingLicense(false)}
                  className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddLicense}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded shadow-sm"
                >
                  Save License
                </button>
              </div>
            </div>
          )}

          {/* Licenses Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(masterResume.licenses || []).map((lic) => {
              const isEditing = editingLicenseId === lic.id;

              if (isEditing) {
                return (
                  <div key={lic.id} className="p-4 bg-slate-950/90 border border-emerald-500/40 rounded-xl space-y-2.5">
                    <div className="text-xs font-semibold text-emerald-300">Edit License</div>
                    <input
                      type="text"
                      value={licenseDraft.name || ''}
                      onChange={(e) => setLicenseDraft({ ...licenseDraft, name: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Authority"
                        value={licenseDraft.authority || ''}
                        onChange={(e) => setLicenseDraft({ ...licenseDraft, authority: e.target.value })}
                        className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="Date"
                        value={licenseDraft.date || ''}
                        onChange={(e) => setLicenseDraft({ ...licenseDraft, date: e.target.value })}
                        className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white"
                      />
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Details"
                      value={licenseDraft.details || ''}
                      onChange={(e) => setLicenseDraft({ ...licenseDraft, details: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white"
                    />
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => setEditingLicenseId(null)}
                        className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveLicense}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={lic.id}
                  className={`border rounded-xl p-5 space-y-2 shadow-sm transition hover:border-slate-700 ${lic.hidden ? 'bg-slate-950 border-slate-900 opacity-30' : 'bg-slate-900 border-slate-800'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="font-bold text-sm text-white">
                        <span>{lic.name}</span>
                      </div>
                      <div className="text-xs font-medium text-emerald-400">
                        {lic.authority} {lic.date && `• ${lic.date}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleVisibility('licenses', lic.id)}
                        className="p-1 rounded-full text-slate-400 hover:text-slate-200 transition"
                        title={lic.hidden ? 'Show on tailored resumes' : 'Hide from tailored resumes'}
                      >
                        {lic.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingLicenseId(lic.id);
                          setLicenseDraft({ ...lic });
                        }}
                        className="p-1 text-slate-400 hover:text-indigo-300"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteLicense(lic.id)}
                        className="p-1 text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {lic.details && (
                    <p className="text-xs leading-relaxed pt-1 border-t text-slate-300 border-slate-800/60">
                      {lic.details}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. VOLUNTEER TAB */}
      {activeSubTab === 'volunteer' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-rose-400" />
                <span>Volunteer, Community & Humanitarian Work</span>
                <span className="text-xs font-normal text-slate-400">
                  ({masterResume.volunteer?.length || 0})
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Community leadership, ESL teaching, youth safety, disability advocacy, and accessibility work.
              </p>
            </div>
            <button
              onClick={() => setIsAddingVolunteer(!isAddingVolunteer)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 hover:text-white rounded-lg text-xs font-semibold border border-rose-500/30 transition self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Volunteer Record</span>
            </button>
          </div>

          {/* Quick Add Form */}
          {isAddingVolunteer && (
            <div className="p-4 bg-slate-900 border border-rose-500/40 rounded-xl space-y-3">
              <div className="text-xs font-semibold text-rose-300">Add Volunteer Experience</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Role (e.g. ESL Teacher, Schoolies Support Staff)"
                  value={newVolunteer.role || ''}
                  onChange={(e) => setNewVolunteer({ ...newVolunteer, role: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                />
                <input
                  type="text"
                  placeholder="Organization (e.g. Gold Coast ESL Meetup Group)"
                  value={newVolunteer.organization || ''}
                  onChange={(e) => setNewVolunteer({ ...newVolunteer, organization: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                />
                <input
                  type="text"
                  placeholder="Period (e.g. Sep 2011 - Sep 2016)"
                  value={newVolunteer.period || ''}
                  onChange={(e) => setNewVolunteer({ ...newVolunteer, period: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                />
                <input
                  type="text"
                  placeholder="Location (e.g. Gold Coast, Australia)"
                  value={newVolunteer.location || ''}
                  onChange={(e) => setNewVolunteer({ ...newVolunteer, location: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
              <textarea
                rows={2}
                placeholder="Description of community work"
                value={newVolunteer.description || ''}
                onChange={(e) => setNewVolunteer({ ...newVolunteer, description: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
              />
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => setIsAddingVolunteer(false)}
                  className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddVolunteer}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded shadow-sm"
                >
                  Save Record
                </button>
              </div>
            </div>
          )}

          {/* Volunteer Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(masterResume.volunteer || []).map((vol) => {
              const isEditing = editingVolunteerId === vol.id;

              if (isEditing) {
                return (
                  <div key={vol.id} className="p-4 bg-slate-950/90 border border-rose-500/40 rounded-xl space-y-2.5">
                    <div className="text-xs font-semibold text-rose-300">Edit Volunteer Role</div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={volunteerDraft.role || ''}
                        onChange={(e) => setVolunteerDraft({ ...volunteerDraft, role: e.target.value })}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                      />
                      <input
                        type="text"
                        value={volunteerDraft.organization || ''}
                        onChange={(e) => setVolunteerDraft({ ...volunteerDraft, organization: e.target.value })}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={volunteerDraft.description || ''}
                      onChange={(e) => setVolunteerDraft({ ...volunteerDraft, description: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                    />
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => setEditingVolunteerId(null)}
                        className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveVolunteer}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={vol.id} className={`border rounded-xl p-5 space-y-2.5 shadow-sm transition hover:border-slate-700 ${vol.hidden ? 'bg-slate-950 border-slate-900 opacity-30' : 'bg-slate-900 border-slate-800'}`}>
                  <div className="flex items-start justify-between gap-2 text-slate-100">
                    <div>
                      <h3 className="font-bold text-sm text-white">{vol.role}</h3>
                      <div className="text-xs font-medium text-rose-400">
                        {vol.organization} {vol.location && `• ${vol.location}`}
                      </div>
                      {vol.period && <div className="text-[11px] text-slate-500">{vol.period}</div>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleVisibility('volunteer', vol.id)}
                        className="p-1 rounded-full text-slate-400 hover:text-slate-200 transition"
                        title={vol.hidden ? 'Show on tailored resumes' : 'Hide from tailored resumes'}
                      >
                        {vol.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingVolunteerId(vol.id);
                          setVolunteerDraft({ ...vol });
                        }}
                        className="p-1 text-slate-400 hover:text-indigo-300"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteVolunteer(vol.id)}
                        className="p-1 text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed text-slate-300">{vol.description}</p>

                  {vol.bullets && vol.bullets.length > 0 && (
                    <div className="space-y-1 pt-1 border-t border-slate-800/60">
                      {vol.bullets.map((b, bidx) => (
                        <div key={bidx} className="text-[11px] flex items-start gap-1.5 text-slate-400">
                          <span className="text-rose-400">•</span>
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 8. DEV / TRAINING TAB */}
      {activeSubTab === 'development' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Book className="w-4 h-4 text-cyan-400" />
                <span>Development & Professional Training</span>
                <span className="text-xs font-normal text-slate-400">
                  ({masterResume.training?.length || 0})
                </span>
              </h2>
            </div>
            <button
              onClick={() => setIsAddingTraining(!isAddingTraining)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 hover:text-white rounded-lg text-xs font-semibold border border-cyan-500/30 transition self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Course</span>
            </button>
          </div>

          {/* Educational Explainer Banner */}
          <div className="p-4 bg-cyan-950/30 border border-cyan-500/30 rounded-xl text-xs text-cyan-200 leading-relaxed flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block mb-0.5">What goes into Dev / Training?</span>
              This section is purpose-built for continuous computer science education, software engineering credentials, game engine masteries (Unity, Unreal Engine), AI certifications, and technical courses (e.g., Google AI Specialization, SAE AR/VR, Tableau Analytics). It keeps specialized skills organized separately from formal university degrees.
            </div>
          </div>

          {/* Quick Add Form */}
          {isAddingTraining && (
            <div className="p-4 bg-slate-900 border border-cyan-500/40 rounded-xl space-y-3">
              <div className="text-xs font-semibold text-cyan-300">Add Technical Training / Course</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Course / Track Title (e.g. Unreal Engine 5 Mastery)"
                  value={newTraining.title || ''}
                  onChange={(e) => setNewTraining({ ...newTraining, title: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <input
                  type="text"
                  placeholder="Institution / Platform (e.g. Google, Udemy, SAE Institute)"
                  value={newTraining.institution || ''}
                  onChange={(e) => setNewTraining({ ...newTraining, institution: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <input
                  type="text"
                  placeholder="Year / Period (e.g. 2024)"
                  value={newTraining.year || ''}
                  onChange={(e) => setNewTraining({ ...newTraining, year: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <input
                  type="text"
                  placeholder="Comma-separated skills (e.g. Python, RAG, Blueprints)"
                  value={trainingSkillInput}
                  onChange={(e) => {
                    setTrainingSkillInput(e.target.value);
                    setNewTraining({
                      ...newTraining,
                      skillsLearned: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    });
                  }}
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <textarea
                rows={2}
                placeholder="Course focus & practical application"
                value={newTraining.description || ''}
                onChange={(e) => setNewTraining({ ...newTraining, description: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => setIsAddingTraining(false)}
                  className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTraining}
                  className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded shadow-sm"
                >
                  Save Training
                </button>
              </div>
            </div>
          )}

          {/* Training Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(masterResume.training || []).map((tr) => {
              const isEditing = editingTrainingId === tr.id;

              if (isEditing) {
                return (
                  <div key={tr.id} className="p-4 bg-slate-950/90 border border-cyan-500/40 rounded-xl space-y-2.5">
                    <div className="text-xs font-semibold text-cyan-300">Edit Training Course</div>
                    <input
                      type="text"
                      value={trainingDraft.title || ''}
                      onChange={(e) => setTrainingDraft({ ...trainingDraft, title: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={trainingDraft.institution || ''}
                        onChange={(e) => setTrainingDraft({ ...trainingDraft, institution: e.target.value })}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                      />
                      <input
                        type="text"
                        value={trainingDraft.year || ''}
                        onChange={(e) => setTrainingDraft({ ...trainingDraft, year: e.target.value })}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={trainingDraft.description || ''}
                      onChange={(e) => setTrainingDraft({ ...trainingDraft, description: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                    />
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => setEditingTrainingId(null)}
                        className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveTraining}
                        className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={tr.id} className={`border rounded-xl p-5 space-y-2.5 shadow-sm transition hover:border-slate-700 ${tr.hidden ? 'bg-slate-950 border-slate-900 opacity-30' : 'bg-slate-900 border-slate-800'}`}>
                  <div className="flex items-start justify-between gap-2 text-slate-100">
                    <div>
                      <h3 className="font-bold text-sm text-white">{tr.title}</h3>
                      <div className="text-xs font-medium text-cyan-400">
                        {tr.institution} {tr.year && `• ${tr.year}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleVisibility('training', tr.id)}
                        className="p-1 rounded-full text-slate-400 hover:text-slate-200 transition"
                        title={tr.hidden ? 'Show on resumes' : 'Hide from resumes'}
                      >
                        {tr.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTrainingId(tr.id);
                          setTrainingDraft({ ...tr });
                        }}
                        className="p-1 text-slate-400 hover:text-indigo-300"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTraining(tr.id)}
                        className="p-1 text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {tr.description && (
                    <p className="text-xs leading-relaxed text-slate-300">{tr.description}</p>
                  )}

                  {tr.skillsLearned && tr.skillsLearned.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-800/60">
                      {tr.skillsLearned.map((s, sidx) => (
                        <span key={sidx} className="text-[10px] px-2 py-0.5 rounded border bg-cyan-950/60 text-cyan-300 border-cyan-800/50">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 9. REFEREES TAB */}
      {activeSubTab === 'referees' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Professional & Character Referees</span>
                <span className="text-xs font-normal text-slate-400">
                  ({(masterResume.referees || []).length} available contacts)
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Verified contacts from Japanese media companies, Westpac, AMP, medical universities, entertainment agencies, and schools.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-48">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
                <input
                  type="text"
                  placeholder="Filter referees..."
                  value={refereeSearch}
                  onChange={(e) => setRefereeSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                onClick={() => setIsAddingReferee(!isAddingReferee)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Referee</span>
              </button>
            </div>
          </div>

          {/* Quick Add Referee Form */}
          {isAddingReferee && (
            <div className="p-4 bg-slate-900 border border-indigo-500/40 rounded-xl space-y-3">
              <div className="text-xs font-semibold text-indigo-300">Add New Referee</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newReferee.name || ''}
                  onChange={(e) => setNewReferee({ ...newReferee, name: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Job Role / Title"
                  value={newReferee.role || ''}
                  onChange={(e) => setNewReferee({ ...newReferee, role: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Company / Institution"
                  value={newReferee.organization || ''}
                  onChange={(e) => setNewReferee({ ...newReferee, organization: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={newReferee.contactPhone || ''}
                  onChange={(e) => setNewReferee({ ...newReferee, contactPhone: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Email Address"
                  value={newReferee.contactEmail || ''}
                  onChange={(e) => setNewReferee({ ...newReferee, contactEmail: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Relationship (e.g. Former Supervisor)"
                  value={newReferee.relationship || ''}
                  onChange={(e) => setNewReferee({ ...newReferee, relationship: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <input
                type="text"
                placeholder="Additional notes"
                value={newReferee.notes || ''}
                onChange={(e) => setNewReferee({ ...newReferee, notes: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => setIsAddingReferee(false)}
                  className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddReferee}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded shadow-sm"
                >
                  Save Referee
                </button>
              </div>
            </div>
          )}

          {/* Referees Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {(masterResume.referees || [])
              .filter((r) => {
                if (!refereeSearch) return true;
                const term = refereeSearch.toLowerCase();
                return (
                  r.name.toLowerCase().includes(term) ||
                  r.organization.toLowerCase().includes(term) ||
                  r.role.toLowerCase().includes(term)
                );
              })
              .map((r) => {
                const isEditing = editingRefereeId === r.id;

                if (isEditing) {
                  return (
                    <div key={r.id} className="p-3.5 bg-slate-950 border border-indigo-500/40 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="text-xs font-semibold text-indigo-300">Edit Referee</div>
                        <button
                          type="button"
                          onClick={() => handleToggleVisibility('referees', r.id)}
                          className="p-1 rounded-full text-slate-400 hover:text-slate-200 transition"
                          title={r.hidden ? 'Show on resumes' : 'Hide from resumes'}
                        >
                          {r.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <input
                        type="text"
                        value={refereeDraft.name || ''}
                        onChange={(e) => setRefereeDraft({ ...refereeDraft, name: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                      />
                      <input
                        type="text"
                        value={refereeDraft.role || ''}
                        onChange={(e) => setRefereeDraft({ ...refereeDraft, role: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                      />
                      <input
                        type="text"
                        value={refereeDraft.organization || ''}
                        onChange={(e) => setRefereeDraft({ ...refereeDraft, organization: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                      />
                      <input
                        type="text"
                        value={refereeDraft.contactPhone || ''}
                        onChange={(e) => setRefereeDraft({ ...refereeDraft, contactPhone: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                      />
                      <input
                        type="text"
                        value={refereeDraft.contactEmail || ''}
                        onChange={(e) => setRefereeDraft({ ...refereeDraft, contactEmail: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                      />
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => setEditingRefereeId(null)}
                          className="px-2 py-1 text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveReferee}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={r.id} className={`border rounded-xl p-4 space-y-2 shadow-sm transition hover:border-slate-700 ${r.hidden ? 'bg-slate-950 border-slate-900 opacity-30' : 'bg-slate-900 border-slate-800'}`}>
                    <div className="flex items-start justify-between gap-2 text-slate-100">
                      <div>
                        <h4 className="font-bold text-sm text-white">{r.name}</h4>
                        <div className="text-xs font-medium text-indigo-400">{r.role}</div>
                        <div className="text-xs text-slate-300">{r.organization}</div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleVisibility('referees', r.id)}
                          className="p-1 rounded-full text-slate-400 hover:text-slate-200 transition"
                          title={r.hidden ? 'Show on resumes' : 'Hide from resumes'}
                        >
                          {r.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingRefereeId(r.id);
                            setRefereeDraft({ ...r });
                          }}
                          className="p-1 text-slate-400 hover:text-indigo-300"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteReferee(r.id)}
                          className="p-1 text-slate-400 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1 pt-1.5 border-t border-slate-800/70 text-xs text-slate-300">
                      {r.contactPhone && (
                        <a
                          href={`tel:${r.contactPhone.replace(/\s+/g, '')}`}
                          className="flex items-center gap-1.5 hover:text-indigo-300 transition"
                        >
                          <Phone className="w-3 h-3 text-emerald-400" />
                          <span>{r.contactPhone}</span>
                        </a>
                      )}
                      {r.contactEmail && (
                        <a
                          href={`mailto:${r.contactEmail}`}
                          className="flex items-center gap-1.5 text-slate-300 hover:text-indigo-300 transition break-all"
                        >
                          <Mail className="w-3 h-3 text-cyan-400" />
                          <span>{r.contactEmail}</span>
                        </a>
                      )}
                      {r.notes && (
                        <div className="text-[11px] text-slate-400 italic pt-0.5">
                          {r.notes}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* 10. AWARDS & MILESTONES TAB */}
      {activeSubTab === 'awards' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Career Highlights & Architecture Debugging Milestones</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Verified production achievements, technical problem-solving milestones, and high-impact accomplishments.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsAddingSection(!isAddingSection)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 hover:text-white rounded-lg text-xs font-semibold border border-indigo-500/30 transition shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Section</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isEditingMilestones) {
                    onShowToast('Career milestones and sections saved and database updated!');
                  }
                  setIsEditingMilestones(!isEditingMilestones);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition cursor-pointer ${
                  isEditingMilestones
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700'
                }`}
              >
                {isEditingMilestones ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save & Lock</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Sections</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Add Section Form */}
          {isAddingSection && (
            <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-4 space-y-3 shadow-lg">
              <div className="text-xs font-bold text-white">Add New Milestone Section</div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Section Title</label>
                <input
                  type="text"
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  placeholder="e.g. Enterprise Leadership & Strategy"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingSection(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddSection}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Create Section
                </button>
              </div>
            </div>
          )}

          {/* Render Sections */}
          {(() => {
            const sections = masterResume.milestoneSections || PURE_USER_MASTER_RESUME.milestoneSections || [];
            const sorted = [...sections].sort((a, b) => {
              if (a.title.toLowerCase() === 'key') return -1;
              if (b.title.toLowerCase() === 'key') return 1;
              return 0;
            });

            return sorted.map((sec) => (
              <div key={sec.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 relative group">
                {/* Section Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 flex-1 mr-4">
                    <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
                    {isEditingMilestones ? (
                      <input
                        type="text"
                        value={sec.title}
                        onChange={(e) => handleUpdateSectionTitle(sec.id, e.target.value)}
                        className="bg-slate-950 border border-indigo-500/50 rounded px-2 py-1 text-xs font-bold text-white w-full max-w-xs focus:outline-none focus:border-indigo-400"
                        placeholder="Section Title"
                      />
                    ) : (
                      <h3 className="font-semibold text-white text-xs uppercase tracking-wider text-cyan-400">
                        {sec.title}
                      </h3>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveSectionIdForMilestone(activeSectionIdForMilestone === sec.id ? null : sec.id)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 hover:text-white rounded-lg text-xs font-medium border border-indigo-500/30 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Milestone</span>
                    </button>
                    {isEditingMilestones && sec.title.toLowerCase() !== 'key' && (
                      <button
                        type="button"
                        onClick={() => handleDeleteSection(sec.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                        title="Delete entire section"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Add Milestone Modal / Form for this Section */}
                {activeSectionIdForMilestone === sec.id && (
                  <div className="bg-slate-950 border border-indigo-500/40 rounded-xl p-4 space-y-3">
                    <div className="text-xs font-bold text-white">Add Milestone to "{sec.title}"</div>
                    <textarea
                      rows={2}
                      value={newMilestoneText}
                      onChange={(e) => setNewMilestoneText(e.target.value)}
                      placeholder="e.g. Title: Description of production achievement..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSectionIdForMilestone(null);
                          setNewMilestoneText('');
                        }}
                        className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddMilestoneToSection(sec.id)}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg"
                      >
                        Save Milestone
                      </button>
                    </div>
                  </div>
                )}

                {/* Section Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {(sec.items || []).map((item, itemIdx) => {
                    const parts = item.split(': ');
                    const title = parts[0];
                    return (
                      <div key={itemIdx} className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg space-y-2 text-xs relative group">
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-semibold text-indigo-300">{title}</div>
                          {isEditingMilestones && (
                            <button
                              type="button"
                              onClick={() => handleDeleteMilestoneFromSection(sec.id, itemIdx)}
                              className="p-1 text-slate-400 hover:text-rose-400 transition"
                              title="Delete milestone"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <textarea
                          rows={2}
                          value={item}
                          readOnly={!isEditingMilestones}
                          onChange={(e) => handleUpdateMilestoneText(sec.id, itemIdx, e.target.value)}
                          className={`w-full rounded p-2 text-[11px] leading-relaxed transition ${
                            isEditingMilestones
                              ? 'bg-slate-900 border border-indigo-500/50 text-slate-100 focus:outline-none focus:border-indigo-400'
                              : 'bg-transparent border-0 text-slate-400 cursor-not-allowed select-none p-0 resize-none'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ));
          })()}
        </div>
      )}
    </div>
  );
};
