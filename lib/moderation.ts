/**
 * Keeps the guest book clean: no sexual words, in names or messages.
 *
 * Text is normalised before matching, so the usual dodges are caught:
 * capitals, accents, look-alike digits and symbols (s3x, $ex, p0rn),
 * stretched letters (seeexxx), spaced or dotted letters (s e x, s.e.x) and
 * starred-out ones (f*ck).
 * Whole words only, so "Essex", "analysis" or "cocktail" stay fine.
 */

/** Word stems; plural and other common endings are added automatically. */
// (left out on purpose, since they're mostly innocent: "cum" as in cum laude, naked eye, breast stroke, kink in a hose)
const STEMS = [
  'sex', 'sexy', 'sexual', 'sexually', 'sexting', 'porn', 'porno', 'pornography', 'nude', 'nudes', 'nsfw', 'xxx',
  'nipple', 'nip', 'boob', 'booby', 'tit', 'titty', 'titties', 'areola', 'genital', 'genitalia',
  'penis', 'dick', 'cock', 'schlong', 'testicle', 'scrotum', 'vagina', 'vulva', 'clit', 'clitoris', 'pussy', 'cunt',
  'cumming', 'cumshot', 'jizz', 'semen', 'sperm', 'orgasm', 'horny', 'boner',
  'blowjob', 'handjob', 'rimjob', 'anal', 'dildo', 'vibrator', 'masturbate', 'masturbation', 'jerkoff', 'wank', 'wanker',
  'fuck', 'fucking', 'fucker', 'fucked', 'milf', 'dilf', 'hentai', 'onlyfans', 'erotic', 'erotica', 'fetish', 'kinky',
  'bdsm', 'slut', 'whore', 'stripper', 'threesome', 'orgy', 'smut', 'lewd', 'bussy', 'gooning',
] as const;

const ENDINGS = '(?:s|es|y|ies|ing|ed|er|ers|ly)?';
const PATTERN = new RegExp(`^(?:${STEMS.join('|')})${ENDINGS}$`);
const LOOK_ALIKES: Record<string, string> = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b', '@': 'a', $: 's', '!': 'i', '+': 't' };

function words(text: string) {
  const plain = text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[0-9@$!+]/g, (c) => LOOK_ALIKES[c] ?? c);
  const tokens = plain.split(/[^a-z]+/).filter(Boolean);
  // letters spelled out one at a time ("s e x", "s.e.x") count as one word
  const joined: string[] = [];
  let run = '';
  for (const token of tokens) {
    if (token.length === 1) run += token;
    else {
      if (run.length > 1) joined.push(run);
      run = '';
    }
  }
  if (run.length > 1) joined.push(run);
  return [...tokens, ...joined];
}

/** Starred-out words (f*ck, p**n): does some banned word fit the stars? */
function masked(text: string) {
  return text
    .toLowerCase()
    .split(/\s+/)
    .filter((chunk) => /[a-z][*#]+|[*#]+[a-z]/.test(chunk))
    .some((chunk) => {
      const shape = chunk.replace(/[^a-z*#]/g, '');
      const fit = new RegExp(`^${shape.replace(/[*#]+/g, (m) => `[a-z]{${m.length}}`)}${ENDINGS}$`);
      return STEMS.some((stem) => fit.test(stem));
    });
}

/** True when the text uses a sexual word. */
export function isSexual(text: string) {
  if (masked(text)) return true;
  // stretched letters squeezed back down, both to two (nippple → nipple) and to one (seeexxx → sex)
  return words(text).some((word) => [word, word.replace(/(.)\1{2,}/g, '$1$1'), word.replace(/(.)\1+/g, '$1')].some((w) => PATTERN.test(w)));
}
