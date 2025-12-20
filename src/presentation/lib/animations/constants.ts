// Animation timing specs (minimalist, performance-optimized)
export const ANIMATION_TIMING = {
  delay: 0.1,        // Minimal delay for snappier feel
  duration: 0.5,     // Shorter duration for better performance
  stagger: 0.08,     // Faster stagger between children
} as const;

// Easing curves
export const ANIMATION_EASING = {
  default: [0.25, 0.1, 0.25, 1.0] as const,  // cubic-bezier(0.25, 0.1, 0.25, 1)
  smooth: [0.43, 0.13, 0.23, 0.96] as const,
  gentle: [0.4, 0, 0.2, 1] as const,
  bounce: [0.68, -0.55, 0.265, 1.55] as const,
} as const;

// Viewport detection settings
export const VIEWPORT_CONFIG = {
  once: true,        // Animate only once
  amount: 0.2,       // Trigger when 20% visible
  margin: '-100px',  // Start animation before fully in view
} as const;

// Common animation variants
export const fadeInUpVariants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_TIMING.duration,
      ease: ANIMATION_EASING.default,
    }
  }
};

export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: ANIMATION_TIMING.duration,
      ease: ANIMATION_EASING.gentle,
    }
  }
};

export const scaleInVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: ANIMATION_TIMING.duration,
      ease: ANIMATION_EASING.default,
    }
  }
};

export const slideInLeftVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: ANIMATION_TIMING.duration,
      ease: ANIMATION_EASING.default,
    }
  }
};

export const slideInRightVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: ANIMATION_TIMING.duration,
      ease: ANIMATION_EASING.default,
    }
  }
};

// Stagger container variants
export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: ANIMATION_TIMING.stagger,
      delayChildren: ANIMATION_TIMING.delay,
    }
  }
};

// Stagger item variants (for children of StaggerContainer)
export const staggerItemVariants = {
  hidden: {
    opacity: 0,
    y: 15
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_TIMING.duration,
      ease: ANIMATION_EASING.default,
    }
  }
};
