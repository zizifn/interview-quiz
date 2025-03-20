import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import {
  UserSchema,
  LoginFormSchema,
  LoginResponseSchema,
  SignoutSchema,
} from "@/api/auth/authModel";
import { validateRequest } from "@/common/utils/httpHandlers";
import { createUser, getUserInfo, login, signout } from "./authController";

export const authRegistry = new OpenAPIRegistry();
export const authRouter: Router = express.Router();

authRegistry.register("User", UserSchema);
authRegistry.register("LoginForm", LoginFormSchema);
authRegistry.register("LoginResponse", LoginResponseSchema);
authRegistry.register("Signout", SignoutSchema);

authRegistry.registerPath({
  method: "post",
  path: "/api/auth/signup",
  tags: ["auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: UserSchema,
        },
      },
    },
  },
  responses: createApiResponse(UserSchema, "Created", 201),
});
authRegistry.registerPath({
  method: "post",
  path: "/api/auth/login",
  tags: ["auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: LoginFormSchema,
        },
      },
    },
  },
  responses: createApiResponse(LoginResponseSchema, "success", 200),
});

authRegistry.registerPath({
  method: "get",
  path: "/api/auth/user",
  tags: ["auth"],
  responses: createApiResponse(UserSchema, "Success", 200),
});

authRegistry.registerPath({
  method: "post",
  path: "/api/auth/signout",
  tags: ["auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: SignoutSchema,
        },
      },
    },
  },
  responses: createApiResponse(
    z.object({ message: z.string() }),
    "Success",
    200
  ),
});

authRouter.post("/signup", validateRequest(UserSchema), createUser);
authRouter.post("/login", validateRequest(LoginFormSchema), login);
authRouter.get("/user", getUserInfo);
authRouter.post("/signout", validateRequest(SignoutSchema), signout);
