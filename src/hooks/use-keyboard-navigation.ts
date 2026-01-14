/**
 * Keyboard Navigation Hook
 *
 * Provides keyboard navigation utilities for interactive elements
 * Supports arrow keys, Enter, Escape, and Tab navigation
 */

import { useEffect, useCallback, useRef } from 'react';

export interface KeyboardNavigationOptions {
  /**
   * Whether navigation is enabled
   */
  enabled?: boolean;

  /**
   * Callback when Enter key is pressed
   */
  onEnter?: () => void;

  /**
   * Callback when Escape key is pressed
   */
  onEscape?: () => void;

  /**
   * Callback when arrow keys are pressed
   */
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;

  /**
   * Whether to prevent default behavior
   */
  preventDefault?: boolean;
}

/**
 * Hook for keyboard navigation
 */
export function useKeyboardNavigation(options: KeyboardNavigationOptions) {
  const {
    enabled = true,
    onEnter,
    onEscape,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    preventDefault = true,
  } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Enter':
          if (onEnter) {
            if (preventDefault) event.preventDefault();
            onEnter();
          }
          break;
        case 'Escape':
          if (onEscape) {
            if (preventDefault) event.preventDefault();
            onEscape();
          }
          break;
        case 'ArrowUp':
          if (onArrowUp) {
            if (preventDefault) event.preventDefault();
            onArrowUp();
          }
          break;
        case 'ArrowDown':
          if (onArrowDown) {
            if (preventDefault) event.preventDefault();
            onArrowDown();
          }
          break;
        case 'ArrowLeft':
          if (onArrowLeft) {
            if (preventDefault) event.preventDefault();
            onArrowLeft();
          }
          break;
        case 'ArrowRight':
          if (onArrowRight) {
            if (preventDefault) event.preventDefault();
            onArrowRight();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    enabled,
    onEnter,
    onEscape,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    preventDefault,
  ]);
}

/**
 * Focus Trap Hook
 * Traps focus within a container (useful for modals/dialogs)
 */
export function useFocusTrap(enabled: boolean = true) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    // Focus first element when trap is activated
    firstElement?.focus();

    container.addEventListener('keydown', handleTab as EventListener);
    return () =>
      container.removeEventListener('keydown', handleTab as EventListener);
  }, [enabled]);

  return containerRef;
}

/**
 * Auto Focus Hook
 * Automatically focuses an element when mounted
 */
export function useAutoFocus<T extends HTMLElement>(enabled: boolean = true) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (enabled && ref.current) {
      // Small delay to ensure element is fully mounted
      setTimeout(() => {
        ref.current?.focus();
      }, 0);
    }
  }, [enabled]);

  return ref;
}

/**
 * Focus Visible Hook
 * Adds keyboard focus styles only when navigating with keyboard
 */
export function useFocusVisible() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let hadKeyboardEvent = false;

    const handleMouseDown = () => {
      hadKeyboardEvent = false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        hadKeyboardEvent = true;
      }
    };

    const handleFocus = () => {
      if (hadKeyboardEvent) {
        element.classList.add('focus-visible');
      }
    };

    const handleBlur = () => {
      element.classList.remove('focus-visible');
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    element.addEventListener('focus', handleFocus);
    element.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
      element.removeEventListener('focus', handleFocus);
      element.removeEventListener('blur', handleBlur);
    };
  }, []);

  return ref;
}

/**
 * Grid Navigation Hook
 * Provides arrow key navigation for grid layouts
 */
export function useGridNavigation(
  columns: number,
  totalItems: number,
  enabled: boolean = true
) {
  const currentIndexRef = useRef(0);

  const navigateUp = useCallback(() => {
    currentIndexRef.current = Math.max(0, currentIndexRef.current - columns);
    focusItemAtIndex(currentIndexRef.current);
  }, [columns]);

  const navigateDown = useCallback(() => {
    currentIndexRef.current = Math.min(
      totalItems - 1,
      currentIndexRef.current + columns
    );
    focusItemAtIndex(currentIndexRef.current);
  }, [columns, totalItems]);

  const navigateLeft = useCallback(() => {
    currentIndexRef.current = Math.max(0, currentIndexRef.current - 1);
    focusItemAtIndex(currentIndexRef.current);
  }, []);

  const navigateRight = useCallback(() => {
    currentIndexRef.current = Math.min(
      totalItems - 1,
      currentIndexRef.current + 1
    );
    focusItemAtIndex(currentIndexRef.current);
  }, [totalItems]);

  useKeyboardNavigation({
    enabled,
    onArrowUp: navigateUp,
    onArrowDown: navigateDown,
    onArrowLeft: navigateLeft,
    onArrowRight: navigateRight,
    preventDefault: true,
  });

  return {
    currentIndex: currentIndexRef.current,
    setCurrentIndex: (index: number) => {
      currentIndexRef.current = index;
    },
  };
}

/**
 * Helper function to focus an item at a specific index
 */
function focusItemAtIndex(index: number) {
  const items = document.querySelectorAll('[data-grid-item]');
  const item = items[index] as HTMLElement;
  item?.focus();
}
