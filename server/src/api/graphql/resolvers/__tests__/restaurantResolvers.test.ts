import { describe, it, expect, vi, beforeEach } from "vitest";
import { getRestaurants } from "../restaurantResolvers";

// Mock dependencies
vi.mock("@/db/couchbase", () => ({
  getCouchbaseConnection: vi.fn(),
}));

vi.mock("@/api/restaurant/restaurantServices", () => ({
  getRestaurantService: vi.fn(),
}));

// Import mocks after mocking
import { getCouchbaseConnection } from "@/db/couchbase";
import { getRestaurantService } from "@/api/restaurant/restaurantServices";

describe("Restaurant Resolvers", () => {
  const mockUser = { id: "user123", email: "test@example.com" };
  const mockLogger = { error: vi.fn(), info: vi.fn() };
  const mockQuizScope = { collection: vi.fn() };
  const mockContext = { user: mockUser, logger: mockLogger } as any;
  const mockArgs = {};
  const mockInfo = {} as any;

  beforeEach(() => {
    vi.resetAllMocks();
    (getCouchbaseConnection as any).mockResolvedValue({
      quizScope: mockQuizScope,
    });
  });

  describe("getRestaurants", () => {
    it("should return restaurants when user is authenticated", async () => {
      const mockRestaurants = [
        { id: "rest1", name: "Restaurant 1" },
        { id: "rest2", name: "Restaurant 2" },
      ];
      (getRestaurantService as any).mockResolvedValue(mockRestaurants);

      const result = await getRestaurants(
        null,
        mockArgs,
        mockContext,
        mockInfo
      );

      expect(getCouchbaseConnection).toHaveBeenCalledTimes(1);
      expect(getRestaurantService).toHaveBeenCalledWith(mockQuizScope);
      expect(result).toEqual(mockRestaurants);
    });

    it("should throw error when user is not authenticated", async () => {
      await expect(
        getRestaurants(null, mockArgs, { ...mockContext, user: null }, mockInfo)
      ).rejects.toThrow("Unauthorized");
    });

    it("should throw error when service is unavailable", async () => {
      (getCouchbaseConnection as any).mockResolvedValue({ quizScope: null });

      await expect(
        getRestaurants(null, mockArgs, mockContext, mockInfo)
      ).rejects.toThrow("Service is unavailable.");
    });

    it("should handle service errors gracefully", async () => {
      const mockError = new Error("Database error");
      (getRestaurantService as any).mockRejectedValue(mockError);

      await expect(
        getRestaurants(null, mockArgs, mockContext, mockInfo)
      ).rejects.toThrow("Internal Server Error");
      expect(mockLogger.error).toHaveBeenCalledWith(
        "Error fetching restaurant data:",
        mockError
      );
    });
  });
});
