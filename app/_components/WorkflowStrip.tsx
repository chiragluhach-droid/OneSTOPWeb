import type { ReactNode } from 'react';

/**
 * Seven compact phone screens walking through one concern end to end.
 *
 * Deliberately a server component with no JS: it is a static sequence, and CSS
 * scroll-snap gives the horizontal rail its behaviour on narrow screens without
 * shipping a carousel. Every screen is real app UI, not a placeholder.
 */

const MAROON = '#8B1A1A';

/* ── tiny building blocks, sized for a 186px-wide screen ─────────────────── */

function Screen({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="w-[186px] shrink-0 rounded-[26px] p-[6px] shadow-xl" style={{ background: 'linear-gradient(160deg,#2a2a2e,#111113)' }}>
      <div className="relative rounded-[21px] overflow-hidden bg-[#F8F9FA] h-[330px] flex flex-col">
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-[52px] h-[13px] bg-black rounded-full z-20" />
        <div className="px-3.5 pt-6 pb-3" style={{ background: MAROON }}>
          <p className="text-[6.5px] tracking-[0.18em] text-white/55 font-semibold">MR ONE</p>
          <p className="text-white text-[12px] font-bold mt-0.5">{title}</p>
        </div>
        <div className="flex-1 px-3 pt-3 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

const Card = ({ children }: { children: ReactNode }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-2.5">{children}</div>
);

const Badge = ({ label, bg, fg }: { label: string; bg: string; fg: string }) => (
  <span className="text-[6.5px] font-bold px-2 py-[3px] rounded-full whitespace-nowrap" style={{ background: bg, color: fg }}>
    {label}
  </span>
);

const Line = ({ w = '100%', h = 5, c = '#E8EAED' }: { w?: string; h?: number; c?: string }) => (
  <div className="rounded-full" style={{ width: w, height: h, background: c }} />
);

const Node = ({ done, current, label, note }: { done?: boolean; current?: boolean; label: string; note: string }) => (
  <div className="flex gap-1.5">
    <div className="flex flex-col items-center w-3 shrink-0">
      <div
        className="w-3 h-3 rounded-full grid place-items-center"
        style={{ background: done || current ? MAROON : '#fff', border: done || current ? 'none' : '1.5px solid #D1D5DB' }}
      >
        {done && (
          <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
      <div className="w-[1.5px] flex-1 min-h-[13px] my-[2px]" style={{ background: done ? MAROON : '#E8EAED' }} />
    </div>
    <div className="pb-0.5 min-w-0">
      <p className="text-[7.5px] font-bold text-gray-900 leading-tight truncate">{label}</p>
      <p className="text-[6.5px] text-gray-500 leading-tight truncate">{note}</p>
    </div>
  </div>
);

/* ── the seven steps ─────────────────────────────────────────────────────── */

const STEPS: { n: string; caption: string; screen: ReactNode }[] = [
  {
    n: '01',
    caption: 'Pick a category and describe it. Attach anything that helps.',
    screen: (
      <Screen title="Raise a Request">
        <p className="text-[7px] font-bold text-gray-700 mb-1.5">Category</p>
        <div className="flex flex-wrap gap-1 mb-2.5">
          {['Exams', 'Library', 'IT', 'Hostel'].map((c, i) => (
            <span
              key={c}
              className="text-[6.5px] font-semibold px-2 py-[3px] rounded-full border"
              style={i === 0
                ? { background: MAROON, color: '#fff', borderColor: MAROON }
                : { background: '#fff', color: '#9CA3AF', borderColor: '#E8EAED' }}
            >
              {c}
            </span>
          ))}
        </div>
        <p className="text-[7px] font-bold text-gray-700 mb-1">Subject</p>
        <div className="bg-white border rounded-lg px-2 py-1.5 mb-2" style={{ borderColor: '#E8EAED' }}>
          <p className="text-[7px] text-gray-800">Marksheet shows an old grade</p>
        </div>
        <div className="bg-white border rounded-lg px-2 py-1.5 mb-2.5 flex flex-col gap-1" style={{ borderColor: '#E8EAED' }}>
          <Line w="92%" h={4} /><Line w="78%" h={4} /><Line w="55%" h={4} />
        </div>
        <div className="rounded-lg py-1.5 text-center" style={{ background: MAROON }}>
          <span className="text-[7.5px] font-bold text-white">Submit</span>
        </div>
      </Screen>
    ),
  },
  {
    n: '02',
    caption: 'A ticket number comes back straight away, and the desk is already notified.',
    screen: (
      <Screen title="My Requests">
        <Card>
          <div className="flex items-start justify-between gap-1.5">
            <p className="text-[7px] font-bold" style={{ color: MAROON }}>#MRU26104877</p>
            <Badge label="Pending" bg="#FEF3C7" fg="#92400E" />
          </div>
          <p className="text-[8px] font-bold text-gray-900 mt-1 leading-tight">Marksheet shows an old grade</p>
          <p className="text-[6.5px] text-gray-500 mt-0.5">Examination Processes</p>
          <div className="mt-2 flex gap-[3px]">
            <div className="h-[3px] flex-1 rounded-full" style={{ background: MAROON }} />
            {[0, 1, 2].map((i) => <div key={i} className="h-[3px] flex-1 rounded-full bg-gray-200" />)}
          </div>
        </Card>
        <div className="mt-2.5 rounded-lg px-2 py-1.5" style={{ background: '#FEF3C7' }}>
          <p className="text-[6.5px] font-bold" style={{ color: '#92400E' }}>Waiting with the One Stop desk</p>
          <p className="text-[6px] mt-0.5" style={{ color: '#92400E' }}>3-hour response window running</p>
        </div>
      </Screen>
    ),
  },
  {
    n: '03',
    caption: 'The One Stop desk picks it up and says so. The clock is visible to them too.',
    screen: (
      <Screen title="Progress">
        <Card>
          <div className="flex items-start justify-between gap-1.5">
            <p className="text-[7px] font-bold" style={{ color: MAROON }}>#MRU26104877</p>
            <Badge label="In Progress" bg="#FFEDD5" fg="#9A3412" />
          </div>
          <div className="mt-2 flex gap-[3px]">
            {[0, 1].map((i) => <div key={i} className="h-[3px] flex-1 rounded-full" style={{ background: MAROON }} />)}
            {[0, 1].map((i) => <div key={i} className="h-[3px] flex-1 rounded-full bg-gray-200" />)}
          </div>
        </Card>
        <p className="text-[7px] font-bold text-gray-900 mt-2.5 mb-1.5">Progress Timeline</p>
        <Node done label="Dean of Student Welfare" note="Received" />
        <Node current label="Dean of Student Welfare" note="Looking into this now" />
        <div className="mt-1 rounded-lg px-2 py-1.5" style={{ background: '#FFEDD5' }}>
          <p className="text-[6px] leading-snug" style={{ color: '#9A3412' }}>“Checking with the exam office — will route it today.”</p>
        </div>
      </Screen>
    ),
  },
  {
    n: '04',
    caption: 'Forwarded to whoever can act. You see a designation, never a mailbox.',
    screen: (
      <Screen title="Progress">
        <Card>
          <div className="flex items-start justify-between gap-1.5">
            <p className="text-[7px] font-bold" style={{ color: MAROON }}>#MRU26104877</p>
            <Badge label="In Review" bg="#DBEAFE" fg="#1E40AF" />
          </div>
          <div className="mt-2 flex gap-[3px]">
            {[0, 1, 2].map((i) => <div key={i} className="h-[3px] flex-1 rounded-full" style={{ background: MAROON }} />)}
            <div className="h-[3px] flex-1 rounded-full bg-gray-200" />
          </div>
        </Card>
        <p className="text-[7px] font-bold text-gray-900 mt-2.5 mb-1.5">Progress Timeline</p>
        <Node done label="Dean of Student Welfare" note="Forwarded" />
        <Node current label="Dean — School of Engg." note="Verifying records" />
        <div className="mt-1 rounded-lg px-2 py-1.5 border" style={{ background: '#EEF4FF', borderColor: '#BFD4FA' }}>
          <p className="text-[6px] font-bold" style={{ color: '#1E40AF' }}>48-hour window running</p>
        </div>
      </Screen>
    ),
  },
  {
    n: '05',
    caption: 'Every change of hands reaches your phone — push and email, no refreshing.',
    screen: (
      <Screen title="Notifications">
        <div className="flex flex-col gap-1.5">
          {[
            { t: 'Request Under Review', b: 'Picked up by Dean — School of Engg.', bg: '#EEF4FF', on: true },
            { t: 'Request In Progress', b: 'The One Stop desk is working on it', bg: '#FFF7ED', on: false },
            { t: 'Request Submitted', b: '#MRU26104877 has been received', bg: '#F4F6F8', on: false },
          ].map((n) => (
            <div key={n.t} className="rounded-lg px-2 py-1.5 border" style={{ background: n.bg, borderColor: n.on ? '#BFD4FA' : '#EDEFF2' }}>
              <div className="flex items-center gap-1">
                <p className="text-[7px] font-bold text-gray-900 truncate flex-1">{n.t}</p>
                {n.on && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: MAROON }} />}
              </div>
              <p className="text-[6px] text-gray-600 mt-0.5 leading-tight">{n.b}</p>
            </div>
          ))}
        </div>
      </Screen>
    ),
  },
  {
    n: '06',
    caption: 'Resolved with a written answer, and the corrected document attached.',
    screen: (
      <Screen title="Resolved">
        <Card>
          <div className="flex items-start justify-between gap-1.5">
            <p className="text-[7px] font-bold" style={{ color: MAROON }}>#MRU26104877</p>
            <Badge label="Resolved" bg="#D1FAE5" fg="#065F46" />
          </div>
          <div className="mt-2 flex gap-[3px]">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-[3px] flex-1 rounded-full" style={{ background: MAROON }} />)}
          </div>
        </Card>
        <div className="mt-2 rounded-lg px-2 py-1.5" style={{ background: '#ECFDF5' }}>
          <p className="text-[6px] leading-snug" style={{ color: '#065F46' }}>“Corrected on the portal. Updated marksheet attached.”</p>
        </div>
        <div className="mt-1.5 flex items-center gap-1.5 bg-white border rounded-lg px-2 py-1.5" style={{ borderColor: '#E8EAED' }}>
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={MAROON} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.4 11 12.3 20.1a6 6 0 0 1-8.5-8.5l9.2-9.1a4 4 0 0 1 5.7 5.6l-9.2 9.2a2 2 0 0 1-2.8-2.9l8.5-8.4" />
          </svg>
          <p className="text-[6.5px] font-semibold text-gray-800 truncate flex-1">marksheet-revised.pdf</p>
          <span className="text-[7px] font-bold" style={{ color: MAROON }}>↓</span>
        </div>
        <div className="mt-1.5 flex items-center gap-1">
          <span className="text-[6px] text-gray-500">Resolved in</span>
          <span className="text-[6.5px] font-bold text-gray-800">1d 4h</span>
        </div>
      </Screen>
    ),
  },
  {
    n: '07',
    caption: 'Not satisfied? Send it back with a reason and it restarts at the desk.',
    screen: (
      <Screen title="Reopen">
        <p className="text-[8px] font-bold text-gray-900 leading-tight">Reopen this concern</p>
        <p className="text-[6.5px] text-gray-500 mt-1 leading-snug">Tell us what is still unresolved. It goes back to the One Stop desk.</p>
        <div className="mt-2 rounded-lg px-2 py-1.5 border-l-2" style={{ background: '#FFF7ED', borderColor: '#EA580C' }}>
          <p className="text-[6px] leading-snug" style={{ color: '#9A3412' }}>You can reopen this 2 more times, within 7 days.</p>
        </div>
        <div className="mt-2 bg-white border rounded-lg px-2 py-1.5 flex flex-col gap-1" style={{ borderColor: '#E8EAED' }}>
          <p className="text-[6.5px] text-gray-800 leading-snug">The portal still shows the old grade.</p>
          <Line w="60%" h={4} />
        </div>
        <div className="mt-2 flex gap-1.5">
          <div className="flex-1 rounded-lg py-1.5 text-center bg-gray-100">
            <span className="text-[7px] font-bold text-gray-600">Cancel</span>
          </div>
          <div className="flex-[2] rounded-lg py-1.5 text-center" style={{ background: MAROON }}>
            <span className="text-[7px] font-bold text-white">↻ Reopen</span>
          </div>
        </div>
      </Screen>
    ),
  },
];

export default function WorkflowStrip() {
  return (
    <div
      className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory"
      style={{ scrollbarWidth: 'thin' }}
    >
      {STEPS.map((s) => (
        <figure key={s.n} className="snap-start shrink-0 flex flex-col gap-3.5" style={{ width: 186 }}>
          {s.screen}
          <figcaption className="flex flex-col gap-1">
            <span className="text-[11px] font-bold tracking-wide" style={{ color: MAROON }}>{s.n}</span>
            <p className="text-[13px] text-gray-600 leading-snug">{s.caption}</p>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
