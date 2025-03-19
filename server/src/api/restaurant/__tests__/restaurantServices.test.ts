import { describe, it, expect, vi, beforeEach } from "vitest";
import { getRestaurantService } from "../restaurantServices";

describe("Restaurant Services", () => {
  const mockScope = {
    query: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should return restaurant data when query is successful", async () => {
    // Mock data
    const mockData = {
      rows: [
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
      ],
    };

    // Setup the mock
    mockScope.query.mockResolvedValueOnce(mockData);

    // Call the function
    const result = await getRestaurantService(mockScope as any);

    // Assertions
    expect(mockScope.query).toHaveBeenCalledWith(
      "SELECT r.* FROM restaurant r"
    );
    expect(result).toEqual(mockData.rows);
  });

  it("should throw error when query fails", async () => {
    // Setup the mock to throw an error
    const errorMessage = "Database connection error";
    mockScope.query.mockRejectedValueOnce(new Error(errorMessage));

    // Call and expect error
    await expect(getRestaurantService(mockScope as any)).rejects.toThrow(
      `Error fetching restaurant data: Error: ${errorMessage}`
    );
  });
});
