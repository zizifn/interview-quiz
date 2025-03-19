import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useUser, useRestaurants } from "../hooks";
import * as http from "../http";

// Fix the mock setup for HTTP module
vi.mock("../http", () => ({
  getUser: vi.fn(),
  getRestaurants: vi.fn(),
  queryClient: new QueryClient(),
}));

// Wrapper component for React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("Hooks", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("useUser", () => {
    it("should return user data when successful", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        username: "testuser",
        is_employee: true,
      };

      // Fix the mock implementation
      (http.getUser as Mock).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useUser(), {
        wrapper: createWrapper(),
      });

      // Initially loading
      expect(result.current.isLoading).toBe(true);

      // Wait for the query to resolve
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockUser);
      expect(http.getUser).toHaveBeenCalledTimes(1);
    });

    it("should handle error states", async () => {
      (http.getUser as Mock).mockRejectedValue(
        new Error("Failed to fetch user"),
      );

      const { result } = renderHook(() => useUser(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeDefined();
    });
  });

  describe("useRestaurants", () => {
    it("should not fetch restaurants if username is empty", async () => {
      const { result } = renderHook(() => useRestaurants(""), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
      expect(http.getRestaurants).not.toHaveBeenCalled();
    });

    it("should fetch restaurants if username is provided", async () => {
      const mockRestaurants = [
        {
          id: "1",
          name: "Restaurant 1",
          phone: "123-456-7890",
          tables: [{ id: "t1", size: 4, capacity: 4 }],
        },
      ];

      (http.getRestaurants as Mock).mockResolvedValue(mockRestaurants);

      const { result } = renderHook(() => useRestaurants("testuser"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockRestaurants);
      expect(http.getRestaurants).toHaveBeenCalledTimes(1);
    });
  });
});
