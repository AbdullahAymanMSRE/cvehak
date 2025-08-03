import { object, string, email } from "zod";

export const signInSchema = object({
  email: email({ error: "Email is required" }),
  password: string({ error: "Password is required" })
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters"),
});
