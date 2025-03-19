import { describe, it, expect, vi, beforeEach } from "vitest";
import { getRestaurant } from "../restaurantController";
import * as couchbaseModule from "@/db/couchbase";
import * as serviceModule from "../restaurantServices";

// Mock dependencies
vi.mock("@/db/couchbase");
vi.mock("../restaurantServices");

describe("Restaurant Controller", () => {
  const mockRequest = () => {
    return {
      locals: {
        user: { id: "test-user" },
      },
      log: {
        error: vi.fn(),
      },
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
    // Mock the couchbase connection
    vi.mocked(couchbaseModule.getCouchbaseConnection).mockResolvedValue({
      quizScope: { query: vi.fn() },
    } as any);
  });

  it("should return 401 if user is not authenticated", async () => {
    const req = { ...mockRequest(), locals: {} } as any;
    const res = mockResponse();

    await getRestaurant(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
  });

  it("should return 500 if couchbase connection fails", async () => {
    const req = mockRequest() as any;
    const res = mockResponse();

    vi.mocked(couchbaseModule.getCouchbaseConnection).mockResolvedValueOnce({
      quizScope: null,
    } as any);

    await getRestaurant(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Service is unavailable." });
  });

  it("should return 200 and restaurant data on success", async () => {
    const req = mockRequest() as any;
    const res = mockResponse();
    // Mock implementation for controller
    const mockData = [
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

    // Mock the service function
    vi.mocked(serviceModule.getRestaurantService).mockResolvedValueOnce(
      mockData
    );

    await getRestaurant(req, res, mockNext);

    expect(serviceModule.getRestaurantService).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockData);
  });

  it("should return 500 when service throws an error", async () => {
    const req = mockRequest() as any;
    const res = mockResponse();

    // Mock the service to throw an error
    vi.mocked(serviceModule.getRestaurantService).mockRejectedValueOnce(
      new Error("Service error")
    );

    await getRestaurant(req, res, mockNext);

    expect(req.log.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
  });
});
