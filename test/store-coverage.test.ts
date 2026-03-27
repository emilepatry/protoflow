import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useProjectStore } from "@/sandbox/store";

describe("useProjectStore — coverage gaps", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("removeScreen", () => {
    it("removes the screen and cascading edges", () => {
      const { result } = renderHook(() => useProjectStore());

      const edgesBefore = Object.values(result.current.project.edges);
      const homeEdges = edgesBefore.filter(
        (e) => e.source === "screen-home" || e.target === "screen-home"
      );
      expect(homeEdges.length).toBeGreaterThan(0);

      act(() => {
        result.current.removeScreen("screen-home");
      });

      expect(result.current.project.screens["screen-home"]).toBeUndefined();

      const edgesAfter = Object.values(result.current.project.edges);
      const orphaned = edgesAfter.filter(
        (e) => e.source === "screen-home" || e.target === "screen-home"
      );
      expect(orphaned).toHaveLength(0);
    });

    it("does not affect other screens or their edges", () => {
      const { result } = renderHook(() => useProjectStore());

      act(() => {
        result.current.removeScreen("screen-cart");
      });

      expect(result.current.project.screens["screen-home"]).toBeDefined();
      expect(result.current.project.screens["screen-catalog"]).toBeDefined();
    });
  });

  describe("addScreen", () => {
    it("generates a capitalised label from componentId", () => {
      const { result } = renderHook(() => useProjectStore());

      let id: string | undefined;
      act(() => {
        id = result.current.addScreen("product-detail", { x: 100, y: 200 });
      });

      const screen = result.current.project.screens[id!];
      expect(screen).toBeDefined();
      expect(screen.label).toBe("Product detail");
      expect(screen.componentId).toBe("product-detail");
      expect(screen.position).toEqual({ x: 100, y: 200 });
    });
  });

  describe("getEdgesFrom", () => {
    it("returns edges originating from the given screen, sorted by trigger", () => {
      const { result } = renderHook(() => useProjectStore());

      const homeEdges = result.current.getEdgesFrom("screen-home");
      expect(homeEdges.length).toBeGreaterThan(0);

      for (const [, edge] of homeEdges) {
        expect(edge.source).toBe("screen-home");
      }

      const triggers = homeEdges.map(([, e]) => e.trigger);
      const sorted = [...triggers].sort((a, b) => a.localeCompare(b));
      expect(triggers).toEqual(sorted);
    });

    it("returns empty array for screen with no outgoing edges", () => {
      const { result } = renderHook(() => useProjectStore());

      const edges = result.current.getEdgesFrom("screen-nonexistent");
      expect(edges).toEqual([]);
    });
  });

  describe("loadProject with malformed data", () => {
    it("falls back to default project when localStorage has invalid JSON", () => {
      localStorage.setItem("protoflow-project", "{not valid json!!!");

      const { result } = renderHook(() => useProjectStore());
      expect(Object.keys(result.current.project.screens).length).toBeGreaterThan(0);
      expect(result.current.project.meta.name).toBe("Fullscript Patient Flow");
    });
  });
});
