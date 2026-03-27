import { test, expect } from "@playwright/test";

test.describe("Project switching", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector('[aria-label="Workspace navigation"]');
  });

  test("sidebar shows discovered project", async ({ page }) => {
    const projectItem = page.getByRole("option", { name: /Fullscript Patient Flow/i });
    await expect(projectItem).toBeVisible();
  });

  test("clicking a project activates it and shows wireflow", async ({ page }) => {
    const projectItem = page.getByRole("option", { name: /Fullscript Patient Flow/i });
    await projectItem.click();

    const contextBar = page.locator('[role="status"]');
    await expect(contextBar).toContainText("Wireflow");
    await expect(contextBar).toContainText("Fullscript Patient Flow");
  });

  test("project selection persists in URL hash", async ({ page }) => {
    const projectItem = page.getByRole("option", { name: /Fullscript Patient Flow/i });
    await projectItem.click();

    await expect(page).toHaveURL(/#\/projects\/fullscript-patient-flow/);
  });
});
