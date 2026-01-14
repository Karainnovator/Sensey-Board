/**
 * Animation Configurations
 *
 * Centralized animation variants for Framer Motion
 * Following the design system specifications:
 * - Micro-interactions: 150ms
 * - Standard transitions: 200ms
 * - Complex animations: 300ms
 * - Page transitions: 400ms
 * - Easing: ease-out (entering), ease-in (exiting)
 */

import type { Variants } from 'framer-motion';

/**
 * Fade In Animation
 * Used for: modals, dialogs, popovers
 */
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

/**
 * Slide Up Animation
 * Used for: modals, sheets, bottom panels
 */
export const slideUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: {
      duration: 0.15,
      ease: 'easeIn',
    },
  },
};

/**
 * Scale Animation
 * Used for: tooltips, dropdown menus
 */
export const scale: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.15,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: 'easeIn',
    },
  },
};

/**
 * Slide In From Right
 * Used for: sidebars, side panels
 */
export const slideInRight: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

/**
 * Stagger Children Animation
 * Used for: lists, grids
 */
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

/**
 * Stagger Child Item
 * Used with staggerContainer
 */
export const staggerItem: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
};

/**
 * Page Transition
 * Used for: page navigation
 */
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

/**
 * Card Hover Animation
 * Used for: interactive cards
 */
export const cardHover = {
  rest: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.15,
      ease: [0.33, 1, 0.68, 1] as const,
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
      ease: [0.42, 0, 1, 1] as const,
    },
  },
} as const;

/**
 * Button Press Animation
 * Used for: buttons, clickable elements
 */
export const buttonPress = {
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: 'easeInOut',
    },
  },
};

/**
 * Spring Configuration
 * Used for: smooth, natural animations
 */
export const spring = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
};

/**
 * Bounce Configuration
 * Used for: playful interactions
 */
export const bounce = {
  type: 'spring',
  stiffness: 500,
  damping: 20,
};

/**
 * Layout Transition
 * Used for: animated layout changes
 */
export const layoutTransition = {
  duration: 0.3,
  ease: 'easeInOut',
};
