'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

/**
 * A header that behaves like the Dynamic Island: a plain full-width bar at the
 * top of the page that contracts into a floating, blurred pill once you scroll,
 * and expands again when you return to the top.
 *
 * The morph is driven by width / radius / padding on one element rather than by
 * swapping two headers, so there is nothing to cross-fade and the logo and links
 * stay in the DOM — a screen reader or a keyboard user sees one stable nav.
 *
 * Collapse is hysteretic (collapses at 90px, expands at 40px) so a trackpad
 * hovering around a single threshold can't make it flicker.
 */

const MAROON = '#8B1A1A';

const LINKS = [
  { label: 'How it works', href: '#how' },
  { label: 'Features', href: '#features' },
  { label: 'Walkthrough', href: '#workflow' },
  { label: 'For whom', href: '#whom' },
];

export default function DynamicHeader() {
  const [stuck, setStuck] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const read = () => {
      frame = 0;
      const y = window.scrollY;

      setStuck((was) => (was ? y > 40 : y > 90));

      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? Math.min(1, y / max) : 0);
    };

    const onScroll = () => {
      // One read per frame — a raw scroll handler fires far more often than
      // the screen can repaint.
      if (!frame) frame = requestAnimationFrame(read);
    };

    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="sticky top-0 z-50 pointer-events-none">
      <div
        className="relative mx-auto transition-all duration-500 pointer-events-auto overflow-hidden"
        style={{
          maxWidth: stuck ? 'min(880px, calc(100% - 32px))' : '100%',
          marginTop: stuck ? 12 : 0,
          borderRadius: stuck ? 999 : 0,
          background: stuck ? 'rgba(255,255,255,.86)' : 'rgba(251,248,247,.62)',
          backdropFilter: 'saturate(180%) blur(26px)',
          WebkitBackdropFilter: 'saturate(180%) blur(26px)',
          border: stuck ? '1px solid rgba(139,26,26,.10)' : '1px solid transparent',
          borderBottomColor: stuck ? 'rgba(139,26,26,.10)' : 'rgba(139,26,26,.08)',
          boxShadow: stuck ? '0 10px 34px -12px rgba(60,20,20,.26)' : 'none',
          transitionTimingFunction: 'cubic-bezier(.32,.72,0,1)',
        }}
      >
        <div
          className="flex items-center justify-between gap-4 transition-all duration-500"
          style={{
            height: stuck ? 58 : 76,
            paddingLeft: stuck ? 16 : 28,
            paddingRight: stuck ? 10 : 28,
            transitionTimingFunction: 'cubic-bezier(.32,.72,0,1)',
          }}
        >
          <Link href="/" className="flex items-center gap-2.5 group shrink-0" aria-label="MR One home">
            <span
              className="relative block transition-all duration-500"
              style={{
                width: stuck ? 30 : 38,
                height: stuck ? 30 : 38,
                transitionTimingFunction: 'cubic-bezier(.32,.72,0,1)',
              }}
            >
              <Image
                src="/mr-mark.png"
                alt=""
                aria-hidden
                fill
                sizes="40px"
                className="object-contain transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </span>
            <span
              className="font-bold tracking-tight text-gray-900 transition-all duration-500"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: stuck ? 18 : 21,
                transitionTimingFunction: 'cubic-bezier(.32,.72,0,1)',
              }}
            >
              MR One
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1" aria-label="Sections">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-[14px] text-gray-600 hover:text-gray-900 px-3 py-2 rounded-full hover:bg-black/[0.04] transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/privacy-policy"
              className="hidden lg:block text-[14px] text-gray-600 hover:text-gray-900 px-3 py-2 rounded-full hover:bg-black/[0.04] transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/login"
              className="text-[14px] font-semibold rounded-full text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-px whitespace-nowrap"
              style={{
                background: MAROON,
                paddingLeft: stuck ? 16 : 20,
                paddingRight: stuck ? 16 : 20,
                paddingTop: stuck ? 8 : 10,
                paddingBottom: stuck ? 8 : 10,
              }}
            >
              Admin Login
            </Link>
          </div>
        </div>

        {/* Reading progress, drawn along the island's own edge */}
        <div
          aria-hidden
          className="absolute left-0 right-0 bottom-0 h-[2px] transition-opacity duration-500"
          style={{ opacity: stuck ? 1 : 0 }}
        >
          <div
            className="h-full origin-left"
            style={{
              background: `linear-gradient(90deg, ${MAROON}, #C2410C)`,
              transform: `scaleX(${progress})`,
              transition: 'transform .12s linear',
            }}
          />
        </div>
      </div>
    </div>
  );
}
