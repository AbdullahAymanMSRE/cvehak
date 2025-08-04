"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Eye,
  Download,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { CVDetails } from "@/types/dashboard";
import { formatFileSize } from "@/lib/upload";
import Link from "next/link";

export function CvTable({ cvs }: { cvs: CVDetails[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "PROCESSING":
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      case "FAILED":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const getVariant = ():
      | "default"
      | "secondary"
      | "destructive"
      | "outline" => {
      switch (status) {
        case "COMPLETED":
          return "default";
        case "PROCESSING":
          return "secondary";
        case "FAILED":
          return "destructive";
        case "UPLOADED":
        default:
          return "outline";
      }
    };

    return <Badge variant={getVariant()}>{status.toLowerCase()}</Badge>;
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this CV?")) return;

    setDeletingId(id);
    try {
      const response = await fetch(`/api/cv/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
      } else {
        alert("Failed to delete CV");
      }
    } catch (error) {
      console.error("Error deleting CV:", error);
      alert("Failed to delete CV");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Your CVs</CardTitle>
            <CardDescription>
              Manage and view analysis results for your uploaded CVs
            </CardDescription>
          </div>
          <Button asChild>
            <Link href="/upload">Add CV</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Filename</TableHead>
                  <TableHead className="min-w-[100px] hidden sm:table-cell">
                    Status
                  </TableHead>
                  <TableHead className="min-w-[120px] hidden sm:table-cell">
                    Scores
                  </TableHead>
                  <TableHead className="min-w-[80px] hidden md:table-cell">
                    Size
                  </TableHead>
                  <TableHead className="min-w-[100px] hidden lg:table-cell">
                    Uploaded
                  </TableHead>
                  <TableHead className="text-right min-w-[120px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cvs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No CVs uploaded yet
                    </TableCell>
                  </TableRow>
                ) : (
                  cvs.map((cv) => (
                    <TableRow key={cv.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(cv.status)}
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium">
                              {cv.filename}
                            </div>
                            <div className="block sm:hidden text-xs text-muted-foreground mt-1">
                              {getStatusBadge(cv.status)}
                              {cv.analysis && (
                                <span className="ml-2">
                                  Score: {cv.analysis.overallScore}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {getStatusBadge(cv.status)}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {cv.analysis ? (
                          <div className="space-y-1">
                            <div className="text-sm">
                              Overall:{" "}
                              <span className="font-medium">
                                {cv.analysis.overallScore}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              E:{cv.analysis.experienceScore} • Ed:
                              {cv.analysis.educationScore} • S:
                              {cv.analysis.skillsScore}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                        {formatFileSize(cv.size)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                        {new Date(cv.uploadedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <Link href={`/dashboard/${cv.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={cv.status !== "COMPLETED"}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={cv.downloadUrl} target="_blank">
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={cv.status !== "COMPLETED"}
                              className="h-8 w-8 p-0"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(cv.id)}
                            disabled={deletingId === cv.id}
                            className="h-8 w-8 p-0"
                          >
                            {deletingId === cv.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
