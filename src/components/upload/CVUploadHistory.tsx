"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Trash2,
  Eye,
  Clock,
  TrendingUp,
  RefreshCw,
  Download,
} from "lucide-react";
import { formatFileSize, getStatusLabel } from "@/lib/upload";
import { CV } from "@/types/cv";
import Link from "next/link";

function CVUploadHistory() {
  const [cvs, setCvs] = useState<CV[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCVs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/cv?limit=5");
      const data = await response.json();

      if (data.success) {
        setCvs(data.cvs);
      } else {
        setError("Failed to load CVs");
      }
    } catch (err) {
      setError("Failed to load CVs");
      console.error("Error fetching CVs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCVs();
  }, []);

  const handleDelete = async (cvId: string) => {
    if (!confirm("Are you sure you want to delete this CV?")) return;

    try {
      const response = await fetch(`/api/cv/${cvId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCvs((prev) => prev.filter((cv) => cv.id !== cvId));
      } else {
        alert("Failed to delete CV");
      }
    } catch (err) {
      alert("Failed to delete CV");
      console.error("Error deleting CV:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-gray-400" />
        <p className="text-gray-500">Loading your CVs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          <p>{error}</p>
        </div>
        <Button variant="outline" onClick={fetchCVs}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Recent CVs ({cvs.length})</h3>
        <Button variant="outline" size="sm" onClick={fetchCVs}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* CV List */}
      {cvs.length > 0 ? (
        <div className="space-y-3">
          {cvs.map((cv) => (
            <div key={cv.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                {/* CV Info */}
                <div className="flex items-start space-x-3 min-w-0 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    <FileText className="w-5 h-5 text-gray-600" />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium truncate">
                        {cv.filename}
                      </p>
                      <Badge
                        variant="secondary"
                        className={`
                        ${
                          cv.status === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : cv.status === "PROCESSING"
                            ? "bg-blue-100 text-blue-800"
                            : cv.status === "FAILED"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      `}
                      >
                        {getStatusLabel(cv.status)}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{formatFileSize(cv.size)}</span>
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(cv.uploadedAt).toLocaleDateString()}
                      </span>
                      {cv.analysis && (
                        <span className="flex items-center text-green-600">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {cv.analysis.overallScore}/100
                        </span>
                      )}
                    </div>

                    {/* Scores */}
                    {cv.analysis && (
                      <div className="flex items-center space-x-4 text-xs">
                        <span className="text-blue-600">
                          Exp: {cv.analysis.experienceScore}
                        </span>
                        <span className="text-purple-600">
                          Edu: {cv.analysis.educationScore}
                        </span>
                        <span className="text-green-600">
                          Skills: {cv.analysis.skillsScore}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <Link href={`/dashboard/${cv.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
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
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No CVs uploaded yet</p>
          <p className="text-sm">Your uploaded CVs will appear here</p>
        </div>
      )}

      {/* View All Link */}
      {cvs.length >= 5 && (
        <div className="text-center pt-4">
          <Button variant="outline">View All CVs</Button>
        </div>
      )}
    </div>
  );
}

export default CVUploadHistory;
