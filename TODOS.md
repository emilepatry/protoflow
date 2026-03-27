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
- Keyboard flow (roving tabIndex in sidebar, arrow key navigation, Enter to open)

## 7. ~~DESIGN.md~~ ✅

Resolved — `DESIGN.md` authored via `/design-consultation` and reviewed via `/plan-design-review`. Covers typography, color (OKLCH), spacing, layout, shadows, motion, interaction states, responsive, accessibility, and component inventory.

## 8. ~~Design system migration (Inter → Geist, hex → OKLCH)~~ ✅

Resolved — sprint-0/font-and-tokens branch: `@fontsource/geist` + `@fontsource/jetbrains-mono` self-hosted, full OKLCH token rebuild in `index.css`, all component inline colors replaced with semantic tokens, layered shadow composites, spring easing, type scale tracking utilities. Node.js pinned to >= 22.12.0.

## 9. ~~Connection handle touch targets~~ ✅

Resolved — `.react-flow__handle::after` pseudo-element expands hit area to 44×44px (`inset: -18px`) while keeping 8px visual dot. `.comment-dot-trigger::after` extends CommentDot buttons similarly.

## 10. ~~Hotspot hover-proximity affordance~~ ✅

Resolved — `[data-pf-action]::after` pseudo-element creates 8px proximity zone with 2px ring border that transitions to `oklch(0.68 0.14 175 / 0.6)` on hover. Respects `prefers-reduced-motion` via global CSS rule.

## 11. Variant reactions (thumbs up/down)

Add binary reaction buttons (thumbs up / thumbs down) below each component variant in the sandbox. Reactions synced via collaboration layer. Spec in DESIGN.md > Protoflow Components > Variant Reactions.

Depends on: #2 (Yjs graph sync) — reactions need a shared data store.
