import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Plus, X, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface SearchCondition {
  id: string;
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'notEquals' | 'isEmpty' | 'isNotEmpty';
  value: string;
}

export interface SearchGroup {
  id: string;
  logic: 'AND' | 'OR';
  conditions: SearchCondition[];
}

interface AdvancedSearchBarProps {
  fields: { value: string; label: string }[];
  onSearch: (groups: SearchGroup[]) => void;
  placeholder?: string;
  simpleSearch?: string;
  onSimpleSearchChange?: (value: string) => void;
}

const OPERATORS = [
  { value: 'contains', label: 'Contains' },
  { value: 'equals', label: 'Equals' },
  { value: 'startsWith', label: 'Starts with' },
  { value: 'endsWith', label: 'Ends with' },
  { value: 'notEquals', label: 'Not equals' },
  { value: 'isEmpty', label: 'Is empty' },
  { value: 'isNotEmpty', label: 'Is not empty' },
];

export const AdvancedSearchBar = ({
  fields,
  onSearch,
  placeholder = "Search...",
  simpleSearch = "",
  onSimpleSearchChange,
}: AdvancedSearchBarProps) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [groups, setGroups] = useState<SearchGroup[]>([
    {
      id: crypto.randomUUID(),
      logic: 'AND',
      conditions: [],
    },
  ]);

  const addCondition = (groupId: string) => {
    setGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          conditions: [
            ...group.conditions,
            {
              id: crypto.randomUUID(),
              field: fields[0]?.value || '',
              operator: 'contains' as const,
              value: '',
            },
          ],
        };
      }
      return group;
    }));
  };

  const removeCondition = (groupId: string, conditionId: string) => {
    setGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          conditions: group.conditions.filter(c => c.id !== conditionId),
        };
      }
      return group;
    }));
  };

  const updateCondition = (
    groupId: string,
    conditionId: string,
    updates: Partial<SearchCondition>
  ) => {
    setGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          conditions: group.conditions.map(c => {
            if (c.id === conditionId) {
              return { ...c, ...updates };
            }
            return c;
          }),
        };
      }
      return group;
    }));
  };

  const updateGroupLogic = (groupId: string, logic: 'AND' | 'OR') => {
    setGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        return { ...group, logic };
      }
      return group;
    }));
  };

  const addGroup = () => {
    setGroups(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        logic: 'AND',
        conditions: [],
      },
    ]);
  };

  const removeGroup = (groupId: string) => {
    if (groups.length <= 1) return;
    setGroups(prev => prev.filter(g => g.id !== groupId));
  };

  const applyAdvancedSearch = () => {
    const validGroups = groups.filter(g => g.conditions.length > 0);
    onSearch(validGroups);
    setIsAdvancedOpen(false);
  };

  const clearAdvancedSearch = () => {
    setGroups([{
      id: crypto.randomUUID(),
      logic: 'AND',
      conditions: [],
    }]);
    onSearch([]);
  };

  const hasActiveFilters = groups.some(g => g.conditions.length > 0);

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={simpleSearch}
          onChange={(e) => onSimpleSearchChange?.(e.target.value)}
          placeholder={placeholder}
          className="pl-9 pr-4"
        />
      </div>
      
      <Popover open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Advanced
            {hasActiveFilters && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {groups.reduce((acc, g) => acc + g.conditions.length, 0)}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[500px] p-4" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Advanced Search</h4>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Build complex search queries with AND/OR conditions.</p>
                    <p className="mt-1">Example: Status = "New" AND Priority = "High"</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {groups.map((group, groupIndex) => (
              <div key={group.id} className="space-y-2 p-3 border rounded-lg bg-muted/30">
                {groupIndex > 0 && (
                  <div className="flex items-center gap-2 pb-2 mb-2 border-b">
                    <span className="text-xs text-muted-foreground">Connect with:</span>
                    <Badge variant="outline">OR</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto h-6 px-2"
                      onClick={() => removeGroup(group.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                {group.conditions.length > 0 && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-muted-foreground">Match:</span>
                    <Select
                      value={group.logic}
                      onValueChange={(v) => updateGroupLogic(group.id, v as 'AND' | 'OR')}
                    >
                      <SelectTrigger className="w-20 h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AND">ALL</SelectItem>
                        <SelectItem value="OR">ANY</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-xs text-muted-foreground">conditions</span>
                  </div>
                )}

                {group.conditions.map((condition, condIndex) => (
                  <div key={condition.id} className="flex items-center gap-2">
                    {condIndex > 0 && (
                      <span className="text-xs text-muted-foreground w-10">
                        {group.logic}
                      </span>
                    )}
                    <Select
                      value={condition.field}
                      onValueChange={(v) => updateCondition(group.id, condition.id, { field: v })}
                    >
                      <SelectTrigger className="w-28 h-8 text-xs">
                        <SelectValue placeholder="Field" />
                      </SelectTrigger>
                      <SelectContent>
                        {fields.map(f => (
                          <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select
                      value={condition.operator}
                      onValueChange={(v) => updateCondition(group.id, condition.id, { operator: v as any })}
                    >
                      <SelectTrigger className="w-28 h-8 text-xs">
                        <SelectValue placeholder="Operator" />
                      </SelectTrigger>
                      <SelectContent>
                        {OPERATORS.map(op => (
                          <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {!['isEmpty', 'isNotEmpty'].includes(condition.operator) && (
                      <Input
                        value={condition.value}
                        onChange={(e) => updateCondition(group.id, condition.id, { value: e.target.value })}
                        placeholder="Value"
                        className="flex-1 h-8 text-xs"
                      />
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => removeCondition(group.id, condition.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-7 text-xs mt-2"
                  onClick={() => addCondition(group.id)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Condition
                </Button>
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={addGroup}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add OR Group
            </Button>

            <div className="flex justify-between pt-2 border-t">
              <Button variant="ghost" size="sm" onClick={clearAdvancedSearch}>
                Clear All
              </Button>
              <Button size="sm" onClick={applyAdvancedSearch}>
                Apply Search
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

// Helper function to apply search conditions to data
export function applyAdvancedSearch<T extends Record<string, any>>(
  data: T[],
  groups: SearchGroup[],
  simpleSearch?: string,
  simpleSearchFields?: string[]
): T[] {
  let filtered = data;

  // Apply simple search first
  if (simpleSearch && simpleSearchFields && simpleSearchFields.length > 0) {
    const searchLower = simpleSearch.toLowerCase();
    filtered = filtered.filter(item =>
      simpleSearchFields.some(field => {
        const value = item[field];
        return value && String(value).toLowerCase().includes(searchLower);
      })
    );
  }

  // Apply advanced search groups (connected with OR between groups)
  if (groups.length > 0 && groups.some(g => g.conditions.length > 0)) {
    filtered = filtered.filter(item => {
      // Groups are connected with OR
      return groups.some(group => {
        if (group.conditions.length === 0) return false;
        
        // Conditions within a group are connected with AND or OR based on group.logic
        if (group.logic === 'AND') {
          return group.conditions.every(condition => matchCondition(item, condition));
        } else {
          return group.conditions.some(condition => matchCondition(item, condition));
        }
      });
    });
  }

  return filtered;
}

function matchCondition<T extends Record<string, any>>(
  item: T,
  condition: SearchCondition
): boolean {
  const value = item[condition.field];
  const valueStr = value ? String(value).toLowerCase() : '';
  const searchValue = condition.value.toLowerCase();

  switch (condition.operator) {
    case 'equals':
      return valueStr === searchValue;
    case 'notEquals':
      return valueStr !== searchValue;
    case 'contains':
      return valueStr.includes(searchValue);
    case 'startsWith':
      return valueStr.startsWith(searchValue);
    case 'endsWith':
      return valueStr.endsWith(searchValue);
    case 'isEmpty':
      return !value || valueStr === '';
    case 'isNotEmpty':
      return value && valueStr !== '';
    default:
      return false;
  }
}
