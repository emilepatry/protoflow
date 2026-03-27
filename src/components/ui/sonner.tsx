import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      visibleToasts={3}
      duration={3000}
      toastOptions={{
        className:
          "!bg-background !text-foreground !border-border !shadow-sm !text-xs !rounded-lg",
      }}
    />
  );
}
