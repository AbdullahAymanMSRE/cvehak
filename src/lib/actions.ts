"use server";

import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import { signIn } from "@/auth";
import { signUpSchema, type SignUpInput } from "./validations";

interface SignUpResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function signUpAction(data: SignUpInput): Promise<SignUpResult> {
  // Validate input using Zod
  const validatedFields = signUpSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      error: "Invalid form data",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = validatedFields.data;

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: "User with this email already exists" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Sign in the user after successful registration
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    console.error("Signup error:", error);
    return { success: false, error: "An error occurred. Please try again." };
  }
}
