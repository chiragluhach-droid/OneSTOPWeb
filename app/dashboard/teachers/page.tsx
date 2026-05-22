'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export default function TeachersPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: '', email: '', designation: '', school: '' });
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [filterSchool, setFilterSchool] = useState('');

  const { data: schools } = useQuery({
    queryKey: ['schools'],
    queryFn: () => api.get('/schools').then((r) => r.data.data.schools),
  });

  const { data: teachers, isLoading } = useQuery({
    queryKey: ['teachers', filterSchool],
    queryFn: () => api.get(`/teachers${filterSchool ? `?school=${filterSchool}` : ''}`).then((r) => r.data.data.teachers),
  });

  const save = useMutation({
    mutationFn: (payload: any) =>
      editId ? api.patch(`/teachers/${editId}`, payload) : api.post('/teachers', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teachers'] });
      setForm({ name: '', email: '', designation: '', school: '' });
      setEditId(null);
      setError('');
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed'),
  });

  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/teachers/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teachers'] }),
  });

  const startEdit = (t: any) => {
    setForm({ name: t.name, email: t.email, designation: t.designation, school: t.school?._id || '' });
    setEditId(t._id);
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Teachers</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">{editId ? 'Edit Teacher' : 'Add Teacher'}</h3>
          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
          <div className="space-y-3">
            <input
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Full name"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
            />
            <input
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email address"
              type="email"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
            />
            <input
              value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })}
              placeholder="Designation (e.g. Assistant Professor)"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
            />
            <select
              value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
            >
              <option value="">Select School</option>
              {schools?.map((s: any) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => save.mutate(form)}
                disabled={save.isPending}
                className="flex-1 bg-[#8B1A1A] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#7a1616] disabled:opacity-60"
              >
                {save.isPending ? 'Saving…' : editId ? 'Update' : 'Add Teacher'}
              </button>
              {editId && (
                <button onClick={() => { setEditId(null); setForm({ name: '', email: '', designation: '', school: '' }); }}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">All Teachers ({teachers?.length || 0})</h3>
            <select
              value={filterSchool} onChange={(e) => setFilterSchool(e.target.value)}
              className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none"
            >
              <option value="">All Schools</option>
              {schools?.map((s: any) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>
          {isLoading ? (
            <p className="p-6 text-gray-400 text-sm">Loading…</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {teachers?.map((teacher: any) => (
                <div key={teacher._id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{teacher.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{teacher.designation} · {teacher.email}</p>
                    <span className="inline-block mt-1 text-xs bg-red-50 text-[#8B1A1A] px-2 py-0.5 rounded">
                      {teacher.school?.code || '—'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(teacher)}
                      className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                      Edit
                    </button>
                    <button onClick={() => del.mutate(teacher._id)}
                      className="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              {teachers?.length === 0 && <p className="px-6 py-8 text-center text-gray-400 text-sm">No teachers yet</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
