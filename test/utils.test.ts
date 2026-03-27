import { describe, it, expect, vi } from "vitest";
import { cn, DEVICE_WIDTH, DEVICE_HEIGHT, safeGetItem, safeSetItem } from "@/lib/utils";

describe("cn utility", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("resolves Tailwind conflicts (last wins)", () => {
    const result = cn("px-4", "px-6");
    expect(result).toBe("px-6");
  });

  it("returns empty string for no inputs", () => {
    expect(cn()).toBe("");
  });
});

describe("device constants", () => {
  it("has standard mobile dimensions", () => {
    expect(DEVICE_WIDTH).toBe(375);
    expect(DEVICE_HEIGHT).toBe(667);
  });
});

describe("safeGetItem", () => {
  it("returns value from localStorage", () => {
    localStorage.setItem("test-key", "test-value");
    expect(safeGetItem("test-key")).toBe("test-value");
    localStorage.removeItem("test-key");
  });

  it("returns null when localStorage throws", () => {
    const spy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    expect(safeGetItem("any-key")).toBeNull();
    spy.mockRestore();
  });
});

describe("safeSetItem", () => {
  it("writes value to localStorage", () => {
    safeSetItem("safe-test", "hello");
    expect(localStorage.getItem("safe-test")).toBe("hello");
    localStorage.removeItem("safe-test");
  });

  it("does not throw when localStorage is full", () => {
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(() => safeSetItem("key", "value")).not.toThrow();
    expect(warnSpy).toHaveBeenCalledOnce();
    spy.mockRestore();
    warnSpy.mockRestore();
  });
});
