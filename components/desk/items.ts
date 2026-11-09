import { getPost, postHref } from '@/content/posts';
import { getProject, projectHref } from '@/content/projects';
import { site } from '@/lib/site';

/**
 * What each part in the pencil case stands for. `node` is the object name in
 * public/desk/desk.glb (built by blender/desk_scene.py). Project and blog text
 * comes from the site's content registries, so it stays in sync with the site.
 *
 * To add a part: model an `Item_<id>` group in the Blender script, then add it
 * here.
 */
export type DeskItem = {
  id: string;
  node: string;
  kicker: string;
  title: string;
  summary: string;
  href: string;
  cta: string;
};

function project(slug: string, node: string): DeskItem {
  const { title, summary } = getProject(slug);
  return { id: slug, node, kicker: 'project', title, summary, href: projectHref(slug), cta: 'read the write-up' };
}

const intro = getPost('introduction');

export const DESK_ITEMS: DeskItem[] = [
  project('sunstang-vcu-2026', 'Item_sunstang'),
  project('tiny-squares-camera-system', 'Item_tiny'),
  project('the-perfect-squat', 'Item_squat'),
  project('moore-fsm-sequence-detector', 'Item_fsm'),
  {
    id: 'about',
    node: 'Item_about',
    kicker: 'about',
    title: 'third-year software engineering',
    summary: 'hi! i’m hanjing, studying software engineering at the university of western ontario.',
    href: '/about',
    cta: 'about me',
  },
  {
    id: 'music',
    node: 'Item_music',
    kicker: 'about',
    title: 'music',
    summary: 'guitar, piano, and tenor sax. creativity and curiosity keep me building.',
    href: '/about',
    cta: 'about me',
  },
  {
    id: 'blog',
    node: 'Item_blog',
    kicker: 'blog',
    title: intro.listTitle,
    summary: intro.seo.description,
    href: postHref(intro.slug),
    cta: 'read the blog',
  },
];

/** The label tape on the lid. */
export const CONTACT_ITEM: DeskItem = {
  id: 'contact',
  node: 'CaseTape',
  kicker: 'contact',
  title: 'property of hanjing lin',
  summary: `if found, return to ${site.emailLabel}.`,
  href: '/contact',
  cta: 'get in touch',
};

export const ALL_ITEMS = [...DESK_ITEMS, CONTACT_ITEM];

export function getDeskItem(id: string) {
  return ALL_ITEMS.find((item) => item.id === id);
}
