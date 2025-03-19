import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmployeeView } from "../EmployeeView";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the ReservationList component
vi.mock("../Reservationlist", () => ({
  ReservationList: ({ isEmployee }: { isEmployee: boolean }) => (
    <div data-testid="reservation-list" data-is-employee={isEmployee}>
      Mocked Reservation List
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

describe("EmployeeView Component", () => {
  test("renders correctly with the employee view title", () => {
    render(<EmployeeView />, { wrapper: createWrapper() });

    expect(screen.getByTestId("employee-view")).toBeDefined();
    expect(
      screen.getByText("Hilton Restaurants Reservation System (Employee View)"),
    ).toBeDefined();
  });

  test("displays the reservations section header", () => {
    render(<EmployeeView />, { wrapper: createWrapper() });

    expect(screen.getByText("All Guests Reservations")).toBeDefined();
  });

  test("includes the ReservationList with isEmployee prop set to true", () => {
    render(<EmployeeView />, { wrapper: createWrapper() });

    const reservationList = screen.getByTestId("reservation-list");
    expect(reservationList).toBeDefined();
    expect(reservationList.getAttribute("data-is-employee")).toBe("true");
  });
});
