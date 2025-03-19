import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SkeletonCard } from "../LoadingSkeleton";
import "@testing-library/jest-dom";

describe("LoadingSkeleton Component", () => {
  it("should render SkeletonCard with correct test id", () => {
    render(<SkeletonCard />);
    const skeletonCard = screen.getByTestId("skeleton-card");
    expect(skeletonCard).toBeInTheDocument();
  });

  it("should render skeleton with proper structure", () => {
    const { container } = render(<SkeletonCard />);

    const mainDiv = screen.getByTestId("skeleton-card");
    expect(mainDiv).toHaveClass("animate-pulse");

    const skeletons = container.querySelectorAll(".h-\\[125px\\]");
    expect(skeletons.length).toBe(1);

    const textSkeletons = container.querySelectorAll(".h-4");
    expect(textSkeletons.length).toBe(2);
  });
});
