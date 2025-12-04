export interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    website: string;
  };
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  references: ReferenceItem[];
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  displayDate?: string; // For non-consecutive dates or custom formats
  description: string; // HTML supported
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
  current: boolean;
  displayDate?: string; // For non-consecutive dates or custom formats
  description?: string; // Added description for rich text
}

export interface ReferenceItem {
  id: string;
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
}

export type SectionType = 'personal' | 'summary' | 'experience' | 'education' | 'skills' | 'references' | 'preview';

export enum GenerationStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error'
}