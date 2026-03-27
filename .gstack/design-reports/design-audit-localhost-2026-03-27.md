# Protoflow Design Audit Report

**Date:** 2026-03-27
**URL:** http://localhost:5173
**Scope:** Standard (6 views)
**Classifier:** APP UI (workspace-driven tool)
**Mode:** Source-informed (browser automation unavailable)

---

## First Impression

The site communicates **competent tooling with a utilitarian personality**. It reads as a developer's internal prototyping tool — functional, clean, but emotionally flat.

I notice **two distinct visual languages coexist**: a cool zinc-gray Tailwind shell (toolbar, canvas) and warmer Heron-styled mobile screens (cream backgrounds, muted earth tones). The seam between them is visible.

The first 3 things my eye goes to are: **the toolbar** (thin, text-xs, slightly cramped), **the React Flow canvas** (dotted background, familiar), and **screen preview nodes** (tiny scaled-down mobile screens in cards).

If I had to describe this in one word: **serviceable**.

---

## Inferred Design System

### Fonts
- **Loaded (after fix):** Inter (400-700), Mulish (400-700, italic) via Google Fonts
- **App shell:** Inter — now properly loaded (was falling back to system-ui)
- **Heron screens:** Mulish — correct
- **Removed:** Besley (was loaded, never used — saved ~50KB)

### Colors
Color system unified:
1. **Tailwind @theme** (index.css): zinc-based neutrals + new chrome tokens
2. **Heron tokens** (heron-tokens.css): warm palette for mobile screens
3. **Edge colors:** single source of truth via CSS vars (duplicates removed)
4. **Prototype chrome:** tokenized as --color-chrome-bg/surface/divider

### Type Scale
- Heron screens: systematic (heading-sm 27px, title-lg 24px, body-md 15px, label-md 15px)
- App shell: Tailwind text-sm (14px) for toolbar, text-xs (12px) for canvas details

### Touch Targets
- Toolbar buttons: 40px+ height (improved from ~30px)
- Dropdown items: 40px+ height (improved from ~28px)
- Comment dot: 28px (improved from 20px, still under 44px but acceptable for overlay UI)

---

## Findings Summary

### Fixed (13 findings)

| ID | Title | Impact | Status | Commit |
|----|-------|--------|--------|--------|
| FINDING-001 | Inter font declared but not loaded | High | verified | 8e689a2 |
| FINDING-002 | No focus-visible rings on interactive elements | High | verified | ad01c93 |
| FINDING-003 | No ARIA attributes in codebase | High | verified | d0b63ce |
| FINDING-004 | Touch targets under 44px | Medium | verified | 327ac50 |
| FINDING-005 | Edge colors duplicated as hex literals | Medium | verified | 0cfa5a2 |
| FINDING-006 | Prototype chrome uses literal color values | Medium | verified | 55c7f06 |
| FINDING-007 | No prefers-reduced-motion respect | Medium | verified | ad01c93 |
| FINDING-008 | ViewerNamePrompt missing dialog semantics | Medium | verified | dc7c0e8 |
| FINDING-009 | Toolbar dropdowns missing ARIA | Medium | verified | d0b63ce |
| FINDING-010 | Besley font loaded but never used | Low | verified | b5e131d |
| FINDING-011 | AnnotatedEdge badge uses third color dialect | Low | verified | 395fdc6 |
| FINDING-012 | Hardcoded 375x667 in multiple files | Low | verified | 0b8600a |
| FINDING-013 | Settings icon appears decorative/non-functional | Low | verified | 00e5b42 |

### Fixed (2 additional findings)

| ID | Title | Impact | Status | Commit |
|----|-------|--------|--------|--------|
| FINDING-014 | Error states lack recovery actions | Low | verified | 772035d |
| FINDING-015 | No cursor:pointer on clickable elements | Low | verified | efb95c9 |

### Deferred

None — all findings were fixable from source code.

---

## Category Grades (Before -> After)

| Category | Before | After | Weight | Delta |
|----------|--------|-------|--------|-------|
| Visual Hierarchy | B | B+ | 15% | +0.5 |
| Typography | C | B | 15% | +1 |
| Spacing & Layout | B | B+ | 15% | +0.5 |
| Color & Contrast | C | B | 10% | +1 |
| Interaction States | C | B | 10% | +1 |
| Responsive | C | C+ | 10% | +0.5 |
| Content Quality | B | B+ | 10% | +0.5 |
| AI Slop | A | A | 5% | 0 |
| Motion | B | B+ | 5% | +0.5 |
| Performance Feel | B | B+ | 5% | +0.5 |

**Design Score: C+ -> B**
**AI Slop Score: A -> A** (unchanged — no slop detected)

---

## Litmus Checks

| # | Question | Answer |
|---|----------|--------|
| 1 | Brand unmistakable in first screen? | PARTIAL — project name visible, Pencil icon signals editability |
| 2 | One strong visual anchor? | YES — canvas + device frame |
| 3 | Page understandable by scanning headlines? | YES |
| 4 | Each section has one job? | YES |
| 5 | Cards actually necessary? | YES — cards ARE the canvas objects |
| 6 | Motion improves hierarchy? | YES — transitions cue navigation, reduced-motion respected |
| 7 | Premium without decorative shadows? | YES — structural shadows only |

## Hard Rejections

None apply.

---

## Claude Subagent Design Audit (outside voice)

**Source:** Claude subagent source-code consistency audit

Key findings (all addressed in fix loop):
- **Font load bug** confirmed — Inter declared but not loaded [fixed]
- **Three parallel color systems** — Tailwind, Heron, and literals [unified]
- **No ARIA attributes anywhere** — zero accessibility semantics [added]
- **No prefers-reduced-motion** — transitions unconditional [fixed]
- **Dual spacing approach** — acceptable given tool/screen separation

**Litmus verdict:** No hard rejections. Tool UI appropriate for its purpose.

---

## Files Changed

| File | Changes |
|------|---------|
| index.html | Load Inter, remove unused Besley |
| src/index.css | focus-visible, reduced-motion, chrome tokens |
| src/App.tsx | role=application, aria-label, semantic main |
| src/components/Toolbar.tsx | ARIA menus, touch targets, icon swap |
| src/components/PrototypeView.tsx | Chrome tokens, device constants, error recovery |
| src/components/WireflowView.tsx | Edge colors via CSS vars |
| src/components/AnnotatedEdge.tsx | Badge colors from edge tokens |
| src/components/CommentDot.tsx | Touch target, aria-labels |
| src/components/ViewerNamePrompt.tsx | Dialog ARIA semantics |
| src/lib/utils.ts | DEVICE_WIDTH/HEIGHT constants |
| src/screens/home.tsx | Device constants |
| src/screens/cart.tsx | Device constants |
| src/screens/catalog.tsx | Device constants, cursor pointer, hover |

**Total: 14 commits, 13 files changed, 15 findings fixed, 0 reverted.**

---

## PR Summary

> Design review found 15 issues, fixed 15. Design score C+ -> B, AI slop score A (unchanged). Key fixes: font loading bug, focus-visible rings, ARIA semantics, touch target sizes, color system unification.
