import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;
const UPLOAD_EXPIRATION = 15 * 60; // 15 minutes in seconds
const DOWNLOAD_EXPIRATION = 60 * 60; // 1 hour in seconds

// Generate S3 key for user's CV file
export function generateS3Key(userId: string, filename: string): string {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `users/${userId}/cvs/${timestamp}-${sanitizedFilename}`;
}

// Generate presigned POST URL for direct client upload
export async function generatePresignedUploadUrl(
  userId: string,
  filename: string,
  contentType: string = "application/pdf"
): Promise<{
  url: string;
  fields: Record<string, string>;
  key: string;
}> {
  const key = generateS3Key(userId, filename);

  // Validate content type
  if (contentType !== "application/pdf") {
    throw new Error("Only PDF files are allowed");
  }

  try {
    const maxSize = getMaxFileSize();
    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket: BUCKET_NAME,
      Key: key,
      Conditions: [
        ["content-length-range", 0, maxSize], // Max file size from env
        ["eq", "$Content-Type", contentType],
      ],
      Fields: {
        "Content-Type": contentType,
      },
      Expires: UPLOAD_EXPIRATION,
    });

    return { url, fields, key };
  } catch (error) {
    console.error("Error generating presigned upload URL:", error);
    throw new Error("Failed to generate upload URL");
  }
}

// Generate presigned GET URL for file download
export async function generatePresignedDownloadUrl(
  key: string
): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, {
      expiresIn: DOWNLOAD_EXPIRATION,
    });

    return url;
  } catch (error) {
    console.error("Error generating presigned download URL:", error);
    throw new Error("Failed to generate download URL");
  }
}

// Check if file exists in S3
export async function fileExists(key: string): Promise<boolean> {
  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "name" in error &&
      error.name === "NotFound"
    ) {
      return false;
    }
    console.error("Error checking file existence:", error);
    throw new Error("Failed to check file existence");
  }
}

// Delete file from S3
export async function deleteFile(key: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    throw new Error("Failed to delete file");
  }
}

// Get file metadata
export async function getFileMetadata(key: string): Promise<{
  size: number;
  lastModified: Date;
  contentType: string;
}> {
  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);

    return {
      size: response.ContentLength || 0,
      lastModified: response.LastModified || new Date(),
      contentType: response.ContentType || "application/pdf",
    };
  } catch (error) {
    console.error("Error getting file metadata:", error);
    throw new Error("Failed to get file metadata");
  }
}

// Get max file size from environment or default to 10MB
const getMaxFileSize = (): number => {
  const maxSizeMB = parseInt(process.env.MAX_FILE_SIZE_MB || "10");
  return maxSizeMB * 1024 * 1024; // Convert MB to bytes
};

// Validate file type and size
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (file.type !== "application/pdf") {
    return { valid: false, error: "Only PDF files are allowed" };
  }

  // Check file size
  const maxSize = getMaxFileSize();
  const maxSizeMB = Math.round(maxSize / (1024 * 1024));
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size must be less than ${maxSizeMB}MB`,
    };
  }

  // Check filename
  if (!file.name || file.name.trim() === "") {
    return { valid: false, error: "File must have a valid name" };
  }

  return { valid: true };
}

// Extract file extension from filename
export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}

// Generate public URL for file (if bucket allows public access)
export function generatePublicUrl(key: string): string {
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

const s3Service = {
  generatePresignedUploadUrl,
  generatePresignedDownloadUrl,
  fileExists,
  deleteFile,
  getFileMetadata,
  validateFile,
  generateS3Key,
  getFileExtension,
  generatePublicUrl,
};

export default s3Service;
