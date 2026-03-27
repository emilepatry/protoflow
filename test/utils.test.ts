import { describe, it, expect } from "vitest";
import { cn, DEVICE_WIDTH, DEVICE_HEIGHT } from "@/lib/utils";

describe("cn utility", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("resolves Tailwind conflicts (last wins)", () => {
    const result = cn("px-4", "px-6");
    expect(result).toBe("px-6");
  });

  it("returns empty string for no inputs", () => {
    expect(cn()).toBe("");
  });
});

describe("device constants", () => {
  it("has standard mobile dimensions", () => {
    expect(DEVICE_WIDTH).toBe(375);
    expect(DEVICE_HEIGHT).toBe(667);
  });
});
