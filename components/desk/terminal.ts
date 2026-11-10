import * as THREE from 'three';
import { aboutParagraphs } from '@/content/about';
import { getPost, posts } from '@/content/posts';
import { getProject, projects } from '@/content/projects';
import { site } from '@/lib/site';

/**
 * The terminal on the desk monitor: a small read-only file system of the
 * site. `cd about`, `cd projects`, `cd projects/<name>`, `cd blog`, and
 * `cd contact` print that page right here on the monitor; nothing navigates
 * away. Text comes from the content registries, so it matches the site.
 *
 * It starts as a classic terminal (real commands). `friendly` toggles a mode
 * for people new to terminals: a list you pick from with the arrow keys and
 * enter (the chosen command is typed at the prompt, so it teaches the real
 * one), plain words or numbers instead of commands, and gentler errors.
 */

export type TerminalAction = { type: 'exit' } | { type: 'simple' } | null;
export type TerminalMode = 'classic' | 'friendly';

/** One choice in the friendly mode's arrow-key menu. */
export type MenuItem = { label: string; detail: string; command: string };

type LineKind = 'out' | 'cmd' | 'dim' | 'err' | 'accent' | 'title';
type Line = { text: string; kind: LineKind };

const ROOT_DIRS = ['about', 'projects', 'blog', 'contact'] as const;

/** What `help` lists (the same five commands in both modes). */
function helpLines(mode: TerminalMode): [string, string][] {
  return [
    ['ls', 'list what’s in this folder'],
    ['cd <dir>', 'open a folder (cd .. goes back, cd ~ goes home)'],
    ['clear', 'start over'],
    ['friendly', mode === 'friendly' ? 'turn off friendly mode' : 'new to terminals? choose with the arrow keys instead'],
    ['exit', 'back to the desk (or press esc)'],
  ];
}
/** Command names (for tab completion). */
const COMMAND_NAMES = ['ls', 'cd', 'clear', 'exit', 'friendly', 'help', 'history'];
/** Hidden ways to leave the terminal. */
const EXIT_WORDS = new Set(['exit', 'logout', 'q', 'quit', 'back', 'esc']);
const BLANK: Line = { text: '', kind: 'out' };

function today() {
  return new Date().toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' }).toLowerCase();
}

// ---------------------------------------------------------------- file system

/** Folders inside a path, or [] for a "page" folder. */
function children(path: string[]): string[] {
  if (path.length === 0) return [...ROOT_DIRS];
  if (path.length === 1 && path[0] === 'projects') return projects.map((p) => p.slug);
  if (path.length === 1 && path[0] === 'blog') return posts.map((p) => p.slug);
  return [];
}

/** A one-line description shown next to a folder in `ls`. */
function describe(path: string[], name: string): string {
  if (path.length === 0) {
    return { about: 'who i am', projects: 'things i’ve built', blog: 'writing', contact: 'how to reach me' }[name] ?? '';
  }
  if (path[0] === 'projects') return getProject(name).title;
  if (path[0] === 'blog') return `${getPost(name).listSubtitle} · ${getPost(name).dateLabel}`;
  return '';
}

/** What's in a folder: `name/` in classic mode, numbered in friendly mode. */
function listing(path: string[], mode: TerminalMode): Line[] {
  const names = children(path);
  const width = Math.max(...names.map((n) => n.length)) + 4;
  return names.map((n, i) => ({
    text: mode === 'friendly' ? `  ${String(i + 1).padStart(2)}  ${n.padEnd(width)}${describe(path, n)}` : `  ${`${n}/`.padEnd(width)}${describe(path, n)}`,
    kind: 'out' as const,
  }));
}

