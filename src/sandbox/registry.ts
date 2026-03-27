import { lazy, type ComponentType } from "react";
import type { ComponentVariant } from "@/types";

type LazyModule = { default: ComponentType };
type VariantsModule = { variants: ComponentVariant[] };

const projectScreenModules = import.meta.glob<LazyModule>(
  "../projects/*/screens/*.tsx",
  { eager: false }
);

const libraryComponentModules = import.meta.glob<LazyModule>(
  "../library/*/component.tsx",
  { eager: false }
);

const libraryVariantModules = import.meta.glob<VariantsModule>(
  "../library/*/variants.tsx",
  { eager: true }
);

export interface ProjectEntry {
  id: string;
  screenIds: string[];
}

export interface LibraryEntry {
  id: string;
  variants: ComponentVariant[];
}

function parseProjectScreenPath(path: string): { projectId: string; screenId: string } | null {
  const match = path.match(/\.\.\/projects\/([^/]+)\/screens\/([^/]+)\.tsx$/);
  if (!match) return null;
  return { projectId: match[1], screenId: match[2] };
}

function parseLibraryPath(path: string): string | null {
  const match = path.match(/\.\.\/library\/([^/]+)\/component\.tsx$/);
  return match ? match[1] : null;
}

function parseLibraryVariantsPath(path: string): string | null {
  const match = path.match(/\.\.\/library\/([^/]+)\/variants\.tsx$/);
  return match ? match[1] : null;
}

const projectRegistry: Record<string, Record<string, () => Promise<LazyModule>>> = {};

for (const path in projectScreenModules) {
  const parsed = parseProjectScreenPath(path);
  if (!parsed) continue;
  if (!projectRegistry[parsed.projectId]) {
    projectRegistry[parsed.projectId] = {};
  }
  projectRegistry[parsed.projectId][parsed.screenId] = projectScreenModules[path];
}

const componentRegistry: Record<string, () => Promise<LazyModule>> = {};
const variantRegistry: Record<string, ComponentVariant[]> = {};

for (const path in libraryComponentModules) {
  const id = parseLibraryPath(path);
  if (id) componentRegistry[id] = libraryComponentModules[path];
}

for (const path in libraryVariantModules) {
  const id = parseLibraryVariantsPath(path);
  if (id) variantRegistry[id] = libraryVariantModules[path].variants;
}

const lazyCache: Record<string, ComponentType> = {};

function getLazy(key: string, loader: () => Promise<LazyModule>): ComponentType {
  if (!lazyCache[key]) {
    lazyCache[key] = lazy(loader);
  }
  return lazyCache[key];
}

export function getScreenComponent(
  projectId: string,
  componentId: string
): ComponentType | undefined {
  const loader = projectRegistry[projectId]?.[componentId];
  if (!loader) return undefined;
  return getLazy(`project:${projectId}:${componentId}`, loader);
}

export function getLibraryComponent(componentId: string): ComponentType | undefined {
  const loader = componentRegistry[componentId];
  if (!loader) return undefined;
  return getLazy(`library:${componentId}`, loader);
}

export function getLibraryVariants(componentId: string): ComponentVariant[] {
  return variantRegistry[componentId] ?? [];
}

export function discoverProjects(): ProjectEntry[] {
  return Object.entries(projectRegistry).map(([id, screens]) => ({
    id,
    screenIds: Object.keys(screens),
  }));
}

export function discoverLibraryComponents(): LibraryEntry[] {
  return Object.entries(componentRegistry).map(([id]) => ({
    id,
    variants: variantRegistry[id] ?? [],
  }));
}

export function getAvailableScreenIds(projectId: string): string[] {
  return Object.keys(projectRegistry[projectId] ?? {});
}
