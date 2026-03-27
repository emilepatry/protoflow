import { useState, useCallback, Suspense, useEffect, useRef } from "react";
import { getScreenComponent } from "@/sandbox/registry";
import type { Project, ScreenId, EdgeType, EdgeConfig } from "@/types";
import type { useCollaboration } from "@/sandbox/useCollaboration";
import { cn, DEVICE_WIDTH, DEVICE_HEIGHT } from "@/lib/utils";
import { ArrowLeft, ChevronRight } from "lucide-react";
import CommentDot from "./CommentDot";
import DeviceFrame from "./DeviceFrame";

interface PrototypeViewProps {
  project: Project;
  initialScreenId: ScreenId;
  onExitPrototype: () => void;
  collaboration: ReturnType<typeof useCollaboration>;
  onAddComment: (screenId: string, anchorId: string, body: string) => void;
}

type TransitionDir = "left" | "right" | "fade" | null;

const transitionForEdge: Record<EdgeType, TransitionDir> = {
  navigation: "left",
  conditional: "fade",
  back: "right",
};

function PrototypeScreenSkeleton() {
  return (
    <div
      className="flex flex-col gap-4 bg-white p-6"
      style={{ width: DEVICE_WIDTH, height: DEVICE_HEIGHT }}
    >
      <div className="h-4 w-28 animate-pulse rounded bg-gray-100" />
      <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
      <div className="h-32 w-full animate-pulse rounded-lg bg-gray-100" />
      <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
      <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
      <div className="h-20 w-full animate-pulse rounded-lg bg-gray-100" />
    </div>
  );
}

