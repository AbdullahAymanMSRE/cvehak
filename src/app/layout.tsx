import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProviderWrapper } from "@/providers/sessionProvider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CveHire",
  description: "AI-powered CV analysis and hiring",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProviderWrapper>
          <Navbar />
          {children}
          <Footer />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
