import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserModeStateProvider, UserModeState } from "../UserModeProvider";
import { useContext } from "react";

const TestComponent = () => {
  const { userMode, setUserMode } = useContext(UserModeState);

  return (
    <div>
      <div data-testid="mode-display">{userMode}</div>
      <button
        onClick={() => setUserMode("employee")}
        data-testid="set-employee-mode"
      >
        Set Employee Mode
      </button>
      <button onClick={() => setUserMode("guest")} data-testid="set-guest-mode">
        Set Guest Mode
      </button>
    </div>
  );
};

describe("UserModeStateProvider", () => {
  it("should have initial value set to guest", () => {
    render(
      <UserModeStateProvider>
        <TestComponent />
      </UserModeStateProvider>,
    );

    expect(screen.getByTestId("mode-display").textContent).toBe("guest");
  });

  it("should update the user mode when setUserMode is called", async () => {
    const user = userEvent.setup();
    render(
      <UserModeStateProvider>
        <TestComponent />
      </UserModeStateProvider>,
    );

    expect(screen.getByTestId("mode-display").textContent).toBe("guest");
    await user.click(screen.getByTestId("set-employee-mode"));
    expect(screen.getByTestId("mode-display").textContent).toBe("employee");

    await user.click(screen.getByTestId("set-guest-mode"));
    expect(screen.getByTestId("mode-display").textContent).toBe("guest");
  });
});
