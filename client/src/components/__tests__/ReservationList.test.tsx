import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ReservationList } from "../Reservationlist";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as httpModule from "@/lib/http";
import "@testing-library/jest-dom/vitest";

// Mock dependencies
vi.mock("../ui/alert", () => ({
  Alert: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert">{children}</div>
  ),
  AlertDescription: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-description">{children}</div>
  ),
}));

vi.mock("../EditReservation", () => ({
  EditReservation: () => (
    <div data-testid="edit-reservation">Edit Reservation</div>
  ),
}));

vi.mock("../CancelReservation", () => ({
  CancelReservation: ({ action }: { action: string }) => (
    <div data-testid={`cancel-reservation-${action}`}>
      Cancel Reservation {action}
    </div>
  ),
}));

describe("ReservationList Component", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  it("should show loading state", async () => {
    vi.spyOn(httpModule, "getReservation").mockImplementation(
      () => new Promise(() => {}), // Never resolving promise to keep loading state
    );

    render(<ReservationList isEmployee={false} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByTestId("alert-description")).toHaveTextContent(
      "loading reservation data",
    );
  });

  it("should show error message when fetch fails", async () => {
    const errorMessage = "Failed to fetch reservations";
    vi.spyOn(httpModule, "getReservation").mockRejectedValue(
      new Error(errorMessage),
    );

    render(<ReservationList isEmployee={false} />, {
      wrapper: createWrapper(),
    });

    waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it("should show no data message when no reservations", async () => {
    vi.spyOn(httpModule, "getReservation").mockResolvedValue([]);

    render(<ReservationList isEmployee={false} />, {
      wrapper: createWrapper(),
    });

    // Wait for the no data message
    expect(await screen.findByTestId("alert-description")).toHaveTextContent(
      "No reservation data",
    );
  });

  it("should render reservation table when data is available", async () => {
    const mockReservations = [
      {
        createAt: 1742390441338,
        guestEmail: "james10@a.com",
        guestName: "james10",
        id: "b7da5f8b-38fd-47eb-a033-c77b332453be",
        reservationDateTime: 1741666980000,
        restaurantInfo: {
          address:
            "No. 1 Kong Gang 8th Road, Changning District, Shanghai, 200335, China",
          id: "f225cf45-0c44-40ea-8d29-0be756626dcf",
          name: "Hilton Shanghai Hongqiao International Airport",
        },
        specialRequests: "",
        status: "confirmed",
        tableInfo: {
          id: "55d0e558-16f0-4b39-8e77-77745f435596",
          size: 1,
        },
        type: "reservation",
        updatedAt: 1742390487155,
      },
    ];

    vi.spyOn(httpModule, "getReservation").mockResolvedValue(mockReservations);

    render(<ReservationList isEmployee={false} />, {
      wrapper: createWrapper(),
    });

    expect(await screen.findByText("james10")).toBeInTheDocument();
    expect(screen.getByText("james10@a.com")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByTestId("edit-reservation")).toBeInTheDocument();
    expect(screen.getByTestId("cancel-reservation-cancel")).toBeInTheDocument();
    expect(
      screen.queryByTestId("cancel-reservation-complete"),
    ).not.toBeInTheDocument();
  });

  it("should render employee actions when isEmployee is true", async () => {
    const mockReservations = [
      {
        id: "1",
        guestName: "John Doe",
        guestEmail: "john@example.com",
        reservationDateTime: "2023-06-01T18:00:00.000Z",
        tableInfo: { size: 4 },
        status: "confirmed",
      },
    ];

    vi.spyOn(httpModule, "getReservation").mockResolvedValue(
      mockReservations as any,
    );

    render(<ReservationList isEmployee={true} />, {
      wrapper: createWrapper(),
    });

    // Wait for the component to render with data
    expect(await screen.findByText("John Doe")).toBeInTheDocument();
    // Employee-only action should be present
    expect(
      screen.getByTestId("cancel-reservation-complete"),
    ).toBeInTheDocument();
  });
});
