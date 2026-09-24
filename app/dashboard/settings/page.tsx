'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // Feature flags
  const [studentServicesEnabled, setStudentServicesEnabled] = useState(true);

  // Routing
  const [routing, setRouting] = useState({ intakeEmail: '', intakeLabel: '' });

  // Escalation
  const [escalation, setEscalation] = useState({
    enabled: true,
    recipientEmail: '',
    recipientLabel: 'Vice Chancellor',
    afterHours: 24,
  });

  useEffect(() => {
    (async () => {
      try {
        const [featRes, routRes, escRes] = await Promise.all([
          api.get('/settings/features'),
          api.get('/settings/routing'),
          api.get('/settings/escalation'),
        ]);
        if (featRes.data?.data?.features) {
          setStudentServicesEnabled(featRes.data.data.features.studentServicesEnabled ?? true);
        }
        if (routRes.data?.data?.routing) {
          setRouting(routRes.data.data.routing);
        }
        if (escRes.data?.data?.escalation) {
          setEscalation(escRes.data.data.escalation);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const flash = (text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 3000);
  };

  const saveFeatures = async () => {
    setSaving(true);
    try {
      await api.patch('/settings/features', { studentServicesEnabled });
      flash('Feature flags saved!');
    } catch {
      flash('Failed to save features');
    } finally {
      setSaving(false);
    }
  };

  const saveEscalation = async () => {
    setSaving(true);
    try {
      await api.patch('/settings/escalation', escalation);
      flash('Escalation settings saved!');
    } catch {
      flash('Failed to save escalation settings');
    } finally {
      setSaving(false);
    }
  };

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
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium animate-fade-in">
          ✓ {msg}
        </div>
      )}

      {/* Feature Flags */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Feature Flags</h2>
        <p className="text-xs text-gray-400 mb-4">Toggle features on/off for the mobile app.</p>

        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-800">Student Services</p>
            <p className="text-xs text-gray-400 mt-0.5">When disabled, the mobile app shows a &quot;Coming Soon&quot; screen.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={studentServicesEnabled}
              onChange={(e) => setStudentServicesEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#8B1A1A] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all" />
          </label>
        </div>

        <button onClick={saveFeatures} disabled={saving}
          className="mt-4 px-5 py-2 bg-[#8B1A1A] text-white rounded-lg text-sm font-medium hover:bg-[#6e1515] disabled:opacity-50 transition-colors">
          Save Features
        </button>
      </div>

      {/* Routing Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Request Routing</h2>
        <p className="text-xs text-gray-400 mb-4">Where new student requests are initially routed. Configured via environment variables on the server.</p>

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

      {/* Escalation Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Auto-Escalation</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              If a request is not acted upon within the specified time, it is automatically escalated.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer mt-1">
            <input
              type="checkbox"
              checked={escalation.enabled}
              onChange={(e) => setEscalation({ ...escalation, enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#8B1A1A] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all" />
          </label>
        </div>

        {escalation.enabled && (
          <div className="mt-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Escalate To (Email)</label>
              <input
                type="email"
                value={escalation.recipientEmail}
                onChange={(e) => setEscalation({ ...escalation, recipientEmail: e.target.value })}
                placeholder="e.g. vc@mru.edu.in"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                The person who should receive escalation emails when no action is taken.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label / Title</label>
              <input
                type="text"
                value={escalation.recipientLabel}
                onChange={(e) => setEscalation({ ...escalation, recipientLabel: e.target.value })}
                placeholder="e.g. Vice Chancellor"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                A human-friendly label for this person (used in internal references).
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Window (Hours)</label>
              <input
                type="number"
                min={1}
                max={720}
                value={escalation.afterHours}
                onChange={(e) => setEscalation({ ...escalation, afterHours: parseInt(e.target.value) || 24 })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">
                If no action is taken within this many hours, the request is escalated. Default: 24 hours.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 mt-2">
              <p className="text-sm font-semibold text-amber-900 mb-3">📌 How Auto-Escalation Works</p>
              <ol className="text-xs text-amber-800 leading-relaxed space-y-2 list-decimal list-inside">
                <li>
                  A student submits a request → <strong>OneStop Admin</strong> receives it via email.
                </li>
                <li>
                  If the <strong>OneStop Admin does not forward</strong> the request within{' '}
                  <strong>{escalation.afterHours} hour{escalation.afterHours !== 1 ? 's' : ''}</strong>,
                  it is <strong>automatically escalated</strong> to{' '}
                  <strong>{escalation.recipientEmail || '(email not set yet)'}</strong>.
                </li>
                <li>
                  If the admin forwards it to any Dean / HOD / Director and <strong>that person also
                  does not take any action</strong> (resolve, forward, or mark in-progress) within{' '}
                  <strong>{escalation.afterHours} hour{escalation.afterHours !== 1 ? 's' : ''}</strong>,
                  it is <strong>escalated again</strong> to the same email.
                </li>
                <li>
                  The escalation email <strong>clearly mentions the name/email of the person who did not act</strong> and
                  when they were originally notified.
                </li>
              </ol>
              <p className="text-xs text-amber-700 mt-3 italic">
                💡 Tip: You can change the email and time window anytime. New settings apply to all future requests immediately.
              </p>
            </div>
          </div>
        )}

        <button onClick={saveEscalation} disabled={saving}
          className="mt-5 px-5 py-2 bg-[#8B1A1A] text-white rounded-lg text-sm font-medium hover:bg-[#6e1515] disabled:opacity-50 transition-colors">
          Save Escalation Settings
        </button>
      </div>
    </div>
  );
}
