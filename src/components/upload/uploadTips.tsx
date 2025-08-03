import { AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function UploadTips() {
  return (
    <Card className="border-0 shadow-lg mb-8">
      <CardHeader>
        <CardTitle className="text-lg">Upload Tips</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-medium mb-2 flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
              Supported Formats
            </h4>
            <ul className="text-gray-600 space-y-1">
              <li>• PDF files only</li>
              <li>• Maximum 10MB per file</li>
              <li>• Text-based PDFs (not scanned images)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 text-blue-600" />
              Best Practices
            </h4>
            <ul className="text-gray-600 space-y-1">
              <li>• Use standard CV formatting</li>
              <li>• Include clear section headers</li>
              <li>• Ensure text is selectable</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
