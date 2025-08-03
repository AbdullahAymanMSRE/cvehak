import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { LoggedInHomePage } from "@/components/home/loggedInHomePage";
import { LoggedOutHomePage } from "@/components/home/loggedOutHomePage";

export default async function Home() {
  const session = await auth();

  // Get user data if logged in
  let userData = null;
  if (session?.user?.id) {
    try {
      const totalCVs = await prisma.cV.count({
        where: { userId: session.user.id },
      });
      const recentCVs = await prisma.cV.findMany({
        where: { userId: session.user.id },
        include: { analysis: true },
        orderBy: { uploadedAt: "desc" },
        take: 3,
      });

      const completedAnalyses = await prisma.cVAnalysis.findMany({
        where: { cv: { userId: session.user.id } },
        select: { overallScore: true },
      });

      let avgScore = 0;
      if (completedAnalyses.length > 0) {
        const totalScore = completedAnalyses.reduce(
          (sum, analysis) => sum + analysis.overallScore,
          0
        );
        avgScore = Math.round(totalScore / completedAnalyses.length);
      }

      userData = { totalCVs, recentCVs, avgScore };
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  if (session?.user) {
    return <LoggedInHomePage session={session} userData={userData} />;
  }

  return <LoggedOutHomePage />;
}
