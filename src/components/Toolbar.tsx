import { useState, useEffect, useRef } from "react";
import { Layers, Play, StickyNote, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ViewMode, StickyColor } from "@/types";

interface ToolbarProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  onAddSticky: (color: StickyColor) => void;
  projectName: string;
  onProjectNameChange: (name: string) => void;
}

export default function Toolbar({
  mode,
  onModeChange,
  onAddSticky,
  projectName,
  onProjectNameChange,
}: ToolbarProps) {
  const [showStickyPicker, setShowStickyPicker] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(projectName);

  const stickyPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        showStickyPicker &&
        stickyPickerRef.current &&
        !stickyPickerRef.current.contains(e.target as Node)
      ) {
        setShowStickyPicker(false);
      }
    }
    document.addEventListener("pointerdown", handleClickOutside, true);
    return () => document.removeEventListener("pointerdown", handleClickOutside, true);
  }, [showStickyPicker]);

  const stickyColors: { color: StickyColor; label: string; className: string }[] = [
    { color: "yellow", label: "Yellow", className: "bg-sticky-yellow border-sticky-yellow-border" },
    { color: "blue", label: "Blue", className: "bg-sticky-blue border-sticky-blue-border" },
    { color: "green", label: "Green", className: "bg-sticky-green border-sticky-green-border" },
    { color: "pink", label: "Pink", className: "bg-sticky-pink border-sticky-pink-border" },
  ];

  return (
    <div className="flex h-14 items-center justify-between gap-4 overflow-hidden border-b border-border bg-surface px-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex min-w-0 items-center gap-1.5">
          <Pencil className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          {editingName ? (
            <input
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onBlur={() => {
                setEditingName(false);
                const trimmed = nameValue.trim();
                onProjectNameChange(trimmed || projectName);
                if (!trimmed) setNameValue(projectName);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setEditingName(false);
                  const trimmed = nameValue.trim();
                  onProjectNameChange(trimmed || projectName);
                  if (!trimmed) setNameValue(projectName);
                }
                if (e.key === "Escape") {
                  setEditingName(false);
                  setNameValue(projectName);
                }
              }}
              maxLength={80}
              className="w-40 border-b border-accent bg-transparent text-sm font-medium outline-none"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="cursor-pointer truncate text-sm font-medium hover:text-accent-foreground"
              title="Rename project"
            >
              {projectName}
            </button>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {mode === "wireflow" && (
          <div className="relative" ref={stickyPickerRef}>
            <button
              onClick={() => setShowStickyPicker(!showStickyPicker)}
              aria-expanded={showStickyPicker}
              aria-haspopup="menu"
              aria-label="Add sticky note"
              title="Add sticky note"
              className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              <StickyNote className="h-4 w-4" />
              <span className="hidden sm:inline">Sticky</span>
            </button>
            {showStickyPicker && (
              <div role="menu" className="absolute right-0 top-full z-50 mt-1 min-w-[120px] rounded-lg border border-border bg-white py-1 shadow-lg">
                {stickyColors.map(({ color, label, className }) => (
                  <button
                    key={color}
                    role="menuitem"
                    onClick={() => {
                      onAddSticky(color);
                      setShowStickyPicker(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-muted"
                  >
                    <div className={cn("h-3 w-3 rounded-sm border", className)} aria-hidden="true" />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="ml-2 flex rounded-md border border-border">
          <button
            onClick={() => onModeChange("wireflow")}
            title="Wireflow mode"
            aria-label="Switch to wireflow mode"
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors",
              mode === "wireflow"
                ? "bg-accent text-accent-foreground"
                : "hover:bg-muted"
            )}
          >
            <Layers className="h-4 w-4" />
            <span className="hidden sm:inline">Wireflow</span>
          </button>
          <button
            onClick={() => onModeChange("prototype")}
            title="Prototype mode"
            aria-label="Switch to prototype mode"
            className={cn(
              "flex items-center gap-1.5 border-l border-border px-3 py-2 text-sm font-medium transition-colors",
              mode === "prototype"
                ? "bg-accent text-accent-foreground"
                : "hover:bg-muted"
            )}
          >
            <Play className="h-4 w-4" />
            <span className="hidden sm:inline">Prototype</span>
          </button>
        </div>
      </div>
    </div>
  );
}
