import type { Request, Response, NextFunction } from "express";
import { getCouchbaseConnection } from "@/db/couchbase";
import { getRestaurantService } from "./restaurantServices";

export async function getRestaurant(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.locals?.user;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { quizScope } = await getCouchbaseConnection();
  if (!quizScope) {
    res.status(500).json({ error: "Service is unavailable." });
    return;
  }

  try {
    const result = await getRestaurantService(quizScope);
    res.status(200).json(result);
  } catch (error) {
    req.log.error("Error fetching restaurant data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
