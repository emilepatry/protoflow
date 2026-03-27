import { test, expect } from "@playwright/test";

test.describe("Sidebar collapse/expand", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector('[aria-label="Workspace navigation"]');
  });

  test("Cmd+B toggles sidebar collapsed state", async ({ page }) => {
    const sidebar = page.locator('[aria-label="Workspace navigation"]');
    const collapseBtn = page.getByRole("button", { name: "Collapse sidebar" });
    await expect(collapseBtn).toBeVisible();

    await page.keyboard.press("Meta+b");

    const expandBtn = page.getByRole("button", { name: "Expand sidebar" });
    await expect(expandBtn).toBeVisible();

    await page.keyboard.press("Meta+b");
    await expect(collapseBtn).toBeVisible();
  });

  test("collapse button collapses sidebar", async ({ page }) => {
    const collapseBtn = page.getByRole("button", { name: "Collapse sidebar" });
    await collapseBtn.click();

    const expandBtn = page.getByRole("button", { name: "Expand sidebar" });
    await expect(expandBtn).toBeVisible();
  });

  test("expand button expands sidebar", async ({ page }) => {
    const collapseBtn = page.getByRole("button", { name: "Collapse sidebar" });
    await collapseBtn.click();

    const expandBtn = page.getByRole("button", { name: "Expand sidebar" });
    await expandBtn.click();

    await expect(page.getByRole("button", { name: "Collapse sidebar" })).toBeVisible();
  });
});
