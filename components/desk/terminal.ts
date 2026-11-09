import * as THREE from 'three';
import { posts, postHref } from '@/content/posts';
import { projects, projectHref } from '@/content/projects';
import { site } from '@/lib/site';

/**
 * The terminal on the desk monitor. Visitors type real commands ("help",
 * "cd projects", "open sunstang-vcu-2026") to move around the site. Pages and
 * projects come from the content registries, so new ones appear here too.
 */

export type TerminalAction =
  | { type: 'navigate'; href: string }
  | { type: 'open-case' }
  | { type: 'exit' }
  | null;

type LineKind = 'out' | 'cmd' | 'dim' | 'err' | 'accent';
type Line = { text: string; kind: LineKind };

const PROMPT = 'hanjing@desk ~ % ';
const HOME = '/home/hanjing/desk';

/** Top-level places you can `cd` into. */
const PLACES: Record<string, string> = { projects: '/projects', about: '/about', blog: '/blog', contact: '/contact' };

const COMMANDS: [string, string][] = [
  ['help', 'show this list'],
  ['ls [projects|blog]', 'list what’s here'],
  ['cd <place>', 'go to projects, about, blog, or contact'],
  ['cd projects/<name>', 'open a project (tab completes)'],
  ['open <name>', 'open a project, a page, or the pencil case'],
  ['whoami', 'whose desk this is'],
  ['contact', 'how to reach me'],
  ['history', 'what you’ve typed'],
  ['clear', 'clear the screen'],
  ['exit', 'back to the desk (or press esc)'],
];

function today() {
  return new Date().toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' }).toLowerCase();
}

export class Terminal {
  lines: Line[] = [
    { text: `last login: ${today()} on ttys001`, kind: 'dim' },
    { text: 'welcome to hanjing’s desk.', kind: 'out' },
    { text: 'type `help` to see what you can do here.', kind: 'accent' },
    { text: '', kind: 'out' },
  ];
  input = '';
  readonly prompt = PROMPT;
  private history: string[] = [];
  private historyIndex = -1;

  type(char: string) {
    this.input += char;
  }

  backspace() {
    this.input = this.input.slice(0, -1);
  }