export default function PrototypeView({
  project,
  initialScreenId,
  onExitPrototype,
  collaboration,
  onAddComment,
}: PrototypeViewProps) {
  const [currentScreenId, setCurrentScreenId] = useState(initialScreenId);
  const [history, setHistory] = useState<ScreenId[]>([initialScreenId]);
  const [transition, setTransition] = useState<TransitionDir>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [commentMode, setCommentMode] = useState(false);
  const rAfRef = useRef<number>(0);
  const timeoutRef = useRef<number>(0);

  const cancelPendingTransition = useCallback(() => {
    cancelAnimationFrame(rAfRef.current);
    clearTimeout(timeoutRef.current);
  }, []);

  const screen = project.screens[currentScreenId];
  const Component = screen ? getScreenComponent(screen.componentId) : undefined;

  const outgoingEdges = Object.entries(project.edges)
    .filter(([, e]) => e.source === currentScreenId)
    .sort(([, a], [, b]) => a.trigger.localeCompare(b.trigger));

  const deduped = deduplicateEdges(outgoingEdges);
  const screenComments = collaboration.getCommentsForScreen(currentScreenId);

  const navigateTo = useCallback(
    (targetId: ScreenId, edgeType: EdgeType) => {
      if (isTransitioning) return;
      const dir = transitionForEdge[edgeType];
      setTransition(dir);
      setIsTransitioning(true);

      rAfRef.current = requestAnimationFrame(() => {
        timeoutRef.current = window.setTimeout(() => {
          setCurrentScreenId(targetId);
          setHistory((prev) => [...prev, targetId].slice(-50));
          setTransition(null);
          setIsTransitioning(false);
        }, 250);
      });
    },
    [isTransitioning]
  );

  const navigateToHistoryIndex = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      const targetId = history[index];
      if (!targetId || targetId === currentScreenId) return;
      setTransition("right");
      setIsTransitioning(true);

      rAfRef.current = requestAnimationFrame(() => {
        timeoutRef.current = window.setTimeout(() => {
          setCurrentScreenId(targetId);
          setHistory((prev) => prev.slice(0, index + 1));
          setTransition(null);
          setIsTransitioning(false);
        }, 250);
      });
    },
    [isTransitioning, history, currentScreenId]
  );

  useEffect(() => {
    cancelPendingTransition();
    setCurrentScreenId(initialScreenId);
    setHistory([initialScreenId]);
    setTransition(null);
    setIsTransitioning(false);
  }, [initialScreenId, cancelPendingTransition]);

  useEffect(() => {
    return cancelPendingTransition;
  }, [cancelPendingTransition]);

  if (!screen) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <p className="text-muted-foreground">Screen not found</p>
        <button
          onClick={onExitPrototype}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground"
        >
          Back to Wireflow
        </button>
      </div>
    );
  }

  const commentsByAnchor = new Map<string, typeof screenComments>();
  for (const c of screenComments) {
    const existing = commentsByAnchor.get(c.anchorId) ?? [];
    existing.push(c);
    commentsByAnchor.set(c.anchorId, existing);
  }

  return (
    <div className="flex h-full flex-col bg-chrome-bg">
      <div className="flex flex-1 items-center justify-center overflow-hidden">
        <div
          className={cn(
            "transition-all duration-250 ease-out",
            transition === "left" && "translate-x-[-20px] opacity-0",
            transition === "right" && "translate-x-[20px] opacity-0",
            transition === "fade" && "opacity-0 scale-95"
          )}
        >
          <DeviceFrame
            type={screen.deviceFrame ?? project.meta.defaultDeviceFrame}
          >
            {Component ? (
              <Suspense fallback={<PrototypeScreenSkeleton />}>
                <div className="relative" data-pf-screen-container>
                  <Component />
                  {commentMode && (
                    <CommentOverlay
                      screenId={currentScreenId}
                      commentsByAnchor={commentsByAnchor}
                      onAddComment={onAddComment}
                    />
                  )}
                </div>
              </Suspense>
            ) : (
              <div className="flex items-center justify-center bg-white text-muted-foreground" style={{ width: DEVICE_WIDTH, height: DEVICE_HEIGHT }}>
                Component not found: {screen.componentId}
              </div>
            )}
          </DeviceFrame>
        </div>
      </div>

      <div className="border-t border-chrome-divider bg-chrome-surface px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center gap-2">
          <button
            onClick={onExitPrototype}
            title="Back to wireflow"
            aria-label="Back to wireflow"
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Wireflow
          </button>

          <div className="mx-2 h-4 w-px bg-chrome-divider" />

          <nav className="flex min-w-0 items-center gap-1 text-xs" aria-label="Breadcrumb">
            {history.map((screenId, i) => {
              const s = project.screens[screenId];
              if (!s) return null;
              const isCurrent = i === history.length - 1;
              return (
                <span key={`${screenId}-${i}`} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight className="h-3 w-3 shrink-0 text-white/30" />}
                  {isCurrent ? (
                    <span className="max-w-[100px] truncate font-medium text-white/80" title={s.label}>{s.label}</span>
                  ) : (
                    <button
                      onClick={() => navigateToHistoryIndex(i)}
                      className="max-w-[100px] truncate text-white/40 transition-colors hover:text-white/70"
                      title={s.label}
                    >
                      {s.label}
                    </button>
                  )}
                </span>
              );
            })}
          </nav>

          <button
            onClick={() => setCommentMode(!commentMode)}
            title={commentMode ? "Exit comment mode" : "Enter comment mode"}
            aria-label={commentMode ? "Exit comment mode" : "Enter comment mode"}
            className={cn(
              "ml-2 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
              commentMode
                ? "bg-blue-500/30 text-blue-300"
                : "text-white/40 hover:bg-white/10 hover:text-white/70"
            )}
          >
            {commentMode ? "Exit Comments" : "Comments"}
            {screenComments.length > 0 && (
              <span className="ml-1.5 rounded-full bg-blue-500 px-1.5 py-0.5 text-[9px] text-white">
                {screenComments.length}
              </span>
            )}
          </button>

          {deduped.length > 0 && (
            <>
              <div className="mx-2 h-4 w-px bg-chrome-divider" />
              <div className="flex flex-1 flex-wrap gap-1.5">
                {deduped.map(([edgeId, edge]) => (
                  <button
                    key={edgeId}
                    onClick={() => navigateTo(edge.target, edge.type)}
                    disabled={isTransitioning}
                    title={edge.trigger}
                    className={cn(
                      "flex max-w-[160px] items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                      edge.type === "navigation" &&
                        "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30",
                      edge.type === "conditional" &&
                        "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30",
                      edge.type === "back" &&
                        "bg-violet-500/20 text-violet-300 hover:bg-violet-500/30",
                      isTransitioning && "opacity-50"
                    )}
                  >
                    <span className="truncate">{edge.trigger}</span>
                    <ChevronRight className="h-3 w-3 shrink-0" />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface AnchorPosition {
  pfId: string;
  top: number;
  right: number;
}

function CommentOverlay({
  screenId,
  commentsByAnchor,
  onAddComment,
}: {
  screenId: string;
  commentsByAnchor: Map<string, import("@/sandbox/collaboration").Comment[]>;
  onAddComment: (screenId: string, anchorId: string, body: string) => void;
}) {
  const [anchors, setAnchors] = useState<AnchorPosition[]>([]);

  useEffect(() => {
    const elements = document.querySelectorAll("[data-pf-id]");
    const positions: AnchorPosition[] = [];
    for (const el of elements) {
      const pfId = el.getAttribute("data-pf-id");
      if (!pfId) continue;
      const rect = el.getBoundingClientRect();
      const parentRect = el
        .closest("[data-pf-screen-container]")
        ?.getBoundingClientRect();
      if (!parentRect) continue;
      positions.push({
        pfId,
        top: rect.top - parentRect.top,
        right: parentRect.right - rect.right - 4,
      });
    }
    setAnchors(positions);
  }, [screenId]);

  return (
    <div className="pointer-events-none absolute inset-0">
      {anchors.map(({ pfId, top, right }) => {
        const comments = commentsByAnchor.get(pfId) ?? [];
        return (
          <div
            key={pfId}
            className="pointer-events-auto absolute"
            style={{ top, right }}
          >
            <CommentDot
              comments={comments}
              onAddComment={(body) => onAddComment(screenId, pfId, body)}
              className="!opacity-70 hover:!opacity-100"
            />
          </div>
        );
      })}
    </div>
  );
}

function deduplicateEdges(edges: [string, EdgeConfig][]) {
  const seen = new Set<string>();
  return edges.filter(([, e]) => {
    const key = `${e.target}:${e.actionId ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
