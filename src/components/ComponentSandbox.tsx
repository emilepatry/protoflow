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
import type { ComponentVariant } from "@/types";

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

export default function ComponentSandbox() {
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
        <div className="flex h-10 items-center justify-between border-b border-border px-4">
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

      {activeVariant?.description && (
        <div className="border-t border-border px-4 py-2">
          <p className="text-xs text-muted-foreground">{activeVariant.description}</p>
        </div>
      )}
    </div>
  );
}
