import { useState } from "react";
import { Layers, Play, Plus, StickyNote, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ViewMode, StickyColor } from "@/types";
import { getAvailableScreenIds } from "@/sandbox/registry";

interface ToolbarProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  onAddScreen: (componentId: string, position: { x: number; y: number }) => void;
  onAddSticky: (color: StickyColor) => void;
  projectName: string;
  onProjectNameChange: (name: string) => void;
}

export default function Toolbar({
  mode,
  onModeChange,
  onAddScreen,
  onAddSticky,
  projectName,
  onProjectNameChange,
}: ToolbarProps) {
  const [showScreenPicker, setShowScreenPicker] = useState(false);
  const [showStickyPicker, setShowStickyPicker] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(projectName);

  const availableScreens = getAvailableScreenIds();

  const stickyColors: { color: StickyColor; label: string; className: string }[] = [
    { color: "yellow", label: "Yellow", className: "bg-sticky-yellow border-sticky-yellow-border" },
    { color: "blue", label: "Blue", className: "bg-sticky-blue border-sticky-blue-border" },
    { color: "green", label: "Green", className: "bg-sticky-green border-sticky-green-border" },
    { color: "pink", label: "Pink", className: "bg-sticky-pink border-sticky-pink-border" },
  ];

  return (
    <div className="flex h-14 items-center justify-between border-b border-border bg-white px-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Settings className="h-4 w-4 text-muted-foreground" />
          {editingName ? (
            <input
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onBlur={() => {
                setEditingName(false);
                onProjectNameChange(nameValue);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setEditingName(false);
                  onProjectNameChange(nameValue);
                }
              }}
              className="w-40 border-b border-primary bg-transparent text-sm font-medium outline-none"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="text-sm font-medium hover:text-primary"
            >
              {projectName}
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {mode === "wireflow" && (
          <>
            <div className="relative">
              <button
                onClick={() => {
                  setShowScreenPicker(!showScreenPicker);
                  setShowStickyPicker(false);
                }}
                aria-expanded={showScreenPicker}
                aria-haspopup="menu"
                className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                <Plus className="h-4 w-4" />
                Screen
              </button>
              {showScreenPicker && (
                <div role="menu" className="absolute right-0 top-full z-50 mt-1 min-w-[160px] rounded-lg border border-border bg-white py-1 shadow-lg">
                  {availableScreens.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-muted-foreground">
                      No screens found in src/screens/
                    </p>
                  ) : (
                    availableScreens.map((id) => (
                      <button
                        key={id}
                        role="menuitem"
                        onClick={() => {
                          onAddScreen(id, {
                            x: Math.random() * 400,
                            y: Math.random() * 300,
                          });
                          setShowScreenPicker(false);
                        }}
                        className="block w-full px-3 py-2.5 text-left text-sm hover:bg-muted"
                      >
                        {id}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setShowStickyPicker(!showStickyPicker);
                  setShowScreenPicker(false);
                }}
                aria-expanded={showStickyPicker}
                aria-haspopup="menu"
                className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                <StickyNote className="h-4 w-4" />
                Sticky
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
          </>
        )}

        <div className="ml-2 flex rounded-md border border-border">
          <button
            onClick={() => onModeChange("wireflow")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors",
              mode === "wireflow"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
          >
            <Layers className="h-4 w-4" />
            Wireflow
          </button>
          <button
            onClick={() => onModeChange("prototype")}
            className={cn(
              "flex items-center gap-1.5 border-l border-border px-3 py-2 text-sm font-medium transition-colors",
              mode === "prototype"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
          >
            <Play className="h-4 w-4" />
            Prototype
          </button>
        </div>
      </div>
    </div>
  );
}
