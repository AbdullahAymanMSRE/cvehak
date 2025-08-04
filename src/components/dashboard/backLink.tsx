"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export function BackLink() {
  const pathname = usePathname();
  const isRootDashboard = pathname === "/dashboard";

  if (isRootDashboard) {
    return null;
  }

  return (
    <Link
      href="/dashboard"
      className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
    >
      <ChevronLeft className="h-4 w-4 mr-1" />
      Back to Main Dashboard
    </Link>
  );
}
