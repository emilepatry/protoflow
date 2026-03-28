import { cn } from "@/lib/utils";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "destructive" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onClick?: () => void;
}

const variantStyles = {
  primary: "bg-accent text-accent-foreground hover:bg-accent-hover",
  secondary: "bg-muted text-foreground border border-border hover:bg-muted/80",
  destructive: "bg-destructive text-white hover:bg-destructive/90",
  ghost: "text-foreground hover:bg-muted",
} as const;

const sizeStyles = {
  sm: "px-3 py-1.5 text-caption",
  md: "px-4 py-2 text-label",
  lg: "px-6 py-3 text-body",
} as const;

export default function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  onClick,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        variantStyles[variant],
        sizeStyles[size],
        disabled && "pointer-events-none opacity-50"
      )}
    >
      {children}
    </button>
  );
}
