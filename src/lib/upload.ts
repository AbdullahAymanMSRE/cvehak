// Client-side file upload utilities

import { MAX_FILE_SIZE, MAX_FILE_SIZE_MB } from "./constants";
import { UploadProgress, UploadResult } from "@/types/cv";

// Upload file to CV endpoint and then to S3
export async function uploadCV(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  try {
    // Step 1: Get presigned upload URL from our API
    const formData = new FormData();
    formData.append("file", file);

    const apiResponse = await fetch("/api/cv", {
      method: "POST",
      body: formData,
    });

    if (!apiResponse.ok) {
      const error = await apiResponse.json();
      return {
        success: false,
        error: error.error || "Failed to initiate upload",
      };
    }

    const apiResult = await apiResponse.json();
    const { cv, upload } = apiResult;

    // Step 2: Upload directly to S3 using presigned URL
    const s3FormData = new FormData();

    // Add all the required fields from S3
    Object.entries(upload.fields).forEach(([key, value]) => {
      s3FormData.append(key, value as string);
    });

    // Add the file last (required by S3)
    s3FormData.append("file", file);

    // Upload to S3 with progress tracking
    const xhr = new XMLHttpRequest();

    return new Promise<UploadResult>((resolve) => {
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable && onProgress) {
          const progress: UploadProgress = {
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100),
          };
          onProgress(progress);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 204) {
          // S3 returns 204 on successful upload
          resolve({
            success: true,
            cv,
          });
        } else {
          resolve({
            success: false,
            error: "Failed to upload file to storage",
          });
        }
      });

      xhr.addEventListener("error", () => {
        resolve({
          success: false,
          error: "Network error during upload",
        });
      });

      xhr.open("POST", upload.url);
      xhr.send(s3FormData);
    });
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      error: "Unexpected error during upload",
    };
  }
}

// Validate file before upload
export function validateCV(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (file.type !== "application/pdf") {
    return { valid: false, error: "Only PDF files are allowed" };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size must be less than ${MAX_FILE_SIZE_MB}MB`,
    };
  }

  // Check filename
  if (!file.name || file.name.trim() === "") {
    return { valid: false, error: "File must have a valid name" };
  }

  return { valid: true };
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Get status label for UI
export function getStatusLabel(status: string): string {
  switch (status) {
    case "UPLOADED":
      return "Uploaded";
    case "PROCESSING":
      return "Processing...";
    case "COMPLETED":
      return "Analysis Complete";
    case "FAILED":
      return "Failed";
    case "RETRY":
      return "Retrying...";
    default:
      return status;
  }
}
