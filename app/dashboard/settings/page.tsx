'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

type Escalation = {
  enabled: boolean;
  recipientEmail: string;
  recipientLabel: string;
  intakeHours: number;
  forwardedHours: number;
  reportingChain: boolean;
  finalAuthorityEmail: string;
  finalAuthorityLabel: string;
};

type WorkingTime = {
  enabled: boolean;
  workingDays: number[];
  holidays: string[];
  timezone?: string;
};

type AutoReply = {
  enabled: boolean;
  message: string;
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

type Reopen = {
  enabled: boolean;
  withinDays: number;
  maxTimes: number;
};

type AppVersion = {
  minVersion: string;
  enforced: boolean;
  message: string;
  iosUrl: string;
  androidUrl: string;
};

const CARD = 'bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6';
const INPUT =
  'w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none';
const SAVE_BTN =
  'mt-5 px-5 py-2 bg-[#8B1A1A] text-white rounded-lg text-sm font-medium hover:bg-[#6e1515] disabled:opacity-50 transition-colors';

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#8B1A1A] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all" />
    </label>
  );
}

const hoursLabel = (h: number) => `${h} hour${h === 1 ? '' : 's'}`;

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const [studentServicesEnabled, setStudentServicesEnabled] = useState(true);
  const [routing, setRouting] = useState({ intakeEmail: '', intakeLabel: '' });

  const [escalation, setEscalation] = useState<Escalation>({
    enabled: true,
    recipientEmail: '',
    recipientLabel: 'Dean of Student Welfare',
    intakeHours: 3,
    forwardedHours: 48,
    reportingChain: true,
    finalAuthorityEmail: '',
    finalAuthorityLabel: 'Vice Chancellor',
  });

  const [workingTime, setWorkingTime] = useState<WorkingTime>({
    enabled: true,
    workingDays: [1, 2, 3, 4, 5],
    holidays: [],
  });
  const [newHoliday, setNewHoliday] = useState('');

  const [autoReply, setAutoReply] = useState<AutoReply>({ enabled: true, message: '' });

  const [reopen, setReopen] = useState<Reopen>({ enabled: true, withinDays: 7, maxTimes: 2 });

  const [appVersion, setAppVersion] = useState<AppVersion>({
    minVersion: '',
    enforced: false,
    message: 'A newer version of MR One is required to continue.',
    iosUrl: '',
    androidUrl: '',
  });

  useEffect(() => {
    (async () => {
      try {
        const [featRes, routRes, escRes, reopenRes, verRes, workRes, replyRes] = await Promise.all([
          api.get('/settings/features'),
          api.get('/settings/routing'),
          api.get('/settings/escalation'),
          api.get('/settings/reopen'),
          api.get('/settings/app-version'),
          api.get('/settings/working-time'),
          api.get('/settings/auto-reply'),
        ]);
        if (featRes.data?.data?.features) {
          setStudentServicesEnabled(featRes.data.data.features.studentServicesEnabled ?? true);
        }
        if (routRes.data?.data?.routing) setRouting(routRes.data.data.routing);
        if (escRes.data?.data?.escalation) setEscalation(escRes.data.data.escalation);
        if (reopenRes.data?.data?.reopen) setReopen(reopenRes.data.data.reopen);
        if (verRes.data?.data?.appVersion) setAppVersion(verRes.data.data.appVersion);
        if (workRes.data?.data?.workingTime) setWorkingTime(workRes.data.data.workingTime);
        if (replyRes.data?.data?.autoReply) setAutoReply(replyRes.data.data.autoReply);
      } catch (e) {
        console.error('Failed to load settings:', e);
        setErr('Some settings could not be loaded. Reload the page to try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const flash = (text: string) => {
    setErr('');
    setMsg(text);
    setTimeout(() => setMsg(''), 3000);
  };

  const fail = (e: unknown, fallback: string) => {
    setMsg('');
    const resp = e as { response?: { data?: { message?: string } } };
    setErr(resp?.response?.data?.message || fallback);
    setTimeout(() => setErr(''), 6000);
  };

  const save = async (fn: () => Promise<void>, okText: string, failText: string) => {
    setSaving(true);
    try {
      await fn();
      flash(okText);
    } catch (e) {
      fail(e, failText);
    } finally {
      setSaving(false);
    }
  };

  const saveFeatures = () =>
    save(
      async () => { await api.patch('/settings/features', { studentServicesEnabled }); },
      'Feature flags saved.',
      'Failed to save features'
    );

  const saveEscalation = () =>
    save(
      async () => {
        const res = await api.patch('/settings/escalation', {
          enabled: escalation.enabled,
          recipientEmail: escalation.recipientEmail,
          recipientLabel: escalation.recipientLabel,
          intakeHours: Number(escalation.intakeHours),
          forwardedHours: Number(escalation.forwardedHours),
          reportingChain: escalation.reportingChain,
          finalAuthorityEmail: escalation.finalAuthorityEmail,
          finalAuthorityLabel: escalation.finalAuthorityLabel,
        });
        if (res.data?.data?.escalation) setEscalation(res.data.data.escalation);
      },
      'SLA & escalation settings saved.',
      'Failed to save escalation settings'
    );

  const saveReopen = () =>
    save(
      async () => {
        const res = await api.patch('/settings/reopen', {
          enabled: reopen.enabled,
          withinDays: Number(reopen.withinDays),
          maxTimes: Number(reopen.maxTimes),
        });
        if (res.data?.data?.reopen) setReopen(res.data.data.reopen);
      },
      'Reopen policy saved.',
      'Failed to save reopen policy'
    );

  const saveWorkingTime = () =>
    save(
      async () => {
        const res = await api.patch('/settings/working-time', {
          enabled: workingTime.enabled,
          workingDays: workingTime.workingDays,
          holidays: workingTime.holidays,
        });
        if (res.data?.data?.workingTime) setWorkingTime(res.data.data.workingTime);
      },
      'Working days saved.',
      'Failed to save working days'
    );

  const saveAutoReply = () =>
    save(
      async () => {
        const res = await api.patch('/settings/auto-reply', {
          enabled: autoReply.enabled,
          message: autoReply.message,
        });
        if (res.data?.data?.autoReply) setAutoReply(res.data.data.autoReply);
      },
      'Automatic reply saved.',
      'Failed to save automatic reply'
    );

  const toggleWorkingDay = (day: number) =>
    setWorkingTime((w) => {
      const on = w.workingDays.includes(day);
      // At least one day has to count, or every response window would freeze.
      if (on && w.workingDays.length === 1) return w;
      return {
        ...w,
        workingDays: on ? w.workingDays.filter((d) => d !== day) : [...w.workingDays, day].sort(),
      };
    });

  const saveAppVersion = () =>
    save(
      async () => {
        const res = await api.patch('/settings/app-version', appVersion);
        if (res.data?.data?.appVersion) setAppVersion(res.data.data.appVersion);
      },
      'App version settings saved.',
      'Failed to save app version settings'
    );

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#8B1A1A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
      <p className="text-sm text-gray-500 mb-8">Configure system-wide settings for MR One.</p>

      {msg && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium">
          ✓ {msg}
        </div>
      )}
      {err && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
          ✗ {err}
        </div>
      )}

      {/* ── Feature Flags ── */}
      <div className={CARD}>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Feature Flags</h2>
        <p className="text-xs text-gray-400 mb-4">Toggle features on/off for the mobile app.</p>

        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-800">Student Services</p>
            <p className="text-xs text-gray-400 mt-0.5">When disabled, the mobile app shows a &quot;Coming Soon&quot; screen.</p>
          </div>
          <Toggle checked={studentServicesEnabled} onChange={setStudentServicesEnabled} />
        </div>

        <button onClick={saveFeatures} disabled={saving} className={SAVE_BTN}>Save Features</button>
      </div>

      {/* ── Routing Info ── */}
      <div className={CARD}>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Request Routing</h2>
        <p className="text-xs text-gray-400 mb-4">
          Where new student requests land first. Configured via environment variables on the server.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Intake Email</p>
            <p className="text-sm font-medium text-gray-800 bg-gray-50 px-3 py-2 rounded-lg">{routing.intakeEmail || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Intake Label</p>
            <p className="text-sm font-medium text-gray-800 bg-gray-50 px-3 py-2 rounded-lg">{routing.intakeLabel || '—'}</p>
          </div>
        </div>
      </div>

      {/* ── SLA & Auto-Escalation ── */}
      <div className={CARD}>
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Response Times &amp; Auto-Escalation</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Two clocks: the One Stop desk only triages, so it gets hours. A dean or HOD has to act, so they get longer.
            </p>
          </div>
          <div className="mt-1">
            <Toggle checked={escalation.enabled} onChange={(v) => setEscalation({ ...escalation, enabled: v })} />
          </div>
        </div>

        {escalation.enabled && (
          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">One Stop desk (hours)</label>
                <input
                  type="number" min={1} max={720}
                  value={escalation.intakeHours}
                  onChange={(e) => setEscalation({ ...escalation, intakeHours: parseInt(e.target.value) || 1 })}
                  className={INPUT}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Time the desk has to resolve, forward, or mark a new request in progress. Default: 3.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deans / HODs (hours)</label>
                <input
                  type="number" min={1} max={720}
                  value={escalation.forwardedHours}
                  onChange={(e) => setEscalation({ ...escalation, forwardedHours: parseInt(e.target.value) || 1 })}
                  className={INPUT}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Time anyone the request is forwarded to has to act. Default: 48.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Escalate To (Email)</label>
              <input
                type="email"
                value={escalation.recipientEmail}
                onChange={(e) => setEscalation({ ...escalation, recipientEmail: e.target.value })}
                placeholder="e.g. deanstudents@mru.edu.in"
                className={INPUT}
              />
              <p className="text-xs text-gray-400 mt-1">
                The higher authority told when nobody acts in time.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Their Designation</label>
              <input
                type="text"
                value={escalation.recipientLabel}
                onChange={(e) => setEscalation({ ...escalation, recipientLabel: e.target.value })}
                placeholder="e.g. Dean of Student Welfare"
                className={INPUT}
              />
              <p className="text-xs text-gray-400 mt-1">
                Signed against their messages in the Reply / Forward emails.
              </p>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-800">Escalate up the reporting chain</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Send an overdue concern to the holder&apos;s own reporting authority — an HOD&apos;s dean, say —
                    instead of sending every escalation to one mailbox.
                  </p>
                </div>
                <div className="mt-1 shrink-0">
                  <Toggle
                    checked={escalation.reportingChain}
                    onChange={(v) => setEscalation({ ...escalation, reportingChain: v })}
                  />
                </div>
              </div>

              {escalation.reportingChain && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Final authority (email)</label>
                    <input
                      type="email"
                      value={escalation.finalAuthorityEmail}
                      onChange={(e) => setEscalation({ ...escalation, finalAuthorityEmail: e.target.value })}
                      placeholder="e.g. vc@mru.edu.in"
                      className={INPUT}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Told only when <strong>{escalation.recipientLabel || 'the escalation authority'}</strong> is
                      the one who has not acted. Leave blank to stop the chain there.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Their designation</label>
                    <input
                      type="text"
                      value={escalation.finalAuthorityLabel}
                      onChange={(e) => setEscalation({ ...escalation, finalAuthorityLabel: e.target.value })}
                      placeholder="e.g. Vice Chancellor"
                      className={INPUT}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 mt-2">
              <p className="text-sm font-semibold text-amber-900 mb-3">📌 How escalation works</p>
              <ol className="text-xs text-amber-800 leading-relaxed space-y-2 list-decimal list-inside">
                <li>
                  A student submits a request → it goes to the <strong>One Stop desk</strong>, and the request shows as <strong>Pending</strong>.
                </li>
                <li>
                  If the desk does not resolve, forward, or mark it in progress within{' '}
                  <strong>{hoursLabel(escalation.intakeHours)}</strong>, it is escalated to{' '}
                  <strong>{escalation.recipientEmail || '(email not set yet)'}</strong>.
                </li>
                <li>
                  While the desk is working on it themselves the request shows as <strong>In Progress</strong>.
                  The moment it is forwarded to a dean, HOD or director it becomes <strong>In Review</strong> and
                  stays there until it is <strong>Resolved</strong>.
                </li>
                <li>
                  A forwarded dean / HOD / director who does not act within{' '}
                  <strong>{hoursLabel(escalation.forwardedHours)}</strong> is escalated too —{' '}
                  {escalation.reportingChain
                    ? <>to <strong>their own reporting authority</strong> (an HOD goes to their school&apos;s dean, a dean to{' '}
                      {escalation.recipientLabel || 'the escalation authority'}), so the office at the top only hears
                      about the exceptions.</>
                    : <>to the same address.</>}
                </li>
                {workingTime.enabled && (
                  <li>
                    These windows are counted in <strong>working time</strong>. A concern raised on Friday afternoon
                    with a {hoursLabel(escalation.forwardedHours)} window is not overdue until Tuesday — the weekend
                    is not counted.
                  </li>
                )}
                <li>
                  The escalation email names <strong>the designation and email of whoever did not act</strong>, when they
                  were notified, and carries a message box with <strong>Reply</strong> (back to the One Stop desk) and{' '}
                  <strong>Forward</strong> (to the person holding it, One Stop copied).
                </li>
                <li>
                  Marking a request in progress satisfies the current window and starts a fresh one, so an acknowledged
                  concern that is then abandoned still surfaces.
                </li>
              </ol>
              <p className="text-xs text-amber-700 mt-3 italic">
                💡 New settings apply to every request created from the moment you save. Requests already in flight keep
                the window they were created with.
              </p>
            </div>
          </div>
        )}

        <button onClick={saveEscalation} disabled={saving} className={SAVE_BTN}>Save Response Times</button>
      </div>

      {/* ── Working Days ── */}
      <div className={CARD}>
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Working Days</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Response windows are counted in working time, so a concern raised on a Friday is not overdue
              before the university reopens.
            </p>
          </div>
          <div className="mt-1">
            <Toggle checked={workingTime.enabled} onChange={(v) => setWorkingTime({ ...workingTime, enabled: v })} />
          </div>
        </div>

        {workingTime.enabled && (
          <div className="mt-5 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Days the university works</label>
              <div className="flex flex-wrap gap-2">
                {DAY_NAMES.map((name, day) => {
                  const on = workingTime.workingDays.includes(day);
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => toggleWorkingDay(day)}
                      aria-pressed={on}
                      className={`px-3.5 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
                        on
                          ? 'bg-[#8B1A1A] text-white border-[#8B1A1A]'
                          : 'bg-white text-gray-500 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {name.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Time on an unselected day does not count towards any response window.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">University holidays</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={newHoliday}
                  onChange={(e) => setNewHoliday(e.target.value)}
                  className={INPUT}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newHoliday || workingTime.holidays.includes(newHoliday)) return;
                    setWorkingTime({ ...workingTime, holidays: [...workingTime.holidays, newHoliday].sort() });
                    setNewHoliday('');
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 whitespace-nowrap cursor-pointer"
                >
                  Add
                </button>
              </div>

              {workingTime.holidays.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-3">
                  {workingTime.holidays.map((d) => (
                    <span key={d} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-sm text-gray-700">
                      {d}
                      <button
                        type="button"
                        onClick={() => setWorkingTime({ ...workingTime, holidays: workingTime.holidays.filter((h) => h !== d) })}
                        className="text-gray-400 hover:text-red-600 cursor-pointer"
                        aria-label={`Remove ${d}`}
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 mt-2">No holidays declared. Weekends are already excluded above.</p>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
              <p className="text-sm font-semibold text-amber-900 mb-2">📌 What this changes</p>
              <p className="text-xs text-amber-800 leading-relaxed">
                A concern raised <strong>Friday at 4pm</strong> with a {hoursLabel(escalation.forwardedHours)} window
                now falls due <strong>Tuesday at 4pm</strong>, not Sunday. The same rule is used to judge whether a
                window was met, so the Super Admin response-time report does not count a weekend against anyone.
              </p>
            </div>
          </div>
        )}

        <button onClick={saveWorkingTime} disabled={saving} className={SAVE_BTN}>Save Working Days</button>
      </div>

      {/* ── Automatic Acknowledgement ── */}
      <div className={CARD}>
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Automatic Reply</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Sent to the student the moment their concern reaches the One Stop desk.
            </p>
          </div>
          <div className="mt-1">
            <Toggle checked={autoReply.enabled} onChange={(v) => setAutoReply({ ...autoReply, enabled: v })} />
          </div>
        </div>

        {autoReply.enabled && (
          <div className="mt-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                value={autoReply.message}
                onChange={(e) => setAutoReply({ ...autoReply, message: e.target.value })}
                rows={3}
                maxLength={1000}
                className={INPUT}
              />
              <p className="text-xs text-gray-400 mt-1">
                {autoReply.message.trim().length}/1000. The ticket number, the concern, the desk holding it and the
                expected response time are added automatically.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Preview</p>
              <p className="text-sm text-gray-800">Hi <strong>Aarav Sharma</strong>,</p>
              <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                {autoReply.message.trim() || 'Your message will appear here.'}
              </p>
              <div className="mt-3 rounded-lg bg-[#b45309] text-white text-center py-3">
                <p className="text-sm font-bold">In Progress</p>
                <p className="text-xs opacity-85 mt-0.5">With the {routing.intakeLabel || 'One Stop desk'}</p>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Expected response within <strong>{hoursLabel(escalation.intakeHours)}</strong>
                {workingTime.enabled ? ', weekends and holidays not counted.' : '.'}
              </p>
            </div>
          </div>
        )}

        <button onClick={saveAutoReply} disabled={saving} className={SAVE_BTN}>Save Automatic Reply</button>
      </div>

      {/* ── Reopen Policy ── */}
      <div className={CARD}>
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Reopen Policy</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Lets a student who is not satisfied with the answer send their concern back to the One Stop desk.
            </p>
          </div>
          <div className="mt-1">
            <Toggle checked={reopen.enabled} onChange={(v) => setReopen({ ...reopen, enabled: v })} />
          </div>
        </div>

        {reopen.enabled && (
          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reopen window (days)</label>
                <input
                  type="number" min={1} max={365}
                  value={reopen.withinDays}
                  onChange={(e) => setReopen({ ...reopen, withinDays: parseInt(e.target.value) || 1 })}
                  className={INPUT}
                />
                <p className="text-xs text-gray-400 mt-1">
                  How long after being resolved a request can still be reopened. Default: 7.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reopens allowed</label>
                <input
                  type="number" min={1} max={10}
                  value={reopen.maxTimes}
                  onChange={(e) => setReopen({ ...reopen, maxTimes: parseInt(e.target.value) || 1 })}
                  className={INPUT}
                />
                <p className="text-xs text-gray-400 mt-1">
                  After this many, the student is asked to raise a new request. Default: 2.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
              <p className="text-sm font-semibold text-blue-900 mb-3">📌 What a student sees</p>
              <ol className="text-xs text-blue-800 leading-relaxed space-y-2 list-decimal list-inside">
                <li>
                  A <strong>Reopen this concern</strong> button appears on any resolved request, inside its timeline.
                </li>
                <li>
                  They have to say what is still unresolved — at least 10 characters — and that text goes to the desk
                  as the handover note.
                </li>
                <li>
                  The request returns to <strong>Pending</strong> on a fresh One Stop stage, so it restarts on the{' '}
                  <strong>{hoursLabel(escalation.intakeHours)}</strong> clock and the desk decides where it goes next.
                </li>
                <li>
                  The timeline keeps the original resolution and marks the new stage <strong>Reopened</strong>.
                </li>
              </ol>
            </div>
          </div>
        )}

        <button onClick={saveReopen} disabled={saving} className={SAVE_BTN}>Save Reopen Policy</button>
      </div>

      {/* ── App Version Gate ── */}
      <div className={CARD}>
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Minimum App Version</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Force users on older builds to update before they can use the app.
            </p>
          </div>
          <div className="mt-1">
            <Toggle checked={appVersion.enforced} onChange={(v) => setAppVersion({ ...appVersion, enforced: v })} />
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum version</label>
            <input
              type="text"
              value={appVersion.minVersion}
              onChange={(e) => setAppVersion({ ...appVersion, minVersion: e.target.value })}
              placeholder="e.g. 1.0.9"
              className={INPUT}
            />
            <p className="text-xs text-gray-400 mt-1">
              Must match <code className="bg-gray-100 px-1 rounded">expo.version</code> in the build you have published.
              Anything lower is blocked.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message shown to the user</label>
            <input
              type="text"
              value={appVersion.message}
              onChange={(e) => setAppVersion({ ...appVersion, message: e.target.value })}
              placeholder="A newer version of MR One is required to continue."
              className={INPUT}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">App Store URL (iOS)</label>
              <input
                type="url"
                value={appVersion.iosUrl}
                onChange={(e) => setAppVersion({ ...appVersion, iosUrl: e.target.value })}
                className={INPUT}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Play Store URL (Android)</label>
              <input
                type="url"
                value={appVersion.androidUrl}
                onChange={(e) => setAppVersion({ ...appVersion, androidUrl: e.target.value })}
                className={INPUT}
              />
            </div>
          </div>

          {appVersion.enforced ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-5">
              <p className="text-sm font-semibold text-red-900 mb-2">⚠ This gate is live</p>
              <p className="text-xs text-red-800 leading-relaxed">
                Anyone running a build below <strong>{appVersion.minVersion || '(not set)'}</strong> now sees a full-screen
                update prompt they cannot dismiss. On Android the back button and the <em>Close app</em> button exit the
                app; on iOS there is no way past the prompt, because Apple does not allow an app to quit itself.
              </p>
              <p className="text-xs text-red-800 leading-relaxed mt-2">
                Publish the new build to both stores <strong>before</strong> you turn this on, or users will be stuck with
                nothing to update to.
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
              <p className="text-xs text-gray-600 leading-relaxed">
                The gate is off — nobody is blocked. The app also lets users through whenever this setting cannot be read,
                or its own version cannot be determined, so a network problem never locks anyone out.
              </p>
            </div>
          )}
        </div>

        <button onClick={saveAppVersion} disabled={saving} className={SAVE_BTN}>Save App Version</button>
      </div>
    </div>
  );
}
