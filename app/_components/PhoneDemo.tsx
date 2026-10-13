'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * The page's centrepiece: a phone running the real MR One request timeline,
 * stepping through the four states a concern actually moves through.
 *
 * It is an interactive demo rather than a screenshot because the thing worth
 * explaining — that a request routes itself and reports back — is a sequence,
 * not a picture.
 *
 * Autoplay stops on hover, on focus, when scrolled out of view, and entirely
 * under prefers-reduced-motion, where the resolved state is rendered straight
 * away. Every stage is reachable by keyboard through the chips below.
 */

const MAROON = '#8B1A1A';

type Stage = {
  key: string;
  chip: string;
  badge: string;
  badgeBg: string;
  badgeText: string;
  owner: string;
  note: string;
  caption: string;
};

const STAGES: Stage[] = [
  {
    key: 'pending',
    chip: 'Raised',
    badge: 'Pending',
    badgeBg: '#FEF3C7',
    badgeText: '#92400E',
    owner: 'Dean of Student Welfare',
    note: 'Waiting with the One Stop desk',
    caption: 'A student raises a concern. It lands on the One Stop desk within seconds.',
  },
  {
    key: 'in_progress',
    chip: 'Picked up',
    badge: 'In Progress',
    badgeBg: '#FFEDD5',
    badgeText: '#9A3412',
    owner: 'Dean of Student Welfare',
    note: 'Looking into this now — will route it today.',
    caption: 'The desk has 3 hours to act. Miss it and the concern escalates by itself.',
  },
  {
    key: 'in_review',
    chip: 'Routed',
    badge: 'In Review',
    badgeBg: '#DBEAFE',
    badgeText: '#1E40AF',
    owner: 'Dean — School of Engineering',
    note: 'Verifying the records with the examination office.',
    caption: 'Forwarded to the right desk. The student sees a designation, never an inbox.',
  },
  {
    key: 'resolved',
    chip: 'Resolved',
    badge: 'Resolved',
    badgeBg: '#D1FAE5',
    badgeText: '#065F46',
    owner: 'Dean — School of Engineering',
    note: 'Corrected on the portal. Updated marksheet attached.',
    caption: 'Closed, with the answer and any documents attached. Reopen it if it is not right.',
  },
];

const AUTOPLAY_MS = 3200;

