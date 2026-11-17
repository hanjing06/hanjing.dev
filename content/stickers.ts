/**
 * The stickers on the pencil case lid: achievements and teams. Each has a
 * die-cut sticker image in public/desk/stickers/<id>.png (white bubble
 * border) and a mesh named `Sticker_<id>` in the Blender scene. Hovering one
 * on the desk shows its three lines.
 */
type Sticker = {
  id: string;
  /** Who or what, e.g. the company or school. */
  title: string;
  /** The role or program. */
  role: string;
  /** When. */
  when: string;
};

export const stickers: Sticker[] = [
  { id: 'qualcomm', title: 'Qualcomm', role: 'Automotive Software Engineering Intern', when: 'May 2027 – August 2028' },
  { id: 'interninsider', title: 'Intern Insider', role: 'Growth and Media', when: 'May 2026 – Aug 2026' },
  { id: 'western', title: 'Western University', role: 'Software Engineering', when: 'Class of ’29' },
  { id: 'sunstang', title: 'Western Sunstang', role: 'Driver Controls Lead', when: 'Jan 2025 – Present' },
];

export const stickerImage = (id: string) => `/desk/stickers/${id}.png`;

export function getSticker(id: string) {
  return stickers.find((s) => s.id === id);
}
