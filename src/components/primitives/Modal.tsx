import React, { useEffect } from 'react';
import { PillButton } from './PillButton';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
  id?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  maxWidth = 'xl',
  id,
}) => {
  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  }[maxWidth];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0e0e0e]/85 backdrop-blur-md animate-in fade-in duration-200"
      id={id}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`relative w-full ${maxWidthClasses} rounded-2xl border border-neutral-800 bg-[#141414] shadow-2xl shadow-black flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200`}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-5 border-b border-neutral-800/80 bg-neutral-900/50">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <span className="material-symbols-outlined text-[22px]">{icon}</span>
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight leading-tight">{title}</h3>
              {subtitle && <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-neutral-200 flex-1">
          {children}
        </div>

        {/* Modal Footer */}
        {footer ? (
          <div className="p-4 border-t border-neutral-800/80 bg-neutral-900/40 flex items-center justify-end gap-2.5">
            {footer}
          </div>
        ) : (
          <div className="p-4 border-t border-neutral-800/80 bg-neutral-900/40 flex items-center justify-end">
            <PillButton variant="outline" size="sm" onClick={onClose}>
              Đóng
            </PillButton>
          </div>
        )}
      </div>
    </div>
  );
};
