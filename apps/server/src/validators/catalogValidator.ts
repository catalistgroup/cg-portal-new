import { z } from "zod";

export const catalogSchema = z.object({
  asin: z.string().min(1),
  name: z.string().min(1),
  brand: z.string().min(1),
  buying_price: z.string().min(1), // string because DB uses text for price
  selling_price: z.string().min(1), // string
  sku: z.string().min(1).optional(), // optional/nullable
  upc: z.string().min(1).optional(),
  supplier: z.string().min(1).optional(),
  moq: z.number().int().nonnegative(),
  buybox_price: z.string().optional(),
  amazon_fee: z.string().optional(), // formerly referral_fee
  profit: z.string().optional(),
  margin: z.string().optional(),
  roi: z.number().optional(),
  selling_status: z.boolean(),
  image_url: z.string().url().optional(),
});
