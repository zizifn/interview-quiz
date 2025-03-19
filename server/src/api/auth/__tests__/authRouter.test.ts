import { describe, it, expect, vi, beforeEach } from "vitest";
import { authRouter } from "../authRouter";
import express, { type Express } from "express";
import request from "supertest";
import * as authController from "../authController";

vi.mock("../authController", () => ({
  createUser: vi.fn((req, res) => res.status(201).json({ success: true })),
  login: vi.fn((req, res) => res.status(200).json({ success: true })),
  getUserInfo: vi.fn((req, res) => res.status(200).json({ success: true })),
  signout: vi.fn((req, res) => res.status(200).json({ success: true })),
}));

vi.mock("@/common/utils/httpHandlers", () => ({
  validateRequest: () => (req: any, res: any, next: any) => next(),
}));

describe("Auth Router", () => {
  let app: Express;

  beforeEach(() => {
    vi.resetAllMocks();
    app = express();
    app.use(express.json());
    app.use("/auth", authRouter);
  });

  it("should route POST /auth/signup to createUser controller", async () => {
    const payload = {
      name: "testuser",
      email: "test@example.com",
      password: "password123",
    };

    await request(app).post("/auth/signup").send(payload).expect(201);

    expect(authController.createUser).toHaveBeenCalledTimes(1);
  });

  it("should route POST /auth/login to login controller", async () => {
    const payload = {
      name: "testuser",
      password: "password123",
    };

    await request(app).post("/auth/login").send(payload).expect(200);

    expect(authController.login).toHaveBeenCalledTimes(1);
  });

  it("should route GET /auth/user to getUserInfo controller", async () => {
    await request(app).get("/auth/user").expect(200);

    expect(authController.getUserInfo).toHaveBeenCalledTimes(1);
  });

  it("should route POST /auth/signout to signout controller", async () => {
    await request(app).post("/auth/signout").send({}).expect(200);

    expect(authController.signout).toHaveBeenCalledTimes(1);
  });
});
