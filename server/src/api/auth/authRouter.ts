import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { UserSchema } from "@/api/auth/authModel";
import { validateRequest } from "@/common/utils/httpHandlers";
import { createUser } from "./authController";
// import { userController } from "./userController";

export const authRegistry = new OpenAPIRegistry();
export const authRouter: Router = express.Router();

authRegistry.register("User", UserSchema);

authRegistry.registerPath({
  method: "post",
  path: "/auth/signup",
  tags: ["signup"],
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

authRouter.post("/signup", validateRequest(UserSchema), createUser);

// userRegistry.registerPath({
//   method: "get",
//   path: "/users/{id}",
//   tags: ["User"],
//   request: { params: GetUserSchema.shape.params },
//   responses: createApiResponse(UserSchema, "Success"),
// });

// userRouter.get("/:id", validateRequest(GetUserSchema), userController.getUser);
