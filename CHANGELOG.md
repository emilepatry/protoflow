# Changelog

All notable changes to this project will be documented in this file.

## [0.2.3.0] - 2026-03-27

### Changed
- Typography system now uses semantic type scale tokens (`text-hero`, `text-title`, `text-subtitle`, `text-body`, `text-label`, `text-caption`, `text-micro`) with bundled font-weight, line-height, and letter-spacing — replacing ad-hoc pixel values and generic Tailwind utilities across 17 files
- Font-weight bundled into `@theme` tokens: hero/title=600, subtitle/label=500, body/caption/micro=400 — eliminates need for manual `font-medium` alongside size tokens
- Sidebar active state no longer applies `font-medium` to parent button, preventing weight cascade to child elements like count badges
- Empty state tiers in DESIGN.md updated to reference `text-label`/`text-caption` tokens instead of legacy 14px/12px values

### Fixed
- `font-bold` (700) replaced with `font-semibold` (600) on CommentDot badge to respect DESIGN.md max weight

## [0.2.2.0] - 2026-03-27

### Added
- Keyboard navigation on wireflow canvas: Tab cycles through nodes, Enter opens prototype mode on selected screen
- Focus management on mode transitions: focus moves to prototype container on enter, back to main on exit (skips initial mount via prevModeRef guard)
- Touch target expansion to 44×44px for connection handles (`::after` pseudo-element, `inset: -18px`) and comment dots (`comment-dot-trigger::after`)
- Hotspot affordance ring on `[data-pf-action]` elements in prototype mode — 8px proximity zone with hover-activated border ring
- `ConnectionStatus` component: 6px tri-state dot (connected/disconnected/connecting) with color, pulse animation, and tooltip, gated on `VITE_PARTYKIT_HOST`
- `CollaborationProvider.onStatusChange()` method for real WebSocket status events with proper unsubscribe cleanup
- Tri-state `connectionStatus` in `useCollaboration` hook (replaces boolean `connected`)
- Regression tests for ConnectionStatus rendering, keyboard navigation, focus management, and collaboration status

### Fixed
- Focus no longer stolen from browser address bar on initial page load (prevModeRef guard)

## [0.2.1.0] - 2026-03-27

### Added
- `motion/react` (framer-motion v12) for spring-based physics animations across the app
- Spring preset library (`src/lib/motion.ts`): Quick (500/30/0.5), Default (350/34/1), Gentle (200/20/0.8) matching DESIGN.md spec
- `MotionConfig reducedMotion="user"` wrapper — OS `prefers-reduced-motion` respected globally
- Persistent wireflow: React Flow stays mounted behind prototype overlay, preserving viewport state and eliminating remount latency
- Prototype enter/exit spring animation (Gentle preset, scale 0.85→1 + opacity)
- Screen-to-screen spring transitions via `AnimatePresence mode="wait"` keyed on screen ID
- Screen node entrance animation on mount (Quick preset, scale 0.95→1)
- Comment popover spring entrance on open (Quick preset)

### Removed
- Manual `rAF + setTimeout(250)` transition state machine in PrototypeView (replaced by motion.div)
- `isTransitioning` blocking state and associated refs (`rAfRef`, `timeoutRef`, `cancelPendingTransition`)
- `.screen-node` CSS transition class (superseded by motion.div)
- `@keyframes sandboxFadeIn` (superseded by motion/react)
- `--transition-crossfade` token (no longer referenced)
- Inline `animation` style in ComponentSandbox

## [0.2.0] - 2026-03-27

### Changed
- Typography migrated from Google Fonts CDN (Inter) to self-hosted `@fontsource/geist` and `@fontsource/jetbrains-mono` — eliminates external network dependency and FOUT
- Every color token in the `@theme` block rebuilt from hex/named colors to OKLCH per DESIGN.md — semantic, status, sticky, edge, chrome, avatar, and canvas tokens
- All component inline colors replaced with semantic token references (`bg-blue-500` → `bg-info`, `bg-red-50` → `bg-error-subtle`, `bg-white` → `bg-background`, etc.) across 9 components
- Shadow system replaced with layered composites (`shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-menu`)
- Transition easings replaced with spring-derived `--ease-swift` and `--ease-overlay`
- Focus-visible outline uses `--color-ring` instead of `--color-accent`
- Radius tokens calculated from a single `--radius` base value

### Added
- Traffic light tokens (`--color-traffic-{red,yellow,green}`) for DeviceFrame
- Avatar palette tokens (`--color-avatar-{0..5}`) for Sidebar
- Canvas tokens (`--color-dot-grid`, `--color-minimap-{sticky,node,mask}`) for WireflowView
- Status color tiers (`--color-{error,info}-{subtle,muted,foreground}`) for error boundaries
- Type scale tracking utilities (`--tracking-{display,title,subtitle}`)
- `.node-version` file pinning Node.js 22 for `fnm` auto-switching
- `engines.node >= 22.12.0` in package.json (required by Vite 8 / Vitest 4)

### Fixed
- Context bar now has `role="status"` for screen reader announcements
- AppErrorBoundary heading uses `tracking-subtitle` per DESIGN.md type scale

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
