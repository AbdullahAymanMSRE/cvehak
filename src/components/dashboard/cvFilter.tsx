"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CVDetails } from "@/types/dashboard";
import { FileText, Award } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface CVFilterProps {
  cvs: CVDetails[];
  selectedCv: CVDetails | null;
}

export default function CVFilter({ cvs, selectedCv }: CVFilterProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const getStatusVariant = (
    status: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "COMPLETED":
        return "default";
      case "PROCESSING":
        return "secondary";
      case "FAILED":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>CV Filter</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-w-full ">
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-2 block">
                Select CV to analyze
              </label>
              <Select
                value={selectedCv?.id || "all"}
                onValueChange={(value) => {
                  const params = new URLSearchParams(searchParams);
                  if (value === "all") {
                    params.delete("cvId");
                  } else {
                    params.set("cvId", value);
                  }
                  router.push(`?${params.toString()}`);
                }}
              >
                <SelectTrigger className="max-w-full">
                  <SelectValue placeholder="All CVs (Overview)" />
                </SelectTrigger>
                <SelectContent className="max-w-full overflow-hidden">
                  <SelectItem value="all">All CVs (Overview)</SelectItem>
                  {cvs.map((cv) => (
                    <SelectItem
                      key={cv.id}
                      value={cv.id}
                      className="max-w-full"
                    >
                      <div className="flex items-center gap-2 max-w-full">
                        <span className="truncate ">{cv.filename}</span>
                        <Badge
                          variant={getStatusVariant(cv.status)}
                          className="text-xs"
                        >
                          {cv.status.toLowerCase()}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCv && (
              <div className="border-t pt-4 space-y-3">
                <h4 className="font-medium text-sm">Selected CV Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Filename:</span>
                    <span className="font-medium truncate">
                      {selectedCv.filename}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge
                      variant={getStatusVariant(selectedCv.status)}
                      className="text-xs"
                    >
                      {selectedCv.status.toLowerCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Uploaded:</span>
                    <span className="text-xs">
                      {new Date(selectedCv.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {selectedCv.analysis && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Overall Score:
                      </span>
                      <div className="flex items-center space-x-1">
                        <Award className="h-3 w-3" />
                        <span className="font-bold">
                          {selectedCv.analysis.overallScore}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
