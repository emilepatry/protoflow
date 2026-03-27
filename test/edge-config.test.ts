import { describe, it, expect } from "vitest";
import { edgeColors, edgeBadgeStyles } from "@/lib/edge-config";
import type { EdgeType } from "@/types";

const allTypes: EdgeType[] = ["navigation", "conditional", "back"];

describe("edgeColors", () => {
  it("has entries for all 3 edge types", () => {
    for (const type of allTypes) {
      expect(edgeColors[type]).toBeDefined();
      expect(typeof edgeColors[type]).toBe("string");
    }
  });

  it("uses CSS variable references", () => {
    for (const type of allTypes) {
      expect(edgeColors[type]).toMatch(/var\(--color-edge-/);
    }
  });
});

describe("edgeBadgeStyles", () => {
  it("has entries for all 3 edge types", () => {
    for (const type of allTypes) {
      expect(edgeBadgeStyles[type]).toBeDefined();
      expect(edgeBadgeStyles[type]).toHaveProperty("background");
      expect(edgeBadgeStyles[type]).toHaveProperty("color");
      expect(edgeBadgeStyles[type]).toHaveProperty("borderColor");
    }
  });
});
