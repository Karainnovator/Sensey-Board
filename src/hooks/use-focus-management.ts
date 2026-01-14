/**
 * Focus Management Hook
 *
 * Advanced focus management utilities for complex UIs
 */

import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook to restore focus to the previously focused element
 * Useful for modals/dialogs
 */
export function useRestoreFocus(enabled: boolean = true) {
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (enabled) {
      // Store the currently focused element
      previousActiveElementRef.current = document.activeElement as HTMLElement;

      return () => {
        // Restore focus when unmounting
        if (previousActiveElementRef.current) {
          previousActiveElementRef.current.focus();
        }
      };
    }
    return undefined;
  }, [enabled]);

  const restoreFocus = useCallback(() => {
    if (previousActiveElementRef.current) {
      previousActiveElementRef.current.focus();
    }
  }, []);

  return { restoreFocus };
}

/**
 * Hook to manage focus within a list
 * Supports arrow key navigation
 */
export function useListFocus<T extends HTMLElement>() {
  const listRef = useRef<T>(null);
  const focusedIndexRef = useRef(0);

  const getFocusableElements = useCallback(() => {
    if (!listRef.current) return [];
    return Array.from(
      listRef.current.querySelectorAll<HTMLElement>(
        '[data-list-item]:not([disabled])'
      )
    );
  }, []);

  const focusIndex = useCallback(
    (index: number) => {
      const elements = getFocusableElements();
      if (elements[index]) {
        elements[index].focus();
        focusedIndexRef.current = index;
      }
    },
    [getFocusableElements]
  );

  const focusFirst = useCallback(() => {
    focusIndex(0);
  }, [focusIndex]);

  const focusLast = useCallback(() => {
    const elements = getFocusableElements();
    focusIndex(elements.length - 1);
  }, [getFocusableElements, focusIndex]);

  const focusNext = useCallback(() => {
    const elements = getFocusableElements();
    const nextIndex = Math.min(
      focusedIndexRef.current + 1,
      elements.length - 1
    );
    focusIndex(nextIndex);
  }, [getFocusableElements, focusIndex]);

  const focusPrevious = useCallback(() => {
    const nextIndex = Math.max(focusedIndexRef.current - 1, 0);
    focusIndex(nextIndex);
  }, [focusIndex]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          focusNext();
          break;
        case 'ArrowUp':
          event.preventDefault();
          focusPrevious();
          break;
        case 'Home':
          event.preventDefault();
          focusFirst();
          break;
        case 'End':
          event.preventDefault();
          focusLast();
          break;
      }
    },
    [focusNext, focusPrevious, focusFirst, focusLast]
  );

  return {
    listRef,
    focusedIndex: focusedIndexRef.current,
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious,
    focusIndex,
    handleKeyDown,
  };
}

/**
 * Hook to create a roving tabindex
 * Only one item in the list is tabbable at a time
 */
export function useRovingTabIndex(_items: number, defaultIndex: number = 0) {
  const activeIndexRef = useRef(defaultIndex);

  const getTabIndex = useCallback((index: number) => {
    return index === activeIndexRef.current ? 0 : -1;
  }, []);

  const setActiveIndex = useCallback((index: number) => {
    activeIndexRef.current = index;
  }, []);

  return {
    getTabIndex,
    setActiveIndex,
    activeIndex: activeIndexRef.current,
  };
}

/**
 * Hook to detect if user is navigating with keyboard
 */
export function useKeyboardUser() {
  const isKeyboardUserRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        isKeyboardUserRef.current = true;
        document.body.classList.add('keyboard-user');
      }
    };

    const handleMouseDown = () => {
      isKeyboardUserRef.current = false;
      document.body.classList.remove('keyboard-user');
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return isKeyboardUserRef.current;
}

/**
 * Hook to skip to main content (accessibility feature)
 */
export function useSkipToContent() {
  const skipToMain = useCallback(() => {
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.focus();
      mainElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return { skipToMain };
}
