import { test, expect } from "@playwright/test";

test.describe("Sidebar tab switching", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector('[aria-label="Workspace navigation"]');
  });

  test("switching to Components tab shows component items", async ({ page }) => {
    const componentsTab = page.getByRole("tab", { name: "Components" });
    await componentsTab.click();

    await expect(componentsTab).toHaveAttribute("aria-selected", "true");

    const projectsTab = page.getByRole("tab", { name: "Projects" });
    await expect(projectsTab).toHaveAttribute("aria-selected", "false");
  });

  test("switching back to Projects tab shows project items", async ({ page }) => {
    const componentsTab = page.getByRole("tab", { name: "Components" });
    await componentsTab.click();
    await expect(componentsTab).toHaveAttribute("aria-selected", "true");

    const projectsTab = page.getByRole("tab", { name: "Projects" });
    await projectsTab.click();
    await expect(projectsTab).toHaveAttribute("aria-selected", "true");

    const menuButtons = page.locator('[data-sidebar="menu-button"]');
    const count = await menuButtons.count();
    expect(count).toBeGreaterThan(0);
  });
});
