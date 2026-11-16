import { getPost, postHref } from '@/content/posts';
import { getProject, projectHref } from '@/content/projects';
import { song } from '@/content/music';
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
  return { id: slug, node, kicker: 'project', title, summary, href: projectHref(slug), cta: 'take a closer look' };
}

const intro = getPost('introduction');

export const DESK_ITEMS: DeskItem[] = [
  project('sunstang-vcu-2026', 'Item_sunstang'),
  project('the-perfect-squat', 'Item_squat'),
  project('moore-fsm-sequence-detector', 'Item_fsm'),
  {
    id: 'about',
    node: 'Item_about',
    kicker: 'about',
    title: 'hanjing’s id',
    summary: 'hi! i’m hanjing, studying software engineering at the university of western ontario.',
    href: '/about',
    cta: 'learn more',
  },
  {
    id: 'music',
    node: 'Item_music',
    kicker: 'music',
    title: `${song.title} · ${song.artist}`,
    summary: 'what i’ve been listening to. open the case to play it.',
    href: '/about',
    cta: 'listen',
  },
  {
    id: 'blog',
    node: 'Item_blog',
    kicker: 'blog',
    title: 'hanjing’s journal',
    summary: `${intro.listTitle}, and a guest book at the back.`,
    href: postHref(intro.slug),
    cta: 'open the journal',
  },
];

/** The label tape on the lid: it just names the case and points inside. */
export const CONTACT_ITEM: DeskItem = {
  id: 'contact',
  node: 'CaseTape',
  kicker: 'contact',
  title: 'property of hanjing lin',
  summary: `if found, return to ${site.emailLabel}.`,
  href: '/contact',
  cta: 'see what’s inside',
};

export const ALL_ITEMS = [...DESK_ITEMS, CONTACT_ITEM];

export function getDeskItem(id: string) {
  return ALL_ITEMS.find((item) => item.id === id);
}