export default function PhoneDemo() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [reduced, setReduced] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Reduced motion: no autoplay, and open on the finished state so the whole
  // story is visible without anything having to move.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => {
      setReduced(mq.matches);
      if (mq.matches) {
        setPlaying(false);
        setActive(STAGES.length - 1);
      }
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  // Don't animate to an empty room.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || reduced) return;
    const io = new IntersectionObserver(
      ([entry]) => setPlaying(entry.isIntersecting),
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  useEffect(() => {
    if (!playing || reduced) return;
    const t = setTimeout(() => setActive((i) => (i + 1) % STAGES.length), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [active, playing, reduced]);

  const pause = () => setPlaying(false);
  const resume = () => { if (!reduced) setPlaying(true); };

  const stage = STAGES[active];

  const pick = (i: number) => {
    setActive(i);
    setPlaying(false); // a deliberate choice outranks the carousel
  };

  return (
    <div ref={rootRef} className="flex flex-col items-center gap-6">
      <div
        onMouseEnter={pause}
        onMouseLeave={resume}
        onFocusCapture={pause}
        className="relative"
      >
        {/* glow */}
        <div
          aria-hidden
          className="absolute -inset-8 rounded-[60px] blur-3xl opacity-40 transition-colors duration-700"
          style={{ background: `radial-gradient(circle at 50% 30%, ${stage.badgeBg}, transparent 70%)` }}
        />

        {/* device */}
        <div
          className="relative w-[280px] rounded-[42px] p-[10px] shadow-2xl"
          style={{ background: 'linear-gradient(160deg,#2a2a2e,#111113)' }}
        >
          <div className="relative rounded-[33px] overflow-hidden bg-[#F8F9FA] h-[560px] flex flex-col">
            {/* notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[86px] h-[22px] bg-black rounded-full z-20" />

            {/* app header */}
            <div className="px-5 pt-9 pb-5" style={{ background: MAROON }}>
              <p className="text-[9px] tracking-[0.18em] text-white/55 font-semibold">MR ONE</p>
              <p className="text-white text-[17px] font-bold mt-0.5">My Requests</p>
            </div>

            {/* ticket card */}
            <div className="px-4 -mt-3">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold tracking-wide" style={{ color: MAROON }}>
                      #MRU26104877
                    </p>
                    <p className="text-[13px] font-bold text-gray-900 mt-1 leading-snug">
                      Marksheet shows an old grade
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1">Examination Processes</p>
                  </div>
                  <span
                    className="text-[9px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap transition-colors duration-500"
                    style={{ background: stage.badgeBg, color: stage.badgeText }}
                  >
                    {stage.badge}
                  </span>
                </div>

                {/* progress rail */}
                <div className="mt-4 flex items-center gap-1" aria-hidden>
                  {STAGES.map((s, i) => (
                    <div
                      key={s.key}
                      className="h-1 flex-1 rounded-full transition-colors duration-500"
                      style={{ background: i <= active ? MAROON : '#E5E7EB' }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* timeline */}
            <div className="px-4 pt-5 flex-1 overflow-hidden">
              <p className="text-[10px] font-bold text-gray-900 mb-3">Progress Timeline</p>

              <div className="flex flex-col gap-0">
                {STAGES.map((s, i) => {
                  const done = i < active;
                  const current = i === active;
                  const reached = i <= active;
                  return (
                    <div key={s.key} className="flex gap-3">
                      {/* rail */}
                      <div className="flex flex-col items-center w-5 shrink-0">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center transition-all duration-500"
                          style={{
                            background: reached ? MAROON : '#fff',
                            border: reached ? 'none' : '2px solid #D1D5DB',
                            transform: current ? 'scale(1.15)' : 'scale(1)',
                            boxShadow: current ? `0 0 0 4px ${MAROON}22` : 'none',
                          }}
                        >
                          {done ? (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : (
                            <span className="text-[8px] font-bold" style={{ color: reached ? '#fff' : '#9CA3AF' }}>
                              {i + 1}
                            </span>
                          )}
                        </div>
                        {i < STAGES.length - 1 && (
                          <div
                            className="w-[2px] flex-1 min-h-[26px] my-1 transition-colors duration-500"
                            style={{ background: i < active ? MAROON : '#E5E7EB' }}
                          />
                        )}
                      </div>

                      {/* body */}
                      <div
                        className="pb-1 transition-all duration-500"
                        style={{ opacity: reached ? 1 : 0.38 }}
                      >
                        <p className="text-[11px] font-bold text-gray-900 leading-tight">{s.owner}</p>
                        <p className="text-[9.5px] mt-0.5" style={{ color: current ? stage.badgeText : '#9CA3AF' }}>
                          {current ? s.note : done ? 'Done' : 'Awaiting action'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* tab bar */}
            <div className="border-t border-gray-100 bg-white px-5 py-2.5 flex justify-between">
              {['Home', 'Raise', 'Track', 'Alerts'].map((t) => (
                <span
                  key={t}
                  className="text-[8.5px] font-semibold"
                  style={{ color: t === 'Track' ? MAROON : '#B6BCC5' }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* caption */}
      <p
        key={stage.key}
        className="text-sm text-gray-600 text-center max-w-xs leading-relaxed min-h-[40px] animate-[fadeUp_.45s_ease-out]"
      >
        {stage.caption}
      </p>

      {/* stage chips — keyboard reachable, and the way to drive it by hand */}
      <div className="flex flex-wrap items-center justify-center gap-2" role="tablist" aria-label="Request stages">
        {STAGES.map((s, i) => {
          const on = i === active;
          return (
            <button
              key={s.key}
              role="tab"
              aria-selected={on}
              onClick={() => pick(i)}
              className="text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                background: on ? MAROON : '#fff',
                color: on ? '#fff' : '#6B7280',
                borderColor: on ? MAROON : '#E5E7EB',
                outlineColor: MAROON,
              }}
            >
              {s.chip}
            </button>
          );
        })}
      </div>
    </div>
  );
}
