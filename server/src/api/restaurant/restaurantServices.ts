import { Scope } from "couchbase";

export async function getRestaurantService(quizScope: Scope) {
  try {
    const restaurantData = await quizScope.query(
      `SELECT r.* FROM restaurant r`
    );
    return restaurantData.rows;
  } catch (error) {
    throw new Error("Error fetching restaurant data: " + error);
  }
}
