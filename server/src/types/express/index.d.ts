import * as express from "express";
import { type User, type Session, sessionTable, userTable } from "@/db/schema";
declare global {
  namespace Express {
    interface Request {
      locals: {
        user: User | null; // Updated to use proper User type
        session: Session | null; // Updated to use proper Session type
      };
    }
  }
}
