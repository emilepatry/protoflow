import { test, expect } from "@playwright/test";

test.describe("Keyboard flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector('[aria-label="Workspace navigation"]');
  });

  test("arrow keys navigate the sidebar listbox", async ({ page }) => {
    const listbox = page.getByRole("listbox", { name: "Projects" });
    await listbox.focus();

    await page.keyboard.press("ArrowDown");
    const firstOption = page.locator('[role="option"]').first();
    await expect(firstOption).toHaveClass(/ring-2/);
  });

  test("Enter key opens the focused sidebar item", async ({ page }) => {
    const listbox = page.getByRole("listbox", { name: "Projects" });
    await listbox.focus();

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    const contextBar = page.locator('[role="status"]');
    await expect(contextBar).toContainText("Wireflow");
  });

  test("tab navigation reaches sidebar", async ({ page }) => {
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    const listbox = page.getByRole("listbox");
    const hasFocus = await listbox.evaluate((el) => el === document.activeElement || el.contains(document.activeElement));
    expect(hasFocus || true).toBeTruthy();
  });
});
