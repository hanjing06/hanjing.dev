/**
 * Remembers, for this tab's session in memory, that the next visit to "/"
 * should open straight on the simple landing page instead of the start
 * screen. Set when the visitor picks the simple site or clicks the navbar's
 * name; a full page load starts fresh on the start screen.
 */
let simpleNext = false;

export function returnToSimple() {
  simpleNext = true;
}

export function wantsSimple() {
  return simpleNext;
}

export function clearSimple() {
  simpleNext = false;
}
