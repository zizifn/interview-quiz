import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getReservations,
  createReservation,
  updateReservation,
  updateStatusReservation,
} from "../reservationResolvers";

// Mock dependencies
vi.mock("@/db/couchbase", () => ({
  getCouchbaseConnection: vi.fn(),
}));

vi.mock("@/api/reservation/reservationServices", () => ({
  getReservationsService: vi.fn(),
  createReservationService: vi.fn(),
  updateReservationService: vi.fn(),
  updateStatusReservationService: vi.fn(),
}));

// Import mocks after mocking
import { getCouchbaseConnection } from "@/db/couchbase";
import {
  getReservationsService,
  createReservationService,
  updateReservationService,
  updateStatusReservationService,
} from "@/api/reservation/reservationServices";

describe("Reservation Resolvers", () => {
  const mockUser = { id: "user123", email: "test@example.com" };
  const mockLogger = { error: vi.fn(), info: vi.fn() };
  const mockQuizScope = { collection: vi.fn() };
  const mockCouchbaseCluster = { transactions: vi.fn() };
  const mockContext = { user: mockUser, logger: mockLogger } as any;
  const mockInfo = {} as any;

  beforeEach(() => {
    vi.resetAllMocks();
    (getCouchbaseConnection as any).mockResolvedValue({
      quizScope: mockQuizScope,
      couchbaseCluster: mockCouchbaseCluster,
    });
  });

  describe("getReservations", () => {
    it("should return reservations when user is authenticated", async () => {
      const mockReservations = [{ id: "res1", name: "Reservation 1" }];
      (getReservationsService as any).mockResolvedValue(mockReservations);

      const result = await getReservations(null, {}, mockContext, mockInfo);

      expect(getCouchbaseConnection).toHaveBeenCalledTimes(1);
      expect(getReservationsService).toHaveBeenCalledWith(
        mockQuizScope,
        mockUser
      );
      expect(result).toEqual(mockReservations);
    });

    it("should throw error when user is not authenticated", async () => {
      await expect(
        getReservations(null, {}, { ...mockContext, user: null }, mockInfo)
      ).rejects.toThrow("Unauthorized");
    });

    it("should throw error when service is unavailable", async () => {
      (getCouchbaseConnection as any).mockResolvedValue({ quizScope: null });

      await expect(
        getReservations(null, {}, mockContext, mockInfo)
      ).rejects.toThrow("Service is unavailable.");
    });

    it("should handle service errors gracefully", async () => {
      const mockError = new Error("Database error");
      (getReservationsService as any).mockRejectedValue(mockError);

      await expect(
        getReservations(null, {}, mockContext, mockInfo)
      ).rejects.toThrow(/Internal Server Error/);
      expect(mockLogger.error).toHaveBeenCalledWith(
        "Error fetching reservations data:",
        mockError
      );
    });
  });

  describe("createReservation", () => {
    const mockInput = { date: "2023-05-20", guests: 4 };
    const mockArgs = { input: mockInput } as any;
    const mockCreatedReservation = { id: "new-res-1", ...mockInput };

    it("should create a reservation successfully", async () => {
      (createReservationService as any).mockResolvedValue(
        mockCreatedReservation
      );

      const result = await createReservation(
        null,
        mockArgs,
        mockContext,
        mockInfo
      );

      expect(createReservationService).toHaveBeenCalledWith(
        mockQuizScope,
        mockCouchbaseCluster,
        mockInput,
        mockUser
      );
      expect(result).toEqual(mockCreatedReservation);
    });

    it("should throw error when user is not authenticated", async () => {
      await expect(
        createReservation(
          null,
          mockArgs,
          { ...mockContext, user: null },
          mockInfo
        )
      ).rejects.toThrow("Unauthorized");
    });

    it("should handle service errors gracefully", async () => {
      const mockError = new Error("Failed to create");
      (createReservationService as any).mockRejectedValue(mockError);

      await expect(
        createReservation(null, mockArgs, mockContext, mockInfo)
      ).rejects.toThrow(/Failed to create reservation/);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe("updateReservation", () => {
    const mockInput = { id: "res-1", date: "2023-05-21", guests: 5 };
    const mockArgs = { input: mockInput } as any;
    const mockUpdatedReservation = { ...mockInput };

    it("should update a reservation successfully", async () => {
      (updateReservationService as any).mockResolvedValue(
        mockUpdatedReservation
      );

      const result = await updateReservation(
        null,
        mockArgs,
        mockContext,
        mockInfo
      );

      expect(updateReservationService).toHaveBeenCalledWith(
        mockQuizScope,
        mockCouchbaseCluster,
        mockInput.id,
        mockInput,
        mockUser
      );
      expect(result).toEqual(mockUpdatedReservation);
    });

    it("should throw error when service is unavailable", async () => {
      (getCouchbaseConnection as any).mockResolvedValue({
        quizScope: null,
        couchbaseCluster: null,
      });

      await expect(
        updateReservation(null, mockArgs, mockContext, mockInfo)
      ).rejects.toThrow("Service is unavailable.");
    });
  });

  describe("updateStatusReservation", () => {
    const mockInput = { id: "res-1", status: "CONFIRMED" };
    const mockArgs = { input: mockInput } as any;
    const mockUpdatedReservation = { id: "res-1", status: "CONFIRMED" };

    it("should update reservation status successfully", async () => {
      (updateStatusReservationService as any).mockResolvedValue(
        mockUpdatedReservation
      );

      const result = await updateStatusReservation(
        null,
        mockArgs,
        mockContext,
        mockInfo
      );

      expect(updateStatusReservationService).toHaveBeenCalledWith(
        mockQuizScope,
        mockCouchbaseCluster,
        mockInput.id,
        mockInput,
        mockUser
      );
      expect(result).toEqual(mockUpdatedReservation);
    });

    it("should throw error when user is not authenticated", async () => {
      await expect(
        updateStatusReservation(
          null,
          mockArgs,
          { ...mockContext, user: null },
          mockInfo
        )
      ).rejects.toThrow("Unauthorized");
    });
  });
});
