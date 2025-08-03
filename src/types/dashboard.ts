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
  size: number;
  status: "UPLOADED" | "PROCESSING" | "COMPLETED" | "FAILED";
  uploadedAt: string;
  processedAt?: string;
  analysis?: {
    experienceScore: number;
    educationScore: number;
    skillsScore: number;
    overallScore: number;
    feedback: string;
  };
}

export interface DashboardData {
  stats: DashboardStats;
  cvs: CVDetails[];
}
