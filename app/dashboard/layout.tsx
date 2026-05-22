'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthStore((s) => s._hydrated);

  useEffect(() => {
    // Only redirect after Zustand has rehydrated from localStorage
    if (hydrated && !token) {
      router.push('/login');
    }
  }, [hydrated, token, router]);

  // Show blank while store is rehydrating — prevents flash redirect
  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#8B1A1A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-gray-400">Loading…</p>
        </div>
      </div>
    );
  }

  if (!token) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-gray-50">
        {children}
      </main>
    </div>
  );
}
