import { getCouchbaseConnection } from "@/db/couchbase";
import { GraphQLResolveInfo } from "graphql";
import { GraphQLContext } from "../type";
import {
  NewReservation,
  UpdateReservation,
  UpdateStatusReservation,
} from "@/api/reservation/reservationsModel";
import {
  TransactionCommitAmbiguousError,
  TransactionFailedError,
} from "couchbase";
import { Restaurant } from "@/api/restaurant/restaurantModel";

// Get all reservations
async function getReservations(
  _args: any,
  context: GraphQLContext,
  _info: GraphQLResolveInfo
) {
  return [];
}

// Get a single reservation by ID
async function getReservation(
  args: { id: string },
  context: GraphQLContext,
  _info: GraphQLResolveInfo
) {
  return null;
}

// Create a new reservation
async function createReservation(
  args: { input: NewReservation },
  context: GraphQLContext,
  _info: GraphQLResolveInfo
) {
  return null;
}

export { getReservations, getReservation, createReservation };