/** What `cd` prints when you arrive somewhere. */
function page(path: string[], mode: TerminalMode): Line[] {
  const [top, name] = path;
  const friendly = mode === 'friendly';
  const back = (text: string): Line[] => (friendly ? [BLANK, { text, kind: 'dim' }] : []);
  if (!top) return [];
  if (top === 'about') {
    return [
      { text: 'about', kind: 'title' },
      BLANK,
      ...aboutParagraphs.flatMap((text) => [{ text, kind: 'out' as const }, BLANK]),
      ...back('type .. to go back'),
    ];
  }
  if (top === 'contact') {
    return [
      { text: 'contact', kind: 'title' },
      BLANK,
      { text: `email      ${site.emailLabel}`, kind: 'out' },
      { text: `github     ${site.github.label}`, kind: 'out' },
      { text: `linkedin   ${site.linkedin.label}`, kind: 'out' },
      ...back('type .. to go back'),
    ];
  }
  if (top === 'projects' && name) {
    const p = getProject(name);
    return [
      { text: p.title, kind: 'title' },
      { text: p.summary, kind: 'dim' },
      BLANK,
      ...p.overview.flatMap((text) => [{ text, kind: 'out' as const }, BLANK]),
      { text: `tools: ${p.tools.join(' · ')}`, kind: 'accent' },
      ...back('type .. to go back to projects'),
    ];
  }
  if (top === 'blog' && name) {
    const p = getPost(name);
    return [
      { text: p.kicker, kind: 'dim' },
      { text: p.title, kind: 'title' },
      BLANK,
      ...p.body.flatMap((text) => [{ text, kind: 'out' as const }, BLANK]),
      { text: '- hanjing', kind: 'dim' },
      ...back('type .. to go back to the blog'),
    ];
  }
  // a folder of folders (projects, blog): list it
  return [
    { text: top, kind: 'title' },
    BLANK,
    ...listing(path, mode),
    BLANK,
    { text: friendly ? 'type a name or number to read one · .. to go back' : 'cd <name> to read one', kind: 'dim' },
  ];
}

const FRIENDLY_HINT = 'use ↑ ↓ to choose, then press enter. you can still type commands too.';

function welcome(mode: TerminalMode): Line[] {
  const header: Line = { text: `last login: ${today()} on ttys001`, kind: 'dim' };
  if (mode === 'friendly') {
    return [header, { text: 'welcome to hanjing’s desk!', kind: 'title' }, { text: FRIENDLY_HINT, kind: 'accent' }, BLANK];
  }
  return [
    header,
    { text: 'welcome to hanjing’s desk.', kind: 'out' },
    { text: 'type `ls` to look around, or `help` if you’re not sure where to start.', kind: 'accent' },
    BLANK,
  ];
}

// ---------------------------------------------------------------- terminal

export class Terminal {
  mode: TerminalMode = 'classic';
  lines: Line[] = welcome('classic');
  input = '';
  /** Current folder, e.g. ['projects', 'sunstang-vcu-2026']. */
  path: string[] = [];
  /** Set when a command prints output: the line where it started, so the screen can show it from the top. */
  anchor: number | null = null;
  /** Highlighted row of the friendly menu. */
  selected = 0;
  private history: string[] = [];
  private historyIndex = -1;

  /** Back to the welcome screen at ~ (`clear` keeps the mode; leaving resets to classic). */
  reset(mode: TerminalMode = 'classic') {
    this.mode = mode;
    this.lines = welcome(mode);
    this.path = [];
    this.input = '';
    this.anchor = null;
    this.selected = 0;
  }

  /** Friendly mode: what you can pick from where you are (null in classic mode). */
  menu(): MenuItem[] | null {
    if (this.mode !== 'friendly') return null;
    // projects and posts show their readable titles; the command still uses the folder name
    const items: MenuItem[] = children(this.path).map((name) => {
      if (this.path[0] === 'projects') return { label: getProject(name).title, detail: '', command: `cd ${name}` };
      if (this.path[0] === 'blog') return { label: getPost(name).listSubtitle, detail: getPost(name).dateLabel, command: `cd ${name}` };
      return { label: name, detail: describe(this.path, name), command: `cd ${name}` };
    });
    if (this.path.length) items.push({ label: '← back', detail: this.path.length > 1 ? `to ${this.path[0]}` : 'to the start', command: 'cd ..' });
    if (this.path.length > 1) items.push({ label: '⌂ home', detail: 'back to the start', command: 'cd ~' });
    if (!this.path.length) items.push({ label: 'turn off friendly mode', detail: 'type commands yourself', command: 'friendly' });
    items.push({ label: 'leave the terminal', detail: 'back to the desk', command: 'exit' });
    return items;
  }

