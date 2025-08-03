"use server";

import { Worker, Job } from "bullmq";
import { CVAnalysisJobData, QUEUE_NAMES } from "../lib/queue";
import redis from "@/services/redis";
import prisma from "@/lib/prisma";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const AI_MODEL = process.env.OPENAI_MODEL || "gpt-3.5-turbo";

// AI Analysis prompts
const ANALYSIS_PROMPT = `
You are an expert HR professional tasked with analyzing CVs. Analyze the following CV text and provide scores and detailed feedback.

SCORING CRITERIA (0-100 scale):
1. EXPERIENCE SCORE: Based on years of experience, relevance, progression, achievements
2. EDUCATION SCORE: Based on educational qualifications, certifications, relevance
3. SKILLS SCORE: Based on technical/soft skills, relevance to modern job market

EXTRACTION REQUIREMENTS:
- Years of experience (estimate if not explicit)
- Education level (High School/Bachelor's/Master's/PhD/Professional)
- Key skills (array of strings)
- Job titles (array of strings)
- Companies worked at (array of strings)

Respond ONLY with valid JSON in this exact format:
{
  "experienceScore": number,
  "educationScore": number,
  "skillsScore": number,
  "experienceAnalysis": "detailed analysis of experience...",
  "educationAnalysis": "detailed analysis of education...",
  "skillsAnalysis": "detailed analysis of skills...",
  "overallFeedback": "overall assessment and recommendations...",
  "yearsOfExperience": number,
  "educationLevel": "string",
  "keySkills": ["skill1", "skill2", "skill3"],
  "jobTitles": ["title1", "title2"],
  "companies": ["company1", "company2"]
}

CV TEXT:
`;

// CV Analysis Worker
export const cvAnalysisWorker = new Worker<CVAnalysisJobData>(
  QUEUE_NAMES.CV_ANALYSIS,
  async (job: Job<CVAnalysisJobData>) => {
    const { cvId, extractedText } = job.data;

    try {
      console.log(`🤖 Analyzing CV: ${cvId}`);

      // Log analysis start
      await prisma.cVProcessingLog.create({
        data: {
          cvId,
          status: "PROCESSING",
          message: "Started AI analysis",
        },
      });

      // Step 1: Prepare prompt
      job.updateProgress(20);
      const prompt = ANALYSIS_PROMPT + extractedText;

      // Step 2: Call OpenAI API
      job.updateProgress(40);
      const startTime = Date.now();

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      });

      const processingTime = Date.now() - startTime;
      const tokensUsed = response.usage?.total_tokens || 0;

      // Step 3: Parse AI response
      job.updateProgress(60);
      const aiResponse = response.choices[0]?.message?.content;

      if (!aiResponse) {
        throw new Error("No response from OpenAI");
      }

      let analysisData;
      try {
        analysisData = JSON.parse(aiResponse);
      } catch (parseError) {
        console.error("Failed to parse AI response:", aiResponse);
        throw new Error("Invalid JSON response from AI");
      }

      // Step 4: Validate and calculate overall score
      job.updateProgress(80);
      const { experienceScore, educationScore, skillsScore } = analysisData;

      if (
        typeof experienceScore !== "number" ||
        typeof educationScore !== "number" ||
        typeof skillsScore !== "number"
      ) {
        throw new Error("Invalid scores in AI response");
      }

      const overallScore = Math.round(
        (experienceScore + educationScore + skillsScore) / 3
      );

      // Step 5: Save analysis to database
      job.updateProgress(90);
      await prisma.cVAnalysis.create({
        data: {
          cvId,
          experienceScore,
          educationScore,
          skillsScore,
          overallScore,
          experienceAnalysis: analysisData.experienceAnalysis || "",
          educationAnalysis: analysisData.educationAnalysis || "",
          skillsAnalysis: analysisData.skillsAnalysis || "",
          overallFeedback: analysisData.overallFeedback || "",
          yearsOfExperience: analysisData.yearsOfExperience || null,
          educationLevel: analysisData.educationLevel || null,
          keySkills: analysisData.keySkills || [],
          jobTitles: analysisData.jobTitles || [],
          companies: analysisData.companies || [],
          aiModel: AI_MODEL,
          processingTime,
          tokensUsed,
        },
      });

      // Update CV status to COMPLETED
      await prisma.cV.update({
        where: { id: cvId },
        data: { status: "COMPLETED" },
      });

      // Log successful analysis
      await prisma.cVProcessingLog.create({
        data: {
          cvId,
          status: "COMPLETED",
          message: `Analysis completed. Overall score: ${overallScore}/100`,
        },
      });

      job.updateProgress(100);
      console.log(
        `✅ CV analysis completed: ${cvId} - Score: ${overallScore}/100`
      );

      return {
        success: true,
        overallScore,
        tokensUsed,
        processingTime,
        message: "AI analysis completed successfully",
      };
    } catch (error) {
      console.error(`❌ CV analysis failed for ${cvId}:`, error);

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
          message: "AI analysis failed",
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });

      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 2, // Process up to 2 analyses simultaneously (API rate limits)
  }
);

// Worker event handlers
cvAnalysisWorker.on("completed", (job: Job, result: any) => {
  console.log(`✅ CV analysis worker completed job ${job.id}:`, result);
});

cvAnalysisWorker.on("failed", (job: Job | undefined, err: Error) => {
  console.error(`❌ CV analysis worker failed job ${job?.id}:`, err);
});

cvAnalysisWorker.on("error", (err: Error) => {
  console.error("❌ CV analysis worker error:", err);
});

export default cvAnalysisWorker;
