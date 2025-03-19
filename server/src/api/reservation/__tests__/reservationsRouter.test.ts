import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express, { type Request, NextFunction } from "express";
import { reservationRouter } from "../reservationsRouter";
import * as reservationController from "../reservationsController";

// Mock the controllers
vi.mock("../reservationsController", () => ({
  getReservation: vi.fn((req, res) =>
    res.json({ message: "getReservation mock" })
  ),
  createReservation: vi.fn((req, res) =>
    res.status(201).json({ message: "createReservation mock" })
  ),
  updateReservation: vi.fn((req, res) =>
    res.json({ message: "updateReservation mock" })
  ),
  updateStatusReservation: vi.fn((req, res) =>
    res.json({ message: "updateStatusReservation mock" })
  ),
}));

vi.mock("@/common/utils/httpHandlers", () => ({
  validateRequest: () => (req: Request, res: Response, next: NextFunction) =>
    next(),
}));

describe("Reservation Router", () => {
  let app: any;

  beforeEach(() => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use("/api/reservation", reservationRouter);
  });

  it("should handle GET /api/reservation", async () => {
    const response = await request(app).get("/api/reservation");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "getReservation mock" });
    expect(reservationController.getReservation).toHaveBeenCalledTimes(1);
  });

  it("should handle POST /api/reservation", async () => {
    const mockData = {
      restaurantInfo: { id: "rest1" },
      tableInfo: { id: "table1" },
      reservationDateTime: 1742374853187,
    };

    const response = await request(app).post("/api/reservation").send(mockData);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ message: "createReservation mock" });
    expect(reservationController.createReservation).toHaveBeenCalledTimes(1);
  });

  it("should handle PUT /api/reservation/:id", async () => {
    const mockData = {
      tableInfo: { id: "table2" },
      reservationDateTime: 1742374853187,
    };

    const response = await request(app)
      .put("/api/reservation/res1")
      .send(mockData);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "updateReservation mock" });
    expect(reservationController.updateReservation).toHaveBeenCalledTimes(1);

    const controllerCall = vi.mocked(reservationController.updateReservation)
      .mock.calls[0];
    expect(controllerCall[0].params.id).toBe("res1");
  });

  it("should handle PUT /api/reservation/:id/status", async () => {
    const mockData = {
      status: "completed",
    };

    const response = await request(app)
      .put("/api/reservation/res1/status")
      .send(mockData);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "updateStatusReservation mock" });
    expect(reservationController.updateStatusReservation).toHaveBeenCalledTimes(
      1
    );

    const controllerCall = vi.mocked(
      reservationController.updateStatusReservation
    ).mock.calls[0];
    expect(controllerCall[0].params.id).toBe("res1");
  });
});
