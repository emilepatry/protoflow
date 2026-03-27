// Regression: Sprint 2 — CollaborationProvider.onStatusChange
// Tests status subscription and unsubscription
import { describe, it, expect, vi } from "vitest";
import { CollaborationProvider } from "@/sandbox/collaboration";

describe("CollaborationProvider.onStatusChange", () => {
  it("returns a no-op unsubscribe when no provider is connected", () => {
    const collab = new CollaborationProvider("test-project");
    const cb = vi.fn();
    const unsub = collab.onStatusChange(cb);

    expect(typeof unsub).toBe("function");
    unsub();
    expect(cb).not.toHaveBeenCalled();
  });

  it("handles destroy cleanly without prior connect", () => {
    const collab = new CollaborationProvider("test-project");
    const cb = vi.fn();
    collab.onStatusChange(cb);
    collab.destroy();
    expect(cb).not.toHaveBeenCalled();
  });
});
