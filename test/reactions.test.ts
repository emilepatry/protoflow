import { describe, it, expect, beforeEach, vi } from "vitest";
import { CollaborationProvider } from "@/sandbox/collaboration";

describe("Variant reactions Y.Map", () => {
  let provider: CollaborationProvider;

  beforeEach(() => {
    provider = new CollaborationProvider("test-project");
  });

  it("starts with no reactions", () => {
    expect(provider.getAllReactions()).toEqual({});
    expect(provider.getReactionsForVariant("primary")).toEqual({});
  });

  it("adds a thumbs-up reaction", () => {
    provider.toggleReaction("primary", "Alice", "up");

    const reactions = provider.getReactionsForVariant("primary");
    expect(reactions).toEqual({ Alice: "up" });
  });

  it("adds a thumbs-down reaction", () => {
    provider.toggleReaction("secondary", "Bob", "down");

    const reactions = provider.getReactionsForVariant("secondary");
    expect(reactions).toEqual({ Bob: "down" });
  });

  it("toggles off when same reaction is sent again", () => {
    provider.toggleReaction("primary", "Alice", "up");
    provider.toggleReaction("primary", "Alice", "up");

    const reactions = provider.getReactionsForVariant("primary");
    expect(reactions).toEqual({});
  });

  it("switches reaction type", () => {
    provider.toggleReaction("primary", "Alice", "up");
    provider.toggleReaction("primary", "Alice", "down");

    const reactions = provider.getReactionsForVariant("primary");
    expect(reactions).toEqual({ Alice: "down" });
  });

  it("isolates reactions per viewer", () => {
    provider.toggleReaction("primary", "Alice", "up");
    provider.toggleReaction("primary", "Bob", "down");

    const reactions = provider.getReactionsForVariant("primary");
    expect(reactions).toEqual({ Alice: "up", Bob: "down" });
  });

  it("isolates reactions per variant", () => {
    provider.toggleReaction("primary", "Alice", "up");
    provider.toggleReaction("secondary", "Alice", "down");

    expect(provider.getReactionsForVariant("primary")).toEqual({ Alice: "up" });
    expect(provider.getReactionsForVariant("secondary")).toEqual({ Alice: "down" });
  });

  it("getAllReactions returns all variants", () => {
    provider.toggleReaction("primary", "Alice", "up");
    provider.toggleReaction("secondary", "Bob", "down");

    const all = provider.getAllReactions();
    expect(all["primary"]).toEqual({ Alice: "up" });
    expect(all["secondary"]).toEqual({ Bob: "down" });
  });

  it("fires change callback on reaction toggle", () => {
    const cb = vi.fn();
    provider.onReactionsChange(cb);

    provider.toggleReaction("primary", "Alice", "up");
    expect(cb).toHaveBeenCalled();
  });

  it("unsubscribes change listener", () => {
    const cb = vi.fn();
    const unsub = provider.onReactionsChange(cb);
    unsub();

    provider.toggleReaction("primary", "Alice", "up");
    expect(cb).not.toHaveBeenCalled();
  });
});
