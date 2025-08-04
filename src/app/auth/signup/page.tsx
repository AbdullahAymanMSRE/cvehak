import Link from "next/link";
import { AuthLayout } from "@/components/auth/authLayout";
import { SignUpForm } from "@/components/auth/signUpForm";

export default function SignUpPage() {
  const footer = (
    <p className="text-center text-sm text-gray-600 w-full">
      Already have an account?{" "}
      <Link
        href="/auth/signin"
        className="font-medium text-blue-600 hover:text-blue-500"
      >
        Sign in
      </Link>
    </p>
  );

  return (
    <AuthLayout
      title="Create an account"
      description="Enter your details to create your account"
      footer={footer}
    >
      <SignUpForm />
    </AuthLayout>
  );
}
