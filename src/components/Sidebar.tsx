import { useState, useCallback, useEffect } from "react";
import {
  Layers,
  Puzzle,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/sandbox/store";
import {
  discoverProjects,
  discoverLibraryComponents,
  type ProjectEntry,
  type LibraryEntry,
} from "@/sandbox/registry";
import { navigateTo } from "@/lib/router";

type SidebarTab = "projects" | "components";

const EMOJI_PALETTE = [
  "🧪", "💊", "🩺", "🧬", "🌿", "🔬", "💉", "🏥", "❤️", "🧠",
  "🦴", "🫀", "🫁", "👁️", "🦷", "🌡️", "⚕️", "🧫", "🔭", "📊",
  "🎯", "🚀", "🌊", "🔥", "⭐", "🎨", "📦", "🛒", "🏠", "📱",
];

const BG_PALETTE = [
  "var(--color-avatar-0)",
  "var(--color-avatar-1)",
  "var(--color-avatar-2)",
  "var(--color-avatar-3)",
  "var(--color-avatar-4)",
  "var(--color-avatar-5)",
];

function hashString(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function getEmoji(name: string): string {
  return EMOJI_PALETTE[hashString(name) % EMOJI_PALETTE.length];
}

function getBgColor(name: string): string {
  return BG_PALETTE[hashString(name) % BG_PALETTE.length];
}

function formatSlug(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function Sidebar() {
  const store = useWorkspace();
  const [tab, setTab] = useState<SidebarTab>("projects");
  const [collapsed, setCollapsed] = useState(false);
  const [focusIndex, setFocusIndex] = useState(-1);

  const projects = discoverProjects();
  const components = discoverLibraryComponents();
  const items = tab === "projects" ? projects : components;
  const itemCount = items.length;

  const isPrototype = store.mode === "prototype";

  useEffect(() => {
    if (isPrototype) {
      setCollapsed(true);
    }
  }, [isPrototype]);

  const toggleCollapse = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
      if (e.metaKey && e.key === "b") {
        e.preventDefault();
        toggleCollapse();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleCollapse]);

  const handleItemClick = useCallback(
    (item: ProjectEntry | LibraryEntry) => {
      if (tab === "projects") {
        store.setActiveProject(item.id);
        navigateTo({ type: "project", projectId: item.id, mode: "wireflow" });
      } else {
        store.setActiveComponent(item.id);
        navigateTo({ type: "component", componentId: item.id });
      }
      if (collapsed) setCollapsed(false);
    },
    [tab, store, collapsed]
  );

  const handleListKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (itemCount === 0) return;

      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setFocusIndex((prev) => {
          if (e.key === "ArrowDown") {
            return prev >= itemCount - 1 ? 0 : prev + 1;
          }
          return prev <= 0 ? itemCount - 1 : prev - 1;
        });
      }

      if (e.key === "Enter" && focusIndex >= 0 && focusIndex < itemCount) {
        e.preventDefault();
        handleItemClick(items[focusIndex]);
      }
    },
    [itemCount, focusIndex, handleItemClick, items]
  );

  useEffect(() => {
    setFocusIndex(-1);
  }, [tab]);

  const isActiveItem = (item: ProjectEntry | LibraryEntry) => {
    if (tab === "projects") {
      return store.workspace.activeProjectId === item.id && store.mode !== "component-sandbox";
    }
    return store.workspace.activeComponentId === item.id && store.mode === "component-sandbox";
  };

  const expandedContent = (
    <>
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Workspace
        </span>
        <button
          onClick={toggleCollapse}
          aria-expanded={!collapsed}
          aria-label="Collapse sidebar"
          className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
      </div>

      <div className="border-b border-border" role="tablist" aria-label="Sidebar tabs">
        <div className="mx-3 my-2 flex rounded-md border border-border">
          <button
            role="tab"
            aria-selected={tab === "projects"}
            onClick={() => setTab("projects")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors",
              tab === "projects"
                ? "bg-accent text-accent-foreground"
                : "hover:bg-muted"
            )}
          >
            <Layers className="h-3.5 w-3.5" />
            Projects
          </button>
          <button
            role="tab"
            aria-selected={tab === "components"}
            onClick={() => setTab("components")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 border-l border-border px-3 py-1.5 text-xs font-medium transition-colors",
              tab === "components"
                ? "bg-accent text-accent-foreground"
                : "hover:bg-muted"
            )}
          >
            <Puzzle className="h-3.5 w-3.5" />
            Components
          </button>
        </div>
      </div>

      <div
        role="listbox"
        aria-label={tab === "projects" ? "Projects" : "Components"}
        className="flex-1 overflow-y-auto py-1"
        onKeyDown={handleListKeyDown}
        tabIndex={0}
      >
        {items.length === 0 ? (
          <p className="px-3 py-4 text-center text-xs text-muted-foreground">
            {tab === "projects"
              ? "Create a folder in src/projects/"
              : "Add a component in src/library/"}
          </p>
        ) : (
          items.map((item, index) => {
            const active = isActiveItem(item);
            const screenCount =
              tab === "projects"
                ? (item as ProjectEntry).screenIds.length
                : (item as LibraryEntry).variants.length;
            const countLabel =
              tab === "projects"
                ? `${screenCount} screen${screenCount !== 1 ? "s" : ""}`
                : `${screenCount} variant${screenCount !== 1 ? "s" : ""}`;

            return (
              <button
                key={item.id}
                role="option"
                aria-selected={active}
                id={`sidebar-item-${item.id}`}
                onClick={() => handleItemClick(item)}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 text-left transition-colors",
                  active
                    ? "border-l-2 border-accent bg-accent-subtle font-medium"
                    : "border-l-2 border-transparent hover:bg-muted",
                  focusIndex === index && "ring-2 ring-inset ring-accent"
                )}
                style={{ height: "var(--sidebar-item-height)" }}
              >
                <span className="text-base leading-none" aria-hidden="true">
                  {getEmoji(item.id)}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm" title={formatSlug(item.id)}>
                  {formatSlug(item.id)}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {countLabel}
                </span>
              </button>
            );
          })
        )}
      </div>
    </>
  );

  const collapsedContent = (
    <>
      <div className="flex flex-col items-center border-b border-border py-2">
        <button
          onClick={toggleCollapse}
          aria-expanded={!collapsed}
          aria-label="Expand sidebar"
          className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col items-center gap-1 border-b border-border py-2">
        <button
          onClick={() => { setTab("projects"); setCollapsed(false); }}
          title="Projects"
          aria-label="Projects"
          className={cn(
            "rounded p-1.5 transition-colors",
            tab === "projects"
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Layers className="h-4 w-4" />
        </button>
        <button
          onClick={() => { setTab("components"); setCollapsed(false); }}
          title="Components"
          aria-label="Components"
          className={cn(
            "rounded p-1.5 transition-colors",
            tab === "components"
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Puzzle className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center gap-1 overflow-y-auto py-2">
        {items.slice(0, 8).map((item) => {
          const active = isActiveItem(item);
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              title={formatSlug(item.id)}
              aria-label={formatSlug(item.id)}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs transition-colors",
                active && "ring-2 ring-accent"
              )}
              style={{ background: getBgColor(item.id) }}
            >
              {getEmoji(item.id)}
            </button>
          );
        })}
        {items.length > 8 && (
          <span className="text-[10px] font-medium text-muted-foreground">
            +{items.length - 8}
          </span>
        )}
      </div>
    </>
  );

  return (
    <nav
      aria-label="Workspace navigation"
      className="flex h-full flex-col border-r border-border bg-surface"
      style={{
        width: collapsed
          ? "var(--sidebar-width-collapsed)"
          : "var(--sidebar-width)",
        transition: "width var(--transition-sidebar)",
        minWidth: collapsed
          ? "var(--sidebar-width-collapsed)"
          : "var(--sidebar-width)",
      }}
    >
      {collapsed ? collapsedContent : expandedContent}
    </nav>
  );
}
