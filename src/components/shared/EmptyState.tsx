import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  variant?: "default" | "compact" | "card";
  illustration?: "empty-box" | "no-data" | "calendar" | "tasks" | "leads" | "deals" | "contacts" | "activities";
}

// Simple SVG illustrations for empty states
const EmptyIllustrations = {
  "empty-box": (
    <svg viewBox="0 0 80 80" className="w-16 h-16 text-muted-foreground/30">
      <rect x="15" y="25" width="50" height="40" rx="3" fill="currentColor" opacity="0.3"/>
      <path d="M15 32L40 20L65 32" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5"/>
      <path d="M40 20V45" stroke="currentColor" strokeWidth="2" opacity="0.4"/>
      <circle cx="40" cy="48" r="3" fill="currentColor" opacity="0.5"/>
    </svg>
  ),
  "no-data": (
    <svg viewBox="0 0 80 80" className="w-16 h-16 text-muted-foreground/30">
      <rect x="18" y="20" width="44" height="50" rx="3" fill="currentColor" opacity="0.2"/>
      <rect x="24" y="30" width="32" height="4" rx="2" fill="currentColor" opacity="0.4"/>
      <rect x="24" y="40" width="24" height="4" rx="2" fill="currentColor" opacity="0.3"/>
      <rect x="24" y="50" width="28" height="4" rx="2" fill="currentColor" opacity="0.3"/>
      <circle cx="55" cy="55" r="12" fill="hsl(var(--background))" stroke="currentColor" strokeWidth="2" opacity="0.5"/>
      <path d="M52 52L58 58M58 52L52 58" stroke="currentColor" strokeWidth="2" opacity="0.5"/>
    </svg>
  ),
  "calendar": (
    <svg viewBox="0 0 80 80" className="w-16 h-16 text-muted-foreground/30">
      <rect x="15" y="22" width="50" height="45" rx="4" fill="currentColor" opacity="0.2"/>
      <rect x="15" y="22" width="50" height="12" rx="4" fill="currentColor" opacity="0.4"/>
      <rect x="25" y="16" width="4" height="12" rx="2" fill="currentColor" opacity="0.5"/>
      <rect x="51" y="16" width="4" height="12" rx="2" fill="currentColor" opacity="0.5"/>
      <circle cx="28" cy="48" r="4" fill="currentColor" opacity="0.3"/>
      <circle cx="40" cy="48" r="4" fill="currentColor" opacity="0.3"/>
      <circle cx="52" cy="48" r="4" fill="currentColor" opacity="0.3"/>
    </svg>
  ),
  "tasks": (
    <svg viewBox="0 0 80 80" className="w-16 h-16 text-muted-foreground/30">
      <rect x="20" y="18" width="40" height="52" rx="4" fill="currentColor" opacity="0.2"/>
      <rect x="26" y="28" width="10" height="10" rx="2" fill="currentColor" opacity="0.4"/>
      <rect x="40" y="30" width="16" height="3" rx="1.5" fill="currentColor" opacity="0.3"/>
      <rect x="40" y="35" width="12" height="2" rx="1" fill="currentColor" opacity="0.2"/>
      <rect x="26" y="44" width="10" height="10" rx="2" fill="currentColor" opacity="0.3"/>
      <rect x="40" y="46" width="16" height="3" rx="1.5" fill="currentColor" opacity="0.3"/>
      <rect x="40" y="51" width="12" height="2" rx="1" fill="currentColor" opacity="0.2"/>
      <path d="M28 33L31 36L35 29" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.6"/>
    </svg>
  ),
  "leads": (
    <svg viewBox="0 0 80 80" className="w-16 h-16 text-muted-foreground/30">
      <rect x="18" y="22" width="44" height="48" rx="3" fill="currentColor" opacity="0.2"/>
      <circle cx="40" cy="38" r="10" fill="currentColor" opacity="0.3"/>
      <path d="M28 58C28 50 33 46 40 46C47 46 52 50 52 58" fill="currentColor" opacity="0.25"/>
      <circle cx="58" cy="22" r="8" fill="hsl(var(--primary))" opacity="0.3"/>
      <path d="M55 22H61M58 19V25" stroke="hsl(var(--primary))" strokeWidth="2" opacity="0.6"/>
    </svg>
  ),
  "deals": (
    <svg viewBox="0 0 80 80" className="w-16 h-16 text-muted-foreground/30">
      <rect x="15" y="30" width="50" height="35" rx="3" fill="currentColor" opacity="0.2"/>
      <rect x="22" y="25" width="36" height="8" rx="2" fill="currentColor" opacity="0.3"/>
      <path d="M30 45L38 53L50 38" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.4"/>
      <circle cx="40" cy="20" r="6" fill="hsl(var(--primary))" opacity="0.3"/>
    </svg>
  ),
  "contacts": (
    <svg viewBox="0 0 80 80" className="w-16 h-16 text-muted-foreground/30">
      <circle cx="32" cy="32" r="12" fill="currentColor" opacity="0.3"/>
      <path d="M18 56C18 46 24 42 32 42C40 42 46 46 46 56" fill="currentColor" opacity="0.25"/>
      <circle cx="52" cy="36" r="10" fill="currentColor" opacity="0.25"/>
      <path d="M40 60C40 52 45 48 52 48C59 48 64 52 64 60" fill="currentColor" opacity="0.2"/>
      <circle cx="60" cy="26" r="6" fill="hsl(var(--primary))" opacity="0.3"/>
      <path d="M58 26H62M60 24V28" stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0.6"/>
    </svg>
  ),
  "activities": (
    <svg viewBox="0 0 80 80" className="w-16 h-16 text-muted-foreground/30">
      <circle cx="24" cy="28" r="6" fill="currentColor" opacity="0.4"/>
      <rect x="34" y="24" width="28" height="4" rx="2" fill="currentColor" opacity="0.3"/>
      <rect x="34" y="30" width="20" height="2" rx="1" fill="currentColor" opacity="0.2"/>
      <circle cx="24" cy="48" r="6" fill="currentColor" opacity="0.3"/>
      <rect x="34" y="44" width="28" height="4" rx="2" fill="currentColor" opacity="0.3"/>
      <rect x="34" y="50" width="20" height="2" rx="1" fill="currentColor" opacity="0.2"/>
      <path d="M24 34V42" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2" opacity="0.3"/>
      <circle cx="24" cy="66" r="4" fill="currentColor" opacity="0.2"/>
      <path d="M24 54V62" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2" opacity="0.2"/>
    </svg>
  ),
};

export const EmptyState = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className,
  variant = "default",
  illustration,
}: EmptyStateProps) => {
  const paddingClass = variant === "compact" ? "py-6 px-3" : variant === "card" ? "py-8 px-4" : "py-12 px-4";
  
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center",
      paddingClass,
      className
    )}>
      {illustration && EmptyIllustrations[illustration] && (
        <div className="mb-3 animate-fade-in">
          {EmptyIllustrations[illustration]}
        </div>
      )}
      {!illustration && icon && (
        <div className="mb-4 p-3 rounded-full bg-muted/50">
          {icon}
        </div>
      )}
      <h3 className={cn(
        "font-semibold text-foreground mb-1",
        variant === "compact" ? "text-sm" : "text-base"
      )}>{title}</h3>
      {description && (
        <p className={cn(
          "text-muted-foreground max-w-xs",
          variant === "compact" ? "text-xs mb-3" : "text-sm mb-4"
        )}>{description}</p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} size={variant === "compact" ? "sm" : "default"} className="gap-2">
          <Plus className="w-4 h-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
