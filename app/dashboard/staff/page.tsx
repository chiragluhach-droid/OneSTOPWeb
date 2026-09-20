'use client';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export default function StaffPage() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', designation: '', role: 'staff' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-staff'],
    queryFn: () => api.get('/admin/staff').then(r => r.data.data.staff),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/admin/staff', formData);
      queryClient.invalidateQueries({ queryKey: ['admin-staff'] });
      setShowAdd(false);
      setFormData({ name: '', email: '', designation: '', role: 'staff' });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add staff');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove ${name}?`)) return;
    try {
      await api.delete(`/admin/staff/${id}`);
      queryClient.invalidateQueries({ queryKey: ['admin-staff'] });
    } catch (err) {
      alert('Failed to delete staff member');
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Staff Management</h2>
        <button
          onClick={() => setShowAdd(true)}
          className="bg-[#8B1A1A] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-900 transition-colors"
        >
          + Add Staff
        </button>
      </div>

      {showAdd && (
        <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-lg mb-4">Register New Staff</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#8B1A1A]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#8B1A1A]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Designation (Optional)</label>
              <input value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#8B1A1A]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
              <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-[#8B1A1A]">
                <option value="staff">Staff</option>
                <option value="hod">HOD</option>
                <option value="dean">Dean</option>
                <option value="dsw">DSW</option>
              </select>
            </div>
            <div className="col-span-2 flex gap-3 mt-2">
              <button type="submit" disabled={isSubmitting}
                className="bg-[#8B1A1A] text-white px-5 py-2 rounded font-medium hover:bg-red-900 disabled:opacity-50">
                {isSubmitting ? 'Saving...' : 'Save Staff Member'}
              </button>
              <button type="button" onClick={() => setShowAdd(false)}
                className="bg-gray-100 text-gray-700 px-5 py-2 rounded font-medium hover:bg-gray-200">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-6 py-3 text-left font-semibold text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-500 uppercase tracking-wider">Designation</th>
              <th className="px-6 py-3 text-right font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : data?.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">No staff members found</td></tr>
            ) : (
              data?.map((s: any) => (
                <tr key={s._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{s.name}</td>
                  <td className="px-6 py-4 text-gray-500">{s.email}</td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-medium uppercase">
                      {s.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{s.designation || '—'}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(s._id, s.name)}
                      className="text-red-500 hover:text-red-700 font-medium">
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