  /** Move the friendly menu's highlight. */
  moveSelection(direction: -1 | 1) {
    const items = this.menu();
    if (!items) return;
    this.selected = (this.selected + direction + items.length) % items.length;
  }

  /** Put the highlighted choice's command on the prompt (enter then runs it). */
  pickSelection(): boolean {
    const item = this.menu()?.[this.selected];
    if (!item) return false;
    this.input = item.command;
    return true;
  }

  get prompt() {
    return `hanjing@desk ${this.cwd()} % `;
  }

  cwd() {
    return this.path.length ? `~/${this.path.join('/')}` : '~';
  }

  type(char: string) {
    this.input += char;
  }

  backspace() {
    this.input = this.input.slice(0, -1);
  }

  /** Ctrl+C: abandon the current line. */
  cancel() {
    this.lines.push({ text: `${this.prompt}${this.input}^C`, kind: 'cmd' });
    this.input = '';
  }

  historyStep(direction: -1 | 1) {
    if (!this.history.length) return;
    const next = this.historyIndex === -1 ? (direction === -1 ? this.history.length - 1 : -1) : this.historyIndex + direction;
    if (next < 0 || next >= this.history.length) {
      this.historyIndex = -1;
      this.input = '';
      return;
    }
    this.historyIndex = next;
    this.input = this.history[next];
  }

  /** Tab completion for commands and `cd` targets. */
  complete() {
    const [cmd, ...rest] = this.input.split(' ');
    if (!rest.length) {
      const words = this.mode === 'friendly' ? [...COMMAND_NAMES, ...children(this.path)] : COMMAND_NAMES;
      const matches = words.filter((c) => c.startsWith(cmd));
      if (matches.length === 1) this.input = `${matches[0]} `;
      else if (matches.length > 1) this.echoCandidates(matches);
      return;
    }
    if (cmd !== 'cd') return;
    const arg = rest.join(' ');
    const slash = arg.lastIndexOf('/');
    const base = slash >= 0 ? arg.slice(0, slash + 1) : '';
    const dir = base ? this.resolve(base) : this.path;
    if (!dir) return;
    const matches = children(dir).filter((n) => n.startsWith(arg.slice(slash + 1)));
    if (matches.length === 1) this.input = `cd ${base}${matches[0]}${children([...dir, matches[0]]).length ? '/' : ''}`;
    else if (matches.length > 1) this.echoCandidates(matches);
  }

  /** Run the current line. Returns what the page should do next, if anything. */
  submit(): TerminalAction {
    const line = this.input.trim();
    this.anchor = this.lines.length;
    this.lines.push({ text: `${this.prompt}${this.input}`, kind: 'cmd' });
    this.input = '';
    this.historyIndex = -1;
    if (!line) return null;
    this.history.push(line);
    const [cmd, ...args] = line.split(/\s+/);
    const action = this.run(cmd.toLowerCase(), args.join(' '));
    this.lines.push({ text: '', kind: 'out' });
    return action;
  }

  private echoCandidates(matches: string[]) {
    this.lines.push({ text: `${this.prompt}${this.input}`, kind: 'cmd' });
    this.lines.push({ text: matches.join('   '), kind: 'dim' });
  }

  private print(text: string, kind: LineKind = 'out') {
    this.lines.push({ text, kind });
  }

  private printAll(lines: Line[]) {
    lines.forEach((l) => this.lines.push(l));
  }

