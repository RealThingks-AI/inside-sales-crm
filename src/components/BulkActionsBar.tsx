import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Trash2, Download, X } from "lucide-react";
import { BulkDeleteConfirmDialog } from "./shared/BulkDeleteConfirmDialog";

interface BulkActionsBarProps {
  selectedCount: number;
  onDelete: () => void;
  onExport: () => void;
  onClearSelection: () => void;
  itemType?: string;
}

export const BulkActionsBar = ({ selectedCount, onDelete, onExport, onClearSelection, itemType = "items" }: BulkActionsBarProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (selectedCount === 0) return null;

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete();
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
        <div className="bg-card border rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 backdrop-blur-sm"
             style={{ background: 'var(--gradient-subtle)', boxShadow: 'var(--shadow-lg)' }}>
          <Badge variant="secondary" className="text-sm font-bold px-2 py-1 bg-primary text-primary-foreground">
            {selectedCount} {itemType}{selectedCount !== 1 && !itemType.endsWith('s') ? 's' : ''}
          </Badge>
          
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onExport}
                  className="hover-scale button-scale transition-all hover:shadow-md px-3"
                  aria-label={`Export selected ${itemType}`}
                >
                  <Download className="w-4 h-4 sm:mr-2" aria-hidden="true" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export selected {itemType} to CSV</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDeleteClick}
                  className="hover-scale button-scale transition-all hover:shadow-md px-3"
                  aria-label={`Delete selected ${itemType}`}
                >
                  <Trash2 className="w-4 h-4 sm:mr-2" aria-hidden="true" />
                  <span className="hidden sm:inline">Delete</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete selected {itemType}</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onClearSelection}
                  className="hover-scale button-scale transition-all p-2"
                  aria-label="Clear selection"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clear selection</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      <BulkDeleteConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleConfirmDelete}
        count={selectedCount}
        itemType={itemType}
      />
    </>
  );
};