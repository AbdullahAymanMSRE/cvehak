import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, LogOut, User, Upload } from "lucide-react";
import { auth, signOut } from "@/auth";
import { MobileNav } from "./mobileNav";

async function handleSignOut() {
  "use server";
  await signOut({ redirectTo: "/" });
}

export async function Navbar() {
  const session = await auth();

  return (
    <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            CVeHak
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          {session ? (
            // Authenticated user navigation
            <>
              <Link href="/upload">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload CV</span>
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Dashboard</span>
                </Button>
              </Link>

              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-50">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700 max-w-32 truncate">
                    {session.user?.name || session.user?.email}
                  </span>
                </div>

                <form action={handleSignOut}>
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2 text-gray-600 hover:text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </Button>
                </form>
              </div>
            </>
          ) : (
            // Unauthenticated user navigation
            <>
              <Link href="/auth/signin">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Get Started</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <MobileNav />
      </div>
    </nav>
  );
}
