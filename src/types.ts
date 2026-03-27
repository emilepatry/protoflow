export type ScreenId = string;
export type EdgeId = string;
export type StickyId = string;

export type DeviceFrame = "iphone-15" | "web-desktop" | "web-mobile" | "none";
export type EdgeType = "navigation" | "conditional" | "back";
export type StickyColor = "yellow" | "blue" | "green" | "pink";

export interface ScreenConfig {
  componentId: string;
  position: { x: number; y: number };
  label: string;
  deviceFrame?: DeviceFrame;
}

export interface EdgeConfig {
  source: ScreenId;
  target: ScreenId;
  trigger: string;
  actionId?: string;
  logic?: string;
  type: EdgeType;
}

export interface StickyConfig {
  position: { x: number; y: number };
  screenId?: ScreenId;
  body: string;
  color: StickyColor;
}

export interface ProjectMeta {
  name: string;
  description: string;
  defaultDeviceFrame: DeviceFrame;
}

export interface Project {
  screens: Record<ScreenId, ScreenConfig>;
  edges: Record<EdgeId, EdgeConfig>;
  stickies: Record<StickyId, StickyConfig>;
  meta: ProjectMeta;
}

export type ViewMode = "wireflow" | "prototype" | "component-sandbox";

export interface ProjectViewState {
  mode: "wireflow" | "prototype";
  activeScreenId: ScreenId | null;
}

export interface ComponentVariant {
  name: string;
  render: () => React.ReactNode;
  description?: string;
}

export interface Workspace {
  projects: Record<string, Project>;
  activeProjectId: string | null;
  activeComponentId: string | null;
  projectViewStates: Record<string, ProjectViewState>;
}
