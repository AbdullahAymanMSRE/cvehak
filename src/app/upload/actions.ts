"use server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import s3Service from "@/services/s3";

export const getCvs = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }
  const cvs = await prisma.cV.findMany({
    where: { userId: session.user.id },
    include: { analysis: true },
  });

  const formattedCVs = cvs.map((cv) => ({
    id: cv.id,
    filename: cv.originalName,
    downloadUrl: s3Service.generatePublicUrl(cv.fileUrl),
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
        }
      : null,
  }));

  return formattedCVs;
};
