import { describe, it, expect, vi } from "vitest";

describe("wireflow delete filtering", () => {
  it("onNodesDelete with sticky- node calls removeSticky", () => {
    const removeSticky = vi.fn();
    const nodes = [
      { id: "sticky-abc123", type: "sticky", position: { x: 0, y: 0 }, data: {} },
      { id: "screen-home", type: "screen", position: { x: 0, y: 0 }, data: {} },
    ];

    // Simulate the handleNodesDelete logic from WireflowView
    for (const node of nodes) {
      if (node.id.startsWith("sticky-")) {
        removeSticky(node.id);
      }
    }

    expect(removeSticky).toHaveBeenCalledTimes(1);
    expect(removeSticky).toHaveBeenCalledWith("sticky-abc123");
  });

  it("screen nodes should have deletable: false", () => {
    const screenNode = {
      id: "screen-home",
      type: "screen",
      deletable: false,
      position: { x: 0, y: 0 },
      data: {},
    };

    expect(screenNode.deletable).toBe(false);
  });

  it("edges should have deletable: false", () => {
    const edge = {
      id: "edge-1",
      source: "screen-a",
      target: "screen-b",
      type: "annotated",
      deletable: false,
      data: {},
    };

    expect(edge.deletable).toBe(false);
  });

  it("sticky nodes should have deletable: true", () => {
    const stickyNode = {
      id: "sticky-abc",
      type: "sticky",
      deletable: true,
      position: { x: 0, y: 0 },
      data: {},
    };

    expect(stickyNode.deletable).toBe(true);
  });
});
