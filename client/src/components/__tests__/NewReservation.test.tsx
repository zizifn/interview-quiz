import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NewReservation } from "../NewReservation";
import "@testing-library/jest-dom";

// Mock dependencies
vi.mock("../ui/catalyst/dialog", () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-title">{children}</div>
  ),
}));

vi.mock("../ReservationInfoForm", () => ({
  ReservationInfoForm: ({ onconfirm }: { onconfirm: () => void }) => (
    <div data-testid="reservation-form">
      <button data-testid="confirm-button" onClick={onconfirm}>
        Confirm
      </button>
    </div>
  ),
}));

describe("NewReservation Component", () => {
  it("should render create reservation button", () => {
    render(<NewReservation />);

    expect(screen.getByText("Create New Reservation")).toBeInTheDocument();
    expect(screen.queryByTestId("dialog")).not.toBeInTheDocument(); // Dialog should initially be closed
  });

  it("should open dialog when button is clicked", () => {
    render(<NewReservation />);

    // Click the button to open dialog
    fireEvent.click(screen.getByText("Create New Reservation"));

    // Dialog should now be open
    expect(screen.getByTestId("dialog")).toBeInTheDocument();
    expect(screen.getByTestId("dialog-title")).toHaveTextContent(
      "Create New Reservation",
    );
    expect(screen.getByTestId("reservation-form")).toBeInTheDocument();
  });

  it("should close dialog when form confirms", () => {
    render(<NewReservation />);

    // Open dialog
    fireEvent.click(screen.getByText("Create New Reservation"));
    expect(screen.getByTestId("dialog")).toBeInTheDocument();

    // Click confirm button in the form
    fireEvent.click(screen.getByTestId("confirm-button"));

    // Dialog should now be closed
    expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
  });
});
