import { Scope } from "couchbase";
import {
  NewReservation,
  Reservation,
  UpdateReservation,
  UpdateStatusReservation,
} from "./reservationsModel";
import {
  Cluster,
  TransactionCommitAmbiguousError,
  TransactionFailedError,
} from "couchbase";
import { Restaurant } from "../restaurant/restaurantModel";

export async function getReservationsService(quizScope: Scope, user: any) {
  try {
    let reservationData = null;
    if (user.is_employee) {
      reservationData = await quizScope.query(
        `SELECT r.* FROM reservations r WHERE r.reservationDateTime > (NOW_MILLIS() - 21600000) ORDER BY r.reservationDateTime Desc`
      );
    } else {
      reservationData = await quizScope.query(
        `SELECT r.* FROM reservations r WHERE r.guestName = $1 AND r.reservationDateTime > (NOW_MILLIS() - 21600000) ORDER BY r.reservationDateTime Desc`,
        {
          parameters: [user.username],
        }
      );
    }
    return reservationData.rows;
  } catch (error) {
    throw new Error("Failed to fetch reservations");
  }
}

export async function createReservationService(
  quizScope: Scope,
  couchbaseCluster: Cluster,
  reservationBody: NewReservation,
  user: any
) {
  const reservations = quizScope.collection("reservations");
  const restaurant = quizScope.collection("restaurant");
  const docId = crypto.randomUUID();
  let newReservation = null;

  try {
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

      // find table
      const updatedRestaurant = structuredClone(restaurantContent);
      const tableId = reservationBody.tableInfo.id;
      const table = updatedRestaurant.tables.find((t) => t.id === tableId);
      if (!table) {
        throw new Error(`Table with ID ${tableId} not found`);
      }
      if (table.capacity < 1) {
        throw new Error(`Insufficient capacity for table ${tableId}`);
      }

      //2. insert reservation
      newReservation = {
        ...reservationBody,
        type: "reservation",
        // never trust user input
        restaurantInfo: {
          id: restaurantContent.id,
          name: restaurantContent.name,
          address: restaurantContent.address,
        },
        tableInfo: {
          id: table.id,
          size: table.size,
        },
        guestName: user.username,
        guestEmail: user.email,
        status: "confirmed",
        id: docId,
        createAt: new Date().getTime(),
      };
      await ctx.insert(reservations, docId, newReservation);
      // Decrement the capacity
      table.capacity -= 1;
      await ctx.replace(restaurantDoc, updatedRestaurant);
    });

    return newReservation;
  } catch (error) {
    if (error instanceof TransactionFailedError) {
      console.error(
        "Transaction did not reach commit point",
        error,
        error.cause
      );
    } else if (error instanceof TransactionCommitAmbiguousError) {
      console.error("Transaction possibly committed", error);
    } else {
      console.error("Failed to create reservation:", error);
    }
    throw error;
  }
}

export async function updateReservationService(
  quizScope: Scope,
  couchbaseCluster: Cluster,
  id: string,
  updatedReservationBody: UpdateReservation,
  user: any
) {
  const reservations = quizScope.collection("reservations");
  const restaurant = quizScope.collection("restaurant");
  let newReservation = null;

  try {
    await couchbaseCluster.transactions().run(async (ctx) => {
      const oldReservationResult = await ctx.get(reservations, id);

      const oldReservation: Reservation = oldReservationResult.content;
      if (!oldReservation) {
        throw new Error("Reservation document not found");
      }

      if (!user.is_employee && oldReservation.guestName !== user.username) {
        throw new Error(
          "You do not have permission to update this reservation."
        );
      }

      if (oldReservation.status && oldReservation.status !== "confirmed") {
        throw new Error(
          "You can't update a reservation that is not confirmed."
        );
      }

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

      if (oldReservation.tableInfo.id !== updatedReservationBody.tableInfo.id) {
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
        guestEmail: updatedReservationBody.guestEmail,
        reservationDateTime: updatedReservationBody.reservationDateTime,
        tableInfo: {
          id: updatedReservationBody.tableInfo.id,
          size: table.size,
        },
        specialRequests: updatedReservationBody.specialRequests,
        updatedAt: new Date().getTime(),
      };
      await ctx.replace(oldReservationResult, newReservation);
    });

    return newReservation;
  } catch (error) {
    throw error;
  }
}

export async function updateStatusReservationService(
  quizScope: Scope,
  couchbaseCluster: Cluster,
  id: string,
  updatedReservationBody: UpdateStatusReservation,
  user: any
) {
  const reservations = quizScope.collection("reservations");
  const restaurant = quizScope.collection("restaurant");
  let newReservation = null;

  // this is double check
  if (
    updatedReservationBody.status !== "completed" &&
    updatedReservationBody.status !== "canceled"
  ) {
    throw new Error("Only can update to completed or canceled");
  }

  try {
    await couchbaseCluster.transactions().run(async (ctx) => {
      const oldReservationResult = await ctx.get(reservations, id);
      const oldReservation: Reservation = oldReservationResult.content;

      if (!oldReservation) {
        throw new Error("Reservation document not found");
      }
      if (oldReservation.status && oldReservation.status !== "confirmed") {
        throw new Error(
          "You can't update a reservation that is not confirmed."
        );
      }

      if (
        !user.is_employee &&
        oldReservationResult.content.guestName !== user.username
      ) {
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

    return newReservation;
  } catch (error) {
    console.error("Failed to update reservation status:", error);
    throw error;
  }
}
