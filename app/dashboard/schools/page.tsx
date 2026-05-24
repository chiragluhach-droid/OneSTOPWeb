'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

const emptyForm = { name: '', code: '', description: '', hodEmail: '', deanEmail: '' };

export default function SchoolsPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['schools'],
    queryFn: () => api.get('/schools').then((r) => r.data.data.schools),
  });

  const save = useMutation({
    mutationFn: (payload: any) =>
      editId ? api.patch(`/schools/${editId}`, payload) : api.post('/schools', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schools'] });
      setForm(emptyForm);
      setEditId(null);
      setError('');
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed'),
  });

  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/schools/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['schools'] }),
  });

  const startEdit = (s: any) => {
    setForm({
      name: s.name,
      code: s.code,
      description: s.description || '',
      hodEmail: s.hodEmail || '',
      deanEmail: s.deanEmail || '',
    });
    setEditId(s._id);
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Schools / Departments</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">{editId ? 'Edit School' : 'Add School'}</h3>
          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
          <div className="space-y-3">
            <input
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="School name (e.g. School of Engineering)"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
            />
            <input
              value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="Code (e.g. CST)"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
            />
            <input
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Description (optional)"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
            />
            <div>
              <p className="text-xs text-gray-500 mb-1 font-medium">HOD Email</p>
              <input
                value={form.hodEmail} onChange={(e) => setForm({ ...form, hodEmail: e.target.value })}
                placeholder="hodcst@mru.edu.in"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
              />
              <p className="text-xs text-gray-400 mt-1">Optional — for internal records.</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1 font-medium">Dean Email</p>
              <input
                value={form.deanEmail} onChange={(e) => setForm({ ...form, deanEmail: e.target.value })}
                placeholder="deanengg@mru.edu.in"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
              />
              <p className="text-xs text-gray-400 mt-1">CC'd on every request from students of this school.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => save.mutate(form)}
                disabled={save.isPending}
                className="flex-1 bg-[#8B1A1A] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#7a1616] disabled:opacity-60"
              >
                {save.isPending ? 'Saving…' : editId ? 'Update' : 'Add School'}
              </button>
              {editId && (
                <button onClick={() => { setEditId(null); setForm(emptyForm); }}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">All Schools</h3>
          </div>
          {isLoading ? (
            <p className="p-6 text-gray-400 text-sm">Loading…</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {data?.map((school: any) => (
                <div key={school._id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800">{school.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{school.code}</p>
                      {school.hodEmail && (
                        <p className="text-xs text-blue-600 mt-1">HOD: {school.hodEmail}</p>
                      )}
                      {school.deanEmail && (
                        <p className="text-xs text-gray-500">Dean: {school.deanEmail}</p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => startEdit(school)}
                        className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                        Edit
                      </button>
                      <button onClick={() => del.mutate(school._id)}
                        className="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {data?.length === 0 && <p className="px-6 py-8 text-center text-gray-400 text-sm">No schools yet</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
