# Protoflow — Deferred Items

## 1. ~~Cascade-delete stickies on screen removal~~ ✅

Resolved — `removeScreen` in `store.tsx` now filters stickies where `sticky.screenId === id`.

## 2. Viewer sticky sync

Sync viewer-created sticky notes via Yjs Y.Map (keyed by sticky ID). Builder stickies stay in localStorage — separate ownership model. Viewer stickies are collaborative (created, edited, dragged, deleted through the Yjs doc). Includes `createdBy` field for permission enforcement: viewers can delete their own stickies, builder can delete any. Debounce Yjs writes on drag position updates.

Rescoped from "full Yjs graph sync" — CEO review determined the actual need is viewer feedback, not co-editing the project graph.

## 3. Cursor rules for screen creation

Write `.cursor/rules/protoflow-screens.mdc` documenting:
- File location: `src/projects/<project>/screens/<name>.tsx`
- Component structure: default export, Heron tokens
- `data-pf-action` attribute convention for edge triggers
- Edge config format in `src/lib/edge-config.ts`
- Auto-discovery: any `.tsx` in `src/projects/<project>/screens/` is auto-added to the canvas

## 4. ~~Keyboard shortcut for prototype mode~~ ✅

Resolved — `disableKeyboardA11y` removed from ReactFlow; `handleKeyDown` on the wrapper checks for Enter on a selected screen node and calls `onScreenSelect`. React Flow's built-in Tab navigation handles cycling through nodes.

## 5. ~~Connection status indicator~~ ✅

Resolved — `CollaborationProvider.onStatusChange()` wired to real WebSocket status events; `useCollaboration` exposes tri-state `connectionStatus` (`connected` | `disconnected` | `connecting`); `ConnectionStatus` component renders a 6px dot with color/pulse in the context bar, gated on `VITE_PARTYKIT_HOST`.

## 6. E2E tests

Six E2E-worthy flows to cover:
- Project switching (sidebar click switches project, restores view state)
- Component browsing (sidebar component tab, sandbox render, variant switching)
- Sidebar collapse/expand (Cmd+B toggle, prototype auto-collapse)
- localStorage migration (legacy `protoflow-project` key converted to workspace format)
- URL navigation (hash-based routing, deep links to projects/components/variants)
- Keyboard flow (Tab navigation between sidebar items, Enter to open)

## 7. ~~DESIGN.md~~ ✅

Resolved — `DESIGN.md` authored via `/design-consultation` and reviewed via `/plan-design-review`. Covers typography, color (OKLCH), spacing, layout, shadows, motion, interaction states, responsive, accessibility, and component inventory.

## 8. ~~Design system migration (Inter → Geist, hex → OKLCH)~~ ✅

Resolved — sprint-0/font-and-tokens branch: `@fontsource/geist` + `@fontsource/jetbrains-mono` self-hosted, full OKLCH token rebuild in `index.css`, all component inline colors replaced with semantic tokens, layered shadow composites, spring easing, type scale tracking utilities. Node.js pinned to >= 22.12.0.

## 9. ~~Connection handle touch targets~~ ✅

Resolved — `.react-flow__handle::after` pseudo-element expands hit area to 44×44px (`inset: -18px`) while keeping 8px visual dot. `.comment-dot-trigger::after` extends CommentDot buttons similarly.

## 10. ~~Hotspot hover-proximity affordance~~ ✅

Resolved — `[data-pf-action]::after` pseudo-element creates 8px proximity zone with 2px ring border that transitions to `oklch(0.68 0.14 175 / 0.6)` on hover. Respects `prefers-reduced-motion` via global CSS rule.

## 11. Variant reactions (thumbs up/down)

Add binary reaction buttons (thumbs up / thumbs down) below each component variant in the sandbox. Reactions stored as `Y.Map<variantId, Y.Map<viewerName, "up"|"down">>` — per-viewer, attributed, toggleable. Requires adding a stable `id` field to `ComponentVariant` (currently only has `name`). Also requires keeping collaboration alive in sandbox mode (fix `collabProjectId` logic in `App.tsx`). Spec in DESIGN.md > Protoflow Components > Variant Reactions.

Depends on: stable variant IDs (add `id` to `ComponentVariant`).

## 12. Viewer presence indicators

Show avatar dots on the canvas when viewers are actively viewing the project via shared link. Yjs awareness protocol already flows through `collaboration.ts` — needs UI rendering as React Flow overlay elements. Viewer names already captured via `ViewerNamePrompt`.

Depends on: #2 (viewer sticky sync) — presence is most meaningful when viewers can leave stickies.

## 13. Feedback summary panel

A sidebar tab aggregating all viewer feedback across the project: sticky notes grouped by screen, reaction counts per variant, recent comment threads. Gives the builder a single "what did people think?" view. Would subscribe to the same Yjs observe events as the toast system.

Depends on: #2 (viewer sticky sync), #11 (variant reactions).
