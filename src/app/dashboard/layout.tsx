import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { BackLink } from "@/components/dashboard/BackLink";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="space-y-8 container my-8 px-4 md:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <BackLink />
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session.user.name || session.user.email}
          </p>
        </div>
      </div>

      <div className="lg:col-span-3 space-y-8 min-w-0">{children}</div>
    </div>
  );
}
