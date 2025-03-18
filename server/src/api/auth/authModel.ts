import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { commonValidations } from "@/common/utils/commonValidation";

extendZodWithOpenApi(z);

export type User = z.infer<typeof UserSchema>;
export const UserSchema = z
  .object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(8),
  })
  .strict();

export const LoginFormSchema = UserSchema.omit({ email: true }).strict();

export const LoginResponseSchema = z.object({
  message: z.string(),
});
export type LoginForm = z.infer<typeof LoginFormSchema>;
export type LoginFormResponse = z.infer<typeof LoginResponseSchema>;

export const SignoutSchema = z
  .object({
    action: z.literal("signout"),
  })
  .strict();
