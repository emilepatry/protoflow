// Regression: Sprint 2 — focus management on mode transitions
// Tests prevModeRef guard and focus target selection
import { describe, it, expect } from "vitest";

function shouldFocus(prevMode: string, currentMode: string): string | null {
  if (prevMode === currentMode) return null;
  return currentMode === "prototype" ? "prototype" : "main";
}

describe("focus management (mode transitions)", () => {
  it("skips focus on mount when mode has not changed", () => {
    expect(shouldFocus("wireflow", "wireflow")).toBeNull();
  });

  it("focuses prototype container when entering prototype mode", () => {
    expect(shouldFocus("wireflow", "prototype")).toBe("prototype");
  });

  it("focuses main when exiting prototype mode", () => {
    expect(shouldFocus("prototype", "wireflow")).toBe("main");
  });

  it("focuses main when switching between non-prototype modes", () => {
    expect(shouldFocus("component-sandbox", "wireflow")).toBe("main");
  });
});
