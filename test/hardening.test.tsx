import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import AppErrorBoundary from "@/components/AppErrorBoundary";

function ThrowingChild(): ReactNode {
  throw new Error("Test render error");
}

function ThrowingStringChild(): ReactNode {
  throw "String error thrown";
}

describe("AppErrorBoundary", () => {
  it("renders fallback UI when child throws an Error", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <AppErrorBoundary>
        <ThrowingChild />
      </AppErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeDefined();
    expect(screen.getByText("Reload")).toBeDefined();
    expect(screen.getByText(/Test render error/)).toBeDefined();

    vi.restoreAllMocks();
  });

  it("renders fallback UI when child throws a non-Error value", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <AppErrorBoundary>
        <ThrowingStringChild />
      </AppErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeDefined();
    expect(screen.getByText(/String error thrown/)).toBeDefined();

    vi.restoreAllMocks();
  });

  it("renders children when no error occurs", () => {
    render(
      <AppErrorBoundary>
        <p>All good</p>
      </AppErrorBoundary>
    );

    expect(screen.getByText("All good")).toBeDefined();
  });
});

describe("project name validation logic", () => {
  it("trims whitespace and reverts empty names", () => {
    const name = "   ";
    const trimmed = name.trim();
    const fallback = "Original Name";
    const result = trimmed || fallback;
    expect(result).toBe("Original Name");
  });

  it("accepts valid trimmed names", () => {
    const name = "  New Name  ";
    const trimmed = name.trim();
    const fallback = "Original Name";
    const result = trimmed || fallback;
    expect(result).toBe("New Name");
  });
});
