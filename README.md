# hanjing.dev

Personal portfolio and blog for Hanjing Lin. Built with Next.js (App Router), React, Tailwind CSS v4, and Framer Motion. Deployed on Vercel.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run lint
npm run typecheck
npm run models     # regenerate the desk and board models (needs Blender on PATH)
```

## Project structure

```
app/                     Routes only (Next.js App Router)
  layout.tsx             Root layout: global metadata, JSON-LD, navbar, footer
  page.tsx               Home (currently just the pencil-case hero)
  about/ contact/        Static pages (layout.tsx holds metadata, page.tsx the UI)
  projects/
    page.tsx             Projects index, rendered from content/projects.ts
    <slug>/              One folder per project write-up
  blog/
    page.tsx             Blog index, rendered from content/posts.ts
    <slug>/page.tsx      One folder per post
  sitemap.ts robots.ts   Generated from content/ + lib/site.ts
  opengraph-image.tsx    Social preview image
  api/health/            Health-check endpoint

blender/build_all.py     Builds every model: desk_scene.py (the desk + pencil case -> public/desk/desk.glb) and boards.py (the VCU and DE1-SoC -> vcu.glb, de1soc.glb)

components/              Reusable UI (Navbar, Footer, BlogPost,
                         ArticleTableOfContents, ExpandableImage, ...)
content/
  projects.ts            Registry of projects: card info, tags, SEO
  posts.ts               Registry of blog posts: list info, SEO
lib/
  site.ts                Site URL, email, social links
  motion.ts              Shared Framer Motion variants and easings
  metadata.ts            pageMetadata() helper for per-route metadata

