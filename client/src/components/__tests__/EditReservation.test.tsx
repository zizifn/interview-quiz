import { describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EditReservation } from "../EditReservation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the ReservationInfoForm component
vi.mock("../ReservationInfoForm", () => ({
  ReservationInfoForm: ({ onconfirm }: { onconfirm: () => void }) => (
    <div data-testid="reservation-form">
      <button data-testid="mock-confirm" onClick={onconfirm}>
        Confirm
      </button>
    </div>
  ),
}));

// Create a wrapper with QueryClientProvider for testing
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("EditReservation Component", () => {
  const mockReservation = {
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
  };

  test("renders edit button correctly", () => {
    render(<EditReservation reservation={mockReservation} />, {
      wrapper: createWrapper(),
    });

    const editButton = screen.getByText("Edit");
    expect(editButton).toBeDefined();
  });

  test("opens dialog when edit button is clicked", () => {
    render(<EditReservation reservation={mockReservation} />, {
      wrapper: createWrapper(),
    });

    const editButton = screen.getByText("Edit");
    fireEvent.click(editButton);

    expect(screen.getByText("Update Reservation")).toBeDefined();
    expect(screen.getByTestId("reservation-form")).toBeDefined();
  });

  test("closes dialog when form confirms", async () => {
    render(<EditReservation reservation={mockReservation} />, {
      wrapper: createWrapper(),
    });

    // Open the dialog
    const editButton = screen.getByText("Edit");
    fireEvent.click(editButton);

    expect(screen.getByText("Update Reservation")).toBeDefined();

    // Trigger the onconfirm callback
    const confirmButton = screen.getByTestId("mock-confirm");
    fireEvent.click(confirmButton);

    // Make sure the UI has time to update
    await new Promise((r) => setTimeout(r, 100));

    // Dialog should be closed (form should no longer be visible)
    expect(screen.queryByText("Update Reservation")).toBeNull();
    // Alternative assertion if the previous one doesn't work:
    // expect(document.querySelector('[role="dialog"]')).toBeNull();
  });
});
