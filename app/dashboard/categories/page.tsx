'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

const ICONS = ['📚', '🎓', '🤝', '💻', '📝', '🏛️', '🌱', '💼', '🌍', '💡', '📋', '🔧'];

const emptyForm = { name: '', code: '', description: '', icon: '📋', processOwners: '', ccEmails: '' };

export default function CategoriesPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data.data.categories),
  });

  const save = useMutation({
    mutationFn: (payload: any) =>
      editId ? api.patch(`/categories/${editId}`, payload) : api.post('/categories', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      setForm(emptyForm);
      setEditId(null);
      setError('');
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed'),
  });

  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });

  const startEdit = (c: any) => {
    setForm({
      name: c.name,
      code: c.code,
      description: c.description || '',
      icon: c.icon || '📋',
      processOwners: (c.processOwners || []).join(', '),
      ccEmails: (c.ccEmails || []).join(', '),
    });
    setEditId(c._id);
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Request Categories</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">{editId ? 'Edit Category' : 'Add Category'}</h3>
          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
          <div className="space-y-3">
            <input
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Category name (e.g. Library Resource Services)"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
            />
            <input
              value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="Code (e.g. LIBRARY)"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
            />
            <textarea
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Description — shown to student as helper text"
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A] resize-none"
            />
            <div>
              <p className="text-xs text-gray-500 mb-1 font-medium">Process Owners (To)</p>
              <input
                value={form.processOwners} onChange={(e) => setForm({ ...form, processOwners: e.target.value })}
                placeholder="email1@mru.edu.in, email2@mru.edu.in"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
              />
              <p className="text-xs text-gray-400 mt-1">Stage 1 recipients. Comma-separated.</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1 font-medium">CC Emails</p>
              <input
                value={form.ccEmails} onChange={(e) => setForm({ ...form, ccEmails: e.target.value })}
                placeholder="deanacademics@mru.edu.in"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]"
              />
              <p className="text-xs text-gray-400 mt-1">Added to CC on every email in this workflow.</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2">Icon</p>
              <div className="flex flex-wrap gap-2">
                {ICONS.map((icon) => (
                  <button key={icon} onClick={() => setForm({ ...form, icon })}
                    className={`w-9 h-9 text-lg rounded-lg border-2 transition-colors ${form.icon === icon ? 'border-[#8B1A1A] bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => save.mutate(form)}
                disabled={save.isPending}
                className="flex-1 bg-[#8B1A1A] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#7a1616] disabled:opacity-60"
              >
                {save.isPending ? 'Saving…' : editId ? 'Update' : 'Add Category'}
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
            <h3 className="font-semibold text-gray-800">All Categories</h3>
          </div>
          {isLoading ? (
            <p className="p-6 text-gray-400 text-sm">Loading…</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {categories?.map((cat: any) => (
                <div key={cat._id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-xl shrink-0">
                        {cat.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800">{cat.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{cat.code}</p>
                        {cat.processOwners?.length > 0 && (
                          <p className="text-xs text-blue-600 mt-1 truncate">→ {cat.processOwners.join(', ')}</p>
                        )}
                        {cat.ccEmails?.length > 0 && (
                          <p className="text-xs text-gray-400 truncate">CC: {cat.ccEmails.join(', ')}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => startEdit(cat)}
                        className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                        Edit
                      </button>
                      <button onClick={() => del.mutate(cat._id)}
                        className="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {categories?.length === 0 && <p className="px-6 py-8 text-center text-gray-400 text-sm">No categories yet</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
