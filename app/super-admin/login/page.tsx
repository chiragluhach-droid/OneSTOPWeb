'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Call dedicated super-login endpoint
      const res = await api.post('/admin/auth/super-login', {
        email: email.trim(),
        password,
      });

      const { admin, accessToken } = res.data.data;

      if (admin.role !== 'superadmin') {
        setError('Access denied. This portal requires Super Admin privileges.');
        return;
      }

      setAuth(admin, accessToken);
      router.push('/super-admin');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Authentication failed. Please verify Super Admin credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('mrone@789');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 selection:bg-red-100 selection:text-[#8B1A1A]">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-md p-2">
            <img
              src="/mrone-icon.png"
              alt="MR One Crest"
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as any).style.display = 'none';
              }}
            />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-red-50 text-[#8B1A1A] border border-red-200 mb-1">
              <span>🛡️</span> Super Admin Portal
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              MR ONE OBSERVATORY
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Manav Rachna University · Institutional Governance & Executive Intelligence
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-lg p-7 sm:p-8 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2.5">
              <span className="text-sm">⚠️</span>
              <p className="flex-1 leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Super Admin Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="superadmin@mru.edu.in"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-800"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="mrone@789"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-extrabold uppercase tracking-wider text-white bg-[#8B1A1A] hover:bg-red-900 active:bg-red-950 shadow-md transition disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials…</span>
                </>
              ) : (
                <>
                  <span>Sign In to Observatory 🛡️</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Helper Pill */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
              <span>Quick Login Accounts:</span>
              <span className="font-mono text-emerald-700">Password: mrone@789</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleFillDemo('superadmin@mru.edu.in')}
                className="px-2 py-1 rounded bg-white border border-slate-200 hover:border-slate-400 text-[10px] font-mono font-bold text-slate-800 transition"
              >
                superadmin@mru.edu.in
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('onestopsolution@mru.edu.in')}
                className="px-2 py-1 rounded bg-white border border-slate-200 hover:border-slate-400 text-[10px] font-mono font-bold text-slate-800 transition"
              >
                onestopsolution@mru.edu.in
              </button>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="text-center space-y-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#8B1A1A] transition"
          >
            <span>←</span> Departmental Admin or Staff? Go to Standard Login
          </Link>

          <p className="text-[11px] text-slate-400">
            Protected Institutional System · Authorized University Leadership Only
          </p>
        </div>
      </div>
    </div>
  );
}
