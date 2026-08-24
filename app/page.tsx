import Link from 'next/link';

export const metadata = {
  title: 'MR One — Manav Rachna University',
  description:
    'MR One is the official student workflow automation platform for Manav Rachna University. Raise service requests, track approvals, and get notified — all in one place.',
};

const features = [
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M9 12h6M9 16h6M7 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
        <rect x="7" y="2" width="10" height="4" rx="1" />
      </svg>
    ),
    title: 'Raise Service Requests',
    body: 'Submit requests for academic support, administrative services, fee matters, and more — directly from the app.',
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: 'Track in Real Time',
    body: 'Follow every stage of your request as it moves through university departments, with full visibility into approvals.',
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    title: 'Instant Notifications',
    body: 'Get push and email alerts the moment your request is reviewed, approved, or needs your attention.',
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.41 17.41a2 2 0 0 1-2.83-2.83l8.49-8.48" />
      </svg>
    ),
    title: 'Attach Documents',
    body: 'Upload supporting documents and files directly with your request — securely stored and shared only with relevant staff.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#faf8f8' }}>

      {/* Nav */}
      <nav style={{ background: '#8B1A1A' }} className="sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-white font-bold text-lg tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
            MR One
          </span>
          <div className="flex items-center gap-1">
            <Link
              href="/privacy-policy"
              className="text-[#f5c6c6] hover:text-white text-xs px-3 py-1.5 rounded transition-colors hidden sm:block"
            >
              Privacy Policy
            </Link>
            <Link
              href="/delete-account"
              className="text-[#f5c6c6] hover:text-white text-xs px-3 py-1.5 rounded transition-colors hidden sm:block"
            >
              Delete Account
            </Link>
            <Link
              href="/login"
              className="ml-2 bg-white text-[#8B1A1A] text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-[#fdf4f4] transition-colors"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: '#8B1A1A' }} className="pt-16 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-6">
          <div
            className="text-xs font-semibold tracking-widest uppercase text-[#f5c6c6] border border-[#b54444] px-4 py-1.5 rounded-full"
          >
            Manav Rachna University
          </div>
          <h1
            className="text-4xl sm:text-5xl font-bold text-white leading-tight"
            style={{ fontFamily: 'Georgia, serif', textWrap: 'balance', letterSpacing: '-0.02em' }}
          >
            Your University Services,<br />One Place.
          </h1>
          <p className="text-[#f5c6c6] text-base leading-relaxed max-w-xl" style={{ textWrap: 'balance' }}>
            MR One is the official student workflow platform for Manav Rachna University.
            Raise service requests, track approvals, and stay informed — without chasing anyone.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            <span className="bg-[#6e1414] text-[#f9d9d9] text-sm px-5 py-2.5 rounded-full font-medium">
              Available on Android & iOS
            </span>
            <Link
              href="/login"
              className="bg-white text-[#8B1A1A] text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#fdf4f4] transition-colors"
            >
              Admin Login →
            </Link>
          </div>
        </div>
      </section>

      {/* Wave divider */}
      <div style={{ background: '#8B1A1A', lineHeight: 0 }}>
        <svg viewBox="0 0 1440 40" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 40 }}>
          <path d="M0,40 C360,0 1080,0 1440,40 L1440,40 L0,40 Z" fill="#faf8f8" />
        </svg>
      </div>

      {/* What is MR One */}
      <section className="max-w-5xl mx-auto px-6 py-16 flex flex-col gap-10 flex-1">
        <div className="text-center flex flex-col gap-2">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#8B1A1A]">The Platform</p>
          <h2
            className="text-2xl font-bold text-gray-900"
            style={{ fontFamily: 'Georgia, serif', textWrap: 'balance' }}
          >
            Everything a student needs to get things done.
          </h2>
          <p className="text-gray-500 text-sm max-w-lg mx-auto leading-relaxed" style={{ textWrap: 'balance' }}>
            From academic support to administrative services — MR One routes your requests
            to the right department and keeps you updated every step of the way.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl border border-[#ecdada] p-6 flex flex-col gap-3 shadow-sm"
            >
              <span className="w-10 h-10 rounded-xl bg-[#fdf4f4] text-[#8B1A1A] flex items-center justify-center">
                {f.icon}
              </span>
              <h3 className="font-semibold text-gray-900 text-[15px]">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>

        {/* For whom */}
        <div className="bg-white rounded-2xl border border-[#ecdada] shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-[#ecdada] bg-[#fdf8f8] flex items-center gap-3">
            <span className="w-1 h-5 rounded-full bg-[#8B1A1A] flex-shrink-0" />
            <h2 className="text-[15px] font-semibold text-gray-900">Who is MR One for?</h2>
          </div>
          <div className="px-6 py-5 grid sm:grid-cols-3 gap-5">
            {[
              { label: 'Students', desc: 'Raise and track service requests through the mobile app.' },
              { label: 'Faculty & Staff', desc: 'Review, approve, or forward requests assigned to your department.' },
              { label: 'Administrators', desc: 'Manage schools, categories, workflows, and users from the admin panel.' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col gap-1.5">
                <p className="font-semibold text-gray-800 text-sm">{item.label}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#8B1A1A' }} className="mt-auto">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white font-bold text-base" style={{ fontFamily: 'Georgia, serif' }}>MR One</p>
            <p className="text-[#f5c6c6] text-xs mt-0.5">Manav Rachna University · Faridabad, Haryana</p>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/privacy-policy" className="text-[#f5c6c6] hover:text-white text-xs transition-colors">
              Privacy Policy
            </Link>
            <Link href="/delete-account" className="text-[#f5c6c6] hover:text-white text-xs transition-colors">
              Delete Account
            </Link>
            <Link href="/login" className="text-[#f5c6c6] hover:text-white text-xs transition-colors">
              Admin Login
            </Link>
          </div>
        </div>
        <div className="border-t border-[#6e1414]">
          <p className="text-center text-[#b54444] text-xs py-3">
            © {new Date().getFullYear()} Manav Rachna University. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
