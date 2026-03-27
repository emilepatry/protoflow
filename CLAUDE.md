# Protoflow — AI Context

## Design System

Always read `DESIGN.md` before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.

Key constraints:
- **Geist** is the only sans-serif. **JetBrains Mono** is the only monospace.
- All colors use **OKLCH**. No HSL, no hex in component code. Hex only in primitive declarations.
- Semantic tokens (`--primary`, `--muted-foreground`, etc.) are the only color references allowed in components.
- Shadows use layered composites via `box-shadow`, never `border` for structural edges.
- Motion uses spring physics via `motion/react`. No arbitrary CSS `transition-duration` for UI animations.
- `prefers-reduced-motion` must be respected everywhere.

In QA mode, flag any code that doesn't match `DESIGN.md`.
