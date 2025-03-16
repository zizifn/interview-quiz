import { type User, type Session, sessionTable, userTable } from "@/db/schema";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { authDB } from "@/db/db";
import { eq } from "drizzle-orm";
import { hash, verify } from "@node-rs/argon2";
import { env } from "@/common/utils/envConfig";

import type { Request, Response, NextFunction } from "express";

export async function hashPassword(password: string): Promise<string> {
  return await hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
}

export async function getUser(username: string): Promise<User> {
  const users = await authDB
    .select()
    .from(userTable)
    .where(eq(userTable.username, username));

  if (users.length !== 1) {
    throw new Error("Invalid user ID");
  }
  return users[0];
}

export async function verifyPasswordHash(
  hash: string,
  password: string
): Promise<boolean> {
  return await verify(hash, password);
}

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

export async function createSession(
  token: string,
  userId: number
): Promise<Session> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: Session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
  };
  await authDB.insert(sessionTable).values(session);
  return session;
}

export async function validateSessionToken(
  token: string
): Promise<SessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const result = await authDB
    .select({ user: userTable, session: sessionTable })
    .from(sessionTable)
    .innerJoin(userTable, eq(sessionTable.userId, userTable.id))
    .where(eq(sessionTable.id, sessionId));
  if (result.length < 1) {
    return { session: null, user: null };
  }
  const { user, session } = result[0];
  if (Date.now() >= session.expiresAt.getTime()) {
    await authDB.delete(sessionTable).where(eq(sessionTable.id, session.id));
    return { session: null, user: null };
  }
  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await authDB
      .update(sessionTable)
      .set({
        expiresAt: session.expiresAt,
      })
      .where(eq(sessionTable.id, session.id));
  }
  return { session, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await authDB.delete(sessionTable).where(eq(sessionTable.id, sessionId));
}

export async function invalidateAllSessions(userId: number): Promise<void> {
  await authDB.delete(sessionTable).where(eq(sessionTable.userId, userId));
}

export function setSessionTokenCookie(
  response: Response,
  token: string,
  expiresAt: Date
): void {
  if (env.isProduction) {
    // When deployed over HTTPS
    response.setHeader(
      "Set-Cookie",
      `session=${token}; HttpOnly; SameSite=Lax; Expires=${expiresAt.toUTCString()}; Path=/; Secure;`
    );
  } else {
    // When deployed over HTTP (localhost)
    response.setHeader(
      "Set-Cookie",
      `session=${token}; HttpOnly; SameSite=Lax; Expires=${expiresAt.toUTCString()}; Path=/`
    );
  }
}

export function deleteSessionTokenCookie(response: Response): void {
  if (env.isProduction) {
    // When deployed over HTTPS
    response.setHeader(
      "Set-Cookie",
      "session=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/; Secure;"
    );
  } else {
    // When deployed over HTTP (localhost)
    response.setHeader(
      "Set-Cookie",
      "session=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/"
    );
  }
}

export type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };
