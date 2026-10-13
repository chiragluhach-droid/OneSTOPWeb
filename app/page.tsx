import Link from 'next/link';
import Image from 'next/image';
import DynamicHeader from './_components/DynamicHeader';
import PhoneDemo from './_components/PhoneDemo';
import WorkflowStrip from './_components/WorkflowStrip';
import Reveal from './_components/Reveal';
import CountUp from './_components/CountUp';

export const metadata = {
  title: 'MR One — Student Services at Manav Rachna University',
  description:
    'MR One is the official student services app for Manav Rachna University. Raise a concern, watch it route itself to the right desk, and get an answer — with a clock on every step.',
  openGraph: {
    title: 'MR One — Student Services at Manav Rachna University',
    description:
      'Raise a concern, watch it route itself to the right desk, and get an answer — with a clock on every step.',
    type: 'website',
  },
};

const MAROON = '#8B1A1A';
// A deeper step of the same maroon, used only for the headline word that sits
// directly on the photograph. #8B1A1A reads 3.32:1 there — fine for display
// type, but this clears 4.5:1 outright and looks richer against the building.
const MAROON_DEEP = '#5A0E0E';
const IOS_URL = 'https://apps.apple.com/in/app/mr-one-manav-rachna/id6772509561';
const PLAY_URL = 'https://play.google.com/store/apps/details?id=com.mru.onestop';

/* ── Icons (inline SVG — never emoji) ─────────────────────────────────────── */
const iconProps = {
  width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none',
  stroke: 'currentColor', strokeWidth: 1.7,
  strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
};

const Icons = {
  raise: (<svg {...iconProps}><path d="M12 5v14M5 12h14" /></svg>),
  route: (<svg {...iconProps}><circle cx="6" cy="6" r="3" /><circle cx="18" cy="18" r="3" /><path d="M6 9v3a3 3 0 0 0 3 3h3a3 3 0 0 1 3 3" /></svg>),
  clock: (<svg {...iconProps}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>),
  bell: (<svg {...iconProps}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>),
  paperclip: (<svg {...iconProps}><path d="M21.4 11 12.3 20.1a6 6 0 0 1-8.5-8.5l9.2-9.1a4 4 0 0 1 5.7 5.6l-9.2 9.2a2 2 0 0 1-2.8-2.9l8.5-8.4" /></svg>),
  reopen: (<svg {...iconProps}><path d="M3 12a9 9 0 1 0 2.6-6.4" /><path d="M3 4v5h5" /></svg>),
  shield: (<svg {...iconProps}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>),
  escalate: (<svg {...iconProps}><path d="M12 19V5" /><path d="m5 12 7-7 7 7" /></svg>),
};

const FEATURES = [
  { icon: Icons.raise, title: 'Raise it in under a minute', body: 'Pick a category, describe the problem, attach anything that helps. That is the whole form.' },
  { icon: Icons.route, title: 'It finds the right desk', body: 'The One Stop desk triages every concern and forwards it onward. You never have to work out who owns what.' },
  { icon: Icons.clock, title: 'A clock on every step', body: 'The desk gets 3 hours. A dean or HOD gets 48. The countdown runs whether anyone is watching or not.' },
  { icon: Icons.escalate, title: 'Escalates by itself', body: 'Miss the window and it goes over their head automatically, naming who did not act and when they were told.' },
  { icon: Icons.bell, title: 'Told the moment it moves', body: 'A push notification and an email at every change of hands. No refreshing, no asking around.' },
  { icon: Icons.paperclip, title: 'Documents both ways', body: 'Send supporting files with your concern, and get the corrected letter or marksheet back on the same thread.' },
  { icon: Icons.reopen, title: 'Not satisfied? Reopen it', body: 'Send it back with a reason and it returns to the desk on a fresh clock. Twice, within seven days.' },
  { icon: Icons.shield, title: 'Designations, not inboxes', body: 'You see "Dean — School of Law", never a personal mailbox. Attachments are signed links that expire.' },
];

const STEPS = [
  { n: '01', title: 'You raise it', body: 'Choose from ten service categories — examinations, library, IT, hostel, fees and more. Attach what you need to.' },
  { n: '02', title: 'It routes itself', body: 'The One Stop desk sees it immediately and passes it to the dean, HOD or director who can actually act.' },
  { n: '03', title: 'You get an answer', body: 'Resolved with a written reply and any documents. If the window lapses at any point, it escalates on its own.' },
];

