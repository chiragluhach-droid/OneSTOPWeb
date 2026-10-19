'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthStore((s) => s._hydrated);

  const isLoginPage = pathname === '/super-admin/login';

  useEffect(() => {
    if (hydrated) {
      if (!token && !isLoginPage) {
        router.push('/super-admin/login');
      } else if (token && isLoginPage) {
        router.push('/super-admin');
      }
    }
  }, [hydrated, token, isLoginPage, router]);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-800">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-[#8B1A1A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs text-slate-500 font-mono tracking-widest uppercase font-semibold">
            Loading Observatory…
          </p>
        </div>
      </div>
    );
  }

  if (!token && !isLoginPage) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-red-100 selection:text-[#8B1A1A]">
      {children}
    </div>
  );
}
