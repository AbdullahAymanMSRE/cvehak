"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { validateCV } from "@/lib/upload";

interface CVDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export function CvDropzone({
  onFilesSelected,
  disabled = false,
}: CVDropzoneProps) {
  const [, setDragCounter] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = useCallback(
    (files: File[]) => {
      if (files.length === 0) return;

      // Validate files
      const validFiles: File[] = [];
      const errors: string[] = [];

      for (const file of files) {
        const validation = validateCV(file);
        if (validation.valid) {
          validFiles.push(file);
        } else {
          errors.push(`${file.name}: ${validation.error}`);
        }
      }

      if (errors.length > 0) {
        setError(errors.join("\n"));
      }

      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    },
    [onFilesSelected, setError]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragCounter((prev) => prev + 1);
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        setIsDragging(true);
      }
    },
    [setIsDragging]
  );

  const handleDragOut = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragCounter((prev) => {
        const newCounter = prev - 1;
        if (newCounter === 0) {
          setIsDragging(false);
        }
        return newCounter;
      });
    },
    [setIsDragging]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      setDragCounter(0);
      setError(null);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      processFiles(files);
    },
    [disabled, setIsDragging, processFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null);
      if (e.target.files) {
        const files = Array.from(e.target.files);
        processFiles(files);
      }
      // Reset input value to allow selecting the same file again
      e.target.value = "";
    },
    [processFiles]
  );

  return (
    <div className="space-y-4">
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
          ${
            isDragging
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept=".pdf"
          onChange={handleFileSelect}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        <div className="flex flex-col items-center space-y-4">
          {isDragging ? (
            <div className="text-blue-600">
              <Upload className="w-12 h-12 mx-auto mb-2" />
              <p className="text-lg font-medium">Drop your CV files here</p>
            </div>
          ) : (
            <div className={disabled ? "text-gray-400" : "text-gray-600"}>
              <FileText className="w-12 h-12 mx-auto mb-2" />
              <p className="text-lg font-medium mb-2">
                Drag and drop your CV files here
              </p>
              <p className="text-sm text-gray-500 mb-4">
                or click to browse your computer
              </p>
              <Button
                variant="outline"
                disabled={disabled}
                className="pointer-events-none"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Files
              </Button>
            </div>
          )}
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <p>Supports: PDF files up to 10MB</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="whitespace-pre-line">
            {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
