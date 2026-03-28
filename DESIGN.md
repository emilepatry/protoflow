# Design System — Protoflow

## Product Context

- **What this is:** A prototype orchestrator — build real React screens, wire them into flows on a spatial canvas, toggle between wireflow map and interactive prototype, with inline commenting and editing via shared links.
- **Who it's for:** Personal / small team use. Builder-grade prototyping tool.
- **Space/industry:** Design tooling — peers are Figma, Whimsical, Excalidraw, tldraw, Linear.
- **Project type:** Canvas-based web application (React + Vite + Tailwind CSS v4 + React Flow).

## User Personas & Journey

### Builder (primary)

The person who creates screens, wires flows, and maintains the prototype. Always has projects and components populated. Uses the wireflow canvas daily.

| Step | User does | User feels | Design supports it with |
|------|-----------|------------|------------------------|
| 1. Opens Protoflow | Sees sidebar with their projects, familiar canvas | Ownership, control — "this is my workspace" | Restored scroll position, last-active project auto-selected, no splash screen |
| 2. Adds a screen | Creates `.tsx` file, it auto-appears on canvas | Immediate feedback, no ceremony | Spring entrance animation (Quick preset), auto-layout positions it logically |
| 3. Wires a flow | Drags edge from screen to screen, labels it | Flow thinking — connecting ideas spatially | Edges snap cleanly, label appears inline, dot grid provides spatial anchoring |
| 4. Enters prototype | Double-clicks a screen, canvas zooms into device frame | Immersion — "this is what it feels like" | Signature spring animation, sidebar auto-collapses, chrome disappears |
| 5. Shares a link | Copies URL, sends to colleague | Confidence — "they'll see exactly what I see" | Hash-based deep link preserves project + mode + screen |
| 6. Iterates daily | Switches between projects, adjusts flows | Fluency, low friction — tool disappears | Cmd+B sidebar toggle, keyboard nav, localStorage persistence |

### Viewer (secondary)

Colleagues who receive shared links. They view end-to-end flows, click through prototype concepts, comment on text, and browse/react to component variants.

| Step | User does | User feels | Design supports it with |
|------|-----------|------------|------------------------|
| 1. Opens shared link | Arrives at a specific screen/flow via URL | Orientation — "where am I, what is this?" | Context bar shows project name + mode, device frame provides familiar boundary |
| 2. Clicks through prototype | Navigates between screens via hotspots | Discovery — "oh, this is how it works" | Smooth screen transitions, clear hotspot affordance on `data-pf-action` elements |
| 3. Comments on copy | Clicks a text element, writes feedback | Collaboration — "my input matters" | Comment dot appears, name prompt (first time only), comment thread with spring entrance |
| 4. Browses components | Switches to component sandbox via sidebar or link | Evaluation — "is this the right direction?" | Variant tabs, clear visual comparison, like/dislike reaction mechanism |
| 5. Returns later | Opens same link, sees updated screens | Trust — "this stays current" | Same URL works, comments persist, collaboration state synced |

### Design Implications

- **No onboarding needed** — builder always has content, viewer arrives at content via deep link
- **Viewer name prompt** is the only "first-run" gate — warm, single field, dismissible
- **The "aha" moment** for viewers is clicking through the prototype — the wireflow→prototype spring animation IS the product pitch
- **Identity** comes from the workspace feeling like a personal tool bench, not a SaaS product

## Aesthetic Direction

- **Direction:** Brutally Minimal
- **Decoration level:** Minimal — borders are `box-shadow: 0 0 0 1px`, no gradients, no fills that aren't functional. Shadows are layered composites.
- **Mood:** The interface disappears. You only see the screens you're building and the flows connecting them. Craft lives in spring physics, easing curves, shadow layering, and focus states — not in ornamentation.
- **Influences:** Devouring Details (Rauno Kavur), Linear, Vercel, Campsite.

## Typography

- **Display/Hero:** Geist (weight 600) — Vercel's interface font. Designed for developer tools. Clean, technical, excellent at all sizes. Letter-spacing: -0.04em at display sizes.
- **Body:** Geist (weight 400) — same family, 16px minimum on desktop. Line height 1.5. Max line length ~66 characters (520px at 16px).
- **UI/Labels:** Geist (weight 500) — 13px for buttons, labels, navigation.
- **Data/Tables:** JetBrains Mono (tabular-nums) — aligned numbers in canvas labels, status tables, timestamps.
- **Code:** JetBrains Mono (weight 400).
- **Loading:** Google Fonts CDN for preview; npm `geist` package for production (full glyph set + font-feature-settings).

