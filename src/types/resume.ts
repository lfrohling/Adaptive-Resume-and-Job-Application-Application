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

export interface BulletPoint {
  id: string;
  text: string;
  impactMetric?: string;
  tags?: string[];
  isHighlighted?: boolean;
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
  additionalHighlights: string[]; // Patents, publications, talks, volunteering
  debuggingMilestones?: string[];
  tasks?: (string | TodoTask)[];
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
  variants?: {
    1?: TailoredResumeVariant;
    2?: TailoredResumeVariant;
    [key: number]: TailoredResumeVariant | undefined;
  };
  qaPairs?: { id: string; question: string; answer: string; }[];
}

export type ActiveTab = 'master' | 'tailor' | 'history' | 'audit' | 'advice' | 'todo' | 'logs';
