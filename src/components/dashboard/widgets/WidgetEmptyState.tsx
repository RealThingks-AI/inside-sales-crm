import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface WidgetEmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const WidgetEmptyState = ({ 
  icon, 
  title, 
  description, 
  actionLabel, 
  onAction 
}: WidgetEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full py-4 px-2 text-center">
      <div className="text-muted-foreground/50 mb-2">
        {icon}
      </div>
      <p className="text-xs font-medium text-foreground mb-0.5">{title}</p>
      <p className="text-[10px] text-muted-foreground mb-2">{description}</p>
      {actionLabel && onAction && (
        <Button 
          variant="outline" 
          size="sm" 
          className="h-6 text-xs gap-1" 
          onClick={onAction}
        >
          <Plus className="w-3 h-3" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
