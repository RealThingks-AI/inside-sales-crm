import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, X } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from "date-fns";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

interface DateRangeFilterProps {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  label?: string;
  className?: string;
}

const presets = [
  { label: "Today", getValue: () => ({ from: new Date(), to: new Date() }) },
  { label: "Last 7 days", getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
  { label: "Last 30 days", getValue: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
  { label: "This month", getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
  { label: "This quarter", getValue: () => ({ from: startOfQuarter(new Date()), to: endOfQuarter(new Date()) }) },
  { label: "This year", getValue: () => ({ from: startOfYear(new Date()), to: endOfYear(new Date()) }) },
];

export const DateRangeFilter = ({
  value,
  onChange,
  label = "Date Range",
  className,
}: DateRangeFilterProps) => {
  const [open, setOpen] = useState(false);

  const isFiltered = value?.from || value?.to;

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
  };

  const formatDateRange = () => {
    if (!value?.from) return label;
    if (!value.to) return format(value.from, "dd/MM/yyyy");
    return `${format(value.from, "dd/MM")} - ${format(value.to, "dd/MM")}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "relative justify-start text-left font-normal h-8",
            !value && "text-muted-foreground",
            isFiltered && "border-primary",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span className="truncate max-w-[150px]">{formatDateRange()}</span>
          {isFiltered && (
            <>
              <Badge 
                variant="default" 
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full"
              >
                1
              </Badge>
              <button
                onClick={handleClear}
                className="ml-2 p-0.5 rounded-full hover:bg-muted"
                aria-label="Clear date filter"
              >
                <X className="h-3 w-3" />
              </button>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          <div className="border-r p-2 space-y-1">
            <p className="text-xs font-medium text-muted-foreground px-2 pb-1">Presets</p>
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => {
                  onChange(preset.getValue());
                  setOpen(false);
                }}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <div className="p-3">
            <Calendar
              mode="range"
              selected={value}
              onSelect={(range) => {
                onChange(range);
                if (range?.from && range?.to) {
                  setOpen(false);
                }
              }}
              numberOfMonths={2}
              className="pointer-events-auto"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
