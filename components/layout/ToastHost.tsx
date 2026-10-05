'use client';

import { AlertCircle, Check } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';

/** Leaf: toast only — keeps lucide + zustand out of the server chrome shell. */
export function ToastHost() {
  const toast = useUiStore((s) => s.toast);
  const toastKind = useUiStore((s) => s.toastKind);
  if (!toast) return null;

  return (
    <div
      role="status"
      className={`fixed bottom-6 right-6 z-[80] flex items-start gap-2 max-w-sm px-4 py-3 text-white text-xs font-semibold leading-relaxed rounded-xl shadow-xl animate-in fade-in slide-in-from-bottom-3 duration-200 ${
        toastKind === 'error' ? 'bg-rose-950 border border-rose-700' : 'bg-slate-900 border border-slate-800'
      }`}
    >
      {toastKind === 'error' ? (
        <AlertCircle className="w-4 h-4 text-rose-300 shrink-0 mt-0.5" />
      ) : (
        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
      )}
      <span>{toast}</span>
    </div>
  );
}
