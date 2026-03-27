import { useState, useCallback } from "react";
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
} from "@/types";
import { safeGetItem, safeSetItem } from "@/lib/utils";

const STORAGE_KEY = "protoflow-project";

function createDefaultProject(): Project {
  return {
    screens: {
      "screen-home": {
        componentId: "home",
        position: { x: 0, y: 0 },
        label: "Home",
      },
      "screen-catalog": {
        componentId: "catalog",
        position: { x: 300, y: 250 },
        label: "Catalog",
      },
      "screen-cart": {
        componentId: "cart",
        position: { x: -200, y: 250 },
        label: "Cart",
      },
    },
    edges: {
      "edge-home-catalog": {
        source: "screen-home",
        target: "screen-catalog",
        trigger: "Tap 'Browse Catalog'",
        type: "navigation",
      },
      "edge-catalog-back": {
        source: "screen-catalog",
        target: "screen-home",
        trigger: "Tap '← Back'",
        type: "back",
      },
      "edge-home-cart": {
        source: "screen-home",
        target: "screen-cart",
        trigger: "View Cart",
        type: "navigation",
      },
      "edge-cart-back": {
        source: "screen-cart",
        target: "screen-home",
        trigger: "Tap '← Back'",
        type: "back",
      },
    },
    stickies: {
      "sticky-discovery": {
        position: { x: 350, y: -30 },
        screenId: "screen-home",
        body: "Home screen is the primary entry point. Patients land here after login. Need to surface active plan prominently.",
        color: "yellow",
      },
      "sticky-catalog-data": {
        position: { x: 550, y: 250 },
        screenId: "screen-catalog",
        body: "Categories from API. Consider search-first pattern — 60% of users search directly.",
        color: "blue",
      },
    },
    meta: {
      name: "Fullscript Patient Flow",
      description: "Core patient purchase journey",
      defaultDeviceFrame: "iphone-15",
    },
  };
}

function loadProject(): Project {
  try {
    const raw = safeGetItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Project;
  } catch {
    /* corrupted data — fall back to default */
  }
  return createDefaultProject();
}

function saveProject(project: Project) {
  safeSetItem(STORAGE_KEY, JSON.stringify(project));
}

export function useProjectStore() {
  const [project, setProjectRaw] = useState<Project>(loadProject);
  const [mode, setMode] = useState<ViewMode>("wireflow");
  const [activeScreenId, setActiveScreenId] = useState<ScreenId | null>(null);

  const setProject = useCallback((updater: (prev: Project) => Project) => {
    setProjectRaw((prev) => {
      const next = updater(prev);
      saveProject(next);
      return next;
    });
  }, []);

  const addScreen = useCallback(
    (componentId: string, position: { x: number; y: number }) => {
      const id: ScreenId = `screen-${nanoid(8)}`;
      const config: ScreenConfig = {
        componentId,
        position,
        label:
          componentId.charAt(0).toUpperCase() +
          componentId.slice(1).replace(/-/g, " "),
      };
      setProject((prev) => ({
        ...prev,
        screens: { ...prev.screens, [id]: config },
      }));
      return id;
    },
    [setProject]
  );

  const updateScreenPosition = useCallback(
    (id: ScreenId, position: { x: number; y: number }) => {
      setProject((prev) => {
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
    [setProject]
  );

  const removeScreen = useCallback(
    (id: ScreenId) => {
      setProject((prev) => {
        const { [id]: _, ...screens } = prev.screens;
        const edges: typeof prev.edges = {};
        for (const [eid, edge] of Object.entries(prev.edges)) {
          if (edge.source !== id && edge.target !== id) {
            edges[eid] = edge;
          }
        }
        return { ...prev, screens, edges };
      });
    },
    [setProject]
  );

  const addEdge = useCallback(
    (config: Omit<EdgeConfig, "type"> & { type?: EdgeConfig["type"] }) => {
      if (config.source === config.target) return undefined;
      const id: EdgeId = `edge-${nanoid(8)}`;
      setProject((prev) => {
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
    [setProject]
  );

  const removeEdge = useCallback(
    (id: EdgeId) => {
      setProject((prev) => {
        const { [id]: _, ...edges } = prev.edges;
        return { ...prev, edges };
      });
    },
    [setProject]
  );

  const addSticky = useCallback(
    (config: StickyConfig) => {
      const id: StickyId = `sticky-${nanoid(8)}`;
      setProject((prev) => ({
        ...prev,
        stickies: { ...prev.stickies, [id]: config },
      }));
      return id;
    },
    [setProject]
  );

  const updateSticky = useCallback(
    (id: StickyId, updates: Partial<StickyConfig>) => {
      setProject((prev) => ({
        ...prev,
        stickies: {
          ...prev.stickies,
          [id]: { ...prev.stickies[id], ...updates },
        },
      }));
    },
    [setProject]
  );

  const removeSticky = useCallback(
    (id: StickyId) => {
      setProject((prev) => {
        const { [id]: _, ...stickies } = prev.stickies;
        return { ...prev, stickies };
      });
    },
    [setProject]
  );

  const updateMeta = useCallback(
    (updates: Partial<Project["meta"]>) => {
      setProject((prev) => ({
        ...prev,
        meta: { ...prev.meta, ...updates },
      }));
    },
    [setProject]
  );

  const getEdgesFrom = useCallback(
    (screenId: ScreenId) => {
      return Object.entries(project.edges)
        .filter(([, e]) => e.source === screenId)
        .sort(([, a], [, b]) => a.trigger.localeCompare(b.trigger));
    },
    [project.edges]
  );

  return {
    project,
    mode,
    setMode,
    activeScreenId,
    setActiveScreenId,
    addScreen,
    updateScreenPosition,
    removeScreen,
    addEdge,
    removeEdge,
    addSticky,
    updateSticky,
    removeSticky,
    updateMeta,
    getEdgesFrom,
    setProject,
  };
}
