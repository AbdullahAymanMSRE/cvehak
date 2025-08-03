import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Upload, BarChart3, History } from "lucide-react";
import { Session } from "next-auth";
import { PageLayout } from "./pageLayout";
import { FeaturesGrid } from "./featuresGrid";
import { CtaSection } from "./ctaSection";

interface UserData {
  totalCVs: number;
  recentCVs: Array<{
    id: string;
    originalName: string;
    uploadedAt: Date;
    analysis: {
      overallScore: number;
    } | null;
  }>;
  avgScore: number;
}

interface LoggedInHomePageProps {
  session: Session;
  userData: UserData | null;
}

export function LoggedInHomePage({ session, userData }: LoggedInHomePageProps) {
  const ctaButtons = [
    {
      href: "/upload",
      text: "Upload Another CV",
      icon: Upload,
      variant: "primary" as const,
    },
    {
      href: "/dashboard",
      text: "View Analytics",
      icon: BarChart3,
      variant: "secondary" as const,
    },
  ];

  return (
    <PageLayout>
      {/* Welcome Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                Welcome back, {session.user?.name || "there"}!
              </h1>
              <p className="text-xl text-gray-600">
                Ready to analyze another CV or check your progress?
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/upload">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload New CV
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  View Dashboard
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            {userData && (
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <Card className="border-0 shadow-lg">
                  <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold text-blue-600">
                      {userData.totalCVs}
                    </CardTitle>
                    <CardDescription>Total CVs Analyzed</CardDescription>
                  </CardHeader>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold text-green-600">
                      {userData.avgScore > 0 ? `${userData.avgScore}%` : "N/A"}
                    </CardTitle>
                    <CardDescription>Average Overall Score</CardDescription>
                  </CardHeader>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold text-purple-600">
                      {userData.recentCVs.length}
                    </CardTitle>
                    <CardDescription>Recent Uploads</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            )}

            {/* Recent CVs */}
            {userData?.recentCVs && userData.recentCVs.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <History className="w-5 h-5 mr-2" />
                    Recent CV Analyses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userData.recentCVs.slice(0, 3).map((cv) => (
                      <div
                        key={cv.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium">{cv.originalName}</h4>
                          <p className="text-sm text-gray-600">
                            Uploaded{" "}
                            {new Date(cv.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          {cv.analysis ? (
                            <div className="text-lg font-bold text-green-600">
                              {cv.analysis.overallScore}%
                            </div>
                          ) : (
                            <div className="text-sm text-yellow-600">
                              Processing...
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      <FeaturesGrid
        title="Platform Features"
        description="Explore all the powerful features at your disposal"
      />

      <CtaSection
        title="Keep Improving Your CV"
        description="Upload another version of your CV to track improvements and get the best possible score"
        buttons={ctaButtons}
      />
    </PageLayout>
  );
}
