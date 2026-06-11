export interface StatusLog {
  id: string;
  status: 'Pending' | 'Shortlisted' | 'Interviewing' | 'Approved' | 'Rejected';
  updatedAt: string;
  updatedBy: string;
  note: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface CompanyGroup {
  id: string;
  name: string;
  description?: string;
}

export interface Job {
  id: string;
  title: string;
  category: string;
  company: string; // Group of companies (e.g., Apex Ventures, Vertex Media, Horizon Industries)
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  salaryRange: string;
  experienceLevel: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  isInternalOnly: boolean;
  datePosted: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  jobCompany: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  coverLetter: string;
  cvFileName: string;
  cvFileData: string; // Base64 data URL for display
  docFileName?: string;
  docFileData?: string; // Optional cover letter / additional docs
  appliedAt: string;
  status: 'Pending' | 'Shortlisted' | 'Interviewing' | 'Approved' | 'Rejected';
  statusLogs: StatusLog[];
}

export interface AdminUser {
  email: string;
  role: 'admin';
}
