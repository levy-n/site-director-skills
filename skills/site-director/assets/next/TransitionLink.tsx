'use client';
// TransitionLink.tsx (Next.js): a next/link that runs the GSAP curtain (curtain.ts) where the View
// Transition wipe cannot run, plus <Curtain />, the curtain element that lifts itself on every
// pathname change.
//
//   // app/(frontend)/layout.tsx: after {children}, inside <SmoothScroll>
//   <Curtain />
//
//   // anywhere: a drop-in for Link; transitionTypes still drive the View Transition wipe
//   <TransitionLink href="/services" transitionTypes={['nav-forward']}>...</TransitionLink>
//
// Where View Transitions run (and the site does not force the curtain), TransitionLink is a plain
// Link and PageTransition does the work. Never both on one navigation.

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ComponentProps } from 'react';
import { cover, reveal, shouldUseCurtain } from './curtain';

type LinkProps = ComponentProps<typeof Link>;
type Props = Omit<LinkProps, 'href' | 'onNavigate'> & {
  href: string;
  onNavigate?: LinkProps['onNavigate'];
};

/** Same path as the current page. A #hash-only or query-only change (/blog to /blog?page=2) keeps
 * the pathname, and <Curtain /> lifts only on a pathname change, so a curtain drawn for it would
 * stay down until the 5 s failsafe: those navigate without the curtain. */
function samePage(href: string, pathname: string): boolean {
  try {
    const next = new URL(href, window.location.href);
    return next.origin === window.location.origin && next.pathname === pathname;
  } catch {
    return false;
  }
}

export function TransitionLink({ href, onNavigate, ...rest }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <Link
      href={href}
      {...rest}
      onNavigate={(e) => {
        if (onNavigate) onNavigate(e);
        if (!shouldUseCurtain()) return; // the View Transition wipe handles it
        if (samePage(href, pathname)) return; // same path: no curtain (nothing would lift it)
        e.preventDefault(); // hold the client-side navigation...
        cover(() => router.push(href)); // ...until the curtain covers the screen
      }}
    />
  );
}

/** The curtain element. Mount once in the persistent frontend layout (not template.tsx: a root
 * template does not remount on nested navigations such as /blog/a to /blog/b). */
export function Curtain() {
  const pathname = usePathname();
  useEffect(() => {
    reveal(); // the new route has committed: lift the curtain (a no-op when nothing is covered)
  }, [pathname]);
  return <div id="mw-curtain" className="mw-curtain" aria-hidden="true" />;
}
