import { useEffect, useRef, useState } from 'react';

export interface UseScrollAnimationOptions {
  /**
   * Percentage of the target element's visibility that triggers the animation.
   * A single number between 0 and 1, or an array of numbers.
   * @default 0.1
   */
  threshold?: number | number[];

  /**
   * Margin around the root element. Similar to CSS margin property.
   * Can be values like '0px', '50px 0px', etc.
   * @default '0px'
   */
  rootMargin?: string;

  /**
   * The element used as the viewport for checking visibility.
   * Defaults to the browser viewport if null or not specified.
   * @default null
   */
  root?: Element | Document | null;

  /**
   * Whether the animation should only trigger once when scrolled into view.
   * If true, the element remains visible once it has entered the viewport.
   * @default true
   */
  once?: boolean;

  /**
   * Alias for `once`.
   */
  triggerOnce?: boolean;
}

export type UseScrollAnimationReturn<T extends HTMLElement = any> = [
  React.RefObject<T | null>,
  boolean
] & {
  ref: React.RefObject<T | null>;
  isVisible: boolean;
  isInView: boolean;
};

/**
 * React hook using IntersectionObserver to detect when an element scrolls into view.
 * Designed for triggering fade-in and slide-up animations.
 *
 * Supports both tuple destructuring:
 * `const [ref, isVisible] = useScrollAnimation();`
 * and object destructuring:
 * `const { ref, isVisible } = useScrollAnimation();`
 */
export function useScrollAnimation<T extends HTMLElement = any>(
  options?: UseScrollAnimationOptions | number
): UseScrollAnimationReturn<T> {
  const opts: UseScrollAnimationOptions =
    typeof options === 'number' ? { threshold: options } : options ?? {};

  const {
    threshold = 0.1,
    rootMargin = '0px',
    root = null,
    once = true,
    triggerOnce,
  } = opts;

  const shouldTriggerOnce = triggerOnce !== undefined ? triggerOnce : once;

  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (shouldTriggerOnce && isVisible) {
      return;
    }

    const element = ref.current;
    if (!element) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry) return;

        if (entry.isIntersecting) {
          setIsVisible(true);
          if (shouldTriggerOnce) {
            observer.unobserve(entry.target);
          }
        } else if (!shouldTriggerOnce) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
        root: root ?? undefined,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, root, shouldTriggerOnce, isVisible]);

  const result = [ref, isVisible] as unknown as UseScrollAnimationReturn<T>;
  result.ref = ref;
  result.isVisible = isVisible;
  result.isInView = isVisible;

  return result;
}

export default useScrollAnimation;
