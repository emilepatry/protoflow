# Protoflow QA Report

**Date:** 2026-03-27
**URL:** http://localhost:5173
**Tier:** Standard (critical + high + medium)
**Mode:** Full (systematic exploration)
**Branch:** main
**Duration:** ~15 minutes
**Framework:** Vite 8 + React 19 SPA (React Flow, Tailwind 4)
**Pages visited:** Wireflow mode, Prototype mode (3 screens), Comments mode, Mobile viewport

---

## Health Score

### Baseline (before fixes)

| Category | Score | Weight | Weighted |
|----------|-------|--------|----------|
| Console | 10 | 15% | 1.5 |
| Links | 100 | 10% | 10.0 |
| Visual | 100 | 10% | 10.0 |
| Functional | 70 | 20% | 14.0 |
| UX | 84 | 15% | 12.6 |
| Performance | 100 | 10% | 10.0 |
| Content | 100 | 5% | 5.0 |
| Accessibility | 100 | 15% | 15.0 |
| **Total** | | | **78.1** |

### Final (after fixes)

| Category | Score | Weight | Weighted |
|----------|-------|--------|----------|
| Console | 100 | 15% | 15.0 |
| Links | 100 | 10% | 10.0 |
| Visual | 100 | 10% | 10.0 |
| Functional | 100 | 20% | 20.0 |
| UX | 100 | 15% | 15.0 |
| Performance | 100 | 10% | 10.0 |
| Content | 100 | 5% | 5.0 |
| Accessibility | 100 | 15% | 15.0 |
| **Total** | | | **100.0** |

**Health score delta: 78 -> 100 (+22)**

---

## Top 3 Things Fixed

1. **Comment dots invisible in iPhone 15 frame** (ISSUE-001, High) — Entire comments feature was broken for the default device frame
2. **18 WebSocket console errors per session** (ISSUE-002, High) — PartyKit reconnection spam when collaboration server not running
3. **Toolbar dropdowns don't close on outside click** (ISSUE-003, Medium) — Screen/sticky pickers stayed open until toggle or selection

---

## Issues Found and Fixed

### ISSUE-001 [HIGH] — Comment dots invisible in iPhone 15 frame

**Category:** Functional
**Status:** verified
**Commit:** c1d59e6

**Description:** CommentOverlay used `el.closest(".rounded-lg.shadow-2xl")` to find the device frame container, but iPhone 15 DeviceFrame uses `rounded-[40px]` not `rounded-lg`. All 6 `data-pf-id` elements returned null for the parent lookup, so no comment dots rendered.

**Fix:** Replaced fragile CSS class selector with semantic `[data-pf-screen-container]` attribute.

**Files changed:** `src/components/PrototypeView.tsx`

**Evidence:**
- Before: `screenshots/09-comments-mode.png` (no dots visible)
- After: `screenshots/verify-001-comments.png` (blue dots visible on all elements)

**Regression test:** `test/commentOverlay.regression-1.test.ts`

---

### ISSUE-002 [HIGH] — WebSocket reconnection spam when PartyKit not running

**Category:** Console
**Status:** verified
**Commit:** b207ed8

**Description:** `useCollaboration` unconditionally connected to `localhost:1999` via y-partykit even when `VITE_PARTYKIT_HOST` was not set. This produced 18+ WebSocket `ERR_CONNECTION_REFUSED` errors per page load, polluting the console and making it hard to spot real errors.

**Fix:** Only call `collab.connect()` when `VITE_PARTYKIT_HOST` is explicitly provided. Empty/undefined values skip connection.

**Files changed:** `src/sandbox/useCollaboration.ts`

**Evidence:**
- Before: 18 console errors (`qa-findings.json`)
- After: 0 console errors (verify pass)

**Regression test:** `test/useCollaboration.regression-1.test.ts`

---

### ISSUE-003 [MEDIUM] — Toolbar dropdowns don't close on outside click

**Category:** UX
**Status:** verified
**Commit:** eedc68b, 65a026e

**Description:** Screen picker and sticky picker dropdowns only closed when clicking their toggle button or selecting a menu item. Clicking anywhere else on the page (including the React Flow canvas) left them open.

**Fix:** Added `pointerdown` event listener on document in capture phase. Capture phase is necessary because React Flow calls `stopPropagation()` on pointer events during drag/pan.

**Files changed:** `src/components/Toolbar.tsx`

**Evidence:**
- Before: `screenshots/deep-toolbar-*.png` (menu stays open)
- After: `screenshots/verify-003-dropdown.png` (menu closes)

---

### ISSUE-004 [MEDIUM] — Toolbar content overflows at narrow viewports

**Category:** Responsive
**Status:** verified
**Commit:** da57916, 65a026e

**Description:** At viewport widths below ~500px, the toolbar's project name and button labels wrapped onto multiple lines, breaking the fixed `h-14` height constraint. "Prototype" truncated to "Proto", project name spanned 2-3 lines.

**Fix:** Project name truncates with ellipsis (`truncate`). Button labels (`Screen`, `Sticky`, `Wireflow`, `Prototype`) hide below `sm` breakpoint, showing icon-only. Added `overflow-hidden`, `min-w-0`, and `gap-4` for proper flex behavior.

**Files changed:** `src/components/Toolbar.tsx`

**Evidence:**
- Before: `screenshots/11-mobile-375.png` (content wrapping)
- After: `screenshots/verify-004-mobile.png` (clean single-line toolbar)

---

## Console Health

| State | Errors |
|-------|--------|
| Before fixes | 18 (all WebSocket `ERR_CONNECTION_REFUSED`) |
| After fixes | 0 |

---

## Summary

| Metric | Value |
|--------|-------|
| Total issues found | 4 |
| Fixes applied | 4 (verified: 4, best-effort: 0, reverted: 0) |
| Deferred issues | 0 |
| Health score | 78 -> 100 (+22) |
| Commits | 6 (4 fixes + 1 test bootstrap + 1 regression tests) |
| Test suite | 25 tests, 5 files, all passing |

**PR Summary:** QA found 4 issues, fixed 4, health score 78 -> 100.

---

## Test Framework

Bootstrapped **vitest 4.1.2** with @testing-library/react, jsdom, and jest-dom. 25 tests covering:
- Screen registry discovery
- Collaboration provider (comments, overrides, listeners)
- Viewer name storage (truncation edge case)
- cn utility (Tailwind merge conflicts)
- Device constants
- Regression tests for ISSUE-001 and ISSUE-002

---

## Files Changed

| File | Changes |
|------|---------|
| `src/components/PrototypeView.tsx` | data-pf-screen-container attribute + selector fix |
| `src/sandbox/useCollaboration.ts` | Skip connect when VITE_PARTYKIT_HOST not set |
| `src/components/Toolbar.tsx` | Outside-click close, responsive text hiding |
| `vitest.config.ts` | New: test framework config |
| `test/setup.ts` | New: jest-dom setup |
| `test/registry.test.ts` | New: screen registry tests |
| `test/collaboration.test.ts` | New: collaboration provider tests |
| `test/utils.test.ts` | New: utility tests |
| `test/commentOverlay.regression-1.test.ts` | New: ISSUE-001 regression |
| `test/useCollaboration.regression-1.test.ts` | New: ISSUE-002 regression |
| `TESTING.md` | New: test framework docs |
| `package.json` | test scripts + dev dependencies |
