import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import s3Service from "@/services/s3";
import { addCVProcessingJob } from "@/lib/queue";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file
    const validation = s3Service.validateFile(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Generate S3 key and presigned upload URL
    const s3Key = s3Service.generateS3Key(userId, file.name);
    const { url, fields } = await s3Service.generatePresignedUploadUrl(
      userId,
      file.name,
      file.type
    );

    // Save CV metadata to database
    const cv = await prisma.cV.create({
      data: {
        userId,
        filename: s3Key.split("/").pop() || file.name, // Extract filename from S3 key
        originalName: file.name,
        fileUrl: s3Key, // Store S3 key for later retrieval
        fileSize: file.size,
        mimeType: file.type,
        status: "UPLOADED",
      },
    });

    // Add background processing job
    await addCVProcessingJob({
      cvId: cv.id,
      userId,
      filename: file.name,
      s3Key,
      fileSize: file.size,
    });

    // Log the upload
    await prisma.cVProcessingLog.create({
      data: {
        cvId: cv.id,
        status: "UPLOADED",
        message: `CV uploaded: ${file.name} (${file.size} bytes)`,
      },
    });

    // Return upload URL and CV info
    return NextResponse.json({
      success: true,
      cv: {
        id: cv.id,
        filename: cv.originalName,
        size: cv.fileSize,
        status: cv.status,
        uploadedAt: cv.uploadedAt,
      },
      upload: {
        url,
        fields,
        key: s3Key,
      },
    });
  } catch (error) {
    console.error("CV upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get user's CVs
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get query parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Fetch user's CVs with analysis data
    const [cvs, total] = await Promise.all([
      prisma.cV.findMany({
        where: { userId },
        include: {
          analysis: true,
        },
        orderBy: { uploadedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.cV.count({
        where: { userId },
      }),
    ]);

    // Format response
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedCVs = cvs.map((cv: any) => ({
      id: cv.id,
      filename: cv.originalName,
      size: cv.fileSize,
      status: cv.status,
      uploadedAt: cv.uploadedAt,
      processedAt: cv.processedAt,
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
          }
        : null,
    }));

    return NextResponse.json({
      success: true,
      cvs: formattedCVs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("CV fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
