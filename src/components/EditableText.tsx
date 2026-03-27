import {
  useRef,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

interface EditableTextProps {
  "data-pf-id": string;
  children: ReactNode;
  override?: string;
  onOverride?: (text: string) => void;
  className?: string;
  as?: "span" | "p" | "h1" | "h2" | "h3" | "div";
}

export default function EditableText({
  "data-pf-id": pfId,
  children,
  override,
  onOverride,
  className,
  as: Tag = "span",
}: EditableTextProps) {
  const ref = useRef<HTMLElement>(null);
  const [editing, setEditing] = useState(false);
  const originalText = typeof children === "string" ? children : "";
  const displayText = override ?? originalText;

  useEffect(() => {
    if (ref.current && !editing) {
      ref.current.textContent = displayText;
    }
  }, [displayText, editing]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  }, []);

  const handleBlur = useCallback(() => {
    setEditing(false);
    const newText = ref.current?.textContent ?? "";
    if (newText !== originalText && onOverride) {
      onOverride(newText);
    }
  }, [originalText, onOverride]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        if (ref.current) ref.current.textContent = displayText;
        setEditing(false);
        ref.current?.blur();
      }
      if (e.key === "Enter") {
        e.preventDefault();
        ref.current?.blur();
      }
    },
    [displayText]
  );

  return (
    <Tag
      ref={ref as React.Ref<never>}
      data-pf-id={pfId}
      contentEditable
      suppressContentEditableWarning
      onFocus={() => setEditing(true)}
      onBlur={handleBlur}
      onPaste={handlePaste}
      onKeyDown={handleKeyDown}
      className={cn(
        className,
        "outline-none transition-shadow",
        "hover:ring-2 hover:ring-blue-400/30 hover:ring-offset-1",
        editing && "ring-2 ring-blue-500/50 ring-offset-1",
        override !== undefined && "bg-blue-50/50"
      )}
    >
      {displayText}
    </Tag>
  );
}
