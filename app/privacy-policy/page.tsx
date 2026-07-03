export const metadata = {
  title: 'Privacy Policy — OneSTOP, Manav Rachna University',
};

const sections = [
  {
    id: 'collect',
    title: 'Information We Collect',
    content: null,
    list: [
      'Student name and university email address',
      'Enrollment or registration number',
      'School or department',
      'Service requests submitted through the application',
      'Documents and files uploaded as attachments',
      'Device notification token (for push notifications)',
    ],
  },
  {
    id: 'use',
    title: 'How We Use Your Information',
    content: 'Your information is used solely to operate the platform:',
    list: [
      'Authenticate users through OTP-based login',
      'Process and manage university service requests',
      'Route requests to the appropriate university department',
      'Send notifications about request status and approvals',
      'Improve application performance and reliability',
    ],
  },
  {
    id: 'uploads',
    title: 'File Uploads',
    content:
      'Documents uploaded by users are securely stored using Amazon Web Services (AWS S3). Files are accessible only to authorised university personnel directly involved in processing the relevant request.',
    list: null,
  },
  {
    id: 'security',
    title: 'Data Security',
    content:
      'We implement reasonable administrative and technical safeguards to protect user information, including secure OTP-based authentication and encrypted communication (HTTPS) across all endpoints.',
    list: null,
  },
  {
    id: 'sharing',
    title: 'Data Sharing',
    content: null,
    list: [
      'OneSTOP does not sell or share personal information with third parties for advertising or commercial purposes.',
      'Information is shared only with authorised university officials responsible for processing student requests.',
    ],
  },
  {
    id: 'notifications',
    title: 'Notifications',
    content:
      'The application may send push notifications and email notifications for OTP verification, request submissions, status updates, approvals, and other service-related communications.',
    list: null,
  },
  {
    id: 'retention',
    title: 'Data Retention',
    content:
      'Information is retained only for as long as necessary to deliver university services or to comply with institutional requirements. Requests and associated documents may be archived in accordance with university policy.',
    list: null,
  },
  {
    id: 'changes',
    title: 'Changes to This Policy',
    content:
      'This Privacy Policy may be updated periodically to reflect changes in our practices or applicable regulations. Continued use of the application after any update constitutes acceptance of the revised policy. The effective date at the top of this page will always reflect the most recent revision.',
    list: null,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#f7f5f5]">
      {/* Header */}
      <header className="bg-[#8B1A1A] text-white">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <p className="text-[#f5c6c6] text-xs font-medium tracking-widest uppercase mb-3">
            Manav Rachna University
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="mt-2 text-[#f5c6c6] text-sm">OneSTOP — Student Workflow Platform</p>
          <p className="mt-5 inline-block bg-[#6e1414] text-[#f5c6c6] text-xs px-3 py-1 rounded-full">
            Effective Date: July 2026
          </p>
        </div>
      </header>

      {/* Intro */}
      <div className="max-w-3xl mx-auto px-6 pt-10 pb-2">
        <p className="text-gray-600 text-[15px] leading-relaxed border-l-4 border-[#8B1A1A] pl-4">
          OneSTOP is the official student workflow automation platform developed for Manav Rachna
          University. This Privacy Policy explains how the application collects, uses, stores, and
          protects user information.
        </p>
      </div>

      {/* Sections */}
      <main className="max-w-3xl mx-auto px-6 py-8 flex flex-col gap-8">
        {sections.map((s) => (
          <section key={s.id} className="bg-white rounded-xl border border-[#ecdada] shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-[#ecdada] bg-[#fdf8f8]">
              <span className="w-1 h-5 rounded-full bg-[#8B1A1A] inline-block flex-shrink-0" />
              <h2 className="text-[15px] font-semibold text-gray-900">{s.title}</h2>
            </div>
            <div className="px-6 py-5 flex flex-col gap-3">
              {s.content && (
                <p className="text-gray-600 text-sm leading-relaxed">{s.content}</p>
              )}
              {s.list && (
                <ul className="flex flex-col gap-2">
                  {s.list.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600 leading-relaxed">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#8B1A1A] flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ))}

        {/* Contact */}
        <section className="bg-[#8B1A1A] rounded-xl shadow-sm overflow-hidden text-white">
          <div className="px-6 py-5">
            <h2 className="text-[15px] font-semibold mb-3">Contact</h2>
            <p className="text-[#f5c6c6] text-sm leading-relaxed mb-4">
              For questions or concerns regarding this Privacy Policy, please reach out:
            </p>
            <div className="flex flex-col gap-1.5 text-sm">
              <p className="font-medium">OneSTOP Support</p>
              <a
                href="mailto:onestopsolution@mru.edu.in"
                className="text-[#f9d9d9] underline underline-offset-2 hover:text-white transition-colors"
              >
                onestopsolution@mru.edu.in
              </a>
              <p className="text-[#f5c6c6] mt-1">Manav Rachna University</p>
            </div>
          </div>
        </section>

        <p className="text-center text-xs text-gray-400 pb-4">
          © {new Date().getFullYear()} Manav Rachna University · OneSTOP
        </p>
      </main>
    </div>
  );
}
