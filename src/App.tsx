import { useCallback, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { useProjectStore } from "@/sandbox/store";
import { useCollaboration } from "@/sandbox/useCollaboration";
import WireflowView from "@/components/WireflowView";
import PrototypeView from "@/components/PrototypeView";
import Toolbar from "@/components/Toolbar";
import ViewerNamePrompt from "@/components/ViewerNamePrompt";
import type { ScreenId, StickyColor, ViewMode } from "@/types";

export default function App() {
  const store = useProjectStore();
  const collab = useCollaboration("protoflow-default");
  const [promptingName, setPromptingName] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const ensureName = useCallback(
    (action: () => void) => {
      if (collab.needsName) {
        setPendingAction(() => action);
        setPromptingName(true);
      } else {
        action();
      }
    },
    [collab.needsName]
  );

  const handleNameSubmit = useCallback(
    (name: string) => {
      collab.promptViewerName(name);
      setPromptingName(false);
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
    },
    [collab, pendingAction]
  );

  const handleNodeDragStop = useCallback(
    (id: string, position: { x: number; y: number }) => {
      if (id.startsWith("screen-")) {
        store.updateScreenPosition(id, position);
      } else if (id.startsWith("sticky-")) {
        store.updateSticky(id, { position });
      }
    },
    [store]
  );

  const handleConnect = useCallback(
    (source: ScreenId, target: ScreenId) => {
      const sourceScreen = store.project.screens[source];
      const targetScreen = store.project.screens[target];
      if (!sourceScreen || !targetScreen) return;

      store.addEdge({
        source,
        target,
        trigger: `Go to ${targetScreen.label}`,
        type: "navigation",
      });
    },
    [store]
  );

  const handleStickyBodyChange = useCallback(
    (id: string, body: string) => {
      store.updateSticky(id, { body });
    },
    [store]
  );

  const handleScreenSelect = useCallback(
    (id: ScreenId) => {
      store.setActiveScreenId(id);
      store.setMode("prototype");
    },
    [store]
  );

  const handleModeChange = useCallback(
    (mode: ViewMode) => {
      if (mode === "prototype") {
        const screenIds = Object.keys(store.project.screens);
        if (screenIds.length > 0 && !store.activeScreenId) {
          store.setActiveScreenId(screenIds[0]);
        }
      }
      store.setMode(mode);
    },
    [store]
  );

  const handleAddScreen = useCallback(
    (componentId: string, position: { x: number; y: number }) => {
      store.addScreen(componentId, position);
    },
    [store]
  );

  const handleAddSticky = useCallback(
    (color: StickyColor) => {
      store.addSticky({
        position: { x: Math.random() * 400 + 200, y: Math.random() * 300 },
        body: "",
        color,
      });
    },
    [store]
  );

  const handleExitPrototype = useCallback(() => {
    store.setMode("wireflow");
  }, [store]);

  const handleAddComment = useCallback(
    (screenId: string, anchorId: string, body: string) => {
      ensureName(() => {
        collab.addComment(screenId, anchorId, body);
      });
    },
    [collab, ensureName]
  );

  return (
    <div className="flex h-full flex-col">
      {promptingName && <ViewerNamePrompt onSubmit={handleNameSubmit} />}

      {store.mode === "wireflow" && (
        <Toolbar
          mode={store.mode}
          onModeChange={handleModeChange}
          onAddScreen={handleAddScreen}
          onAddSticky={handleAddSticky}
          projectName={store.project.meta.name}
          onProjectNameChange={(name) => store.updateMeta({ name })}
        />
      )}

      <div className="flex-1">
        {store.mode === "wireflow" ? (
          <ReactFlowProvider>
            <WireflowView
              project={store.project}
              onNodeDragStop={handleNodeDragStop}
              onConnect={handleConnect}
              onStickyBodyChange={handleStickyBodyChange}
              onScreenSelect={handleScreenSelect}
            />
          </ReactFlowProvider>
        ) : store.activeScreenId ? (
          <PrototypeView
            project={store.project}
            initialScreenId={store.activeScreenId}
            onExitPrototype={handleExitPrototype}
            collaboration={collab}
            onAddComment={handleAddComment}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">
              No screen selected. Add screens in wireflow mode first.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
