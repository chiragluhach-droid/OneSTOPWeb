'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/dashboard/schools', label: 'Schools', icon: '🏛️' },
  { href: '/dashboard/categories', label: 'Categories', icon: '📂' },
  { href: '/dashboard/requests', label: 'Requests', icon: '📋' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, clearAuth } = useAuthStore();

  const handleLogout = async () => {
    try { await api.post('/admin/auth/logout'); } catch {}
    clearAuth();
    router.push('/login');
  };

  return (
    <aside className="w-64 bg-[#8B1A1A] min-h-screen flex flex-col">
      <div className="px-6 py-6 border-b border-red-700">
        <h1 className="text-2xl font-bold text-white">OneSTOP</h1>
        <p className="text-red-300 text-xs mt-0.5">Admin Panel</p>
        <p className="text-red-200 text-xs mt-2 font-medium">Manav Rachna University</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white text-[#8B1A1A]'
                  : 'text-red-100 hover:bg-red-700 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-4 border-t border-red-700">
        <p className="text-red-300 text-xs mb-2 px-2">{admin?.email}</p>
        <button
          onClick={handleLogout}
          className="w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-red-200 hover:bg-red-700 hover:text-white transition-colors"
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  );
}
