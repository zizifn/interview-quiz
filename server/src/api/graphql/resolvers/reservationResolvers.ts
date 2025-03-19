import { getCouchbaseConnection } from "@/db/couchbase";
import { GraphQLResolveInfo } from "graphql";
import { GraphQLContext } from "../type";
import {
  NewReservation,
  UpdateReservation,
  UpdateStatusReservation,
} from "@/api/reservation/reservationsModel";
import {
  getReservationsService,
  createReservationService,
  updateReservationService,
  updateStatusReservationService,
} from "@/api/reservation/reservationServices";

async function getReservations(
  _parent: any,
  _args: any,
  context: GraphQLContext,
  _info: GraphQLResolveInfo
) {
  const { user, logger } = context;
  if (!user) {
    throw new Error("Unauthorized");
  }

  const { quizScope } = await getCouchbaseConnection();
  if (!quizScope) {
    throw new Error("Service is unavailable.");
  }

  try {
    const result = await getReservationsService(quizScope, user);
    return result;
  } catch (error: any) {
    logger?.error("Error fetching reservations data:", error);
    throw new Error(
      `Internal Server Error: ${error.message}, casue: ${error.cause?.message}`
    );
  }
}

async function createReservation(
  _parent: any,
  args: { input: NewReservation },
  context: GraphQLContext,
  _info: GraphQLResolveInfo
) {
  const { user, logger } = context;
  if (!user) {
    throw new Error("Unauthorized");
  }

  const { quizScope, couchbaseCluster } = await getCouchbaseConnection();
  if (!quizScope || !couchbaseCluster) {
    throw new Error("Service is unavailable.");
  }

  try {
    const result = await createReservationService(
      quizScope,
      couchbaseCluster,
      args.input,
      user
    );
    return result;
  } catch (error: any) {
    logger?.error("Error creating reservation:", error);
    throw new Error(
      `Failed to create reservation: ${error.message}, casue: ${error.cause?.message}`
    );
  }
}

async function updateReservation(
  _parent: any,
  args: { input: UpdateReservation & { id: string } },
  context: GraphQLContext,
  _info: GraphQLResolveInfo
) {
  const { user, logger } = context;
  if (!user) {
    throw new Error("Unauthorized");
  }

  const { quizScope, couchbaseCluster } = await getCouchbaseConnection();
  if (!quizScope || !couchbaseCluster) {
    throw new Error("Service is unavailable.");
  }

  try {
    const result = await updateReservationService(
      quizScope,
      couchbaseCluster,
      args.input.id,
      args.input,
      user
    );
    return result;
  } catch (error: any) {
    logger?.error("Error update reservation:", error);
    throw new Error(
      `Failed to update reservation: ${error.message}, casue: ${error.cause?.message}`
    );
  }
}

async function updateStatusReservation(
  _parent: any,
  args: { input: UpdateStatusReservation & { id: string } },
  context: GraphQLContext,
  _info: GraphQLResolveInfo
) {
  const { user, logger } = context;
  if (!user) {
    throw new Error("Unauthorized");
  }

  const { quizScope, couchbaseCluster } = await getCouchbaseConnection();
  if (!quizScope || !couchbaseCluster) {
    throw new Error("Service is unavailable.");
  }

  try {
    const result = await updateStatusReservationService(
      quizScope,
      couchbaseCluster,
      args.input.id,
      args.input,
      user
    );
    return result;
  } catch (error: any) {
    logger?.error("Error update reservationn Status:", error);
    throw new Error(
      `Failed to update reservation Status: ${error.message}, casue: ${error.cause?.message}`
    );
  }
}

export {
  getReservations,
  createReservation,
  updateStatusReservation,
  updateReservation,
};
