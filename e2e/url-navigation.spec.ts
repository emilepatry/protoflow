import { test, expect } from "@playwright/test";

test.describe("URL navigation", () => {
  test("deep link to project activates it", async ({ page }) => {
    await page.goto("/#/projects/fullscript-patient-flow");
    await page.waitForSelector('[role="status"]');

    const contextBar = page.locator('[role="status"]');
    await expect(contextBar).toContainText("Wireflow");
    await expect(contextBar).toContainText("Fullscript Patient Flow");
  });

  test("deep link to component opens sandbox", async ({ page }) => {
    await page.goto("/#/components/button");
    await page.waitForSelector('[role="status"]');

    const contextBar = page.locator('[role="status"]');
    await expect(contextBar).toContainText("Sandbox: button");
  });

  test("navigating to root shows default state", async ({ page }) => {
    await page.goto("/#/projects/fullscript-patient-flow");
    await page.waitForSelector('[role="status"]');

    await page.goto("/");
    await page.waitForSelector('[aria-label="Workspace navigation"]');
  });

  test("invalid hash is handled gracefully", async ({ page }) => {
    await page.goto("/#/invalid/path/here");
    await page.waitForSelector('[aria-label="Workspace navigation"]');
    await expect(page.locator('[aria-label="Protoflow"]')).toBeVisible();
  });
});
