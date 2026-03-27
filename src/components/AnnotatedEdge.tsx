import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";
import type { EdgeType } from "@/types";
import { cn } from "@/lib/utils";

const edgeColors: Record<EdgeType, string> = {
  navigation: "var(--color-edge-navigation)",
  conditional: "var(--color-edge-conditional)",
  back: "var(--color-edge-back)",
};

const edgeBadgeStyles: Record<EdgeType, React.CSSProperties> = {
  navigation: { background: "color-mix(in oklch, var(--color-edge-navigation) 12%, white)", color: "color-mix(in oklch, var(--color-edge-navigation) 85%, black)", borderColor: "color-mix(in oklch, var(--color-edge-navigation) 30%, white)" },
  conditional: { background: "color-mix(in oklch, var(--color-edge-conditional) 12%, white)", color: "color-mix(in oklch, var(--color-edge-conditional) 85%, black)", borderColor: "color-mix(in oklch, var(--color-edge-conditional) 30%, white)" },
  back: { background: "color-mix(in oklch, var(--color-edge-back) 12%, white)", color: "color-mix(in oklch, var(--color-edge-back) 85%, black)", borderColor: "color-mix(in oklch, var(--color-edge-back) 30%, white)" },
};

export default function AnnotatedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps) {
  const edgeData = data as { trigger: string; logic?: string; type: EdgeType } | undefined;
  const edgeType: EdgeType = edgeData?.type ?? "navigation";

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: edgeColors[edgeType],
          strokeWidth: selected ? 2.5 : 1.5,
          strokeDasharray: edgeType === "conditional" ? "6 3" : undefined,
        }}
        markerEnd={`url(#marker-${edgeType})`}
      />
      {edgeData && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan pointer-events-auto absolute"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
          >
            <div
              className="rounded-md border px-2 py-0.5 text-[9px] font-medium leading-tight shadow-sm"
              style={edgeBadgeStyles[edgeType]}
            >
              {edgeData.trigger}
            </div>
            {edgeData.logic && (
              <div className="mt-0.5 rounded bg-foreground/5 px-1.5 py-0.5 text-[8px] italic text-muted-foreground">
                {edgeData.logic}
              </div>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
