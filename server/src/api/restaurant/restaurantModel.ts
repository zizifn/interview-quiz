import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

export type Restaurant = z.infer<typeof RestaurantSchema>;
export const RestaurantSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  address: z.string(),
  phone: z.string(),
  tables: z.array(
    z.object({
      id: z.string().uuid(),
      capacity: z.number().int().min(1),
      size: z.number().int().min(1),
    })
  ),
});
