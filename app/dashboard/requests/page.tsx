'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  in_review: 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  escalated: 'bg-purple-100 text-purple-700',
};

export default function RequestsPage() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-requests', status, page],
    queryFn: () =>
      api.get(`/requests/admin/all?page=${page}&limit=20${status ? `&status=${status}` : ''}`).then((r) => r.data.data),
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">All Requests</h2>
        <select
          value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_review">In Review</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ticket</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">School</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stage</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading && (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">Loading…</td></tr>
              )}
              {!isLoading && data?.requests?.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">No requests found</td></tr>
              )}
              {data?.requests?.map((req: any) => (
                <tr key={req._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-[#8B1A1A]">#{req.ticketId}</td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">{req.student?.name}</p>
                    <p className="text-xs text-gray-400">{req.student?.collegeId}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{req.category?.name}</td>
                  <td className="px-6 py-4 text-gray-600">{req.school?.code}</td>
                  <td className="px-6 py-4 text-gray-600">{req.currentStageIndex != null ? `Stage ${req.currentStageIndex + 1}` : '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[req.status] || 'bg-gray-100 text-gray-600'}`}>
                      {req.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">
                    {new Date(req.createdAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data?.pagination && data.pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Page {data.pagination.page} of {data.pagination.pages} · {data.pagination.total} total
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
                Previous
              </button>
              <button onClick={() => setPage((p) => p + 1)} disabled={page >= data.pagination.pages}
                className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
