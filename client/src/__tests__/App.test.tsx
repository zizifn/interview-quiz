import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "../App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as hooks from "../lib/hooks";

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

describe("App Component", () => {
  test("renders loading skeleton when query is pending", () => {
    vi.spyOn(hooks, "useUser").mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
      error: null,
    } as any);

    render(<App />, { wrapper: createWrapper() });
    
    expect(screen.getByTestId("skeleton-card")).toBeDefined();
  });

  test("renders auth form when user is not logged in", () => {
    vi.spyOn(hooks, "useUser").mockReturnValue({
      data: undefined,
      isPending: false,
      isError: false,
      error: null,
    } as any);

    render(<App />, { wrapper: createWrapper() });
    
    expect(screen.getByTestId("auth-form")).toBeDefined();
  });

  test("renders guest view for non-employee users", () => {

    vi.spyOn(hooks, "useUser").mockReturnValue({
      data: { username: "testuser", is_employee: false } ,
      isPending: false,
      isError: false,
      error: null,
    } as any);

    render(<App />, { wrapper: createWrapper() });

    expect(screen.getByText(/testuser/i)).toBeDefined();
    
    expect(screen.getByTestId("guest-view")).toBeDefined();
  });

  test("renders employee view for employee users", () => {

    vi.spyOn(hooks, "useUser").mockReturnValue({
      data: { username: "employee123", is_employee: true },
      isPending: false,
      isError: false,
      error: null,
    } as any);

    render(<App />, { wrapper: createWrapper() });
  
    expect(screen.getByText(/employee123/i)).toBeDefined();
    expect(screen.getByTestId("employee-view")).toBeDefined();
  });
});