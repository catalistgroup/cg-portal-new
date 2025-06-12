import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().nonempty(),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  storefront: z.string(),
  company: z.string(),
  is_active: z.boolean().default(true),
  is_deleted: z.boolean().default(false),
});

export const updateUserSchema = z.object({
  name: z.string().nonempty(),
  email: z.string().email(),
  phone: z.string().optional(),
  is_active: z.boolean().default(true),
  is_deleted: z.boolean().default(false),
});

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
