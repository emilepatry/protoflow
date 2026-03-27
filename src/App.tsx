import { useCallback, useEffect, useRef, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { AnimatePresence, motion } from "motion/react";
import { WorkspaceProvider, useWorkspace } from "@/sandbox/store";
import { useCollaboration } from "@/sandbox/useCollaboration";
import { discoverProjects, getAvailableScreenIds } from "@/sandbox/registry";
import { computeLayout } from "@/lib/layout";
import { SPRING_GENTLE } from "@/lib/motion";
import { parseHash, navigateTo as rawNavigateTo, isViewerMode } from "@/lib/router";
import WireflowView from "@/components/WireflowView";
import PrototypeView from "@/components/PrototypeView";
import ComponentSandbox from "@/components/ComponentSandbox";
import Sidebar from "@/components/Sidebar";
import ViewerNamePrompt from "@/components/ViewerNamePrompt";
import ConnectionStatus from "@/components/ConnectionStatus";
import ThemeToggle from "@/components/ThemeToggle";
import { Toaster } from "@/components/ui/sonner";
import { useFeedbackToasts } from "@/hooks/useFeedbackToasts";
import { Layers } from "lucide-react";
import type { ScreenId, StickyColor } from "@/types";

function WorkspaceApp() {
  const store = useWorkspace();
  const [isViewer] = useState(isViewerMode);
  const activeProjectId = store.workspace.activeProjectId;
  const collabProjectId = activeProjectId
    ? `protoflow-${activeProjectId}`
    : null;
  const collab = useCollaboration(collabProjectId);

  useFeedbackToasts(collab.provider, collab.viewerName);

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

  const mainRef = useRef<HTMLElement>(null);
  const prototypeRef = useRef<HTMLDivElement>(null);
  const prevModeRef = useRef(store.mode);

  useEffect(() => {
    if (prevModeRef.current === store.mode) return;
    prevModeRef.current = store.mode;
    requestAnimationFrame(() => {
      if (store.mode === "prototype") {
        prototypeRef.current?.focus();
      } else {
        mainRef.current?.focus();
      }
    });
  }, [store.mode]);

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

  const handleAddViewerSticky = useCallback(
    (color: import("@/types").StickyColor) => {
      ensureName(() => {
        collab.addViewerSticky(color);
      });
    },
    [collab, ensureName]
  );

  const dragTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const handleViewerStickyDragStop = useCallback(
    (id: string, position: { x: number; y: number }) => {
      clearTimeout(dragTimerRef.current);
      dragTimerRef.current = setTimeout(() => {
        collab.updateViewerSticky(id, { position });
      }, 50);
    },
    [collab]
  );

  const handleViewerStickyBodyChange = useCallback(
    (id: string, body: string) => {
      collab.updateViewerSticky(id, { body });
    },
    [collab]
  );

  const handleDeleteViewerSticky = useCallback(
    (id: string) => {
      if (isViewer) {
        collab.removeViewerSticky(id);
      } else {
        collab.removeViewerStickyAsBuilder(id);
      }
    },
    [collab, isViewer]
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

  const isPrototype = store.mode === "prototype";
  const showWireflow = store.mode === "wireflow" || isPrototype;
  const hasProject = !!(activeProject && activeProjectId);

  const renderMainContent = (): React.ReactNode => {
    switch (store.mode) {
      case "component-sandbox":
        return (
          <ComponentSandbox
            reactions={collab.reactions}
            onToggleReaction={(variantId, reaction) => {
              ensureName(() => collab.toggleReaction(variantId, reaction));
            }}
            viewerName={collab.viewerName}
          />
        );
      case "wireflow":
      case "prototype":
        break;
      default: {
        const _exhaustive: never = store.mode;
        return _exhaustive;
      }
    }

    if (!hasProject) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
          <div className="rounded-xl bg-accent-subtle p-3">
            <Layers className="h-6 w-6 text-accent" />
          </div>
          <p className="text-sm font-medium text-foreground">
            {isPrototype ? "No screen selected" : "Select a project from the sidebar"}
          </p>
          {!isPrototype && (
            <p className="max-w-xs text-xs text-muted-foreground">
              Or create a new project folder in{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                src/projects/
              </code>
            </p>
          )}
        </div>
      );
    }

    return (
      <>
        {showWireflow && (
          <div
            className="absolute inset-0"
            style={{
              zIndex: 0,
              pointerEvents: isPrototype ? "none" : "auto",
            }}
          >
            <ReactFlowProvider>
              <WireflowView
                project={activeProject}
                projectId={activeProjectId}
                onNodeDragStop={isViewer ? undefined : handleNodeDragStop}
                onConnect={isViewer ? undefined : handleConnect}
                onStickyBodyChange={isViewer ? undefined : handleStickyBodyChange}
                onScreenSelect={handleScreenSelect}
                onDeleteSticky={isViewer ? undefined : handleDeleteSticky}
                onAddSticky={isViewer ? undefined : handleAddSticky}
                isViewer={isViewer}
                viewerStickies={collab.viewerStickies}
                onViewerStickyBodyChange={handleViewerStickyBodyChange}
                onViewerStickyDragStop={handleViewerStickyDragStop}
                onDeleteViewerSticky={handleDeleteViewerSticky}
                onAddViewerSticky={isViewer ? handleAddViewerSticky : undefined}
              />
            </ReactFlowProvider>
          </div>
        )}

        <AnimatePresence>
          {isPrototype && store.activeScreenId && (
            <motion.div
              ref={prototypeRef}
              tabIndex={-1}
              key="prototype-overlay"
              className="absolute inset-0 z-10 outline-none"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={SPRING_GENTLE}
            >
              <PrototypeView
                project={activeProject}
                projectId={activeProjectId}
                initialScreenId={store.activeScreenId}
                onExitPrototype={handleExitPrototype}
                collaboration={collab}
                onAddComment={handleAddComment}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
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

      <Toaster />
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
            <div role="status" className="flex items-center gap-2 border-b border-border px-4 py-2" aria-live="polite">
              <span className="text-[11px] text-muted-foreground">{contextLabel}</span>
              <ConnectionStatus status={collab.connectionStatus} />
              <ThemeToggle />
            </div>
          )}
          <main ref={mainRef} tabIndex={-1} className="relative flex-1 outline-none">{renderMainContent()}</main>
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
