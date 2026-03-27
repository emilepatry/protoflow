# Protoflow

Personal prototype sandbox with a wireflow/prototype mode toggle. Build real React screens, connect them into flows, toggle between an interactive prototype and a FigJam-style wireflow map, and let colleagues comment and edit text inline via a shared link.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Adding Screens

Create a new file in `src/screens/`. The filename becomes the screen ID.

```tsx
// src/screens/checkout.tsx
export default function CheckoutScreen() {
  return (
    <div className="flex min-h-[667px] w-[375px] flex-col bg-white p-5">
      <h1 data-pf-id="checkout-title">Checkout</h1>
      <button data-pf-action="confirm">Confirm Order</button>
    </div>
  );
}
```

The screen is automatically discovered and available in the toolbar's "Screen" picker.

## Data Attributes

- `data-pf-id` — marks a text element as editable and commentable
- `data-pf-action` — marks an interactive element for hotspot navigation (Phase 3)

## Collaboration (Phase 2)

Start the PartyKit server alongside the Vite dev server:

```bash
npm run dev:collab
```

Or use the environment variable to point to a deployed PartyKit instance:

```
VITE_PARTYKIT_HOST=protoflow.your-username.partykit.dev
```

## Heron Design Tokens

Fullscript's Heron design tokens are available as CSS variables (prefixed `--heron-*`). See `src/heron-tokens.css`.

## Project Structure

```
src/
├── screens/          # Screen components (one per .tsx file)
├── sandbox/
│   ├── registry.ts   # Auto-discovers screens via import.meta.glob
│   ├── store.ts      # Project state + localStorage persistence
│   ├── collaboration.ts   # Yjs CRDT collaboration provider
│   └── useCollaboration.ts # React hook for collaboration
├── components/
│   ├── WireflowView.tsx    # React Flow canvas (wireflow mode)
│   ├── PrototypeView.tsx   # Fullscreen prototype renderer
│   ├── ScreenNode.tsx      # Custom React Flow node (scaled screen preview)
│   ├── StickyNode.tsx      # Custom React Flow node (sticky note)
│   ├── AnnotatedEdge.tsx   # Custom React Flow edge with labels
│   ├── DeviceFrame.tsx     # iPhone/desktop/mobile browser frames
│   ├── EditableText.tsx    # contentEditable wrapper with Yjs binding
│   ├── CommentDot.tsx      # Comment indicator + thread popover
│   ├── ViewerNamePrompt.tsx # Name prompt for anonymous viewers
│   └── Toolbar.tsx         # Top toolbar with mode toggle
├── types.ts          # Data model types
├── heron-tokens.css  # Fullscript Heron design tokens
└── index.css         # Global styles + Tailwind
```
