/**
 * EduFlow Studio - 3-Step Educational Video Creator
 * Role: Creative Technologist & Educational Flow Tool Expert
 */

import React, { useState, useCallback, useEffect } from 'react';
import { AspectRatio, Scene, ScriptFormConfig, ToastMessage, VideoModel, WorkflowStep } from './types';
import { Header } from './components/Header';
import { ProgressBar } from './components/ProgressBar';
import { Step1Scripting } from './components/steps/Step1Scripting';
import { Step2Images } from './components/steps/Step2Images';
import { Step3Production } from './components/steps/Step3Production';
import { ToastContainer } from './components/Toast';
import { Modal } from './components/primitives/Modal';
import { PillButton } from './components/primitives/PillButton';
import { generateScript } from './services/aiService';

// Initial educational lesson preset
const INITIAL_CONFIG: ScriptFormConfig = {
  gradeLevel: 'THCS',
  subject: 'Vật lý',
  lessonTitle: 'Định luật Vạn vật Hấp dẫn của Newton',
  rawContent:
    'Mọi vật thể có khối lượng trong vũ trụ đều hút nhau bằng một lực tỷ lệ thuận với tích khối lượng và tỷ lệ nghịch với bình phương khoảng cách giữa chúng. Lực này giữ Mặt Trăng quay quanh Trái Đất và tạo nên hiện tượng thủy triều.',
  voice: 'Bắc - Nữ thanh lịch',
  sceneCount: 4,
  durationPerScene: 8,
  aspectRatio: '16:9',
  videoModel: 'Omni Flash',
};

