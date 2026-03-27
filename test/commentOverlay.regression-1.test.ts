// Regression: ISSUE-001 — Comment dots invisible in iPhone 15 frame
// Found by /qa on 2026-03-27
// Report: .gstack/qa-reports/qa-report-localhost-2026-03-27.md

import { describe, it, expect } from "vitest";

describe("CommentOverlay parent selector", () => {
  it("finds data-pf-screen-container from nested data-pf-id elements", () => {
    document.body.innerHTML = `
      <div data-pf-screen-container>
        <div>
          <h1 data-pf-id="test-title">Title</h1>
          <p data-pf-id="test-body">Body</p>
        </div>
      </div>
    `;

    const elements = document.querySelectorAll("[data-pf-id]");
    expect(elements.length).toBe(2);

    for (const el of elements) {
      const container = el.closest("[data-pf-screen-container]");
      expect(container).not.toBeNull();
    }
  });

  it("returns null when no screen container exists (old selector would also fail)", () => {
    document.body.innerHTML = `
      <div class="some-other-wrapper">
        <h1 data-pf-id="orphan">Orphan</h1>
      </div>
    `;

    const el = document.querySelector("[data-pf-id]")!;
    expect(el.closest("[data-pf-screen-container]")).toBeNull();
  });

  it("works with iPhone-style frame nesting (rounded-[40px] not rounded-lg)", () => {
    document.body.innerHTML = `
      <div class="rounded-[40px] border-[3px] p-2 shadow-2xl">
        <div class="overflow-hidden rounded-[32px] bg-white">
          <div class="relative" data-pf-screen-container>
            <div>
              <h1 data-pf-id="home-title">Fullscript</h1>
            </div>
          </div>
        </div>
      </div>
    `;

    const el = document.querySelector('[data-pf-id="home-title"]')!;
    const oldSelector = el.closest(".rounded-lg.shadow-2xl");
    const newSelector = el.closest("[data-pf-screen-container]");

    expect(oldSelector).toBeNull();
    expect(newSelector).not.toBeNull();
  });
});
