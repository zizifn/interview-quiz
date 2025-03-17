import type { Request, Response, NextFunction } from "express";
import { authDB } from "@/db/db";
import { userTable } from "@/db/schema";
import { getCouchbaseConnection } from "@/db/couchbase";
import {
  NewReservation,
  Reservation,
  UpdateReservation,
  UpdateStatusReservation,
} from "./reservationsModel";
import {
  TransactionCommitAmbiguousError,
  TransactionFailedError,
} from "couchbase";
import { Restaurant } from "../restaurant/restaurantModel";

export async function getReservation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { quizScope } = await getCouchbaseConnection();
  if (!quizScope) {
    res.status(500).json({ error: "Service is unavailable." });
    return;
  }

  try {
    const reservationData = await quizScope.query(
      `SELECT r.* FROM reservations r`
    );
    res.status(200).json(reservationData.rows);
  } catch (error) {
    console.error("Error fetching reservation data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function createReservation(req: Request, res: Response) {
  const user = req.locals?.user;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const reservationBody: NewReservation = req.body;

    const { quizScope, couchbaseCluster } = await getCouchbaseConnection();
    if (!quizScope) {
      res.status(500).json({ error: "Service is unavailable." });
      return;
    }

    const reservations = quizScope.collection("reservations");
    const restaurant = quizScope.collection("restaurant");
    const docId = crypto.randomUUID();
    let newReservation = null;

    // 1. need create reservation
    // 2. need update restaurant table capacity, so we need transaction
    await couchbaseCluster?.transactions().run(async (ctx) => {
      // 1. get restaurant info
      const restaurantDoc = await ctx.get(
        restaurant,
        reservationBody.restaurantInfo.id
      );
      const restaurantContent: Restaurant = restaurantDoc?.content;
      if (!restaurantContent) {
        throw new Error("Restaurant document not found");
      }
      //2. insert reservation
      newReservation = {
        ...reservationBody,
        type: "reservation",
        guestName: user.username,
        guestEmail: user.email,
        id: docId,
        createAt: new Date().getTime(),
      };
      await ctx.insert(reservations, docId, newReservation);

      const updatedRestaurant = structuredClone(restaurantContent);
      const tableId = reservationBody.tableInfo.id;
      const table = updatedRestaurant.tables.find((t) => t.id === tableId);
      if (!table) {
        throw new Error(`Table with ID ${tableId} not found`);
      }
      if (table.capacity < 1) {
        throw new Error(`Insufficient capacity for table ${tableId}`);
      }
      // Decrement the capacity
      table.capacity -= 1;
      await ctx.replace(restaurantDoc, updatedRestaurant);
    });

    res.status(200).json(newReservation);
    return;
  } catch (error: any) {
    if (error instanceof TransactionFailedError) {
      req.log.error(
        "Transaction did not reach commit point",
        error,
        error.cause
      );
    } else if (error instanceof TransactionCommitAmbiguousError) {
      req.log.error("Transaction possibly committed", error);
    } else {
      req.log.error("Failed to create reservation:", error);
    }
    res.status(500).json({
      message: `Failed to create reservation, due to ${error?.message}`,
    });
    return;
  }
}