### Type Scale

| Level     | Size | Weight | Tracking    | Use                          |
|-----------|------|--------|-------------|------------------------------|
| hero      | 48px | 600    | -0.04em     | Page titles, empty states    |
| title     | 32px | 600    | -0.03em     | Section headings             |
| subtitle  | 20px | 500    | -0.02em     | Subsections, modal titles    |
| body      | 16px | 400    | normal      | Body text, descriptions      |
| label     | 13px | 500    | normal      | Buttons, form labels, nav    |
| caption   | 11px | 400    | normal      | Timestamps, metadata         |

### Rules (from typeset skill)

- Body text at 16px minimum on desktop (Rule 14)
- Line length 45–75 characters, target 66 (Rule 15)
- Line height 1.5 for body, tighter for headings (Rule 16)
- Two typeface families max (Rule 67)
- Never set body text with a display face (Rule 21)

## Color

- **Approach:** Monochromatic + one accent. OKLCH for perceptual uniformity.

### Primitive Palette — OKLCH Gray Scale (0° saturation)

| Level | OKLCH             | Intent                              |
|-------|-------------------|-------------------------------------|
| 0     | oklch(0.99 0 0)   | Near-white background               |
| 1     | oklch(0.97 0 0)   | Subtle surface, hover               |
| 2     | oklch(0.93 0 0)   | Visible border                      |
| 3     | oklch(0.87 0 0)   | Medium border, muted element        |
| 4     | oklch(0.78 0 0)   | —                                   |
| 5     | oklch(0.68 0 0)   | Large text, icons                   |
| 6     | oklch(0.56 0 0)   | Body text                           |
| 7     | oklch(0.45 0 0)   | Emphasized text                     |
| 8     | oklch(0.36 0 0)   | Strong emphasis                     |
| 9     | oklch(0.27 0 0)   | Near-black, maximum contrast        |

### Primitive Palette — Teal Accent (H≈175°)

| Level | OKLCH                  | Chroma |
|-------|------------------------|--------|
| 0     | oklch(0.97 0.02 175)   | 0.02   |
| 1     | oklch(0.93 0.04 175)   | 0.04   |
| 2     | oklch(0.87 0.08 175)   | 0.08   |
| 3     | oklch(0.78 0.12 175)   | 0.12   |
| 4     | oklch(0.68 0.14 175)   | 0.14   |
| 5     | oklch(0.56 0.13 175)   | 0.13   |
| 6     | oklch(0.45 0.11 175)   | 0.11   |
| 7     | oklch(0.36 0.09 175)   | 0.09   |
| 8     | oklch(0.27 0.07 175)   | 0.07   |
| 9     | oklch(0.17 0.04 175)   | 0.04   |

### Semantic Tokens — Two-Layer Architecture

Primitives (raw OKLCH values) are never referenced in components. Semantic tokens map primitives to roles and are the only tokens used in code.

**Tailwind v4 convention:** Tokens defined in `@theme {}` blocks use the `--color-` prefix (e.g., `--color-primary`, `--color-muted-foreground`). In Tailwind utility classes, reference as `text-primary`, `bg-muted`, etc. The table below uses short names for readability — prepend `--color-` for the CSS custom property name.

**Light mode:**

| Token                    | Maps to    | Intent     |
|--------------------------|------------|------------|
| `--background`           | white      | anchor     |
| `--foreground`           | gray-9     | foreground |
| `--surface`              | gray-0     | surface    |
| `--surface-foreground`   | gray-9     | foreground |
| `--muted`                | gray-1     | container  |
| `--muted-foreground`     | gray-6     | foreground |
| `--primary`              | teal-5     | emphasis   |
| `--primary-foreground`   | white      | anchor     |
| `--secondary`            | gray-1     | container  |
| `--secondary-foreground` | gray-8     | foreground |
| `--destructive`          | red-6      | emphasis   |
| `--destructive-foreground`| white     | anchor     |
| `--border`               | gray-2     | decorative |
| `--input`                | gray-2     | decorative |
| `--ring`                 | teal-4     | emphasis   |

