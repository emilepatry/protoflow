import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from "@xyflow/react";
import type { EdgeType } from "@/types";
import { edgeColors, edgeBadgeStyles } from "@/lib/edge-config";

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
  markerEnd,
}: EdgeProps) {
  const edgeData = data as { trigger: string; logic?: string; type: EdgeType } | undefined;
  const edgeType: EdgeType = edgeData?.type ?? "navigation";

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 8,
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
        markerEnd={markerEnd}
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
              className="max-w-[160px] truncate rounded-md border px-2 py-0.5 text-caption font-medium shadow-sm"
              style={edgeBadgeStyles[edgeType]}
              title={edgeData.trigger}
            >
              {edgeData.trigger}
            </div>
            {edgeData.logic && (
              <div className="mt-0.5 max-w-[160px] truncate rounded bg-foreground/5 px-1.5 py-0.5 text-micro italic text-muted-foreground" title={edgeData.logic}>
                {edgeData.logic}
              </div>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
