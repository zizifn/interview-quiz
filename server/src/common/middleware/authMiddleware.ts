import {
  deleteSessionTokenCookie,
  setSessionTokenCookie,
  validateSessionToken,
} from "@/api/auth/auth";

import type {
  ErrorRequestHandler,
  NextFunction,
  RequestHandler,
  Request,
  Response,
} from "express";

async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const sessionToken = req.cookies.session;
  if (!sessionToken) {
    next();
    return;
  }

  // Initialize req.locals if it doesn't exist
  if (!req.locals) {
    req.locals = {
      session: null,
      user: null,
    };
  }
  try {
    const { session, user } = await validateSessionToken(sessionToken);

    req.log.info("authMiddleware-> session-->user", session, user);
    if (session !== null) {
      setSessionTokenCookie(res, sessionToken, session.expiresAt);
    } else {
      deleteSessionTokenCookie(res);
    }
    req.locals.session = session;
    req.locals.user = user;
    next();
    return;
  } catch (error) {
    console.log(error);
    req.log.error("Error validating session token:", error);
    next();
    return;
  }
}

export { authMiddleware };
