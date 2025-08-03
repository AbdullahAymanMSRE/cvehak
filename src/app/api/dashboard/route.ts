import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import s3Service from "@/services/s3";

export async function GET() {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user's CVs with analysis data (latest 10)
    const recentCVs = await prisma.cV.findMany({
      where: { userId },
      include: {
        analysis: true,
      },
      orderBy: { uploadedAt: "desc" },
      take: 10,
    });

    // Get overall statistics
    const totalCVs = await prisma.cV.count({ where: { userId } });

    // Calculate average scores from completed analyses
    const completedAnalyses = await prisma.cVAnalysis.findMany({
      where: {
        cv: { userId },
      },
      select: {
        experienceScore: true,
        educationScore: true,
        skillsScore: true,
        overallScore: true,
      },
    });

    let averageScores = {
      experience: 0,
      education: 0,
      skills: 0,
      overall: 0,
    };

    if (completedAnalyses.length > 0) {
      const totalExperience = completedAnalyses.reduce(
        (sum, analysis) => sum + analysis.experienceScore,
        0
      );
      const totalEducation = completedAnalyses.reduce(
        (sum, analysis) => sum + analysis.educationScore,
        0
      );
      const totalSkills = completedAnalyses.reduce(
        (sum, analysis) => sum + analysis.skillsScore,
        0
      );
      const totalOverall = completedAnalyses.reduce(
        (sum, analysis) => sum + analysis.overallScore,
        0
      );

      averageScores = {
        experience: Math.round(totalExperience / completedAnalyses.length),
        education: Math.round(totalEducation / completedAnalyses.length),
        skills: Math.round(totalSkills / completedAnalyses.length),
        overall: Math.round(totalOverall / completedAnalyses.length),
      };
    }

    // Get score distribution for charts (grouped by score ranges)
    const scoreDistribution = {
      excellent: completedAnalyses.filter((a) => a.overallScore >= 80).length,
      good: completedAnalyses.filter(
        (a) => a.overallScore >= 60 && a.overallScore < 80
      ).length,
      fair: completedAnalyses.filter(
        (a) => a.overallScore >= 40 && a.overallScore < 60
      ).length,
      poor: completedAnalyses.filter((a) => a.overallScore < 40).length,
    };

    // Format recent CVs
    const formattedCVs = recentCVs.map((cv) => ({
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
        : null,
    }));

    // Get recent activity aggregated by date
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      return date.toISOString().split("T")[0];
    });

    const activityByDate = last7Days
      .map((date) => {
        const count = recentCVs.filter(
          (cv) => cv.uploadedAt.toISOString().split("T")[0] === date
        ).length;
        return { date, count };
      })
      .reverse();

    return NextResponse.json({
      success: true,
      data: {
        totalCVs,
        avgExperienceScore: averageScores.experience,
        avgEducationScore: averageScores.education,
        avgSkillsScore: averageScores.skills,
        avgOverallScore: averageScores.overall,
        scoreDistribution,
        recentActivity: activityByDate,
      },
      cvs: formattedCVs,
    });
  } catch (error) {
    console.error("Dashboard data fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