**Dark mode:**

| Token                    | Maps to           |
|--------------------------|-------------------|
| `--background`           | oklch(0.07 0 0)   |
| `--foreground`           | gray-0             |
| `--surface`              | oklch(0.11 0 0)   |
| `--muted`                | gray-8             |
| `--muted-foreground`     | gray-3             |
| `--primary`              | teal-4             |
| `--primary-foreground`   | oklch(0.12 0 0)   |
| `--secondary`            | gray-8             |
| `--secondary-foreground` | gray-1             |
| `--border`               | oklch(0.20 0 0)   |
| `--input`                | oklch(0.20 0 0)   |
| `--ring`                 | teal-4             |

### Semantic Status Colors (used sparingly)

| Status  | Light mode OKLCH          | Dark mode OKLCH           |
|---------|---------------------------|---------------------------|
| Success | oklch(0.56 0.14 145)      | oklch(0.62 0.16 145)      |
| Warning | oklch(0.56 0.14 85)       | oklch(0.62 0.16 85)       |
| Error   | oklch(0.56 0.18 25)       | oklch(0.62 0.20 25)       |
| Info    | oklch(0.56 0.14 250)      | oklch(0.62 0.16 250)      |

### Token Intent Rules (from colorize skill)

| Intent     | Description                          | Adjustment policy                                    |
|------------|--------------------------------------|------------------------------------------------------|
| anchor     | Pure white, pure black, brand        | Never modify. Adjust the *other* token.              |
| surface    | Page/section backgrounds             | Minimal drift (±0.03 L). Prefer adjusting foreground.|
| container  | Tinted component backgrounds         | Moderate drift. Preserve tint.                       |
| foreground | Text, icons                          | Largest allowed drift. Primary contrast lever.        |
| decorative | Borders, dividers                    | Moderate drift. 3:1 threshold.                       |
| emphasis   | Primary accent, status base          | Moderate drift. Hue must not shift.                  |

### Contrast Guarantees (from colorize skill)

- 5 levels apart in the scale → ≥ 4.5:1 (WCAG AA normal text)
- 4 levels apart → ≥ 3.0:1 (WCAG AA large text / icons)
- Design in OKLCH, always validate with WCAG relative luminance formula
- Use APCA as supplementary check for dark mode tuning

## Spacing

- **Base unit:** 4px
- **Density:** Comfortable
- **Scale:** Tailwind default (4px increments):

| Token | Value  | Pixels |
|-------|--------|--------|
| 1     | 0.25rem| 4px    |
| 2     | 0.5rem | 8px    |
| 3     | 0.75rem| 12px   |
| 4     | 1rem   | 16px   |
| 6     | 1.5rem | 24px   |
| 8     | 2rem   | 32px   |
| 12    | 3rem   | 48px   |
| 16    | 4rem   | 64px   |
| 24    | 6rem   | 96px   |

### Rules (from shadcn skill)

- No arbitrary spacing values without documented justification
- Page containers use responsive padding (`px-4 md:px-8 lg:px-12`)
- `gap-*` on all flex/grid containers instead of margin hacks
- Zero hardcoded color utilities in component code

## Layout

- **Approach:** Sidebar-plus-canvas, content-forward
- **Navigation model:** Persistent collapsible sidebar (left) + full-viewport main content (right)
- **Max content width:** 720px for documentation/settings, full viewport for canvas

### Spatial Hierarchy

| Zone | Purpose | Size |
|------|---------|------|
| Sidebar | Project/component navigation, mode switching | 240px expanded, 48px collapsed (Cmd+B) |
| Context bar | Mode + project breadcrumb | Full width, ~28px |
| Main content | Canvas, prototype viewer, or component sandbox | Remaining viewport |

### Mode Architecture

| Mode | Primary focus | Sidebar | Main content |
|------|--------------|---------|--------------|
| Wireflow | Spatial flow canvas | Expanded, screens tab | React Flow canvas with nodes + edges + stickies |
| Prototype | Interactive screen | Auto-collapsed | Fullscreen device frame with live screen |
| Component Sandbox | Variant browser | Expanded, components tab | Variant preview canvas with dot grid |

### Information Hierarchy (user sees: first → last)

