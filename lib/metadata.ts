import type { Metadata } from 'next';

type PageMetadataInput = {
  title: string;
  description: string;
  /** Route path, e.g. `/projects/my-project`. Used as the canonical URL. */
  path: string;
  /** Hide the page from search engines (links are still followed). */
  noIndex?: boolean;
};

/** Builds the per-route metadata object used by every page. */
export function pageMetadata({
  title,
  description,
  path,
  noIndex = false,
}: PageMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}