  /** Resolve a cd target (relative, ~, .., a/b) against the current folder. */
  private resolve(target: string): string[] | null {
    let path = target.startsWith('~') || target.startsWith('/') ? [] : [...this.path];
    for (const part of target.replace(/^~\/?|^\//, '').split('/')) {
      if (!part || part === '.') continue;
      if (part === '..') {
        path.pop();
        continue;
      }
      if (!children(path).includes(part)) return null;
      path = [...path, part];
    }
    return path;
  }

  private cd(target: string) {
    const next = this.resolve(target || '~');
    if (!next) {
      if (this.mode === 'friendly') {
        this.print(`can’t find “${target}” here. pick something from the list below.`, 'err');
      } else {
        this.print(`cd: no such file or directory: ${target}`, 'err');
      }
      return;
    }
    this.path = next;
    this.selected = 0;
    if (next.length > 0) this.printAll(page(next, this.mode));
  }

  /** Friendly mode: plain words and numbers work without `cd` ("about", "2", "..", "home"). */
  private shortcut(cmd: string): string | null {
    const names = children(this.path);
    const n = Number(cmd);
    if (Number.isInteger(n) && n >= 1 && n <= names.length) return names[n - 1];
    if (['..', 'up'].includes(cmd)) return '..';
    if (['home', '~'].includes(cmd)) return '~';
    if (names.includes(cmd)) return cmd;
    if ((ROOT_DIRS as readonly string[]).includes(cmd)) return `~/${cmd}`;
    return null;
  }

  private run(cmd: string, arg: string): TerminalAction {
    if (EXIT_WORDS.has(cmd)) {
      this.print('thank you for stopping by!', 'accent');
      return { type: 'exit' };
    }
    const friendly = this.mode === 'friendly';
    const shortcut = friendly && !arg ? this.shortcut(cmd) : null;
    if (shortcut) {
      this.cd(shortcut);
      return null;
    }
    switch (cmd) {
      case 'help':
        this.print('commands:', 'accent');
        for (const [name, what] of helpLines(this.mode)) this.print(`  ${name.padEnd(10)}${what}`);
        return null;
      case 'friendly':
      case 'switch':
        this.mode = friendly ? 'classic' : 'friendly';
        this.selected = 0;
        if (this.mode === 'friendly') {
          this.print('friendly mode on.', 'title');
          this.print(FRIENDLY_HINT, 'accent');
        } else {
          this.print('friendly mode off. type `help` for commands.', 'dim');
        }
        return null;
      case 'ls':
        if (children(this.path).length) this.printAll(listing(this.path, this.mode));
        else this.printAll(page(this.path, this.mode));
        return null;
      case 'cd':
        this.cd((friendly ? this.shortcut(arg) : null) ?? arg);
        return null;
      case 'history':
        this.history.forEach((h, i) => this.print(`  ${String(i + 1).padStart(3)}  ${h}`));
        return null;
      case 'clear':
        this.reset(this.mode);
        return null;
      case 'simple':
      case 'normal':
      case 'lite':
        this.print('taking you back to the start…', 'accent');
        return { type: 'simple' };
      // small extras, not listed in help
      case 'pwd':
        this.print(`/home/hanjing/desk${this.path.length ? `/${this.path.join('/')}` : ''}`);
        return null;
      case 'echo':
        this.print(arg);
        return null;
      case 'date':
        this.print(new Date().toString().toLowerCase());
        return null;
      case 'sudo':
        this.print('hanjing is not in the sudoers file. this incident will be reported.', 'err');
        return null;
      default:
        if (friendly) {
          this.print(`i don’t know “${cmd}” yet. pick something from the list below.`, 'err');
        } else {
          this.print(`zsh: command not found: ${cmd}. try \`help\``, 'err');
        }
        return null;
    }
  }
}

// ---------------------------------------------------------------- rendering

const COLORS: Record<LineKind, string> = {
  out: '#d7dde5',
  cmd: '#d7dde5',
  dim: '#7d8794',
  err: '#ff7b72',
  accent: '#79c0ff',
  title: '#f2cc60',
};
const MONO = 'Menlo, Consolas, "SFMono-Regular", monospace';

/** Draws a Terminal onto a canvas texture used by the monitor screen, with scrollback. */
export class TerminalScreen {
  readonly texture: THREE.CanvasTexture;
  private ctx: CanvasRenderingContext2D;
  private width = 1600;
  private height = 934;
  private fontSize = 30;
  private lineHeight = 40;
  private pad = 36;
  private bar = 54;
  private charWidth: number;
  /** First visible wrapped row, or null to follow the bottom (the prompt). */
  private scrollTop: number | null = null;
  private lastTotal = 0;
  private lastRows = 1;
  /** Height of the friendly-mode guide bar at the bottom of the screen. */
  private footer = 52;