**Wireflow:** Screen nodes → edges (flow) → sticky notes → sidebar screen list → context bar
**Prototype:** Screen in device frame → comment indicators → exit control → sidebar (hidden)
**Sandbox:** Component preview → variant tabs → component metadata → sidebar

### Mode Transitions

| From | To | Trigger | Animation |
|------|----|---------|-----------|
| Wireflow | Prototype | Double-click screen node (or Enter on selected) | Spring zoom into device frame (Gentle preset) — the signature animation |
| Prototype | Wireflow | "Back to wireflow" button / Escape key | Spring zoom out, canvas restores scroll position |
| Any | Component Sandbox | Click component in sidebar | Crossfade (150ms, `--ease-swift`) |
| Sandbox | Wireflow | Click project in sidebar | Crossfade (150ms, `--ease-swift`) |

The wireflow↔prototype transition is Protoflow's signature moment — spring physics, not CSS duration. All other mode switches use a quick crossfade to stay invisible.

### Border Radius

Single base `--radius: 0.5rem` with `calc()` derivations:

| Token      | Formula                     | Use                            |
|------------|-----------------------------|---------------------------------|
| `--radius-sm`  | `calc(var(--radius) * 0.5)` | Tags, badges, small elements   |
| `--radius-md`  | `var(--radius)`             | Buttons, inputs, alerts        |
| `--radius-lg`  | `calc(var(--radius) * 1.5)` | Cards, screen nodes            |
| `--radius-xl`  | `calc(var(--radius) * 2)`   | Mockup containers, modals      |
| `--radius-2xl` | `calc(var(--radius) * 3)`   | Device frames                  |
| `--radius-full`| `9999px`                    | Avatars, pills                 |

## Interaction States

Every feature specifies what the user **sees** in each state. Empty states include warmth, a primary action, and context — never bare "No items found."

| Feature | Loading | Empty | Error | Success | Partial |
|---------|---------|-------|-------|---------|---------|
| **Canvas (wireflow)** | Dot grid visible, nodes fade in via spring (Quick preset) | Layers icon + "Select a project from the sidebar" + muted helper showing `src/projects/` path | Inline error card on failed screen component with retry | — | Some nodes loaded, failed nodes show error badge |
| **Prototype viewer** | Device frame visible, screen content fades in | Layers icon + "No screen selected" | Red-bordered device frame + error message + "Back to wireflow" CTA | — | — |
| **Component sandbox** | Dot grid visible, variant card fades in | "No variants defined" + code hint showing `variants.tsx` structure | Variant card with error boundary fallback + component name | — | Some variants render, failed ones show inline error |
| **Sidebar — projects** | Skeleton lines (3 items, 16px height, `--muted` bg, pulse) | "No projects yet" + "Create a folder in `src/projects/`" | — | — | — |
| **Sidebar — search** | — | "No matches" + muted search term echo | — | — | — |
| **Collaboration** | — | — | Small dot indicator: `--error` color, "Disconnected — reconnecting" tooltip | Green dot indicator, no text (invisible = working) | Amber dot, "Syncing…" |
| **Comments** | Skeleton bubble (single line, pulse) | "No comments yet" + "Click any text element to start" | "Failed to sync" + retry link | Comment appears with subtle spring entrance | — |
| **Sticky notes** | — | New sticky with placeholder "Type here…" in muted text | — | — | — |

### Empty State Tiers

| Tier | When | Treatment |
|------|------|-----------|
| **Primary** | Full-screen empty (no project, no screen) | Icon in `rounded-xl` container with `--accent-subtle` bg + primary text + helper text + optional CTA |
| **Secondary** | Panel-level empty (no search results, no variants) | Icon only (no container), 20×20px, `--muted-foreground` + primary text + helper text |
| **Inline** | Row-level empty (no comments on element) | Text only — "No comments yet" in `--muted-foreground`, `text-caption` |

Common rules:
- **Primary text** — `text-label` (13px, weight 500), `--foreground`
- **Helper text** — `text-caption` (11px, weight 400), `--muted-foreground`, inline `code` for file paths
- **Icon** — Contextual to the feature, never the same icon for every empty state

### Skeleton Pattern

Loading skeletons use `--muted` background with a subtle pulse animation (opacity 0.5 → 1, 1.5s ease-in-out infinite). Respect `prefers-reduced-motion` — static `--muted` background with no pulse.

## Shadows