// Initial realistic scenes ready for immediate interaction
const INITIAL_SCENES: Scene[] = [
  {
    id: 'scene-1',
    sceneNumber: 1,
    title: 'Cảnh 1: Quả táo rơi & Câu hỏi vĩ đại',
    visualDescription:
      'Nhà bác học Isaac Newton ngồi dưới gốc cây táo, một quả táo rơi xuống đất, góc nhìn 3D mô phỏng vector lực hút hướng về tâm Trái Đất.',
    dialogue:
      'Tại sao quả táo luôn rơi thẳng xuống đất mà không bay lên trời? Đó chính là khởi đầu của định luật vạn vật hấp dẫn.',
    imagePrompt:
      'Isaac Newton under an apple tree in autumn, digital educational painting, apple falling with glowing vector arrows pointing down, 4k ultra-detailed, didactic presentation style.',
    videoPrompt:
      'Isaac Newton under an apple tree in autumn, apple falling with glowing vector arrows. Teacher gesturing passionately. Lip-sync speech: "Tại sao quả táo luôn rơi thẳng xuống đất mà không bay lên trời? Đó chính là khởi đầu của định luật vạn vật hấp dẫn."',
    duration: 8,
    imageStatus: 'completed',
    imageUrl:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720"><rect width="1280" height="720" fill="%230f172a"/><circle cx="640" cy="360" r="180" fill="%233b82f6" opacity="0.25"/><circle cx="640" cy="360" r="260" fill="none" stroke="%233b82f6" stroke-width="2" stroke-dasharray="10 8"/><circle cx="640" cy="240" r="32" fill="%23ef4444"/><path d="M640 280 L640 460" stroke="%23f59e0b" stroke-width="6" marker-end="url(%23arrow)"/><text x="640" y="520" fill="%23f8fafc" font-family="sans-serif" font-size="28" font-weight="bold" text-anchor="middle">LỰC HẤP DẪN NEWTON: F = G*(m1*m2)/r^2</text><text x="640" y="570" fill="%2394a3b8" font-family="sans-serif" font-size="18" text-anchor="middle">Quả táo rơi về tâm Trái Đất theo phương thẳng đứng</text></svg>',
    videoStatus: 'idle',
  },
  {
    id: 'scene-2',
    sceneNumber: 2,
    title: 'Cảnh 2: Quỹ đạo Mặt Trăng quanh Trái Đất',
    visualDescription:
      'Mô hình 3D không gian vũ trụ: Trái Đất màu xanh lam ở giữa, Mặt Trăng quay quanh theo quỹ đạo elip với sợi dây vô hình là lực hấp dẫn.',
    dialogue:
      'Lực hấp dẫn không chỉ giữ quả táo, mà còn giữ Mặt Trăng quay đều quanh Trái Đất suốt hàng tỷ năm qua.',
    imagePrompt:
      '3D space educational rendering, blue Earth with Moon orbiting in circular path, glowing gravitational field lines, scientific textbook quality, cinematic studio lighting.',
    videoPrompt:
      '3D space educational rendering of Earth and Moon orbit with glowing gravity lines. Teacher explaining with precision. Lip-sync speech: "Lực hấp dẫn không chỉ giữ quả táo, mà còn giữ Mặt Trăng quay đều quanh Trái Đất suốt hàng tỷ năm qua."',
    duration: 8,
    imageStatus: 'completed',
    imageUrl:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720"><rect width="1280" height="720" fill="%23090d16"/><circle cx="640" cy="360" r="80" fill="%230284c7"/><circle cx="640" cy="360" r="240" fill="none" stroke="%2338bdf8" stroke-width="2" stroke-dasharray="6 6"/><circle cx="880" cy="360" r="24" fill="%23cbd5e1"/><text x="640" y="140" fill="%23f8fafc" font-family="sans-serif" font-size="26" font-weight="bold" text-anchor="middle">QUỸ ĐẠO MẶT TRĂNG VÀ TRÁI ĐẤT</text><text x="640" y="180" fill="%2338bdf8" font-family="sans-serif" font-size="16" text-anchor="middle">Cân bằng giữa lực hấp dẫn và lực quán tính li tâm</text></svg>',
    videoStatus: 'idle',
  },
  {
    id: 'scene-3',
    sceneNumber: 3,
    title: 'Cảnh 3: Công thức toán học & Đại lượng',
    visualDescription:
      'Bảng đen tương tác hiển thị công thức F = G * (m1 * m2) / r^2, từng ký hiệu phát sáng và có nhãn giải thích đại lượng.',
    dialogue:
      'Khoảng cách càng tăng thì lực hút càng giảm rất nhanh theo bình phương, hãy luôn ghi nhớ điều này nhé!',
    imagePrompt:
      'Modern digital blackboard presenting mathematical gravity formula F=G*(m1*m2)/r^2, glowing cyan chalk typography, pedagogical graphics, 4k ultra-crisp.',
    videoPrompt:
      'Digital blackboard with glowing mathematical formula F=G*(m1*m2)/r^2. Teacher pointing to equation. Lip-sync speech: "Khoảng cách càng tăng thì lực hút càng giảm rất nhanh theo bình phương, hãy luôn ghi nhớ điều này nhé!"',
    duration: 8,
    imageStatus: 'completed',
    imageUrl:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720"><rect width="1280" height="720" fill="%23131b2e"/><rect x="200" y="180" width="880" height="340" rx="20" fill="%231e293b" stroke="%2306b6d4" stroke-width="2"/><text x="640" y="320" fill="%2338bdf8" font-family="monospace" font-size="48" font-weight="bold" text-anchor="middle">F = G · (m₁ · m₂) / r²</text><text x="640" y="390" fill="%23f1f5f9" font-family="sans-serif" font-size="20" text-anchor="middle">G: Hằng số hấp dẫn | r: Khoảng cách giữa 2 tâm vật</text><text x="640" y="440" fill="%23f59e0b" font-family="sans-serif" font-size="16" text-anchor="middle">Lực hút tỷ lệ nghịch với bình phương khoảng cách</text></svg>',
    videoStatus: 'idle',
  },
  {
    id: 'scene-4',
    sceneNumber: 4,
    title: 'Cảnh 4: Ứng dụng Thực tiễn & Thủy triều',
    visualDescription:
      'Hình ảnh đồ họa kết hợp thủy triều trên đại dương và vệ tinh nhân tạo GPS bay quanh Trái Đất.',
    dialogue:
      'Từ thủy triều đại dương đến vệ tinh định vị, định luật Newton đã mở ra kỷ nguyên chinh phục không gian.',
    imagePrompt:
      'Ocean tides with Earth and artificial satellites in orbit, dual split-screen educational diagram, futuristic yet accessible classroom graphics, 4k detail.',
    videoPrompt:
      'Ocean tides and orbiting GPS satellites around planet Earth. Teacher smiling and concluding lesson. Lip-sync speech: "Từ thủy triều đại dương đến vệ tinh định vị, định luật Newton đã mở ra kỷ nguyên chinh phục không gian."',
    duration: 8,
    imageStatus: 'completed',
    imageUrl:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720"><rect width="1280" height="720" fill="%230c1222"/><circle cx="400" cy="360" r="140" fill="%230284c7" opacity="0.8"/><circle cx="880" cy="360" r="90" fill="%23059669" opacity="0.7"/><text x="640" y="160" fill="%23f8fafc" font-family="sans-serif" font-size="28" font-weight="bold" text-anchor="middle">ỨNG DỤNG THỰC TIỄN CỦA ĐỊNH LUẬT</text><text x="400" y="560" fill="%2338bdf8" font-family="sans-serif" font-size="18" text-anchor="middle">Hiện tượng Thủy triều Đại dương</text><text x="880" y="560" fill="%2334d399" font-family="sans-serif" font-size="18" text-anchor="middle">Vệ tinh nhân tạo & Viễn thông</text></svg>',
    videoStatus: 'idle',
  },
];

