import { describe, it, expect, beforeEach, vi } from "vitest";
import { authMiddleware } from "@/common/middleware/authMiddleware";
import * as auth from "@/api/auth/auth";
import { Request, Response } from "express";

// Mock dependencies
vi.mock("@/api/auth/auth", () => ({
  validateSessionToken: vi.fn(),
  setSessionTokenCookie: vi.fn(),
  deleteSessionTokenCookie: vi.fn(),
}));

describe("authMiddleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRequest = {
      cookies: {},
      locals: undefined,
      log: {
        info: vi.fn(),
        error: vi.fn(),
      } as any,
    };

    mockResponse = {
      setHeader: vi.fn(),
    };

    nextFunction = vi.fn();
  });

  it("should call next() when no session token is present", async () => {
    await authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalled();
    expect(auth.validateSessionToken).not.toHaveBeenCalled();
    expect(mockRequest.locals).toBeUndefined();
  });

  it("should initialize req.locals and set session/user when token is valid", async () => {
    const mockSession = {
      id: "session-123",
      userId: 1,
      expiresAt: new Date(Date.now() + 86400000),
    };
    const mockUser = { id: 1, username: "testuser" } as any;
    mockRequest.cookies = { session: "valid-token" };

    vi.mocked(auth.validateSessionToken).mockResolvedValue({
      session: mockSession,
      user: mockUser,
    });

    // Execute
    await authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    // Assert
    expect(auth.validateSessionToken).toHaveBeenCalledWith("valid-token");
    expect(auth.setSessionTokenCookie).toHaveBeenCalledWith(
      mockResponse,
      "valid-token",
      mockSession.expiresAt
    );
    expect(mockRequest.locals).toEqual({
      session: mockSession,
      user: mockUser,
    });
    expect(nextFunction).toHaveBeenCalled();
  });

  it("should delete session cookie when token is invalid", async () => {
    // Setup
    mockRequest.cookies = { session: "invalid-token" };

    vi.mocked(auth.validateSessionToken).mockResolvedValue({
      session: null,
      user: null,
    });

    // Execute
    await authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    // Assert
    expect(auth.validateSessionToken).toHaveBeenCalledWith("invalid-token");
    expect(auth.deleteSessionTokenCookie).toHaveBeenCalledWith(mockResponse);
    expect(mockRequest.locals).toEqual({
      session: null,
      user: null,
    });
    expect(nextFunction).toHaveBeenCalled();
  });

  it("should handle validation errors and call next()", async () => {
    // Setup
    mockRequest.cookies = { session: "error-token" };

    const validationError = new Error("Validation error");
    vi.mocked(auth.validateSessionToken).mockRejectedValue(validationError);

    // Execute
    await authMiddleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    // Assert
    expect(auth.validateSessionToken).toHaveBeenCalledWith("error-token");
    expect(mockRequest.log?.error).toHaveBeenCalledWith(
      "Error validating session token:",
      validationError
    );
    expect(nextFunction).toHaveBeenCalled();
  });
});