Layered composites — a 1px border shadow as foundation, additive blur layers on top. No hard `border` property used for structural edges.

| Token       | Composition                                                                        |
|-------------|------------------------------------------------------------------------------------|
| `--shadow-border` | `0 0 0 1px oklch(0 0 0 / 0.05)`                                              |
| `--shadow-sm`     | border + `0 2px 2px oklch(0 0 0 / 0.04)`                                    |
| `--shadow-md`     | border + `0 2px 2px oklch(0 0 0 / 0.04)` + `0 8px 8px -8px oklch(0 0 0 / 0.04)` |
| `--shadow-lg`     | border + `0 2px 2px oklch(0 0 0 / 0.04)` + `0 8px 16px -4px oklch(0 0 0 / 0.04)` |
| `--shadow-menu`   | border + 3-layer progressive blur                                             |

Dark mode: `--shadow-border-color` flips to `oklch(1 0 0 / 0.06)`.

## Motion

- **Approach:** Spring-physics-first via `motion/react`
- No CSS `transition-duration` as the primary motion system. Springs resolve naturally.

### Spring Presets

| Name    | Stiffness | Damping | Mass | Use                        |
|---------|-----------|---------|------|----------------------------|
| Quick   | 500       | 30      | 0.5  | Hover states, small UI     |
| Default | 350       | 34      | 1    | General transitions        |
| Gentle  | 200       | 20      | 0.8  | Mode toggles, overlays     |

### Easing (non-spring fallback)

| Name    | Value                                    | Use                     |
|---------|------------------------------------------|-------------------------|
| Swift   | `cubic-bezier(0.23, 0.88, 0.26, 0.92)`  | General CSS transitions |
| Overlay | `cubic-bezier(0.175, 0.885, 0.32, 1.1)` | Popover/modal entrance  |

### Rules

- The wireflow↔prototype toggle uses spring physics — the signature animation.
- Everything else is 100–200ms or spring-resolved.
- Respect `prefers-reduced-motion`: disable all animations, instant transitions.

## Responsive

Canvas-based builder tool — mobile is gated ("Best experienced on desktop"). Responsive specs cover desktop viewport ranges and canvas zoom behavior.

### Viewport Breakpoints

| Breakpoint | Range | Behavior |
|------------|-------|----------|
| **Mobile** | < 768px | Gate screen: Layers icon + "Best experienced on desktop" + muted helper. No canvas. |
| **Tablet portrait** | 768–1024px | Sidebar auto-collapsed (48px), canvas fills remainder. Mode toggle in toolbar. |
| **Narrow desktop** | 1024–1280px | Sidebar expanded (240px) but collapsible. Tighter chrome padding. |
| **Desktop** | > 1280px | Full layout. Sidebar expanded, generous canvas space. |

### Canvas Zoom

| Property | Value |
|----------|-------|
| **Default zoom** | Fit-to-content on project load (all nodes visible with 48px padding) |
| **Min zoom** | 0.1 (overview of large flows) |
| **Max zoom** | 2.0 (detail inspection) |
| **Zoom controls** | Scroll wheel + pinch. Cmd+0 to reset to fit-to-content. |
| **Pan** | Click-drag on canvas background. Space+drag as alternative. |

## Accessibility

### ARIA Landmarks

| Element | Role | Label |
|---------|------|-------|
| App shell | `application` | "Protoflow" |
| Sidebar | `nav` | "Workspace navigation" |
| Context bar | `status` with `aria-live="polite"` | Current mode + project |
| Canvas | `main` | "Wireflow canvas" / "Prototype viewer" / "Component sandbox" |

### Keyboard Navigation

| Context | Key | Action |
|---------|-----|--------|
| **Sidebar** | Tab | Move between sidebar items (standard focus order) |
| | Enter | Select project/component, switch mode |
| | Cmd+B | Toggle sidebar collapse/expand |
| **Canvas (wireflow)** | Tab | Cycle through screen nodes |
| | Enter | Open selected screen in prototype mode |
| | Delete/Backspace | Delete selected sticky note |
| | Escape | Deselect current node |
| **Prototype** | Escape | Exit to wireflow |
| | Tab | Cycle through hotspot elements (`data-pf-action`) |
| **Global** | Cmd+B | Toggle sidebar |

### Focus Management

