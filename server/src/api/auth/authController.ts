import type { Request, Response, NextFunction } from "express";
import { authDB } from "@/db/db";
import { userTable } from "@/db/schema";
import {
  hashPassword,
  getUser,
  generateSessionToken,
  createSession,
  verifyPasswordHash,
  setSessionTokenCookie,
} from "./auth";
import { LoginForm } from "./authModel";
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

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const requestBody: LoginForm = req.body;
    // get user hash from db
    const user = await getUser(requestBody.name);
    // verify password
    const isValid = await verifyPasswordHash(
      user.password_hash,
      requestBody.password
    );
    if (!isValid) {
      res.status(401).json({
        message: "Invalid username or password",
      });
      return;
    }

    const token = generateSessionToken();
    const session = await createSession(token, user.id);

    setSessionTokenCookie(res, token, session.expiresAt);
    res.status(200).json({
      message: "Login successful",
    });
  } catch (error) {
    next(error);
  }
}
