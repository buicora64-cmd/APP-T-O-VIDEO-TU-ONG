import React, { useState } from 'react';
import { AspectRatio, Scene } from '../../types';
import { PillButton } from '../primitives/PillButton';
import { Modal } from '../primitives/Modal';
import { Flow } from '../../services/flowSdk';

interface Step2ImagesProps {
  scenes: Scene[];
  aspectRatio: AspectRatio;
  subject: string;
  lessonTitle: string;
  onUpdateScene: (index: number, updated: Partial<Scene>) => void;
  onBackToStep1: () => void;
  onProceedToStep3: () => void;
  onShowToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, msg: string) => void;
}

export const Step2Images: React.FC<Step2ImagesProps> = ({
  scenes,
  aspectRatio,
  subject,
  lessonTitle,
  onUpdateScene,
  onBackToStep1,
  onProceedToStep3,
  onShowToast,
}) => {
  const [batchProgress, setBatchProgress] = useState<{
    isRunning: boolean;
    current: number;
    total: number;
  }>({ isRunning: false, current: 0, total: scenes.length });

  // Preview modal for a scene image
  const [inspectIndex, setInspectIndex] = useState<number | null>(null);

  // Single Scene Image Generation via Flow.generate.image
  const handleGenerateSingleImage = async (index: number) => {
    const scene = scenes[index];
    if (!scene || scene.imageStatus === 'generating') return;

    onUpdateScene(index, { imageStatus: 'generating', imageError: undefined });

    try {
      const res = await Flow.generate.image({
        prompt: scene.imagePrompt,
        aspectRatio,
        model: 'Nano Banana Pro',
        subject,
        lessonTitle,
      });

      onUpdateScene(index, {
        imageUrl: res.imageUrl,
        imageStatus: 'completed',
      });

      onShowToast(
        'success',
        'Tạo ảnh thành công',
        `Cảnh ${index + 1} đã có ảnh minh họa chuẩn Nano Banana Pro.`
      );
    } catch (err: any) {
      console.error(`Error generating image for scene ${index + 1}:`, err);
      onUpdateScene(index, {
        imageStatus: 'failed',
        imageError: err.message || 'Lỗi tạo ảnh',
      });
      onShowToast('error', 'Tạo ảnh thất bại', err.message || 'Không thể tạo ảnh.');
    }
  };

  // Batch Generation ("Tạo tất cả ảnh")
  const handleGenerateAllImages = async () => {
    if (batchProgress.isRunning || scenes.length === 0) return;

    setBatchProgress({ isRunning: true, current: 0, total: scenes.length });
    onShowToast('info', 'Bắt đầu tạo tất cả ảnh', `Đang xử lý tuần tự ${scenes.length} cảnh với Nano Banana Pro.`);

    for (let i = 0; i < scenes.length; i++) {
      setBatchProgress((prev) => ({ ...prev, current: i + 1 }));
      onUpdateScene(i, { imageStatus: 'generating', imageError: undefined });

      try {
        const res = await Flow.generate.image({
          prompt: scenes[i].imagePrompt,
          aspectRatio,
          model: 'Nano Banana Pro',
          subject,
          lessonTitle,
        });

        onUpdateScene(i, {
          imageUrl: res.imageUrl,
          imageStatus: 'completed',
        });
      } catch (err: any) {
        console.error(`Batch item ${i + 1} failed:`, err);
        onUpdateScene(i, {
          imageStatus: 'failed',
          imageError: err.message || 'Lỗi',
        });
      }
    }

    setBatchProgress((prev) => ({ ...prev, isRunning: false }));
    onShowToast('success', 'Hoàn tất Batch Generation', 'Đã xử lý xong toàn bộ danh sách hình ảnh bài giảng!');
  };

  // Upload/Select custom image using Flow.media.select
  const handleSelectMedia = async (index: number) => {
    try {
      const media = await Flow.media.select({
        accept: 'image/*',
        type: 'image',
      });

      if (media && media.dataUrl) {
        onUpdateScene(index, {
          imageUrl: media.dataUrl,
          imageStatus: 'completed',
        });
        onShowToast('success', 'Đã tải ảnh lên', `Ảnh cho Cảnh ${index + 1} đã được cập nhật từ thiết bị.`);
      }
    } catch (err: any) {
      console.error('Flow.media.select error:', err);
      onShowToast('error', 'Tải ảnh thất bại', err.message || 'Không thể đọc tệp ảnh.');
    }
  };

  // Download scene image using Flow.download
  const handleDownloadImage = async (index: number) => {
    const scene = scenes[index];
    if (!scene.imageUrl) return;

    try {
      onShowToast('info', 'Đang chuẩn bị tải...', `Đang tải ảnh Cảnh ${index + 1} về máy.`);
      const filename = `eduflow-canh-${index + 1}-${lessonTitle.toLowerCase().replace(/\s+/g, '-')}.png`;
      await Flow.download(scene.imageUrl, filename);
      onShowToast('success', 'Đã tải xong!', `Ảnh ${filename} đã được lưu vào thư mục Tải về.`);
    } catch (err: any) {
      console.error('Flow.download error:', err);
      onShowToast('error', 'Lỗi tải ảnh', err.message || 'Không thể tải ảnh về máy.');
    }
  };

  const completedCount = scenes.filter((s) => s.imageStatus === 'completed' && s.imageUrl).length;
  const isAllCompleted = completedCount === scenes.length && scenes.length > 0;

  // Aspect ratio classes for preview frames
  const aspectClass = {
    '16:9': 'aspect-video',
    '9:16': 'aspect-[9/16] max-h-[380px]',
    '1:1': 'aspect-square',
    '4:3': 'aspect-[4/3]',
  }[aspectRatio] || 'aspect-video';

  return (
    <div className="space-y-6 animate-in fade-in duration-300" id="step2-container">
      {/* Top Banner & Batch Generation Controller */}
      <div className="bg-[#121212] border border-neutral-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Bước 2: Visual Assets
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300">
                Model: 🍌 Nano Banana Pro
              </span>
              <span className="text-xs font-mono text-neutral-400">
                Tỷ lệ: {aspectRatio}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1 tracking-tight">
              Tạo Hình Ảnh Bài Giảng cho Từng Phân Cảnh
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Hình ảnh tạo ra ở bước này sẽ được dùng làm <strong>firstFrameImageMediaId</strong> trong Bước 3 để xuất video Lip-sync.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <PillButton variant="outline" size="sm" icon="arrow_back" onClick={onBackToStep1}>
              Kịch bản
            </PillButton>

            <PillButton
              variant="filled"
              size="md"
              icon="auto_awesome"
              loading={batchProgress.isRunning}
              disabled={batchProgress.isRunning || scenes.length === 0}
              onClick={handleGenerateAllImages}
              className="shadow-amber-500/20"
            >
              {batchProgress.isRunning
                ? `Đang tạo ${batchProgress.current}/${batchProgress.total}...`
                : 'Tạo Tất Cả Ảnh (Batch Generation)'}
            </PillButton>

            <PillButton
              variant={isAllCompleted ? 'filled' : 'outline'}
              size="md"
              icon="arrow_forward"
              iconPosition="right"
              onClick={onProceedToStep3}
            >
              Bước 3: Xuất Video
            </PillButton>
          </div>
        </div>

        {/* Batch Progress Bar if running */}
        {batchProgress.isRunning && (
          <div className="mt-4 pt-4 border-t border-neutral-800/80 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-xs">
              <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                Đang tạo hình ảnh phân cảnh {batchProgress.current} trên {batchProgress.total}...
              </span>
              <span className="text-neutral-400 font-mono font-bold">
                {Math.round((batchProgress.current / batchProgress.total) * 100)}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300 rounded-full"
                style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Status Bar */}
        <div className="mt-4 pt-3 border-t border-neutral-800/60 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-3">
            <span>
              Trạng thái:{' '}
              <strong className={isAllCompleted ? 'text-emerald-400' : 'text-amber-400'}>
                {completedCount}/{scenes.length} ảnh hoàn tất
              </strong>
            </span>
            {isAllCompleted && (
              <span className="text-emerald-400 inline-flex items-center gap-1 font-semibold">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                Đầy đủ khung hình cho Bước 3
              </span>
            )}
          </div>
          <span className="font-mono text-[11px] text-neutral-500">Flow.generate.image & Flow.media.select</span>
        </div>
      </div>

      {/* Grid of Scenes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="scenes-image-grid">
        {scenes.map((scene, idx) => {
          const isGeneratingThis = scene.imageStatus === 'generating';
          const isCompletedThis = scene.imageStatus === 'completed' && scene.imageUrl;
          const isFailedThis = scene.imageStatus === 'failed';

          return (
            <div
              key={scene.id || idx}
              className="bg-[#141414] border border-neutral-800/90 rounded-2xl overflow-hidden flex flex-col shadow-lg hover:border-neutral-700 transition-all group"
            >
              {/* Card Header */}
              <div className="p-3.5 border-b border-neutral-800/80 bg-neutral-900/50 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-6 h-6 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs font-bold font-mono text-amber-400 shrink-0">
                    {idx + 1}
                  </span>
                  <h4 className="text-xs font-bold text-neutral-100 truncate">{scene.title}</h4>
                </div>

                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 shrink-0">
                  {scene.duration}s
                </span>
              </div>

              {/* Visual Media Frame */}
              <div className={`relative w-full ${aspectClass} bg-neutral-950 flex items-center justify-center overflow-hidden border-b border-neutral-800/80`}>
                {isGeneratingThis ? (
                  <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 animate-pulse">
                      <span className="material-symbols-outlined text-[28px] animate-spin">progress_activity</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-200">🍌 Nano Banana Pro</p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">Đang tổng hợp hình ảnh bài giảng...</p>
                    </div>
                  </div>
                ) : isCompletedThis ? (
                  <>
                    <img
                      src={scene.imageUrl}
                      alt={scene.title}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    />

                    {/* Top overlay badge */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono font-semibold text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">verified</span>
                      🍌 Ready
                    </div>

                    {/* Hover Controls Overlay */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
                      <button
                        type="button"
                        title="Xem chi tiết ảnh"
                        onClick={() => setInspectIndex(idx)}
                        className="w-9 h-9 rounded-xl bg-neutral-800/90 text-white hover:bg-amber-500 hover:text-black flex items-center justify-center transition-colors shadow-lg"
                      >
                        <span className="material-symbols-outlined text-[20px]">zoom_in</span>
                      </button>

                      <button
                        type="button"
                        title="Tạo lại với Nano Banana Pro"
                        onClick={() => handleGenerateSingleImage(idx)}
                        className="w-9 h-9 rounded-xl bg-neutral-800/90 text-white hover:bg-amber-500 hover:text-black flex items-center justify-center transition-colors shadow-lg"
                      >
                        <span className="material-symbols-outlined text-[20px]">refresh</span>
                      </button>

                      <button
                        type="button"
                        title="Tải ảnh từ máy tính (Flow.media.select)"
                        onClick={() => handleSelectMedia(idx)}
                        className="w-9 h-9 rounded-xl bg-neutral-800/90 text-white hover:bg-amber-500 hover:text-black flex items-center justify-center transition-colors shadow-lg"
                      >
                        <span className="material-symbols-outlined text-[20px]">upload</span>
                      </button>

                      <button
                        type="button"
                        title="Tải ảnh về máy (Flow.download)"
                        onClick={() => handleDownloadImage(idx)}
                        className="w-9 h-9 rounded-xl bg-neutral-800/90 text-white hover:bg-amber-500 hover:text-black flex items-center justify-center transition-colors shadow-lg"
                      >
                        <span className="material-symbols-outlined text-[20px]">download</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500">
                      <span className="material-symbols-outlined text-[26px]">image</span>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-neutral-300">Chưa tạo hình ảnh</p>
                      <p className="text-[10px] text-neutral-400 mt-0.5 line-clamp-1">
                        Sử dụng prompt sư phạm của cảnh {idx + 1}
                      </p>
                    </div>

                    {isFailedThis && (
                      <p className="text-[10px] text-red-400 font-medium">{scene.imageError || 'Lỗi tạo ảnh'}</p>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <PillButton
                        variant="filled"
                        size="sm"
                        icon="auto_awesome"
                        onClick={() => handleGenerateSingleImage(idx)}
                      >
                        Tạo ảnh 🍌
                      </PillButton>

                      <PillButton
                        variant="outline"
                        size="sm"
                        icon="upload"
                        onClick={() => handleSelectMedia(idx)}
                      >
                        Tải lên
                      </PillButton>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer: Prompt snippet and dialogue */}
              <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between text-xs">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
                    <span className="font-semibold uppercase tracking-wider text-amber-400/90">Prompt tạo ảnh</span>
                    <button
                      type="button"
                      onClick={() => handleGenerateSingleImage(idx)}
                      disabled={isGeneratingThis}
                      className="text-amber-400 hover:underline inline-flex items-center gap-0.5"
                    >
                      <span className="material-symbols-outlined text-[14px]">bolt</span>
                      Sinh lại
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={scene.imagePrompt}
                    onChange={(e) => onUpdateScene(idx, { imagePrompt: e.target.value })}
                    className="w-full bg-neutral-900/80 border border-neutral-800 rounded-lg p-2 text-[11px] text-neutral-300 placeholder:text-neutral-500 outline-none focus:border-amber-500/60 resize-none font-mono"
                  />
                </div>

                <div className="pt-2 border-t border-neutral-800/60">
                  <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block mb-0.5">
                    Lời giảng đi kèm:
                  </span>
                  <p className="text-neutral-200 text-xs italic line-clamp-2">"{scene.dialogue}"</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inspect Modal */}
      {inspectIndex !== null && scenes[inspectIndex] && (
        <Modal
          isOpen={true}
          onClose={() => setInspectIndex(null)}
          title={`Chi tiết hình ảnh Cảnh ${inspectIndex + 1}: ${scenes[inspectIndex].title}`}
          subtitle={`Model: 🍌 Nano Banana Pro | Tỷ lệ: ${aspectRatio}`}
          icon="image"
          maxWidth="4xl"
          footer={
            <div className="flex items-center gap-2">
              <PillButton
                variant="outline"
                size="sm"
                icon="download"
                onClick={() => handleDownloadImage(inspectIndex)}
              >
                Tải ảnh về máy
              </PillButton>
              <PillButton
                variant="filled"
                size="sm"
                onClick={() => setInspectIndex(null)}
              >
                Hoàn tất
              </PillButton>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="w-full rounded-xl overflow-hidden bg-black flex items-center justify-center max-h-[500px]">
              <img
                src={scenes[inspectIndex].imageUrl}
                alt={scenes[inspectIndex].title}
                className="max-h-[500px] w-auto object-contain"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                <span className="text-amber-400 font-bold block mb-1">PROMPT HÌNH ẢNH NANO BANANA PRO:</span>
                <p className="text-neutral-300 font-mono leading-relaxed">{scenes[inspectIndex].imagePrompt}</p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                <span className="text-cyan-400 font-bold block mb-1">LIP-SYNC VIDEO PROMPT (FIRST FRAME READY):</span>
                <p className="text-neutral-300 font-mono leading-relaxed">{scenes[inspectIndex].videoPrompt}</p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
