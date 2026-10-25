import React from 'react';
import { WorkflowStep } from '../types';

interface ProgressBarProps {
  currentStep: WorkflowStep;
  onSelectStep: (step: WorkflowStep) => void;
  canNavigateToStep2: boolean;
  canNavigateToStep3: boolean;
  sceneCount: number;
  imagesReadyCount: number;
  videosReadyCount: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  onSelectStep,
  canNavigateToStep2,
  canNavigateToStep3,
  sceneCount,
  imagesReadyCount,
  videosReadyCount,
}) => {
  const steps = [
    {
      id: 1 as WorkflowStep,
      title: 'Bước 1: Biên kịch',
      subtitle: sceneCount > 0 ? `${sceneCount} cảnh kịch bản` : 'Khởi tạo kịch bản AI',
      icon: 'edit_document',
      badge: 'Rule 2.5 từ/s',
      canAccess: true,
    },
    {
      id: 2 as WorkflowStep,
      title: 'Bước 2: Hình ảnh',
      subtitle: sceneCount > 0 ? `${imagesReadyCount}/${sceneCount} ảnh sẵn sàng` : 'Nano Banana Pro',
      icon: 'image',
      badge: '🍌 Nano Banana Pro',
      canAccess: canNavigateToStep2,
    },
    {
      id: 3 as WorkflowStep,
      title: 'Bước 3: Xuất Video',
      subtitle: sceneCount > 0 ? `${videosReadyCount}/${sceneCount} video đã xuất` : 'Lip-sync & Voiceover',
      icon: 'movie',
      badge: 'Veo 3.1 & Omni',
      canAccess: canNavigateToStep3,
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto my-6 px-4" id="eduflow-progressbar">
      <div className="relative bg-neutral-900/80 border border-neutral-800/80 rounded-2xl p-3 sm:p-4 backdrop-blur-xl shadow-xl shadow-black/40">
        {/* Glow accent behind active step */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none opacity-30 blur-2xl transition-all duration-500"
          style={{
            background:
              currentStep === 1
                ? 'radial-gradient(circle at 20% 50%, #f59e0b 0%, transparent 60%)'
                : currentStep === 2
                ? 'radial-gradient(circle at 50% 50%, #f59e0b 0%, transparent 60%)'
                : 'radial-gradient(circle at 80% 50%, #f59e0b 0%, transparent 60%)',
          }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10">
          {steps.map((step) => {
            const isActive = currentStep === step.id;
            const isPassed = currentStep > step.id;
            const isClickable = step.canAccess;

            return (
              <button
                key={step.id}
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onSelectStep(step.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-300 ${
                  isActive
                    ? 'bg-amber-500/10 border-amber-500/80 shadow-lg shadow-amber-500/15 ring-1 ring-amber-500/40'
                    : isPassed
                    ? 'bg-neutral-800/40 border-neutral-700/60 hover:border-neutral-600 hover:bg-neutral-800/70'
                    : 'bg-neutral-950/40 border-neutral-800/50 opacity-60'
                } ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              >
                {/* Step icon circle */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                    isActive
                      ? 'bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/40'
                      : isPassed
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {isPassed ? (
                    <span className="material-symbols-outlined text-[20px] font-bold">check</span>
                  ) : (
                    <span className="material-symbols-outlined text-[20px]">{step.icon}</span>
                  )}
                </div>

                {/* Step info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${
                        isActive ? 'text-amber-400' : isPassed ? 'text-emerald-400' : 'text-neutral-400'
                      }`}
                    >
                      {step.title}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800/80 text-neutral-400 border border-neutral-700/50 hidden sm:inline-block">
                      {step.badge}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-300 font-medium truncate mt-0.5">{step.subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
