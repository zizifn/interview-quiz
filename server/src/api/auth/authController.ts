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
  deleteSessionTokenCookie,
  invalidateSession,
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
  } catch (error: any) {
    req.log.error("Error creating user:", error);
    if (error?.code?.includes("SQLITE_CONSTRAINT")) {
      res.status(409).json({
        error: "UserName or Email already in use",
      });
      return;
    }
    res.status(500).json({
      error: "signup failed",
    });
    return;
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
      name: user.username,
      isEmployee: user.is_employee,
    });
    return;
  } catch (error) {
    req.log.error(
      `Error logging in: ${error?.toString()}: ${error?.stack}`,
      error
    );
    res.status(401).json({
      message: "Invalid username or password",
    });
  }
}

export async function getUserInfo(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.locals?.user;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  res.status(200).json({
    ...user,
    password: undefined,
    password_hash: undefined,
  });
}

export async function signout(req: Request, res: Response, next: NextFunction) {
  const session = req.locals?.session;
  try {
    // clear cookies
    deleteSessionTokenCookie(res);
    if (session?.id) {
      invalidateSession(session.id);
    }
    res.status(200).json({
      message: "Logout successful",
    });
    return;
  } catch (error) {
    req.log.error("Error signing out:", error);
    res.status(500).json({
      message: "Logout failed",
    });
    return;
  }
}
