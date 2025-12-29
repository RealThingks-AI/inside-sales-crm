import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CopyableCellProps {
  value: string | undefined | null;
  className?: string;
  showIconAlways?: boolean;
}

export const CopyableCell = ({ value, className, showIconAlways = false }: CopyableCellProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  if (!value) {
    return <span className={cn("text-muted-foreground", className)}>-</span>;
  }

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast({
        title: "Copied!",
        description: `"${value}" copied to clipboard`,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={cn("group flex items-center gap-1.5 max-w-full", className)}>
      <span className="truncate" title={value}>{value}</span>
      <button
        onClick={handleCopy}
        className={cn(
          "flex-shrink-0 p-0.5 rounded hover:bg-muted transition-opacity",
          showIconAlways ? "opacity-70" : "opacity-0 group-hover:opacity-70"
        )}
        aria-label={`Copy ${value} to clipboard`}
        title="Copy to clipboard"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-green-500" />
        ) : (
          <Copy className="w-3.5 h-3.5 text-muted-foreground" />
        )}
      </button>
    </div>
  );
};
