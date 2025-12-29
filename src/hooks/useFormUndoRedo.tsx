import { useState, useCallback, useEffect, useRef } from 'react';

interface UndoRedoState<T> {
  past: T[];
  present: T;
  future: T[];
}

export function useFormUndoRedo<T>(initialState: T, maxHistory: number = 50) {
  const [state, setState] = useState<UndoRedoState<T>>({
    past: [],
    present: initialState,
    future: [],
  });
  
  const isKeyboardRef = useRef(false);

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const set = useCallback((newPresent: T | ((prev: T) => T)) => {
    setState(currentState => {
      const resolvedPresent = typeof newPresent === 'function' 
        ? (newPresent as (prev: T) => T)(currentState.present)
        : newPresent;
      
      // Don't add to history if value hasn't changed
      if (JSON.stringify(currentState.present) === JSON.stringify(resolvedPresent)) {
        return currentState;
      }

      return {
        past: [...currentState.past, currentState.present].slice(-maxHistory),
        present: resolvedPresent,
        future: [],
      };
    });
  }, [maxHistory]);

  const undo = useCallback(() => {
    setState(currentState => {
      if (currentState.past.length === 0) return currentState;
      
      const previous = currentState.past[currentState.past.length - 1];
      const newPast = currentState.past.slice(0, currentState.past.length - 1);
      
      return {
        past: newPast,
        present: previous,
        future: [currentState.present, ...currentState.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState(currentState => {
      if (currentState.future.length === 0) return currentState;
      
      const next = currentState.future[0];
      const newFuture = currentState.future.slice(1);
      
      return {
        past: [...currentState.past, currentState.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  const reset = useCallback((newPresent: T) => {
    setState({
      past: [],
      present: newPresent,
      future: [],
    });
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if we're in a form context
      const target = e.target as HTMLElement;
      const isInForm = target.closest('form') || 
                       target.tagName === 'INPUT' || 
                       target.tagName === 'TEXTAREA' ||
                       target.tagName === 'SELECT';
      
      if (!isInForm) return;

      // Ctrl+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        if (canUndo) {
          e.preventDefault();
          undo();
        }
      }
      
      // Ctrl+Y or Ctrl+Shift+Z for redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        if (canRedo) {
          e.preventDefault();
          redo();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo]);

  return {
    state: state.present,
    set,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
    history: {
      past: state.past.length,
      future: state.future.length,
    },
  };
}
