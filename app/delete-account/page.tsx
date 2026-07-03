export const metadata = {
  title: 'Delete Account — OneSTOP, Manav Rachna University',
};

export default function DeleteAccountPage() {
  return (
    <div className="min-h-screen bg-[#f7f5f5]">
      {/* Header */}
      <header className="bg-[#8B1A1A] text-white">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <p className="text-[#f5c6c6] text-xs font-medium tracking-widest uppercase mb-3">
            Manav Rachna University
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Delete Your Account</h1>
          <p className="mt-2 text-[#f5c6c6] text-sm">OneSTOP — Student Workflow Platform</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-6">

        {/* Intro */}
        <p className="text-gray-600 text-[15px] leading-relaxed border-l-4 border-[#8B1A1A] pl-4">
          You may request permanent deletion of your OneSTOP account at any time by contacting
          our support team. Requests are processed within 7 working days after identity verification.
        </p>

        {/* How to request */}
        <section className="bg-white rounded-xl border border-[#ecdada] shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-[#ecdada] bg-[#fdf8f8]">
            <span className="w-1 h-5 rounded-full bg-[#8B1A1A] inline-block flex-shrink-0" />
            <h2 className="text-[15px] font-semibold text-gray-900">How to Request Account Deletion</h2>
          </div>
          <div className="px-6 py-5 flex flex-col gap-4">
            {[
              { step: '1', text: 'Send an email to onestopsolution@mru.edu.in with the subject line: Account Deletion Request' },
              { step: '2', text: 'Include your University Registration Number and the email address registered with OneSTOP.' },
              { step: '3', text: 'Our team will verify your identity and process the deletion within 7 working days.' },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-start gap-4">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#8B1A1A] text-white text-xs font-bold flex items-center justify-center mt-0.5">
                  {step}
                </span>
                <p className="text-sm text-gray-600 leading-relaxed pt-1">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What gets deleted */}
        <section className="bg-white rounded-xl border border-[#ecdada] shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-[#ecdada] bg-[#fdf8f8]">
            <span className="w-1 h-5 rounded-full bg-[#8B1A1A] inline-block flex-shrink-0" />
            <h2 className="text-[15px] font-semibold text-gray-900">What Data Will Be Deleted</h2>
          </div>
          <div className="px-6 py-5">
            <ul className="flex flex-col gap-2">
              {[
                'Your account profile — name, email address, and registration number',
                'Login credentials and session tokens',
                'Push notification tokens',
                'Personal information associated with your account',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600 leading-relaxed">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#8B1A1A] flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* What may be retained */}
        <section className="bg-white rounded-xl border border-[#ecdada] shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-[#ecdada] bg-[#fdf8f8]">
            <span className="w-1 h-5 rounded-full bg-[#8B1A1A] inline-block flex-shrink-0" />
            <h2 className="text-[15px] font-semibold text-gray-900">What Data May Be Retained</h2>
          </div>
          <div className="px-6 py-5 flex flex-col gap-3">
            <p className="text-sm text-gray-600 leading-relaxed">
              Certain records may be retained where required by university policy, legal obligations,
              or administrative requirements:
            </p>
            <ul className="flex flex-col gap-2">
              {[
                'Service requests and their resolution history (for institutional audit purposes)',
                'Uploaded documents related to processed requests',
                'Anonymised usage data used for platform improvement',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600 leading-relaxed">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="bg-[#8B1A1A] rounded-xl shadow-sm text-white px-6 py-6 flex flex-col gap-4">
          <div>
            <h2 className="text-[15px] font-semibold mb-1">Contact to Request Deletion</h2>
            <p className="text-[#f5c6c6] text-sm leading-relaxed">
              Send your request directly to our support team:
            </p>
          </div>
          <div className="bg-[#6e1414] rounded-lg px-5 py-4 flex flex-col gap-1.5">
            <p className="text-xs text-[#f5c6c6] uppercase tracking-widest font-medium">Email</p>
            <a
              href="mailto:onestopsolution@mru.edu.in?subject=Account%20Deletion%20Request"
              className="text-white font-medium text-sm underline underline-offset-2 hover:text-[#f9d9d9] transition-colors"
            >
              onestopsolution@mru.edu.in
            </a>
            <p className="text-xs text-[#f5c6c6] mt-1">Subject: <span className="text-white">Account Deletion Request</span></p>
          </div>
          <p className="text-[#f5c6c6] text-xs leading-relaxed">
            Please include your University Registration Number and registered email address in the message body.
          </p>
        </section>

        <p className="text-center text-xs text-gray-400 pb-4">
          © {new Date().getFullYear()} Manav Rachna University · OneSTOP
        </p>
      </main>
    </div>
  );
}
