'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/admin/auth/login', { email, password });
      setAuth(res.data.data.admin, res.data.data.accessToken);
      const redirect = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('redirect') : null;
      router.push(redirect || '/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-[#8B1A1A] px-8 py-8 text-center">
            <h1 className="text-3xl font-bold text-white">MR One</h1>
            <p className="text-red-200 text-sm mt-1">Manav Rachna University</p>
            <p className="text-red-300 text-xs mt-2">Admin Control Panel</p>
          </div>
          <form onSubmit={handleLogin} className="px-8 py-8 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent"
                placeholder="admin@manav-rachna.ac.in"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#8B1A1A] text-white py-3 rounded-lg font-semibold hover:bg-[#7a1616] transition-colors disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
          {/* The leadership console is a separate portal with its own sign-in,
              so it gets its own door here rather than a line of fine print. */}
          <div className="px-8 pb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px flex-1 bg-gray-200" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">or</span>
              <span className="h-px flex-1 bg-gray-200" />
            </div>
            <Link
              href="/super-admin/login"
              className="group flex items-center gap-3 w-full px-4 py-3.5 rounded-xl border-2 border-[#8B1A1A]/20 hover:border-[#8B1A1A]/60 hover:bg-[#8B1A1A]/[0.03] transition-all"
            >
              <span className="w-9 h-9 rounded-lg bg-[#8B1A1A]/10 grid place-items-center shrink-0">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className="block text-[14px] font-bold text-gray-900 leading-tight">Super Admin Portal</span>
                <span className="block text-[11.5px] text-gray-500 leading-tight mt-0.5">University leadership · full analytics &amp; reports</span>
              </span>
              <span className="text-[#8B1A1A] text-lg transition-transform group-hover:translate-x-0.5" aria-hidden>&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
