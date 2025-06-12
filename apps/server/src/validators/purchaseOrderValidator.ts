import { z } from "zod";

export const purchaseOrderSchema = z.object({
  order_placed_at: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  order_status: z.string().min(1),
  is_draft: z.boolean().default(false),
  items: z
    .array(
      z.object({
        asin: z.string().nonempty(),
        title: z.string().nonempty(),
        brand: z.string().nonempty(),
        unit_price: z.number().min(1),
        quantity: z.number().min(1),
        sku: z.string(),
        upc: z.string(),
        supplier: z.string(),
      }),
    )
    .min(1),
  paymentMethod: z.string().optional(),
  prepRequired: z.string().optional(),
  ungateAssistance: z.string().optional(),
  billingCountry: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  storefront: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
});
