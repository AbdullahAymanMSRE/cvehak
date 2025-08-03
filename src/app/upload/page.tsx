import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getCvs } from "./actions";
import { CvUploadPage } from "@/components/upload/cvUploadPage";
import { UploadTips } from "@/components/upload/uploadTips";
import { CvUploadHistory } from "@/components/upload/cvUploadHistory";

export default async function UploadPage() {
  const session = await auth();

  // Redirect unauthenticated users to signin
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const cvs = await getCvs();

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

        <CvUploadPage />

        <UploadTips />

        <CvUploadHistory initialCvs={cvs} />
      </div>
    </div>
  );
}
