import { useCallback, useEffect, useMemo } from "react";
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
import type { Project, ScreenId } from "@/types";

const nodeTypes = {
  screen: ScreenNode,
  sticky: StickyNode,
};

const edgeTypes = {
  annotated: AnnotatedEdge,
};

interface WireflowViewProps {
  project: Project;
  onNodeDragStop: (id: string, position: { x: number; y: number }) => void;
  onConnect: (source: ScreenId, target: ScreenId) => void;
  onStickyBodyChange: (id: string, body: string) => void;
  onScreenSelect: (id: ScreenId) => void;
  onDeleteSticky?: (id: string) => void;
}

export default function WireflowView({
  project,
  onNodeDragStop,
  onConnect,
  onStickyBodyChange,
  onScreenSelect,
  onDeleteSticky,
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
  }, [project.screens, project.stickies, onStickyBodyChange]);

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
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e4e4e7" />
        <Controls position="bottom-right" className="!border-border !bg-white/90 !shadow-sm [&>button]:!border-border [&>button]:!bg-white [&>button:hover]:!bg-muted" />
        <MiniMap
          position="bottom-left"
          nodeColor={(n) => (n.type === "sticky" ? "#fef9c3" : "#e4e4e7")}
          maskColor="rgba(0,0,0,0.08)"
          className="!bg-white !border-border"
        />
      </ReactFlow>
    </div>
  );
}
