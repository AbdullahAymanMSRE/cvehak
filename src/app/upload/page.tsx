import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CVUploadPage from "@/components/upload/CVUploadPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CVUploadHistory } from "@/components/upload";
import { AlertCircle, CheckCircle } from "lucide-react";

export default async function UploadPage() {
  const session = await auth();

  // Redirect unauthenticated users to signin
  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Upload Your CV for Analysis
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload your PDF resume and get instant AI-powered analysis with
            detailed scoring on experience, education, and skills.
          </p>
        </div>

        <CVUploadPage />

        {/* Upload Tips */}
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

        {/* Recent Uploads */}
        <CVUploadHistory />
      </div>
    </div>
  );
}
