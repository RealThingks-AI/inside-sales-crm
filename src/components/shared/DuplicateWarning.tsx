import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface DuplicateWarningProps {
  duplicates: Array<{
    id: string;
    name: string;
    email?: string;
    matchType: "exact" | "similar";
  }>;
  entityType?: string;
}

export const DuplicateWarning = ({
  duplicates,
  entityType = "record",
}: DuplicateWarningProps) => {
  if (duplicates.length === 0) return null;

  const hasExact = duplicates.some((d) => d.matchType === "exact");

  return (
    <Alert variant={hasExact ? "destructive" : "default"} className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="ml-2">
          <p className="font-medium">
            {hasExact
              ? `Possible duplicate ${entityType} found`
              : `Similar ${entityType}s found`}
          </p>
          <ul className="mt-1 text-sm space-y-1">
            {duplicates.slice(0, 3).map((dup) => (
              <li key={dup.id} className="flex items-center gap-2">
                <span className="font-medium">{dup.name}</span>
                {dup.email && (
                  <span className="text-muted-foreground">({dup.email})</span>
                )}
                {dup.matchType === "exact" && (
                  <span className="text-xs bg-destructive/20 text-destructive px-1 rounded">
                    Exact match
                  </span>
                )}
              </li>
            ))}
          </ul>
          {duplicates.length > 3 && (
            <p className="text-xs text-muted-foreground mt-1">
              + {duplicates.length - 3} more
            </p>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};
