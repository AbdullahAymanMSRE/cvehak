import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, LogIn } from "lucide-react";
import { PageLayout } from "./pageLayout";
import { FeaturesGrid } from "./featuresGrid";
import { CtaSection } from "./ctaSection";

export function LoggedOutHomePage() {
  const ctaButtons = [
    {
      href: "/auth/signup",
      text: "Start Free Analysis",
      icon: CheckCircle,
      variant: "primary" as const,
    },
    {
      href: "/auth/signin",
      text: "Sign In",
      icon: LogIn,
      variant: "secondary" as const,
    },
  ];

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              AI-Powered CV Analysis
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Get instant insights into your resume with our advanced AI
              technology. Upload your CV and receive detailed scoring on
              experience, education, and skills.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Analyze Your CV Now
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button size="lg" variant="outline">
                  Sign In to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <FeaturesGrid
        title="Why Choose CVeHak?"
        description="Our AI-powered platform provides comprehensive CV analysis to help you stand out in today's competitive job market."
      />

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get professional CV analysis in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload Your CV</h3>
              <p className="text-gray-600">
                Simply drag and drop your PDF resume or select it from your
                device
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Analysis</h3>
              <p className="text-gray-600">
                Our AI extracts text and analyzes your experience, education,
                and skills
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Results</h3>
              <p className="text-gray-600">
                Receive detailed scores and actionable feedback to improve your
                CV
              </p>
            </div>
          </div>
        </div>
      </section>

      <CtaSection
        title="Ready to Optimize Your CV?"
        description="Join thousands of professionals who have improved their resumes with our AI-powered analysis"
        buttons={ctaButtons}
      />
    </PageLayout>
  );
}
