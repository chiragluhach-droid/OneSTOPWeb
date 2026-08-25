'use client';
import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  Modal, ConfirmDialog, Toast, PrimaryButton, ErrorBanner,
  MAROON, isEmail, fieldClass,
} from '@/components/ui';
import {
  Plus, Search, Pencil, Trash2, X, Landmark, Inbox, Tag, Info,
  UserRound, AlertTriangle, Mail, Copy, Check,
} from 'lucide-react';

type School = {
  _id: string;
  name: string;
  code: string;
  description?: string;
  hodEmail?: string;
  deanEmail?: string;
};

type Form = {
  name: string;
  code: string;
  description: string;
  hodEmail: string;
  deanEmail: string;
};

const emptyForm: Form = { name: '', code: '', description: '', hodEmail: '', deanEmail: '' };

/* One-click copy so an address can be pasted into a category's To / CC list. */
function CopyableEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked (insecure origin, denied permission) — the
      // address is still on screen to copy by hand, so just skip the feedback.
    }
  };

  return (
    <button
      onClick={(e) => { e.stopPropagation(); copy(); }}
      title="Copy email"
      className="p-1.5 rounded-md text-gray-400 hover:bg-gray-200 hover:text-gray-700
                 transition-colors shrink-0"
    >
      {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
    </button>
  );
}

