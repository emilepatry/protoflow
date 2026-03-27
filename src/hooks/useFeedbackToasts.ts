import { useEffect, useRef } from "react";
import { toast } from "sonner";
import type { CollaborationProvider } from "@/sandbox/collaboration";

const BATCH_WINDOW_MS = 500;

export function useFeedbackToasts(
  provider: CollaborationProvider | null,
  viewerName: string | null
) {
  const stickyBatchRef = useRef<string[]>([]);
  const stickyTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const reactionBatchRef = useRef<string[]>([]);
  const reactionTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!provider) {
      initializedRef.current = false;
      return;
    }

    initializedRef.current = false;

    const unsubStickies = provider.onStickiesChange(() => {
      if (!initializedRef.current) {
        initializedRef.current = true;
        return;
      }
      stickyBatchRef.current.push("sticky");
      clearTimeout(stickyTimerRef.current);
      stickyTimerRef.current = setTimeout(() => {
        const count = stickyBatchRef.current.length;
        stickyBatchRef.current = [];
        if (count === 0) return;
        toast(
          count === 1
            ? "New sticky note added"
            : `${count} sticky note updates`
        );
      }, BATCH_WINDOW_MS);
    });

    let reactionsInitialized = false;
    const unsubReactions = provider.onReactionsChange(() => {
      if (!reactionsInitialized) {
        reactionsInitialized = true;
        return;
      }
      reactionBatchRef.current.push("reaction");
      clearTimeout(reactionTimerRef.current);
      reactionTimerRef.current = setTimeout(() => {
        const count = reactionBatchRef.current.length;
        reactionBatchRef.current = [];
        if (count === 0) return;
        toast(
          count === 1
            ? "New reaction"
            : `${count} new reactions`
        );
      }, BATCH_WINDOW_MS);
    });

    return () => {
      unsubStickies();
      unsubReactions();
      clearTimeout(stickyTimerRef.current);
      clearTimeout(reactionTimerRef.current);
    };
  }, [provider, viewerName]);
}
