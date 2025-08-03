import { FileText } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-8 px-4 bg-gray-900 text-white">
      <div className="container mx-auto text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold">CVeHak</span>
        </div>
        <p className="text-gray-400">
          AI-Powered CV Analysis Platform • Built with Next.js & OpenAI
        </p>
      </div>
    </footer>
  );
}
