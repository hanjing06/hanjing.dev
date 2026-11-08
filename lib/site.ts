/**
 * Site-wide constants. Change personal details, links, and the production
 * URL here instead of hunting through pages.
 */
export const site = {
  url: 'https://hanjing.dev',
  email: 'hlin389@uwo.ca',
  /** Obfuscated label shown wherever the email address is displayed. */
  emailLabel: 'hlin389 [at] uwo [dot] com',
  github: {
    url: 'https://github.com/hanjing06',
    profileUrl: 'https://www.github.com/hanjing06',
    label: 'github.com/hanjing06',
  },
  linkedin: {
    url: 'https://www.linkedin.com/in/hanjing-lin-790252113/',
    label: 'linkedin.com/in/hanjing-lin-790252113',
  },
} as const;

export const mailto = `mailto:${site.email}`;
