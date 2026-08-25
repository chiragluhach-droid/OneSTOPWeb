'use client';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  Modal, ConfirmDialog, Toast, PrimaryButton, ErrorBanner,
  MAROON, isEmail, fieldClass,
} from '@/components/ui';
import {
  Plus, Search, Pencil, Trash2, X, ArrowUp, ArrowDown, Mail, Users,
  AlertTriangle, Check, Inbox, Send, CornerDownRight, Info, Tag,
  Building2, ChevronDown, MailPlus, Ban, Clock, ShieldAlert, GraduationCap,
} from 'lucide-react';

const ICONS = [
  '📚', '🎓', '🤝', '💻', '📝', '🏛️', '🌱', '💼',
  '🌍', '💡', '📋', '🔧', '🏠', '💳', '🚌', '🩺',
];

/* Tokens resolved per-request against the student's own school. Must match
   backend/src/utils/recipients.js. */
const DYNAMIC: Record<string, { label: string; hint: string }> = {
  '@dean': { label: 'Respective Dean', hint: "the dean of the student's own school" },
  '@hod': { label: 'Respective HOD', hint: "the HOD of the student's own school" },
};
const isDynamic = (v: string) => Object.prototype.hasOwnProperty.call(DYNAMIC, v);
const labelFor = (v: string) => DYNAMIC[v]?.label ?? v;

const HOUR_PRESETS = [24, 48, 72];

type Escalation = { enabled: boolean; afterHours: number; recipients: string[] };

type Category = {
  _id: string;
  name: string;
  code: string;
  description?: string;
  icon?: string;
  processOwners?: string[];
  ccEmails?: string[];
  escalation?: Partial<Escalation>;
};

type School = {
  _id: string;
  name: string;
  code: string;
  hodEmail?: string;
  deanEmail?: string;
};

type Form = {
  name: string;
  code: string;
  description: string;
  icon: string;
  processOwners: string[];
  ccEmails: string[];
  escalation: Escalation;
};

const emptyEscalation: Escalation = { enabled: false, afterHours: 48, recipients: ['@dean'] };

const emptyForm: Form = {
  name: '', code: '', description: '', icon: '📋',
  processOwners: [], ccEmails: [], escalation: emptyEscalation,
};

