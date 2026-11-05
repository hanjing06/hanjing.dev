import { pageMetadata } from '@/lib/metadata';

export type Project = {
  /** Folder name under `app/projects/` and `public/projects/`. */
  slug: string;
  /** Title shown on the projects index card. */
  title: string;
  /** One-line summary shown on the projects index card. */
  summary: string;
  /** Card image, usually `/projects/<slug>/cover.jpg`. */
  cover: string;
  /** Optional Tailwind `object-position` class for the card image. */
  coverPosition?: string;
  tags: string[];
  /** Browser title + search description for the project page. */
  seo: {
    title: string;
    description: string;
  };
};

/**
 * Every project on the site, in the order shown on /projects.
 * Adding an entry here updates the projects index, the sitemap, and the
 * page metadata (via `projectMetadata`).
 */
export const projects: Project[] = [
  {
    slug: 'sunstang-vcu-2026',
    title: 'Sunstang VCU 2026',
    summary: 'Designing the vehicle control unit for a solar powered car.',
    cover: '/projects/sunstang-vcu-2026/thumbnail.jpeg',
    tags: ['Embedded Systems', 'PCB Design', 'Hardware'],
    seo: {
      title: 'Sunstang VCU 2026',
      description:
        'Designing and routing a vehicle control unit PCB for the Sunstang solar car.',
    },
  },
  {
    slug: 'the-perfect-squat',
    title: 'The Perfect Squat',
    summary:
      'Developing a computer vision program that detects the bar path of your squat.',
    cover: '/projects/the-perfect-squat/cover.jpg',
    tags: ['Computer Vision', 'Machine Learning'],
    seo: {
      title: 'The Perfect Squat',
      description:
        'Building a computer vision system that measures a barbell squat path.',
    },
  },
  {
    slug: 'tiny-squares-camera-system',
    title: 'Tiny Squares: Camera System',
    summary:
      'Engineering a camera that shoots, converts image, bitmaps jpg, and prints instantly.',
    cover: '/projects/tiny-squares-camera-system/cover.jpg',
    tags: ['Embedded Systems', 'Computer Vision', 'Image Processing'],
    seo: {
      title: 'Tiny Squares Camera System',
      description:
        'Engineering an embedded camera that captures, converts, and instantly prints images.',
    },
  },
  {
    slug: 'moore-fsm-sequence-detector',
    title: 'Moore FSM: A Sequence Detector',
    summary:
      'Designing and implementing a digital logic sequence detector with a Moore FSM.',
    cover: '/projects/moore-fsm-sequence-detector/cover.jpg',
    coverPosition: 'object-top',
    tags: ['Digital Logic', 'FPGA', 'FSM Design'],
    seo: {
      title: 'Moore FSM: A Sequence Detector',
      description:
        'Designing, optimizing, and implementing a Moore finite state machine sequence detector.',
    },
  },
];

export const projectHref = (slug: string) => `/projects/${slug}`;

export function getProject(slug: string): Project {
  const project = projects.find((entry) => entry.slug === slug);
  if (!project) {
    throw new Error(`Unknown project slug "${slug}". Add it to content/projects.ts.`);
  }
  return project;
}

/** Metadata for `app/projects/<slug>/layout.tsx`. */
export function projectMetadata(slug: string) {
  const { seo } = getProject(slug);
  return pageMetadata({ ...seo, path: projectHref(slug) });
}
