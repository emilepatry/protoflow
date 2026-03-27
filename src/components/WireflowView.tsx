import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
  type Edge,
  MarkerType,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import ScreenNode from "./ScreenNode";
import StickyNode from "./StickyNode";
import AnnotatedEdge from "./AnnotatedEdge";
import { edgeColors } from "@/lib/edge-config";
import { cn } from "@/lib/utils";
import { StickyNote } from "lucide-react";
import type { Project, ScreenId, StickyColor } from "@/types";

const nodeTypes = {
  screen: ScreenNode,
  sticky: StickyNode,
};

const edgeTypes = {
  annotated: AnnotatedEdge,
};

interface WireflowViewProps {
  project: Project;
  projectId: string;
  onNodeDragStop: (id: string, position: { x: number; y: number }) => void;
  onConnect: (source: ScreenId, target: ScreenId) => void;
  onStickyBodyChange: (id: string, body: string) => void;
  onScreenSelect: (id: ScreenId) => void;
  onDeleteSticky?: (id: string) => void;
  onAddSticky?: (color: StickyColor) => void;
}

export default function WireflowView({
  project,
  projectId,
  onNodeDragStop,
  onConnect,
  onStickyBodyChange,
  onScreenSelect,
  onDeleteSticky,
  onAddSticky,
}: WireflowViewProps) {
  const initialNodes: Node[] = useMemo(() => {
    const screenNodes: Node[] = Object.entries(project.screens).map(
      ([id, screen]) => ({
        id,
        type: "screen",
        position: screen.position,
        deletable: false,
        data: {
          label: screen.label,
          componentId: screen.componentId,
          projectId,
        },
      })
    );

    const stickyNodes: Node[] = Object.entries(project.stickies).map(
      ([id, sticky]) => ({
        id,
        type: "sticky",
        position: sticky.position,
        deletable: true,
        data: {
          body: sticky.body,
          color: sticky.color,
          onBodyChange: (body: string) => onStickyBodyChange(id, body),
        },
      })
    );

    return [...screenNodes, ...stickyNodes];
  }, [project.screens, project.stickies, onStickyBodyChange, projectId]);

  const initialEdges: Edge[] = useMemo(
    () =>
      Object.entries(project.edges).map(([id, edge]) => ({
        id,
        source: edge.source,
        target: edge.target,
        type: "annotated",
        deletable: false,
        data: {
          trigger: edge.trigger,
          logic: edge.logic,
          type: edge.type,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: edgeColors[edge.type],
          width: 16,
          height: 16,
        },
      })),
    [project.edges]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const handleConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target) {
        onConnect(params.source, params.target);
      }
    },
    [onConnect]
  );

  const handleNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onNodeDragStop(node.id, node.position);
    },
    [onNodeDragStop]
  );

  const handleNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (node.type === "screen") {
        onScreenSelect(node.id);
      }
    },
    [onScreenSelect]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        const selectedScreen = nodes.find(
          (n) => n.selected && n.type === "screen"
        );
        if (selectedScreen) {
          onScreenSelect(selectedScreen.id);
        }
      }
    },
    [nodes, onScreenSelect]
  );

  const handleNodesDelete = useCallback(
    (deleted: Node[]) => {
      for (const node of deleted) {
        if (node.id.startsWith("sticky-") && onDeleteSticky) {
          onDeleteSticky(node.id);
        }
      }
    },
    [onDeleteSticky]
  );

  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  const [showStickyPicker, setShowStickyPicker] = useState(false);
  const stickyPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        showStickyPicker &&
        stickyPickerRef.current &&
        !stickyPickerRef.current.contains(e.target as globalThis.Node)
      ) {
        setShowStickyPicker(false);
      }
    }
    document.addEventListener("pointerdown", handleClickOutside, true);
    return () => document.removeEventListener("pointerdown", handleClickOutside, true);
  }, [showStickyPicker]);

  const stickyColors: { color: StickyColor; label: string; className: string }[] = [
    { color: "yellow", label: "Yellow", className: "bg-sticky-yellow border-sticky-yellow-border" },
    { color: "blue", label: "Blue", className: "bg-sticky-blue border-sticky-blue-border" },
    { color: "green", label: "Green", className: "bg-sticky-green border-sticky-green-border" },
    { color: "pink", label: "Pink", className: "bg-sticky-pink border-sticky-pink-border" },
  ];

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onNodeDragStop={handleNodeDragStop}
        onNodeDoubleClick={handleNodeDoubleClick}
        onNodesDelete={handleNodesDelete}
        deleteKeyCode={["Delete", "Backspace"]}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultEdgeOptions={{ type: "annotated" }}
        proOptions={{ hideAttribution: true }}
        onKeyDown={handleKeyDown}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--color-dot-grid)" />
        <Controls position="bottom-right" className="!border-border !bg-background/90 !shadow-sm [&>button]:!border-border [&>button]:!bg-background [&>button:hover]:!bg-muted" />
        <MiniMap
          position="bottom-left"
          nodeColor={(n) => (n.type === "sticky" ? "var(--color-minimap-sticky)" : "var(--color-minimap-node)")}
          maskColor="var(--color-minimap-mask)"
          className="!bg-background !border-border"
        />
      </ReactFlow>

      {onAddSticky && (
        <div className="absolute bottom-4 right-24 z-10" ref={stickyPickerRef}>
          <button
            onClick={() => setShowStickyPicker(!showStickyPicker)}
            aria-expanded={showStickyPicker}
            aria-haspopup="menu"
            aria-label="Add sticky note"
            title="Add sticky note"
            className="flex items-center gap-1.5 rounded-md border border-border bg-background/90 px-3 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
          >
            <StickyNote className="h-4 w-4" />
            <span className="hidden sm:inline">Sticky</span>
          </button>
          {showStickyPicker && (
            <div role="menu" className="absolute bottom-full right-0 z-50 mb-1 min-w-[120px] rounded-lg border border-border bg-background py-1 shadow-lg">
              {stickyColors.map(({ color, label, className }) => (
                <button
                  key={color}
                  role="menuitem"
                  onClick={() => {
                    onAddSticky(color);
                    setShowStickyPicker(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-muted"
                >
                  <div className={cn("h-3 w-3 rounded-sm border", className)} aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
