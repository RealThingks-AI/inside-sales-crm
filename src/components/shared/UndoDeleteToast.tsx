import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UndoDeleteToastProps {
  message: string;
  onUndo: () => Promise<void>;
  onComplete: () => void;
  duration?: number;
}

export const UndoDeleteToast = ({
  message,
  onUndo,
  onComplete,
  duration = 5000,
}: UndoDeleteToastProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isUndoing, setIsUndoing] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 100) {
          clearInterval(interval);
          return 0;
        }
        return prev - 100;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timeLeft === 0 && !isUndoing) {
      setVisible(false);
      onComplete();
    }
  }, [timeLeft, isUndoing, onComplete]);

  const handleUndo = useCallback(async () => {
    setIsUndoing(true);
    try {
      await onUndo();
      setVisible(false);
    } catch (error) {
      console.error("Failed to undo:", error);
      setIsUndoing(false);
    }
  }, [onUndo]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    onComplete();
  }, [onComplete]);

  if (!visible) return null;

  const progress = (timeLeft / duration) * 100;

  return (
    <div className={cn(
      "fixed top-4 left-1/2 -translate-x-1/2 z-[100]",
      "bg-destructive text-destructive-foreground",
      "rounded-lg shadow-lg px-4 py-3 flex items-center gap-3",
      "animate-fade-in"
    )}>
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      <Button
        variant="secondary"
        size="sm"
        onClick={handleUndo}
        disabled={isUndoing}
        className="bg-destructive-foreground text-destructive hover:bg-destructive-foreground/90"
      >
        {isUndoing ? "Restoring..." : "Undo"}
      </Button>
      <button
        onClick={handleDismiss}
        className="p-1 rounded-full hover:bg-destructive-foreground/20"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
      
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-destructive-foreground/20 rounded-b-lg overflow-hidden">
        <div 
          className="h-full bg-destructive-foreground/50 transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
