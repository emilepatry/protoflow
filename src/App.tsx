import { useCallback, useEffect, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { useProjectStore } from "@/sandbox/store";
import { useCollaboration } from "@/sandbox/useCollaboration";
import { getAvailableScreenIds } from "@/sandbox/registry";
import { computeLayout } from "@/lib/layout";
import WireflowView from "@/components/WireflowView";
import PrototypeView from "@/components/PrototypeView";
import Toolbar from "@/components/Toolbar";
import ViewerNamePrompt from "@/components/ViewerNamePrompt";
import { Layers } from "lucide-react";
import type { ScreenId, StickyColor, ViewMode } from "@/types";

export default function App() {
  const store = useProjectStore();
  const collab = useCollaboration("protoflow-default");
  const [promptingName, setPromptingName] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    const registryIds = getAvailableScreenIds();
    const existingComponentIds = new Set(
      Object.values(store.project.screens).map((s) => s.componentId)
    );
    let added = false;
    for (const componentId of registryIds) {
      if (!existingComponentIds.has(componentId)) {
        store.addScreen(componentId, { x: 0, y: 0 });
        added = true;
      }
    }
    if (added || Object.keys(store.project.screens).length > 0) {
      const { positions } = computeLayout(store.project.screens, store.project.edges);
      for (const [id, pos] of Object.entries(positions)) {
        store.updateScreenPosition(id, pos);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleNameCancel = useCallback(() => {
    setPromptingName(false);
    setPendingAction(null);
  }, []);

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
      if (source === target) return;
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

  const handleDeleteSticky = useCallback(
    (id: string) => {
      store.removeSticky(id);
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
    <div className="flex h-full flex-col" role="application" aria-label="Protoflow">
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center md:hidden">
        <Layers className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm font-medium text-foreground">Best experienced on desktop</p>
        <p className="text-xs text-muted-foreground">
          Protoflow needs a wider viewport for the wireflow canvas.
        </p>
      </div>

      <div className="hidden h-full flex-col md:flex">
      {promptingName && <ViewerNamePrompt onSubmit={handleNameSubmit} onCancel={handleNameCancel} />}

      {store.mode === "wireflow" && (
        <Toolbar
          mode={store.mode}
          onModeChange={handleModeChange}
          onAddSticky={handleAddSticky}
          projectName={store.project.meta.name}
          onProjectNameChange={(name) => store.updateMeta({ name })}
        />
      )}

      <main className="flex-1">
        {store.mode === "wireflow" ? (
          <ReactFlowProvider>
            <WireflowView
              project={store.project}
              onNodeDragStop={handleNodeDragStop}
              onConnect={handleConnect}
              onStickyBodyChange={handleStickyBodyChange}
              onScreenSelect={handleScreenSelect}
              onDeleteSticky={handleDeleteSticky}
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
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <div className="rounded-xl bg-accent-subtle p-3">
              <Layers className="h-6 w-6 text-accent" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Create a screen component in <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">src/screens/</code> to get started
            </p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Export a default React component and it will appear automatically on the wireflow canvas.
            </p>
          </div>
        )}
      </main>
      </div>
    </div>
  );
}
