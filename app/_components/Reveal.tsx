'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Fades a section up as it scrolls into view.
 *
 * The hidden state is applied in an effect rather than during render, which
 * matters twice over: the server-rendered HTML is fully visible, so crawlers
 * and anyone without JS get the real content, and there is no hydration
 * mismatch from the two passes disagreeing.
 */
export default function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return; // leave it visible, never animate
    }

    // Already on screen at hydration (above the fold): don't hide it, or it
    // would blink out and back in.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) {
      setShown(true);
      return;
    }

    setHidden(true);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const animating = hidden && !shown;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: animating ? 0 : 1,
        transform: animating ? 'translateY(22px)' : 'none',
        transition: hidden ? `opacity .6s ease-out ${delay}ms, transform .6s cubic-bezier(.22,1,.36,1) ${delay}ms` : undefined,
        willChange: hidden && !shown ? 'opacity, transform' : undefined,
      }}
    >
      {children}
    </div>
  );
}
