import { Queue } from "bullmq";
import redis from "@/services/redis";

// Job types and data interfaces
export interface CVProcessingJobData {
  cvId: string;
  userId: string;
  filename: string;
  s3Key: string;
  fileSize: number;
}

export interface CVAnalysisJobData {
  cvId: string;
  userId: string;
  extractedText: string;
}

// Queue names
export const QUEUE_NAMES = {
  CV_PROCESSING: "cv-processing",
  CV_ANALYSIS: "cv-analysis",
} as const;

// Create queues
export const cvProcessingQueue = new Queue<CVProcessingJobData>(
  QUEUE_NAMES.CV_PROCESSING,
  {
    connection: redis,
    defaultJobOptions: {
      removeOnComplete: 10, // Keep last 10 completed jobs
      removeOnFail: 50, // Keep last 50 failed jobs
      attempts: 3, // Retry failed jobs 3 times
      backoff: {
        type: "exponential",
        delay: 2000, // Start with 2 second delay
      },
    },
  }
);

export const cvAnalysisQueue = new Queue<CVAnalysisJobData>(
  QUEUE_NAMES.CV_ANALYSIS,
  {
    connection: redis,
    defaultJobOptions: {
      removeOnComplete: 10,
      removeOnFail: 50,
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    },
  }
);

// Add jobs to queues
export async function addCVProcessingJob(data: CVProcessingJobData) {
  const job = await cvProcessingQueue.add("process-cv", data, {
    priority: 1, // Higher priority for processing
  });

  console.log(`📄 Added CV processing job for CV: ${data.cvId}`);
  return job;
}

export async function addCVAnalysisJob(data: CVAnalysisJobData) {
  const job = await cvAnalysisQueue.add("analyze-cv", data, {
    priority: 2, // Lower priority for analysis
  });

  console.log(`🤖 Added CV analysis job for CV: ${data.cvId}`);
  return job;
}

// Get queue stats
export async function getQueueStats() {
  const [processingStats, analysisStats] = await Promise.all([
    cvProcessingQueue.getJobCounts(),
    cvAnalysisQueue.getJobCounts(),
  ]);

  return {
    processing: processingStats,
    analysis: analysisStats,
  };
}

// Clean up old jobs
export async function cleanOldJobs() {
  await Promise.all([
    cvProcessingQueue.clean(24 * 60 * 60 * 1000, 100, "completed"), // Clean completed jobs older than 24h
    cvProcessingQueue.clean(7 * 24 * 60 * 60 * 1000, 50, "failed"), // Clean failed jobs older than 7 days
    cvAnalysisQueue.clean(24 * 60 * 60 * 1000, 100, "completed"),
    cvAnalysisQueue.clean(7 * 24 * 60 * 60 * 1000, 50, "failed"),
  ]);

  console.log("🧹 Cleaned old jobs from queues");
}

// Graceful shutdown
export async function closeQueues() {
  await Promise.all([cvProcessingQueue.close(), cvAnalysisQueue.close()]);

  console.log("🔌 Queues closed gracefully");
}
