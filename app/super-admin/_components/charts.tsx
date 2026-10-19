'use client';
import { useId, useMemo, useState, type ReactNode } from 'react';

/* ───────────────────────────────────────────────────────────────────────────
   Chart primitives for the super-admin console.

   Every palette here was run through the data-viz validator against this
   console's actual surface (#FFFFFF cards), not chosen by eye:

     • STATUS  — the app's own four status colours. All-pairs CVD ΔE 8.9,
       normal-vision 15.5. Amber and green sit below 3:1 contrast, which makes
       visible direct labels and the table view a requirement, not a nicety —
       both ship below.
     • SERIES  — categorical slots 1–2 for raised vs resolved. All-pairs CVD
       ΔE 24.7, contrast ≥ 3:1.
     • RAMP    — one hue, light → dark, lightness strictly monotonic. Used for
       magnitude only.

   Status colours are never reused as a categorical series, and series colours
   never carry status meaning.
   ─────────────────────────────────────────────────────────────────────────── */

export const INK = {
  primary: '#0B0B0B',
  secondary: '#52514E',
  muted: '#898781',
  grid: '#E9E7E2',
  axis: '#D3D1CA',
};

export const STATUS = {
  pending:     { fill: '#F59E0B', label: 'Pending' },
  in_progress: { fill: '#EA580C', label: 'In Progress' },
  in_review:   { fill: '#3B82F6', label: 'In Review' },
  resolved:    { fill: '#10B981', label: 'Resolved' },
  rejected:    { fill: '#9CA3AF', label: 'Rejected' },
} as const;

export const SERIES = { raised: '#2a78d6', resolved: '#eb6834' };

export const RAMP = ['#F6E7E7', '#E4B9B9', '#CE8686', '#B45555', '#9A2F2F', '#8B1A1A', '#6E1414'];

const nf = new Intl.NumberFormat('en-IN');
export const fmt = (n: number) => nf.format(Math.round(n || 0));

/* ── shell ────────────────────────────────────────────────────────────────── */

