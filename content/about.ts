/**
 * The about section's words, shared by the about section (home page and
 * /about) and the desk terminal (`cd about`). The sign-off's "hi" is a link
 * to `helloEmail`.
 */
export const aboutParagraphs = [
  "hi! im hanjing. i'm a third year studying software enginerring student at the university of western ontario.",
  'i like to build and experiment with embedded systems, rtos, and computer vision.',
  "i'll be interning at Qualcomm from may 2027 to aug. 2028 (16 months) as part of the automotive camera system.",
];

export const aboutSignoff = {
  before: "thanks a lot for discovering my site, i hope you enjoy exploring it  :-) and while you're here, feel free to say ",
  link: 'hi',
  after: '!',
};

/** Words in the paragraphs above that link out, and where to. */
export const aboutLinks: Record<string, string> = {
  Qualcomm: 'https://www.qualcomm.com/automotive',
};

export const helloEmail = 'hanjinglin8@gmail.com';

/** The sign-off as plain text, for places that can't hold a link. */
export const aboutSignoffText = `${aboutSignoff.before}${aboutSignoff.link}${aboutSignoff.after}`;
