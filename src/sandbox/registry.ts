import type { ComponentType } from "react";

const screenModules = import.meta.glob("../screens/*.tsx", {
  eager: true,
}) as Record<string, { default: ComponentType }>;

export const screenRegistry: Record<string, ComponentType> = {};

for (const path in screenModules) {
  const filename = path.split("/").pop()?.replace(".tsx", "");
  if (filename) {
    screenRegistry[filename] = screenModules[path].default;
  }
}

export function getScreenComponent(
  componentId: string
): ComponentType | undefined {
  return screenRegistry[componentId];
}

export function getAvailableScreenIds(): string[] {
  return Object.keys(screenRegistry);
}
