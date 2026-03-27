import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const SCREENSHOTS = path.resolve(import.meta.dirname, "screenshots");
fs.mkdirSync(SCREENSHOTS, { recursive: true });

const findings = [];
const consoleErrors = [];
let findingId = 0;

function addFinding(title, severity, category, details) {
  findingId++;
  findings.push({ id: `ISSUE-${String(findingId).padStart(3, "0")}`, title, severity, category, details });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push({ text: msg.text(), url: page.url(), timestamp: Date.now() });
    }
  });
  page.on("pageerror", (err) => {
    consoleErrors.push({ text: err.message, url: page.url(), timestamp: Date.now(), type: "pageerror" });
  });

  console.log("=== PHASE 1: Initial Load ===");
  await page.goto("http://localhost:5173", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(SCREENSHOTS, "01-initial-load.png"), fullPage: true });
  console.log("Screenshot: 01-initial-load.png");

  // Check if page loaded
  const pageTitle = await page.title();
  console.log(`Page title: ${pageTitle}`);

  // Check toolbar elements
  const toolbar = await page.$(".flex.h-14");
  console.log(`Toolbar visible: ${!!toolbar}`);

  // Check for React Flow canvas
  const reactFlow = await page.$(".react-flow");
  console.log(`React Flow canvas: ${!!reactFlow}`);

  // Check for screen nodes
  const screenNodes = await page.$$(".react-flow__node");
  console.log(`Screen nodes found: ${screenNodes.length}`);

  // Check for edges
  const edges = await page.$$(".react-flow__edge");
  console.log(`Edges found: ${edges.length}`);

  // Check for minimap
  const minimap = await page.$(".react-flow__minimap");
  console.log(`Minimap: ${!!minimap}`);

  // Check for controls
  const controls = await page.$(".react-flow__controls");
  console.log(`Controls: ${!!controls}`);

  console.log("\n=== PHASE 2: Toolbar Interactions ===");

  // Test project name editing
  const projectNameBtn = await page.$("button:has-text('Fullscript Patient Flow')");
  if (projectNameBtn) {
    await projectNameBtn.click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(SCREENSHOTS, "02-name-editing.png"), fullPage: true });
    console.log("Screenshot: 02-name-editing.png (project name editing)");

    const nameInput = await page.$('input.w-40');
    if (nameInput) {
      console.log("Name edit input appeared: YES");
      await nameInput.press("Escape");
      await page.click("body");
    } else {
      console.log("Name edit input appeared: NO");
      addFinding("Project name edit input not appearing on click", "medium", "functional", "Clicking project name doesn't show edit input");
    }
  } else {
    console.log("Project name button not found");
    // Try other selectors
    const allButtons = await page.$$("button");
    for (const btn of allButtons) {
      const text = await btn.textContent();
      if (text && text.includes("Patient")) {
        console.log(`Found button with text: ${text}`);
      }
    }
  }

  // Test "+ Screen" picker
  const screenBtn = await page.$("button:has-text('Screen')");
  if (screenBtn) {
    await screenBtn.click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(SCREENSHOTS, "03-screen-picker.png"), fullPage: true });
    console.log("Screenshot: 03-screen-picker.png (screen picker open)");

    const menuItems = await page.$$('[role="menuitem"]');
    console.log(`Screen picker items: ${menuItems.length}`);

    for (const item of menuItems) {
      const text = await item.textContent();
      console.log(`  - Screen option: ${text}`);
    }

    // Close the picker
    await screenBtn.click();
    await page.waitForTimeout(200);
  }

  // Test "+ Sticky" picker
  const stickyBtn = await page.$("button:has-text('Sticky')");
  if (stickyBtn) {
    await stickyBtn.click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(SCREENSHOTS, "04-sticky-picker.png"), fullPage: true });
    console.log("Screenshot: 04-sticky-picker.png (sticky picker open)");

    const stickyItems = await page.$$('[role="menu"] [role="menuitem"]');
    console.log(`Sticky picker items: ${stickyItems.length}`);

    for (const item of stickyItems) {
      const text = await item.textContent();
      console.log(`  - Sticky option: ${text}`);
    }

    // Close
    await stickyBtn.click();
    await page.waitForTimeout(200);
  }

  // Test adding a sticky
  if (stickyBtn) {
    await stickyBtn.click();
    await page.waitForTimeout(200);
    const yellowSticky = await page.$('[role="menuitem"]:has-text("Yellow")');
    if (yellowSticky) {
      await yellowSticky.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(SCREENSHOTS, "05-sticky-added.png"), fullPage: true });
      console.log("Screenshot: 05-sticky-added.png (after adding yellow sticky)");
      const nodesAfter = await page.$$(".react-flow__node");
      console.log(`Nodes after adding sticky: ${nodesAfter.length}`);
    }
  }

  console.log("\n=== PHASE 3: Mode Toggle ===");

  // Switch to prototype mode
  const protoBtn = await page.$("button:has-text('Prototype')");
  if (protoBtn) {
    await protoBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOTS, "06-prototype-mode.png"), fullPage: true });
    console.log("Screenshot: 06-prototype-mode.png (prototype mode)");

    // Check for device frame
    const deviceFrame = await page.$(".rounded-\\[40px\\]");
    console.log(`iPhone frame visible: ${!!deviceFrame}`);

    // Check for bottom chrome bar
    const chromeBar = await page.$(".border-t.border-chrome-divider");
    console.log(`Chrome bar visible: ${!!chromeBar}`);

    // Check for navigation buttons
    const navButtons = await page.$$(".bg-blue-500\\/20, .bg-amber-500\\/20, .bg-violet-500\\/20");
    console.log(`Navigation buttons: ${navButtons.length}`);

    // Check screen label
    const screenLabel = await page.$(".text-white\\/80");
    if (screenLabel) {
      const labelText = await screenLabel.textContent();
      console.log(`Screen label: ${labelText}`);
    }

    // Check comments button
    const commentsBtn = await page.$("button:has-text('Comments')");
    console.log(`Comments button: ${!!commentsBtn}`);

    // Test navigation - find all buttons in the chrome bar
    const chromeButtons = await page.$$(".border-t.border-chrome-divider button");
    console.log(`Chrome bar buttons: ${chromeButtons.length}`);
    for (const btn of chromeButtons) {
      const text = await btn.textContent();
      console.log(`  - Chrome button: "${text?.trim()}"`);
    }
  }

  console.log("\n=== PHASE 4: Prototype Navigation ===");

  // Try navigating to catalog
  const catalogNavBtn = await page.$("button:has-text(\"Tap 'Browse Catalog'\")");
  if (catalogNavBtn) {
    await catalogNavBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOTS, "07-catalog-screen.png"), fullPage: true });
    console.log("Screenshot: 07-catalog-screen.png (catalog screen)");
  } else {
    // Try finding any nav button
    const allChromeButtons = await page.$$(".border-t.border-chrome-divider button");
    for (const btn of allChromeButtons) {
      const text = await btn.textContent();
      if (text && text.includes("Catalog") || text && text.includes("Browse")) {
        console.log(`Clicking nav button: "${text.trim()}"`);
        await btn.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(SCREENSHOTS, "07-catalog-screen.png"), fullPage: true });
        console.log("Screenshot: 07-catalog-screen.png");
        break;
      }
    }
  }

  // Navigate back via back button
  const backBtn = await page.$("button:has-text(\"Tap '← Back'\")");
  if (backBtn) {
    await backBtn.click();
    await page.waitForTimeout(500);
    console.log("Navigated back from catalog");
  }

  // Navigate to cart
  const cartNavBtn = await page.$("button:has-text('View Cart')");
  if (cartNavBtn) {
    await cartNavBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOTS, "08-cart-screen.png"), fullPage: true });
    console.log("Screenshot: 08-cart-screen.png (cart screen)");
  }

  console.log("\n=== PHASE 5: Comments ===");

  // Try comments button
  const commentsToggle = await page.$("button:has-text('Comments')");
  if (commentsToggle) {
    await commentsToggle.click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(SCREENSHOTS, "09-comments-mode.png"), fullPage: true });
    console.log("Screenshot: 09-comments-mode.png (comments mode active)");

    // Check if comment dots appear
    const commentDots = await page.$$("[aria-label='Add comment']");
    console.log(`Comment dots visible: ${commentDots.length}`);

    // Exit comments
    const exitComments = await page.$("button:has-text('Exit Comments')");
    if (exitComments) {
      await exitComments.click();
      await page.waitForTimeout(200);
    }
  }

  console.log("\n=== PHASE 6: Back to Wireflow ===");

  const wireflowBackBtn = await page.$("button:has-text('Wireflow')");
  if (wireflowBackBtn) {
    await wireflowBackBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOTS, "10-back-to-wireflow.png"), fullPage: true });
    console.log("Screenshot: 10-back-to-wireflow.png");
  }

  console.log("\n=== PHASE 7: Responsive ===");

  // Mobile viewport
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SCREENSHOTS, "11-mobile-375.png"), fullPage: true });
  console.log("Screenshot: 11-mobile-375.png (mobile viewport)");

  // Check if toolbar is usable at mobile width
  const toolbarAtMobile = await page.$(".flex.h-14");
  if (toolbarAtMobile) {
    const box = await toolbarAtMobile.boundingBox();
    console.log(`Toolbar at mobile - width: ${box?.width}, height: ${box?.height}`);
    if (box && box.width < 375) {
      console.log("Toolbar fits mobile viewport");
    }
  }

  // Tablet viewport
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SCREENSHOTS, "12-tablet-768.png"), fullPage: true });
  console.log("Screenshot: 12-tablet-768.png (tablet viewport)");

  // Back to desktop
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.waitForTimeout(500);

  console.log("\n=== PHASE 8: Edge Cases ===");

  // Double-click on a screen node to enter prototype
  const firstScreenNode = await page.$(".react-flow__node-screen");
  if (firstScreenNode) {
    await firstScreenNode.dblclick();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOTS, "13-dblclick-prototype.png"), fullPage: true });
    console.log("Screenshot: 13-dblclick-prototype.png (entered via double-click)");

    // Go back
    const backToWireflow = await page.$("button:has-text('Wireflow')");
    if (backToWireflow) {
      await backToWireflow.click();
      await page.waitForTimeout(500);
    }
  }

  // Add a screen via toolbar
  const addScreenBtn2 = await page.$("button:has-text('Screen')");
  if (addScreenBtn2) {
    await addScreenBtn2.click();
    await page.waitForTimeout(300);
    const homeMenuItem = await page.$('[role="menuitem"]:has-text("home")');
    if (homeMenuItem) {
      await homeMenuItem.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(SCREENSHOTS, "14-duplicate-screen-added.png"), fullPage: true });
      console.log("Screenshot: 14-duplicate-screen-added.png (added duplicate home screen)");
    }
  }

  console.log("\n=== PHASE 9: Accessibility Checks ===");

  // Check for ARIA landmarks
  const landmarks = await page.$$("[role]");
  const roles = [];
  for (const el of landmarks) {
    const role = await el.getAttribute("role");
    roles.push(role);
  }
  console.log(`ARIA roles found: ${[...new Set(roles)].join(", ")}`);

  // Check for focus-visible
  await page.keyboard.press("Tab");
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(SCREENSHOTS, "15-focus-visible.png"), fullPage: true });
  console.log("Screenshot: 15-focus-visible.png (focus visible after tab)");

  // Check color contrast by looking at text colors
  const mutedTexts = await page.$$(".text-muted-foreground");
  console.log(`Muted text elements: ${mutedTexts.length}`);

  console.log("\n=== RESULTS ===");

  console.log(`\nConsole errors: ${consoleErrors.length}`);
  for (const err of consoleErrors) {
    console.log(`  [${err.type || "error"}] ${err.text.slice(0, 200)}`);
  }
  if (consoleErrors.length > 0) {
    addFinding(
      `${consoleErrors.length} console error(s) detected`,
      consoleErrors.length > 3 ? "high" : "medium",
      "console",
      consoleErrors.map(e => e.text.slice(0, 150)).join("\n")
    );
  }

  console.log(`\nFindings: ${findings.length}`);
  for (const f of findings) {
    console.log(`  ${f.id} [${f.severity}] ${f.title}`);
    console.log(`    ${f.details}`);
  }

  // Write findings to JSON for later report
  fs.writeFileSync(
    path.join(SCREENSHOTS, "..", "qa-findings.json"),
    JSON.stringify({ findings, consoleErrors, timestamp: new Date().toISOString() }, null, 2)
  );

  await browser.close();
  console.log("\nDone. Screenshots saved to", SCREENSHOTS);
})();
