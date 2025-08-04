"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { DashboardStats } from "@/types/dashboard";

interface ScoreChartsProps {
  stats: DashboardStats;
}

export function ScoreCharts({ stats }: ScoreChartsProps) {
  const scoreData = [
    {
      category: "Experience",
      score: Math.round(stats.avgExperienceScore),
    },
    {
      category: "Education",
      score: Math.round(stats.avgEducationScore),
    },
    {
      category: "Skills",
      score: Math.round(stats.avgSkillsScore),
    },
  ];

  const distributionData = [
    {
      name: "Excellent (80-100)",
      value: stats.scoreDistribution.excellent,
      fill: "#22c55e",
    },
    {
      name: "Good (60-79)",
      value: stats.scoreDistribution.good,
      fill: "#3b82f6",
    },
    {
      name: "Fair (40-59)",
      value: stats.scoreDistribution.fair,
      fill: "#f59e0b",
    },
    {
      name: "Poor (0-39)",
      value: stats.scoreDistribution.poor,
      fill: "#ef4444",
    },
  ];

  const chartConfig = {
    score: {
      label: "Score",
      color: "#3b82f6",
    },
  } satisfies ChartConfig;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Average Scores by Category</CardTitle>
          <CardDescription>
            Performance breakdown across different CV sections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoreData}>
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar
                  dataKey="score"
                  fill="var(--color-score)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Score Distribution</CardTitle>
          <CardDescription>How your CVs are performing overall</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) =>
                  value > 0 ? `${name}: ${value}` : ""
                }
                labelLine={false}
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
