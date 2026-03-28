import { test, expect } from "@playwright/test";

test.describe("Sidebar collapse/expand", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector('[aria-label="Workspace navigation"]');
  });

  test("Cmd+B toggles sidebar collapsed state", async ({ page }) => {
    const sidebar = page.locator('[data-slot="sidebar"]');
    await expect(sidebar).toHaveAttribute("data-state", "expanded");

    await page.keyboard.press("Meta+b");
    await expect(sidebar).toHaveAttribute("data-state", "collapsed");

    await page.keyboard.press("Meta+b");
    await expect(sidebar).toHaveAttribute("data-state", "expanded");
  });

  test("trigger button toggles sidebar", async ({ page }) => {
    const trigger = page.getByRole("button", { name: "Toggle sidebar" });
    const sidebar = page.locator('[data-slot="sidebar"]');

    await expect(sidebar).toHaveAttribute("data-state", "expanded");

    await trigger.click();
    await expect(sidebar).toHaveAttribute("data-state", "collapsed");

    await trigger.click();
    await expect(sidebar).toHaveAttribute("data-state", "expanded");
  });

  test("collapsed sidebar shows emoji avatars that expand on click", async ({ page }) => {
    const sidebar = page.locator('[data-slot="sidebar"]');

    await page.keyboard.press("Meta+b");
    await expect(sidebar).toHaveAttribute("data-state", "collapsed");

    const avatarButtons = sidebar.locator("button.rounded-full");
    const count = await avatarButtons.count();
    expect(count).toBeGreaterThan(0);

    await avatarButtons.first().click();
    await expect(sidebar).toHaveAttribute("data-state", "expanded");
  });
});
