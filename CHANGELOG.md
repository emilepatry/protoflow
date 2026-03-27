# Changelog

All notable changes to this project will be documented in this file.

## [0.1.1.1] - 2026-03-27

### Fixed
- `programmaticNavRef` no longer stays stuck when navigating to the current hash (caused the next real hashchange to be silently ignored)
- Project view state (mode, active screen) is now persisted before switching projects, so returning to a project restores where you left off
- `createDefaultProject` derives project name from its ID slug instead of hardcoding
- `useMemo` for `initialNodes` in WireflowView now includes `projectId` in dependency array
- Nonexistent project IDs in URL hash no longer persist a bad `activeProjectId` to localStorage

## [0.1.1.0] - 2026-03-27

### Added
- Multi-project workspace architecture: projects live in `src/projects/<name>/screens/`, each discovered automatically via `import.meta.glob`
- Collapsible sidebar (240px expanded, 48px icon rail) with Projects and Components tabs, deterministic emoji badges, and keyboard navigation (arrow keys, Enter, Cmd+B toggle)
- Component library with shared component sandbox: `src/library/<name>/` with `component.tsx` + `variants.tsx` pattern, variant switching via arrow keys with crossfade transitions
- Hash-based URL routing (`#/projects/...`, `#/components/...`) with one-way sync to store
- Workspace store via React Context (`WorkspaceProvider` / `useWorkspace`) with per-project localStorage, view state persistence across project switches, and legacy migration from `protoflow-project` key
- `ComponentSandbox.tsx` with dot-grid canvas, per-variant error boundary, and crossfade animation
- Example Button component in library with 6 variants (Primary, Secondary, Destructive, Ghost, Disabled, Sizes)
- Design tokens for sidebar dimensions, sandbox dot grid, and transition timing
- Context indicator bar showing current view mode and project/component name

### Changed
- Toolbar removed; sticky picker moved to floating button on wireflow canvas (bottom-right), mode switching now implicit via sidebar clicks
- Screen registry expanded from flat to nested (`project → screen`) with lazy loading via `React.lazy`
- Collaboration rooms scoped per-project (`protoflow-${projectId}`), disconnects in sandbox mode
- `getScreenComponent` now requires explicit `projectId` parameter to avoid cross-project collisions
- Arrow key navigation removed from React Flow canvas (`disableKeyboardA11y`), sidebar owns keyboard nav
- `ViewMode` type expanded to include `"component-sandbox"` with exhaustive 3-way branching in App

### Fixed
- Cascade-delete stickies when removing a screen (`removeScreen` now filters stickies by `screenId`)
- Stale closure in hashchange handler (now uses ref for latest store)
- Hash-based routing explicitly sets wireflow mode for project URLs (prevents persisted prototype state from overriding URL intent)
- Source screen validation restored in `handleConnect` (prevents edges with non-existent source)
- Global keyboard handlers skip when focus is in input/textarea/contentEditable
- `updateSticky` guards against unknown sticky IDs

## [0.1.0.0] - 2026-03-27

### Added
- Auto-layout engine using Dagre for arranging screen nodes left-to-right on the wireflow canvas
- App-level error boundary with graceful fallback UI and reload button
- Screen-level error boundary in ScreenNode preventing single-screen crashes from taking down the canvas
- Sticky note deletion via keyboard (Delete/Backspace) in wireflow mode
- Breadcrumb navigation history in prototype mode with clickable back-navigation
- Loading skeleton for prototype screen Suspense fallback
- Comment input character limit (500) and author name truncation for overflow safety
- `safeGetItem` / `safeSetItem` wrappers for localStorage resilience in private browsing
- Mobile viewport gate showing "Best experienced on desktop" message
- Screen node hover overlay with "Double-click to preview" affordance
- Edge badge `title` attributes for long trigger text truncation
- `aria-label` attributes on comment close button, toolbar buttons, and breadcrumb nav
- Focus trap and Escape key support in ViewerNamePrompt dialog
- CSS `prefers-reduced-motion` support for screen node transitions
- Consolidated `PREVIEW_SCALE` constant to prevent drift between ScreenNode and layout engine
- Test coverage for store operations (removeScreen cascade, addScreen label generation, getEdgesFrom, malformed localStorage)
- Test for non-Error throw handling in AppErrorBoundary

### Changed
- Edge paths switched from Bezier to SmoothStep with 8px border radius for cleaner routing
- Edge markers now use React Flow's built-in `MarkerType.ArrowClosed` instead of custom SVG markers
- Edge config (colors, badge styles) extracted to `src/lib/edge-config.ts` for testability
- Toolbar refactored to use click-outside detection for sticky picker dropdown
- Project name editing moved to inline input with Enter/Escape/blur handling
- Comment dot visibility increased from `opacity-0` to `opacity-30` for discoverability
- Focus-visible outline color changed from primary to accent
- Theme colors migrated to OKLCH for perceptual uniformity
- Prototype "Back to Wireflow" button styled with accent instead of primary color
- Empty state messaging improved with icon and code example

### Fixed
- Layout not wiping user-positioned screens on every page reload (only relayouts on new screen registration)
- Error boundaries now handle non-Error throws (strings, undefined) without crashing the fallback UI
- `updateScreenPosition` guards against unknown screen IDs to prevent state corruption
- Self-loop edge creation rejected at both App and store level
- Duplicate edge creation between same source/target prevented
- Edge badge styles use `color-mix()` consistently for all 3 edge types
- Controls and MiniMap styled to match app theme instead of React Flow defaults
