import { memo, Suspense } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { getScreenComponent } from "@/sandbox/registry";
import { cn, DEVICE_WIDTH, DEVICE_HEIGHT } from "@/lib/utils";

export interface ScreenNodeData {
  label: string;
  componentId: string;
  [key: string]: unknown;
}

const PREVIEW_SCALE = 0.28;

function ScreenNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as ScreenNodeData;
  const Component = getScreenComponent(nodeData.componentId);

  return (
    <div
      className={cn(
        "rounded-lg border-2 bg-white shadow-md transition-shadow",
        selected ? "border-primary shadow-lg" : "border-border"
      )}
      style={{
        width: DEVICE_WIDTH * PREVIEW_SCALE + 16,
        overflow: "hidden",
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-primary !w-2 !h-2" />

      <div className="border-b border-border bg-muted/50 px-2 py-1.5">
        <p className="text-[10px] font-medium truncate text-foreground">
          {nodeData.label}
        </p>
      </div>

      <div
        className="overflow-hidden"
        style={{
          width: DEVICE_WIDTH * PREVIEW_SCALE,
          height: DEVICE_HEIGHT * PREVIEW_SCALE,
          margin: "0 auto",
        }}
      >
        <div
          className="pointer-events-none origin-top-left"
          style={{
            width: DEVICE_WIDTH,
            height: DEVICE_HEIGHT,
            transform: `scale(${PREVIEW_SCALE})`,
          }}
        >
          {Component ? (
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center bg-muted text-muted-foreground">
                  Loading...
                </div>
              }
            >
              <Component />
            </Suspense>
          ) : (
            <div className="flex h-full items-center justify-center bg-muted text-sm text-muted-foreground">
              Component not found: {nodeData.componentId}
            </div>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-primary !w-2 !h-2" />
    </div>
  );
}

export default memo(ScreenNode);
