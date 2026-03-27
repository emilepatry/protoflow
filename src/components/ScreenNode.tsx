import { memo, Suspense, useState, Component, type ReactNode, type ErrorInfo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Play } from "lucide-react";
import { getScreenComponent } from "@/sandbox/registry";
import { cn, DEVICE_WIDTH, DEVICE_HEIGHT, PREVIEW_SCALE } from "@/lib/utils";

export interface ScreenNodeData {
  label: string;
  componentId: string;
  projectId: string;
  [key: string]: unknown;
}

class ScreenErrorBoundary extends Component<
  { children: ReactNode; componentId: string },
  { errorMessage: string | null }
> {
  state: { errorMessage: string | null } = { errorMessage: null };

  static getDerivedStateFromError(error: unknown) {
    if (error instanceof Error) return { errorMessage: error.message };
    return { errorMessage: String(error ?? "Unknown error") };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error(`ScreenNode error in "${this.props.componentId}":`, error, info);
  }

  render() {
    if (this.state.errorMessage) {
      return (
        <div
          className="flex h-full flex-col items-center justify-center gap-2 bg-error-subtle p-4 text-center"
          style={{ width: DEVICE_WIDTH, height: DEVICE_HEIGHT }}
        >
          <div className="rounded-full bg-error-muted p-2">
            <svg className="h-5 w-5 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xs font-medium text-error-foreground">Render Error</p>
          <p className="text-[10px] leading-tight text-error">
            {this.state.errorMessage.slice(0, 80)}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

function ScreenNodeSkeleton() {
  return (
    <div
      className="flex flex-col gap-3 bg-background p-4"
      style={{ width: DEVICE_WIDTH, height: DEVICE_HEIGHT }}
    >
      <div className="h-3 w-24 animate-pulse rounded bg-muted" />
      <div className="h-3 w-32 animate-pulse rounded bg-muted" />
      <div className="h-20 w-full animate-pulse rounded-lg bg-muted" />
      <div className="h-3 w-28 animate-pulse rounded bg-muted" />
      <div className="h-3 w-20 animate-pulse rounded bg-muted" />
    </div>
  );
}

function ScreenNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as ScreenNodeData;
  const Component = getScreenComponent(nodeData.projectId, nodeData.componentId);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={cn(
        "screen-node rounded-lg border-2 bg-background shadow-md transition-shadow",
        selected ? "border-accent shadow-lg" : "border-border"
      )}
      style={{
        width: DEVICE_WIDTH * PREVIEW_SCALE + 16,
        overflow: "hidden",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Handle type="target" position={Position.Left} className="!bg-accent !w-2 !h-2" />

      <div className="border-b border-border bg-muted/50 px-2 py-1.5">
        <p className="text-[10px] font-medium truncate text-foreground">
          {nodeData.label}
        </p>
      </div>

      <div
        className="relative overflow-hidden"
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
            <Suspense fallback={<ScreenNodeSkeleton />}>
              <ScreenErrorBoundary componentId={nodeData.componentId}>
                <Component />
              </ScreenErrorBoundary>
            </Suspense>
          ) : (
            <div className="flex h-full items-center justify-center bg-muted text-sm text-muted-foreground">
              Component not found: {nodeData.componentId}
            </div>
          )}
        </div>

        {hovered && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity">
            <div className="flex flex-col items-center gap-1 text-white">
              <Play className="h-6 w-6 drop-shadow" />
              <span className="text-[10px] font-medium drop-shadow">Double-click to preview</span>
            </div>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="!bg-accent !w-2 !h-2" />
    </div>
  );
}

export default memo(ScreenNode);
