"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, TrendingUp, Users, Award } from "lucide-react";
import { DashboardStats as StatsType } from "@/types/dashboard";
import { cn } from "@/lib/utils";

export function DashboardStats({ stats }: { stats: StatsType }) {
  const getScoreVariant = (
    score: number
  ): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 80) return "default"; // Green for excellent
    if (score >= 60) return "secondary"; // Blue for good
    if (score >= 40) return "outline"; // Yellow for fair
    return "destructive"; // Red for poor
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Poor";
  };

  const formatScore = (score: number) => Math.round(score);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total CVs</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCVs}</div>
          <p className="text-xs text-muted-foreground">CVs analyzed</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "text-2xl font-bold",
              getScoreVariant(stats.avgOverallScore)
            )}
          >
            {formatScore(stats.avgOverallScore)}
          </div>
          <Badge
            variant={getScoreVariant(stats.avgOverallScore)}
            className="text-xs"
          >
            {getScoreLabel(stats.avgOverallScore)}
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Experience</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatScore(stats.avgExperienceScore)}
          </div>
          <Badge
            variant={getScoreVariant(stats.avgExperienceScore)}
            className="text-xs"
          >
            {getScoreLabel(stats.avgExperienceScore)}
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Skills</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatScore(stats.avgSkillsScore)}
          </div>
          <Badge
            variant={getScoreVariant(stats.avgSkillsScore)}
            className="text-xs"
          >
            {getScoreLabel(stats.avgSkillsScore)}
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
