import { useState, useCallback, useEffect } from "react";
import { Layers, Puzzle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getEmoji, getBgColor, formatSlug } from "@/lib/sidebar-utils";
import { useWorkspace } from "@/sandbox/store";
import {
  discoverProjects,
  discoverLibraryComponents,
  type ProjectEntry,
  type LibraryEntry,
} from "@/sandbox/registry";
import { navigateTo } from "@/lib/router";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  useSidebar,
} from "@/components/ui/sidebar";

type SidebarTab = "projects" | "components";

export function AppSidebar() {
  const store = useWorkspace();
  const { state, setOpen } = useSidebar();
  const isCollapsed = state === "collapsed";

  const [tab, setTab] = useState<SidebarTab>("projects");

  const projects = discoverProjects();
  const components = discoverLibraryComponents();
  const items = tab === "projects" ? projects : components;

  const isPrototype = store.mode === "prototype";

  useEffect(() => {
    if (isPrototype) {
      setOpen(false);
    }
  }, [isPrototype, setOpen]);

  const handleItemClick = useCallback(
    (item: ProjectEntry | LibraryEntry) => {
      if (tab === "projects") {
        store.setActiveProject(item.id);
        navigateTo({ type: "project", projectId: item.id, mode: "wireflow" });
      } else {
        store.setActiveComponent(item.id);
        navigateTo({ type: "component", componentId: item.id });
      }
      if (isCollapsed) setOpen(true);
    },
    [tab, store, isCollapsed, setOpen],
  );

  const isActiveItem = (item: ProjectEntry | LibraryEntry) => {
    if (tab === "projects") {
      return store.workspace.activeProjectId === item.id && store.mode !== "component-sandbox";
    }
    return store.workspace.activeComponentId === item.id && store.mode === "component-sandbox";
  };

  return (
    <Sidebar collapsible="icon" aria-label="Workspace navigation">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-4">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-1.5">
            <button
              onClick={() => { setTab("projects"); setOpen(true); }}
              title="Projects"
              aria-label="Projects"
              className={cn(
                "rounded-md p-2 transition-colors",
                tab === "projects"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Layers className="size-4" />
            </button>
            <button
              onClick={() => { setTab("components"); setOpen(true); }}
              title="Components"
              aria-label="Components"
              className={cn(
                "rounded-md p-2 transition-colors",
                tab === "components"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Puzzle className="size-4" />
            </button>
          </div>
        ) : (
          <>
            <span className="text-[11px] font-medium uppercase tracking-wider text-sidebar-foreground/50">
              Workspace
            </span>
            <div role="tablist" aria-label="Sidebar tabs" className="mt-3">
              <div className="flex overflow-hidden rounded-md border border-sidebar-border">
                <button
                  role="tab"
                  aria-selected={tab === "projects"}
                  onClick={() => setTab("projects")}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 px-3 py-2 text-[13px] font-medium transition-colors",
                    tab === "projects"
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                  )}
                >
                  <Layers className="size-3.5 shrink-0" />
                  Projects
                </button>
                <button
                  role="tab"
                  aria-selected={tab === "components"}
                  onClick={() => setTab("components")}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 border-l border-sidebar-border px-3 py-2 text-[13px] font-medium transition-colors",
                    tab === "components"
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                  )}
                >
                  <Puzzle className="size-3.5 shrink-0" />
                  Components
                </button>
              </div>
            </div>
          </>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="px-2 py-2">
          <SidebarGroupLabel className="sr-only">
            {tab === "projects" ? "Projects" : "Components"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-[11px] text-sidebar-foreground/50">
                {tab === "projects"
                  ? "Create a folder in src/projects/"
                  : "Add a component in src/library/"}
              </p>
            ) : isCollapsed ? (
              <div className="flex flex-col items-center gap-2 py-3">
                {items.slice(0, 8).map((item) => {
                  const active = isActiveItem(item);
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      title={formatSlug(item.id)}
                      aria-label={formatSlug(item.id)}
                      className={cn(
                        "flex size-8 items-center justify-center rounded-full text-sm transition-colors",
                        active && "ring-2 ring-sidebar-ring",
                      )}
                      style={{ background: getBgColor(item.id) }}
                    >
                      {getEmoji(item.id)}
                    </button>
                  );
                })}
                {items.length > 8 && (
                  <span className="text-[10px] font-medium text-sidebar-foreground/50">
                    +{items.length - 8}
                  </span>
                )}
              </div>
            ) : (
              <SidebarMenu>
                {items.map((item) => {
                  const active = isActiveItem(item);
                  const count =
                    tab === "projects"
                      ? (item as ProjectEntry).screenIds.length
                      : (item as LibraryEntry).variants.length;
                  const countLabel =
                    tab === "projects"
                      ? `${count} screen${count !== 1 ? "s" : ""}`
                      : `${count} variant${count !== 1 ? "s" : ""}`;

                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        isActive={active}
                        onClick={() => handleItemClick(item)}
                        tooltip={formatSlug(item.id)}
                        className="h-9 gap-3 px-3 text-[13px] font-medium"
                      >
                        <span
                          className="flex size-7 shrink-0 items-center justify-center rounded-md text-sm leading-none"
                          style={{ background: getBgColor(item.id) }}
                          aria-hidden="true"
                        >
                          {getEmoji(item.id)}
                        </span>
                        <span className="min-w-0 flex-1 truncate" title={formatSlug(item.id)}>
                          {formatSlug(item.id)}
                        </span>
                      </SidebarMenuButton>
                      <SidebarMenuBadge className="font-mono text-[11px] tabular-nums text-sidebar-foreground/50">
                        {countLabel}
                      </SidebarMenuBadge>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
