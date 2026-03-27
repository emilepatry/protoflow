# Protoflow — Deferred Items

## 1. Cascade-delete stickies on screen removal

`store.ts` `removeScreen` (line ~142) cleans up edges when a screen is removed but does not cascade-delete stickies attached to that screen via `screenId`. A 3-line fix once screen deletion is exposed in the UI.

## 2. Yjs graph sync

Collaboration currently only syncs comments — the project graph (screens, edges, stickies) is local-only via localStorage. `EditableText` and text override APIs are implemented but never wired up. Full graph sync requires moving the project state into a Yjs shared type.

## 3. Cursor rules for screen creation

Write `.cursor/rules/protoflow-screens.mdc` documenting:
- File location: `src/screens/<name>.tsx`
- Component structure: default export, Heron tokens
- `data-pf-action` attribute convention for edge triggers
- Edge config format in `src/lib/edge-config.ts`
- Auto-discovery: any `.tsx` in `src/screens/` is auto-added to the canvas

## 4. Keyboard shortcut for prototype mode

Screen nodes can only be opened via double-click (`WireflowView.tsx` `handleNodeDoubleClick`). Keyboard-only users relying on ReactFlow's built-in keyboard navigation cannot enter prototype mode. Add Enter-to-open on a selected screen node via `onKeyDown` on the ReactFlow component — check if the selected node is a screen, then call `onScreenSelect`.

## 5. Connection status indicator

`useCollaboration` exposes a `connected` boolean but nothing in the UI shows it. Users have no way to know if their comments are being synced to peers. Add a small connection dot/indicator in the Toolbar when `VITE_PARTYKIT_HOST` is configured, showing connected/disconnected state.