| Transition | Focus moves to |
|------------|---------------|
| Enter prototype mode | First hotspot element in the screen, or the screen container |
| Exit prototype mode | The screen node that was opened (restore selection) |
| Switch project | First screen node in new project canvas |
| Open component sandbox | First variant tab |
| Sidebar collapse | Main content area |

### Touch Targets

Minimum 44×44px for interactive elements. Current exceptions that need fixing:
- Connection handles: currently 8×8px visual, need 44×44px hit area (invisible padding)
- Comment dots: 28px visual, need 44×44px hit area

### Contrast & Motion

- Defined in Color section: 5 levels apart → ≥ 4.5:1 (WCAG AA)
- `prefers-reduced-motion`: all animations instant, no pulse, no springs
- Focus ring: 2px solid `--ring`, 2px offset, on `:focus-visible` only

## Protoflow Components

Canvas-specific components that extend the base token system. These define the visual identity of the workspace.

### Screen Node

The primary canvas object — a scaled-down preview of a real React screen inside a card.

| Property | Value |
|----------|-------|
| **Container** | `--radius-lg`, `border-2`, `--shadow-md` (elevated to `--shadow-lg` on selection) |
| **Header** | Screen label in 10px weight-500 mono, `--muted` background at 50% opacity, `border-b` |
| **Preview** | Actual React component rendered at `PREVIEW_SCALE` (0.25), `pointer-events-none` |
| **Selection** | Border color → `--primary`, shadow → `--shadow-lg` |
| **Hover** | Overlay with `black/30`, Play icon + "Double-click to preview" in white |
| **Handles** | Left (target) + Right (source), `--primary` fill, 8×8px circles |
| **Error** | Red-tinted card with error icon, truncated message (80 chars), error boundary |
| **Loading** | Skeleton with 5 pulse lines, varying widths |

### Edge

Connection lines between screen nodes representing user flow transitions.

| Type | Color | Badge |
|------|-------|-------|
| **Navigation** | `--edge-navigation` (blue) | 12% tinted bg, 85% darkened text, 30% border |
| **Conditional** | `--edge-conditional` (amber) | Same badge formula as navigation |
| **Back** | `--edge-back` (purple) | Same badge formula as navigation |

Badges use `color-mix(in oklch, ...)` for consistent tinting across themes. Labels positioned at edge midpoint.

### Sticky Note

Colored annotation cards placed on the canvas for team commentary.

| Property | Value |
|----------|-------|
| **Size** | min 140px, max 200px width |
| **Colors** | Yellow, Blue, Green, Pink — each with fill + border token pair |
| **Selection** | `ring-2 ring-primary/30`, elevated shadow |
| **Editing** | Double-click to edit, textarea with `bg-transparent`, Escape to commit |
| **Placeholder** | "Double-click to edit..." in `--foreground` at 80% opacity |
| **Typography** | 12px, leading-relaxed |

### Device Frame

Chrome wrappers for prototype mode. Three variants:

| Frame | Shell | Chrome |
|-------|-------|--------|
| **iPhone 15** | `rounded-[40px]`, 3px border `#1a1a1a`, Dynamic Island pill | Inner radius 32px, home indicator bar |
| **Web Desktop** | `--radius-lg`, `--border`, traffic light dots (red/yellow/green) | Address bar with "protoflow.local" |
| **Web Mobile** | `--radius-lg`, `--border`, max 375px, smaller traffic lights | Minimal chrome, no address bar |

### Comment Dot

Collaboration indicator anchored to commentable text elements.

| State | Appearance |
|-------|------------|
| **No comments, idle** | 28px circle, blue fill, 30% opacity, `MessageCircle` icon |
| **No comments, hover** | Opacity → 100% |
| **Has comments** | 28px circle, blue fill, 100% opacity, comment count in white bold |
| **Thread open** | 256px popover, `--border`, `--shadow-lg`, comment list + input |

### Hotspot Affordance (Prototype Mode)

Elements marked with `data-pf-action` are clickable in prototype mode but have no visual indicator by default ("the interface disappears"). Affordance appears on proximity:

| State | Visual |
|-------|--------|
| **Idle** | No indicator — element looks native |
| **Cursor within 8px** | Faint `--ring` outline (2px, 30% opacity) fades in via Quick spring |
| **Hover** | `--ring` outline at 60% opacity, subtle cursor change |
| **Click** | Brief `--primary` flash (100ms), then navigate to target screen |

