import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface LeadStatusFilterProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const LeadStatusFilter = ({ value, onValueChange }: LeadStatusFilterProps) => {
  const isFiltered = value && value !== "all";
  
  return (
    <Select value={value || "New"} onValueChange={onValueChange}>
      <SelectTrigger className={cn("w-40 relative", isFiltered && "border-primary")}>
        <SelectValue placeholder="New" />
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
        <SelectItem value="all">All Statuses</SelectItem>
        <SelectItem value="New">New</SelectItem>
        <SelectItem value="Attempted">Attempted</SelectItem>
        <SelectItem value="Follow-up">Follow-up</SelectItem>
        <SelectItem value="Qualified">Qualified</SelectItem>
        <SelectItem value="Disqualified">Disqualified</SelectItem>
        <SelectItem value="Converted">Converted</SelectItem>
      </SelectContent>
    </Select>
  );
};
