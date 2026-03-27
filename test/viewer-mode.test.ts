import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { isViewerMode } from "@/lib/router";

describe("isViewerMode", () => {
  let originalSearch: string;

  beforeEach(() => {
    originalSearch = window.location.search;
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      value: { ...window.location, search: originalSearch },
      writable: true,
    });
  });

  it("returns false when no viewer param", () => {
    Object.defineProperty(window, "location", {
      value: { ...window.location, search: "" },
      writable: true,
    });
    expect(isViewerMode()).toBe(false);
  });

  it("returns true when viewer param present", () => {
    Object.defineProperty(window, "location", {
      value: { ...window.location, search: "?viewer" },
      writable: true,
    });
    expect(isViewerMode()).toBe(true);
  });

  it("returns true when viewer param present with other params", () => {
    Object.defineProperty(window, "location", {
      value: { ...window.location, search: "?foo=bar&viewer" },
      writable: true,
    });
    expect(isViewerMode()).toBe(true);
  });

  it("returns true when viewer=true", () => {
    Object.defineProperty(window, "location", {
      value: { ...window.location, search: "?viewer=true" },
      writable: true,
    });
    expect(isViewerMode()).toBe(true);
  });
});
