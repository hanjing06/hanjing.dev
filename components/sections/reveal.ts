/**
 * Motion props for a section's entrance: on its own page it animates on
 * mount; stacked on the scrolling home page it waits until scrolled into view.
 */
export function reveal(inView: boolean) {
  return inView
    ? ({ initial: 'hidden', whileInView: 'show', viewport: { once: true, amount: 0.15 } } as const)
    : ({ initial: 'hidden', animate: 'show' } as const);
}

export type SectionProps = {
  /** h1 on its own page, h2 when stacked on the home page. */
  heading?: 'h1' | 'h2';
  /** Stacked on the home page: animate when scrolled into view instead of on
   * mount, with tighter spacing between sections. */
  inView?: boolean;
};
