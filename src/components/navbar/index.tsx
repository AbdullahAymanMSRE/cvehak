"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FileText, LogOut, User, Upload, Menu } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

export function Navbar() {
  const { data: session, status } = useSession();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

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
          {status === "loading" ? (
            <div className="w-8 h-8 animate-pulse bg-gray-200 rounded-full" />
          ) : session ? (
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

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 text-gray-600 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </Button>
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
        <div className="md:hidden flex items-center space-x-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <Menu className="w-5 h-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="text-left"></SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-4">
                {status === "loading" ? (
                  <div className="w-8 h-8 animate-pulse bg-gray-200 rounded-full mx-auto" />
                ) : session ? (
                  // Authenticated mobile menu
                  <>
                    <Link href="/upload">
                      <Button
                        variant="ghost"
                        className="w-full justify-start space-x-3 h-12"
                      >
                        <Upload className="w-5 h-5" />
                        <span>Upload CV</span>
                      </Button>
                    </Link>
                    <Link href="/dashboard">
                      <Button
                        variant="ghost"
                        className="w-full justify-start space-x-3 h-12"
                      >
                        <FileText className="w-5 h-5" />
                        <span>Dashboard</span>
                      </Button>
                    </Link>

                    <div className="border-t pt-4 mt-6">
                      <div className="flex items-center space-x-3 px-3 py-3 rounded-lg bg-gray-50 mb-4">
                        <User className="w-5 h-5 text-gray-600" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {session.user?.name || "User"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {session.user?.email}
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        onClick={handleSignOut}
                        className="w-full justify-start space-x-3 h-12 text-gray-600 hover:text-red-600"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Sign Out</span>
                      </Button>
                    </div>
                  </>
                ) : (
                  // Unauthenticated mobile menu
                  <div className="space-y-3">
                    <Link href="/auth/signin">
                      <Button variant="ghost" className="w-full h-12">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/signup">
                      <Button className="w-full h-12">Get Started</Button>
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
