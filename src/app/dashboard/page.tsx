import { redirect } from "next/navigation";
import { auth } from "@/auth";
import DashboardStats from "@/components/dashboard/DashboardStats";
import ScoreCharts from "@/components/dashboard/ScoreCharts";
import CVTable from "@/components/dashboard/CVTable";
import { GET as getDashboardData } from "@/app/api/dashboard/route";

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
      <CVTable cvs={data.cvs} />

      <h3 className="col-start-1 col-end-auto font-bold text-2xl">
        Overall Analysis
      </h3>
      {/* Stats Cards */}
      <DashboardStats stats={data.data} />

      {/* Charts */}
      <ScoreCharts stats={data.data} />
    </>
  );
}
