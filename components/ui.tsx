'use client';
import { useEffect, useCallback, ReactNode } from 'react';
import { X, AlertTriangle, Check, Loader2 } from 'lucide-react';

export const MAROON = '#8B1A1A';

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export const fieldClass = `w-full px-3.5 py-2.5 border rounded-lg text-sm bg-white transition-shadow
  focus:outline-none focus:ring-2 focus:ring-[#8B1A1A]/30 focus:border-[#8B1A1A]
  placeholder:text-gray-400`;

/* Closes on Escape and locks background scroll while mounted. */
function useDismissable(open: boolean, onClose: () => void) {
  const onKey = useCallback(
    (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onKey]);
}

export function Modal({
  open, onClose, icon, title, subtitle, children, footer, size = 'lg',
}: {
  open: boolean;
  onClose: () => void;
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'lg' | 'xl';
}) {
  useDismissable(open, onClose);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-6">
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-[2px]" onClick={onClose} aria-hidden />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative w-full my-auto bg-white rounded-2xl shadow-2xl border border-gray-200
                    overflow-hidden ${size === 'xl' ? 'max-w-3xl' : 'max-w-2xl'}`}
      >
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3.5 min-w-0">
            {icon && (
              <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center
                              text-2xl shrink-0">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{title}</h3>
              {subtitle && <p className="text-xs text-gray-500 mt-0.5 truncate">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700
                       transition-colors shrink-0"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 max-h-[calc(100vh-16rem)] overflow-y-auto">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open, title, children, confirmLabel = 'Remove', pendingLabel = 'Removing…',
  onCancel, onConfirm, pending,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel?: string;
  pendingLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
  pending: boolean;
}) {
  useDismissable(open, onCancel);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-[2px]" onClick={onCancel} aria-hidden />
      <div
        role="alertdialog"
        aria-modal="true"
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 p-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <div className="text-sm text-gray-600 mt-2 leading-relaxed flex flex-col gap-2">
              {children}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600
                       hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={pending}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold
                       bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 transition-colors"
          >
            {pending && <Loader2 size={15} className="animate-spin" />}
            {pending ? pendingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Toast({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-2.5 px-4 py-3
                    bg-gray-900 text-white rounded-lg shadow-lg text-sm font-medium">
      <Check size={16} className="text-emerald-400" />
      {message}
    </div>
  );
}

export function PrimaryButton({
  onClick, disabled, pending, children, className = '',
}: {
  onClick: () => void;
  disabled?: boolean;
  pending?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || pending}
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold
                  text-white shadow-sm hover:opacity-90 disabled:opacity-60
                  disabled:cursor-not-allowed transition-opacity ${className}`}
      style={{ background: MAROON }}
    >
      {pending && <Loader2 size={15} className="animate-spin" />}
      {children}
    </button>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-lg">
      <AlertTriangle size={15} className="text-red-600 shrink-0 mt-0.5" />
      <p className="text-sm text-red-700">{message}</p>
    </div>
  );
}
