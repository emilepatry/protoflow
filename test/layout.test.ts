import { describe, it, expect } from "vitest";
import { computeLayout } from "@/lib/layout";
import type { ScreenConfig, EdgeConfig } from "@/types";

function screen(componentId: string): ScreenConfig {
  return { componentId, position: { x: 0, y: 0 }, label: componentId };
}

describe("computeLayout", () => {
  it("positions a single screen at a reasonable location", () => {
    const screens = { "screen-a": screen("a") };
    const { positions } = computeLayout(screens, {});

    expect(positions["screen-a"]).toBeDefined();
    expect(typeof positions["screen-a"].x).toBe("number");
    expect(typeof positions["screen-a"].y).toBe("number");
  });

  it("arranges a linear chain left-to-right", () => {
    const screens = {
      "screen-a": screen("a"),
      "screen-b": screen("b"),
      "screen-c": screen("c"),
    };
    const edges: Record<string, EdgeConfig> = {
      "edge-1": { source: "screen-a", target: "screen-b", trigger: "go", type: "navigation" },
      "edge-2": { source: "screen-b", target: "screen-c", trigger: "go", type: "navigation" },
    };

    const { positions } = computeLayout(screens, edges);

    expect(positions["screen-a"].x).toBeLessThan(positions["screen-b"].x);
    expect(positions["screen-b"].x).toBeLessThan(positions["screen-c"].x);
  });

  it("stacks branching targets vertically", () => {
    const screens = {
      "screen-a": screen("a"),
      "screen-b": screen("b"),
      "screen-c": screen("c"),
    };
    const edges: Record<string, EdgeConfig> = {
      "edge-1": { source: "screen-a", target: "screen-b", trigger: "go b", type: "navigation" },
      "edge-2": { source: "screen-a", target: "screen-c", trigger: "go c", type: "navigation" },
    };

    const { positions } = computeLayout(screens, edges);

    // B and C should be at the same x (same rank)
    expect(positions["screen-b"].x).toBe(positions["screen-c"].x);
    // But different y (stacked)
    expect(positions["screen-b"].y).not.toBe(positions["screen-c"].y);
  });

  it("handles circular graph without crash", () => {
    const screens = {
      "screen-a": screen("a"),
      "screen-b": screen("b"),
    };
    const edges: Record<string, EdgeConfig> = {
      "edge-1": { source: "screen-a", target: "screen-b", trigger: "go", type: "navigation" },
      "edge-2": { source: "screen-b", target: "screen-a", trigger: "back", type: "back" },
    };

    expect(() => computeLayout(screens, edges)).not.toThrow();

    const { positions } = computeLayout(screens, edges);
    expect(positions["screen-a"]).toBeDefined();
    expect(positions["screen-b"]).toBeDefined();
  });

  it("handles empty screens gracefully", () => {
    const { positions } = computeLayout({}, {});
    expect(Object.keys(positions).length).toBe(0);
  });
});
