import React from 'react';
import { countWords } from '../../services/aiService';

interface TextInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  rows?: number;
  helperText?: string;
  error?: string;
  warning?: string;
  icon?: string;
  showWordCount?: boolean;
  maxWords?: number;
  actionButton?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  multiline = false,
  rows = 3,
  helperText,
  error,
  warning,
  icon,
  showWordCount = false,
  maxWords,
  actionButton,
  disabled = false,
  className = '',
  id,
}) => {
  const currentWords = showWordCount ? countWords(value) : 0;
  const isOverWordLimit = maxWords !== undefined && currentWords > maxWords;

  const borderClass = error
    ? 'border-red-500/80 focus:ring-red-500/30'
    : warning || isOverWordLimit
    ? 'border-amber-500/80 focus:ring-amber-500/30'
    : 'border-neutral-800 focus:border-amber-500/70 focus:ring-amber-500/20';

  return (
    <div className={`flex flex-col gap-1.5 ${className}`} id={id}>
      <div className="flex items-center justify-between">
        {label && (
          <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
            {icon && <span className="material-symbols-outlined text-[16px] text-amber-500">{icon}</span>}
            {label}
          </label>
        )}

        <div className="flex items-center gap-2">
          {actionButton}
          {showWordCount && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-mono font-medium ${
                isOverWordLimit
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              {currentWords}
              {maxWords !== undefined ? ` / ${maxWords}` : ''} từ
            </span>
          )}
        </div>
      </div>

      {multiline ? (
        <textarea
          value={value}
          rows={rows}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-xl border bg-neutral-900/90 px-3.5 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500 transition-all duration-200 outline-none focus:ring-2 backdrop-blur-sm resize-y leading-relaxed ${borderClass} ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        />
      ) : (
        <input
          type="text"
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-xl border bg-neutral-900/90 px-3.5 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500 transition-all duration-200 outline-none focus:ring-2 backdrop-blur-sm leading-normal ${borderClass} ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        />
      )}

      {(error || warning || helperText) && (
        <div className="flex items-center gap-1.5 text-xs mt-0.5">
          {error ? (
            <span className="text-red-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">error</span>
              {error}
            </span>
          ) : warning || isOverWordLimit ? (
            <span className="text-amber-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">warning</span>
              {warning || `Vượt quá thời lượng (${currentWords}/${maxWords} từ). Hãy rút gọn lời thoại!`}
            </span>
          ) : (
            <span className="text-neutral-400">{helperText}</span>
          )}
        </div>
      )}
    </div>
  );
};
