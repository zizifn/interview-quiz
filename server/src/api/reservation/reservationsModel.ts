import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export type Reservation = z.infer<typeof ReservationSchema>;
export const ReservationSchema = z.object({
  id: z.string().uuid().min(1, "ID cannot be empty"),
  restaurantInfo: z.object({
    id: z.string().uuid().min(1, "Restaurant ID cannot be empty"),
    name: z.string().optional().default(""),
    address: z.string().optional(),
  }),
  guestId: z.string(),
  guestName: z.string(),
  guestEmail: z.string().email(),
  reservationDateTime: z.number().int().positive(),
  tableInfo: z.object({
    id: z.string().uuid().min(1, "Table ID cannot be empty"),
    size: z.number().int().positive(),
  }),
  status: z.enum(["confirmed", "completed", "canceled"]),
  specialRequests: z.string().optional(),
});

export const NewReservationSchema = z
  .object({
    restaurantInfo: z.object({
      id: z.string().uuid().min(1, "Restaurant ID cannot be empty"),
    }),
    reservationDateTime: z.number().int().positive(),
    tableInfo: z.object({
      id: z.string().uuid().min(1, "Table ID cannot be empty"),
    }),
    specialRequests: z.string().optional(),
  })
  .strict();

export type NewReservation = z.infer<typeof NewReservationSchema>;

export const UpdateStatusReservationSchema = z.object({
  status: z
    .enum(["completed", "canceled"])
    .describe("New status for the reservation"),
});
export type UpdateStatusReservation = z.infer<
  typeof UpdateStatusReservationSchema
>;

export const UpdateReservationSchema = z.object({
  guestEmail: z.string().email(),
  tableInfo: z.object({
    id: z.string().uuid().min(1, "Table ID cannot be empty"),
  }),
  reservationDateTime: z.number().int().positive(),
  specialRequests: z.string().optional(),
});

export type UpdateReservation = z.infer<typeof UpdateReservationSchema>;
