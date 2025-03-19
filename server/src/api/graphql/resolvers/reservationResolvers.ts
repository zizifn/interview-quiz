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
} from "@/api/reservation/reservationServices";

async function getReservations(
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
  } catch (error) {
    logger?.error("Error fetching reservations data:", error);
    throw new Error("Internal Server Error");
  }
}

async function createReservation(
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
    throw new Error(`Failed to create reservation: ${error?.message}`);
  }
}

export { getReservations, createReservation };