### Variant Reactions (Component Sandbox)

Binary feedback on component variants for viewer collaboration.

| Element | Visual |
|---------|--------|
| **Thumbs up** | Ghost button, 20px icon, `--muted-foreground` → `--success` when active |
| **Thumbs down** | Ghost button, 20px icon, `--muted-foreground` → `--error` when active |
| **Count** | 11px mono, `--muted-foreground`, positioned beside each thumb |
| **Position** | Below variant preview card, left-aligned |

### Connection Status Indicator

Collaboration sync state (when `VITE_PARTYKIT_HOST` is configured).

| State | Visual |
|-------|--------|
| **Connected** | 6px `--success` dot, no label (invisible = working) |
| **Disconnected** | 6px `--error` dot, "Disconnected" tooltip |
| **Reconnecting** | 6px `--warning` dot, "Syncing…" tooltip, pulse animation |

## Unresolved & Deferred

| Decision | Status | Rationale |
|----------|--------|-----------|
| Minimap on canvas | Deferred | React Flow supports minimap but no design spec yet. Add when flow complexity warrants it. |
| Multi-user cursor presence | Deferred | Collaboration syncs comments but not cursor position. Would need Yjs awareness protocol. |

## Decisions Log

| Date       | Decision                          | Rationale                                                   |
|------------|-----------------------------------|-------------------------------------------------------------|
| 2026-03-27 | Initial design system created     | `/design-consultation` based on competitive research + Rauno/DD/Linear/Vercel/Campsite references |
| 2026-03-27 | OKLCH for all color definitions   | Perceptual uniformity, structural contrast guarantees (colorize skill) |
| 2026-03-27 | Geist as single sans-serif        | Vercel lineage, designed for dev tools, user preference      |
| 2026-03-27 | JetBrains Mono as only mono       | Proven, excellent ligatures, pairs well with Geist           |
| 2026-03-27 | Teal accent (H≈175°)              | Distinct from blue (every other tool), bridges Fullscript/Heron context |
| 2026-03-27 | Two-layer token architecture      | Primitive→Semantic mapping enables rebranding with zero component changes (shadcn skill) |
| 2026-03-27 | 10-step color scales              | Stripe-style lightness curves with level-distance contrast guarantees (colorize skill) |
| 2026-03-27 | Layered shadow composites         | DD/Devouring Details pattern — border shadow + additive blur layers |
| 2026-03-27 | Spring-physics-first motion       | motion/react springs, no arbitrary CSS durations (DD/Rauno pattern) |
| 2026-03-27 | Reduced header weights (600 max)  | User preference — semibold over bold/black for refined feel  |
| 2026-03-27 | Migration gap acknowledged         | Codebase uses Inter + hex colors + `--color-*` Tailwind v4 tokens. Migration to Geist + full OKLCH pending. |
| 2026-03-27 | Binary variant reactions            | Thumbs up/down per component variant, count displayed, synced via collaboration layer |
| 2026-03-27 | Hotspot hover-proximity affordance | Faint `--ring` outline on `data-pf-action` elements when cursor is within 8px. Invisible otherwise. |
| 2026-03-27 | Dark mode implemented              | `.dark` class on `<html>`, localStorage persistence (`protoflow-theme`), system preference fallback, inline script prevents FOUC |
| 2026-03-27 | UI spacing/typography polish       | Aligned to DESIGN.md comfortable density + type scale (label=13px, caption=11px), replaced Tailwind shadows with layered composites |
| 2026-03-28 | shadcn/ui as component primitive layer | Composable, accessible, token-driven. Matches existing CVA + tailwind-merge stack. Avoids reimplementing sidebar collapse/keyboard/mobile patterns. |

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Codex Review | `/codex review` | Independent 2nd opinion | 1 | ISSUES | claude subagent only (codex unavailable) |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | CLEAR | 8 issues, 0 critical gaps, mode: FULL_REVIEW |
| Design Review | `/plan-design-review` | UI/UX gaps | 1 | CLEAR | score: 5/10 → 8/10, 6 decisions made |

- **UNRESOLVED:** 0 across all reviews
- **VERDICT:** ENG + DESIGN CLEARED — ready to implement. Consider re-running eng review after design system migration (current review predates DESIGN.md changes).