  constructor() {
    const el = document.createElement('canvas');
    el.width = this.width;
    el.height = this.height;
    this.ctx = el.getContext('2d')!;
    this.ctx.font = `${this.fontSize}px ${MONO}`;
    this.charWidth = this.ctx.measureText('m').width;
    this.texture = new THREE.CanvasTexture(el);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.flipY = false;
    this.texture.anisotropy = 8;
  }

  private rowsFor(friendly: boolean) {
    return Math.floor((this.height - this.bar - this.pad - (friendly ? this.footer : 0)) / this.lineHeight);
  }

  /** Scroll by whole rows (positive = down). */
  scrollBy(rows: number) {
    const max = Math.max(0, this.lastTotal - this.lastRows);
    const top = (this.scrollTop ?? max) + rows;
    this.scrollTop = top >= max ? null : Math.max(0, top);
  }

  /** Page up/down by most of a screen. */
  page(direction: -1 | 1) {
    this.scrollBy(direction * (this.lastRows - 2));
  }

  /** Jump back to the prompt (after typing). */
  follow() {
    this.scrollTop = null;
  }

  draw(terminal: Terminal, cursorOn: boolean) {
    const { ctx, width, height, pad, bar } = this;
    ctx.fillStyle = '#101317';
    ctx.fillRect(0, 0, width, height);

    // title bar
    ctx.fillStyle = '#1c2027';
    ctx.fillRect(0, 0, width, bar);
    ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(34 + i * 34, 27, 10, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = '#9aa5b1';
    ctx.font = `24px ${MONO}`;
    ctx.textAlign = 'center';
    ctx.fillText(`hanjing — zsh — ${terminal.cwd()}`, width / 2, 35);
    ctx.textAlign = 'left';

    // word-wrap every line to the screen width
    type Row = Line & { source: number; menu?: { selected: boolean; detail: string } };
    const cols = Math.floor((width - pad * 2 - 24) / this.charWidth);
    const wrapped: Row[] = [];
    const wrap = (line: Line, source: number) => {
      if (!line.text) {
        wrapped.push({ ...line, source });
        return;
      }
      let rest = line.text;
      while (rest.length > cols) {
        let cut = rest.lastIndexOf(' ', cols);
        if (cut <= 0) cut = cols;
        wrapped.push({ text: rest.slice(0, cut), kind: line.kind, source });
        rest = rest.slice(cut).replace(/^ /, '');
      }
      wrapped.push({ text: rest, kind: line.kind, source });
    };
    terminal.lines.forEach((line, i) => wrap(line, i));
    const inputLine: Line = { text: `${terminal.prompt}${terminal.input}`, kind: 'cmd' };
    const inputStart = wrapped.length;
    for (let i = 0; i < inputLine.text.length || i === 0; i += cols) {
      wrapped.push({ text: inputLine.text.slice(i, i + cols), kind: 'cmd', source: -1 });
    }
    const inputEnd = wrapped.length - 1;

    // friendly mode: an arrow-key picker under the prompt
    const menu = terminal.menu();
    const detailColumn = menu ? Math.max(...menu.map((item) => item.label.length)) + 6 : 0;
    if (menu) {
      wrapped.push({ text: '? where to?', kind: 'dim', source: -2 });
      menu.forEach((item, i) =>
        wrapped.push({ text: item.label, kind: 'out', source: -2, menu: { selected: i === terminal.selected, detail: item.detail } }),
      );
    }
    this.lastTotal = wrapped.length;

    // a command that printed a lot opens at its first line, so pages read from the top
    const rows = this.rowsFor(!!menu);
    this.lastRows = rows;
    const max = Math.max(0, wrapped.length - rows);
    if (terminal.anchor !== null) {
      const at = wrapped.findIndex((w) => w.source === terminal.anchor);
      this.scrollTop = at >= 0 && at < max ? at : null;
      terminal.anchor = null;
    }
    const top = this.scrollTop === null ? max : Math.min(this.scrollTop, max);
    const visible = wrapped.slice(top, top + rows);

    ctx.font = `${this.fontSize}px ${MONO}`;
    visible.forEach((line, i) => {
      const rowTop = bar + pad + i * this.lineHeight;
      const y = rowTop + this.fontSize * 0.8;
      if (line.menu) {
        if (line.menu.selected) {
          ctx.fillStyle = 'rgba(121, 192, 255, 0.16)';
          ctx.fillRect(pad - 10, rowTop - 2, width - pad * 2 - 4, this.lineHeight);
        }
        ctx.fillStyle = line.menu.selected ? COLORS.accent : COLORS.out;
        ctx.fillText(`${line.menu.selected ? '❯' : ' '} ${line.text}`, pad, y);
        ctx.fillStyle = COLORS.dim;
        ctx.fillText(line.menu.detail, pad + this.charWidth * detailColumn, y);
        return;
      }
      const isPrompt = line.kind === 'cmd' && line.text.startsWith('hanjing@desk ');
      if (isPrompt) {
        const at = line.text.indexOf(' % ');
        ctx.fillStyle = '#7ee787';
        ctx.fillText('hanjing@desk', pad, y);
        ctx.fillStyle = '#79c0ff';
        ctx.fillText(line.text.slice(12, at), pad + this.charWidth * 12, y);
        ctx.fillStyle = COLORS.cmd;
        ctx.fillText(line.text.slice(at), pad + this.charWidth * at, y);
      } else {
        ctx.fillStyle = COLORS[line.kind];
        ctx.fillText(line.text, pad, y);
      }
    });

    // block cursor (only when the prompt is on screen)
    const cursorRow = inputEnd - top;
    if (cursorOn && cursorRow >= 0 && cursorRow < rows) {
      const col = inputLine.text.length - (inputEnd - inputStart) * cols;
      ctx.fillStyle = 'rgba(215, 221, 229, 0.85)';
      ctx.fillRect(pad + col * this.charWidth, bar + pad + cursorRow * this.lineHeight + 4, this.charWidth, this.lineHeight - 6);
    }

    // friendly mode: a guide bar that stays put while you scroll
    const bottom = menu ? height - this.footer : height;
    if (menu) {
      ctx.fillStyle = '#1c2027';
      ctx.fillRect(0, bottom, width, this.footer);
      ctx.font = `24px ${MONO}`;
      ctx.fillStyle = '#9aa5b1';
      ctx.fillText('friendly mode   ↑ ↓ choose   enter open   esc leave', pad, bottom + 34);
      ctx.fillStyle = COLORS.accent;
      ctx.textAlign = 'right';
      ctx.fillText(`❯ ${menu[terminal.selected]?.label ?? ''}`, width - pad, bottom + 34);
      ctx.textAlign = 'left';
    }

    // scrollbar + "more below" hint when there's more than a screen
    if (wrapped.length > rows) {
      const trackTop = bar + 12;
      const trackHeight = bottom - bar - 24;
      const thumb = Math.max(40, (rows / wrapped.length) * trackHeight);
      const y = trackTop + (top / max) * (trackHeight - thumb);
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(width - 18, trackTop, 6, trackHeight);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(width - 18, y, 6, thumb);
      if (top < max) {
        ctx.fillStyle = 'rgba(16,19,23,0.9)';
        ctx.fillRect(width - 330, bottom - 52, 300, 40);
        ctx.fillStyle = '#7d8794';
        ctx.font = `22px ${MONO}`;
        ctx.textAlign = 'right';
        ctx.fillText('↓ scroll for more', width - 40, bottom - 24);
        ctx.textAlign = 'left';
      }
    }
    this.texture.needsUpdate = true;
  }

  dispose() {
    this.texture.dispose();
  }
}
