import React from 'react';
import { PillButton } from './primitives/PillButton';

interface HeaderProps {
  lessonTitle?: string;
  subject?: string;
  onReset?: () => void;
  onOpenHelp?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lessonTitle,
  subject,
  onReset,
  onOpenHelp,
}) => {
  return (
    <header className="border-b border-neutral-800/80 bg-[#0e0e0e]/95 sticky top-0 z-40 backdrop-blur-xl transition-all" id="eduflow-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 p-[1px] shadow-lg shadow-amber-500/10 flex items-center justify-center">
            <div className="w-full h-full bg-neutral-950 rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-amber-400 text-[24px]">school</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black italic tracking-tighter text-white uppercase flex items-center gap-1.5">
                <span>EDUFLOW</span>
                <span className="text-amber-400">STUDIO</span>
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                FLOW TOOL V3.2
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-medium">
              Quy trình 3 bước sản xuất video bài giảng AI: Biên kịch ➔ Hình ảnh ➔ Lip-sync
            </p>
          </div>
        </div>

        {/* Center: Current active project indicator */}
        {lessonTitle && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-neutral-400">Đang thực hiện:</span>
            <span className="font-semibold text-neutral-200 max-w-[200px] truncate">{lessonTitle}</span>
            {subject && <span className="text-amber-400/90 font-mono">({subject})</span>}
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {onOpenHelp && (
            <PillButton variant="outline" size="sm" icon="help" onClick={onOpenHelp}>
              Hướng dẫn
            </PillButton>
          )}

          {onReset && (
            <PillButton variant="solid" size="sm" icon="refresh" onClick={onReset}>
              Làm mới
            </PillButton>
          )}
        </div>
      </div>
    </header>
  );
};
