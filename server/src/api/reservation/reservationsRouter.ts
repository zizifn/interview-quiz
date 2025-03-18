import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";

import {
  getReservation,
  createReservation,
  updateReservation,
  updateStatusReservation,
} from "./reservationsController";
import {
  NewReservationSchema,
  ReservationSchema,
  UpdateReservationSchema,
  UpdateStatusReservationSchema,
} from "./reservationsModel";
import { validateRequest } from "@/common/utils/httpHandlers";

export const reservationRouter: Router = express.Router();

// Setup router endpoints
reservationRouter.get("/", getReservation);
reservationRouter.post(
  "/",
  validateRequest(NewReservationSchema),
  createReservation
);
reservationRouter.put(
  "/:id",
  validateRequest(UpdateReservationSchema),
  updateReservation
);
reservationRouter.put(
  "/:id/status",
  validateRequest(UpdateStatusReservationSchema),
  updateStatusReservation
);

// swagger
export const reservationRegistry = new OpenAPIRegistry();
reservationRegistry.register("Reservation", ReservationSchema);
reservationRegistry.register("NewReservation", NewReservationSchema);
reservationRegistry.register("UpdateReservation", UpdateReservationSchema);
reservationRegistry.register(
  "UpdateStatusReservation",
  UpdateStatusReservationSchema
);

reservationRegistry.registerPath({
  method: "get",
  path: "/api/reservation",
  tags: ["reservation"],
  responses: createApiResponse(z.array(ReservationSchema), "success", 200),
});

reservationRegistry.registerPath({
  method: "post",
  path: "/api/reservation",
  tags: ["reservation"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: NewReservationSchema,
        },
      },
    },
  },
  responses: createApiResponse(NewReservationSchema, "success", 201),
});

reservationRegistry.registerPath({
  method: "put",
  path: "/api/reservation/{id}",
  tags: ["reservation"],
  request: {
    params: z.object({
      id: z.string().describe("Reservation ID"),
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdateReservationSchema,
        },
      },
    },
  },
  responses: createApiResponse(ReservationSchema, "success", 200),
});

reservationRegistry.registerPath({
  method: "put",
  path: "/api/reservation/{id}/status",
  tags: ["reservation"],
  request: {
    params: z.object({
      id: z.string().describe("Reservation ID"),
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdateStatusReservationSchema,
        },
      },
    },
  },
  responses: createApiResponse(ReservationSchema, "success", 200),
});
