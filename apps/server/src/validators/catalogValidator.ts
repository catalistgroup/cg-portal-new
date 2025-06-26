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

export const bulkCatalogItemSchema = z
  .object({
    asin: z.string().min(1),
    brand: z.string().min(1),
    name: z.string().min(1),
    sku: z.string().optional().nullable(),
    buying_price: z.number().nonnegative(),
    selling_price: z.union([z.string(), z.number()]),
    moq: z.number().int().nonnegative(),
    upc: z.string().optional().nullable(),
    buybox_price: z.union([z.number(), z.null()]).optional().nullable(),
    amazon_fee: z.number(),
    profit: z.union([z.string(), z.number()]),
    margin: z.union([z.string(), z.number()]),
    roi: z.union([z.string(), z.number()]),
    image_url: z.string().url(),
    updated_at: z.union([z.string(), z.literal("now")]).optional(),
    profitable: z.boolean(),
  })
  .transform((data) => ({
    ...data,
    // Handle the "now" special case for updated_at
    updated_at:
      data.updated_at === "now" ? new Date().toISOString() : data.updated_at,
    // Ensure optional fields are properly handled
    sku: data.sku || null,
    upc: data.upc || null,
  }));
