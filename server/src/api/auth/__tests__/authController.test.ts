import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createUser, login, getUserInfo, signout } from "../authController";
import {
  hashPassword,
  getUser,
  generateSessionToken,
  createSession,
  verifyPasswordHash,
  setSessionTokenCookie,
  deleteSessionTokenCookie,
  invalidateSession,
} from "../auth";
import { authDB } from "@/db/db";

// Mock dependencies before importing controllers that use them
vi.mock("../auth", () => ({
  hashPassword: vi.fn().mockResolvedValue("hashed_password"),
  getUser: vi.fn(),
  generateSessionToken: vi.fn().mockReturnValue("session_token"),
  createSession: vi.fn(),
  verifyPasswordHash: vi.fn(),
  setSessionTokenCookie: vi.fn(),
  deleteSessionTokenCookie: vi.fn(),
  invalidateSession: vi.fn(),
}));

vi.mock("@/db/db", () => ({
  authDB: {
    insert: vi.fn(() => ({
      values: vi.fn(),
    })),
  },
}));

// Import controllers after the mocks are set up

describe("Auth Controller", () => {
  let mockRequest;
  let mockResponse;
  let mockNext;

  beforeEach(() => {
    mockRequest = {
      body: {},
      locals: {},
      log: { error: vi.fn() },
    };
    mockResponse = {
      status: vi.fn(() => mockResponse),
      json: vi.fn(() => mockResponse),
      setHeader: vi.fn(),
    };
    mockNext = vi.fn();
    vi.resetAllMocks();
  });

  describe("createUser", () => {
    it("should create a new user successfully", async () => {
      mockRequest.body = {
        name: "testuser",
        email: "test@example.com",
        password: "password123",
      };

      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      });
      vi.mocked(authDB.insert).mockImplementation(mockInsert);

      await createUser(mockRequest, mockResponse, mockNext);

      expect(hashPassword).toHaveBeenCalledWith("password123");
      expect(authDB.insert).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        name: "testuser",
        email: "test@example.com",
        password: undefined,
      });
    });

    it("should handle constraint errors", async () => {
      mockRequest.body = {
        name: "existinguser",
        email: "existing@example.com",
        password: "password123",
      };

      const mockError = new Error("Constraint violation");
      mockError.code = "SQLITE_CONSTRAINT";

      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockRejectedValue(mockError),
      });
      vi.mocked(authDB.insert).mockImplementation(mockInsert);

      await createUser(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "UserName or Email already in use",
      });
    });
  });

  describe("login", () => {
    it("should login successfully with valid credentials", async () => {
      mockRequest.body = {
        name: "testuser",
        password: "password123",
      };

      const mockUser = {
        id: 1,
        username: "testuser",
        password_hash: "hashed_password",
        is_employee: false,
      };

      const mockSession = {
        id: "session_id",
        userId: 1,
        expiresAt: new Date(Date.now() + 86400000),
      };

      vi.mocked(getUser).mockResolvedValue(mockUser);
      vi.mocked(verifyPasswordHash).mockResolvedValue(true);
      vi.mocked(createSession).mockResolvedValue(mockSession);
      vi.mocked(generateSessionToken).mockReturnValue("session_token");

      await login(mockRequest, mockResponse, mockNext);

      expect(getUser).toHaveBeenCalledWith("testuser");
      expect(verifyPasswordHash).toHaveBeenCalledWith(
        "hashed_password",
        "password123"
      );
      expect(generateSessionToken).toHaveBeenCalled();
      expect(createSession).toHaveBeenCalledWith("session_token", 1);
      expect(setSessionTokenCookie).toHaveBeenCalledWith(
        mockResponse,
        "session_token",
        mockSession.expiresAt
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Login successful",
        name: "testuser",
        isEmployee: false,
      });
    });

    it("should reject invalid credentials", async () => {
      mockRequest.body = {
        name: "testuser",
        password: "wrongpassword",
      };

      const mockUser = {
        id: 1,
        username: "testuser",
        password_hash: "hashed_password",
      };

      vi.mocked(getUser).mockResolvedValue(mockUser);
      vi.mocked(verifyPasswordHash).mockResolvedValue(false);

      await login(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid username or password",
      });
    });
  });

  describe("getUserInfo", () => {
    it("should return user info when authenticated", async () => {
      mockRequest.locals = {
        user: {
          id: 1,
          username: "testuser",
          email: "test@example.com",
          password_hash: "hashed_password",
        },
      };

      await getUserInfo(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        id: 1,
        username: "testuser",
        email: "test@example.com",
        password: undefined,
        password_hash: undefined,
      });
    });

    it("should return 401 when not authenticated", async () => {
      mockRequest.locals = {};

      await getUserInfo(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Unauthorized",
      });
    });
  });

  describe("signout", () => {
    it("should invalidate session and clear cookies", async () => {
      mockRequest.locals = {
        session: {
          id: "session_id",
          userId: 1,
          expiresAt: new Date(),
        },
      };

      await signout(mockRequest, mockResponse, mockNext);

      expect(deleteSessionTokenCookie).toHaveBeenCalledWith(mockResponse);
      expect(invalidateSession).toHaveBeenCalledWith("session_id");
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Logout successful",
      });
    });

    it("should work without active session", async () => {
      mockRequest.locals = {};

      await signout(mockRequest, mockResponse, mockNext);

      expect(deleteSessionTokenCookie).toHaveBeenCalledWith(mockResponse);
      expect(invalidateSession).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Logout successful",
      });
    });
  });
});
