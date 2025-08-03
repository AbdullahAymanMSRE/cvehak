export interface CV {
  id: string;
  filename: string;
  downloadUrl: string;
  size: number;
  status: string;
  uploadedAt: string;
  processedAt?: string;
  analysis?: {
    experienceScore: number;
    educationScore: number;
    skillsScore: number;
    overallScore: number;
  };
}

export interface UploadItem {
  file: File;
  status: "uploading" | "completed" | "error";
  progress: number;
  result?: UploadResult;
  error?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  success: boolean;
  cv?: {
    id: string;
    filename: string;
    size: number;
    status: string;
    uploadedAt: string;
  };
  error?: string;
}
