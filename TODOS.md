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

## 7. DESIGN.md

Document protoflow's design system tokens, colors, typography, and component patterns.
