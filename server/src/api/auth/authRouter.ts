import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import {
  UserSchema,
  LoginFormSchema,
  LoginResponseSchema,
} from "@/api/auth/authModel";
import { validateRequest } from "@/common/utils/httpHandlers";
import { createUser, getUserInfo, login } from "./authController";
// import { userController } from "./userController";

export const authRegistry = new OpenAPIRegistry();
export const authRouter: Router = express.Router();

authRegistry.register("User", UserSchema);
authRegistry.register("LoginForm", LoginFormSchema);

authRegistry.registerPath({
  method: "post",
  path: "/auth/signup",
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
  path: "/auth/login",
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

authRouter.post("/signup", validateRequest(UserSchema), createUser);
authRouter.post("/login", validateRequest(LoginFormSchema), login);
authRouter.get("/user", getUserInfo);
