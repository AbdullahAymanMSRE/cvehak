import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignInForm } from "@/components/auth/SignInForm";

export default function SignInPage() {
  const footer = (
    <p className="text-center text-sm text-gray-600 w-full">
      Don&apos;t have an account?{" "}
      <Link
        href="/auth/signup"
        className="font-medium text-blue-600 hover:text-blue-500"
      >
        Sign up
      </Link>
    </p>
  );

  return (
    <AuthLayout
      title="Sign in"
      description="Enter your email and password to access your account"
      footer={footer}
    >
      <SignInForm />
    </AuthLayout>
  );
}
