import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Award,
  Briefcase,
  GraduationCap,
  Wrench,
  Clock,
  FileText,
  Eye,
} from "lucide-react";
import { CVDetails } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CVDetailStats({ cv }: { cv: CVDetails }) {
  const getScoreVariant = (
    score: number
  ): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    if (score >= 40) return "outline";
    return "destructive";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Poor";
  };

  if (!cv.analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>CV Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Analysis not yet completed</p>
            <p className="text-sm">
              {cv.status === "PROCESSING"
                ? "Your CV is currently being processed..."
                : "Please wait for analysis to complete"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* CV Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span className="truncate">{cv.filename}</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Link href={cv.downloadUrl} target="_blank">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={cv.status !== "COMPLETED"}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View CV
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground block">Overall Score</span>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-2xl font-bold">
                  {cv.analysis.overallScore}
                </span>
                <Badge
                  variant={getScoreVariant(cv.analysis.overallScore)}
                  className="text-xs"
                >
                  {getScoreLabel(cv.analysis.overallScore)}
                </Badge>
              </div>
            </div>
            <div>
              <span className="text-muted-foreground block">Size</span>
              <span className="font-medium mt-1 block">
                {(cv.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Uploaded</span>
              <span className="font-medium mt-1 block">
                {new Date(cv.uploadedAt).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Processed</span>
              <span className="font-medium mt-1 block">
                {cv.processedAt
                  ? new Date(cv.processedAt).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Experience</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {cv.analysis.experienceScore}
            </div>
            <Progress value={cv.analysis.experienceScore} className="mb-2" />
            <Badge
              variant={getScoreVariant(cv.analysis.experienceScore)}
              className="text-xs"
            >
              {getScoreLabel(cv.analysis.experienceScore)}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Education</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {cv.analysis.educationScore}
            </div>
            <Progress value={cv.analysis.educationScore} className="mb-2" />
            <Badge
              variant={getScoreVariant(cv.analysis.educationScore)}
              className="text-xs"
            >
              {getScoreLabel(cv.analysis.educationScore)}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skills</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {cv.analysis.skillsScore}
            </div>
            <Progress value={cv.analysis.skillsScore} className="mb-2" />
            <Badge
              variant={getScoreVariant(cv.analysis.skillsScore)}
              className="text-xs"
            >
              {getScoreLabel(cv.analysis.skillsScore)}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Feedback */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>AI Analysis & Feedback</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground whitespace-pre-wrap">
              {cv.analysis.feedback}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
