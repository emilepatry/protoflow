import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useProjectStore } from "@/sandbox/store";

describe("useProjectStore", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("initializes with default project", () => {
    const { result } = renderHook(() => useProjectStore());
    expect(Object.keys(result.current.project.screens).length).toBeGreaterThan(0);
    expect(result.current.mode).toBe("wireflow");
  });

  describe("removeSticky", () => {
    it("removes a sticky from the project", () => {
      const { result } = renderHook(() => useProjectStore());
      const stickyIds = Object.keys(result.current.project.stickies);
      expect(stickyIds.length).toBeGreaterThan(0);

      const idToRemove = stickyIds[0];

      act(() => {
        result.current.removeSticky(idToRemove);
      });

      expect(result.current.project.stickies[idToRemove]).toBeUndefined();
    });

    it("handles non-existent ID gracefully", () => {
      const { result } = renderHook(() => useProjectStore());
      const countBefore = Object.keys(result.current.project.stickies).length;

      act(() => {
        result.current.removeSticky("sticky-nonexistent");
      });

      expect(Object.keys(result.current.project.stickies).length).toBe(countBefore);
    });

    it("results in empty stickies after removing all", () => {
      const { result } = renderHook(() => useProjectStore());

      act(() => {
        for (const id of Object.keys(result.current.project.stickies)) {
          result.current.removeSticky(id);
        }
      });

      expect(Object.keys(result.current.project.stickies).length).toBe(0);
    });
  });

  describe("addEdge guards", () => {
    it("rejects self-loop edges (source === target)", () => {
      const { result } = renderHook(() => useProjectStore());
      const edgeCountBefore = Object.keys(result.current.project.edges).length;

      act(() => {
        result.current.addEdge({
          source: "screen-home",
          target: "screen-home",
          trigger: "Self loop",
        });
      });

      expect(Object.keys(result.current.project.edges).length).toBe(edgeCountBefore);
    });

    it("rejects duplicate edges between the same source and target", () => {
      const { result } = renderHook(() => useProjectStore());

      act(() => {
        result.current.addEdge({
          source: "screen-home",
          target: "screen-cart",
          trigger: "First edge",
        });
      });
      const afterFirst = Object.keys(result.current.project.edges).length;

      act(() => {
        result.current.addEdge({
          source: "screen-home",
          target: "screen-cart",
          trigger: "Duplicate edge",
        });
      });

      expect(Object.keys(result.current.project.edges).length).toBe(afterFirst);
    });

    it("allows valid new edges between different screens", () => {
      const { result } = renderHook(() => useProjectStore());
      const edgeCountBefore = Object.keys(result.current.project.edges).length;

      act(() => {
        result.current.addEdge({
          source: "screen-catalog",
          target: "screen-cart",
          trigger: "Add to cart",
        });
      });

      expect(Object.keys(result.current.project.edges).length).toBe(edgeCountBefore + 1);
    });
  });

  describe("localStorage persistence", () => {
    it("persists project across store recreations", () => {
      const { result, unmount } = renderHook(() => useProjectStore());

      act(() => {
        result.current.updateMeta({ name: "Persisted Name" });
      });

      unmount();

      const { result: result2 } = renderHook(() => useProjectStore());
      expect(result2.current.project.meta.name).toBe("Persisted Name");
    });
  });
});
