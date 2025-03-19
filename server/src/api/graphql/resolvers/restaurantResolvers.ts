import { getCouchbaseConnection } from "@/db/couchbase";
import { GraphQLResolveInfo } from "graphql";
import { GraphQLContext } from "../type";
import { getRestaurantService } from "@/api/restaurant/restaurantServices";

async function getRestaurants(
  _args: any,
  context: GraphQLContext,
  _info: GraphQLResolveInfo
) {
  const { user, logger } = context;
  if (!user) {
    throw new Error("Unauthorized");
  }

  // get db
  const { quizScope } = await getCouchbaseConnection();
  if (!quizScope) {
    throw new Error("Service is unavailable.");
  }

  try {
    const result = await getRestaurantService(quizScope);
    return result;
  } catch (error) {
    logger?.error("Error fetching restaurant data:", error);
    throw new Error("Internal Server Error");
  }
}

// Import reservation resolvers

export { getRestaurants };
