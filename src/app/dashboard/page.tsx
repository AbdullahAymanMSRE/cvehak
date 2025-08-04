import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { GET as getDashboardData } from "@/app/api/dashboard/route";
import { DashboardStats } from "@/components/dashboard/dashboardStats";
import { ScoreCharts } from "@/components/dashboard/scoreCharts";
import { CvTable } from "@/components/dashboard/cvTable";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const response = await getDashboardData();

  if (!response.ok) {
    redirect("/auth/signin");
  }

  const data = await response.json();

  return (
    <>
      {/* CV Table */}
      <CvTable initialCvs={data.cvs} />

      <h3 className="col-start-1 col-end-auto font-bold text-2xl">
        Overall Analysis
      </h3>
      {/* Stats Cards */}
      <DashboardStats initialStats={data.data} />

      {/* Charts */}
      <ScoreCharts initialStats={data.data} />
    </>
  );
}