export default function App() {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(1);
  const [config, setConfig] = useState<ScriptFormConfig>(INITIAL_CONFIG);
  const [scenes, setScenes] = useState<Scene[]>(INITIAL_SCENES);
  const [isGeneratingScript, setIsGeneratingScript] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [helpModalOpen, setHelpModalOpen] = useState<boolean>(false);

  // Toast Helper
  const showToast = useCallback(
    (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setToasts((prev) => [...prev, { id, type, title, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Update Config
  const handleConfigChange = useCallback((newPartial: Partial<ScriptFormConfig>) => {
    setConfig((prev) => ({ ...prev, ...newPartial }));
  }, []);

  // Update Scene
  const handleUpdateScene = useCallback((index: number, updated: Partial<Scene>) => {
    setScenes((prev) => {
      const next = [...prev];
      if (next[index]) {
        next[index] = { ...next[index], ...updated };
      }
      return next;
    });
  }, []);

  // Add Scene
  const handleAddScene = useCallback(() => {
    setScenes((prev) => {
      const num = prev.length + 1;
      const duration = config.durationPerScene || 8;
      const newScene: Scene = {
        id: `scene-${Date.now()}`,
        sceneNumber: num,
        title: `Cảnh ${num}: Phân đoạn bổ sung`,
        visualDescription: 'Mô tả hình ảnh đồ họa hoặc ví dụ minh họa bổ sung cho học sinh.',
        dialogue: 'Chúng ta hãy cùng xem xét kỹ hơn ví dụ thực tế này để nắm vững kiến thức.',
        imagePrompt: `Educational diagram explaining lesson ${config.lessonTitle}, pedagogical visual, 4k.`,
        videoPrompt: `Educational diagram of ${config.lessonTitle}. Teacher speaking clearly. Lip-sync speech: "Chúng ta hãy cùng xem xét kỹ hơn ví dụ thực tế này để nắm vững kiến thức."`,
        duration,
        imageStatus: 'idle',
        videoStatus: 'idle',
      };
      return [...prev, newScene];
    });
    showToast('info', 'Đã thêm cảnh mới', `Đã thêm Cảnh ${scenes.length + 1} vào kịch bản.`);
  }, [config.durationPerScene, config.lessonTitle, scenes.length, showToast]);

  // Remove Scene
  const handleRemoveScene = useCallback(
    (index: number) => {
      if (scenes.length <= 1) {
        showToast('warning', 'Không thể xóa', 'Bài giảng cần ít nhất 1 phân cảnh.');
        return;
      }
      setScenes((prev) => {
        const next = prev.filter((_, i) => i !== index);
        // re-index scene numbers
        return next.map((s, idx) => ({ ...s, sceneNumber: idx + 1 }));
      });
      showToast('info', 'Đã xóa cảnh', `Đã loại bỏ phân cảnh ${index + 1}.`);
    },
    [scenes.length, showToast]
  );

  // Generate Script via AI Service
  const handleGenerateScript = useCallback(async () => {
    setIsGeneratingScript(true);
    showToast('info', 'Đang biên kịch...', 'AI đang phân tích kiến thức và chia thành các phân cảnh chuẩn 2.5 từ/s.');

    try {
      const res = await generateScript(config);

      if (res && res.scenes && res.scenes.length > 0) {
        const formattedScenes: Scene[] = res.scenes.map((s, idx) => ({
          id: `scene-${Date.now()}-${idx}`,
          sceneNumber: s.sceneNumber || idx + 1,
          title: s.title || `Cảnh ${idx + 1}`,
          visualDescription: s.visualDescription || '',
          dialogue: s.dialogue || '',
          imagePrompt: s.imagePrompt || '',
          videoPrompt: s.videoPrompt || `${s.imagePrompt}. Lip-sync speech: "${s.dialogue}"`,
          duration: s.duration || config.durationPerScene || 8,
          imageStatus: 'idle',
          videoStatus: 'idle',
        }));

        setScenes(formattedScenes);
        showToast('success', 'Biên kịch thành công!', `Đã tạo kịch bản ${formattedScenes.length} cảnh cho môn ${config.subject}.`);
      }
    } catch (err: any) {
      console.error('Script generation error:', err);
      showToast('error', 'Biên kịch thất bại', err.message || 'Không thể tạo kịch bản lúc này.');
    } finally {
      setIsGeneratingScript(false);
    }
  }, [config, showToast]);

  // Reset Project
  const handleReset = useCallback(() => {
    if (window.confirm('Bạn có chắc muốn làm mới toàn bộ bài giảng về trạng thái ban đầu?')) {
      setConfig(INITIAL_CONFIG);
      setScenes(INITIAL_SCENES);
      setCurrentStep(1);
      showToast('info', 'Đã làm mới', 'Dự án đã được đưa về kịch bản mẫu.');
    }
  }, [showToast]);

  // Step access check
  const imagesReadyCount = scenes.filter((s) => s.imageStatus === 'completed' && s.imageUrl).length;
  const videosReadyCount = scenes.filter((s) => s.videoStatus === 'completed').length;
  const canNavigateToStep2 = scenes.length > 0;
  const canNavigateToStep3 = scenes.length > 0 && imagesReadyCount > 0;

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-neutral-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* App Header */}
      <Header
        lessonTitle={config.lessonTitle}
        subject={config.subject}
        onReset={handleReset}
        onOpenHelp={() => setHelpModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col">
        {/* 3-Step Interactive ProgressBar */}
        <ProgressBar
          currentStep={currentStep}
          onSelectStep={(step) => setCurrentStep(step)}
          canNavigateToStep2={canNavigateToStep2}
          canNavigateToStep3={canNavigateToStep3}
          sceneCount={scenes.length}
          imagesReadyCount={imagesReadyCount}
          videosReadyCount={videosReadyCount}
        />

        {/* View Switcher by Current Step */}
        <div className="flex-1 mt-2">
          {currentStep === 1 && (
            <Step1Scripting
              config={config}
              onChangeConfig={handleConfigChange}
              scenes={scenes}
              onUpdateScene={handleUpdateScene}
              onAddScene={handleAddScene}
              onRemoveScene={handleRemoveScene}
              onGenerateScript={handleGenerateScript}
              onProceedToStep2={() => setCurrentStep(2)}
              isGenerating={isGeneratingScript}
            />
          )}

          {currentStep === 2 && (
            <Step2Images
              scenes={scenes}
              aspectRatio={config.aspectRatio}
              subject={config.subject}
              lessonTitle={config.lessonTitle}
              onUpdateScene={handleUpdateScene}
              onBackToStep1={() => setCurrentStep(1)}
              onProceedToStep3={() => setCurrentStep(3)}
              onShowToast={showToast}
            />
          )}

          {currentStep === 3 && (
            <Step3Production
              scenes={scenes}
              aspectRatio={config.aspectRatio}
              videoModel={config.videoModel}
              voice={config.voice}
              lessonTitle={config.lessonTitle}
              subject={config.subject}
              onChangeModel={(m: VideoModel) => handleConfigChange({ videoModel: m })}
              onUpdateScene={handleUpdateScene}
              onBackToStep2={() => setCurrentStep(2)}
              onShowToast={showToast}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-[#0a0a0a] py-6 px-4 text-center text-xs text-neutral-400 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-300">EDUFLOW STUDIO</span>
            <span className="text-neutral-500">•</span>
            <span>Flow Tool Chuyên Gia Giáo Dục</span>
          </div>
          <div className="text-neutral-400">
            Quy trình: <strong className="text-amber-400">Biên kịch (2.5 từ/s)</strong> ➔{' '}
            <strong className="text-amber-400">Nano Banana Pro</strong> ➔{' '}
            <strong className="text-amber-400">Veo 3.1 Lip-sync</strong>
          </div>
        </div>
      </footer>

      {/* Help Modal */}
      {helpModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setHelpModalOpen(false)}
          title="Hướng dẫn Quy trình Tạo Video Bài Giảng 3 Bước"
          subtitle="Tư duy thiết kế Flow Tool dành riêng cho Giáo viên & Chuyên gia Giáo dục"
          icon="school"
          maxWidth="2xl"
          footer={
            <PillButton variant="filled" size="sm" onClick={() => setHelpModalOpen(false)}>
              Đã hiểu, Bắt đầu sáng tạo
            </PillButton>
          }
        >
          <div className="space-y-4 text-xs sm:text-sm text-neutral-300 leading-relaxed">
            <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
              <h4 className="font-bold text-amber-400 flex items-center gap-1.5 text-sm mb-1">
                <span className="material-symbols-outlined text-[18px]">looks_one</span>
                Bước 1: Biên kịch (AI Scripting) & Quy tắc 2.5 từ/giây
              </h4>
              <p>
                Chọn cấp học, môn học và nhập nội dung thô (hoặc dùng các nút "Mẫu nhanh"). AI sẽ tự động phân cảnh.
                Đặc biệt, hệ thống áp dụng quy tắc <strong className="text-amber-300">2.5 từ/giây</strong>: Nếu lời thoại
                quá dài so với thời lượng cảnh, cảnh báo đỏ sẽ hiển thị kèm nút{' '}
                <strong className="text-amber-300">"AI Rút gọn"</strong> để nén câu từ vừa khít nhịp nói.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
              <h4 className="font-bold text-amber-400 flex items-center gap-1.5 text-sm mb-1">
                <span className="material-symbols-outlined text-[18px]">looks_two</span>
                Bước 2: Tạo hình ảnh bài giảng (🍌 Nano Banana Pro)
              </h4>
              <p>
                Hiển thị danh sách cảnh dưới dạng Grid. Giáo viên có thể bấm "Tạo tất cả ảnh" (Batch Generation) kèm
                thanh tiến trình trực quan, hoặc tạo từng ảnh với model 🍌 Nano Banana Pro. Bạn cũng có thể tải ảnh từ
                máy tính bằng <code className="text-amber-300 font-mono">Flow.media.select</code>.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
              <h4 className="font-bold text-amber-400 flex items-center gap-1.5 text-sm mb-1">
                <span className="material-symbols-outlined text-[18px]">looks_3</span>
                Bước 3: Xuất Video & Khớp Khẩu hình (Lip-sync Production)
              </h4>
              <p>
                Sử dụng ảnh từ Bước 2 làm <code className="text-amber-300 font-mono">firstFrameImageMediaId</code>.
                Prompt video được AI tự động lồng ghép nội dung lời thoại vào cuối để đảm bảo đồng bộ khẩu hình.
                Lựa chọn giữa Omni Flash hoặc Veo 3.1 (Lite, Fast, Quality), xem trước video với âm thanh sư phạm và tải
                về máy qua <code className="text-amber-300 font-mono">Flow.download</code>.
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* Floating Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
