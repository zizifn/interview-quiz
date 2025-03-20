import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";

import { getRestaurant } from "./restaurantController";
import { RestaurantSchema } from "./restaurantModel";

export const restaurantRegistry = new OpenAPIRegistry();
export const restaurantRouter: Router = express.Router();

restaurantRegistry.register("Restaurant", RestaurantSchema);

restaurantRegistry.registerPath({
  method: "get",
  path: "/api/restaurants",
  tags: ["restaurant"],
  responses: createApiResponse(z.array(RestaurantSchema), "success", 200),
});

restaurantRouter.get("/", getRestaurant);