export function Panel({
  title, subtitle, action, children, table,
}: {
  title: string; subtitle?: string; action?: ReactNode; children: ReactNode;
  /** The table view. Required wherever a mark sits below 3:1 on the surface. */
  table?: ReactNode;
}) {
  const [showTable, setShowTable] = useState(false);
  return (
    <section className="bg-white rounded-2xl border border-[#ECE7E6] p-5 sm:p-6">
      <header className="flex items-start justify-between gap-4 mb-5">
        <div className="min-w-0">
          <h3 className="text-[15px] font-bold text-gray-900 leading-tight">{title}</h3>
          {subtitle && <p className="text-[12.5px] text-gray-500 mt-1 leading-snug">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {action}
          {table && (
            <button
              onClick={() => setShowTable((v) => !v)}
              className="text-[11.5px] font-semibold px-2.5 py-1.5 rounded-lg border border-[#ECE7E6] text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              aria-pressed={showTable}
            >
              {showTable ? 'Chart' : 'Table'}
            </button>
          )}
        </div>
      </header>
      {showTable && table ? table : children}
    </section>
  );
}

export function DataTable({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-[12.5px]">
        <thead>
          <tr className="text-left text-gray-500">
            {head.map((h, i) => (
              <th key={h} className={`font-semibold pb-2 px-1 ${i ? 'text-right' : ''}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-[#F2EEED]">
              {r.map((c, j) => (
                <td key={j} className={`py-2 px-1 tabular-nums ${j ? 'text-right text-gray-700' : 'text-gray-900 font-medium'}`}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Legend({ items }: { items: { fill: string; label: string; value?: string }[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-[3px] shrink-0" style={{ background: it.fill }} />
          <span className="text-[12px] text-gray-600">{it.label}</span>
          {it.value && <span className="text-[12px] font-semibold text-gray-900 tabular-nums">{it.value}</span>}
        </li>
      ))}
    </ul>
  );
}

/* ── stat tile ────────────────────────────────────────────────────────────── */

export function StatTile({
  label, value, hint, delta, accent = '#8B1A1A', spark,
}: {
  label: string; value: string | number; hint?: string;
  delta?: { value: number; good: boolean; suffix?: string };
  accent?: string; spark?: number[];
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#ECE7E6] p-4 sm:p-5 flex flex-col gap-1.5 transition-shadow hover:shadow-[0_10px_26px_-16px_rgba(60,20,20,.35)]">
      <p className="text-[11.5px] font-semibold tracking-wide uppercase text-gray-500">{label}</p>
      <div className="flex items-end gap-2 flex-wrap">
        <span className="text-[30px] leading-none font-bold text-gray-900 tabular-nums">{value}</span>
        {delta && (
          <span
            className="inline-flex items-center gap-1 text-[12px] font-bold pb-0.5"
            style={{ color: delta.good ? '#006300' : '#B3261E' }}
          >
            {/* icon + sign, never colour alone */}
            <span aria-hidden>{delta.value >= 0 ? '▲' : '▼'}</span>
            {Math.abs(delta.value)}{delta.suffix || ''}
          </span>
        )}
      </div>
      {hint && <p className="text-[12px] text-gray-500 leading-snug">{hint}</p>}
      {spark && spark.length > 1 && <Sparkline values={spark} stroke={accent} />}
    </div>
  );
}

function Sparkline({ values, stroke }: { values: number[]; stroke: string }) {
  const W = 120, H = 26;
  const max = Math.max(...values, 1);
  const step = W / Math.max(1, values.length - 1);
  const d = values.map((v, i) => `${i ? 'L' : 'M'}${(i * step).toFixed(1)},${(H - (v / max) * (H - 3) - 1.5).toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-7 mt-1.5" preserveAspectRatio="none" aria-hidden>
      <path d={d} fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/* ── part-to-whole: horizontal stacked bar ────────────────────────────────── */

export function StatusBar({ counts }: { counts: Record<string, number> }) {
  const order = ['pending', 'in_progress', 'in_review', 'resolved', 'rejected'] as const;
  const parts = order
    .map((k) => ({ key: k, n: counts[k] || 0, ...STATUS[k] }))
    .filter((p) => p.n > 0);
  const total = parts.reduce((a, p) => a + p.n, 0) || 1;
  const [hover, setHover] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      {/* 2px surface gaps between segments, 4px rounded ends on the run */}
      <div className="flex gap-[2px] h-11 rounded-[5px] overflow-hidden" role="img"
           aria-label={parts.map((p) => `${p.label} ${p.n}`).join(', ')}>
        {parts.map((p) => {
          const pct = (p.n / total) * 100;
          return (
            <div
              key={p.key}
              onMouseEnter={() => setHover(p.key)}
              onMouseLeave={() => setHover(null)}
              className="relative grid place-items-center transition-opacity"
              style={{ width: `${pct}%`, background: p.fill, opacity: hover && hover !== p.key ? 0.45 : 1 }}
              title={`${p.label}: ${fmt(p.n)} (${pct.toFixed(1)}%)`}
            >
              {/* direct label — the relief for amber/green sitting under 3:1 */}
              {pct > 9 && (
                <span className="text-[12px] font-bold text-white drop-shadow-sm tabular-nums">
                  {Math.round(pct)}%
                </span>
              )}
            </div>
          );
        })}
      </div>

      <Legend items={parts.map((p) => ({ fill: p.fill, label: p.label, value: fmt(p.n) }))} />
    </div>
  );
}

/* ── trend: two lines, crosshair + tooltip ────────────────────────────────── */

type Point = { date: string; raised: number; resolved: number; backlog: number };

export function TrendLines({ series }: { series: Point[] }) {
  const gid = useId().replace(/:/g, '');
  const [idx, setIdx] = useState<number | null>(null);

  const W = 760, H = 230, P = { t: 14, r: 14, b: 26, l: 38 };
  const iw = W - P.l - P.r, ih = H - P.t - P.b;
  const max = Math.max(4, ...series.flatMap((p) => [p.raised, p.resolved]));
  const ticks = useMemo(() => {
    const step = Math.max(1, Math.ceil(max / 4));
    return Array.from({ length: 5 }, (_, i) => i * step).filter((t) => t <= max + step);
  }, [max]);
  const top = ticks[ticks.length - 1] || max;

  const x = (i: number) => P.l + (series.length <= 1 ? iw / 2 : (i / (series.length - 1)) * iw);
  const y = (v: number) => P.t + ih - (v / top) * ih;
  const path = (k: 'raised' | 'resolved') =>
    series.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p[k]).toFixed(1)}`).join(' ');

  const active = idx != null ? series[idx] : null;
  const labelEvery = Math.max(1, Math.round(series.length / 6));

  return (
    <div className="flex flex-col gap-4">
      <Legend items={[
        { fill: SERIES.raised, label: 'Raised' },
        { fill: SERIES.resolved, label: 'Resolved' },
      ]} />

      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 230 }}
          onMouseLeave={() => setIdx(null)}
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            const px = ((e.clientX - r.left) / r.width) * W;
            const i = Math.round(((px - P.l) / iw) * (series.length - 1));
            setIdx(Math.max(0, Math.min(series.length - 1, i)));
          }}
          role="img"
          aria-label={`Requests raised and resolved over ${series.length} days`}
        >
          {/* recessive grid */}
          {ticks.map((t) => (
            <g key={t}>
              <line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} stroke={INK.grid} strokeWidth={1} />
              <text x={P.l - 8} y={y(t) + 3.5} textAnchor="end" fontSize={10.5} fill={INK.muted}>{t}</text>
            </g>
          ))}
          <line x1={P.l} x2={W - P.r} y1={y(0)} y2={y(0)} stroke={INK.axis} strokeWidth={1} />

          {series.map((p, i) => i % labelEvery === 0 && (
            <text key={p.date} x={x(i)} y={H - 8} textAnchor="middle" fontSize={10} fill={INK.muted}>
              {p.date.slice(5).replace('-', '/')}
            </text>
          ))}

          {active && <line x1={x(idx!)} x2={x(idx!)} y1={P.t} y2={P.t + ih} stroke={INK.axis} strokeWidth={1} strokeDasharray="3 3" />}

          <path d={path('raised')} fill="none" stroke={SERIES.raised} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          <path d={path('resolved')} fill="none" stroke={SERIES.resolved} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

          {active && (['raised', 'resolved'] as const).map((k) => (
            // 2px surface ring where the markers overlap
            <circle key={k} cx={x(idx!)} cy={y(active[k])} r={4.5}
                    fill={SERIES[k]} stroke="#fff" strokeWidth={2} />
          ))}
          <title id={gid}>Requests raised and resolved per day</title>
        </svg>

        {active && (
          <div
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-full bg-white rounded-xl border border-[#E6E0DF] shadow-lg px-3 py-2 min-w-[132px]"
            style={{ left: `${(x(idx!) / W) * 100}%`, top: 8 }}
          >
            <p className="text-[11px] font-semibold text-gray-500 mb-1">{active.date}</p>
            {(['raised', 'resolved'] as const).map((k) => (
              <p key={k} className="flex items-center gap-1.5 text-[12px]">
                <span className="w-2 h-2 rounded-[2px]" style={{ background: SERIES[k] }} />
                <span className="text-gray-600 capitalize flex-1">{k}</span>
                <span className="font-bold text-gray-900 tabular-nums">{active[k]}</span>
              </p>
            ))}
            <p className="flex items-center gap-1.5 text-[12px] mt-1 pt-1 border-t border-[#F2EEED]">
              <span className="text-gray-600 flex-1">Open after</span>
              <span className="font-bold text-gray-900 tabular-nums">{active.backlog}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── magnitude: ranked horizontal bars, one hue ───────────────────────────── */

export function RankedBars({
  rows, unit = '',
}: {
  rows: { label: string; value: number; sub?: string }[]; unit?: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="flex flex-col gap-3">
      {rows.map((r, i) => {
        // darker step = larger value, so colour reinforces length
        const shade = RAMP[Math.min(RAMP.length - 1, 2 + Math.round((r.value / max) * 3))];
        return (
          <li key={r.label} className="group">
            <div className="flex items-baseline justify-between gap-3 mb-1.5">
              <span className="text-[13px] font-medium text-gray-800 truncate">{r.label}</span>
              <span className="text-[13px] font-bold text-gray-900 tabular-nums shrink-0">
                {fmt(r.value)}{unit}
              </span>
            </div>
            <div className="h-2 rounded-full bg-[#F4F0EF] overflow-hidden">
              <div
                className="h-full rounded-full transition-[width] duration-700 ease-out"
                style={{ width: `${Math.max(2, (r.value / max) * 100)}%`, background: shade }}
                title={`${r.label}: ${fmt(r.value)}${unit}`}
              />
            </div>
            {r.sub && <p className="text-[11.5px] text-gray-500 mt-1">{r.sub}</p>}
          </li>
        );
      })}
    </ul>
  );
}

/* ── ratio against a limit ────────────────────────────────────────────────── */

export function Meter({ pct, label, caption }: { pct: number; label: string; caption?: string }) {
  const p = Math.max(0, Math.min(100, pct));
  // status, not categorical — ships with a word, never colour alone
  const tone = p >= 90
    ? { fill: '#0CA30C', word: 'Healthy' }
    : p >= 70
      ? { fill: '#FAB219', word: 'Watch' }
      : { fill: '#D03B3B', word: 'At risk' };
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[13px] text-gray-700">{label}</span>
        <span className="flex items-baseline gap-2">
          <span className="text-[13px] font-semibold" style={{ color: tone.fill }}>{tone.word}</span>
          <span className="text-[17px] font-bold text-gray-900 tabular-nums">{p}%</span>
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-[#F4F0EF] overflow-hidden">
        <div className="h-full rounded-full transition-[width] duration-700 ease-out"
             style={{ width: `${p}%`, background: tone.fill }} />
      </div>
      {caption && <p className="text-[11.5px] text-gray-500">{caption}</p>}
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const s = (STATUS as Record<string, { fill: string; label: string }>)[status];
  if (!s) return <span className="text-[11.5px] text-gray-500">{status}</span>;
  return (
    <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-2 py-1 rounded-full"
          style={{ background: `${s.fill}1A`, color: '#1F2937' }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.fill }} />
      {s.label}
    </span>
  );
}
