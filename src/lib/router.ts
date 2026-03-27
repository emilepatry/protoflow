export type RouteState =
  | { type: "project"; projectId: string; mode: "wireflow" }
  | { type: "project"; projectId: string; mode: "prototype"; screenId: string }
  | { type: "component"; componentId: string; variantName?: string }
  | { type: "none" };

export function isViewerMode(): boolean {
  return new URLSearchParams(window.location.search).has("viewer");
}

export function parseHash(hash: string): RouteState {
  const path = hash.replace(/^#\/?/, "");
  if (!path) return { type: "none" };

  const segments = path.split("/").filter(Boolean);

  if (segments[0] === "projects" && segments[1]) {
    const projectId = segments[1];
    if (segments[2] === "prototype" && segments[3]) {
      return { type: "project", projectId, mode: "prototype", screenId: segments[3] };
    }
    return { type: "project", projectId, mode: "wireflow" };
  }

  if (segments[0] === "components" && segments[1]) {
    const componentId = segments[1];
    const variantName = segments[2];
    return { type: "component", componentId, variantName };
  }

  return { type: "none" };
}

export function buildHash(route: RouteState): string {
  switch (route.type) {
    case "project":
      if (route.mode === "prototype") {
        return `#/projects/${route.projectId}/prototype/${route.screenId}`;
      }
      return `#/projects/${route.projectId}`;
    case "component":
      if (route.variantName) {
        return `#/components/${route.componentId}/${route.variantName}`;
      }
      return `#/components/${route.componentId}`;
    case "none":
      return "#/";
  }
}

export function navigateTo(route: RouteState) {
  const hash = buildHash(route);
  if (window.location.hash !== hash) {
    window.location.hash = hash;
  }
}
