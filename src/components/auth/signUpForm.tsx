"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
// import { GoogleSignInButton } from "@/components/auth/googleSignInButton";
import { FormField } from "@/components/auth/formField";
import { signUpAction } from "@/lib/actions";
import { signUpSchema, type SignUpInput } from "@/lib/validations";

export function SignUpForm() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpInput) => {
    setError("");
    setIsLoading(true);

    try {
      const result = await signUpAction(data);
      if (!result.success) {
        setError(result.error || "Something went wrong");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          id="name"
          label="Full Name"
          placeholder="Enter your full name"
          error={errors.name?.message}
          disabled={isSubmitting || isLoading}
          {...register("name")}
        />

        <FormField
          id="email"
          label="Email"
          type="email"
          placeholder="Enter your email"
          error={errors.email?.message}
          disabled={isSubmitting || isLoading}
          {...register("email")}
        />

        <FormField
          id="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          error={errors.password?.message}
          disabled={isSubmitting || isLoading}
          {...register("password")}
        />

        <FormField
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          error={errors.confirmPassword?.message}
          disabled={isSubmitting || isLoading}
          {...register("confirmPassword")}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || isLoading}
        >
          {(isSubmitting || isLoading) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Create Account
        </Button>
      </form>

      {/* <GoogleSignInButton
        isLoading={isLoading}
        onLoadingChange={setIsLoading}
        onError={setError}
      /> */}
    </>
  );
}