const CATEGORIES = [
  'Examinations', 'Library', 'IT Support', 'Academic Support',
  'Student Welfare', 'Administration', 'Career Development',
  'Placements', 'International Office', 'Innovation & Incubation',
];

const AUDIENCES = [
  { label: 'Students', body: 'Raise concerns, follow every step, reopen anything that was closed too early.', tag: 'Mobile app' },
  { label: 'Deans, HODs & Directors', body: 'Act straight from the email, or from the staff app. Resolve, forward, or mark it in progress.', tag: 'Email + app' },
  { label: 'Administrators', body: 'Configure schools, categories, response windows and announcements from the dashboard.', tag: 'Web dashboard' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col overflow-x-clip" style={{ background: '#FBF8F7', fontFamily: 'var(--font-body)' }}>

      <DynamicHeader />

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <header className="relative -mt-[76px]">
        {/* ambient wash */}
        <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
          <Image
            src="/campus.jpg"
            alt=""
            aria-hidden
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-[0.80]"
            style={{ objectPosition: 'center 62%' }}
          />
          <div
            className="absolute inset-0"
            style={{
              // Flat across the text column rather than fading from solid, so
              // the building reads at full strength on the left too. Held at
              // 38% there — the ceiling for gray-800 body copy measured
              // against a true-black pixel in the photo. Past the copy, 65%.
              background:
                'linear-gradient(100deg, rgba(251,248,247,.525) 0%, rgba(251,248,247,.525) 46%, rgba(251,248,247,.33) 72%, rgba(251,248,247,.19) 100%)',
            }}
          />
          {/* Softens the seam under the nav and into the stats band below. */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, rgba(251,248,247,.30) 0%, transparent 20%, rgba(251,248,247,.74) 95%, #FBF8F7 100%)' }}
          />

          <div className="absolute -top-40 -left-32 w-[560px] h-[560px] rounded-full blur-3xl opacity-[0.07]" style={{ background: MAROON }} />
        </div>

        <div className="relative max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 pt-32 pb-24 grid lg:grid-cols-[1.05fr_auto] gap-14 lg:gap-10 items-start">
          <div className="flex flex-col items-start gap-6 max-w-2xl lg:pt-10">
            <span
              className="inline-flex items-center gap-2 text-[13.5px] font-semibold tracking-wide px-4 py-2 rounded-full border"
              style={{ color: MAROON, borderColor: '#E8D2D2', background: '#fff' }}
            >
              <span className="relative flex w-1.5 h-1.5">
                <span className="absolute inline-flex w-full h-full rounded-full opacity-75 motion-safe:animate-ping" style={{ background: MAROON }} />
                <span className="relative inline-flex w-1.5 h-1.5 rounded-full" style={{ background: MAROON }} />
              </span>
              Live at Manav Rachna University
            </span>

            <h1
              className="text-[3rem] sm:text-7xl font-bold text-gray-900 leading-[1.03] tracking-[-0.025em]"
              style={{ fontFamily: 'var(--font-display)', textWrap: 'balance' }}
            >
              Stop chasing<br />
              <span className="relative inline-block">
                <span style={{ color: MAROON_DEEP }}>departments.</span>
                <svg aria-hidden className="absolute -bottom-1.5 left-0 w-full" height="10" viewBox="0 0 200 10" preserveAspectRatio="none">
                  <path d="M2 7c40-4 100-5 196-2" stroke={MAROON_DEEP} strokeWidth="3" strokeLinecap="round" fill="none" opacity=".45" />
                </svg>
              </span>
            </h1>

            <p className="text-[21px] text-gray-800 leading-relaxed max-w-xl" style={{ textWrap: 'pretty' }}>
              Raise a concern once. MR One routes it to the desk that can actually
              fix it, keeps a clock on every step, and tells you the moment anything
              changes — so nothing quietly sits in an inbox.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <StoreButton href={PLAY_URL} platform="android" />
              <StoreButton href={IOS_URL} platform="ios" />
            </div>

            <p className="text-[15px] text-gray-800">
              Sign in with your <span className="font-semibold text-gray-900">@mru.ac.in</span> address — no password to remember.
            </p>
          </div>

          <div className="lg:justify-self-end w-full lg:w-auto flex justify-center">
            <PhoneDemo />
          </div>
        </div>
      </header>

      {/* ── Numbers ─────────────────────────────────────────────────────── */}
      <Reveal>
        <section className="relative" style={{ background: MAROON }}>
          <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6 text-center">
            {[
              { n: 3500, suffix: '+', label: 'Students enrolled' },
              { n: 10, suffix: '', label: 'Service categories' },
              { n: 5, suffix: '', label: 'Schools covered' },
              { n: 3, suffix: 'h', label: 'First response window' },
            ].map((s) => (
              <div key={s.label} className="flex flex-col gap-1.5">
                <CountUp
                  to={s.n}
                  suffix={s.suffix}
                  className="text-4xl sm:text-5xl font-bold text-white tabular-nums"
                />
                <p className="text-[13.5px] text-white/75 font-medium tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section id="how" className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-24 scroll-mt-20">
        <Reveal>
          <SectionHead
            kicker="How it works"
            title="Three steps, and the system does the chasing."
            sub="You are never asked to know which department owns your problem. That is the point."
          />
        </Reveal>

        <div className="grid md:grid-cols-3 gap-5 mt-12">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 110}>
              <div className="relative h-full bg-white rounded-2xl border p-7 pt-9 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgba(139,26,26,.28)]" style={{ borderColor: '#EFE3E1' }}>
                <span
                  className="absolute top-6 right-7 text-[40px] font-bold leading-none select-none"
                  style={{ fontFamily: 'var(--font-display)', color: '#F3E6E5' }}
                  aria-hidden
                >
                  {s.n}
                </span>
                <h3 className="text-[19px] font-bold text-gray-900 mb-2.5" style={{ fontFamily: 'var(--font-display)' }}>
                  {s.title}
                </h3>
                <p className="text-[16px] text-gray-600 leading-relaxed">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Workflow walkthrough ────────────────────────────────────────── */}
      <section id="workflow" className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 pb-20 sm:pb-24 scroll-mt-24">
        <Reveal>
          <SectionHead
            kicker="The whole journey"
            title="Seven screens, start to finish."
            sub="One concern, from the moment it is raised to the moment it is closed — and what happens if the answer is not good enough."
          />
        </Reveal>
        <Reveal delay={90}>
          <div className="mt-12">
            <WorkflowStrip />
          </div>
        </Reveal>
      </section>

      {/* ── Categories marquee ──────────────────────────────────────────── */}
      <Reveal>
        <section className="py-10 border-y overflow-hidden" style={{ borderColor: '#EFE3E1', background: '#fff' }}>
          <p className="text-center text-[12px] font-semibold tracking-[0.16em] uppercase text-gray-500 mb-8">
            Ten desks, one front door
          </p>
          <div className="relative flex overflow-hidden" style={{ maskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)', WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)' }}>
            {[0, 1].map((dup) => (
              <div
                key={dup}
                aria-hidden={dup === 1}
                className="flex shrink-0 gap-3 pr-3 motion-safe:animate-[marquee_38s_linear_infinite]"
              >
                {CATEGORIES.map((c) => (
                  <span
                    key={c}
                    className="whitespace-nowrap text-[15px] font-medium px-5 py-2.5 rounded-full border"
                    style={{ borderColor: '#EFE3E1', color: '#5B5250', background: '#FBF8F7' }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section id="features" className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-24 scroll-mt-20">
        <Reveal>
          <SectionHead
            kicker="What it does"
            title="Built for the part nobody enjoys."
            sub="Every feature here exists because something used to go missing between two desks."
          />
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 4) * 90}>
              <div
                className="group h-full bg-white rounded-2xl border p-6 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(139,26,26,.3)]"
                style={{ borderColor: '#EFE3E1' }}
              >
                <span
                  className="w-10 h-10 rounded-xl grid place-items-center transition-all duration-300 group-hover:scale-110"
                  style={{ background: '#FBF0EF', color: MAROON }}
                >
                  {f.icon}
                </span>
                <h3 className="font-bold text-gray-900 text-[16.5px] leading-snug">{f.title}</h3>
                <p className="text-[15px] text-gray-600 leading-relaxed">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Campus / who it's for ───────────────────────────────────────── */}
      <Reveal>
        <section id="whom" className="relative scroll-mt-24">
          <div className="absolute inset-0">
            <Image
              src="/campus.jpg"
              alt="Manav Rachna University campus"
              fill
              sizes="100vw"
              className="object-cover"
              priority={false}
            />
            {/* Heavy enough that white text clears 4.5:1 over the brightest part
                of the photo — the sky on the right — not just the dark left. */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(100deg, rgba(82,12,12,.97) 0%, rgba(120,20,20,.94) 50%, rgba(120,20,20,.90) 100%)' }} />
          </div>

          <div className="relative max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-24">
            <p className="text-[12px] font-semibold tracking-[0.16em] uppercase text-white/75 mb-3">Who it is for</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight max-w-3xl" style={{ fontFamily: 'var(--font-display)', textWrap: 'balance' }}>
              One platform, three sides of the same desk.
            </h2>

            <div className="grid md:grid-cols-3 gap-4 mt-12">
              {AUDIENCES.map((a, i) => (
                <Reveal key={a.label} delay={i * 110}>
                  <div className="h-full rounded-2xl p-6 border backdrop-blur-sm transition-colors duration-300 hover:bg-white/[0.14]" style={{ background: 'rgba(255,255,255,.09)', borderColor: 'rgba(255,255,255,.16)' }}>
                    <span className="inline-block text-[11px] font-semibold tracking-wide px-3 py-1.5 rounded-full text-white mb-4" style={{ background: 'rgba(255,255,255,.14)' }}>
                      {a.tag}
                    </span>
                    <h3 className="text-[19px] font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>{a.label}</h3>
                    <p className="text-[15.5px] text-white/75 leading-relaxed">{a.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* ── Download ────────────────────────────────────────────────────── */}
      <section className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-24">
        <Reveal>
          <div
            className="relative rounded-3xl border bg-white px-7 sm:px-14 py-14 text-center overflow-hidden"
            style={{ borderColor: '#EFE3E1' }}
          >
            <div aria-hidden className="absolute -top-28 left-1/2 -translate-x-1/2 w-[520px] h-[280px] rounded-full blur-3xl opacity-[0.08]" style={{ background: MAROON }} />
            <div className="relative flex flex-col items-center gap-5">
              <h2 className="text-4xl sm:text-[3.2rem] font-bold text-gray-900 leading-tight max-w-2xl" style={{ fontFamily: 'var(--font-display)', textWrap: 'balance' }}>
                Your next concern can be raised in a minute.
              </h2>
              <p className="text-[18px] text-gray-600 max-w-lg leading-relaxed">
                Free for every Manav Rachna student. Sign in with your university
                email — an OTP arrives, and you are in.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <StoreButton href={PLAY_URL} platform="android" />
                <StoreButton href={IOS_URL} platform="ios" />
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="mt-auto border-t" style={{ borderColor: '#EFE3E1', background: '#fff' }}>
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-12 grid sm:grid-cols-[1.4fr_1fr_1fr] gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="w-7 h-7 rounded-lg grid place-items-center text-white text-[12px] font-bold" style={{ background: MAROON, fontFamily: 'var(--font-display)' }}>M</span>
              <span className="text-[16px] font-bold text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>MR One</span>
            </div>
            <p className="text-[14.5px] text-gray-500 leading-relaxed max-w-sm">
              The official student services platform of Manav Rachna University,
              Faridabad.
            </p>
          </div>

          <FooterCol title="Product" links={[
            { label: 'How it works', href: '#how' },
            { label: 'Features', href: '#features' },
            { label: 'Android app', href: PLAY_URL, external: true },
            { label: 'iOS app', href: IOS_URL, external: true },
          ]} />

          <FooterCol title="Legal & access" links={[
            { label: 'Privacy Policy', href: '/privacy-policy' },
            { label: 'Delete Account', href: '/delete-account' },
            { label: 'Admin Login', href: '/login' },
          ]} />
        </div>

        <div className="border-t" style={{ borderColor: '#F2E9E8' }}>
          <p className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-5 text-[12px] text-gray-500 text-center sm:text-left">
            © {new Date().getFullYear()} Manav Rachna University. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ── Pieces ───────────────────────────────────────────────────────────────── */

function SectionHead({ kicker, title, sub }: { kicker: string; title: string; sub: string }) {
  return (
    <div className="flex flex-col gap-3 max-w-2xl">
      <p className="text-[12px] font-semibold tracking-[0.16em] uppercase" style={{ color: MAROON }}>{kicker}</p>
      <h2 className="text-4xl sm:text-[2.9rem] font-bold text-gray-900 leading-[1.12] tracking-[-0.02em]" style={{ fontFamily: 'var(--font-display)', textWrap: 'balance' }}>
        {title}
      </h2>
      <p className="text-[17.5px] text-gray-600 leading-relaxed">{sub}</p>
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string; external?: boolean }[] }) {
  return (
    <div>
      <p className="text-[13px] font-bold text-gray-900 mb-4 tracking-wide">{title}</p>
      <ul className="flex flex-col gap-2.5">
        {links.map((l) => (
          <li key={l.label}>
            {l.external ? (
              <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-[14.5px] text-gray-500 hover:text-gray-900 transition-colors">
                {l.label}
              </a>
            ) : (
              <Link href={l.href} className="text-[14.5px] text-gray-500 hover:text-gray-900 transition-colors">
                {l.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function StoreButton({ href, platform }: { href: string; platform: 'ios' | 'android' }) {
  const isIOS = platform === 'ios';
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative inline-flex items-center gap-3 pl-4 pr-6 py-3 rounded-2xl bg-white border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_38px_-14px_rgba(139,26,26,.42)] focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{ borderColor: '#EADCDA', outlineColor: MAROON }}
    >
      {/* a wash of the store's own colours, lifting on hover */}
      <span
        aria-hidden
        className="absolute inset-0 rounded-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: isIOS
            ? 'linear-gradient(135deg, rgba(0,122,255,.07), rgba(88,86,214,.09))'
            : 'linear-gradient(135deg, rgba(0,224,255,.08), rgba(255,206,0,.10) 55%, rgba(255,59,48,.08))',
        }}
      />

      <span className="relative shrink-0">
        {isIOS ? (
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
            <defs>
              <linearGradient id="appleG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2B2B2F" />
                <stop offset="100%" stopColor="#0A0A0C" />
              </linearGradient>
            </defs>
            <path
              fill="url(#appleG)"
              d="M16.37 12.78c-.02-2.4 1.96-3.55 2.05-3.61-1.12-1.64-2.86-1.86-3.48-1.89-1.48-.15-2.89.87-3.64.87-.75 0-1.91-.85-3.14-.83-1.61.03-3.1.94-3.93 2.38-1.68 2.91-.43 7.22 1.2 9.58.8 1.15 1.75 2.45 3 2.4 1.21-.05 1.66-.78 3.12-.78s1.87.78 3.14.75c1.3-.02 2.12-1.17 2.91-2.33.92-1.33 1.3-2.62 1.32-2.69-.03-.01-2.53-.97-2.55-3.85zM14.2 5.42c.66-.81 1.11-1.93.99-3.04-.95.04-2.11.64-2.8 1.44-.62.71-1.16 1.85-1.01 2.94 1.06.08 2.15-.54 2.82-1.34z"
            />
          </svg>
        ) : (
          /* the real four-colour Play mark, not a monochrome stand-in */
          <svg width="24" height="24" viewBox="0 0 512 512" aria-hidden>
            <path fill="#00D3FF" d="M47 18.9C40.6 25.4 37 34.9 37 47.2v417.6c0 12.3 3.6 21.8 10 28.3l1.9 1.8L283 262.6v-13.2L48.9 17.1 47 18.9z" />
            <path fill="#FFCE00" d="M361 341.1l-78-78v-13.2l78.1-78.1 1.8 1L456 225c26.7 15.1 26.7 39.9 0 55.1l-93.1 52.9-1.9 1.1z" />
            <path fill="#FF3A44" d="M362.9 340l-79.9-80L47 496c8.8 9.3 23.3 10.5 39.7 1.2L362.9 340z" />
            <path fill="#48FF48" d="M362.9 172L86.7 14.8C70.3 5.5 55.8 6.7 47 16l236 236 79.9-80z" />
          </svg>
        )}
      </span>

      <span className="relative flex flex-col items-start leading-none">
        <span className="text-[10px] text-gray-500 font-medium">
          {isIOS ? 'Download on the' : 'Get it on'}
        </span>
        <span className="text-[15px] font-bold text-gray-900 mt-0.5">
          {isIOS ? 'App Store' : 'Google Play'}
        </span>
      </span>
    </a>
  );
}
