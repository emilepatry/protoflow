import { describe, it, expect, beforeEach } from "vitest";
import { CollaborationProvider } from "@/sandbox/collaboration";

describe("Input validation", () => {
  let provider: CollaborationProvider;

  beforeEach(() => {
    provider = new CollaborationProvider("test-project");
  });

  describe("malformed sticky data", () => {
    it("handles empty body", () => {
      const id = provider.addViewerSticky({
        position: { x: 0, y: 0 },
        body: "",
        color: "yellow",
        createdBy: "Alice",
      });
      const stickies = provider.getViewerStickies();
      expect(stickies).toHaveLength(1);
      expect(stickies[0].body).toBe("");
      expect(stickies[0].id).toBe(id);
    });

    it("update on non-existent sticky is a no-op", () => {
      provider.updateViewerSticky("vsticky-bogus", { body: "test" });
      expect(provider.getViewerStickies()).toEqual([]);
    });

    it("delete on non-existent sticky is a no-op", () => {
      provider.removeViewerSticky("vsticky-bogus", "Alice");
      expect(provider.getViewerStickies()).toEqual([]);
    });

    it("builder delete on non-existent sticky is a no-op", () => {
      provider.removeViewerStickyAsBuilder("vsticky-bogus");
      expect(provider.getViewerStickies()).toEqual([]);
    });
  });

  describe("invalid reaction values", () => {
    it("only includes valid reaction types in getAllReactions", () => {
      provider.toggleReaction("primary", "Alice", "up");
      const reactions = provider.getAllReactions();
      const values = Object.values(reactions["primary"]);
      for (const val of values) {
        expect(["up", "down"]).toContain(val);
      }
    });

    it("toggle with same type removes reaction", () => {
      provider.toggleReaction("primary", "Alice", "up");
      provider.toggleReaction("primary", "Alice", "up");
      expect(provider.getReactionsForVariant("primary")).toEqual({});
    });

    it("reactions for unknown variant returns empty object", () => {
      expect(provider.getReactionsForVariant("nonexistent")).toEqual({});
    });
  });

  describe("viewer name edge cases", () => {
    it("viewer sticky preserves createdBy through round-trip", () => {
      provider.addViewerSticky({
        position: { x: 0, y: 0 },
        body: "",
        color: "yellow",
        createdBy: "User with spaces",
      });
      const stickies = provider.getViewerStickies();
      expect(stickies[0].createdBy).toBe("User with spaces");
    });

    it("null viewerName cannot delete stickies via removeViewerSticky", () => {
      const id = provider.addViewerSticky({
        position: { x: 0, y: 0 },
        body: "",
        color: "yellow",
        createdBy: "Alice",
      });
      provider.removeViewerSticky(id, null);
      expect(provider.getViewerStickies()).toHaveLength(1);
    });
  });
});
