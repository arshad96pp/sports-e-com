import { z } from "zod";

/**
 * Mirrors the hosted Supabase project's Auth password strength setting —
 * keep both in sync (see the Supabase dashboard configuration notes) so a
 * password this schema accepts is never rejected server-side, or vice versa.
 */
const strongPassword = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72)
  .regex(/[a-zA-Z]/, "Password must contain at least one letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .max(20)
    .refine((v) => v === "" || v.length >= 7, "Enter a valid phone number")
    .optional(),
  password: strongPassword,
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

export const resetPasswordSchema = z
  .object({
    password: strongPassword,
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(120),
  phone: z
    .string()
    .trim()
    .max(20)
    .refine((v) => v === "" || v.length >= 7, "Enter a valid phone number")
    .optional(),
});

export const addressSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(20),
  line1: z.string().trim().min(3).max(200),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  pincode: z.string().trim().min(4).max(12),
});
