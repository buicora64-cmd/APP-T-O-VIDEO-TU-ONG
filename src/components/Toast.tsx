import React from 'react';
import { ToastMessage } from '../types';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        const icon = {
          success: 'check_circle',
          error: 'error',
          info: 'info',
          warning: 'warning',
        }[toast.type];

        const colors = {
          success: 'border-emerald-500/50 bg-[#121a14]/95 text-emerald-300 shadow-emerald-500/10',
          error: 'border-red-500/50 bg-[#1f1212]/95 text-red-300 shadow-red-500/10',
          info: 'border-blue-500/50 bg-[#12161f]/95 text-blue-300 shadow-blue-500/10',
          warning: 'border-amber-500/50 bg-[#1f1b12]/95 text-amber-300 shadow-amber-500/10',
        }[toast.type];

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border backdrop-blur-xl shadow-xl transition-all duration-200 animate-in slide-in-from-bottom-2 ${colors}`}
          >
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">{icon}</span>
            <div className="min-w-0 flex-1">
              <h5 className="text-xs font-bold text-white leading-tight">{toast.title}</h5>
              <p className="text-xs opacity-90 mt-0.5 leading-relaxed break-words">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="text-white/60 hover:text-white p-0.5 rounded transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        );
      })}
    </div>
  );
};
