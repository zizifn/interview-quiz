import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getUser, login, signUp, getReservation } from "../http";

describe("http", () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    global.fetch = mockFetch;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("getUser", () => {
    it("should fetch user data successfully", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        username: "test",
        is_employee: true,
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockUser,
      });

      const result = await getUser();
      expect(result).toEqual(mockUser);
      expect(mockFetch).toHaveBeenCalledWith("/api/auth/user");
    });

    it("should return default user object on 401", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const result = await getUser();
      expect(result).toEqual({
        id: 0,
        email: "",
        username: "",
        is_employee: false,
      });
    });

    it("should throw error on other failure responses", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(getUser()).rejects.toThrow(
        "An error occurred while get user, error code: 500",
      );
    });
  });

  describe("login", () => {
    it("should login successfully", async () => {
      const mockResponse = { success: true, token: "mock-token" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await login("username", "password");
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "username",
          password: "password",
        }),
      });
    });
  });

  describe("signUp", () => {
    it("should sign up successfully", async () => {
      const mockResponse = { success: true, userId: 1 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await signUp({
        username: "username",
        password: "password",
        email: "test@example.com",
      });
      expect(result).toEqual(mockResponse);
    });

    it("should handle signup error with custom message", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Username already exists" }),
      });

      await expect(
        signUp({
          username: "username",
          password: "password",
          email: "test@example.com",
        }),
      ).rejects.toThrow("Username already exists");
    });
  });

  describe("getReservation", () => {
    it("should fetch reservations successfully", async () => {
      const mockReservations = [
        { id: "1", guestName: "Test Guest", status: "confirmed" },
      ];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockReservations,
      });

      const result = await getReservation();
      expect(result).toEqual(mockReservations);
      expect(mockFetch).toHaveBeenCalledWith("/api/reservation");
    });
  });
});
