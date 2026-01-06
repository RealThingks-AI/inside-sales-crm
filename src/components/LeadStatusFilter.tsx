import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface LeadStatusFilterProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const LeadStatusFilter = ({ value, onValueChange }: LeadStatusFilterProps) => {
  const isActive = value !== "all";
  
  return (
    <Select value={value || "all"} onValueChange={onValueChange}>
      <SelectTrigger 
        className={cn(
          "w-40",
          isActive && "border-primary"
        )}
      >
        <SelectValue placeholder="All Statuses" />
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
