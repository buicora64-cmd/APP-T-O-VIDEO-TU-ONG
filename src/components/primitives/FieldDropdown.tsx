import React, { useState, useRef, useEffect } from 'react';

export interface DropdownOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
}

interface FieldDropdownProps {
  label?: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  helperText?: string;
  placeholder?: string;
  disabled?: boolean;
  icon?: string;
  className?: string;
  id?: string;
}

export const FieldDropdown: React.FC<FieldDropdownProps> = ({
  label,
  options,
  value,
  onChange,
  helperText,
  placeholder = 'Chọn một tùy chọn...',
  disabled = false,
  icon,
  className = '',
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative flex flex-col gap-1.5 ${className}`} ref={containerRef} id={id}>
      {label && (
        <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
          {icon && <span className="material-symbols-outlined text-[16px] text-amber-500">{icon}</span>}
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-sm transition-all duration-200 text-left bg-neutral-900/90 backdrop-blur-md ${
          isOpen
            ? 'border-amber-500/70 ring-2 ring-amber-500/20 shadow-lg shadow-amber-500/5'
            : 'border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/60'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className="flex items-center gap-2.5 truncate">
          {selectedOption?.icon && (
            <span className="material-symbols-outlined text-amber-400 text-[18px]">
              {selectedOption.icon}
            </span>
          )}
          <span className={`truncate font-medium ${selectedOption ? 'text-neutral-100' : 'text-neutral-500'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <span
          className={`material-symbols-outlined text-neutral-400 text-[20px] transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-amber-400' : ''
          }`}
        >
          expand_more
        </span>
      </button>

      {/* Animated Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1.5 rounded-xl border border-neutral-700/80 bg-neutral-900/95 backdrop-blur-xl shadow-2xl shadow-black/80 overflow-hidden max-h-64 overflow-y-auto py-1 animate-in fade-in zoom-in-95 duration-150">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-start justify-between px-3.5 py-2.5 text-sm transition-colors text-left ${
                  isSelected
                    ? 'bg-amber-500/15 text-amber-300 font-semibold'
                    : 'text-neutral-200 hover:bg-neutral-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {opt.icon && (
                    <span
                      className={`material-symbols-outlined text-[18px] mt-0.5 ${
                        isSelected ? 'text-amber-400' : 'text-neutral-400'
                      }`}
                    >
                      {opt.icon}
                    </span>
                  )}
                  <div>
                    <div className="leading-snug">{opt.label}</div>
                    {opt.description && (
                      <div className="text-xs text-neutral-400 mt-0.5 line-clamp-1">{opt.description}</div>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <span className="material-symbols-outlined text-amber-400 text-[18px] ml-2">check</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {helperText && <p className="text-xs text-neutral-400 mt-0.5">{helperText}</p>}
    </div>
  );
};
