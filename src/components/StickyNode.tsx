import { memo, useState, useRef, useEffect } from "react";
import { type NodeProps } from "@xyflow/react";
import type { StickyColor } from "@/types";
import { cn } from "@/lib/utils";

export interface StickyNodeData {
  body: string;
  color: StickyColor;
  onBodyChange?: (body: string) => void;
  [key: string]: unknown;
}

const colorClasses: Record<StickyColor, string> = {
  yellow: "bg-sticky-yellow border-sticky-yellow-border",
  blue: "bg-sticky-blue border-sticky-blue-border",
  green: "bg-sticky-green border-sticky-green-border",
  pink: "bg-sticky-pink border-sticky-pink-border",
};

function StickyNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as StickyNodeData;
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(nodeData.body);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [editing]);

  const handleBlur = () => {
    setEditing(false);
    if (body !== nodeData.body) {
      nodeData.onBodyChange?.(body);
    }
  };

  return (
    <div
      className={cn(
        "min-w-[140px] max-w-[200px] rounded border-2 p-3 shadow-sm transition-shadow",
        colorClasses[nodeData.color],
        selected && "shadow-md ring-2 ring-primary/30"
      )}
      onDoubleClick={() => setEditing(true)}
    >
      {editing ? (
        <textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === "Escape") handleBlur();
          }}
          maxLength={1000}
          className="w-full resize-none bg-transparent text-xs leading-relaxed outline-none"
          rows={3}
        />
      ) : (
        <p className="max-h-[120px] overflow-y-auto whitespace-pre-wrap text-xs leading-relaxed text-foreground/80">
          {nodeData.body || "Double-click to edit..."}
        </p>
      )}
    </div>
  );
}

export default memo(StickyNode);
