import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClearFiltersButtonProps {
  hasActiveFilters: boolean;
  onClear: () => void;
  className?: string;
}

export const ClearFiltersButton = ({
  hasActiveFilters,
  onClear,
  className,
}: ClearFiltersButtonProps) => {
  if (!hasActiveFilters) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClear}
      className={cn(
        "h-8 px-2 text-muted-foreground hover:text-foreground",
        className
      )}
    >
      <X className="w-4 h-4 mr-1" />
      Clear filters
    </Button>
  );
};
