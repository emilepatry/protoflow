import { test, expect } from "@playwright/test";

test.describe("localStorage migration", () => {
  test("migrates legacy protoflow-project key to workspace format", async ({ page }) => {
    const legacyProject = JSON.stringify({
      screens: {
        "screen-home": {
          componentId: "home",
          position: { x: 0, y: 0 },
          label: "Home",
        },
      },
      edges: {},
      stickies: {},
      meta: {
        name: "Legacy Project",
        description: "",
        defaultDeviceFrame: "iphone-15",
      },
    });

    await page.goto("/");

    await page.evaluate((data) => {
      localStorage.clear();
      localStorage.setItem("protoflow-project", data);
    }, legacyProject);

    await page.reload();
    await page.waitForSelector('[aria-label="Workspace navigation"]');

    const workspace = await page.evaluate(() => {
      return localStorage.getItem("protoflow-workspace");
    });

    expect(workspace).toBeTruthy();
    const parsed = JSON.parse(workspace!);
    expect(parsed.projectIds).toContain("fullscript-patient-flow");

    const legacyKey = await page.evaluate(() => {
      return localStorage.getItem("protoflow-project");
    });
    expect(legacyKey).toBeNull();
  });
});
