import type { Variants } from 'framer-motion';

type CubicBezier = [number, number, number, number];

/** Plain ease (CSS `ease`): the page-entry fade. */
export const easeFade: CubicBezier = [0.25, 0.1, 0.25, 1];

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

/**
 * Child variant: a plain opacity fade. Opacity alone stays on the GPU; the
 * old rise + blur repainted every frame and stuttered.
 */
export function createFadeUp(ease: CubicBezier = easeFade, delay?: number): Variants {
  return {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        duration: 0.5,
        ...(delay === undefined ? {} : { delay }),
        ease,
      },
    },
  };
}

export const fadeUp = createFadeUp();

/** Container used by top-level pages (home, about, blog). */
export const pageContainer = staggerContainer();
/** Container used by long-form project write-ups. */
export const articleContainer = staggerContainer(0.12, 0.05);
