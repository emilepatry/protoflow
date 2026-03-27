import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const SCREENSHOTS = path.resolve(import.meta.dirname, "screenshots");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  await page.goto("http://localhost:5173", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  console.log("=== VERIFY ISSUE-001: Comment dots in iPhone frame ===");
  const protoBtn = await page.$("button:has-text('Prototype')");
  await protoBtn.click();
  await page.waitForTimeout(500);

  const commentsBtn = await page.$("button:has-text('Comments')");
  await commentsBtn.click();
  await page.waitForTimeout(300);

  const overlayResult = await page.evaluate(() => {
    const els = document.querySelectorAll("[data-pf-id]");
    const results = [];
    for (const el of els) {
      const parent = el.closest("[data-pf-screen-container]");
      results.push({ pfId: el.getAttribute("data-pf-id"), hasParent: !!parent });
    }
    return results;
  });

  let issue1Fixed = true;
  for (const r of overlayResult) {
    if (!r.hasParent) issue1Fixed = false;
    console.log(`  ${r.pfId}: container found = ${r.hasParent}`);
  }
  console.log(`ISSUE-001: ${issue1Fixed ? "VERIFIED FIXED" : "STILL BROKEN"}`);
  await page.screenshot({ path: path.join(SCREENSHOTS, "verify-001-comments.png") });

  // Exit comments, go back to wireflow
  const exitBtn = await page.$("button:has-text('Exit Comments')");
  if (exitBtn) await exitBtn.click();
  const wireflowBtn = await page.$("button:has-text('Wireflow')");
  await wireflowBtn.click();
  await page.waitForTimeout(500);

  console.log("\n=== VERIFY ISSUE-002: No WebSocket spam ===");
  const wsErrors = consoleErrors.filter(e => e.includes("WebSocket"));
  console.log(`WebSocket errors: ${wsErrors.length}`);
  console.log(`ISSUE-002: ${wsErrors.length === 0 ? "VERIFIED FIXED" : "STILL BROKEN (" + wsErrors.length + " errors)"}`);

  console.log("\n=== VERIFY ISSUE-003: Dropdown close on outside click ===");
  const screenBtn = await page.$("button:has-text('Screen')");
  await screenBtn.click();
  await page.waitForTimeout(200);
  let menu = await page.$('[role="menu"]');
  console.log(`Menu opened: ${!!menu}`);

  await page.click(".react-flow", { position: { x: 400, y: 400 } });
  await page.waitForTimeout(200);
  menu = await page.$('[role="menu"]');
  console.log(`Menu after outside click: ${!!menu}`);
  console.log(`ISSUE-003: ${!menu ? "VERIFIED FIXED" : "STILL BROKEN"}`);
  await page.screenshot({ path: path.join(SCREENSHOTS, "verify-003-dropdown.png") });

  console.log("\n=== VERIFY ISSUE-004: Toolbar at narrow viewport ===");
  await page.setViewportSize({ width: 375, height: 720 });
  await page.waitForTimeout(300);
  const toolbar = await page.$(".flex.h-14");
  const box = await toolbar.boundingBox();
  console.log(`Toolbar height at 375px: ${box.height}px`);
  const overflows = await page.evaluate(() => {
    const el = document.querySelector(".flex.h-14");
    return el ? el.scrollHeight > el.clientHeight : false;
  });
  console.log(`Content overflows: ${overflows}`);
  console.log(`ISSUE-004: ${!overflows ? "VERIFIED FIXED" : "STILL BROKEN"}`);
  await page.screenshot({ path: path.join(SCREENSHOTS, "verify-004-mobile.png") });

  await page.setViewportSize({ width: 1280, height: 720 });

  console.log(`\n=== FINAL CONSOLE HEALTH ===`);
  console.log(`Total console errors: ${consoleErrors.length}`);
  for (const e of consoleErrors) {
    console.log(`  ${e.slice(0, 120)}`);
  }

  await browser.close();
  console.log("\nVerification complete.");
})();
