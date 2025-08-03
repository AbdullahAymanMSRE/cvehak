import { redirect } from "next/navigation";
import { auth } from "@/auth";
import DashboardStats from "@/components/dashboard/DashboardStats";
import ScoreCharts from "@/components/dashboard/ScoreCharts";
import CVTable from "@/components/dashboard/CVTable";
import { GET as getDashboardData } from "@/app/api/dashboard/route";
import { CVDetailStats, CVFilter } from "@/components/dashboard";
import { CVDetails } from "@/types/dashboard";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ cvId: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const response = await getDashboardData();

  if (!response.ok) {
    redirect("/auth/signin");
  }

  const data = await response.json();

  const selectedCvId = (await searchParams).cvId;

  const selectedCv = data.cvs.find((cv: CVDetails) => cv.id === selectedCvId);

  return (
    <div className="space-y-8 container my-8 px-4 md:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session.user.name || session.user.email}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 w-full">
        {/* Sidebar - CV Filter */}
        <div className="lg:col-span-1 w-full">
          <CVFilter cvs={data.cvs} selectedCv={selectedCv} />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8 min-w-0">
          {selectedCv ? (
            /* Individual CV View */
            <CVDetailStats cv={selectedCv} />
          ) : (
            /* Overview */
            <>
              {/* Stats Cards */}
              <DashboardStats stats={data.data} />

              {/* Charts */}
              <ScoreCharts stats={data.data} />

              {/* CV Table */}
              <CVTable cvs={data.cvs} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
