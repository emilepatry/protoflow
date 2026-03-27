# Protoflow

Multi-project prototype workspace with wireflow canvas, interactive prototype mode, and shared component library. Build real React screens, connect them into flows, preview in a device frame, and browse reusable components in a variant sandbox.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Adding Screens

Create a new file in `src/projects/<project-name>/screens/`. The filename becomes the screen ID, and the project folder becomes the project ID.

```tsx
// src/projects/mobile-onboarding/screens/welcome.tsx
export default function WelcomeScreen() {
  return (
    <div className="flex min-h-[667px] w-[375px] flex-col bg-white p-5">
      <h1 data-pf-id="welcome-title">Welcome</h1>
      <button data-pf-action="get-started">Get Started</button>
    </div>
  );
}
```

The project and screen are automatically discovered and appear in the sidebar.

## Adding Library Components

Create a folder in `src/library/<component-name>/` with `component.tsx` and `variants.tsx`:

```tsx
// src/library/card/component.tsx
export default function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border p-4">{children}</div>;
}

// src/library/card/variants.tsx
import type { ComponentVariant } from "@/types";
import Card from "./component";

export const variants: ComponentVariant[] = [
  { name: "Default", render: () => <Card>Content</Card> },
  { name: "Empty", render: () => <Card /> },
];
```

Components appear in the sidebar's "Components" tab and render in the variant sandbox.

## Data Attributes

- `data-pf-id` — marks a text element as editable and commentable
- `data-pf-action` — marks an interactive element for hotspot navigation

## URL Routing

Hash-based routes for deep linking:

- `#/projects/mobile-onboarding` — project wireflow
- `#/projects/mobile-onboarding/prototype/welcome` — prototype screen
- `#/components/button` — component sandbox

## Collaboration

Start the PartyKit server alongside the Vite dev server:

```bash
npm run dev:collab
```

Or use the environment variable to point to a deployed PartyKit instance:

```
VITE_PARTYKIT_HOST=protoflow.your-username.partykit.dev
```

Collaboration rooms are scoped per-project.

## Heron Design Tokens

Fullscript's Heron design tokens are available as CSS variables (prefixed `--heron-*`). See `src/heron-tokens.css`.

## Project Structure

```
src/
├── projects/             # Project folders (one per project)
│   └── <name>/screens/   # Screen components (one per .tsx file)
├── library/              # Shared component library
│   └── <name>/           # component.tsx + variants.tsx
├── sandbox/
│   ├── registry.ts       # Auto-discovers projects + components via import.meta.glob
│   ├── store.tsx          # Workspace state, React Context, localStorage persistence
│   ├── collaboration.ts  # Yjs CRDT collaboration provider
│   └── useCollaboration.ts # React hook for per-project collaboration
├── components/
│   ├── Sidebar.tsx           # Collapsible workspace sidebar with tabs
│   ├── ComponentSandbox.tsx  # Component variant preview canvas
│   ├── WireflowView.tsx      # React Flow canvas (wireflow mode)
│   ├── PrototypeView.tsx     # Fullscreen prototype renderer
│   ├── ScreenNode.tsx        # Custom React Flow node (scaled screen preview)
│   ├── StickyNode.tsx        # Custom React Flow node (sticky note)
│   ├── AnnotatedEdge.tsx     # Custom React Flow edge with labels
│   ├── DeviceFrame.tsx       # iPhone/desktop/mobile browser frames
│   ├── EditableText.tsx      # contentEditable wrapper with Yjs binding
│   ├── CommentDot.tsx        # Comment indicator + thread popover
│   ├── ViewerNamePrompt.tsx  # Name prompt for anonymous viewers
│   └── AppErrorBoundary.tsx  # Top-level error boundary with fallback UI
├── lib/
│   ├── router.ts     # Hash-based URL routing
│   ├── utils.ts      # cn(), device constants, localStorage helpers
│   ├── edge-config.ts # Edge type colors and badge styles
│   └── layout.ts     # Dagre-based auto-layout for screen nodes
├── types.ts          # Data model types (Workspace, Project, ViewMode)
├── heron-tokens.css  # Fullscript Heron design tokens
└── index.css         # Global styles + Tailwind + design tokens
```
