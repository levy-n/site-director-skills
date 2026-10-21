// keyboard-inertia.d.ts: types for keyboard-inertia.js (copy next to the .js in projects without allowJs).
import type { MotionEngine } from './motion-engine.js';

/** Cancels Lenis inertia on navigation keys, Tab and focusin. Returns an idempotent cleanup. */
export function guardKeyboardInertia(engine: MotionEngine): () => void;
