import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getReservationsService,
  createReservationService,
  updateReservationService,
  updateStatusReservationService,
} from "../reservationServices";
import {
  Scope,
  Cluster,
  Collection,
  QueryResult,
  MutationResult,
  GetResult,
} from "couchbase";

// Mock couchbase
vi.mock("couchbase", () => {
  return {
    Scope: vi.fn(),
    Cluster: vi.fn(),
    TransactionFailedError: class TransactionFailedError extends Error {},
    TransactionCommitAmbiguousError: class TransactionCommitAmbiguousError extends Error {},
  };
});

// Mock crypto.randomUUID
vi.stubGlobal("crypto", {
  randomUUID: () => "mock-uuid-1234",
});

describe("Reservation Services", () => {
  // Common mock objects
  let mockScope: Partial<Scope>;
  let mockCluster: Partial<Cluster>;
  let mockCollection: Partial<Collection>;
  let mockRestaurantCollection: Partial<Collection>;
  let mockQueryResult: Partial<QueryResult<any>>;
  let mockUser: any;
  let mockEmployee: any;
  let mockTransactionCtx: any;

  beforeEach(() => {
    // Reset mocks before each test
    mockQueryResult = {
      rows: [{ id: "res1", guestName: "John" }],
    };

    mockCollection = {
      get: vi.fn(),
    };

    mockRestaurantCollection = {
      get: vi.fn(),
    };

    mockScope = {
      query: vi.fn().mockResolvedValue(mockQueryResult),
      collection: vi.fn().mockImplementation((name) => {
        if (name === "reservations") return mockCollection;
        if (name === "restaurant") return mockRestaurantCollection;
        return mockCollection;
      }),
    };

    mockTransactionCtx = {
      get: vi.fn(),
      insert: vi.fn(),
      replace: vi.fn(),
    };

    mockCluster = {
      transactions: vi.fn().mockReturnValue({
        run: vi.fn().mockImplementation(async (callback) => {
          await callback(mockTransactionCtx);
          return true;
        }),
      }),
    };

    mockUser = {
      username: "John",
      email: "john@example.com",
      is_employee: false,
    };

    mockEmployee = {
      username: "Employee",
      email: "employee@restaurant.com",
      is_employee: true,
    };
  });

  describe("getReservationsService", () => {
    it("should get all reservations for employee users", async () => {
      const result = await getReservationsService(
        mockScope as Scope,
        mockEmployee
      );

      expect(mockScope.query).toHaveBeenCalledWith(
        "SELECT r.* FROM reservations r WHERE r.reservationDateTime > (NOW_MILLIS() - 21600000) ORDER BY r.reservationDateTime Desc"
      );
      expect(result).toEqual(mockQueryResult.rows);
    });

    it("should get only user reservations for regular users", async () => {
      const result = await getReservationsService(mockScope as Scope, mockUser);

      expect(mockScope.query).toHaveBeenCalledWith(
        "SELECT r.* FROM reservations r WHERE r.guestName = $1 AND r.reservationDateTime > (NOW_MILLIS() - 21600000) ORDER BY r.reservationDateTime Desc",
        { parameters: [mockUser.username] }
      );
      expect(result).toEqual(mockQueryResult.rows);
    });

    it("should throw error when query fails", async () => {
      mockScope.query = vi.fn().mockRejectedValue(new Error("DB error"));

      await expect(
        getReservationsService(mockScope as Scope, mockUser)
      ).rejects.toThrow("Failed to fetch reservations");
    });
  });

  describe("createReservationService", () => {
    it("should create a new reservation", async () => {
      const mockRestaurant = {
        id: "rest1",
        name: "Test Restaurant",
        address: "123 Test St",
        tables: [{ id: "table1", capacity: 4, size: 4 }],
      };

      const mockReservation = {
        restaurantInfo: { id: "rest1" },
        tableInfo: { id: "table1" },
        guestCount: 2,
        reservationDateTime: "2023-06-15T18:00:00Z",
        specialRequests: "Window seat",
      };

      mockTransactionCtx.get.mockImplementation(async (collection, id) => {
        if (id === "rest1") {
          return { content: mockRestaurant };
        }
        return null;
      });

      const result = await createReservationService(
        mockScope as Scope,
        mockCluster as unknown as Cluster,
        mockReservation,
        mockUser
      );

      expect(mockTransactionCtx.insert).toHaveBeenCalled();
      expect(mockTransactionCtx.replace).toHaveBeenCalled();
      expect(result).toMatchObject({
        id: "mock-uuid-1234",
        guestName: "John",
        guestEmail: "john@example.com",
        status: "confirmed",
      });
    });

    it("should throw error for non-existent restaurant", async () => {
      mockTransactionCtx.get.mockResolvedValue({ content: null });

      const mockReservation = {
        restaurantInfo: { id: "non-existent" },
        tableInfo: { id: "table1" },
      };

      await expect(
        createReservationService(
          mockScope as Scope,
          mockCluster as unknown as Cluster,
          mockReservation,
          mockUser
        )
      ).rejects.toThrow("Restaurant document not found");
    });
  });

  describe("updateReservationService", () => {
    it("should update an existing reservation", async () => {
      const oldReservation = {
        id: "res1",
        guestName: "John",
        guestEmail: "john@example.com",
        status: "confirmed",
        restaurantInfo: { id: "rest1" },
        tableInfo: { id: "table1" },
      };

      const mockRestaurant = {
        id: "rest1",
        tables: [
          { id: "table1", capacity: 0, size: 4 },
          { id: "table2", capacity: 2, size: 2 },
        ],
      };

      mockTransactionCtx.get.mockImplementation(async (collection, id) => {
        if (id === "res1") return { content: oldReservation };
        if (id === "rest1") return { content: mockRestaurant };
        return null;
      });

      const updateData = {
        guestEmail: "john.updated@example.com",
        reservationDateTime: "2023-06-16T19:00:00Z",
        tableInfo: { id: "table2" },
        specialRequests: "Quiet area please",
      };

      const result = await updateReservationService(
        mockScope as Scope,
        mockCluster as unknown as Cluster,
        "res1",
        updateData,
        mockUser
      );

      expect(mockTransactionCtx.replace).toHaveBeenCalledTimes(2); // Restaurant and reservation
      expect(result).toMatchObject({
        guestEmail: "john.updated@example.com",
        tableInfo: { id: "table2" },
      });
    });
  });

  describe("updateStatusReservationService", () => {
    it("should update reservation status to completed", async () => {
      const oldReservation = {
        id: "res1",
        guestName: "John",
        status: "confirmed",
        restaurantInfo: { id: "rest1" },
        tableInfo: { id: "table1" },
      };

      const mockRestaurant = {
        id: "rest1",
        tables: [{ id: "table1", capacity: 0, size: 4 }],
      };

      mockTransactionCtx.get.mockImplementation(async (collection, id) => {
        if (id === "res1") return { content: oldReservation };
        if (id === "rest1") return { content: mockRestaurant };
        return null;
      });

      const statusUpdate = { status: "completed" };

      const result = await updateStatusReservationService(
        mockScope as Scope,
        mockCluster as unknown as Cluster,
        "res1",
        statusUpdate,
        mockUser
      );

      expect(mockTransactionCtx.replace).toHaveBeenCalledTimes(2);
      expect(result).toMatchObject({
        status: "completed",
      });

      // Check that table capacity was increased
      expect(
        mockTransactionCtx.replace.mock.calls[0][1].tables[0].capacity
      ).toBe(1);
    });

    it("should reject status update for invalid status", async () => {
      const statusUpdate = { status: "invalid-status" };

      await expect(
        updateStatusReservationService(
          mockScope as Scope,
          mockCluster as unknown as Cluster,
          "res1",
          statusUpdate,
          mockUser
        )
      ).rejects.toThrow("Only can update to completed or canceled");
    });

    it("should reject updates for non-confirmed reservations", async () => {
      const oldReservation = {
        id: "res1",
        guestName: "John",
        status: "completed", // Already completed
        restaurantInfo: { id: "rest1" },
        tableInfo: { id: "table1" },
      };

      mockTransactionCtx.get.mockImplementation(async (collection, id) => {
        if (id === "res1") return { content: oldReservation };
        return null;
      });

      const statusUpdate = { status: "canceled" };

      await expect(
        updateStatusReservationService(
          mockScope as Scope,
          mockCluster as unknown as Cluster,
          "res1",
          statusUpdate,
          mockUser
        )
      ).rejects.toThrow(
        "You can't update a reservation that is not confirmed."
      );
    });
  });
});
