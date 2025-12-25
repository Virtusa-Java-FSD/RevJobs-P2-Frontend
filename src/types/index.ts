export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'JOB_SEEKER' | 'RECRUITER' | 'ADMIN';
  profilePicture?: string;
}

export interface JobSeeker extends User {
  skills: string[];
  experience: Experience[];
  resumeUrl?: string;
  location: string;
  expectedSalary?: number;
}

export interface Employer extends User {
  companyName: string;
  companyDescription: string;
  website?: string;
  companySize: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  salaryMin?: number;
  salaryMax?: number;
  location: string;
  remote: boolean;
  experienceLevel: 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD';
  employerId: string;
  recruiterId: number;
  recruiterEmail?: string;
  companyName: string;
  postedDate: string;
  applicationDeadline?: string;
  status: 'ACTIVE' | 'CLOSED' | 'DRAFT';
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  coverLetter: string;
  status: 'APPLIED' | 'REVIEWED' | 'INTERVIEW' | 'REJECTED' | 'OFFERED';
  appliedDate: string;
  lastUpdated: string;
}

export interface Interview {
  id: string;
  applicationId: string;
  scheduledDate: string;
  duration: number;
  type: 'PHONE' | 'VIDEO' | 'IN_PERSON';
  notes?: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'APPLICATION' | 'INTERVIEW' | 'MESSAGE' | 'JOB_ALERT';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface JobAlert {
  id: string;
  userId: string;
  keywords: string[];
  location?: string;
  salaryMin?: number;
  remote?: boolean;
  active: boolean;
}