import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(20),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
});

export const loginSchema = z.object({
  email: z.string().trim().min(3, "Enter your email or phone"),
  password: z.string().min(1, "Enter your password"),
});

export const addressSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(20),
  line1: z.string().trim().min(3).max(200),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  pincode: z.string().trim().min(4).max(12),
});
