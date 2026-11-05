import type { Variants } from 'framer-motion';

type CubicBezier = [number, number, number, number];

/** Default easing used by every page-entry animation. */
export const easeOutQuint: CubicBezier = [0.22, 1, 0.36, 1];
/** Slightly snappier easing used on the projects index. */
export const easeOutExpo: CubicBezier = [0.16, 1, 0.3, 1];

/** Parent variant that staggers its `fadeUp` children into view. */
export function staggerContainer(
  staggerChildren = 0.14,
  delayChildren = 0.05,
): Variants {
  return {
    hidden: {},
    show: {
      transition: { staggerChildren, delayChildren },
    },
  };
}

/** Child variant: fade + rise + unblur. */
export function createFadeUp(ease: CubicBezier = easeOutQuint, delay?: number): Variants {
  return {
    hidden: { opacity: 0, y: 12, filter: 'blur(4px)' },
    show: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.42,
        ...(delay === undefined ? {} : { delay }),
        ease,
      },
    },
  };
}

export const fadeUp = createFadeUp();

/** Container used by top-level pages (home, about, contact, blog). */
export const pageContainer = staggerContainer();
/** Container used by long-form project write-ups. */
export const articleContainer = staggerContainer(0.12, 0.05);
