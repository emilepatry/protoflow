import { describe, it, expect, beforeEach, vi } from "vitest";
import { CollaborationProvider } from "@/sandbox/collaboration";

describe("Viewer stickies Y.Map sync", () => {
  let provider: CollaborationProvider;

  beforeEach(() => {
    provider = new CollaborationProvider("test-project");
  });

  it("starts with no viewer stickies", () => {
    expect(provider.getViewerStickies()).toEqual([]);
  });

  it("adds a viewer sticky and retrieves it", () => {
    const id = provider.addViewerSticky({
      position: { x: 100, y: 200 },
      body: "Note from viewer",
      color: "yellow",
      createdBy: "Alice",
    });

    const stickies = provider.getViewerStickies();
    expect(stickies).toHaveLength(1);
    expect(stickies[0].id).toBe(id);
    expect(stickies[0].position).toEqual({ x: 100, y: 200 });
    expect(stickies[0].body).toBe("Note from viewer");
    expect(stickies[0].color).toBe("yellow");
    expect(stickies[0].createdBy).toBe("Alice");
  });

  it("updates sticky position", () => {
    const id = provider.addViewerSticky({
      position: { x: 0, y: 0 },
      body: "",
      color: "blue",
      createdBy: "Bob",
    });

    provider.updateViewerSticky(id, { position: { x: 50, y: 75 } });
    const stickies = provider.getViewerStickies();
    expect(stickies[0].position).toEqual({ x: 50, y: 75 });
  });

  it("updates sticky body", () => {
    const id = provider.addViewerSticky({
      position: { x: 0, y: 0 },
      body: "original",
      color: "green",
      createdBy: "Charlie",
    });

    provider.updateViewerSticky(id, { body: "updated" });
    const stickies = provider.getViewerStickies();
    expect(stickies[0].body).toBe("updated");
  });

  it("viewer can delete their own sticky", () => {
    const id = provider.addViewerSticky({
      position: { x: 0, y: 0 },
      body: "",
      color: "pink",
      createdBy: "Alice",
    });

    provider.removeViewerSticky(id, "Alice");
    expect(provider.getViewerStickies()).toHaveLength(0);
  });

  it("viewer cannot delete another viewer's sticky", () => {
    const id = provider.addViewerSticky({
      position: { x: 0, y: 0 },
      body: "",
      color: "pink",
      createdBy: "Alice",
    });

    provider.removeViewerSticky(id, "Bob");
    expect(provider.getViewerStickies()).toHaveLength(1);
  });

  it("builder can delete any viewer sticky", () => {
    const id = provider.addViewerSticky({
      position: { x: 0, y: 0 },
      body: "",
      color: "yellow",
      createdBy: "Alice",
    });

    provider.removeViewerStickyAsBuilder(id);
    expect(provider.getViewerStickies()).toHaveLength(0);
  });

  it("fires change callback on add", () => {
    const cb = vi.fn();
    provider.onStickiesChange(cb);

    provider.addViewerSticky({
      position: { x: 0, y: 0 },
      body: "",
      color: "yellow",
      createdBy: "Alice",
    });

    expect(cb).toHaveBeenCalled();
  });

  it("fires change callback on delete", () => {
    const id = provider.addViewerSticky({
      position: { x: 0, y: 0 },
      body: "",
      color: "yellow",
      createdBy: "Alice",
    });

    const cb = vi.fn();
    provider.onStickiesChange(cb);
    provider.removeViewerStickyAsBuilder(id);

    expect(cb).toHaveBeenCalled();
  });

  it("unsubscribes change listener", () => {
    const cb = vi.fn();
    const unsub = provider.onStickiesChange(cb);
    unsub();

    provider.addViewerSticky({
      position: { x: 0, y: 0 },
      body: "",
      color: "yellow",
      createdBy: "Alice",
    });

    expect(cb).not.toHaveBeenCalled();
  });

  it("ignores update on non-existent sticky", () => {
    provider.updateViewerSticky("vsticky-nonexistent", { body: "oops" });
    expect(provider.getViewerStickies()).toEqual([]);
  });

  it("ignores delete on non-existent sticky", () => {
    provider.removeViewerSticky("vsticky-nonexistent", "Alice");
    expect(provider.getViewerStickies()).toEqual([]);
  });
});
