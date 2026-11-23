/**
 * Work experience for the experience section on the simple home page, newest
 * first. The desk's lid stickers (content/stickers.ts) show some of the same
 * roles: keep their dates in step.
 */
export type Experience = {
  company: string;
  /** Company or team site, opened in a new tab. */
  companyHref?: string;
  role: string;
  when: string;
  /** Not started yet: shown with an "incoming" tag. */
  upcoming?: boolean;
};

export const experience: Experience[] = [
  {
    company: 'Qualcomm',
    companyHref: 'https://www.qualcomm.com/automotive',
    role: 'Automotive Software Engineering Intern',
    when: 'May 2027 – Aug 2028',
    upcoming: true,
  },
  {
    company: 'Intern Insider',
    companyHref: 'https://interninsider.me',
    role: 'Growth and Media',
    when: 'May 2026 – Aug 2026',
  },
  {
    company: 'Western Sunstang',
    role: 'Driver Controls Lead',
    when: 'Jan 2025 – Present',
  },
];