public/                  Static assets, grouped by page
  about/                 About-page images
  blog/<slug>/           Images for each blog post
  projects/<slug>/       Images for each project
  desk/                  Generated pencil-case model for the home hero (don't edit by hand)
  icons/                 Shared icons
  websitelogo.png        Favicon
```

Import shared code with the `@/` alias, e.g. `import { fadeUp } from '@/lib/motion'`.

## Adding a project

1. **Register it** in `content/projects.ts`. Add an entry with `slug`, `title`, `summary`, `cover`, `tags`, and `seo`. The order of the array is the order on `/projects`. This one entry adds the card to the index and the URL to the sitemap.
2. **Add images** to `public/projects/<slug>/`. Name the card image `cover.jpg`.
3. **Create the page.** Copy an existing project folder (for example `app/projects/sunstang-vcu-2026/`) to `app/projects/<slug>/`:
   - `layout.tsx`: change the slug in `projectMetadata('<slug>')`.
   - `page.tsx`: replace the content. Update `articleSections` so it matches the `id` of each `<motion.section>`, which keeps the table of contents in sync.

## Adding a blog post

1. **Register it** in `content/posts.ts`, newest first. Fill in `slug`, `listTitle`, `listSubtitle`, `dateLabel`, and `seo`.
2. **Add the hero image** at `public/blog/<slug>/cover.jpeg`.
3. **Create `app/blog/<slug>/page.tsx`**:

   ```tsx
   import BlogPost from '@/components/BlogPost';
   import { postMetadata } from '@/content/posts';

   export const metadata = postMetadata('<slug>');

   export default function Page() {
     return (
       <BlogPost
         kicker="topic - month year"
         title="post title."
         cover={{ src: '/blog/<slug>/cover.jpeg', alt: '...' }}
         paragraphs={['first paragraph', 'second paragraph']}
       />
     );
   }
   ```

The blog is currently `noIndex`, so search engines don't index it and it's left out of the sitemap. To change that, see `lib/metadata.ts` / `content/posts.ts` and `app/sitemap.ts`.

## Adding a top-level page

1. Create `app/<name>/page.tsx`, plus `app/<name>/layout.tsx` that exports `pageMetadata({ title, description, path })`.
2. Add the link to `navLinks` in `components/Navbar.tsx`.
3. Add the route to `app/sitemap.ts`.

## Changing personal details

Email, GitHub, LinkedIn, and the site URL are all in `lib/site.ts`.

## Spotify (the CD on the desk)

The CD shows the track playing on your Spotify right now, or the last one you played: title and artist in its caption, album art on its cover (`lib/spotify.ts`, `app/api/now-playing`). Answers are cached for a minute, and the cover is proxied through `/api/now-playing/cover` so the site's CSP stays `'self'`. Until it's set up, the CD uses `content/music.ts`.

One-time setup:

1. At [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard), create an app (Web API). Add the redirect URI `http://127.0.0.1:3000/api/spotify/callback` (Spotify needs `127.0.0.1`, not `localhost`).
2. Copy `.env.example` to `.env.local` and fill in `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` from the app's settings.
3. Run `npm run dev`, open `http://127.0.0.1:3000/api/spotify/login`, and sign in to Spotify. The page you land on shows `SPOTIFY_REFRESH_TOKEN=…`; add that line to `.env.local` and restart.
4. In production, set the same three variables in your host's environment. The login routes only work in development.

## Pencil-case hero (home page)

The home page is a three.js prototype of a cozy software-engineering desk at dusk: window-mullion shadows, an architect's lamp, a keyboard, monitor, mug, and a cutting mat with the 2000s pencil case on it. Click the case to open it, drag the parts out onto the mat (tap on touch screens), and drop them back in. Each part is a page of the site; its card links there, or double-click the part. Hovering anything outlines it in white, and a subtle title at the bottom names it and where it leads. The 3D version fills the whole window: the navbar and footer are covered and the page doesn't scroll.

**Start screen:** every visit opens on a light start screen (`components/home/HomeExperience.tsx`) that asks whether to enter the 3D desk or browse the simple site. Choosing 3D loads the desk behind it, shows real download progress, then fades it away. The simple site (`components/SimpleHome.tsx`, with the navbar and footer) is one scrolling page: the landing screen (`components/simple/SimpleContent.tsx`: name and subheader on the left, a desk lamp on the right whose speech bubble offers to "Enter 3D Space.", and a scroll cue), then about (with a small link to the blog) and projects. Those two are shared components in `components/sections/`, so `/about` and `/projects` render exactly the same markup on their own; on the home page the navbar's about and projects links jump to the sections instead. Contact links (LinkedIn, GitHub, Email) live in the footer; `/contact` remains for the 3D desk's contact item. The navbar's bottom border only shows once the page is scrolled, and the navbar's name always leads to the simple landing page (scrolling back to the top when already there), never the start screen (`components/home/returnToSimple.ts`). The about words live in `content/about.ts` (shared with the desk terminal); words listed in its `aboutLinks` become links. The start screen's lamp drawing is `components/home/LampSketch.tsx`. The start screen is only the first choice of a visit: in 3D, the wall note, the sticky note inside the pencil case lid (its tape reads "Click here for the normal website"; the desk blurs and fades into the simple site), the terminal's `simple` command, and a focus-only skip link go straight to the simple site, and the simple site's lamp goes straight back into 3D. Once loaded, both stay mounted (the hidden one paused), so switching is instant and remembers where you were: the desk's lid, parts, lamp and terminal, and the simple page's scroll position. Nothing in 3D navigates away. Double-clicking a part (or pressing enter on it) picks it up and shows it over the desk: the ID card (`components/desk/IdCard.tsx`, words in `content/about.ts` → `idCard`; front: name, school and work lines, and contact links; click to flip for the about paragraphs), each project as a lab (`components/desk/lab/ProjectLab.tsx`): the thing itself to play with on the left and a terminal-style panel on the right (overview, controls, tools & skills, q&a, and a link to the write-up; words in `content/labs.ts` plus `content/projects.ts`). The Sunstang VCU is the real board modelled from the KiCad layout (`lab/VcuLab.tsx`: LV and HV switches, pre-charge filling the blue then green LEDs, the gear knob, mode toggle, signal and hazard buttons, the LCD); the Moore FSM runs on a DE1-SoC (`lab/FsmLab.tsx`: SW0 is x, KEY0 clocks, KEY1 resets, or type 1/0; HEX0 shows the state, HEX5–HEX2 the last four bits, LEDR0 is z; 1 0 1 0 turns z on, 1 0 0 0 off); the Perfect Squat replays its pipeline on a monitor (`lab/SquatLab.tsx`: pose keypoints, the ArUco-tracked bar path and a per-rep velocity chart). A project without a lab shows its cover photo. The board scenes share `lab/boardScene.ts` (orbit, picking, hover, tweens) and `lab/boardLook.ts` (materials, also used for the miniatures in the case). Each lab's stage is see-through (the desk shows blurred behind it); hovering any part of a board names it and says what it does, and a pulsing ring with a label marks the control to try next (`lab/PartGuide.tsx`; the parts are listed at the top of `VcuLab.tsx` and `FsmLab.tsx`). The write-up link always opens in a new tab. Everything picked up animates back down (`PickedUp.tsx`); the projects and the journal have a plain × in their corner, the ID card doesn't. The case opens and closes with a single click (or enter); its label just names it, and the terminal can still `cd` anywhere. The stickers on the lid (`content/stickers.ts`, die-cut images in `public/desk/stickers/`, 1024 px on the long side, cropped to their own shape; Qualcomm is the big blue one) show their title, role and dates on hover, outlined in their own die-cut shape (the outline pass respects alpha-tested textures). The terminal keeps its screen when you leave it; only `clear` wipes it. Click the desk lamp to switch it on or off, from the desk or the terminal view. Selecting a part shows its title and "(double-click or press enter to …)" in the bottom caption instead of a card. The journal in the case opens over the desk (`components/desk/Journal.tsx`): a welcome page, contents, one entry per blog post, then the guest book: signatures on the left page ("From: name" over the date), newest first, facing "leave a message for the internet!" on the right, where visitors add an optional name and write or draw on a small board (pencil, eraser, text) for everyone to see; signing (or esc, or the ×) shuts the book and slides it away (`app/api/guestbook`, stored by `lib/guestbook.ts`). Locally entries go to `.data/guestbook.json` (git-ignored); in production set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (or Vercel's `KV_REST_API_URL` / `KV_REST_API_TOKEN`), since serverless hosts can't write files. The CD in the case shows what you're listening to on Spotify when that's set up (see "Spotify" below), otherwise the song in `content/music.ts` (title, artist, cover image, audio file). Drag it out and double-click it to open its case and spin the disc; the `content/music.ts` song also plays its audio file, while a Spotify song is silent (Spotify doesn't share audio). Any link that leaves the site (GitHub, LinkedIn, Qualcomm, ...) asks first and opens in a new tab (`components/ExternalLinkPrompt.tsx`, mounted in the root layout). Low-powered machines (no WebGL, 4 or fewer cores with 4 GB or less memory, reduced motion, or data saver) see the simple site recommended first; three.js only downloads after choosing 3D. The start screen is `components/home/gates/LampGate.tsx`: a line drawing of the desk where the lamp switches on while you hover "enter" and stays lit while the desk loads.

