import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { restaurantRouter } from "../restaurantRouter";
import * as couchbaseModule from "@/db/couchbase";

// Mock dependencies
vi.mock("@/db/couchbase");

describe("Restaurant API Integration", () => {
  let app: express.Express;

  const mockAuthMiddleware = (req: any, _: any, next: any) => {
    req.locals = { user: { id: "test-user" } };
    req.log = { error: vi.fn() };
    next();
  };

  beforeEach(() => {
    vi.resetAllMocks();
    app = express();
    app.use(mockAuthMiddleware);
    app.use("/restaurants", restaurantRouter);
  });

  it("should successfully return restaurant data", async () => {
    // Mock data
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

    const mockQuery = vi.fn().mockResolvedValue({ rows: mockRestaurants });
    const mockScope = { query: mockQuery };

    vi.mocked(couchbaseModule.getCouchbaseConnection).mockResolvedValueOnce({
      quizScope: mockScope,
    } as any);

    const response = await request(app).get("/restaurants/");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockRestaurants);
    expect(mockQuery).toHaveBeenCalledWith("SELECT r.* FROM restaurant r");
  });

  it("should return 500 when database connection fails", async () => {
    vi.mocked(couchbaseModule.getCouchbaseConnection).mockResolvedValueOnce({
      quizScope: null,
    } as any);
    const response = await request(app).get("/restaurants/");
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Service is unavailable." });
  });
});
