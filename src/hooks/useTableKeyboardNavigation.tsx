import { useCallback, useRef, useEffect } from "react";

interface UseTableKeyboardNavigationOptions {
  onEnter?: (rowIndex: number) => void;
  onEscape?: () => void;
  enabled?: boolean;
}

export const useTableKeyboardNavigation = ({
  onEnter,
  onEscape,
  enabled = true,
}: UseTableKeyboardNavigationOptions = {}) => {
  const tableRef = useRef<HTMLTableElement>(null);
  const focusedRowIndex = useRef<number>(-1);

  const getFocusableRows = useCallback(() => {
    if (!tableRef.current) return [];
    return Array.from(tableRef.current.querySelectorAll('tbody tr[tabindex]'));
  }, []);

  const focusRow = useCallback((index: number) => {
    const rows = getFocusableRows();
    if (index >= 0 && index < rows.length) {
      focusedRowIndex.current = index;
      (rows[index] as HTMLElement).focus();
    }
  }, [getFocusableRows]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;
    
    const rows = getFocusableRows();
    if (rows.length === 0) return;

    const activeElement = document.activeElement;
    const currentIndex = rows.indexOf(activeElement as Element);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (currentIndex === -1) {
          focusRow(0);
        } else if (currentIndex < rows.length - 1) {
          focusRow(currentIndex + 1);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (currentIndex > 0) {
          focusRow(currentIndex - 1);
        }
        break;
      case 'Home':
        if (e.ctrlKey) {
          e.preventDefault();
          focusRow(0);
        }
        break;
      case 'End':
        if (e.ctrlKey) {
          e.preventDefault();
          focusRow(rows.length - 1);
        }
        break;
      case 'Enter':
      case ' ':
        if (currentIndex >= 0 && onEnter) {
          e.preventDefault();
          onEnter(currentIndex);
        }
        break;
      case 'Escape':
        if (onEscape) {
          onEscape();
        }
        (activeElement as HTMLElement)?.blur();
        break;
    }
  }, [enabled, getFocusableRows, focusRow, onEnter, onEscape]);

  useEffect(() => {
    const table = tableRef.current;
    if (!table || !enabled) return;

    table.addEventListener('keydown', handleKeyDown);
    return () => table.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);

  const getRowProps = useCallback((index: number) => ({
    tabIndex: 0,
    role: 'row',
    'aria-rowindex': index + 1,
    className: 'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset',
  }), []);

  return {
    tableRef,
    getRowProps,
    focusRow,
  };
};
