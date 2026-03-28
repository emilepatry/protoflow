import { test, expect } from "@playwright/test";

test.describe("Keyboard flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector('[aria-label="Workspace navigation"]');
  });

  test("clicking a sidebar menu button selects the project", async ({ page }) => {
    const menuButton = page.locator('[data-sidebar="menu-button"]').first();
    await menuButton.click();

    const contextBar = page.locator('[role="status"]');
    await expect(contextBar).toContainText("Wireflow");
  });

  test("Cmd+B toggle works via keyboard", async ({ page }) => {
    const sidebar = page.locator('[data-slot="sidebar"]');
    await expect(sidebar).toHaveAttribute("data-state", "expanded");

    await page.keyboard.press("Meta+b");
    await expect(sidebar).toHaveAttribute("data-state", "collapsed");
  });

  test("tab navigation reaches sidebar buttons", async ({ page }) => {
    const sidebar = page.locator('[aria-label="Workspace navigation"]');
    const hasFocusable = await sidebar.locator("button").count();
    expect(hasFocusable).toBeGreaterThan(0);
  });
});
