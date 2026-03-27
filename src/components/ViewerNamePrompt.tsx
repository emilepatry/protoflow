import { useState } from "react";

interface ViewerNamePromptProps {
  onSubmit: (name: string) => void;
}

export default function ViewerNamePrompt({ onSubmit }: ViewerNamePromptProps) {
  const [name, setName] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-80 rounded-xl border border-border bg-white p-6 shadow-2xl">
        <h2 className="text-base font-semibold">What's your name?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          So others know who left comments.
        </p>
        <input
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
