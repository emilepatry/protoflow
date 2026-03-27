# Protoflow — Deferred Items

## 1. ~~Cascade-delete stickies on screen removal~~ ✅

Resolved — `removeScreen` in `store.tsx` now filters stickies where `sticky.screenId === id`.

## 2. Yjs graph sync

Collaboration currently only syncs comments — the project graph (screens, edges, stickies) is local-only via localStorage. `EditableText` and text override APIs are implemented but never wired up. Full graph sync requires moving the project state into a Yjs shared type.

## 3. Cursor rules for screen creation

Write `.cursor/rules/protoflow-screens.mdc` documenting:
- File location: `src/projects/<project>/screens/<name>.tsx`
- Component structure: default export, Heron tokens
- `data-pf-action` attribute convention for edge triggers
- Edge config format in `src/lib/edge-config.ts`
- Auto-discovery: any `.tsx` in `src/projects/<project>/screens/` is auto-added to the canvas

## 4. Keyboard shortcut for prototype mode

Screen nodes can only be opened via double-click (`WireflowView.tsx` `handleNodeDoubleClick`). Keyboard-only users relying on ReactFlow's built-in keyboard navigation cannot enter prototype mode. Add Enter-to-open on a selected screen node via `onKeyDown` on the ReactFlow component — check if the selected node is a screen, then call `onScreenSelect`.

Note: sidebar keyboard nav does NOT solve this — Enter-to-open on wireflow canvas screen nodes is a separate concern.

## 5. Connection status indicator

`useCollaboration` exposes a `connected` boolean but nothing in the UI shows it. Users have no way to know if their comments are being synced to peers. Add a small connection dot/indicator when `VITE_PARTYKIT_HOST` is configured, showing connected/disconnected state.

## 6. E2E tests

Six E2E-worthy flows to cover:
- Project switching (sidebar click switches project, restores view state)
- Component browsing (sidebar component tab, sandbox render, variant switching)
- Sidebar collapse/expand (Cmd+B toggle, prototype auto-collapse)
- localStorage migration (legacy `protoflow-project` key converted to workspace format)
- URL navigation (hash-based routing, deep links to projects/components/variants)
- Keyboard flow (roving tabIndex in sidebar, arrow key navigation, Enter to open)

## 7. ~~DESIGN.md~~ ✅

Resolved — `DESIGN.md` authored via `/design-consultation` and reviewed via `/plan-design-review`. Covers typography, color (OKLCH), spacing, layout, shadows, motion, interaction states, responsive, accessibility, and component inventory.

## 8. ~~Design system migration (Inter → Geist, hex → OKLCH)~~ ✅

Resolved — sprint-0/font-and-tokens branch: `@fontsource/geist` + `@fontsource/jetbrains-mono` self-hosted, full OKLCH token rebuild in `index.css`, all component inline colors replaced with semantic tokens, layered shadow composites, spring easing, type scale tracking utilities. Node.js pinned to >= 22.12.0.

## 9. Connection handle touch targets

Connection handles on screen nodes are 8×8px visual circles with no expanded hit area. WCAG requires 44px minimum for interactive elements. Fix by adding invisible padding or pseudo-element to expand the clickable area to 44×44px while keeping the visual at 8px.

Depends on: nothing.

## 10. Hotspot hover-proximity affordance

Viewers in prototype mode have no way to know which elements are clickable (`data-pf-action`). Add a faint `--ring` outline (2px, 30% opacity) that appears when cursor is within 8px of an actionable element, using the Quick spring preset. Spec in DESIGN.md > Protoflow Components > Hotspot Affordance.

Depends on: nothing.

## 11. Variant reactions (thumbs up/down)

Add binary reaction buttons (thumbs up / thumbs down) below each component variant in the sandbox. Reactions synced via collaboration layer. Spec in DESIGN.md > Protoflow Components > Variant Reactions.

Depends on: #2 (Yjs graph sync) — reactions need a shared data store.
