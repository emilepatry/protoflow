import type { EdgeType } from "@/types";

export const edgeColors: Record<EdgeType, string> = {
  navigation: "var(--color-edge-navigation)",
  conditional: "var(--color-edge-conditional)",
  back: "var(--color-edge-back)",
};

export const edgeBadgeStyles: Record<EdgeType, React.CSSProperties> = {
  navigation: {
    background: "color-mix(in oklch, var(--color-edge-navigation) 12%, white)",
    color: "color-mix(in oklch, var(--color-edge-navigation) 85%, black)",
    borderColor: "color-mix(in oklch, var(--color-edge-navigation) 30%, white)",
  },
  conditional: {
    background: "color-mix(in oklch, var(--color-edge-conditional) 12%, white)",
    color: "color-mix(in oklch, var(--color-edge-conditional) 85%, black)",
    borderColor:
      "color-mix(in oklch, var(--color-edge-conditional) 30%, white)",
  },
  back: {
    background: "color-mix(in oklch, var(--color-edge-back) 12%, white)",
    color: "color-mix(in oklch, var(--color-edge-back) 85%, black)",
    borderColor: "color-mix(in oklch, var(--color-edge-back) 30%, white)",
  },
};
