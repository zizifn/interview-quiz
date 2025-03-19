import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CancelReservation } from "../CancelReservation";
import { updateReservationStatus, queryClient } from "@/lib/http";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the dependencies
vi.mock("@/lib/http", () => ({
  updateReservationStatus: vi.fn(),
  queryClient: {
    invalidateQueries: vi.fn(),
    setQueriesData: vi.fn(),
  },
  ReservationStatus: {
    canceled: "canceled",
    completed: "completed",
  },
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

describe("CancelReservation Component", () => {
  const mockReservationId = "reservation-123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders cancel button when action is "cancel"', () => {
    render(
      <CancelReservation reservationId={mockReservationId} action="cancel" />,
      { wrapper: createWrapper() },
    );

    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it('renders complete button when action is "complete"', () => {
    render(
      <CancelReservation reservationId={mockReservationId} action="complete" />,
      { wrapper: createWrapper() },
    );

    expect(screen.getByText("Complete")).toBeInTheDocument();
  });

  it('calls updateReservationStatus with "canceled" when cancel button is clicked', async () => {
    const mockUpdateFn = updateReservationStatus as Mock;
    mockUpdateFn.mockResolvedValue({ success: true });

    render(
      <CancelReservation reservationId={mockReservationId} action="cancel" />,
      { wrapper: createWrapper() },
    );

    await userEvent.click(screen.getByText("Cancel"));

    expect(mockUpdateFn).toHaveBeenCalledWith(mockReservationId, "canceled");
    await waitFor(() => {
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["reservations"],
      });
      expect(queryClient.setQueriesData).toHaveBeenCalled();
    });
  });

  it('calls updateReservationStatus with "completed" when complete button is clicked', async () => {
    const mockUpdateFn = updateReservationStatus as Mock;
    mockUpdateFn.mockResolvedValue({ success: true });

    render(
      <CancelReservation reservationId={mockReservationId} action="complete" />,
      { wrapper: createWrapper() },
    );

    await userEvent.click(screen.getByText("Complete"));

    expect(mockUpdateFn).toHaveBeenCalledWith(mockReservationId, "completed");
    await waitFor(() => {
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ["reservations"],
      });
      expect(queryClient.setQueriesData).toHaveBeenCalled();
    });
  });

  it('shows "Canceling" text during pending cancel state', async () => {
    const mockUpdateFn = updateReservationStatus as Mock;
    // Create a promise that won't resolve immediately to simulate pending state
    const pendingPromise = new Promise(() => {});
    mockUpdateFn.mockReturnValue(pendingPromise);

    render(
      <CancelReservation reservationId={mockReservationId} action="cancel" />,
      { wrapper: createWrapper() },
    );

    await userEvent.click(screen.getByText("Cancel"));

    expect(screen.getByText("Canceling")).toBeInTheDocument();
  });

  it('shows "Completing" text during pending complete state', async () => {
    const mockUpdateFn = updateReservationStatus as Mock;
    // Create a promise that won't resolve immediately to simulate pending state
    const pendingPromise = new Promise(() => {});
    mockUpdateFn.mockReturnValue(pendingPromise);

    render(
      <CancelReservation reservationId={mockReservationId} action="complete" />,
      { wrapper: createWrapper() },
    );

    await userEvent.click(screen.getByText("Complete"));

    expect(screen.getByText("Completing")).toBeInTheDocument();
  });

  it("displays error dialog when reservation update fails", async () => {
    const mockUpdateFn = updateReservationStatus as Mock;
    mockUpdateFn.mockRejectedValue(new Error("Failed to update reservation"));

    render(
      <CancelReservation reservationId={mockReservationId} action="cancel" />,
      { wrapper: createWrapper() },
    );

    await userEvent.click(screen.getByText("Cancel"));

    await waitFor(() => {
      expect(screen.getByText("Cancel Reservation Failed")).toBeInTheDocument();
      expect(
        screen.getByText("Failed to update reservation"),
      ).toBeInTheDocument();
    });
  });

  it("disables button when no reservationId is provided", () => {
    render(<CancelReservation reservationId="" action="cancel" />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("Cancel")).toBeDisabled();
  });
});