- **Parts and where they lead:** `components/desk/items.ts`. Project and blog text comes from `content/projects.ts` and `content/posts.ts`. To add a part, model an `Item_<id>` group in the Blender script, run `npm run models`, and add it here.
- **Modeling:** `npm run models` runs `blender/build_all.py`. `blender/desk_scene.py` builds the case (a 2000s multi-function case: trim, pop buttons, latch, sharpener drawer, divider, hinged `CaseLid` with `CaseTape`, `Sticker_<id>` planes sized from each PNG's aspect, and the `StickyNote` with its `StickyTape` inside it), the parts (`Item_*`, exported in their spots inside the case), and the desk. `blender/boards.py` builds the VCU and the DE1-SoC, used full size in the labs and scaled down as the miniatures. Shared helpers and the role palette are in `blender/common.py`. Materials are named by role; keep those names stable.
- **Look:** `components/desk/look.ts` maps roles to three.js materials and sets up the lighting (window sun with a shadow-only window frame, lamp spotlight, monitor glow), bloom, and vignette.
- **Textures** (label tape, cutting mat, oak, student card, notes, the boards' silkscreen) are drawn on canvases in `components/desk/textures.ts`. Label text is `LABEL_STRIPS`; strip lengths must match `LABEL_LENGTHS` in the Blender script.
- **Keyboard + terminal:** the desk keyboard mirrors the visitor's real one (`components/desk/keyboard.ts`; keys are named `Key_<KeyboardEvent.code>` in the Blender script). Typing, or clicking the monitor, moves the camera to the monitor, where a terminal holds the site as folders (`components/desk/terminal.ts`). It starts as a classic terminal (`ls`, `cd <dir>`, `clear`, `friendly`, `exit`; `help` lists them). `friendly` turns on a mode for people new to terminals: a picker inside the terminal you move through with ↑/↓ and run with enter (the chosen command is typed at the prompt), a guide bar along the bottom of the screen, plain words or numbers instead of commands, and gentler errors. `friendly` again turns it off. `cd` prints each page on the monitor (scroll with the wheel or PgUp/PgDn); the text comes from `content/about.ts`, `content/projects.ts` (`overview`, `tools`), and `content/posts.ts` (`body`), shared with the real pages. `exit` (or Esc, `q`, `quit`, `back`) leaves and resets the terminal; `clear` resets it; `simple` switches to the normal website. Keys aren't captured in text fields, on focused buttons or links, or with Cmd/Ctrl shortcuts.
- **Interaction:** `components/desk/engine.ts` (lid, drag and drop, tap-out, double-click, camera framing, render loop). The outline is `components/desk/SilhouetteOutlinePass.ts`. `components/desk/DeskHero.tsx` holds the caption and what's picked up. Each part also gets an invisible, padded hit box so thin ones (the barbell) are easy to grab.
