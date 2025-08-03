import { CVStatus } from "@prisma/client";

export interface DashboardStats {
  totalCVs: number;
  avgExperienceScore: number;
  avgEducationScore: number;
  avgSkillsScore: number;
  avgOverallScore: number;
  scoreDistribution: {
    excellent: number; // 80-100
    good: number; // 60-79
    fair: number; // 40-59
    poor: number; // 0-39
  };
  recentActivity: {
    date: string;
    count: number;
  }[];
}

export interface CVDetails {
  id: string;
  filename: string;
  downloadUrl: string;
  size: number;
  status: CVStatus;
  uploadedAt: Date;
  processedAt: Date | null;
  analysis?: {
    experienceScore: number;
    educationScore: number;
    skillsScore: number;
    overallScore: number;
    experienceAnalysis: string | null;
    educationAnalysis: string | null;
    skillsAnalysis: string | null;
    feedback: string | null;
    yearsOfExperience: number | null;
    educationLevel: string | null;
    keySkills: string[] | null;
    jobTitles: string[] | null;
    companies: string[] | null;
  };
}

export interface DashboardData {
  stats: DashboardStats;
  cvs: CVDetails[];
}
