'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';

const StatCard = ({ label, value, icon, color }: any) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
    <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-2xl`}>{icon}</div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

export default function DashboardPage() {
  const admin = useAuthStore((s) => s.admin);

  const { data: requestsData } = useQuery({
    queryKey: ['admin-requests'],
    queryFn: () => api.get('/requests/admin/all?limit=5').then((r) => r.data.data),
  });

  const { data: schoolsData } = useQuery({
    queryKey: ['schools'],
    queryFn: () => api.get('/schools').then((r) => r.data.data.schools),
  });

  const { data: teachersData } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => api.get('/teachers').then((r) => r.data.data.teachers),
  });

  const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    in_review: 'bg-blue-100 text-blue-700',
    resolved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Welcome, {admin?.name} 👋</h2>
        <p className="text-gray-500 text-sm mt-1">OneSTOP Admin Panel — Manav Rachna University</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <StatCard label="Schools" value={schoolsData?.length} icon="🏛️" color="bg-red-50" />
        <StatCard label="Teachers" value={teachersData?.length} icon="👨‍🏫" color="bg-blue-50" />
        <StatCard label="Total Requests" value={requestsData?.pagination?.total} icon="📋" color="bg-green-50" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Recent Requests</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {requestsData?.requests?.length === 0 && (
            <p className="px-6 py-8 text-center text-gray-400 text-sm">No requests yet</p>
          )}
          {requestsData?.requests?.map((req: any) => (
            <div key={req._id} className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800 text-sm">#{req.ticketId}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {req.student?.name} · {req.category?.name} · {req.school?.name}
                </p>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_COLORS[req.status] || 'bg-gray-100 text-gray-600'}`}>
                {req.status.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
