import { test, expect } from "@playwright/test";

test.describe("Component browsing", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector('[aria-label="Workspace navigation"]');
  });

  test("switches to Components tab and shows library entries", async ({ page }) => {
    const componentsTab = page.getByRole("tab", { name: "Components" });
    await componentsTab.click();

    const buttonEntry = page.getByRole("option", { name: /Button/i });
    await expect(buttonEntry).toBeVisible();
  });

  test("clicking a component opens the sandbox", async ({ page }) => {
    const componentsTab = page.getByRole("tab", { name: "Components" });
    await componentsTab.click();

    const buttonEntry = page.getByRole("option", { name: /Button/i });
    await buttonEntry.click();

    const contextBar = page.locator('[role="status"]');
    await expect(contextBar).toContainText("Sandbox: button");
  });

  test("variant counter shows current position", async ({ page }) => {
    const componentsTab = page.getByRole("tab", { name: "Components" });
    await componentsTab.click();

    const buttonEntry = page.getByRole("option", { name: /Button/i });
    await buttonEntry.click();

    await expect(page.getByText("1 / 6")).toBeVisible();
  });

  test("arrow keys cycle through variants", async ({ page }) => {
    const componentsTab = page.getByRole("tab", { name: "Components" });
    await componentsTab.click();

    const buttonEntry = page.getByRole("option", { name: /Button/i });
    await buttonEntry.click();

    await expect(page.getByText("1 / 6")).toBeVisible();

    await page.keyboard.press("ArrowRight");
    await expect(page.getByText("2 / 6")).toBeVisible();

    await page.keyboard.press("ArrowLeft");
    await expect(page.getByText("1 / 6")).toBeVisible();
  });
});
