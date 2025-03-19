import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AuthForm from "../AuthForm";
import { login, signUp, queryClient } from "@/lib/http";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@testing-library/jest-dom";

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

// Mock the dependencies
vi.mock("@/lib/http", () => ({
  login: vi.fn(),
  signUp: vi.fn(),
  queryClient: {
    setQueryData: vi.fn(),
    invalidateQueries: vi.fn(),
  },
}));

describe("AuthForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders login form by default", () => {
    render(<AuthForm />, { wrapper: createWrapper() });

    expect(screen.getByText("Sign in to your account")).toBeInTheDocument();
    expect(screen.getByLabelText("User Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.queryByLabelText("Email address")).not.toBeInTheDocument();
    expect(screen.getByText("Sign in")).toBeInTheDocument();
  });

  it("switches to signup form when clicking SignUp link", async () => {
    render(<AuthForm />, { wrapper: createWrapper() });

    await userEvent.click(screen.getByText("SignUp"));

    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
    expect(screen.getByText("Sign up")).toBeInTheDocument();
  });

  it("switches back to login form when clicking SignIn link", async () => {
    render(<AuthForm />, { wrapper: createWrapper() });

    await userEvent.click(screen.getByText("SignUp"));
    await userEvent.click(screen.getByText("SignIn"));

    expect(screen.queryByLabelText("Email address")).not.toBeInTheDocument();
    expect(screen.getByText("Sign in")).toBeInTheDocument();
  });

  it("submits login form with correct data", async () => {
    const mockLoginFn = login as Mock;
    mockLoginFn.mockResolvedValue({ success: true });

    render(<AuthForm />, { wrapper: createWrapper() });

    await userEvent.type(screen.getByLabelText("User Name"), "testuser");
    await userEvent.type(screen.getByLabelText("Password"), "password123");
    await userEvent.click(screen.getByText("Sign in"));

    expect(mockLoginFn).toHaveBeenCalledWith("testuser", "password123");
    await waitFor(() => {
      expect(queryClient.setQueryData).toHaveBeenCalledWith(["auth", "user"], {
        username: "testuser",
        password: "password123",
      });
    });
  });

  it("submits signup form with correct data", async () => {
    const mockSignUpFn = signUp as Mock;
    mockSignUpFn.mockResolvedValue({ success: true });

    render(<AuthForm />, { wrapper: createWrapper() });

    // Switch to signup form
    await userEvent.click(screen.getByText("SignUp"));

    await userEvent.type(screen.getByLabelText("User Name"), "newuser");
    await userEvent.type(
      screen.getByLabelText("Email address"),
      "new@example.com",
    );
    await userEvent.type(screen.getByLabelText("Password"), "password123");
    await userEvent.click(screen.getByText("Sign up"));

    expect(mockSignUpFn).toHaveBeenCalledWith({
      username: "newuser",
      email: "new@example.com",
      password: "password123",
    });
  });

  it("displays error message when login fails", async () => {
    const mockLoginFn = login as Mock;
    mockLoginFn.mockRejectedValue(new Error("Invalid credentials"));

    render(<AuthForm />, { wrapper: createWrapper() });

    await userEvent.type(screen.getByLabelText("User Name"), "testuser");
    await userEvent.type(screen.getByLabelText("Password"), "wrongpassword");
    await userEvent.click(screen.getByText("Sign in"));

    await waitFor(() => {
      expect(
        screen.getByText("Unable login, please check username or password!"),
      ).toBeInTheDocument();
    });
  });

  it("displays error message when signup fails", async () => {
    const mockSignUpFn = signUp as Mock;
    mockSignUpFn.mockRejectedValue(new Error("Username already exists"));

    render(<AuthForm />, { wrapper: createWrapper() });

    // Switch to signup form
    await userEvent.click(screen.getByText("SignUp"));

    await userEvent.type(screen.getByLabelText("User Name"), "existinguser");
    await userEvent.type(
      screen.getByLabelText("Email address"),
      "existing@example.com",
    );
    await userEvent.type(screen.getByLabelText("Password"), "password123");
    await userEvent.click(screen.getByText("Sign up"));

    await waitFor(() => {
      expect(screen.getByText("Username already exists")).toBeInTheDocument();
    });
  });
});
