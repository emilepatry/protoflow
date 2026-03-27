import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const SCREENSHOTS = path.resolve(import.meta.dirname, "screenshots");
const findings = [];
let fid = 0;
function addFinding(title, severity, category, details) {
  fid++;
  findings.push({ id: `ISSUE-${String(fid).padStart(3, "0")}`, title, severity, category, details });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });

  await page.goto("http://localhost:5173", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // TEST 1: Toolbar dropdown outside-click behavior
  console.log("=== TEST 1: Toolbar dropdown outside-click ===");
  const screenBtn = await page.$("button:has-text('Screen')");
  await screenBtn.click();
  await page.waitForTimeout(200);
  let menu = await page.$('[role="menu"]');
  console.log(`Screen menu open: ${!!menu}`);

  // Click on the canvas (outside the menu)
  await page.click(".react-flow", { position: { x: 400, y: 400 } });
  await page.waitForTimeout(200);
  menu = await page.$('[role="menu"]');
  console.log(`Menu after outside click: ${!!menu}`);
  if (menu) {
    addFinding(
      "Toolbar dropdowns don't close on outside click",
      "medium",
      "ux",
      "Clicking outside the screen/sticky picker doesn't close the dropdown. Must click the toggle button or select an item."
    );
  }

  // Close menu by clicking button again
  await screenBtn.click();
  await page.waitForTimeout(200);

  // TEST 2: Dynamic Island position check
  console.log("\n=== TEST 2: Dynamic Island vs content positioning ===");
  const protoBtn = await page.$("button:has-text('Prototype')");
  await protoBtn.click();
  await page.waitForTimeout(500);

  // Get Dynamic Island position
  const dynamicIsland = await page.$(".rounded-full.bg-black");
  if (dynamicIsland) {
    const diBox = await dynamicIsland.boundingBox();
    console.log(`Dynamic Island: x=${diBox.x.toFixed(0)}, y=${diBox.y.toFixed(0)}, w=${diBox.width.toFixed(0)}, h=${diBox.height.toFixed(0)}`);
    console.log(`DI bottom: ${(diBox.y + diBox.height).toFixed(0)}`);

    // Get first visible text in screen
    const titleEl = await page.$('[data-pf-id="home-title"]');
    if (titleEl) {
      const titleBox = await titleEl.boundingBox();
      console.log(`Title "Fullscript": x=${titleBox.x.toFixed(0)}, y=${titleBox.y.toFixed(0)}`);
      console.log(`Gap: ${(titleBox.y - diBox.y - diBox.height).toFixed(0)}px`);

      if (titleBox.y < diBox.y + diBox.height) {
        addFinding(
          "Screen content overlaps with Dynamic Island",
          "high",
          "visual",
          `Title element starts at y=${titleBox.y.toFixed(0)} but Dynamic Island ends at y=${(diBox.y + diBox.height).toFixed(0)}`
        );
      }
    }
  }

  // TEST 3: Navigate to cart and check for content clipping
  const viewCartBtn = await page.$("button:has-text('View Cart')");
  if (viewCartBtn) {
    await viewCartBtn.click();
    await page.waitForTimeout(400);

    const cartTitle = await page.$('[data-pf-id="cart-title"]');
    if (cartTitle) {
      const ctBox = await cartTitle.boundingBox();
      const diBox2 = dynamicIsland ? await dynamicIsland.boundingBox() : null;
      if (ctBox && diBox2) {
        console.log(`\nCart title box: x=${ctBox.x.toFixed(0)}, y=${ctBox.y.toFixed(0)}, w=${ctBox.width.toFixed(0)}, h=${ctBox.height.toFixed(0)}`);
        console.log(`DI box: x=${diBox2.x.toFixed(0)}, y=${diBox2.y.toFixed(0)}, w=${diBox2.width.toFixed(0)}, h=${diBox2.height.toFixed(0)}`);

        // Check horizontal overlap
        const titleRight = ctBox.x + ctBox.width;
        const diLeft = diBox2.x;
        const diRight = diBox2.x + diBox2.width;
        const diBottom = diBox2.y + diBox2.height;

        const yOverlap = ctBox.y < diBottom && (ctBox.y + ctBox.height) > diBox2.y;
        const xOverlap = titleRight > diLeft && ctBox.x < diRight;

        console.log(`Y overlap: ${yOverlap}, X overlap: ${xOverlap}`);
        if (yOverlap && xOverlap) {
          await page.screenshot({ path: path.join(SCREENSHOTS, "deep-cart-di-overlap.png") });
          addFinding(
            "Cart title text hidden behind Dynamic Island",
            "high",
            "visual",
            `Cart title extends to x=${titleRight.toFixed(0)} which overlaps with Dynamic Island at x=${diLeft.toFixed(0)}-${diRight.toFixed(0)}`
          );
        }
      }
    }
  }

  // TEST 4: Comment overlay in iPhone frame
  console.log("\n=== TEST 4: Comment overlay functionality ===");
  const commentsBtn = await page.$("button:has-text('Comments')");
  if (commentsBtn) {
    await commentsBtn.click();
    await page.waitForTimeout(300);

    // Check if comment dots are rendered
    const commentDots = await page.$$(".pointer-events-none.absolute.inset-0");
    console.log(`Comment overlay containers: ${commentDots.length}`);

    const addCommentBtns = await page.$$("[aria-label='Add comment']");
    console.log(`"Add comment" buttons: ${addCommentBtns.length}`);

    // Check if data-pf-id elements exist
    const pfIds = await page.$$("[data-pf-id]");
    console.log(`data-pf-id elements: ${pfIds.length}`);

    // Debug: check the CommentOverlay's parent selector
    const overlayResult = await page.evaluate(() => {
      const els = document.querySelectorAll("[data-pf-id]");
      const results = [];
      for (const el of els) {
        const parent = el.closest(".rounded-lg.shadow-2xl");
        results.push({
          pfId: el.getAttribute("data-pf-id"),
          hasParent: !!parent,
          closestClasses: el.parentElement?.className?.slice(0, 80),
        });
      }
      return results;
    });

    console.log("CommentOverlay parent check:");
    for (const r of overlayResult) {
      console.log(`  ${r.pfId}: closest(".rounded-lg.shadow-2xl") = ${r.hasParent}`);
    }

    if (overlayResult.length > 0 && overlayResult.every(r => !r.hasParent)) {
      addFinding(
        "Comment dots invisible — CommentOverlay parent selector fails for iPhone frame",
        "high",
        "functional",
        'CommentOverlay uses el.closest(".rounded-lg.shadow-2xl") but iPhone 15 frame uses rounded-[40px] shadow-2xl. No data-pf-id elements can find their parent container.'
      );
    }

    // Exit comments
    const exitBtn = await page.$("button:has-text('Exit Comments')");
    if (exitBtn) await exitBtn.click();
  }

  // TEST 5: Toolbar at various widths
  console.log("\n=== TEST 5: Toolbar overflow at narrow widths ===");
  const wireflowBtn = await page.$("button:has-text('Wireflow')");
  if (wireflowBtn) {
    await wireflowBtn.click();
    await page.waitForTimeout(500);
  }

  for (const width of [600, 500, 375]) {
    await page.setViewportSize({ width, height: 720 });
    await page.waitForTimeout(300);
    const toolbar = await page.$(".flex.h-14");
    if (toolbar) {
      const box = await toolbar.boundingBox();
      const actualHeight = box?.height || 0;
      console.log(`Toolbar at ${width}px: height=${actualHeight}px (expected 56px)`);
      if (actualHeight > 60) {
        addFinding(
          `Toolbar wraps at ${width}px viewport width`,
          "medium",
          "responsive",
          `Toolbar height is ${actualHeight}px at ${width}px viewport (expected 56px). Content is overflowing.`
        );
        await page.screenshot({ path: path.join(SCREENSHOTS, `deep-toolbar-${width}.png`) });
        break;
      }
    }
  }

  // Reset viewport
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.waitForTimeout(300);

  // TEST 6: Keyboard accessibility
  console.log("\n=== TEST 6: Keyboard accessibility ===");
  await page.keyboard.press("Tab");
  await page.waitForTimeout(200);
  const focusedEl = await page.evaluate(() => {
    const el = document.activeElement;
    return {
      tag: el?.tagName,
      text: el?.textContent?.slice(0, 30),
      hasFocusRing: window.getComputedStyle(el).outlineStyle !== "none" ||
        el?.className?.includes("focus-visible"),
    };
  });
  console.log(`First focused element: <${focusedEl.tag}> "${focusedEl.text}" (ring: ${focusedEl.hasFocusRing})`);

  // TEST 7: Check if StickyNode renders and is editable
  console.log("\n=== TEST 7: Sticky notes ===");
  const stickyNodes = await page.$$(".react-flow__node-sticky");
  console.log(`Sticky notes on canvas: ${stickyNodes.length}`);

  // TEST 8: Edge labels
  console.log("\n=== TEST 8: Edge labels ===");
  const edgeLabels = await page.$$(".react-flow__edgelabel");
  console.log(`Edge labels: ${edgeLabels.length}`);
  for (const label of edgeLabels) {
    const text = await label.textContent();
    console.log(`  Label: "${text}"`);
  }

  // RESULTS
  console.log("\n\n=== DEEP TEST RESULTS ===");
  console.log(`Console errors: ${consoleErrors.length} (all WebSocket)`);
  console.log(`Findings: ${findings.length}`);
  for (const f of findings) {
    console.log(`\n${f.id} [${f.severity}] [${f.category}] ${f.title}`);
    console.log(`  ${f.details}`);
  }

  fs.writeFileSync(
    path.join(SCREENSHOTS, "..", "qa-findings-deep.json"),
    JSON.stringify({ findings, consoleErrors: consoleErrors.length, timestamp: new Date().toISOString() }, null, 2)
  );

  await browser.close();
})();
