import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response } from "express";
import {
  getReservation,
  createReservation,
  updateReservation,
  updateStatusReservation,
} from "../reservationsController";
import * as couchbaseModule from "@/db/couchbase";
import * as reservationServices from "../reservationServices";

// Mock the couchbase connection
vi.mock("@/db/couchbase", () => ({
  getCouchbaseConnection: vi.fn(),
}));

// Mock the reservation services
vi.mock("../reservationServices", () => ({
  getReservationsService: vi.fn(),
  createReservationService: vi.fn(),
  updateReservationService: vi.fn(),
  updateStatusReservationService: vi.fn(),
}));

describe("Reservation Controller", () => {
  const mockRequest = () => {
    return {
      locals: {
        user: { username: "testuser", email: "test@example.com" },
      },
      params: { id: "123456" },
      body: {},
      log: {
        error: vi.fn(),
      } as any,
    };
  };

  const mockResponse = () => {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
  };

  const mockNext = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("getReservation", () => {
    it("should return 401 if user is not authenticated", async () => {
      const req = { ...mockRequest(), locals: {} } as any;
      const res = mockResponse();

      await getReservation(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    it("should return 500 if couchbase connection fails", async () => {
      const req = mockRequest() as any;
      const res = mockResponse();

      vi.mocked(couchbaseModule.getCouchbaseConnection).mockResolvedValue(
        {} as any
      );

      await getReservation(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Service is unavailable.",
      });
    });

    it("should return reservations if successful", async () => {
      const req = mockRequest() as any;
      const res = mockResponse();
      const mockReservations = [{ id: "123", guestName: "testuser" }];
      const mockScope = { query: vi.fn() };

      vi.mocked(couchbaseModule.getCouchbaseConnection).mockResolvedValue({
        quizScope: mockScope,
      } as any);
      vi.mocked(reservationServices.getReservationsService).mockResolvedValue(
        mockReservations as any
      );

      await getReservation(req, res, mockNext);

      expect(reservationServices.getReservationsService).toHaveBeenCalledWith(
        mockScope,
        req.locals?.user
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockReservations);
    });

    it("should handle errors and return 500", async () => {
      const req = mockRequest() as any;
      const res = mockResponse();
      const mockError = new Error("Test error");
      const mockScope = { query: vi.fn() };

      vi.mocked(couchbaseModule.getCouchbaseConnection).mockResolvedValue({
        quizScope: mockScope,
      } as any);
      vi.mocked(reservationServices.getReservationsService).mockRejectedValue(
        mockError
      );

      await getReservation(req, res, mockNext);

      expect(req.log.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("Internal Server Error"),
        })
      );
    });
  });

  describe("createReservation", () => {
    it("should return 401 if user is not authenticated", async () => {
      const req = { ...mockRequest(), locals: {} } as any;
      const res = mockResponse();

      await createReservation(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
    });

    it("should return 500 if couchbase connection fails", async () => {
      const req = mockRequest() as any;
      const res = mockResponse();

      vi.mocked(couchbaseModule.getCouchbaseConnection).mockResolvedValue(
        {} as any
      );

      await createReservation(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Service is unavailable.",
      });
    });

    it("should create a reservation successfully", async () => {
      const req = mockRequest() as any;
      const res = mockResponse();
      const mockScope = {};
      const mockCluster = {};
      const mockReservation = { id: "123", guestName: "testuser" };
      req.body = {
        restaurantInfo: { id: "456" },
        tableInfo: { id: "789" },
      };

      vi.mocked(couchbaseModule.getCouchbaseConnection).mockResolvedValue({
        quizScope: mockScope,
        couchbaseCluster: mockCluster,
      } as any);

      vi.mocked(reservationServices.createReservationService).mockResolvedValue(
        mockReservation as any
      );

      await createReservation(req, res);

      expect(reservationServices.createReservationService).toHaveBeenCalledWith(
        mockScope,
        mockCluster,
        req.body,
        req.locals?.user
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockReservation);
    });

    it("should handle errors and return 500", async () => {
      const req = mockRequest() as any;
      const res = mockResponse();
      const mockError = new Error("Test error");
      const mockScope = {};
      const mockCluster = {};

      vi.mocked(couchbaseModule.getCouchbaseConnection).mockResolvedValue({
        quizScope: mockScope,
        couchbaseCluster: mockCluster,
      } as any);

      vi.mocked(reservationServices.createReservationService).mockRejectedValue(
        mockError
      );

      await createReservation(req, res);

      expect(req.log.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("Failed to create reservation"),
        })
      );
    });
  });

  describe("updateReservation", () => {
    it("should return 401 if user is not authenticated", async () => {
      const req = { ...mockRequest(), locals: {} } as any;
      const res = mockResponse();

      await updateReservation(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    it("should return 500 if couchbase connection fails", async () => {
      const req = mockRequest() as any;
      const res = mockResponse();

      vi.mocked(couchbaseModule.getCouchbaseConnection).mockResolvedValue(
        {} as any
      );

      await updateReservation(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Service is unavailable.",
      });
    });

    it("should update a reservation successfully", async () => {
      const req = mockRequest() as any;
      const res = mockResponse();
      const mockScope = {};
      const mockCluster = {};
      const mockReservation = {
        id: "123",
        guestName: "testuser",
        updated: true,
      };
      req.body = { tableInfo: { id: "789" } };

      vi.mocked(couchbaseModule.getCouchbaseConnection).mockResolvedValue({
        quizScope: mockScope,
        couchbaseCluster: mockCluster,
      } as any);

      vi.mocked(reservationServices.updateReservationService).mockResolvedValue(
        mockReservation as any
      );

      await updateReservation(req, res);

      expect(reservationServices.updateReservationService).toHaveBeenCalledWith(
        mockScope,
        mockCluster,
        req.params.id,
        req.body,
        req.locals?.user
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockReservation);
    });

    it("should handle errors and return 500", async () => {
      const req = mockRequest() as any;
      const res = mockResponse();
      const mockError = new Error("Test error");
      const mockScope = {};
      const mockCluster = {};

      vi.mocked(couchbaseModule.getCouchbaseConnection).mockResolvedValue({
        quizScope: mockScope,
        couchbaseCluster: mockCluster,
      } as any);

      vi.mocked(reservationServices.updateReservationService).mockRejectedValue(
        mockError
      );

      await updateReservation(req, res);

      expect(req.log.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("Failed to update reservation"),
        })
      );
    });
  });

  describe("updateStatusReservation", () => {
    it("should return 401 if user is not authenticated", async () => {
      const req = { ...mockRequest(), locals: {} } as any;
      const res = mockResponse();

      await updateStatusReservation(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
    });

    it("should return 500 if couchbase connection fails", async () => {
      const req = mockRequest() as any;
      const res = mockResponse();

      vi.mocked(couchbaseModule.getCouchbaseConnection).mockResolvedValue(
        {} as any
      );

      await updateStatusReservation(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Service is unavailable.",
      });
    });

    it("should update reservation status successfully", async () => {
      const req = mockRequest() as any;
      const res = mockResponse();
      const mockScope = {};
      const mockCluster = {};
      const mockReservation = {
        id: "123",
        guestName: "testuser",
        status: "completed",
      };
      req.body = { status: "completed" };

      vi.mocked(couchbaseModule.getCouchbaseConnection).mockResolvedValue({
        quizScope: mockScope,
        couchbaseCluster: mockCluster,
      } as any);

      vi.mocked(
        reservationServices.updateStatusReservationService
      ).mockResolvedValue(mockReservation as any);

      await updateStatusReservation(req, res);

      expect(
        reservationServices.updateStatusReservationService
      ).toHaveBeenCalledWith(
        mockScope,
        mockCluster,
        req.params.id,
        req.body,
        req.locals?.user
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockReservation);
    });

    it("should handle errors and return 500", async () => {
      const req = mockRequest() as any;
      const res = mockResponse();
      const mockError = new Error("Test error");
      const mockScope = {};
      const mockCluster = {};

      vi.mocked(couchbaseModule.getCouchbaseConnection).mockResolvedValue({
        quizScope: mockScope,
        couchbaseCluster: mockCluster,
      } as any);

      vi.mocked(
        reservationServices.updateStatusReservationService
      ).mockRejectedValue(mockError);

      await updateStatusReservation(req, res);

      expect(req.log.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining(
            "Failed to update reservation status"
          ),
        })
      );
    });
  });
});
