import { test, expect } from "@playwright/test";

test.describe("Prototype auto-collapse", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector('[aria-label="Workspace navigation"]');
  });

  test("entering prototype mode auto-collapses sidebar", async ({ page }) => {
    const sidebar = page.locator('[data-slot="sidebar"]');
    await expect(sidebar).toHaveAttribute("data-state", "expanded");

    const projectButton = page.locator('[data-sidebar="menu-button"]').first();
    await projectButton.click();

    const screenNode = page.locator(".react-flow__node").first();
    await screenNode.dblclick();

    await expect(sidebar).toHaveAttribute("data-state", "collapsed");
  });
});