/* A recipient chip — dynamic tokens read as a role, not an address. */
function RecipientLabel({ value }: { value: string }) {
  if (!isDynamic(value)) {
    return <span className="text-sm text-gray-700 truncate" title={value}>{value}</span>;
  }
  return (
    <span className="flex items-center gap-2 min-w-0">
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50
                       border border-indigo-200 text-indigo-700 text-xs font-semibold shrink-0">
        <GraduationCap size={11} />
        {DYNAMIC[value].label}
      </span>
      <span className="text-xs text-gray-400 truncate hidden sm:inline">
        → {DYNAMIC[value].hint}
      </span>
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   Add a recipient by role (resolves per student) or by picking a
   named dean / HOD out of the Schools directory.
   ───────────────────────────────────────────────────────────── */
function DirectoryPicker({
  schools, already, onPick,
}: {
  schools: School[];
  already: string[];
  onPick: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const withContacts = schools.filter((s) => s.deanEmail || s.hodEmail);
  const has = (v: string) => already.some((a) => a.toLowerCase() === v.toLowerCase());

  const pick = (v: string) => { onPick(v); setOpen(false); };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium
                   border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300
                   transition-colors whitespace-nowrap"
        title="Add by role, or pick a specific dean / HOD"
      >
        <Building2 size={14} />
        <span className="hidden sm:inline">Add role</span>
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[22rem] max-h-96 overflow-y-auto z-20
                        bg-white rounded-xl border border-gray-200 shadow-xl">
          {/* Dynamic roles */}
          <div className="px-4 py-3 border-b border-gray-100 sticky top-0 bg-white z-10">
            <p className="text-xs font-semibold text-gray-700">By role — resolves per student</p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Routed using the school the student belongs to
            </p>
          </div>

          <div className="p-2">
            {Object.entries(DYNAMIC).map(([token, meta]) => (
              <button
                key={token}
                type="button"
                disabled={has(token)}
                onClick={() => pick(token)}
                className="w-full flex items-start gap-2.5 px-2.5 py-2.5 rounded-lg text-left
                           hover:bg-indigo-50/60 disabled:opacity-45 disabled:hover:bg-transparent
                           disabled:cursor-not-allowed transition-colors group"
              >
                <span className="shrink-0 w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200
                                 flex items-center justify-center mt-0.5">
                  <GraduationCap size={14} className="text-indigo-600" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-xs font-semibold text-gray-800">{meta.label}</span>
                  <span className="block text-[11px] text-gray-500 leading-snug mt-0.5">
                    Goes to {meta.hint}
                  </span>
                </span>
                {has(token) ? (
                  <Check size={13} className="text-emerald-600 shrink-0 mt-1" />
                ) : (
                  <MailPlus size={13} className="text-gray-400 shrink-0 mt-1 opacity-0
                                                 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
            ))}
          </div>

          {/* Specific people */}
          <div className="px-4 py-2.5 border-y border-gray-100 bg-gray-50">
            <p className="text-xs font-semibold text-gray-700">A specific person</p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Always this address, whatever the student&apos;s school
            </p>
          </div>

          {withContacts.length === 0 ? (
            <div className="px-4 py-5 text-center">
              <p className="text-xs text-gray-500 leading-relaxed">
                No school has a dean or HOD email yet.
                <br />Add them in <strong>Schools</strong> first.
              </p>
            </div>
          ) : (
            <div className="py-1">
              {withContacts.map((s) => (
                <div key={s._id} className="px-2 py-1.5">
                  <p className="px-2 py-1 text-[11px] font-semibold text-gray-500 uppercase
                                tracking-wide truncate">
                    {s.name}
                  </p>
                  {([['Dean', s.deanEmail], ['HOD', s.hodEmail]] as const).map(([role, email]) =>
                    email ? (
                      <button
                        key={role}
                        type="button"
                        disabled={has(email)}
                        onClick={() => pick(email)}
                        className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left
                                   hover:bg-gray-50 disabled:opacity-45 disabled:hover:bg-transparent
                                   disabled:cursor-not-allowed transition-colors group"
                      >
                        <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold
                                         bg-gray-100 text-gray-600 w-11 text-center">
                          {role}
                        </span>
                        <span className="flex-1 min-w-0 text-xs text-gray-700 truncate" title={email}>
                          {email}
                        </span>
                        {has(email) ? (
                          <Check size={13} className="text-emerald-600 shrink-0" />
                        ) : (
                          <MailPlus size={13} className="text-gray-400 shrink-0 opacity-0
                                                         group-hover:opacity-100 transition-opacity" />
                        )}
                      </button>
                    ) : null
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RecipientEditor({
  value, onChange, ordered, placeholder, emptyHint, schools,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  ordered?: boolean;
  placeholder: string;
  emptyHint: string;
  schools: School[];
}) {
  const [draft, setDraft] = useState('');
  const [err, setErr] = useState('');

  const addMany = (raw: string) => {
    const parts = raw.split(/[,;\s]+/).map((p) => p.trim()).filter(Boolean);
    if (parts.length === 0) return;

    const bad = parts.find((p) => !isEmail(p) && !isDynamic(p));
    if (bad) { setErr(`"${bad}" is not a valid email address.`); return; }

    const dupe = parts.find((p) => value.some((v) => v.toLowerCase() === p.toLowerCase()));
    if (dupe) { setErr(`${labelFor(dupe)} is already in this list.`); return; }

    onChange([...value, ...parts]);
    setDraft('');
    setErr('');
  };

  const pick = (v: string) => {
    if (value.some((x) => x.toLowerCase() === v.toLowerCase())) return;
    onChange([...value, v]);
    setErr('');
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => { setDraft(e.target.value); if (err) setErr(''); }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addMany(draft); }
          }}
          onBlur={() => { if (draft.trim()) addMany(draft); }}
          placeholder={placeholder}
          className={`${fieldClass} flex-1 border-gray-200`}
        />
        <button
          type="button"
          onClick={() => addMany(draft)}
          disabled={!draft.trim()}
          className="px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-700
                     hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40
                     disabled:cursor-not-allowed transition-colors"
        >
          Add
        </button>
        <DirectoryPicker schools={schools} already={value} onPick={pick} />
      </div>

      {err && (
        <p className="flex items-center gap-1.5 text-xs text-red-600 mt-2">
          <AlertTriangle size={13} /> {err}
        </p>
      )}

      {value.length === 0 ? (
        <p className="text-xs text-gray-400 mt-2.5 italic">{emptyHint}</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-1.5">
          {value.map((entry, i) => (
            <li
              key={entry}
              className="group flex items-center gap-3 pl-3 pr-2 py-2 bg-gray-50 border border-gray-200
                         rounded-lg hover:bg-white hover:border-gray-300 transition-colors"
            >
              {ordered ? (
                <span
                  className="shrink-0 w-6 h-6 rounded-md text-[11px] font-bold text-white
                             flex items-center justify-center"
                  style={{ background: MAROON }}
                  title={`Stage ${i + 1}`}
                >
                  {i + 1}
                </span>
              ) : (
                <Mail size={15} className="shrink-0 text-gray-400" />
              )}

              <span className="flex-1 min-w-0"><RecipientLabel value={entry} /></span>

              <div className="flex items-center gap-0.5 shrink-0 opacity-60 group-hover:opacity-100
                              transition-opacity">
                {ordered && value.length > 1 && (
                  <>
                    <button
                      type="button" onClick={() => move(i, i - 1)} disabled={i === 0}
                      title="Move earlier"
                      className="p-1.5 rounded-md text-gray-500 hover:bg-gray-200 hover:text-gray-800
                                 disabled:opacity-25 disabled:hover:bg-transparent transition-colors"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      type="button" onClick={() => move(i, i + 1)} disabled={i === value.length - 1}
                      title="Move later"
                      className="p-1.5 rounded-md text-gray-500 hover:bg-gray-200 hover:text-gray-800
                                 disabled:opacity-25 disabled:hover:bg-transparent transition-colors"
                    >
                      <ArrowDown size={13} />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                  title="Remove"
                  className="p-1.5 rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600
                             transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function WorkflowPreview({
  owners, cc, escalation,
}: {
  owners: string[];
  cc: string[];
  escalation: Escalation;
}) {
  if (owners.length === 0) {
    return (
      <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 leading-relaxed">
          With no process owners, students <strong>cannot submit</strong> a request in this category —
          the app rejects it with &ldquo;no process owners configured&rdquo;.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
        What happens on submit
      </p>
      <ol className="flex flex-col gap-2">
        {owners.map((entry, i) => (
          <li key={entry} className="flex items-start gap-2.5">
            <span
              className="shrink-0 w-5 h-5 rounded-full text-[10px] font-bold text-white
                         flex items-center justify-center mt-0.5"
              style={{ background: MAROON }}
            >
              {i + 1}
            </span>
            <p className="text-xs text-slate-700 leading-relaxed min-w-0">
              <span className="font-medium break-all">{labelFor(entry)}</span>
              <span className="text-slate-500">
                {' '}gets an action email
                {i < owners.length - 1
                  ? ' with Resolve / Reject / Forward.'
                  : ' with Resolve / Reject (last stage — no Forward).'}
              </span>
            </p>
          </li>
        ))}
        <li className="flex items-start gap-2.5">
          <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-600 text-white
                           flex items-center justify-center mt-0.5">
            <Check size={11} />
          </span>
          <p className="text-xs text-slate-500 leading-relaxed">Student is emailed on every action.</p>
        </li>
      </ol>

      <div className="mt-3 pt-3 border-t border-slate-200 flex flex-col gap-2">
        <p className="flex items-start gap-2 text-xs text-slate-500">
          <Send size={13} className="shrink-0 mt-0.5" />
          {cc.length > 0 ? (
            <span>
              <span className="font-medium text-slate-600">
                {cc.length} FYI recipient{cc.length > 1 ? 's' : ''}
              </span>{' '}
              get a read-only copy on submit <em>and on every action</em> — except whoever
              took that action.
            </span>
          ) : (
            <span>No FYI copies are sent for this category.</span>
          )}
        </p>

        {escalation.enabled && escalation.recipients.length > 0 && (
          <p className="flex items-start gap-2 text-xs text-slate-500">
            <Clock size={13} className="shrink-0 mt-0.5" />
            <span>
              If a stage sits untouched for{' '}
              <span className="font-medium text-slate-600">{escalation.afterHours}h</span>,{' '}
              {escalation.recipients.map(labelFor).join(', ')} get an overdue notice.
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────── Detail ───────────────────────── */
function DetailModal({
  cat, onClose, onEdit, onDelete,
}: {
  cat: Category | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  if (!cat) return null;

  const owners = cat.processOwners || [];
  const cc = cat.ccEmails || [];
  const esc = { ...emptyEscalation, ...(cat.escalation || {}) };
  const [first] = owners;

  return (
    <Modal
      open
      onClose={onClose}
      size="xl"
      icon={cat.icon || '📋'}
      title={cat.name}
      subtitle={cat.code}
      footer={
        <>
          <button
            onClick={onDelete}
            className="mr-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm
                       font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={15} /> Remove
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600
                       hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
          <PrimaryButton onClick={onEdit}>
            <Pencil size={15} /> Edit
          </PrimaryButton>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        {cat.description && (
          <section>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Description
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">{cat.description}</p>
            <p className="text-xs text-gray-400 mt-2">Shown to students in the app as helper text.</p>
          </section>
        )}

        {/* Goes first to */}
        <section>
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Goes first to
          </p>
          {first ? (
            <div className="flex items-center gap-3.5 p-4 rounded-xl border-2"
                 style={{ borderColor: MAROON, background: '#fdf5f5' }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                   style={{ background: MAROON }}>
                {isDynamic(first)
                  ? <GraduationCap size={18} className="text-white" />
                  : <Mail size={18} className="text-white" />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 break-all">{labelFor(first)}</p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {isDynamic(first)
                    ? `Resolved to ${DYNAMIC[first].hint} when they submit.`
                    : 'Receives the action email the moment a student submits.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2.5 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 leading-relaxed">
                No process owner set — students <strong>cannot submit</strong> requests in this category.
              </p>
            </div>
          )}
        </section>

        {/* Chain */}
        {owners.length > 0 && (
          <section>
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500
                          uppercase tracking-wider mb-3">
              <Users size={12} /> Approval chain
              <span className="font-normal normal-case tracking-normal text-gray-400">
                · {owners.length} stage{owners.length === 1 ? '' : 's'}
              </span>
            </p>

            <ol className="flex flex-col">
              {owners.map((entry, i) => (
                <li key={entry} className="flex gap-3.5">
                  <div className="flex flex-col items-center shrink-0">
                    <span
                      className="w-7 h-7 rounded-full text-[11px] font-bold text-white
                                 flex items-center justify-center"
                      style={{ background: MAROON }}
                    >
                      {i + 1}
                    </span>
                    {i < owners.length - 1 && <span className="w-px flex-1 bg-gray-200 my-1" />}
                  </div>

                  <div className={`min-w-0 flex-1 ${i < owners.length - 1 ? 'pb-4' : ''}`}>
                    <p className="text-sm font-medium text-gray-900 break-all">{labelFor(entry)}</p>
                    {isDynamic(entry) && (
                      <p className="text-xs text-indigo-600 mt-0.5">
                        Resolved per student — {DYNAMIC[entry].hint}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700
                                       text-[11px] font-medium border border-emerald-200">
                        Resolve
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-700
                                       text-[11px] font-medium border border-red-200">
                        Reject
                      </span>
                      {i < owners.length - 1 ? (
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700
                                         text-[11px] font-medium border border-blue-200">
                          Forward → stage {i + 2}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-500
                                         text-[11px] font-medium border border-gray-200">
                          Last stage — no Forward
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* CC */}
        <section>
          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500
                        uppercase tracking-wider mb-2">
            <CornerDownRight size={12} /> CC — FYI copy
          </p>

          {cc.length === 0 ? (
            <div className="flex items-start gap-2.5 p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <Ban size={16} className="text-gray-400 shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600 leading-relaxed">
                Nobody is CC&apos;d. No FYI email is sent for this category.
              </p>
            </div>
          ) : (
            <>
              <ul className="flex flex-col gap-1.5">
                {cc.map((entry) => (
                  <li key={entry}
                      className="flex items-center gap-3 px-3.5 py-2.5 bg-gray-50 border
                                 border-gray-200 rounded-lg">
                    <Send size={14} className="text-gray-400 shrink-0" />
                    <RecipientLabel value={entry} />
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-500 mt-2.5 leading-relaxed">
                They get a read-only email — on submit and again on <strong>every action</strong>,
                skipping whoever took that action. No action buttons, so they can&apos;t action the ticket.
              </p>
            </>
          )}
        </section>

        {/* Escalation */}
        <section>
          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500
                        uppercase tracking-wider mb-2">
            <Clock size={12} /> Overdue escalation
          </p>

          {esc.enabled && esc.recipients.length > 0 ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm text-amber-900 leading-relaxed">
                If a stage goes <strong>{esc.afterHours} hours</strong> with no action, these
                contacts get an overdue notice:
              </p>
              <ul className="flex flex-col gap-1.5 mt-3">
                {esc.recipients.map((entry) => (
                  <li key={entry}
                      className="flex items-center gap-3 px-3.5 py-2.5 bg-white border
                                 border-amber-200 rounded-lg">
                    <ShieldAlert size={14} className="text-amber-600 shrink-0" />
                    <RecipientLabel value={entry} />
                  </li>
                ))}
              </ul>
              <p className="text-xs text-amber-700 mt-3 leading-relaxed">
                It&apos;s a notice only — the action links stay with the assigned process owner.
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-2.5 p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <Ban size={16} className="text-gray-400 shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600 leading-relaxed">
                Off — a stage can sit unactioned indefinitely without anyone being notified.
              </p>
            </div>
          )}
        </section>
      </div>
    </Modal>
  );
}

/* ───────────────────────── Editor ───────────────────────── */
function EditorModal({
  open, editing, schools, onClose, onSave, saving, error,
}: {
  open: boolean;
  editing: Category | null;
  schools: School[];
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
          icon: editing.icon || '📋',
          processOwners: editing.processOwners || [],
          ccEmails: editing.ccEmails || [],
          escalation: { ...emptyEscalation, ...(editing.escalation || {}) },
        }
      : emptyForm);
  }, [open, editing]);

  const esc = form.escalation;
  const setEsc = (patch: Partial<Escalation>) =>
    setForm({ ...form, escalation: { ...esc, ...patch } });

  const nameError = touched && !form.name.trim() ? 'Name is required.' : '';
  const codeError = touched && !form.code.trim() ? 'Code is required.' : '';
  const canSave = Boolean(form.name.trim() && form.code.trim());

  const submit = () => {
    setTouched(true);
    if (!canSave) return;
    onSave({ ...form, name: form.name.trim(), code: form.code.trim().toUpperCase() });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={form.icon}
      title={editing ? 'Edit Category' : 'New Category'}
      subtitle={editing ? editing.name : 'Define a service and who handles it'}
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
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Create category'}
          </PrimaryButton>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <ErrorBanner message={error} />

        {/* Identity */}
        <section className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Category name <span className="text-red-500">*</span>
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Library Resource Services"
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
                placeholder="LIBRARY"
                className={`${fieldClass} font-mono tracking-wide ${codeError ? 'border-red-300' : 'border-gray-200'}`}
              />
              {codeError && <p className="text-xs text-red-600 mt-1.5">{codeError}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Library membership, e-resources login, book issue/return, no-dues…"
              className={`${fieldClass} border-gray-200 resize-none leading-relaxed`}
            />
            <p className="text-xs text-gray-400 mt-1.5">
              Shown to students in the app as helper text under the category.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setForm({ ...form, icon })}
                  className={`w-10 h-10 text-xl rounded-lg border-2 transition-all ${
                    form.icon === icon
                      ? 'border-[#8B1A1A] bg-red-50 scale-105 shadow-sm'
                      : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                  aria-pressed={form.icon === icon}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="border-t border-gray-100" />

        {/* Routing */}
        <section className="flex flex-col gap-4">
          <div>
            <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Users size={15} style={{ color: MAROON }} />
              To — approval chain
            </h4>
            <p className="flex items-start gap-1.5 text-xs text-gray-500 mt-1.5 leading-relaxed">
              <Info size={13} className="shrink-0 mt-0.5" />
              <span>
                Each entry is <strong>one approval stage, in order</strong>. Use{' '}
                <strong>Add role</strong> for &ldquo;Respective Dean/HOD&rdquo; — those resolve to the
                dean or HOD of whichever school the student belongs to.
              </span>
            </p>
          </div>

          <RecipientEditor
            value={form.processOwners}
            onChange={(processOwners) => setForm({ ...form, processOwners })}
            ordered
            schools={schools}
            placeholder="owner@mru.edu.in — press Enter to add"
            emptyHint="No process owners yet — add at least one so students can submit."
          />

          <div className="mt-1">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Send size={15} className="text-slate-500" />
              CC — FYI copy
            </h4>
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
              Optional. Gets a read-only copy on submit and on every action — except whoever took
              that action. Nobody is CC&apos;d automatically.
            </p>
          </div>

          <RecipientEditor
            value={form.ccEmails}
            onChange={(ccEmails) => setForm({ ...form, ccEmails })}
            schools={schools}
            placeholder="registrar@mru.edu.in — press Enter to add"
            emptyHint="Nobody is CC'd — no FYI email will be sent."
          />
        </section>

        <div className="border-t border-gray-100" />

        {/* Escalation */}
        <section className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Clock size={15} className="text-amber-600" />
                Overdue escalation
                <span className="font-normal text-xs text-gray-400">optional</span>
              </h4>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                Notify someone if a stage sits with no action for too long.
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={esc.enabled}
              onClick={() => setEsc({ enabled: !esc.enabled })}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full
                          border-2 border-transparent transition-colors focus:outline-none
                          focus:ring-2 focus:ring-[#8B1A1A]/30 ${
                            esc.enabled ? 'bg-amber-500' : 'bg-gray-200'
                          }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full
                            bg-white shadow transition ${esc.enabled ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>

          {esc.enabled && (
            <div className="flex flex-col gap-4 p-4 rounded-xl bg-amber-50/50 border border-amber-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Escalate after
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {HOUR_PRESETS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setEsc({ afterHours: h })}
                      className={`px-3.5 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                        esc.afterHours === h
                          ? 'border-amber-500 bg-white text-amber-800 shadow-sm'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      {h}h
                    </button>
                  ))}
                  <div className="flex items-center gap-2 ml-1">
                    <input
                      type="number"
                      min={1}
                      value={esc.afterHours}
                      onChange={(e) => setEsc({ afterHours: Math.max(1, Number(e.target.value) || 1) })}
                      className={`${fieldClass} border-gray-200 w-24`}
                    />
                    <span className="text-sm text-gray-500">hours</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Escalate to
                </label>
                <p className="text-xs text-gray-500 mb-2.5 leading-relaxed">
                  Defaults to the <strong>Respective Dean</strong> — the dean of the student&apos;s
                  own school.
                </p>
                <RecipientEditor
                  value={esc.recipients}
                  onChange={(recipients) => setEsc({ recipients })}
                  schools={schools}
                  placeholder="escalation@mru.edu.in — press Enter to add"
                  emptyHint="No escalation contacts — nothing will be sent even though this is on."
                />
              </div>
            </div>
          )}
        </section>

        <WorkflowPreview owners={form.processOwners} cc={form.ccEmails} escalation={esc} />
      </div>
    </Modal>
  );
}

/* ───────────────────────── Card ───────────────────────── */
function CategoryCard({ cat, onOpen }: { cat: Category; onOpen: () => void }) {
  const owners = cat.processOwners || [];
  const cc = cat.ccEmails || [];
  const esc = { ...emptyEscalation, ...(cat.escalation || {}) };

  return (
    <button
      onClick={onOpen}
      className="group text-left bg-white rounded-xl border border-gray-200 shadow-sm
                 hover:shadow-md hover:border-gray-300 focus:outline-none focus:ring-2
                 focus:ring-[#8B1A1A]/30 transition-all flex flex-col w-full cursor-pointer"
    >
      <div className="flex items-start gap-3.5 p-5 pb-4">
        <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center text-xl shrink-0">
          {cat.icon || '📋'}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 leading-snug">{cat.name}</h3>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md
                             bg-gray-100 text-gray-600 text-[11px] font-mono font-medium tracking-wide">
              <Tag size={10} />{cat.code}
            </span>
            {esc.enabled && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50
                               border border-amber-200 text-amber-800 text-[11px] font-medium">
                <Clock size={10} /> {esc.afterHours}h
              </span>
            )}
          </div>
        </div>

        <span className="shrink-0 text-[11px] font-medium text-gray-400 opacity-0
                         group-hover:opacity-100 transition-opacity mt-1">
          View details →
        </span>
      </div>

      {cat.description && (
        <p className="px-5 pb-4 text-sm text-gray-600 leading-relaxed line-clamp-2">
          {cat.description}
        </p>
      )}

      <div className="mt-auto px-5 py-3.5 border-t border-gray-100 bg-gray-50/60 rounded-b-xl
                      flex flex-wrap items-center gap-x-4 gap-y-2">
        {owners.length === 0 ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-amber-700">
            <AlertTriangle size={12} /> No process owner
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 min-w-0">
            <span className="shrink-0 w-4 h-4 rounded text-[9px] font-bold text-white
                             flex items-center justify-center"
                  style={{ background: MAROON }}>
              1
            </span>
            <span className={`truncate ${isDynamic(owners[0]) ? 'text-indigo-700 font-medium' : ''}`}
                  title={labelFor(owners[0])}>
              {labelFor(owners[0])}
            </span>
            {owners.length > 1 && (
              <span className="shrink-0 text-gray-400">+{owners.length - 1} more</span>
            )}
          </span>
        )}

        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 ml-auto shrink-0">
          <Send size={11} />
          {cc.length > 0 ? `${cc.length} CC` : 'No CC'}
        </span>
      </div>
    </button>
  );
}

/* ───────────────────────── Page ───────────────────────── */
export default function CategoriesPage() {
  const qc = useQueryClient();

  const [detail, setDetail] = useState<Category | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data.data.categories),
  });

  const { data: schools } = useQuery<School[]>({
    queryKey: ['schools'],
    queryFn: () => api.get('/schools').then((r) => r.data.data.schools),
  });

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const save = useMutation({
    mutationFn: (payload: Form) =>
      editing ? api.patch(`/categories/${editing._id}`, payload) : api.post('/categories', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      flash(editing ? 'Category updated' : 'Category created');
      setModalOpen(false);
      setEditing(null);
      setError('');
    },
    onError: (err: any) =>
      setError(err.response?.data?.message || 'Something went wrong. Please try again.'),
  });

  const del = useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      flash('Category removed');
      setDeleteTarget(null);
      setDetail(null);
    },
  });

  const filtered = useMemo(() => {
    if (!categories) return [];
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) =>
      [
        c.name, c.code, c.description,
        ...(c.processOwners || []).map(labelFor),
        ...(c.ccEmails || []).map(labelFor),
      ]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().includes(q))
    );
  }, [categories, search]);

  const unrouted = useMemo(
    () => (categories || []).filter((c) => !c.processOwners?.length).length,
    [categories]
  );

  const openNew = () => { setEditing(null); setError(''); setModalOpen(true); };
  const openEditFromDetail = () => {
    setEditing(detail);
    setDetail(null);
    setError('');
    setModalOpen(true);
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Request Categories</h2>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl leading-relaxed">
            The services students can raise requests under. Click any category to see who handles it.
          </p>
        </div>
        <PrimaryButton onClick={openNew} className="shrink-0">
          <Plus size={16} /> New Category
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
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md
                         text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {!isLoading && (
          <p className="text-sm text-gray-500">
            {search
              ? `${filtered.length} of ${categories?.length ?? 0}`
              : `${categories?.length ?? 0} categor${categories?.length === 1 ? 'y' : 'ies'}`}
          </p>
        )}

        {unrouted > 0 && !search && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md
                           bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
            <AlertTriangle size={12} />
            {unrouted} without a process owner
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
                  <div className="h-4 bg-gray-200 rounded w-2/5" />
                  <div className="h-3 bg-gray-100 rounded w-1/5" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-4/5" />
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
              <p className="font-medium text-gray-700">No categories match &ldquo;{search}&rdquo;</p>
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
              <p className="font-medium text-gray-700">No categories yet</p>
              <p className="text-sm text-gray-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
                Create one to give students something to raise requests against.
              </p>
              <div className="flex justify-center mt-5">
                <PrimaryButton onClick={openNew}>
                  <Plus size={16} /> New Category
                </PrimaryButton>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {filtered.map((cat) => (
            <CategoryCard key={cat._id} cat={cat} onOpen={() => setDetail(cat)} />
          ))}
        </div>
      )}

      <DetailModal
        cat={detail}
        onClose={() => setDetail(null)}
        onEdit={openEditFromDetail}
        onDelete={() => { if (detail) { setDeleteTarget(detail); setDetail(null); } }}
      />

      <EditorModal
        open={modalOpen}
        editing={editing}
        schools={schools || []}
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
        <p>Students will no longer see this category and can&apos;t raise new requests under it.</p>
        <p className="text-gray-500">
          It&apos;s deactivated, not deleted — existing requests and their approval history stay intact.
        </p>
      </ConfirmDialog>

      <Toast message={toast} />
    </div>
  );
}
