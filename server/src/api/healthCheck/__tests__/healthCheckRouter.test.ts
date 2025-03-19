import { StatusCodes } from "http-status-codes";
import request from "supertest";
import express from "express";
import { describe, it, expect, vi, beforeEach } from "vitest";

import type { ServiceResponse } from "@/common/models/serviceResponse";
import { healthCheckRouter } from "../healthCheckRouter";

describe("Health Check API endpoints", () => {
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
    app.use("/health-check", healthCheckRouter);
  });

  it("GET / - success", async () => {
    const response = await request(app).get("/health-check");
    const result: ServiceResponse = response.body;

    expect(response.statusCode).toEqual(StatusCodes.OK);
    expect(result.success).toBeTruthy();
    expect(result.responseObject).toBeNull();
    expect(result.message).toEqual("Service is healthy");
  });
});
