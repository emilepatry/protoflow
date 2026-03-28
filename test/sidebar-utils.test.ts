import { describe, it, expect } from "vitest";
import { hashString, getEmoji, getBgColor, formatSlug, EMOJI_PALETTE, BG_PALETTE } from "@/lib/sidebar-utils";

describe("sidebar-utils", () => {
  describe("hashString", () => {
    it("returns a non-negative integer for any string", () => {
      expect(hashString("hello")).toBeGreaterThanOrEqual(0);
      expect(hashString("")).toBeGreaterThanOrEqual(0);
      expect(hashString("a-very-long-project-name-with-dashes")).toBeGreaterThanOrEqual(0);
    });

    it("returns the same hash for the same input", () => {
      expect(hashString("project-a")).toBe(hashString("project-a"));
    });

    it("returns different hashes for different inputs", () => {
      expect(hashString("project-a")).not.toBe(hashString("project-b"));
    });
  });

  describe("getEmoji", () => {
    it("returns a string from the EMOJI_PALETTE", () => {
      const emoji = getEmoji("test-project");
      expect(EMOJI_PALETTE).toContain(emoji);
    });

    it("returns a stable emoji for the same name", () => {
      expect(getEmoji("my-project")).toBe(getEmoji("my-project"));
    });
  });

  describe("getBgColor", () => {
    it("returns a CSS variable reference from BG_PALETTE", () => {
      const color = getBgColor("test-project");
      expect(BG_PALETTE).toContain(color);
    });

    it("returns a stable color for the same name", () => {
      expect(getBgColor("my-project")).toBe(getBgColor("my-project"));
    });
  });

  describe("formatSlug", () => {
    it("capitalises each word separated by dashes", () => {
      expect(formatSlug("my-cool-project")).toBe("My Cool Project");
    });

    it("handles single-word slugs", () => {
      expect(formatSlug("dashboard")).toBe("Dashboard");
    });

    it("handles empty string", () => {
      expect(formatSlug("")).toBe("");
    });
  });
});
