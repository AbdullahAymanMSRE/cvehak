"use server";

import { Worker, Job } from "bullmq";
import {
  CVProcessingJobData,
  QUEUE_NAMES,
  addCVAnalysisJob,
} from "@/lib/queue";
import redis from "@/services/redis";
import prisma from "@/lib/prisma";
import s3Service from "@/services/s3";
import pdfParse from "pdf-parse";

// CV Processing Worker
export const cvProcessingWorker = new Worker<CVProcessingJobData>(
  QUEUE_NAMES.CV_PROCESSING,
  async (job: Job<CVProcessingJobData>) => {
    const { cvId, userId, s3Key, filename } = job.data;

    try {
      console.log(`🔄 Processing CV: ${cvId} - ${filename}`);

      // Update CV status to PROCESSING
      await prisma.cV.update({
        where: { id: cvId },
        data: { status: "PROCESSING" },
      });

      // Log processing start
      await prisma.cVProcessingLog.create({
        data: {
          cvId,
          status: "PROCESSING",
          message: "Started CV text extraction",
        },
      });

      // Step 1: Download file from S3
      job.updateProgress(20);
      const downloadUrl = await s3Service.generatePresignedDownloadUrl(s3Key);

      // Step 2: Fetch the PDF file
      job.updateProgress(40);
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Step 3: Extract text from PDF
      job.updateProgress(60);
      const pdfData = await pdfParse(buffer);
      const extractedText = pdfData.text;

      if (!extractedText || extractedText.trim().length === 0) {
        throw new Error("No text could be extracted from the PDF");
      }

      // Step 4: Save extracted text to database
      job.updateProgress(80);
      await prisma.cV.update({
        where: { id: cvId },
        data: {
          extractedText,
          processedAt: new Date(),
        },
      });

      // Step 5: Queue AI analysis job
      job.updateProgress(90);
      await addCVAnalysisJob({
        cvId,
        userId,
        extractedText,
      });

      // Log successful text extraction
      await prisma.cVProcessingLog.create({
        data: {
          cvId,
          status: "PROCESSING",
          message: `Text extraction completed. Extracted ${extractedText.length} characters.`,
        },
      });

      job.updateProgress(100);
      console.log(`✅ CV processing completed: ${cvId}`);

      return {
        success: true,
        extractedTextLength: extractedText.length,
        message: "Text extraction completed successfully",
      };
    } catch (error) {
      console.error(`❌ CV processing failed for ${cvId}:`, error);

      // Update CV status to FAILED
      await prisma.cV.update({
        where: { id: cvId },
        data: { status: "FAILED" },
      });

      // Log the error
      await prisma.cVProcessingLog.create({
        data: {
          cvId,
          status: "FAILED",
          message: "Text extraction failed",
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });

      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 3, // Process up to 3 PDFs simultaneously
  }
);

// Worker event handlers
cvProcessingWorker.on("completed", (job: Job, result: unknown) => {
  console.log(`✅ CV processing worker completed job ${job.id}:`, result);
});

cvProcessingWorker.on("failed", (job: Job | undefined, err: Error) => {
  console.error(`❌ CV processing worker failed job ${job?.id}:`, err);
});

cvProcessingWorker.on("error", (err: Error) => {
  console.error("❌ CV processing worker error:", err);
});

export default cvProcessingWorker;