export async function updateReservation(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = req.locals?.user;
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const updatedReservationBody: UpdateReservation = req.body;

    const { quizScope, couchbaseCluster } = await getCouchbaseConnection();
    if (!quizScope) {
      res.status(500).json({ error: "Service is unavailable." });
      return;
    }

    const reservations = quizScope.collection("reservations");
    const restaurant = quizScope.collection("restaurant");
    let newReservation = null;
    await couchbaseCluster?.transactions().run(async (ctx) => {
      const oldReservationResult = await ctx.get(reservations, id);
      const oldReservation: Reservation = oldReservationResult.content;

      if (!oldReservation) {
        throw new Error("Restaurant document not found");
      }

      if (oldReservation.guestName !== user.username) {
        throw new Error(
          "You do not have permission to update this reservation."
        );
      }

      if (oldReservation.status !== "confirmed") {
        throw new Error(
          "You can't update a reservation that is not confirmed."
        );
      }
      //nomrally, if not change table, we can just update the reservation
      if (oldReservation.tableInfo.id !== updatedReservationBody.tableInfo.id) {
        const restaurantDoc = await ctx.get(
          restaurant,
          oldReservation.restaurantInfo.id
        );

        const restaurantContent: Restaurant = restaurantDoc?.content;
        const updatedRestaurant = structuredClone(restaurantContent);
        const oldTable = updatedRestaurant.tables.find(
          (t) => t.id === oldReservation.tableInfo.id
        );
        const table = updatedRestaurant.tables.find(
          (t) => t.id === updatedReservationBody.tableInfo.id
        );
        if (!table || !oldTable) {
          throw new Error(
            `Table with ID new: ${updatedReservationBody.tableInfo.id} or old: ${oldReservation.tableInfo.id} not found`
          );
        }
        if (table.capacity < 1) {
          throw new Error(
            `Insufficient capacity for table ${updatedReservationBody.tableInfo.id}`
          );
        }
        oldTable.capacity += 1; // Increment the capacity of the old table
        table.capacity -= 1; // Decrement the capacity of the new table
        await ctx.replace(restaurantDoc, updatedRestaurant);
      }
      // Update the reservation
      newReservation = {
        ...oldReservationResult.content,
        ...updatedReservationBody,
        updatedAt: new Date().getTime(),
      };
      await ctx.replace(oldReservationResult, newReservation);
    });

    // but if change table, we need to update the restaurant table capacity

    // For now, just mock a successful response
    res.status(200).json(newReservation);
    return;
  } catch (error) {
    console.error("Failed to update reservation:", error);
    res.status(500).json({ message: "Failed to update reservation" });
    return;
  }
}

export async function updateStatusReservation(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = req.locals?.user;
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const updatedReservationBody: UpdateStatusReservation = req.body;
    const { quizScope, couchbaseCluster } = await getCouchbaseConnection();
    if (!quizScope) {
      res.status(500).json({ error: "Service is unavailable." });
      return;
    }

    const reservations = quizScope.collection("reservations");
    const restaurant = quizScope.collection("restaurant");
    let newReservation = null;
    await couchbaseCluster?.transactions().run(async (ctx) => {
      const oldReservationResult = await ctx.get(reservations, id);
      const oldReservation: Reservation = oldReservationResult.content;

      if (!oldReservation) {
        throw new Error("Restaurant document not found");
      }

      if (oldReservationResult.content.guestName !== user.username) {
        throw new Error(
          "You do not have permission to update this reservation."
        );
      }
      const restaurantDoc = await ctx.get(
        restaurant,
        oldReservation.restaurantInfo.id
      );

      const restaurantContent: Restaurant = restaurantDoc?.content;
      const updatedRestaurant = structuredClone(restaurantContent);
      const table = updatedRestaurant.tables.find(
        (t) => t.id === oldReservation.tableInfo.id
      );

      if (!table) {
        throw new Error(`Table with ID new: ${oldReservation.tableInfo.id}`);
      }

      table.capacity += 1; // cancel or complete, we need to increase the capacity
      await ctx.replace(restaurantDoc, updatedRestaurant);

      // Update the reservation
      newReservation = {
        ...oldReservationResult.content,
        ...updatedReservationBody,
        updatedAt: new Date().getTime(),
      };
      await ctx.replace(oldReservationResult, newReservation);
    });

    // but if change table, we need to update the restaurant table capacity

    // For now, just mock a successful response
    res.status(200).json(newReservation);
    return;
  } catch (error) {
    console.error("Failed to update reservation:", error);
    res.status(500).json({ message: "Failed to update reservation" });
    return;
  }
}
