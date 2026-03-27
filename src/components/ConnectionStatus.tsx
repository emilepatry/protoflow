import { cn } from "@/lib/utils";
import type { ConnectionStatus as Status } from "@/sandbox/collaboration";

const statusConfig: Record<
  Status,
  { color: string; label: string; pulse: boolean }
> = {
  connected: { color: "bg-success", label: "Connected", pulse: false },
  connecting: { color: "bg-warning", label: "Syncing\u2026", pulse: true },
  disconnected: { color: "bg-error", label: "Disconnected", pulse: false },
};

interface ConnectionStatusProps {
  status: Status;
}

export default function ConnectionStatus({ status }: ConnectionStatusProps) {
  if (!import.meta.env.VITE_PARTYKIT_HOST) return null;

  const { color, label, pulse } = statusConfig[status];

  return (
    <span className="relative inline-flex items-center" title={label}>
      {pulse && (
        <span
          className={cn("absolute inline-flex h-1.5 w-1.5 animate-ping rounded-full opacity-75", color)}
          aria-hidden="true"
        />
      )}
      <span
        className={cn("relative inline-block h-1.5 w-1.5 rounded-full", color)}
        role="img"
        aria-label={label}
      />
    </span>
  );
}
