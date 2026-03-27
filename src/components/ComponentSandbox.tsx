import {
  useState,
  useCallback,
  useEffect,
  Suspense,
  Component,
  type ReactNode,
  type ErrorInfo,
} from "react";
import { motion } from "motion/react";
import { useWorkspace } from "@/sandbox/store";
import { SPRING_QUICK } from "@/lib/motion";
import {
  getLibraryComponent,
  getLibraryVariants,
} from "@/sandbox/registry";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import type { ComponentVariant } from "@/types";
import type { ReactionType, VariantReactions } from "@/sandbox/collaboration";

class VariantErrorBoundary extends Component<
  { children: ReactNode; variantName: string },
  { errorMessage: string | null }
> {
  state: { errorMessage: string | null } = { errorMessage: null };

  static getDerivedStateFromError(error: unknown) {
    return {
      errorMessage:
        error instanceof Error ? error.message : String(error ?? "Unknown error"),
    };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error(`Variant error in "${this.props.variantName}":`, error, info);
  }

  render() {
    if (this.state.errorMessage) {
      return (
        <div className="flex flex-col items-center gap-2 rounded-lg bg-error-subtle p-6 text-center">
          <p className="text-sm font-medium text-error-foreground">This variant has an error</p>
          <p className="text-xs text-error">
            {this.state.errorMessage.slice(0, 120)}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

function VariantSkeleton() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="h-8 w-32 animate-pulse rounded bg-muted" />
    </div>
  );
}

interface ReactionButtonsProps {
  variantId: string;
  reactions: VariantReactions;
  viewerName: string | null;
  onToggle: (variantId: string, reaction: ReactionType) => void;
}

function ReactionButtons({ variantId, reactions, viewerName, onToggle }: ReactionButtonsProps) {
  const upCount = Object.values(reactions).filter((r) => r === "up").length;
  const downCount = Object.values(reactions).filter((r) => r === "down").length;
  const myReaction = viewerName ? reactions[viewerName] : undefined;

  return (
    <div className="flex items-center gap-3">
      <motion.button
        type="button"
        onClick={() => onToggle(variantId, "up")}
        className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors ${
          myReaction === "up"
            ? "text-success"
            : "text-muted-foreground hover:text-foreground"
        }`}
        whileTap={{ scale: 1.3 }}
        transition={SPRING_QUICK}
        aria-label={`Thumbs up${myReaction === "up" ? " (active)" : ""}`}
        aria-pressed={myReaction === "up"}
      >
        <ThumbsUp className="h-4 w-4" />
        {upCount > 0 && (
          <motion.span
            key={upCount}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING_QUICK}
            className="font-mono text-[11px]"
          >
            {upCount}
          </motion.span>
        )}
      </motion.button>
      <motion.button
        type="button"
        onClick={() => onToggle(variantId, "down")}
        className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors ${
          myReaction === "down"
            ? "text-error"
            : "text-muted-foreground hover:text-foreground"
        }`}
        whileTap={{ scale: 1.3 }}
        transition={SPRING_QUICK}
        aria-label={`Thumbs down${myReaction === "down" ? " (active)" : ""}`}
        aria-pressed={myReaction === "down"}
      >
        <ThumbsDown className="h-4 w-4" />
        {downCount > 0 && (
          <motion.span
            key={downCount}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING_QUICK}
            className="font-mono text-[11px]"
          >
            {downCount}
          </motion.span>
        )}
      </motion.button>
    </div>
  );
}

interface ComponentSandboxProps {
  reactions?: Record<string, VariantReactions>;
  onToggleReaction?: (variantId: string, reaction: ReactionType) => void;
  viewerName?: string | null;
}

export default function ComponentSandbox({
  reactions = {},
  onToggleReaction,
  viewerName = null,
}: ComponentSandboxProps) {
  const store = useWorkspace();
  const componentId = store.workspace.activeComponentId;
  const [activeIndex, setActiveIndex] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);

  const variants: ComponentVariant[] = componentId
    ? getLibraryVariants(componentId)
    : [];

  const LibraryComponent = componentId
    ? getLibraryComponent(componentId)
    : undefined;

  useEffect(() => {
    setActiveIndex(0);
    setFadeKey((k) => k + 1);
  }, [componentId]);

  const goToVariant = useCallback(
    (index: number) => {
      if (index < 0 || index >= variants.length) return;
      setActiveIndex(index);
      setFadeKey((k) => k + 1);
    },
    [variants.length]
  );

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (variants.length === 0) return;
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToVariant(activeIndex <= 0 ? variants.length - 1 : activeIndex - 1);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goToVariant(activeIndex >= variants.length - 1 ? 0 : activeIndex + 1);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, variants.length, goToVariant]);

  if (!componentId) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm text-muted-foreground">No component selected</p>
      </div>
    );
  }

  const activeVariant = variants[activeIndex];

  return (
    <div className="flex h-full flex-col">
      {variants.length > 0 && (
        <div className="flex h-11 items-center justify-between border-b border-border px-5">
          <span className="text-sm font-medium">
            {activeVariant?.name ?? "Default"}
          </span>
          <span className="text-xs text-muted-foreground">
            {activeIndex + 1} / {variants.length}
          </span>
        </div>
      )}

      <div
        className="relative flex flex-1 items-center justify-center overflow-auto"
        style={{
          backgroundImage: `radial-gradient(circle, var(--sandbox-dot-color) var(--sandbox-dot-size), transparent var(--sandbox-dot-size))`,
          backgroundSize: `var(--sandbox-dot-gap) var(--sandbox-dot-gap)`,
        }}
      >
        <motion.div
          className="max-w-4xl p-8"
          key={fadeKey}
          aria-live="polite"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={SPRING_QUICK}
        >
          {activeVariant ? (
            <VariantErrorBoundary variantName={activeVariant.name}>
              {activeVariant.render()}
            </VariantErrorBoundary>
          ) : LibraryComponent ? (
            <Suspense fallback={<VariantSkeleton />}>
              <LibraryComponent />
            </Suspense>
          ) : (
            <div className="rounded-lg bg-muted p-6 text-center text-sm text-muted-foreground">
              Component not found: {componentId}
            </div>
          )}
        </motion.div>
      </div>

      {(activeVariant?.description || (activeVariant && onToggleReaction)) && (
        <div className="flex items-center justify-between border-t border-border px-5 py-3">
          <p className="text-xs text-muted-foreground">{activeVariant?.description ?? ""}</p>
          {activeVariant && onToggleReaction && (
            <ReactionButtons
              variantId={activeVariant.id}
              reactions={reactions[activeVariant.id] ?? {}}
              viewerName={viewerName ?? null}
              onToggle={onToggleReaction}
            />
          )}
        </div>
      )}
    </div>
  );
}