  /** Ctrl+C: abandon the current line. */
  cancel() {
    this.lines.push({ text: `${PROMPT}${this.input}^C`, kind: 'cmd' });
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

  /** Tab completion for commands and for `cd` / `open` arguments. */
  complete() {
    const [cmd, ...rest] = this.input.split(' ');
    if (!rest.length) {
      const matches = COMMANDS.map(([c]) => c.split(' ')[0]).filter((c) => c.startsWith(cmd));
      if (matches.length === 1) this.input = `${matches[0]} `;
      else if (matches.length > 1) this.print(matches.join('   '), 'dim', true);
      return;
    }
    if (cmd !== 'cd' && cmd !== 'open') return;
    const arg = rest.join(' ');
    const candidates = [
      ...Object.keys(PLACES),
      ...projects.map((p) => `projects/${p.slug}`),
      ...posts.map((p) => `blog/${p.slug}`),
      ...(cmd === 'open' ? [...projects.map((p) => p.slug), 'pencil-case'] : []),
    ];
    const matches = candidates.filter((c) => c.startsWith(arg));
    if (matches.length === 1) this.input = `${cmd} ${matches[0]}`;
    else if (matches.length > 1) this.print(matches.join('   '), 'dim', true);
  }

  /** Run the current line. Returns what the page should do next, if anything. */
  submit(): TerminalAction {
    const line = this.input.trim();
    this.lines.push({ text: `${PROMPT}${this.input}`, kind: 'cmd' });
    this.input = '';
    this.historyIndex = -1;
    if (!line) return null;
    this.history.push(line);
    const [cmd, ...args] = line.split(/\s+/);
    const arg = args.join(' ');
    const action = this.run(cmd.toLowerCase(), arg);
    this.lines.push({ text: '', kind: 'out' });
    return action;
  }

  private print(text: string, kind: LineKind = 'out', withPrompt = false) {
    if (withPrompt) this.lines.push({ text: `${PROMPT}${this.input}`, kind: 'cmd' });
    this.lines.push({ text, kind });
  }

  private go(href: string): TerminalAction {
    this.print(`→ opening ${href}`, 'accent');
    return { type: 'navigate', href };
  }

  /** Resolve `projects`, `projects/<slug>`, `blog/<slug>`, or a page name to a URL. */
  private resolve(target: string): string | null {
    const path = target.replace(/^~\/?|^\.\//, '').replace(/\/$/, '');
    if (PLACES[path]) return PLACES[path];
    const [dir, name] = path.split('/');
    if (dir === 'projects' && name) {
      const match = projects.find((p) => p.slug === name) ?? projects.find((p) => p.slug.startsWith(name));
      return match ? projectHref(match.slug) : null;
    }
    if (dir === 'blog' && name) {
      const match = posts.find((p) => p.slug === name);
      return match ? postHref(match.slug) : null;
    }
    return null;
  }

  private run(cmd: string, arg: string): TerminalAction {
    switch (cmd) {
      case 'help':
        this.print('commands:', 'accent');
        for (const [name, what] of COMMANDS) this.print(`  ${name.padEnd(20)}${what}`);
        return null;
      case 'ls':
      case 'dir': {
        const path = arg.replace(/\/$/, '');
        if (!path) this.print('projects/   about/   blog/   contact/   pencil-case');
        else if (path === 'projects') projects.forEach((p) => this.print(`  ${p.slug.padEnd(30)}${p.title}`));
        else if (path === 'blog') posts.forEach((p) => this.print(`  ${p.slug.padEnd(30)}${p.listTitle}`));
        else this.print(`ls: ${path}: no such file or directory`, 'err');
        return null;
      }
      case 'cd': {
        if (!arg || ['~', '/', '.', '..', HOME].includes(arg)) {
          this.print('you’re already home.', 'dim');
          return null;
        }
        const href = this.resolve(arg);
        if (href) return this.go(href);
        this.print(`cd: no such file or directory: ${arg}`, 'err');
        return null;
      }
      case 'open': {
        if (['pencil-case', 'case', 'pencil'].includes(arg)) {
          this.print('opening the pencil case…', 'accent');
          return { type: 'open-case' };
        }
        const href = this.resolve(arg) ?? this.resolve(`projects/${arg}`);
        if (href) return this.go(href);
        this.print(arg ? `open: can’t find ${arg}. try \`ls projects\`` : 'open: what should i open? try `ls`', 'err');
        return null;
      }
      case 'whoami':
        this.print('hanjing lin, third-year software engineering student at western.');
        this.print('i build things around computer vision, embedded systems, and rtos.', 'dim');
        return null;
      case 'contact':
      case 'email':
        this.print(`email      ${site.emailLabel}`);
        this.print(`github     ${site.github.label}`);
        this.print(`linkedin   ${site.linkedin.label}`);
        this.print('or `cd contact`', 'dim');
        return null;
      case 'cat':
        if (/readme|about/i.test(arg)) {
          this.print('hi! i’m hanjing. outside of school projects i’ve shipped a PCB for my team’s');
          this.print('vehicle control unit, a computer vision project for physio, and an instant camera.');
          this.print('music and art are my life: guitar, piano, and tenor sax.', 'dim');
        } else {
          this.print(`cat: ${arg || '(nothing)'}: no such file`, 'err');
        }
        return null;
      case 'pwd':
        this.print(HOME);
        return null;
      case 'echo':
        this.print(arg);
        return null;
      case 'date':
        this.print(new Date().toString().toLowerCase());
        return null;
      case 'history':
        this.history.forEach((h, i) => this.print(`  ${String(i + 1).padStart(3)}  ${h}`));
        return null;
      case 'clear':
        this.lines = [];
        return null;
      case 'sudo':
        this.print('hanjing is not in the sudoers file. this incident will be reported.', 'err');
        return null;
      case 'exit':
      case 'logout':
        this.print('bye!', 'dim');
        return { type: 'exit' };
      default:
        this.print(`zsh: command not found: ${cmd}. try \`help\``, 'err');
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
};
const MONO = 'Menlo, Consolas, "SFMono-Regular", monospace';

/** Draws a Terminal onto a canvas texture used by the monitor screen. */
export class TerminalScreen {
  readonly texture: THREE.CanvasTexture;
  private ctx: CanvasRenderingContext2D;
  private width = 1600;
  private height = 934;
  private fontSize = 30;
  private lineHeight = 40;
  private charWidth: number;

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

  draw(terminal: Terminal, cursorOn: boolean) {
    const { ctx, width, height } = this;
    ctx.fillStyle = '#101317';
    ctx.fillRect(0, 0, width, height);

    // title bar
    ctx.fillStyle = '#1c2027';
    ctx.fillRect(0, 0, width, 54);
    ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(34 + i * 34, 27, 10, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = '#9aa5b1';
    ctx.font = `24px ${MONO}`;
    ctx.textAlign = 'center';
    ctx.fillText('hanjing — zsh — desk', width / 2, 35);
    ctx.textAlign = 'left';

    // wrap lines to the screen width, then show the last ones that fit
    const pad = 36;
    const cols = Math.floor((width - pad * 2) / this.charWidth);
    const rows = Math.floor((height - 54 - pad) / this.lineHeight);
    const wrapped: Line[] = [];
    const push = (line: Line) => {
      if (!line.text) wrapped.push(line);
      for (let i = 0; i < line.text.length; i += cols) wrapped.push({ text: line.text.slice(i, i + cols), kind: line.kind });
    };
    terminal.lines.forEach(push);
    const inputLine = { text: `${terminal.prompt}${terminal.input}`, kind: 'cmd' as LineKind };
    push(inputLine);
    const visible = wrapped.slice(-rows);

    ctx.font = `${this.fontSize}px ${MONO}`;
    visible.forEach((line, i) => {
      const y = 54 + pad + i * this.lineHeight + this.fontSize * 0.8;
      if (line.kind === 'cmd' && line.text.startsWith(terminal.prompt)) {
        ctx.fillStyle = '#7ee787';
        ctx.fillText('hanjing@desk', pad, y);
        ctx.fillStyle = '#79c0ff';
        ctx.fillText(' ~', pad + this.charWidth * 12, y);
        ctx.fillStyle = COLORS.cmd;
        ctx.fillText(line.text.slice(14), pad + this.charWidth * 14, y);
      } else {
        ctx.fillStyle = COLORS[line.kind];
        ctx.fillText(line.text, pad, y);
      }
    });

    // block cursor after the input
    if (cursorOn) {
      const last = visible.length - 1;
      const col = inputLine.text.length % cols;
      ctx.fillStyle = 'rgba(215, 221, 229, 0.85)';
      ctx.fillRect(pad + col * this.charWidth, 54 + pad + last * this.lineHeight + 4, this.charWidth, this.lineHeight - 6);
    }
    this.texture.needsUpdate = true;
  }

  dispose() {
    this.texture.dispose();
  }
}
