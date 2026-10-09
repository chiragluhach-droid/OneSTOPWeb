'use client';
import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import { fieldClass } from '@/components/ui';

type School = { _id: string; name: string; code: string; studentCount: number };
type StaffRole = { role: string; count: number };
type Audiences = {
  schools: School[];
  departments: string[];
  staffRoles: StaffRole[];
  totals: { students: number; staff: number };
};
type Preview = { students: number; staff: number; total: number; withDevices: number };
type Broadcast = {
  _id: string;
  title: string;
  body: string;
  audience: 'students' | 'staff' | 'both';
  recipients: number;
  recorded: number;
  devices: number;
  pushed: number;
  failed: number;
  status: 'sent' | 'partial' | 'failed';
  sentByEmail?: string;
  createdAt: string;
  filters?: { schoolIds?: { name: string; code: string }[]; staffRoles?: string[]; studentEmails?: string[]; staffEmails?: string[] };
};

const CARD = 'bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6';
const MAX_TITLE = 100;
const MAX_BODY = 500;

const ROLE_LABELS: Record<string, string> = {
  dsw: 'Student Welfare desk',
  dean: 'Deans',
  hod: 'HODs',
  staff: 'Directors & other staff',
};

const STATUS_STYLES: Record<string, string> = {
  sent: 'bg-green-100 text-green-700',
  partial: 'bg-amber-100 text-amber-700',
  failed: 'bg-red-100 text-red-700',
};

const splitEmails = (v: string) =>
  v.split(/[\s,;]+/).map((e) => e.trim()).filter(Boolean);

