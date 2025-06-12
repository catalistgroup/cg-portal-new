import { z } from "zod";

export const storeSchema = z.object({
  name: z.string().min(1),
  marketplace: z.string().min(1),
  api_client: z.string().min(1),
  api_secret: z.string().min(1),
  is_active: z.boolean(),
  is_deleted: z.boolean(),
  user_id: z.number().int().positive(),
});
