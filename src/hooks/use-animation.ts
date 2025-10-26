import { useEffect, useRef, useState } from "react";

import { createScrollObserver } from "@/lib/animations";

/**
 * Hook for scroll-based animations
 * Triggers animations when elements enter the viewport
 *
 * @example
 * ```tsx
 * const { ref, isVisible } = useScrollAnimation();
 *
 * <div ref={ref} className={isVisible ? 'fade-in-up' : 'opacity-0'}>
 *   Content appears on scroll
 * </div>
 * ```
 */
export const useScrollAnimation = (options?: IntersectionObserverInit) => {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = createScrollObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Optionally disconnect after first appearance
          // observer.disconnect();
        }
      });
    }, options);

    observer.observe(element);

    return () => observer.disconnect();
  }, [options]);

  return { ref, isVisible };
};

/**
 * Hook for staggered list animations
 * Animates list items with sequential delays
 *
 * @example
 * ```tsx
 * const { getItemProps } = useStaggerAnimation(items.length);
 *
 * {items.map((item, i) => (
 *   <div {...getItemProps(i)}>
 *     {item.content}
 *   </div>
 * ))}
 * ```
 */
export const useStaggerAnimation = (count: number, baseDelay: number = 50) => {
  const getItemProps = (index: number) => ({
    style: {
      animationDelay: `${index * baseDelay}ms`,
    },
    className: "fade-in-up",
  });

  return { getItemProps };
};

/**
 * Hook for element visibility detection
 * More flexible than useScrollAnimation
 */
export const useInView = (options?: IntersectionObserverInit) => {
  const ref = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [hasBeenInView, setHasBeenInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = createScrollObserver((entries) => {
      entries.forEach((entry) => {
        setIsInView(entry.isIntersecting);
        if (entry.isIntersecting && !hasBeenInView) {
          setHasBeenInView(true);
        }
      });
    }, options);

    observer.observe(element);

    return () => observer.disconnect();
  }, [hasBeenInView, options]);

  return { ref, isInView, hasBeenInView };
};

/**
 * Hook for parallax scroll effect
 * Creates smooth parallax motion on scroll
 */
export const useParallax = (speed: number = 0.5) => {
  const ref = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const element = ref.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const scrolled = window.pageYOffset;
      const rate = scrolled * speed;

      setOffset(rate);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed]);

  return {
    ref,
    style: {
      transform: `translateY(${offset}px)`,
    },
  };
};

/**
 * Hook for mount/unmount animations
 */
export const useMountAnimation = (duration: number = 300) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    setIsMounted(true);

    return () => {
      // Cleanup on unmount
      setIsMounted(false);
    };
  }, []);

  return {
    isMounted,
    animationClass: isMounted ? "fade-in-scale" : "opacity-0",
    style: {
      transition: `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    },
  };
};