function ContactRow({
  role, email, tint,
}: {
  role: string;
  email?: string;
  tint: string;
}) {
  if (!email) {
    return (
      <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-dashed
                      border-gray-200 bg-white/50">
        <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold w-11 text-center
                         bg-gray-100 text-gray-400">
          {role}
        </span>
        <span className="text-xs text-gray-400 italic">Not set</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-gray-200 bg-white">
      <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold w-11 text-center ${tint}`}>
        {role}
      </span>
      <span className="flex-1 min-w-0 text-xs text-gray-700 truncate" title={email}>
        {email}
      </span>
      <CopyableEmail email={email} />
    </div>
  );
}

function EditorModal({
  open, editing, onClose, onSave, saving, error,
}: {
  open: boolean;
  editing: School | null;
  onClose: () => void;
  onSave: (form: Form) => void;
  saving: boolean;
  error: string;
}) {
  const [form, setForm] = useState<Form>(emptyForm);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTouched(false);
    setForm(editing
      ? {
          name: editing.name,
          code: editing.code,
          description: editing.description || '',
          hodEmail: editing.hodEmail || '',
          deanEmail: editing.deanEmail || '',
        }
      : emptyForm);
  }, [open, editing]);

  const nameError = touched && !form.name.trim() ? 'Name is required.' : '';
  const codeError = touched && !form.code.trim() ? 'Code is required.' : '';

  // Both contacts are optional, but a value that is present must be a real address.
  const hodError = form.hodEmail.trim() && !isEmail(form.hodEmail)
    ? 'Not a valid email address.' : '';
  const deanError = form.deanEmail.trim() && !isEmail(form.deanEmail)
    ? 'Not a valid email address.' : '';

  const canSave = Boolean(form.name.trim() && form.code.trim() && !hodError && !deanError);

  const submit = () => {
    setTouched(true);
    if (!canSave) return;
    onSave({
      ...form,
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      hodEmail: form.hodEmail.trim(),
      deanEmail: form.deanEmail.trim(),
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={<Landmark size={20} style={{ color: MAROON }} />}
      title={editing ? 'Edit School' : 'New School'}
      subtitle={editing ? editing.name : 'A school or department students belong to'}
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600
                       hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <PrimaryButton onClick={submit} pending={saving}>
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Create school'}
          </PrimaryButton>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <ErrorBanner message={error} />

        <section className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                School name <span className="text-red-500">*</span>
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="School of Engineering"
                className={`${fieldClass} ${nameError ? 'border-red-300' : 'border-gray-200'}`}
              />
              {nameError && <p className="text-xs text-red-600 mt-1.5">{nameError}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Code <span className="text-red-500">*</span>
              </label>
              <input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="SOE"
                className={`${fieldClass} font-mono tracking-wide ${codeError ? 'border-red-300' : 'border-gray-200'}`}
              />
              {codeError && <p className="text-xs text-red-600 mt-1.5">{codeError}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Engineering and Technology"
              className={`${fieldClass} border-gray-200`}
            />
          </div>
        </section>

        <div className="border-t border-gray-100" />

        {/* Contacts */}
        <section className="flex flex-col gap-4">
          <div>
            <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <UserRound size={15} style={{ color: MAROON }} />
              Contacts
              <span className="font-normal text-xs text-gray-400">optional</span>
            </h4>
            <p className="flex items-start gap-1.5 text-xs text-gray-500 mt-1.5 leading-relaxed">
              <Info size={13} className="shrink-0 mt-0.5" />
              <span>
                Saved for reference only — they receive nothing automatically. Pick them from the
                <strong> Directory</strong> button when setting a category&apos;s To or CC list.
              </span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Dean email</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2
                                         text-gray-400 pointer-events-none" />
              <input
                value={form.deanEmail}
                onChange={(e) => setForm({ ...form, deanEmail: e.target.value })}
                placeholder="deanengg@mru.edu.in"
                className={`${fieldClass} pl-10 ${deanError ? 'border-red-300' : 'border-gray-200'}`}
              />
            </div>
            {deanError && (
              <p className="flex items-center gap-1.5 text-xs text-red-600 mt-1.5">
                <AlertTriangle size={12} /> {deanError}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">HOD email</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2
                                         text-gray-400 pointer-events-none" />
              <input
                value={form.hodEmail}
                onChange={(e) => setForm({ ...form, hodEmail: e.target.value })}
                placeholder="hod.cst@mru.edu.in"
                className={`${fieldClass} pl-10 ${hodError ? 'border-red-300' : 'border-gray-200'}`}
              />
            </div>
            {hodError && (
              <p className="flex items-center gap-1.5 text-xs text-red-600 mt-1.5">
                <AlertTriangle size={12} /> {hodError}
              </p>
            )}
          </div>
        </section>
      </div>
    </Modal>
  );
}

function SchoolCard({
  school, onEdit, onDelete,
}: {
  school: School;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const contacts = [school.deanEmail, school.hodEmail].filter(Boolean).length;

  return (
    <div className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md
                    hover:border-gray-300 transition-all flex flex-col">
      <div className="flex items-start gap-3.5 p-5 pb-4">
        <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
          <Landmark size={19} style={{ color: MAROON }} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 leading-snug">{school.name}</h3>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100
                             text-gray-600 text-[11px] font-mono font-medium tracking-wide">
              <Tag size={10} />{school.code}
            </span>
            {contacts === 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50
                               border border-amber-200 text-amber-800 text-[11px] font-medium">
                <AlertTriangle size={10} /> No contacts
              </span>
            )}
          </div>
          {school.description && (
            <p className="text-sm text-gray-600 mt-2.5 leading-relaxed">{school.description}</p>
          )}
        </div>

        <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100
                        transition-opacity">
          <button
            onClick={onEdit}
            title="Edit school"
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={onDelete}
            title="Remove school"
            className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="mt-auto px-5 py-4 border-t border-gray-100 bg-gray-50/60 rounded-b-xl">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Contacts
        </p>
        <div className="flex flex-col gap-1.5">
          <ContactRow role="Dean" email={school.deanEmail} tint="bg-red-50 text-red-700" />
          <ContactRow role="HOD" email={school.hodEmail} tint="bg-blue-50 text-blue-700" />
        </div>
      </div>
    </div>
  );
}

export default function SchoolsPage() {
  const qc = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<School | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<School | null>(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const { data: schools, isLoading } = useQuery<School[]>({
    queryKey: ['schools'],
    queryFn: () => api.get('/schools').then((r) => r.data.data.schools),
  });

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const save = useMutation({
    mutationFn: (payload: Form) =>
      editing ? api.patch(`/schools/${editing._id}`, payload) : api.post('/schools', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schools'] });
      flash(editing ? 'School updated' : 'School created');
      setModalOpen(false);
      setEditing(null);
      setError('');
    },
    onError: (err: any) =>
      setError(err.response?.data?.message || 'Something went wrong. Please try again.'),
  });

  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/schools/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schools'] });
      flash('School removed');
      setDeleteTarget(null);
    },
  });

  const filtered = useMemo(() => {
    if (!schools) return [];
    const q = search.trim().toLowerCase();
    if (!q) return schools;
    return schools.filter((s) =>
      [s.name, s.code, s.description, s.hodEmail, s.deanEmail]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().includes(q))
    );
  }, [schools, search]);

  const missingContacts = useMemo(
    () => (schools || []).filter((s) => !s.deanEmail && !s.hodEmail).length,
    [schools]
  );

  const openNew = () => { setEditing(null); setError(''); setModalOpen(true); };
  const openEdit = (s: School) => { setEditing(s); setError(''); setModalOpen(true); };

  return (
    <div className="p-6 sm:p-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Schools &amp; Departments</h2>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl leading-relaxed">
            Students belong to a school. Store each school&apos;s dean and HOD here so you can pick
            them when routing a category.
          </p>
        </div>
        <PrimaryButton onClick={openNew} className="shrink-0">
          <Plus size={16} /> New School
        </PrimaryButton>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400
                                       pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, code, or email…"
            className={`${fieldClass} border-gray-200 pl-10 pr-9`}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400
                         hover:bg-gray-100 hover:text-gray-700 transition-colors"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {!isLoading && (
          <p className="text-sm text-gray-500">
            {search
              ? `${filtered.length} of ${schools?.length ?? 0}`
              : `${schools?.length ?? 0} school${schools?.length === 1 ? '' : 's'}`}
          </p>
        )}

        {missingContacts > 0 && !search && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50
                           border border-amber-200 text-amber-800 text-xs font-medium">
            <AlertTriangle size={12} />
            {missingContacts} without contacts
          </span>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="flex gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-2.5 pt-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-100 rounded w-1/5" />
                </div>
              </div>
              <div className="mt-5 space-y-2">
                <div className="h-8 bg-gray-100 rounded-lg w-full" />
                <div className="h-8 bg-gray-100 rounded-lg w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 py-16 px-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <Inbox size={24} className="text-gray-400" />
          </div>
          {search ? (
            <>
              <p className="font-medium text-gray-700">No schools match &ldquo;{search}&rdquo;</p>
              <button
                onClick={() => setSearch('')}
                className="text-sm mt-2 font-medium hover:underline"
                style={{ color: MAROON }}
              >
                Clear search
              </button>
            </>
          ) : (
            <>
              <p className="font-medium text-gray-700">No schools yet</p>
              <p className="text-sm text-gray-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
                Add one so students can be assigned to it.
              </p>
              <div className="flex justify-center mt-5">
                <PrimaryButton onClick={openNew}>
                  <Plus size={16} /> New School
                </PrimaryButton>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {filtered.map((school) => (
            <SchoolCard
              key={school._id}
              school={school}
              onEdit={() => openEdit(school)}
              onDelete={() => setDeleteTarget(school)}
            />
          ))}
        </div>
      )}

      <EditorModal
        open={modalOpen}
        editing={editing}
        onClose={() => { setModalOpen(false); setEditing(null); setError(''); }}
        onSave={(form) => save.mutate(form)}
        saving={save.isPending}
        error={error}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={`Remove "${deleteTarget?.name}"?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && del.mutate(deleteTarget._id)}
        pending={del.isPending}
      >
        <p>
          This school will no longer be available, and students assigned to it may be unable to
          raise new requests.
        </p>
        <p className="text-gray-500">
          It&apos;s deactivated, not deleted — existing requests and their history stay intact.
        </p>
      </ConfirmDialog>

      <Toast message={toast} />
    </div>
  );
}
