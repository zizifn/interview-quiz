import type { Request, Response, NextFunction } from "express";
import { authDB } from "@/db/db";
import { userTable } from "@/db/schema";
import { hashPassword } from "./auth";
export async function createUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const requestBody = req.body;
    const user: typeof userTable.$inferInsert = {
      username: requestBody.name,
      email: requestBody.email,
      password_hash: await hashPassword(requestBody.password),
    };
    await authDB.insert(userTable).values(user);
    // newUser.rows()
    res.status(201).json({
      ...requestBody,
      password: undefined,
    });
    return;
  } catch (error) {
    next(error);
  }
}
