import { z } from "zod";

export const purchaseOrderItemSchema = z.object({
  asin: z.string().min(1),
  title: z.string().min(1),
  brand: z.string().min(1),
  unit_price: z.number(),
  quantity: z.number().int().positive(),
  sku: z.string().min(1),
  upc: z.string().min(1),
  supplier: z.string().min(1),
  purchase_order_id: z.number().int().positive(),
});
