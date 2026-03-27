import { useCallback, useEffect, useRef, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { WorkspaceProvider, useWorkspace } from "@/sandbox/store";
import { useCollaboration } from "@/sandbox/useCollaboration";
import { discoverProjects, getAvailableScreenIds } from "@/sandbox/registry";
import { computeLayout } from "@/lib/layout";
import { parseHash, navigateTo as rawNavigateTo } from "@/lib/router";
import WireflowView from "@/components/WireflowView";
import PrototypeView from "@/components/PrototypeView";
import ComponentSandbox from "@/components/ComponentSandbox";
import Sidebar from "@/components/Sidebar";
import ViewerNamePrompt from "@/components/ViewerNamePrompt";
import { Layers } from "lucide-react";
import type { ScreenId, StickyColor } from "@/types";

function WorkspaceApp() {
  const store = useWorkspace();
  const activeProjectId = store.workspace.activeProjectId;
  const collabProjectId =
    activeProjectId && store.mode !== "component-sandbox"
      ? `protoflow-${activeProjectId}`
      : null;
  const collab = useCollaboration(collabProjectId);

  const [promptingName, setPromptingName] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    const projects = discoverProjects();
    for (const project of projects) {
      store.registerProject(project.id, project.screenIds);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [needsLayout, setNeedsLayout] = useState(false);

  useEffect(() => {
    if (!activeProjectId) return;
    const screenIds = getAvailableScreenIds(activeProjectId);
    const project = store.workspace.projects[activeProjectId];
    if (!project) return;

    const existingComponentIds = new Set(
      Object.values(project.screens).map((s) => s.componentId)
    );
    let added = false;
    for (const componentId of screenIds) {
      if (!existingComponentIds.has(componentId)) {
        store.addScreen(activeProjectId, componentId, { x: 0, y: 0 });
        added = true;
      }
    }
    if (added) setNeedsLayout(true);
  }, [activeProjectId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!needsLayout || !activeProjectId) return;
    const project = store.workspace.projects[activeProjectId];
    if (!project) return;
    const { positions } = computeLayout(project.screens, project.edges);
    for (const [id, pos] of Object.entries(positions)) {
      store.updateScreenPosition(id, pos);
    }
    setNeedsLayout(false);
  }, [needsLayout, activeProjectId, store]); // eslint-disable-line react-hooks/exhaustive-deps

  const storeRef = useRef(store);
  storeRef.current = store;
  const programmaticNavRef = useRef(false);

  const navigateTo = useCallback(
    (...args: Parameters<typeof rawNavigateTo>) => {
      programmaticNavRef.current = true;
      rawNavigateTo(...args);
      // If hash didn't change, rawNavigateTo is a no-op and no hashchange fires.
      // Reset after the event loop gives hashchange a chance to fire and clear the flag.
      setTimeout(() => {
        programmaticNavRef.current = false;
      }, 0);
    },
    []
  );

  useEffect(() => {
    function onHashChange() {
      if (programmaticNavRef.current) {
        programmaticNavRef.current = false;
        return;
      }
      const route = parseHash(window.location.hash);
      const s = storeRef.current;
      switch (route.type) {
        case "project":
          if (!s.workspace.projects[route.projectId]) break;
          s.setActiveProject(route.projectId);
          if (route.mode === "prototype" && "screenId" in route) {
            s.setMode("prototype");
            s.setActiveScreenId(route.screenId);
          } else {
            s.setMode("wireflow");
          }
          break;
        case "component":
          s.setActiveComponent(route.componentId);
          break;
        case "none":
          break;
      }
    }

    if (window.location.hash) {
      onHashChange();
    }

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
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
      const project = activeProjectId ? store.workspace.projects[activeProjectId] : null;
      if (!project) return;
      const sourceScreen = project.screens[source];
      const targetScreen = project.screens[target];
      if (!sourceScreen || !targetScreen) return;

      store.addEdge({
        source,
        target,
        trigger: `Go to ${targetScreen.label}`,
        type: "navigation",
      });
    },
    [store, activeProjectId]
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
      if (activeProjectId) {
        navigateTo({
          type: "project",
          projectId: activeProjectId,
          mode: "prototype",
          screenId: id,
        });
      }
    },
    [store, activeProjectId]
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
    if (activeProjectId) {
      navigateTo({ type: "project", projectId: activeProjectId, mode: "wireflow" });
    }
  }, [store, activeProjectId]);

  const handleAddComment = useCallback(
    (screenId: string, anchorId: string, body: string) => {
      ensureName(() => {
        collab.addComment(screenId, anchorId, body);
      });
    },
    [collab, ensureName]
  );

  const activeProject = activeProjectId
    ? store.workspace.projects[activeProjectId] ?? null
    : null;

  const contextLabel =
    store.mode === "component-sandbox" && store.workspace.activeComponentId
      ? `Sandbox: ${store.workspace.activeComponentId}`
      : store.mode === "prototype" && activeProject
        ? `Prototype: ${activeProject.meta.name}`
        : activeProject
          ? `Wireflow: ${activeProject.meta.name}`
          : "";

  const renderMainContent = (): React.ReactNode => {
    if (store.mode === "wireflow") {
      if (!activeProject || !activeProjectId) {
        return (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <div className="rounded-xl bg-accent-subtle p-3">
              <Layers className="h-6 w-6 text-accent" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Select a project from the sidebar
            </p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Or create a new project folder in{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                src/projects/
              </code>
            </p>
          </div>
        );
      }
      return (
        <ReactFlowProvider>
          <WireflowView
            project={activeProject}
            projectId={activeProjectId}
            onNodeDragStop={handleNodeDragStop}
            onConnect={handleConnect}
            onStickyBodyChange={handleStickyBodyChange}
            onScreenSelect={handleScreenSelect}
            onDeleteSticky={handleDeleteSticky}
            onAddSticky={handleAddSticky}
          />
        </ReactFlowProvider>
      );
    }

    if (store.mode === "prototype") {
      if (!activeProject || !activeProjectId || !store.activeScreenId) {
        return (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <div className="rounded-xl bg-accent-subtle p-3">
              <Layers className="h-6 w-6 text-accent" />
            </div>
            <p className="text-sm font-medium text-foreground">
              No screen selected
            </p>
          </div>
        );
      }
      return (
        <PrototypeView
          project={activeProject}
          projectId={activeProjectId}
          initialScreenId={store.activeScreenId}
          onExitPrototype={handleExitPrototype}
          collaboration={collab}
          onAddComment={handleAddComment}
        />
      );
    }

    if (store.mode === "component-sandbox") {
      return <ComponentSandbox />;
    }

    const _exhaustive: never = store.mode;
    return _exhaustive;
  };

  return (
    <div className="flex h-full flex-col" role="application" aria-label="Protoflow">
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center md:hidden">
        <Layers className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm font-medium text-foreground">
          Best experienced on desktop
        </p>
        <p className="text-xs text-muted-foreground">
          Protoflow needs a wider viewport for the wireflow canvas.
        </p>
      </div>

      <div className="hidden h-full md:flex">
        {promptingName && (
          <ViewerNamePrompt
            onSubmit={handleNameSubmit}
            onCancel={handleNameCancel}
          />
        )}

        <Sidebar />

        <div className="flex flex-1 flex-col overflow-hidden">
          {contextLabel && (
            <div className="border-b border-border px-4 py-1.5" aria-live="polite">
              <span className="text-xs text-muted-foreground">{contextLabel}</span>
            </div>
          )}
          <main className="relative flex-1">{renderMainContent()}</main>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <WorkspaceProvider>
      <WorkspaceApp />
    </WorkspaceProvider>
  );
}
