import type { ReactNode } from "react";
import type { DeviceFrame as DeviceFrameType } from "@/types";
import { cn } from "@/lib/utils";

interface DeviceFrameProps {
  type: DeviceFrameType;
  children: ReactNode;
}

export default function DeviceFrame({ type, children }: DeviceFrameProps) {
  if (type === "none") return <>{children}</>;

  if (type === "iphone-15") {
    return (
      <div className="relative">
        {/* Phone shell */}
        <div className="rounded-[40px] border-[3px] border-chrome-bg bg-chrome-bg p-2" style={{ boxShadow: 'var(--shadow-lg)' }}>
          {/* Dynamic Island */}
          <div className="absolute left-1/2 top-3 z-20 h-[25px] w-[90px] -translate-x-1/2 rounded-full bg-black" />

          {/* Screen */}
          <div className="overflow-hidden rounded-[32px] bg-background">
            {children}
          </div>

          {/* Home indicator */}
          <div className="absolute bottom-4 left-1/2 h-1 w-[100px] -translate-x-1/2 rounded-full bg-white/30" />
        </div>
      </div>
    );
  }

  if (type === "web-desktop") {
    return (
      <div className="overflow-hidden rounded-lg border border-border" style={{ boxShadow: 'var(--shadow-lg)' }}>
        <div className="flex h-8 items-center gap-1.5 border-b border-border bg-surface px-3">
          <div className="h-2.5 w-2.5 rounded-full bg-traffic-red" />
          <div className="h-2.5 w-2.5 rounded-full bg-traffic-yellow" />
          <div className="h-2.5 w-2.5 rounded-full bg-traffic-green" />
          <div className="ml-4 flex-1 rounded-md bg-background px-3 py-0.5">
            <span className="text-micro text-muted-foreground">
              protoflow.local
            </span>
          </div>
        </div>
        <div className="bg-background">{children}</div>
      </div>
    );
  }

  if (type === "web-mobile") {
    return (
      <div className={cn("overflow-hidden rounded-lg border border-border", "max-w-[375px]")} style={{ boxShadow: 'var(--shadow-lg)' }}>
        <div className="flex h-6 items-center gap-1 border-b border-border bg-surface px-2">
          <div className="h-2 w-2 rounded-full bg-traffic-red" />
          <div className="h-2 w-2 rounded-full bg-traffic-yellow" />
          <div className="h-2 w-2 rounded-full bg-traffic-green" />
        </div>
        <div className="bg-background">{children}</div>
      </div>
    );
  }

  return <>{children}</>;
}
