"use client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, FileText, LogOut, User, Upload } from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

export function MobileNav() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut({ redirectTo: "/" });
  };

  return (
    <div className="md:hidden flex items-center space-x-2">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="p-2">
            <Menu className="w-5 h-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>

        <SheetContent side="right" className="w-80 px-2.5">
          <SheetHeader>
            <SheetTitle className="text-left"></SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {session ? (
              // Authenticated mobile menu
              <>
                <Link href="/upload" onClick={handleLinkClick}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start space-x-3 h-12"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Upload CV</span>
                  </Button>
                </Link>
                <Link href="/dashboard" onClick={handleLinkClick}>
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
                    type="submit"
                    variant="outline"
                    className="w-full justify-start space-x-3 h-12 text-gray-600 hover:text-red-600"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </Button>
                </div>
              </>
            ) : (
              // Unauthenticated mobile menu
              <div className="flex flex-col gap-2">
                <Link href="/auth/signin" onClick={handleLinkClick}>
                  <Button variant="outline" className="w-full h-12">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup" onClick={handleLinkClick}>
                  <Button className="w-full h-12">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
