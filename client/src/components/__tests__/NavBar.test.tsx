import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NavBar from "../NavBar";
import { UserModeState } from "@/store/UserModeProvider";
import { signOut } from "@/lib/http";
import "@testing-library/jest-dom";

// Create a more explicit mock for the http module
vi.mock("@/lib/http", () => {
  return {
    signOut: vi.fn().mockResolvedValue({}),
    queryClient: {
      setQueriesData: vi.fn(),
      clear: vi.fn(),
    },
  };
});

describe("NavBar Component", () => {
  let queryClient: QueryClient;
  let setUserModeMock: ReturnType<typeof vi.fn>;

  // Setup wrapper component for tests
  const wrapper = ({
    children,
    userMode = "guest",
  }: {
    children: React.ReactNode;
    userMode?: string;
  }) => {
    return (
      <QueryClientProvider client={queryClient}>
        <UserModeState.Provider
          value={{ userMode: userMode as any, setUserMode: setUserModeMock }}
        >
          {children}
        </UserModeState.Provider>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    setUserModeMock = vi.fn();

    vi.clearAllMocks();
  });

  it("renders correctly with guest user", () => {
    render(<NavBar username="testuser" isEmployee={false} />, {
      wrapper: (props) => wrapper({ ...props, userMode: "guest" }),
    });

    expect(screen.getByText("testuser (Guest)")).toBeInTheDocument();
    expect(screen.getByText("Employee View")).toBeInTheDocument();
    expect(screen.getByText("Sign out")).toBeInTheDocument();
    expect(screen.getByAltText("Your Company")).toHaveAttribute(
      "src",
      "https://www.hilton.com/modules/assets/svgs/logos/WW.svg",
    );
  });

  it("switches mode from guest to employee", async () => {
    const user = userEvent.setup();
    render(<NavBar username="testuser" isEmployee={false} />, {
      wrapper: (props) => wrapper({ ...props, userMode: "guest" }),
    });

    const switchButton = screen.getByText("Employee View");
    await user.click(switchButton);
    expect(setUserModeMock).toHaveBeenCalledWith("employee");
    expect(signOut).toHaveBeenCalled();
  });

  it("calls sign out when clicking the sign out button", async () => {
    const user = userEvent.setup();
    render(<NavBar username="testuser" isEmployee={false} />, {
      wrapper: (props) => wrapper({ ...props }),
    });

    const signOutButton = screen.getByText("Sign out");
    await user.click(signOutButton);

    expect(signOut).toHaveBeenCalled();
  });

  it("does not display user info when no username is provided", () => {
    render(<NavBar username="" isEmployee={false} />, { wrapper });

    expect(screen.queryByText("(Guest)")).not.toBeInTheDocument();
    expect(screen.queryByText("Sign out")).not.toBeInTheDocument();
  });
});