export default function BroadcastsPage() {
  const [loading, setLoading] = useState(true);
  const [audiences, setAudiences] = useState<Audiences | null>(null);
  const [history, setHistory] = useState<Broadcast[]>([]);

  const [audience, setAudience] = useState<'students' | 'staff' | 'both'>('students');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [schoolIds, setSchoolIds] = useState<string[]>([]);
  const [staffRoles, setStaffRoles] = useState<string[]>([]);
  const [studentEmailsRaw, setStudentEmailsRaw] = useState('');
  const [staffEmailsRaw, setStaffEmailsRaw] = useState('');

  const [preview, setPreview] = useState<Preview | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const wantsStudents = audience === 'students' || audience === 'both';
  const wantsStaff = audience === 'staff' || audience === 'both';

  const studentEmails = useMemo(() => splitEmails(studentEmailsRaw), [studentEmailsRaw]);
  const staffEmails = useMemo(() => splitEmails(staffEmailsRaw), [staffEmailsRaw]);

  const payload = useMemo(() => ({
    audience,
    title: title.trim(),
    body: body.trim(),
    schoolIds: wantsStudents ? schoolIds : [],
    staffRoles: wantsStaff ? staffRoles : [],
    studentEmails: wantsStudents ? studentEmails : [],
    staffEmails: wantsStaff ? staffEmails : [],
  }), [audience, title, body, schoolIds, staffRoles, studentEmails, staffEmails, wantsStudents, wantsStaff]);

  const loadHistory = async () => {
    try {
      const res = await api.get('/admin/broadcasts?limit=10');
      setHistory(res.data?.data?.broadcasts || []);
    } catch { /* history is non-essential */ }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/admin/broadcasts/audiences');
        setAudiences(res.data?.data || null);
      } catch {
        setErr('Could not load the audience list. Reload to try again.');
      } finally {
        setLoading(false);
      }
      loadHistory();
    })();
  }, []);

  // Any change to the selection invalidates the count, so the send button
  // cannot be armed by a preview of a different audience.
  useEffect(() => { setPreview(null); setConfirming(false); }, [
    audience, schoolIds, staffRoles, studentEmailsRaw, staffEmailsRaw,
  ]);

  const flash = (t: string) => { setErr(''); setMsg(t); setTimeout(() => setMsg(''), 6000); };
  const fail = (e: unknown, fallback: string) => {
    setMsg('');
    const r = e as { response?: { data?: { message?: string } } };
    setErr(r?.response?.data?.message || fallback);
    setTimeout(() => setErr(''), 8000);
  };

  const toggle = (list: string[], value: string, set: (v: string[]) => void) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const runPreview = async () => {
    setPreviewing(true);
    try {
      const res = await api.post('/admin/broadcasts/preview', payload);
      setPreview(res.data?.data || null);
    } catch (e) {
      fail(e, 'Could not work out who this would reach');
    } finally {
      setPreviewing(false);
    }
  };

  const send = async () => {
    setSending(true);
    try {
      const res = await api.post('/admin/broadcasts', payload);
      flash(res.data?.message || 'Announcement sent.');
      setTitle(''); setBody(''); setSchoolIds([]); setStaffRoles([]);
      setStudentEmailsRaw(''); setStaffEmailsRaw('');
      setPreview(null); setConfirming(false);
      loadHistory();
    } catch (e) {
      fail(e, 'Could not send the announcement');
    } finally {
      setSending(false);
    }
  };

  const contentValid = title.trim().length >= 3 && body.trim().length >= 3;
  const canSend = contentValid && preview !== null && preview.total > 0 && !sending;

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#8B1A1A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Announcements</h1>
      <p className="text-sm text-gray-500 mb-8">
        Send a push notification to students or staff. It appears in the app and on their phone.
      </p>

      {msg && <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium">✓ {msg}</div>}
      {err && <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">✗ {err}</div>}

      {/* ── Compose ── */}
      <div className={CARD}>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Compose</h2>
        <p className="text-xs text-gray-400 mb-5">
          Keep it short — a phone shows roughly two lines before it is cut off.
        </p>

        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE))}
          placeholder="e.g. Library closing early"
          className={fieldClass}
        />
        <p className="text-xs text-gray-400 mt-1 mb-4">{title.length}/{MAX_TITLE}</p>

        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value.slice(0, MAX_BODY))}
          rows={3}
          placeholder="e.g. The central library will shut at 6pm today for maintenance."
          className={`${fieldClass} resize-y`}
        />
        <p className="text-xs text-gray-400 mt-1">{body.length}/{MAX_BODY}</p>

        {/* Phone preview */}
        {contentValid && (
          <div className="mt-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">How it will look</p>
            <div className="bg-gray-100 rounded-xl p-3">
              <div className="bg-white rounded-lg shadow-sm px-3.5 py-3 flex gap-3 items-start">
                <div className="w-8 h-8 rounded-lg bg-[#8B1A1A] text-white flex items-center justify-center text-xs font-bold shrink-0">MR</div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{title.trim()}</p>
                  <p className="text-xs text-gray-600 line-clamp-2 break-words">{body.trim()}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Audience ── */}
      <div className={CARD}>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Who gets it</h2>
        <p className="text-xs text-gray-400 mb-4">
          {audiences
            ? `${audiences.totals.students.toLocaleString()} students and ${audiences.totals.staff} staff are active.`
            : ''}
        </p>

        <div className="grid grid-cols-3 gap-3 mb-5">
          {([
            { id: 'students', label: 'All students', hint: audiences ? `${audiences.totals.students.toLocaleString()} people` : '' },
            { id: 'staff', label: 'All staff', hint: audiences ? `${audiences.totals.staff} people` : '' },
            { id: 'both', label: 'Everyone', hint: 'Students + staff' },
          ] as const).map((opt) => (
            <button
              key={opt.id}
              onClick={() => setAudience(opt.id)}
              className={`text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                audience === opt.id
                  ? 'border-[#8B1A1A] bg-[#8B1A1A]/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="text-sm font-semibold text-gray-900">{opt.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{opt.hint}</p>
            </button>
          ))}
        </div>

        {wantsStudents && (
          <div className="border-t border-gray-100 pt-5">
            <p className="text-sm font-medium text-gray-700 mb-1">Narrow to schools <span className="text-gray-400 font-normal">(optional)</span></p>
            <p className="text-xs text-gray-400 mb-3">Leave all unticked to reach every student.</p>
            <div className="flex flex-wrap gap-2">
              {audiences?.schools.map((s) => (
                <button
                  key={s._id}
                  onClick={() => toggle(schoolIds, s._id, setSchoolIds)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    schoolIds.includes(s._id)
                      ? 'bg-[#8B1A1A] text-white border-[#8B1A1A]'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {s.code} · {s.studentCount.toLocaleString()}
                </button>
              ))}
            </div>

            <p className="text-sm font-medium text-gray-700 mt-5 mb-1">Or name specific students</p>
            <p className="text-xs text-gray-400 mb-2">
              Email addresses, separated by commas or new lines. This overrides the school filter.
            </p>
            <textarea
              value={studentEmailsRaw}
              onChange={(e) => setStudentEmailsRaw(e.target.value)}
              rows={2}
              placeholder="sharin_26@mru.ac.in, aarushi_sharma22@mru.ac.in"
              className={`${fieldClass} resize-y font-mono text-xs`}
            />
            {studentEmails.length > 0 && (
              <p className="text-xs text-[#8B1A1A] mt-1 font-medium">{studentEmails.length} address(es) entered</p>
            )}
          </div>
        )}

        {wantsStaff && (
          <div className="border-t border-gray-100 pt-5 mt-5">
            <p className="text-sm font-medium text-gray-700 mb-1">Narrow to staff roles <span className="text-gray-400 font-normal">(optional)</span></p>
            <p className="text-xs text-gray-400 mb-3">Leave all unticked to reach every staff member.</p>
            <div className="flex flex-wrap gap-2">
              {audiences?.staffRoles.map((r) => (
                <button
                  key={r.role}
                  onClick={() => toggle(staffRoles, r.role, setStaffRoles)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    staffRoles.includes(r.role)
                      ? 'bg-[#8B1A1A] text-white border-[#8B1A1A]'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {ROLE_LABELS[r.role] || r.role} · {r.count}
                </button>
              ))}
            </div>

            <p className="text-sm font-medium text-gray-700 mt-5 mb-1">Or name specific staff</p>
            <textarea
              value={staffEmailsRaw}
              onChange={(e) => setStaffEmailsRaw(e.target.value)}
              rows={2}
              placeholder="deanengg@mru.edu.in, hodcst@mru.edu.in"
              className={`${fieldClass} resize-y font-mono text-xs`}
            />
            {staffEmails.length > 0 && (
              <p className="text-xs text-[#8B1A1A] mt-1 font-medium">{staffEmails.length} address(es) entered</p>
            )}
          </div>
        )}
      </div>

      {/* ── Check and send ── */}
      <div className={CARD}>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Check and send</h2>
        <p className="text-xs text-gray-400 mb-4">
          An announcement cannot be recalled, so check the numbers before sending.
        </p>

        <button
          onClick={runPreview}
          disabled={previewing}
          className="px-5 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {previewing ? 'Counting…' : 'Count recipients'}
        </button>

        {preview && (
          <div className="mt-5">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Students', value: preview.students },
                { label: 'Staff', value: preview.staff },
                { label: 'Total people', value: preview.total },
              ].map((s) => (
                <div key={s.label} className="bg-gray-50 rounded-lg px-4 py-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">{s.label}</p>
                  <p className="text-xl font-bold text-gray-900 mt-0.5">{s.value.toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
              <p className="text-xs text-blue-800 leading-relaxed">
                <strong>{preview.withDevices.toLocaleString()}</strong> of these have the app installed with
                notifications on, so that is roughly how many phones will buzz. Everyone counted above gets the
                announcement inside the app regardless.
              </p>
            </div>

            {preview.total === 0 && (
              <p className="mt-3 text-sm text-red-600 font-medium">
                That selection matches nobody. Widen it and count again.
              </p>
            )}

            {preview.total > 0 && !confirming && (
              <button
                onClick={() => setConfirming(true)}
                disabled={!contentValid}
                className="mt-5 px-5 py-2.5 bg-[#8B1A1A] text-white rounded-lg text-sm font-semibold hover:bg-[#6e1515] disabled:opacity-50 transition-colors"
              >
                Send to {preview.total.toLocaleString()} {preview.total === 1 ? 'person' : 'people'}
              </button>
            )}
            {!contentValid && (
              <p className="mt-2 text-xs text-gray-400">Add a title and message first.</p>
            )}

            {confirming && (
              <div className="mt-5 bg-amber-50 border border-amber-300 rounded-lg p-5">
                <p className="text-sm font-semibold text-amber-900">
                  Send “{title.trim()}” to {preview.total.toLocaleString()} {preview.total === 1 ? 'person' : 'people'}?
                </p>
                <p className="text-xs text-amber-800 mt-1">This cannot be undone.</p>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={send}
                    disabled={!canSend}
                    className="px-5 py-2.5 bg-[#8B1A1A] text-white rounded-lg text-sm font-semibold hover:bg-[#6e1515] disabled:opacity-50 transition-colors"
                  >
                    {sending ? 'Sending…' : 'Yes, send it'}
                  </button>
                  <button
                    onClick={() => setConfirming(false)}
                    disabled={sending}
                    className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── History ── */}
      <div className={CARD}>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Recently sent</h2>
        <p className="text-xs text-gray-400 mb-4">The last 10 announcements.</p>

        {history.length === 0 ? (
          <p className="text-sm text-gray-400 py-4">Nothing sent yet.</p>
        ) : (
          <div className="space-y-3">
            {history.map((b) => (
              <div key={b._id} className="border border-gray-200 rounded-lg px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{b.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{b.body}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${STATUS_STYLES[b.status] || ''}`}>
                    {b.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(b.createdAt).toLocaleString('en-IN')} · {b.audience} ·{' '}
                  {b.recipients.toLocaleString()} {b.recipients === 1 ? 'person' : 'people'} ·{' '}
                  {b.pushed.toLocaleString()} {b.pushed === 1 ? 'device' : 'devices'} notified
                  {b.failed > 0 ? ` · ${b.failed} failed` : ''}
                  {b.sentByEmail ? ` · by ${b.sentByEmail}` : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
