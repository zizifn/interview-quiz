import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { GuestView } from "../GuestView";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the child components
vi.mock("../Reservationlist", () => ({
  ReservationList: () => (
    <div data-testid="reservation-list">Mocked Reservation List</div>
  ),
}));

vi.mock("../NewReservation", () => ({
  NewReservation: () => (
    <div data-testid="new-reservation">Mocked New Reservation</div>
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

describe("GuestView Component", () => {
  test("renders the GuestView component correctly", () => {
    render(<GuestView />, { wrapper: createWrapper() });

    // Check if the component and its main elements are rendered
    expect(screen.getByTestId("guest-view")).toBeDefined();
    expect(
      screen.getByText("Hilton Restaurants Reservation System"),
    ).toBeDefined();
    expect(screen.getByText("My Reservations")).toBeDefined();
  });

  test("renders the ReservationList with isEmployee=false", () => {
    render(<GuestView />, { wrapper: createWrapper() });

    expect(screen.getByTestId("reservation-list")).toBeDefined();
  });

  test("renders the NewReservation component", () => {
    render(<GuestView />, { wrapper: createWrapper() });

    expect(screen.getByTestId("new-reservation")).toBeDefined();
  });
});
