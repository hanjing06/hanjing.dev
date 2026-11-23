/**
 * Shared page spacing so every page's title lands in the same place.
 *
 * Index pages (about, projects, blog) put their title `pageTop` below the
 * navbar. Detail pages (a project or a post) start `detailTop` lower and put
 * their 44px-tall back link first, so their title lands on the same line.
 */
export const pageTop = 'pt-16 sm:pt-20';
export const detailTop = 'pt-5 sm:pt-9';

/** The big title at the top of every page. */
export const pageTitle = 'text-5xl text-black sm:text-6xl';

/** The "← back to …" link on detail pages (exactly 44px tall). */
export const backLink =
  'flex h-11 w-fit items-center text-sm text-neutral-600 transition-colors duration-200 hover:text-black';
