import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  hashPassword,
  verifyPasswordHash,
  generateSessionToken,
  createSession,
  validateSessionToken,
  invalidateSession,
  invalidateAllSessions,
} from "../auth";
import { authDB } from "@/db/db";
import { sessionTable, userTable } from "@/db/schema";
import { eq } from "drizzle-orm";

// Mock dependencies
vi.mock("@/db/db", () => ({
  authDB: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => []),
        innerJoin: vi.fn(() => ({
          where: vi.fn(() => []),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({})),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(),
      })),
    })),
  },
}));

// Mock crypto
vi.stubGlobal("crypto", {
  getRandomValues: (arr: Uint8Array) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  },
});

describe("Authentication functions", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("hashPassword", () => {
    it("should return a hashed password", async () => {
      const password = "test123";
      const hashedPassword = await hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(typeof hashedPassword).toBe("string");
    });

    it("should generate different hashes for the same password", async () => {
      const password = "test123";
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe("verifyPasswordHash", () => {
    it("should verify a correct password", async () => {
      const password = "test123";
      const hashedPassword = await hashPassword(password);

      const result = await verifyPasswordHash(hashedPassword, password);
      expect(result).toBe(true);
    });

    it("should reject an incorrect password", async () => {
      const password = "test123";
      const wrongPassword = "wrongPassword";
      const hashedPassword = await hashPassword(password);

      const result = await verifyPasswordHash(hashedPassword, wrongPassword);
      expect(result).toBe(false);
    });
  });

  describe("generateSessionToken", () => {
    it("should generate a session token", () => {
      const token = generateSessionToken();

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);
    });

    it("should generate different tokens on multiple calls", () => {
      const token1 = generateSessionToken();
      const token2 = generateSessionToken();

      expect(token1).not.toBe(token2);
    });
  });

  describe("createSession", () => {
    it("should create a session with the given token and user ID", async () => {
      const token = "test-token";
      const userId = 123;

      const session = await createSession(token, userId);

      expect(authDB.insert).toHaveBeenCalledTimes(1);
      expect(session).toBeDefined();
      expect(session.userId).toBe(userId);
      expect(typeof session.id).toBe("string");
      expect(session.expiresAt instanceof Date).toBe(true);
    });
  });

  describe("validateSessionToken", () => {
    it("should return null for an invalid session token", async () => {
      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      vi.mocked(authDB.select).mockImplementation(mockSelect);

      const result = await validateSessionToken("invalid-token");

      expect(result.session).toBeNull();
      expect(result.user).toBeNull();
    });

    it("should return user and session for a valid session token", async () => {
      const mockUser = { id: 1, username: "test", password_hash: "hash" };
      const mockSession = {
        id: "session-id",
        userId: 1,
        expiresAt: new Date(Date.now() + 3600000),
      };

      const mockSelect = vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            where: vi
              .fn()
              .mockResolvedValue([{ user: mockUser, session: mockSession }]),
          }),
        }),
      });

      vi.mocked(authDB.select).mockImplementation(mockSelect);

      const result = await validateSessionToken("valid-token");

      expect(result.user).toEqual(mockUser);
      expect(result.session).toEqual(mockSession);
    });
  });

  describe("invalidateSession", () => {
    it("should delete a session by ID", async () => {
      const sessionId = "test-session-id";
      const mockDelete = vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      });

      vi.mocked(authDB.delete).mockImplementation(mockDelete);

      await invalidateSession(sessionId);

      expect(authDB.delete).toHaveBeenCalledTimes(1);
      expect(mockDelete().where).toHaveBeenCalledTimes(1);
    });
  });

  describe("invalidateAllSessions", () => {
    it("should delete all sessions for a user", async () => {
      const userId = 123;
      const mockDelete = vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      });

      vi.mocked(authDB.delete).mockImplementation(mockDelete);

      await invalidateAllSessions(userId);

      expect(authDB.delete).toHaveBeenCalledTimes(1);
      expect(mockDelete().where).toHaveBeenCalledTimes(1);
    });
  });
});
