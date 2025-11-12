 import { z } from "zod";

export const registerSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});


export const createCaseSchema = z.object({
  title: z.string().min(3, "Case title must be at least 3 characters"),
 
  respondentEmail: z.string().email(),

});

export const addSideSchema = z.object({
  userId: z.string().cuid("Invalid user ID"),
  role: z.enum(["CLAIMANT", "RESPONDENT"]),
});
