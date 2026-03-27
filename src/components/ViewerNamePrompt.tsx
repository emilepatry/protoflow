import { useState, useRef, useCallback } from "react";

interface ViewerNamePromptProps {
  onSubmit: (name: string) => void;
  onCancel?: () => void;
}

export default function ViewerNamePrompt({ onSubmit, onCancel }: ViewerNamePromptProps) {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel?.();
        return;
      }
      if (e.key === "Tab") {
        e.preventDefault();
        if (document.activeElement === inputRef.current) {
          buttonRef.current?.focus();
        } else {
          inputRef.current?.focus();
        }
      }
    },
    [onCancel]
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="name-prompt-title"
      onKeyDown={handleKeyDown}
    >
      <div className="w-80 rounded-xl border border-border bg-background p-6 shadow-lg">
        <h2 id="name-prompt-title" className="text-base font-semibold">What's your name?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          So others know who left comments.
        </p>
        <label htmlFor="name-prompt-input" className="sr-only">Your name</label>
        <input
          ref={inputRef}
          id="name-prompt-input"
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 30))}
          onKeyDown={(e) => {
            if (e.key === "Enter" && name.trim()) onSubmit(name.trim());
          }}
          placeholder="Your name"
          className="mt-4 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
          autoFocus
        />
        <button
          ref={buttonRef}
          onClick={() => name.trim() && onSubmit(name.trim())}
          disabled={!name.trim()}
          className="mt-3 w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
