import {
  useState,
  useCallback,
  useContext,
  createContext,
  type ReactNode,
} from "react";
import { nanoid } from "nanoid";
import type {
  Project,
  ScreenId,
  EdgeId,
  StickyId,
  ScreenConfig,
  EdgeConfig,
  StickyConfig,
  ViewMode,
  Workspace,
  ProjectViewState,
} from "@/types";
import { safeGetItem, safeSetItem } from "@/lib/utils";

const WORKSPACE_KEY = "protoflow-workspace";
const LEGACY_KEY = "protoflow-project";

function projectStorageKey(projectId: string): string {
  return `protoflow-project-${projectId}`;
}

function formatSlugAsName(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function createDefaultProject(projectId: string, screenIds: string[]): Project {
  const screens: Record<ScreenId, ScreenConfig> = {};
  for (const componentId of screenIds) {
    const id: ScreenId = `screen-${componentId}`;
    screens[id] = {
      componentId,
      position: { x: 0, y: 0 },
      label:
        componentId.charAt(0).toUpperCase() +
        componentId.slice(1).replace(/-/g, " "),
    };
  }
  return {
    screens,
    edges: {},
    stickies: {},
    meta: {
      name: formatSlugAsName(projectId),
      description: "",
      defaultDeviceFrame: "iphone-15",
    },
  };
}

interface WorkspaceMeta {
  projectIds: string[];
  activeProjectId: string | null;
  activeComponentId: string | null;
  projectViewStates: Record<string, ProjectViewState>;
}

function migrateLegacy(): { meta: WorkspaceMeta; project: Project } | null {
  try {
    const raw = safeGetItem(LEGACY_KEY);
    if (!raw) return null;
    const project = JSON.parse(raw) as Project;
    const projectId = "fullscript-patient-flow";
    const meta: WorkspaceMeta = {
      projectIds: [projectId],
      activeProjectId: projectId,
      activeComponentId: null,
      projectViewStates: {},
    };
    safeSetItem(WORKSPACE_KEY, JSON.stringify(meta));
    safeSetItem(projectStorageKey(projectId), JSON.stringify(project));
    try {
      localStorage.removeItem(LEGACY_KEY);
    } catch {
      /* best-effort cleanup */
    }
    return { meta, project };
  } catch {
    console.warn("Legacy migration failed, starting fresh");
    return null;
  }
}

function loadWorkspaceMeta(): WorkspaceMeta {
  try {
    const raw = safeGetItem(WORKSPACE_KEY);
    if (raw) return JSON.parse(raw) as WorkspaceMeta;
  } catch {
    /* corrupted */
  }
  const migrated = migrateLegacy();
  if (migrated) return migrated.meta;
  return {
    projectIds: [],
    activeProjectId: null,
    activeComponentId: null,
    projectViewStates: {},
  };
}

function loadProject(projectId: string): Project | null {
  try {
    const raw = safeGetItem(projectStorageKey(projectId));
    if (raw) return JSON.parse(raw) as Project;
  } catch {
    /* corrupted */
  }
  return null;
}

function saveWorkspaceMeta(meta: WorkspaceMeta) {
  safeSetItem(WORKSPACE_KEY, JSON.stringify(meta));
}

function saveProject(projectId: string, project: Project) {
  safeSetItem(projectStorageKey(projectId), JSON.stringify(project));
}

export type WorkspaceStore = ReturnType<typeof useWorkspaceStoreInternal>;

function useWorkspaceStoreInternal() {
  const [workspaceMeta, setWorkspaceMeta] = useState<WorkspaceMeta>(loadWorkspaceMeta);
  const [projects, setProjects] = useState<Record<string, Project>>(() => {
    const initial: Record<string, Project> = {};
    const meta = loadWorkspaceMeta();
    for (const id of meta.projectIds) {
      const p = loadProject(id);
      if (p) initial[id] = p;
    }
    return initial;
  });
  const [mode, setModeRaw] = useState<ViewMode>("wireflow");
  const [activeScreenId, setActiveScreenId] = useState<ScreenId | null>(null);

  const activeProjectId = workspaceMeta.activeProjectId;
  const activeComponentId = workspaceMeta.activeComponentId;
  const activeProject = activeProjectId ? projects[activeProjectId] ?? null : null;

  const updateMeta = useCallback((updater: (prev: WorkspaceMeta) => WorkspaceMeta) => {
    setWorkspaceMeta((prev) => {
      const next = updater(prev);
      saveWorkspaceMeta(next);
      return next;
    });
  }, []);

  const updateProject = useCallback(
    (projectId: string, updater: (prev: Project) => Project) => {
      setProjects((prev) => {
        const project = prev[projectId];
        if (!project) return prev;
        const next = updater(project);
        saveProject(projectId, next);
        return { ...prev, [projectId]: next };
      });
    },
    []
  );

  const registerProject = useCallback(
    (projectId: string, screenIds: string[]) => {
      setWorkspaceMeta((prev) => {
        if (prev.projectIds.includes(projectId)) return prev;
        const next = {
          ...prev,
          projectIds: [...prev.projectIds, projectId],
          activeProjectId: prev.activeProjectId ?? projectId,
        };
        saveWorkspaceMeta(next);
        return next;
      });
      setProjects((prev) => {
        if (prev[projectId]) return prev;
        const existing = loadProject(projectId);
        const project = existing ?? createDefaultProject(projectId, screenIds);
        saveProject(projectId, project);
        return { ...prev, [projectId]: project };
      });
    },
    []
  );

  const setActiveProject = useCallback(
    (projectId: string) => {
      updateMeta((prev) => {
        const next: WorkspaceMeta = {
          ...prev,
          activeProjectId: projectId,
          activeComponentId: null,
        };
        if (prev.activeProjectId && prev.activeProjectId !== projectId) {
          next.projectViewStates = {
            ...prev.projectViewStates,
            [prev.activeProjectId]: {
              mode: mode === "component-sandbox" ? "wireflow" : (mode as "wireflow" | "prototype"),
              activeScreenId,
            },
          };
        }
        return next;
      });
      const viewState = workspaceMeta.projectViewStates[projectId];
      if (viewState) {
        setModeRaw(viewState.mode);
        setActiveScreenId(viewState.activeScreenId);
      } else {
        setModeRaw("wireflow");
        setActiveScreenId(null);
      }
    },
    [updateMeta, workspaceMeta.projectViewStates, mode, activeScreenId]
  );

  const setActiveComponent = useCallback(
    (componentId: string | null) => {
      if (activeProjectId) {
        const viewState: ProjectViewState = {
          mode: mode === "component-sandbox" ? "wireflow" : (mode as "wireflow" | "prototype"),
          activeScreenId,
        };
        updateMeta((prev) => ({
          ...prev,
          activeComponentId: componentId,
          projectViewStates: {
            ...prev.projectViewStates,
            [activeProjectId]: viewState,
          },
        }));
      } else {
        updateMeta((prev) => ({
          ...prev,
          activeComponentId: componentId,
        }));
      }
      if (componentId) {
        setModeRaw("component-sandbox");
      }
    },
    [activeProjectId, mode, activeScreenId, updateMeta]
  );

  const setMode = useCallback(
    (newMode: ViewMode) => {
      setModeRaw(newMode);
    },
    []
  );

  const addScreen = useCallback(
    (projectId: string, componentId: string, position: { x: number; y: number }) => {
      const id: ScreenId = `screen-${nanoid(8)}`;
      const config: ScreenConfig = {
        componentId,
        position,
        label:
          componentId.charAt(0).toUpperCase() +
          componentId.slice(1).replace(/-/g, " "),
      };
      updateProject(projectId, (prev) => ({
        ...prev,
        screens: { ...prev.screens, [id]: config },
      }));
      return id;
    },
    [updateProject]
  );

  const updateScreenPosition = useCallback(
    (id: ScreenId, position: { x: number; y: number }) => {
      if (!activeProjectId) return;
      updateProject(activeProjectId, (prev) => {
        if (!prev.screens[id]) return prev;
        return {
          ...prev,
          screens: {
            ...prev.screens,
            [id]: { ...prev.screens[id], position },
          },
        };
      });
    },
    [activeProjectId, updateProject]
  );

  const removeScreen = useCallback(
    (id: ScreenId) => {
      if (!activeProjectId) return;
      updateProject(activeProjectId, (prev) => {
        const { [id]: _, ...screens } = prev.screens;
        const edges: typeof prev.edges = {};
        for (const [eid, edge] of Object.entries(prev.edges)) {
          if (edge.source !== id && edge.target !== id) {
            edges[eid] = edge;
          }
        }
        const stickies: typeof prev.stickies = {};
        for (const [sid, sticky] of Object.entries(prev.stickies)) {
          if (sticky.screenId !== id) {
            stickies[sid] = sticky;
          }
        }
        return { ...prev, screens, edges, stickies };
      });
    },
    [activeProjectId, updateProject]
  );

  const addEdge = useCallback(
    (config: Omit<EdgeConfig, "type"> & { type?: EdgeConfig["type"] }) => {
      if (!activeProjectId) return undefined;
      if (config.source === config.target) return undefined;
      const id: EdgeId = `edge-${nanoid(8)}`;
      updateProject(activeProjectId, (prev) => {
        const duplicate = Object.values(prev.edges).some(
          (e) => e.source === config.source && e.target === config.target
        );
        if (duplicate) return prev;
        return {
          ...prev,
          edges: {
            ...prev.edges,
            [id]: { type: "navigation", ...config } as EdgeConfig,
          },
        };
      });
      return id;
    },
    [activeProjectId, updateProject]
  );

  const removeEdge = useCallback(
    (id: EdgeId) => {
      if (!activeProjectId) return;
      updateProject(activeProjectId, (prev) => {
        const { [id]: _, ...edges } = prev.edges;
        return { ...prev, edges };
      });
    },
    [activeProjectId, updateProject]
  );

  const addSticky = useCallback(
    (config: StickyConfig) => {
      if (!activeProjectId) return "";
      const id: StickyId = `sticky-${nanoid(8)}`;
      updateProject(activeProjectId, (prev) => ({
        ...prev,
        stickies: { ...prev.stickies, [id]: config },
      }));
      return id;
    },
    [activeProjectId, updateProject]
  );

  const updateSticky = useCallback(
    (id: StickyId, updates: Partial<StickyConfig>) => {
      if (!activeProjectId) return;
      updateProject(activeProjectId, (prev) => {
        if (!prev.stickies[id]) return prev;
        return {
          ...prev,
          stickies: {
            ...prev.stickies,
            [id]: { ...prev.stickies[id], ...updates },
          },
        };
      });
    },
    [activeProjectId, updateProject]
  );

  const removeSticky = useCallback(
    (id: StickyId) => {
      if (!activeProjectId) return;
      updateProject(activeProjectId, (prev) => {
        const { [id]: _, ...stickies } = prev.stickies;
        return { ...prev, stickies };
      });
    },
    [activeProjectId, updateProject]
  );

  const updateProjectMeta = useCallback(
    (updates: Partial<Project["meta"]>) => {
      if (!activeProjectId) return;
      updateProject(activeProjectId, (prev) => ({
        ...prev,
        meta: { ...prev.meta, ...updates },
      }));
    },
    [activeProjectId, updateProject]
  );

  const getEdgesFrom = useCallback(
    (screenId: ScreenId) => {
      if (!activeProject) return [];
      return Object.entries(activeProject.edges)
        .filter(([, e]) => e.source === screenId)
        .sort(([, a], [, b]) => a.trigger.localeCompare(b.trigger));
    },
    [activeProject]
  );

  return {
    workspace: {
      projects,
      activeProjectId,
      activeComponentId,
      projectViewStates: workspaceMeta.projectViewStates,
    } satisfies Workspace,
    projectIds: workspaceMeta.projectIds,
    activeProject,
    mode,
    setMode,
    activeScreenId,
    setActiveScreenId,
    setActiveProject,
    setActiveComponent,
    registerProject,
    addScreen,
    updateScreenPosition,
    removeScreen,
    addEdge,
    removeEdge,
    addSticky,
    updateSticky,
    removeSticky,
    updateMeta: updateProjectMeta,
    getEdgesFrom,
    updateProject,
  };
}

const WorkspaceContext = createContext<WorkspaceStore | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const store = useWorkspaceStoreInternal();
  return (
    <WorkspaceContext.Provider value={store}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace(): WorkspaceStore {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}
