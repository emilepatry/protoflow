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

const edgeBadgeClasses: Record<EdgeType, string> = {
  navigation: "bg-blue-50 text-blue-700 border-blue-200",
  conditional: "bg-amber-50 text-amber-700 border-amber-200",
  back: "bg-violet-50 text-violet-700 border-violet-200",
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
              className={cn(
                "rounded-md border px-2 py-0.5 text-[9px] font-medium leading-tight shadow-sm",
                edgeBadgeClasses[edgeType]
              )}
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
