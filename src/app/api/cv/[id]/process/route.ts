import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { addCVProcessingJob } from "@/lib/queue";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const cvId = (await params).id;

    // Verify CV exists and belongs to user
    const cv = await prisma.cV.findFirst({
      where: {
        id: cvId,
        userId,
      },
    });

    if (!cv) {
      return NextResponse.json({ error: "CV not found" }, { status: 404 });
    }

    // Check if already processing or completed
    if (cv.status !== "UPLOADED") {
      return NextResponse.json(
        { error: `CV is already ${cv.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    // Queue the processing job now that S3 upload is confirmed
    await addCVProcessingJob({
      cvId: cv.id,
      userId,
      filename: cv.originalName,
      s3Key: cv.fileUrl,
      fileSize: cv.fileSize,
    });

    // Update status to indicate processing has been queued
    await prisma.cV.update({
      where: { id: cvId },
      data: { status: "PROCESSING" },
    });

    // Log the processing start
    await prisma.cVProcessingLog.create({
      data: {
        cvId: cv.id,
        status: "PROCESSING",
        message: "Processing job queued after successful S3 upload",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Processing started",
      cv: {
        id: cv.id,
        status: "PROCESSING",
      },
    });
  } catch (error) {
    console.error("CV processing trigger error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
