import { test, expect } from "@playwright/test";

test.describe("Project switching", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector('[aria-label="Workspace navigation"]');
  });

  test("sidebar shows discovered project", async ({ page }) => {
    const projectButton = page.locator('[data-sidebar="menu-button"]', {
      hasText: /Fullscript Patient Flow/i,
    });
    await expect(projectButton).toBeVisible();
  });

  test("clicking a project activates it and shows wireflow", async ({ page }) => {
    const projectButton = page.locator('[data-sidebar="menu-button"]', {
      hasText: /Fullscript Patient Flow/i,
    });
    await projectButton.click();

    const contextBar = page.locator('[role="status"]');
    await expect(contextBar).toContainText("Wireflow");
    await expect(contextBar).toContainText("Fullscript Patient Flow");
  });

  test("project selection persists in URL hash", async ({ page }) => {
    const projectButton = page.locator('[data-sidebar="menu-button"]', {
      hasText: /Fullscript Patient Flow/i,
    });
    await projectButton.click();

    await expect(page).toHaveURL(/#\/projects\/fullscript-patient-flow/);
  });
});
