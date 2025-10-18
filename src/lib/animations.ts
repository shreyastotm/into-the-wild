/**
 * Animation utilities for golden hour theme
 * Provides reusable animation functions and configurations
 */

export const animations = {
  // Durations in milliseconds
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 500,
    slower: 700,
  },

  // Easing functions
  easing: {
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',      // ease-in-out
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // bounce
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',       // ease-in
    elastic: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)', // elastic
  },

  // Delays for staggered animations
  stagger: {
    delay: (index: number, baseDelay: number = 50) => index * baseDelay,
  },
};

/**
 * Fade in animation with optional direction
 */
export const fadeIn = (direction?: 'up' | 'down' | 'left' | 'right', duration: number = 300) => {
  const translate = {
    up: 'translateY(20px)',
    down: 'translateY(-20px)',
    left: 'translateX(20px)',
    right: 'translateX(-20px)',
  };

  return {
    initial: {
      opacity: 0,
      transform: direction ? translate[direction] : 'none',
    },
    animate: {
      opacity: 1,
      transform: 'translate(0, 0)',
    },
    transition: `opacity ${duration}ms ${animations.easing.smooth}, transform ${duration}ms ${animations.easing.smooth}`,
  };
};

/**
 * Scale animation
 */
export const scaleIn = (duration: number = 300) => ({
  initial: {
    opacity: 0,
    transform: 'scale(0.9)',
  },
  animate: {
    opacity: 1,
    transform: 'scale(1)',
  },
  transition: `all ${duration}ms ${animations.easing.bounce}`,
});

/**
 * Slide animation
 */
export const slideIn = (direction: 'left' | 'right' | 'up' | 'down', duration: number = 300) => {
  const translate = {
    left: 'translateX(-100%)',
    right: 'translateX(100%)',
    up: 'translateY(-100%)',
    down: 'translateY(100%)',
  };

  return {
    initial: {
      transform: translate[direction],
    },
    animate: {
      transform: 'translate(0, 0)',
    },
    transition: `transform ${duration}ms ${animations.easing.smooth}`,
  };
};

/**
 * Stagger children animation helper
 */
export const staggerChildren = (count: number, baseDelay: number = 50) => {
  return Array.from({ length: count }, (_, i) => ({
    animationDelay: `${i * baseDelay}ms`,
  }));
};

/**
 * Golden shimmer effect for loading states
 */
export const goldenShimmer = {
  keyframes: `
    @keyframes goldenShimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
  `,
  animation: 'goldenShimmer 3s infinite',
  background: 'linear-gradient(90deg, transparent 0%, rgba(244, 164, 96, 0.3) 50%, transparent 100%)',
  backgroundSize: '200% 100%',
};

/**
 * Pulse animation for featured items
 */
export const pulse = (scale: number = 1.05, duration: number = 2000) => ({
  animation: `pulse-subtle ${duration}ms ${animations.easing.smooth} infinite`,
  '@keyframes pulse-subtle': {
    '0%, 100%': { transform: 'scale(1)' },
    '50%': { transform: `scale(${scale})` },
  },
});

/**
 * Intersection Observer hook utility for scroll animations
 */
export const createScrollObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
) => {
  const defaultOptions: IntersectionObserverInit = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px',
    ...options,
  };

  return new IntersectionObserver(callback, defaultOptions);
};

/**
 * Animation class names
 */
export const animationClasses = {
  fadeInUp: 'fade-in-up',
  fadeInDown: 'animate-fade-in-down',
  fadeInScale: 'fade-in-scale',
  slideInRight: 'slide-in-right',
  slideInLeft: 'slide-in-left',
  bounceIn: 'bounce-in',
  pulseSubtle: 'animate-pulse-subtle',
  goldenShimmer: 'golden-shimmer',
  cardInteractive: 'card-interactive',
  touchRipple: 'touch-ripple',
};

/**
 * Page transition variants
 */
export const pageTransitions = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: animations.duration.normal,
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: animations.duration.normal,
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: animations.duration.normal,
  },
};

/**
 * Helper to apply animation with delay
 */
export const withDelay = (animationClass: string, delay: number) => {
  return `${animationClass} animation-delay-${delay}`;
};

