import type { Request, Response, NextFunction } from "express";
import { authDB } from "@/db/db";
import { userTable } from "@/db/schema";
import { getCouchbaseConnection } from "@/db/couchbase";

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
    const restaurantData = await quizScope.query(
      `SELECT r.* FROM restaurant r`
    );
    res.status(200).json(restaurantData.rows);
  } catch (error) {
    console.error("Error fetching restaurant data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
