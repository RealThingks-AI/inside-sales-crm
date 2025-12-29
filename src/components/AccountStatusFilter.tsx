import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface AccountStatusFilterProps {
  value: string;
  onValueChange: (value: string) => void;
}

const statuses = [
  { value: "all", label: "All Statuses" },
  { value: "New", label: "New" },
  { value: "Working", label: "Working" },
  { value: "Warm", label: "Warm" },
  { value: "Hot", label: "Hot" },
  { value: "Nurture", label: "Nurture" },
  { value: "Closed-Won", label: "Closed-Won" },
  { value: "Closed-Lost", label: "Closed-Lost" },
];

export const AccountStatusFilter = ({ value, onValueChange }: AccountStatusFilterProps) => {
  const isFiltered = value && value !== "all";
  
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={cn("w-40 relative", isFiltered && "border-primary")}>
        <SelectValue placeholder="Filter by status" />
        {isFiltered && (
          <Badge 
            variant="default" 
            className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full"
          >
            1
          </Badge>
        )}
      </SelectTrigger>
      <SelectContent>
        {statuses.map((status) => (
          <SelectItem key={status.value} value={status.value}>
            {status.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
