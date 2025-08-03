import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import s3Service from "@/services/s3";

// Get individual CV details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const cvId = params.id;

    // Fetch CV with analysis data
    const cv = await prisma.cV.findFirst({
      where: {
        id: cvId,
        userId, // Ensure user owns this CV
      },
      include: {
        analysis: true,
      },
    });

    if (!cv) {
      return NextResponse.json({ error: "CV not found" }, { status: 404 });
    }

    // Generate download URL if needed
    let downloadUrl = null;
    if (cv.fileUrl) {
      try {
        downloadUrl = await s3Service.generatePresignedDownloadUrl(cv.fileUrl);
      } catch (error) {
        console.error("Error generating download URL:", error);
      }
    }

    // Format response
    const response = {
      id: cv.id,
      filename: cv.originalName,
      size: cv.fileSize,
      status: cv.status,
      uploadedAt: cv.uploadedAt,
      processedAt: cv.processedAt,
      extractedText: cv.extractedText,
      downloadUrl,
      analysis: cv.analysis
        ? {
            experienceScore: cv.analysis.experienceScore,
            educationScore: cv.analysis.educationScore,
            skillsScore: cv.analysis.skillsScore,
            overallScore: cv.analysis.overallScore,
            experienceAnalysis: cv.analysis.experienceAnalysis,
            educationAnalysis: cv.analysis.educationAnalysis,
            skillsAnalysis: cv.analysis.skillsAnalysis,
            overallFeedback: cv.analysis.overallFeedback,
            yearsOfExperience: cv.analysis.yearsOfExperience,
            educationLevel: cv.analysis.educationLevel,
            keySkills: cv.analysis.keySkills,
            jobTitles: cv.analysis.jobTitles,
            companies: cv.analysis.companies,
            aiModel: cv.analysis.aiModel,
            processingTime: cv.analysis.processingTime,
            tokensUsed: cv.analysis.tokensUsed,
            createdAt: cv.analysis.createdAt,
          }
        : null,
    };

    return NextResponse.json({
      success: true,
      cv: response,
    });
  } catch (error) {
    console.error("CV fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete CV
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const cvId = params.id;

    // Find CV and ensure user owns it
    const cv = await prisma.cV.findFirst({
      where: {
        id: cvId,
        userId,
      },
    });

    if (!cv) {
      return NextResponse.json({ error: "CV not found" }, { status: 404 });
    }

    // Delete from S3 if file exists
    if (cv.fileUrl) {
      try {
        await s3Service.deleteFile(cv.fileUrl);
      } catch (error) {
        console.error("Error deleting file from S3:", error);
        // Continue with database deletion even if S3 deletion fails
      }
    }

    // Delete from database (this will cascade to analysis and logs)
    await prisma.cV.delete({
      where: { id: cvId },
    });

    return NextResponse.json({
      success: true,
      message: "CV deleted successfully",
    });
  } catch (error) {
    console.error("CV deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
