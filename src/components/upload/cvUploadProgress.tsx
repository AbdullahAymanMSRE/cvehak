"use client";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { formatFileSize, getStatusLabel } from "@/lib/upload";
import { UploadItem } from "@/types/cv";

export function CvUploadProgress({
  uploads,
}: {
  uploads: { [key: string]: UploadItem };
}) {
  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {Object.entries(uploads).map(([id, upload]) => (
        <div key={id} className="border rounded-lg p-4 space-y-3">
          {/* File Info */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="flex-shrink-0">
                {upload.status === "uploading" && (
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                )}
                {upload.status === "completed" && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
                {upload.status === "error" && (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">
                  {upload.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(upload.file.size)}
                </p>
              </div>
            </div>

            <Badge
              variant={upload.status === "error" ? "destructive" : "secondary"}
              className={`ml-2 ${
                upload.status === "completed"
                  ? "bg-green-100 text-green-800"
                  : upload.status === "uploading"
                  ? "bg-blue-100 text-blue-800"
                  : ""
              }`}
            >
              {getStatusLabel(upload.status.toUpperCase())}
            </Badge>
          </div>

          {/* Progress Bar */}
          {upload.status === "uploading" && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Uploading...</span>
                <span className="text-gray-600">{upload.progress}%</span>
              </div>
              <Progress value={upload.progress} className="h-2" />
            </div>
          )}

          {/* Success Message */}
          {upload.status === "completed" && upload.result?.cv && (
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-sm text-green-800 font-medium">
                    Upload successful!
                  </p>
                  <p className="text-xs text-green-700">
                    Your CV is being analyzed and will appear in your dashboard
                    shortly.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {upload.status === "error" && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <div>
                  <p className="text-sm text-red-800 font-medium">
                    Upload failed
                  </p>
                  <p className="text-xs text-red-700">
                    {upload.error || "An unexpected error occurred"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
