export interface ContactInfo {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  residentialAddress?: string;
  currentStatus?: string;
  relocationDetails?: string;
  linkedin: string;
  github: string;
  website: string;
  websiteList: { url: string; description: string }[];
}

export interface MasterSnapshot {
  id: string;
  name: string;
  createdAt: string;
  itemCounts: {
    experiences: number;
    skills: number;
    projects: number;
    certifications: number;
    licenses: number;
    volunteer: number;
    training: number;
    referees: number;
  };
  data: MasterResume;
}

export interface BulletPoint {
  id: string;
  text: string;
  impactMetric?: string;
  tags?: string[];
  isHighlighted?: boolean;
  hidden?: boolean;
}

export interface WorkExperience {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
  summary?: string;
  bullets: BulletPoint[];
  technologies: string[];
  hidden?: boolean;
}

export interface ProjectItem {
  id: string;
  name: string;
  role?: string;
  link?: string;
  period?: string;
  description: string;
  bullets: BulletPoint[];
  technologies: string[];
  hidden?: boolean;
}

export interface SkillCategory {
  id: string;
  category: string; // e.g. "Languages & Frameworks", "Cloud & DevOps", "Architecture & Leadership"
  skills: string[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  graduationYear: string;
  honors?: string;
  location?: string;
  hidden?: boolean;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  credentialId?: string;
  url?: string;
  hidden?: boolean;
}

export interface LicenseItem {
  id: string;
  name: string;
  authority: string;
  date?: string;
  details?: string;
  credentialId?: string;
  hidden?: boolean;
}

export interface VolunteerItem {
  id: string;
  role: string;
  organization: string;
  period?: string;
  location?: string;
  description: string;
  bullets?: string[];
  hidden?: boolean;
}

export interface TrainingItem {
  id: string;
  title: string;
  institution: string;
  year?: string;
  description?: string;
  skillsLearned?: string[];
  hidden?: boolean;
}

export interface RefereeItem {
  id: string;
  name: string;
  role: string;
  organization: string;
  contactPhone?: string;
  contactEmail?: string;
  relationship?: string;
  notes?: string;
  hidden?: boolean;
}

export interface MasterResume {
  id: string;
  version: number;
  lastUpdated: string;
  contact: ContactInfo;
  executiveSummaries: {
    id: string;
    focusTrack: string; // e.g., "Full-Stack / Technical Lead", "Engineering Manager", "Solutions Architect"
    text: string;
  }[];
  experiences: WorkExperience[];
  projects: ProjectItem[];
  skillCategories: SkillCategory[];
  education: EducationItem[];
  certifications: CertificationItem[];
  licenses?: LicenseItem[];
  volunteer?: VolunteerItem[];
  training?: TrainingItem[];
  referees?: RefereeItem[];
  additionalHighlights: string[]; // Patents, publications, talks, volunteering
  debuggingMilestones?: string[];
  milestoneSections?: MilestoneSection[];
  tasks?: (string | TodoTask)[];
  _guestName?: string;
}

export interface MilestoneSection {
  id: string;
  title: string;
  items: string[];
}

export interface TodoTask {
  id: string;
  text: string;
  section: string; // 'Document Generation' | 'User Experience & Personalisation' | 'Personal Ideas' | etc.
  completed?: boolean;
  status?: 'pending' | 'in_progress' | 'completed';
  createdAt?: string;
}

export interface ATSAnalysis {
  matchScore: number; // 0 - 100
  matchedKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
  recommendations: string[];
  roleFitSummary: string;
}

export interface HarvestSuggestion {
  id: string;
  type: 'new_skill' | 'enhanced_bullet' | 'new_achievement' | 'summary_variant';
  targetSection: string;
  suggestedContent: string;
  reason: string;
  applied: boolean;
}

export interface TailoredResumeVariant {
  executiveSummary: string;
  coverLetter?: string;
  selectedSkills: {
    category: string;
    skills: string[];
  }[];
  experiences: {
    company: string;
    role: string;
    location: string;
    period: string;
    bullets: string[];
    technologies: string[];
  }[];
  projects: {
    name: string;
    role?: string;
    period?: string;
    bullets: string[];
    technologies: string[];
  }[];
  atsAnalysis?: ATSAnalysis;
  pageBudget?: number;
  targetIndustry?: string;
  emphasis?: string;
}

export interface TailoredResume {
  id: string;
  jobTitle: string;
  companyName: string;
  targetJD: string;
  createdAt: string;
  executiveSummary: string;
  selectedSkills: {
    category: string;
    skills: string[];
  }[];
  experiences: {
    company: string;
    role: string;
    location: string;
    period: string;
    bullets: string[];
    technologies: string[];
  }[];
  projects: {
    name: string;
    role?: string;
    period?: string;
    bullets: string[];
    technologies: string[];
  }[];
  education: EducationItem[];
  certifications: CertificationItem[];
  atsAnalysis?: ATSAnalysis;
  harvestedInsights?: HarvestSuggestion[];
  coverLetter?: string;
  pageBudget?: number;
  targetIndustry?: string;
  variants?: {
    [key: string]: TailoredResumeVariant | undefined;
  };
  qaPairs?: { id: string; question: string; answer: string; }[];
}

export type ActiveTab = 'master' | 'tailor' | 'history' | 'audit' | 'advice' | 'utilities' | 'todo' | 'logs';
