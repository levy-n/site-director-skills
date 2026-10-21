// PageTransition.tsx (Next.js 16.4 App Router, React 19.3): the geometric RTL page mask (move T-07)
// through React's <ViewTransition>. The CSS is page-transition.css (same folder).
//
// Rules this file depends on:
// - Stable API: import { ViewTransition } from 'react' (React 19.3; 19.2 does not export it). There is
//   no next.config flag: experimental.viewTransition was removed in Next 16.3.0 (left in on 16.4.1 it
//   only prints an "unrecognized key" warning). No 'use client' needed.
// - It goes in EVERY page.tsx as the first child, before any DOM node, never in a layout: layouts
//   persist and never enter or exit, and a ViewTransition after a DOM node never gets enter or exit.
//
//     export default function ServicesPage() {
//       return (
//         <PageTransition>
//           <main id="main">...</main>
//         </PageTransition>
//       );
//     }
//
// - Links say which way they go: <Link href="/services" transitionTypes={['nav-forward']}> (Next 16.2+)
//   and router.push('/contact', { transitionTypes: ['nav-back'] }). Which links count as forward
//   (deeper) and which as back (toward home) is one decision row. Untyped navigations, and the
//   browser's back and forward buttons (which carry no types), swap instantly ('none').
// - React does not respect reduced motion by itself; page-transition.css carries the rule.
// - Only one mounted ViewTransition per name: this wrapper has no name, React names it per instance.

import { ViewTransition, type ReactNode } from 'react';

/** The transition types our links use. */
export type NavTransitionType = 'nav-forward' | 'nav-back';

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition
      // the entering page: the diagonal edge travels right to left on forward, left to right on back
      enter={{ 'nav-forward': 'mw-wipe-rtl', 'nav-back': 'mw-wipe-ltr', default: 'none' }}
      // the leaving page: held underneath, drifting ahead of the edge
      exit={{ 'nav-forward': 'mw-hold-fwd', 'nav-back': 'mw-hold-back', default: 'none' }}
      default="none"
    >
      {children}
    </ViewTransition>
  );
}
