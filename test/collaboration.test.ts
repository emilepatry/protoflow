import { describe, it, expect, beforeEach, vi } from "vitest";
import { CollaborationProvider, getViewerName, setViewerName } from "@/sandbox/collaboration";

describe("CollaborationProvider", () => {
  let provider: CollaborationProvider;

  beforeEach(() => {
    provider = new CollaborationProvider("test-project");
  });

  it("starts with no comments", () => {
    expect(provider.getComments()).toEqual([]);
  });

  it("adds a comment and retrieves it", () => {
    provider.addComment({
      screenId: "screen-home",
      anchorId: "home-title",
      author: "Tester",
      body: "Looks good!",
    });

    const comments = provider.getComments();
    expect(comments).toHaveLength(1);
    expect(comments[0].screenId).toBe("screen-home");
    expect(comments[0].anchorId).toBe("home-title");
    expect(comments[0].author).toBe("Tester");
    expect(comments[0].body).toBe("Looks good!");
    expect(comments[0].id).toMatch(/^comment-/);
    expect(comments[0].createdAt).toBeGreaterThan(0);
  });

  it("filters comments by screen ID", () => {
    provider.addComment({
      screenId: "screen-home",
      anchorId: "home-title",
      author: "A",
      body: "Comment 1",
    });
    provider.addComment({
      screenId: "screen-catalog",
      anchorId: "catalog-title",
      author: "B",
      body: "Comment 2",
    });

    const homeComments = provider.getCommentsForScreen("screen-home");
    expect(homeComments).toHaveLength(1);
    expect(homeComments[0].body).toBe("Comment 1");

    const catalogComments = provider.getCommentsForScreen("screen-catalog");
    expect(catalogComments).toHaveLength(1);
    expect(catalogComments[0].body).toBe("Comment 2");
  });

  it("returns empty array for screen with no comments", () => {
    expect(provider.getCommentsForScreen("screen-nonexistent")).toEqual([]);
  });

  it("sets and retrieves text overrides", () => {
    provider.setTextOverride("screen-home", "home-title", "New Title");
    expect(provider.getTextOverride("screen-home", "home-title")).toBe("New Title");
  });

  it("returns undefined for non-existent text override", () => {
    expect(provider.getTextOverride("screen-home", "missing")).toBeUndefined();
  });

  it("overwrites existing text override", () => {
    provider.setTextOverride("screen-home", "title", "First");
    provider.setTextOverride("screen-home", "title", "Second");
    expect(provider.getTextOverride("screen-home", "title")).toBe("Second");
  });

  it("calls comment change callback", () => {
    const cb = vi.fn();
    provider.onCommentsChange(cb);

    provider.addComment({
      screenId: "s",
      anchorId: "a",
      author: "X",
      body: "Y",
    });

    expect(cb).toHaveBeenCalled();
  });

  it("removes comment change listener", () => {
    const cb = vi.fn();
    const unsub = provider.onCommentsChange(cb);
    unsub();

    provider.addComment({
      screenId: "s",
      anchorId: "a",
      author: "X",
      body: "Y",
    });

    expect(cb).not.toHaveBeenCalled();
  });
});

describe("viewer name", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns null when no name is set", () => {
    expect(getViewerName()).toBeNull();
  });

  it("sets and retrieves the viewer name", () => {
    setViewerName("Alice");
    expect(getViewerName()).toBe("Alice");
  });

  it("truncates names longer than 30 characters", () => {
    const longName = "A".repeat(50);
    setViewerName(longName);
    expect(getViewerName()).toBe("A".repeat(30));
  });
});
