import { CVDetailStats } from "@/components/dashboard";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import s3Service from "@/services/s3";

export async function generateStaticParams() {
  const cvs = await prisma.cV.findMany();
  return cvs.map((cv) => ({ cv: cv.id }));
}

export default async function CVPage({
  params,
}: {
  params: Promise<{ cv: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const cvId = (await params).cv;
  const userId = session.user.id;

  // Get the specific CV with analysis data
  const cv = await prisma.cV.findFirst({
    where: {
      id: cvId,
      userId: userId, // Ensure user can only access their own CVs
    },
    include: {
      analysis: true,
    },
  });

  if (!cv) {
    notFound();
  }

  const cvData = {
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
          experienceAnalysis: cv.analysis.experienceAnalysis,
          educationAnalysis: cv.analysis.educationAnalysis,
          skillsAnalysis: cv.analysis.skillsAnalysis,
          feedback: cv.analysis.overallFeedback,
          yearsOfExperience: cv.analysis.yearsOfExperience,
          educationLevel: cv.analysis.educationLevel,
          keySkills: cv.analysis.keySkills,
          jobTitles: cv.analysis.jobTitles,
          companies: cv.analysis.companies,
        }
      : undefined,
  };

  return <CVDetailStats cv={cvData} />;
}
