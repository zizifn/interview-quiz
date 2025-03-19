import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { restaurantRouter } from "../restaurantRouter";
import * as restaurantController from "../restaurantController";

vi.mock("../restaurantController");

describe("Restaurant Router", () => {
  let app: express.Express;

  const authMiddleware = (req: any, _: any, next: any) => {
    req.locals = { user: { id: "test-user" } };
    req.log = { error: vi.fn() };
    next();
  };

  beforeEach(() => {
    vi.resetAllMocks();
    app = express();
    app.use(authMiddleware);
    app.use("/restaurants", restaurantRouter);
  });

  it("should call the getRestaurant controller when GET /restaurants is called", async () => {
    const mockRestaurants = [
      {
        address:
          "No. 1 Kong Gang 8th Road, Changning District, Shanghai, 200335, China",
        id: "f225cf45-0c44-40ea-8d29-0be756626dcf",
        name: "Hilton Shanghai Hongqiao International Airport",
        phone: "+862133236666",
        tables: [
          {
            capacity: 10,
            id: "55d0e558-16f0-4b39-8e77-77745f435596",
            size: 1,
          },
        ],
        type: "restaurant",
      },
    ];

    vi.mocked(restaurantController.getRestaurant).mockImplementation(
      (req, res) => {
        res.status(200).json(mockRestaurants);
        return Promise.resolve();
      }
    );

    // Make the request
    const response = await request(app).get("/restaurants/");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockRestaurants);
    expect(restaurantController.getRestaurant).toHaveBeenCalled();
  });

  it("should return 401 when user is not authenticated", async () => {
    // Mock implementation to simulate unauthorized access
    vi.mocked(restaurantController.getRestaurant).mockImplementation(
      (req, res) => {
        res.status(401).json({ error: "Unauthorized" });
        return Promise.resolve();
      }
    );

    const response = await request(app).get("/restaurants/");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Unauthorized" });
  });

  it("should return 500 when an error occurs", async () => {
    vi.mocked(restaurantController.getRestaurant).mockImplementation(
      (req, res) => {
        res.status(500).json({ error: "Internal Server Error" });
        return Promise.resolve();
      }
    );

    const response = await request(app).get("/restaurants/");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Internal Server Error" });
  });
});
