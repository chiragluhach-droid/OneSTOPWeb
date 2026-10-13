'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

type Escalation = {
  enabled: boolean;
  recipientEmail: string;
  recipientLabel: string;
  intakeHours: number;
  forwardedHours: number;
};

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
  });

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
        const [featRes, routRes, escRes, reopenRes, verRes] = await Promise.all([
          api.get('/settings/features'),
          api.get('/settings/routing'),
          api.get('/settings/escalation'),
          api.get('/settings/reopen'),
          api.get('/settings/app-version'),
        ]);
        if (featRes.data?.data?.features) {
          setStudentServicesEnabled(featRes.data.data.features.studentServicesEnabled ?? true);
        }
        if (routRes.data?.data?.routing) setRouting(routRes.data.data.routing);
        if (escRes.data?.data?.escalation) setEscalation(escRes.data.data.escalation);
        if (reopenRes.data?.data?.reopen) setReopen(reopenRes.data.data.reopen);
        if (verRes.data?.data?.appVersion) setAppVersion(verRes.data.data.appVersion);
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
                  <strong>{hoursLabel(escalation.forwardedHours)}</strong> is escalated to the same address.
                </li>
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
