"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Upload, CheckCircle } from "lucide-react";
import { CvDropzone } from "@/components/upload/cvDropzone";
import { CvUploadProgress } from "@/components/upload/cvUploadProgress";
import { uploadCV, validateCV } from "@/lib/upload";
import uuid4 from "uuid4";
import { UploadItem } from "@/types/cv";
import { useQueryClient } from "@tanstack/react-query";

export function CvUploadPage() {
  const [uploads, setUploads] = useState<{ [key: string]: UploadItem }>({});

  const queryClient = useQueryClient();

  const handleFilesSelected = useCallback(async (files: File[]) => {
    const newUploads = files.reduce((acc, file) => {
      acc[uuid4()] = {
        file,
        status: "uploading" as const,
        progress: 0,
      };
      return acc;
    }, {} as { [key: string]: UploadItem });

    // Add uploads to state
    setUploads((prev) => ({ ...prev, ...newUploads }));

    // Process each upload
    for (const [id, upload] of Object.entries(newUploads)) {
      try {
        // Validate file first
        const validation = validateCV(upload.file);
        if (!validation.valid) {
          setUploads((prev) => {
            prev[id] = {
              ...prev[id],
              status: "error",
              error: validation.error,
            };
            return prev;
          });
          continue;
        }

        // Start upload
        const result = await uploadCV(upload.file, (progress) => {
          setUploads((prev) => {
            const newState = { ...prev };
            newState[id] = { ...newState[id], progress: progress.percentage };
            return newState;
          });
        });
        queryClient.invalidateQueries({ queryKey: ["cvs"] });

        // Update upload status
        setUploads((prev) => {
          const newState = { ...prev };
          newState[id] = {
            ...newState[id],
            status: result.success ? "completed" : "error",
            result: result.success ? result : undefined,
            error: result.success ? undefined : result.error,
            progress: 100,
          };
          return newState;
        });
      } catch (error) {
        console.error(error);
        setUploads((prev) => {
          const newState = { ...prev };
          newState[id] = {
            ...newState[id],
            status: "error",
            error: "Upload failed",
          };
          return newState;
        });
      }
    }
  }, []);

  const handleClearCompleted = () => {
    setUploads((prev) =>
      Object.fromEntries(
        Object.entries(prev).filter(([, u]) => u.status === "uploading")
      )
    );
  };

  const completedUploads = Object.values(uploads).filter(
    (u) => u.status === "completed"
  );
  const hasActiveUploads = Object.values(uploads).some(
    (u) => u.status === "uploading"
  );

  return (
    <>
      {/* Upload Section */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Dropzone */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="w-5 h-5 mr-2" />
              Upload CV
            </CardTitle>
            <CardDescription>
              Drag and drop your PDF files or click to browse
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CvDropzone
              onFilesSelected={handleFilesSelected}
              disabled={hasActiveUploads}
            />
          </CardContent>
        </Card>

        {/* Upload Progress */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Upload Progress
              </CardTitle>
              {Object.values(uploads).length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearCompleted}
                  disabled={hasActiveUploads}
                >
                  Clear Completed
                </Button>
              )}
            </div>
            <CardDescription>
              Monitor your CV upload and processing status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.values(uploads).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No uploads yet</p>
                <p className="text-sm">Your upload progress will appear here</p>
              </div>
            ) : (
              <CvUploadProgress uploads={uploads} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Success Message */}
      {completedUploads.length > 0 && (
        <Alert className="mb-8 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>
              {completedUploads.length} CV
              {completedUploads.length > 1 ? "s" : ""} uploaded successfully!
            </strong>{" "}
            Your files are being analyzed and you&apos;ll see results shortly.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}
