import dagre from "@dagrejs/dagre";
import type { ScreenConfig, EdgeConfig } from "@/types";
import { DEVICE_WIDTH, DEVICE_HEIGHT, PREVIEW_SCALE } from "@/lib/utils";

const NODE_WIDTH = DEVICE_WIDTH * PREVIEW_SCALE + 16;
const NODE_HEIGHT = DEVICE_HEIGHT * PREVIEW_SCALE + 40;

export interface LayoutResult {
  positions: Record<string, { x: number; y: number }>;
}

export function computeLayout(
  screens: Record<string, ScreenConfig>,
  edges: Record<string, EdgeConfig>
): LayoutResult {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: "LR",
    nodesep: 60,
    ranksep: 180,
    marginx: 40,
    marginy: 40,
  });

  for (const id of Object.keys(screens)) {
    g.setNode(id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }

  for (const edge of Object.values(edges)) {
    if (screens[edge.source] && screens[edge.target]) {
      g.setEdge(edge.source, edge.target);
    }
  }

  dagre.layout(g);

  const positions: Record<string, { x: number; y: number }> = {};
  for (const id of Object.keys(screens)) {
    const node = g.node(id);
    if (node) {
      positions[id] = {
        x: node.x - NODE_WIDTH / 2,
        y: node.y - NODE_HEIGHT / 2,
      };
    }
  }

  return { positions };
}
