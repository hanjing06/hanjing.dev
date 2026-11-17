/**
 * Everything on the desk that needs three.js, behind one lazy import.
 *
 * The desk engine and the board labs both use three.js. Loaded through
 * separate lazy imports, the bundler gives each its own copy (170 KB
 * gzipped, downloaded and run twice). Starting the labs from here, a module
 * that already holds three.js, makes their chunks reuse it.
 */
export { DeskEngine } from './engine';
export const loadVcuLab = () => import('./lab/VcuLab');
export const loadFsmLab = () => import('./lab/FsmLab');
