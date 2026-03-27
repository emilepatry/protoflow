import { describe, it, expect } from "vitest";
import { screenRegistry, getScreenComponent, getAvailableScreenIds } from "@/sandbox/registry";

describe("screenRegistry", () => {
  it("discovers all screen files from src/screens/", () => {
    const ids = getAvailableScreenIds();
    expect(ids).toContain("home");
    expect(ids).toContain("catalog");
    expect(ids).toContain("cart");
    expect(ids.length).toBe(3);
  });

  it("returns a component for a valid screen ID", () => {
    const component = getScreenComponent("home");
    expect(component).toBeDefined();
    expect(typeof component).toBe("function");
  });

  it("returns undefined for an invalid screen ID", () => {
    const component = getScreenComponent("nonexistent-screen");
    expect(component).toBeUndefined();
  });

  it("populates the registry object with correct keys", () => {
    expect(Object.keys(screenRegistry).sort()).toEqual(["cart", "catalog", "home"]);
  });
});
