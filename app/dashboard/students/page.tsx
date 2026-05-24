'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export default function StudentsPage() {
  const [search, setSearch]     = useState('');
  const [schoolFilter, setSchoolFilter] = useState('');
  const [deptFilter, setDeptFilter]     = useState('');
  const [page, setPage] = useState(1);

  const { data: stats } = useQuery({
    queryKey: ['students-stats'],
    queryFn: () => api.get('/admin/students/stats').then((r) => r.data.data),
  });

  const { data: schoolsData } = useQuery({
    queryKey: ['schools'],
    queryFn: () => api.get('/schools').then((r) => r.data.data.schools),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['students', search, schoolFilter, deptFilter, page],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: '50' });
      if (search)       params.set('search', search);
      if (schoolFilter) params.set('school', schoolFilter);
      if (deptFilter)   params.set('department', deptFilter);
      return api.get(`/admin/students?${params}`).then((r) => r.data.data);
    },
  });

  // Collect all unique departments from stats for filter dropdown
  const allDepts = Array.from(
    new Set((stats?.bySchool ?? []).flatMap((s: any) => s.departments.map((d: any) => d.department)).filter(Boolean))
  ).sort() as string[];

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handleSchool = (v: string) => { setSchoolFilter(v); setDeptFilter(''); setPage(1); };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Students</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {stats?.total?.toLocaleString() ?? '—'} students across {stats?.bySchool?.length ?? '—'} schools
          </p>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {(stats?.bySchool ?? []).map((s: any) => (
          <div
            key={s._id}
            onClick={() => handleSchool(schoolFilter === s._id ? '' : s._id)}
            className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-colors ${
              schoolFilter === s._id ? 'border-[#8B1A1A] bg-red-50' : 'border-gray-100 hover:border-gray-200'
            }`}
          >
            <p className="text-2xl font-bold text-gray-900">{s.totalCount.toLocaleString()}</p>
            <p className="text-xs font-semibold text-gray-500 mt-1">{s.schoolName || 'Unassigned'}</p>
            <p className="text-xs text-gray-400">{s.schoolCode}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search name, roll no, email…"
          className="flex-1 min-w-[220px] px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
        />
        <select
          value={schoolFilter}
          onChange={(e) => handleSchool(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
        >
          <option value="">All Schools</option>
          {(schoolsData ?? []).map((s: any) => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>
        <select
          value={deptFilter}
          onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
        >
          <option value="">All Departments</option>
          {allDepts.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        {(search || schoolFilter || deptFilter) && (
          <button
            onClick={() => { setSearch(''); setSchoolFilter(''); setDeptFilter(''); setPage(1); }}
            className="px-3 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Roll No.</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">School</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">Loading…</td></tr>
              )}
              {!isLoading && data?.students?.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">No students found</td></tr>
              )}
              {data?.students?.map((s: any) => (
                <tr key={s._id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-mono text-xs text-[#8B1A1A] font-semibold">{s.rollNumber}</td>
                  <td className="px-5 py-3 font-medium text-gray-800">{s.name}</td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{s.email}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs px-2 py-0.5 bg-red-50 text-[#8B1A1A] rounded-full font-medium">
                      {s.school?.code ?? '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{s.department ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data?.pagination && data.pagination.pages > 1 && (
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Page {data.pagination.page} of {data.pagination.pages} · {data.pagination.total.toLocaleString()} total
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
