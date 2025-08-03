import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import s3Service from "@/services/s3";
import { addCVProcessingJob } from "@/lib/queue";
import { revalidatePath } from "next/cache";

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

    revalidatePath("/upload");

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
