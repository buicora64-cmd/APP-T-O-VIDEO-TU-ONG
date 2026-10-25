import React, { useState } from 'react';
import { AspectRatio, Scene, ScriptFormConfig, VideoModel } from '../../types';
import { PillButton } from '../primitives/PillButton';
import { FieldDropdown } from '../primitives/FieldDropdown';
import { TextInput } from '../primitives/TextInput';
import { checkWordLimit, countWords, getWordLimit, shortenDialogue } from '../../services/aiService';

interface Step1ScriptingProps {
  config: ScriptFormConfig;
  onChangeConfig: (newConfig: Partial<ScriptFormConfig>) => void;
  scenes: Scene[];
  onUpdateScene: (index: number, updated: Partial<Scene>) => void;
  onAddScene: () => void;
  onRemoveScene: (index: number) => void;
  onGenerateScript: () => Promise<void>;
  onProceedToStep2: () => void;
  isGenerating: boolean;
}

export const Step1Scripting: React.FC<Step1ScriptingProps> = ({
  config,
  onChangeConfig,
  scenes,
  onUpdateScene,
  onAddScene,
  onRemoveScene,
  onGenerateScript,
  onProceedToStep2,
  isGenerating,
}) => {
  const [activePreset, setActivePreset] = useState<string>('');

  // Pre-configured educational lesson samples for teachers
  const lessonPresets = [
    {
      label: 'Vật lý 8: Định luật Newton',
      grade: 'THCS',
      subject: 'Vật lý',
      title: 'Định luật Vạn vật Hấp dẫn của Newton',
      raw: 'Khái niệm lực hấp dẫn giữa mọi vật thể trong vũ trụ. Quả táo rơi và quỹ đạo Mặt Trăng quay quanh Trái Đất. Công thức F = G*(m1*m2)/r^2. Ý nghĩa thực tiễn với vệ tinh nhân tạo và thủy triều.',
    },
    {
      label: 'Sinh học 6: Sự Quang Hợp',
      grade: 'THCS',
      subject: 'Sinh học',
      title: 'Quang hợp và Vai trò của Diệp lục',
      raw: 'Cây xanh hấp thụ nước qua rễ và CO2 qua khí khổng dưới ánh sáng mặt trời. Lục lạp chứa diệp lục biến đổi năng lượng ánh sáng thành hóa năng tạo tinh bột và nhả khí O2 duy trì sự sống cho Trái Đất.',
    },
    {
      label: 'Lịch sử 9: Điện Biên Phủ 1954',
      grade: 'THCS',
      subject: 'Lịch sử',
      title: 'Chiến thắng Điện Biên Phủ 1954',
      raw: 'Tập đoàn cứ điểm Điện Biên Phủ của Pháp. Kế hoạch tác chiến "Đánh chắc tiến chắc" của Đại tướng Võ Nguyên Giáp. Kéo pháo vào trận địa, đào hào siết chặt vòng vây. Tướng De Castries đầu hàng chiều 7/5/1954.',
    },
    {
      label: 'Toán 10: Vectơ trong Mặt phẳng',
      grade: 'THPT',
      subject: 'Toán học',
      title: 'Khái niệm và Phép toán Vectơ',
      raw: 'Định nghĩa đoạn thẳng có hướng. Điểm đầu, điểm cuối, độ dài và hướng. Quy tắc ba điểm, quy tắc hình bình hành. Ứng dụng mô tả lực kéo trong cơ học và chuyển động thuyền trên dòng nước.',
    },
  ];

  const applyPreset = (preset: (typeof lessonPresets)[0]) => {
    setActivePreset(preset.title);
    onChangeConfig({
      gradeLevel: preset.grade,
      subject: preset.subject,
      lessonTitle: preset.title,
      rawContent: preset.raw,
    });
  };

  // Handler for shortening dialogue of a specific scene
  const handleShortenSceneDialogue = async (index: number) => {
    const scene = scenes[index];
    if (!scene || scene.isShortening) return;

    onUpdateScene(index, { isShortening: true });
    try {
      const maxWords = getWordLimit(scene.duration);
      const res = await shortenDialogue(
        scene.dialogue,
        maxWords,
        scene.duration,
        config.subject,
        config.lessonTitle
      );

      // Also update videoPrompt to sync lip-sync dialogue
      const updatedPrompt = scene.videoPrompt.replace(
        /Lip-sync speech: ".*?"/,
        `Lip-sync speech: "${res.shortenedDialogue}"`
      );

      onUpdateScene(index, {
        dialogue: res.shortenedDialogue,
        videoPrompt: updatedPrompt.includes('Lip-sync')
          ? updatedPrompt
          : `${scene.imagePrompt}. Lip-sync speech: "${res.shortenedDialogue}"`,
        isShortening: false,
      });
    } catch (err: any) {
      console.error('Failed to shorten dialogue:', err);
      alert(`Không thể rút gọn lời thoại: ${err.message || 'Lỗi kết nối'}`);
      onUpdateScene(index, { isShortening: false });
    }
  };

  // Grade level options
  const gradeOptions = [
    { value: 'Tiểu học', label: 'Cấp 1: Tiểu học (Lớp 1-5)', icon: 'child_care' },
    { value: 'THCS', label: 'Cấp 2: THCS (Lớp 6-9)', icon: 'school' },
    { value: 'THPT', label: 'Cấp 3: THPT (Lớp 10-12)', icon: 'history_edu' },
    { value: 'Đại học', label: 'Đại học & Sau đại học', icon: 'account_balance' },
    { value: 'Kỹ năng & Ngoại ngữ', label: 'Khóa học Kỹ năng / Tiếng Anh', icon: 'language' },
  ];

  // Subject options
  const subjectOptions = [
    { value: 'Toán học', label: 'Toán học', icon: 'calculate' },
    { value: 'Vật lý', label: 'Vật lý', icon: 'science' },
    { value: 'Hóa học', label: 'Hóa học', icon: 'experiment' },
    { value: 'Sinh học', label: 'Sinh học', icon: 'psychiatry' },
    { value: 'Lịch sử', label: 'Lịch sử', icon: 'museum' },
    { value: 'Địa lý', label: 'Địa lý', icon: 'public' },
    { value: 'Ngữ văn', label: 'Ngữ văn', icon: 'menu_book' },
    { value: 'Tiếng Anh', label: 'Tiếng Anh', icon: 'translate' },
    { value: 'Tin học', label: 'Tin học / Lập trình', icon: 'terminal' },
    { value: 'Kỹ năng mềm', label: 'Kỹ năng sống & Giao tiếp', icon: 'groups' },
  ];

  // Voice options
  const voiceOptions = [
    { value: 'Bắc - Nữ thanh lịch', label: 'Giọng Bắc - Nữ thanh lịch, chuẩn sư phạm', icon: 'record_voice_over' },
    { value: 'Bắc - Nam đĩnh đạc', label: 'Giọng Bắc - Nam đĩnh đạc, ấm áp', icon: 'record_voice_over' },
    { value: 'Nam Bộ - Nữ truyền cảm', label: 'Giọng Nam Bộ - Nữ truyền cảm, ngọt ngào', icon: 'record_voice_over' },
    { value: 'Nam Bộ - Nam hào sảng', label: 'Giọng Nam Bộ - Nam hào sảng, rõ ràng', icon: 'record_voice_over' },
    { value: 'Miền Trung - Ấm áp', label: 'Giọng Miền Trung - Thân thiện, gần gũi', icon: 'record_voice_over' },
  ];

  // Aspect ratio options
  const aspectOptions = [
    { value: '16:9', label: '16:9 Ngang (YouTube, Bài giảng chiếu bảng)', icon: 'crop_16_9' },
    { value: '9:16', label: '9:16 Dọc (TikTok, Shorts, Reels giáo dục)', icon: 'crop_portrait' },
    { value: '1:1', label: '1:1 Vuông (Mạng xã hội, Feed bài học)', icon: 'crop_square' },
    { value: '4:3', label: '4:3 Khung hình kinh điển', icon: 'crop_5_4' },
  ];

  // Video model options
  const modelOptions = [
    { value: 'Omni Flash', label: 'Omni Flash (Khuyên dùng: Siêu nhanh, lip-sync chuẩn)', icon: 'bolt' },
    { value: 'Veo 3.1 - Lite', label: 'Veo 3.1 - Lite (Cân bằng tốc độ & chuyển động sư phạm)', icon: 'speed' },
    { value: 'Veo 3.1 - Fast', label: 'Veo 3.1 - Fast (Tốc độ khởi xuất nhanh)', icon: 'rocket_launch' },
    { value: 'Veo 3.1 - Quality', label: 'Veo 3.1 - Quality (Chất lượng điện ảnh 1080p sắc nét)', icon: 'hd' },
  ];

  // Total word calculation
  const totalWords = scenes.reduce((acc, s) => acc + countWords(s.dialogue), 0);
  const totalDuration = scenes.reduce((acc, s) => acc + s.duration, 0);
  const exceededCount = scenes.filter((s) => checkWordLimit(s.dialogue, s.duration).isExceeded).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300" id="step1-container">
      {/* Top Banner & Presets */}
      <div className="bg-gradient-to-r from-neutral-900 via-[#151515] to-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Bước 1: Biên kịch (AI Scripting)
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                Chuẩn: 2.5 từ/giây (Lip-sync Timing)
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1 tracking-tight">
              Khởi tạo Kịch bản & Cấu hình Thông số Bài giảng
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Nhập nội dung bài dạy hoặc bấm chọn mẫu giáo án nhanh dưới đây để AI phân cảnh tự động:
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-neutral-400 font-medium">Mẫu nhanh:</span>
            {lessonPresets.map((p) => (
              <button
                key={p.title}
                type="button"
                onClick={() => applyPreset(p)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  activePreset === p.title
                    ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-semibold'
                    : 'border-neutral-700/80 bg-neutral-800/60 text-neutral-300 hover:border-neutral-600 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Form Left, Scenes Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Inputs & Configuration */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-[#121212] border border-neutral-800/90 rounded-2xl p-5 space-y-4 shadow-lg">
            <div className="flex items-center gap-2 pb-2 border-b border-neutral-800/80">
              <span className="material-symbols-outlined text-amber-400 text-[20px]">assignment</span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-200">
                Thông tin bài giảng
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FieldDropdown
                label="Cấp học"
                icon="school"
                options={gradeOptions}
                value={config.gradeLevel}
                onChange={(val) => onChangeConfig({ gradeLevel: val })}
              />

              <FieldDropdown
                label="Môn học"
                icon="category"
                options={subjectOptions}
                value={config.subject}
                onChange={(val) => onChangeConfig({ subject: val })}
              />
            </div>

            <TextInput
              label="Tên bài học"
              icon="title"
              placeholder="VD: Định luật Vạn vật Hấp dẫn của Newton"
              value={config.lessonTitle}
              onChange={(val) => onChangeConfig({ lessonTitle: val })}
            />

            <TextInput
              label="Nội dung thô / Tóm tắt giáo án"
              icon="description"
              placeholder="Dán nội dung sách giáo khoa, ghi chú hoặc ý tưởng chính của bài giảng tại đây..."
              multiline
              rows={4}
              value={config.rawContent}
              onChange={(val) => onChangeConfig({ rawContent: val })}
              helperText="AI sẽ trích xuất kiến thức cốt lõi và phân chia thành các phân cảnh hợp lý."
            />
          </div>

          {/* Technical & Production Configurations */}
          <div className="bg-[#121212] border border-neutral-800/90 rounded-2xl p-5 space-y-4 shadow-lg">
            <div className="flex items-center gap-2 pb-2 border-b border-neutral-800/80">
              <span className="material-symbols-outlined text-amber-400 text-[20px]">tune</span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-200">
                Cấu hình Video & Giọng đọc
              </h3>
            </div>

            <FieldDropdown
              label="Giọng đọc (Vùng miền & Phong cách)"
              icon="record_voice_over"
              options={voiceOptions}
              value={config.voice}
              onChange={(val) => onChangeConfig({ voice: val })}
            />

            <div className="grid grid-cols-2 gap-3">
              {/* Scene Count Slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-amber-500">format_list_numbered</span>
                    Số cảnh
                  </span>
                  <span className="text-amber-400 font-bold font-mono">{config.sceneCount} cảnh</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={8}
                  step={1}
                  value={config.sceneCount}
                  onChange={(e) => onChangeConfig({ sceneCount: parseInt(e.target.value, 10) })}
                  className="w-full accent-amber-500 bg-neutral-800 h-2 rounded-lg cursor-pointer"
                />
                <span className="text-[11px] text-neutral-400">Từ 2 đến 8 phân cảnh</span>
              </div>

              {/* Duration per scene Slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-amber-500">timer</span>
                    Thời lượng/Cảnh
                  </span>
                  <span className="text-amber-400 font-bold font-mono">{config.durationPerScene}s</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={12}
                  step={1}
                  value={config.durationPerScene}
                  onChange={(e) => onChangeConfig({ durationPerScene: parseInt(e.target.value, 10) })}
                  className="w-full accent-amber-500 bg-neutral-800 h-2 rounded-lg cursor-pointer"
                />
                <span className="text-[11px] text-neutral-400">
                  Tối đa: {Math.floor(config.durationPerScene * 2.5)} từ (2.5 từ/s)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FieldDropdown
                label="Tỷ lệ khung hình"
                icon="aspect_ratio"
                options={aspectOptions}
                value={config.aspectRatio}
                onChange={(val) => onChangeConfig({ aspectRatio: val as AspectRatio })}
              />

              <FieldDropdown
                label="Model Video"
                icon="smart_display"
                options={modelOptions}
                value={config.videoModel}
                onChange={(val) => onChangeConfig({ videoModel: val as VideoModel })}
              />
            </div>

            {/* AI Generate Button */}
            <div className="pt-2">
              <PillButton
                variant="filled"
                size="lg"
                className="w-full shadow-amber-500/25"
                icon="auto_awesome"
                loading={isGenerating}
                onClick={onGenerateScript}
              >
                {isGenerating ? 'AI đang biên kịch bài giảng...' : 'Biên soạn Kịch bản với AI'}
              </PillButton>
            </div>
          </div>
        </div>

        {/* Right Column: Scenes List & Live Lip-sync Timing Rules */}
        <div className="lg:col-span-7 space-y-4">
          {/* Header Bar of Scenes Section */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#121212] border border-neutral-800/90 rounded-2xl">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-400">theaters</span>
                  Danh sách phân cảnh bài giảng
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-mono font-medium">
                  {scenes.length} Cảnh
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Tổng thời lượng: <strong className="text-amber-400 font-mono">{totalDuration}s</strong> | Tổng từ: <strong className="text-neutral-200 font-mono">{totalWords} từ</strong>
                {exceededCount > 0 && (
                  <span className="ml-2 text-red-400 font-semibold inline-flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[14px]">warning</span>
                    {exceededCount} cảnh vượt thời lượng!
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <PillButton variant="outline" size="sm" icon="add" onClick={onAddScene}>
                Thêm cảnh
              </PillButton>

              {scenes.length > 0 && (
                <PillButton
                  variant="filled"
                  size="sm"
                  icon="arrow_forward"
                  iconPosition="right"
                  onClick={onProceedToStep2}
                >
                  Bước 2: Tạo ảnh
                </PillButton>
              )}
            </div>
          </div>

          {/* Rule 2.5 words/sec Explainer Callout */}
          <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-neutral-300 flex items-start gap-2.5">
            <span className="material-symbols-outlined text-amber-400 text-[20px] shrink-0 mt-0.5">info</span>
            <div>
              <strong className="text-amber-300 font-semibold">Quy tắc nhịp điệu Lip-sync (2.5 từ/giây): </strong>
              Để khẩu hình video và giọng đọc khớp tự nhiên, lời thoại mỗi cảnh không được vượt quá{' '}
              <span className="font-mono text-amber-300 font-bold">[Thời lượng] × 2.5 từ</span>. Nếu thanh cảnh báo màu đỏ xuất hiện, bấm nút{' '}
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">
                <span className="material-symbols-outlined text-[12px]">auto_fix_high</span> AI Rút gọn
              </span>{' '}
              để tự động tối ưu tức thì.
            </div>
          </div>

          {/* Scene Cards */}
          {scenes.length === 0 ? (
            <div className="border border-dashed border-neutral-800 rounded-2xl p-12 text-center bg-[#111111]/40 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500 mb-4">
                <span className="material-symbols-outlined text-[32px]">auto_awesome_motion</span>
              </div>
              <h4 className="text-base font-bold text-neutral-200">Chưa có kịch bản</h4>
              <p className="text-xs text-neutral-400 max-w-md mt-1 mb-5">
                Nhập thông tin môn học và tên bài bên trái, sau đó bấm "Biên soạn Kịch bản với AI" để sinh kịch bản chi tiết.
              </p>
              <PillButton
                variant="filled"
                size="md"
                icon="auto_awesome"
                loading={isGenerating}
                onClick={onGenerateScript}
              >
                Tạo Kịch Bản Mẫu Ngay
              </PillButton>
            </div>
          ) : (
            <div className="space-y-4">
              {scenes.map((scene, idx) => {
                const { wordCount, maxWords, isExceeded, diff } = checkWordLimit(
                  scene.dialogue,
                  scene.duration
                );

                return (
                  <div
                    key={scene.id || idx}
                    className={`rounded-2xl border transition-all duration-200 bg-[#141414] overflow-hidden ${
                      isExceeded
                        ? 'border-red-500/70 shadow-lg shadow-red-500/5 ring-1 ring-red-500/30'
                        : 'border-neutral-800/80 hover:border-neutral-700'
                    }`}
                  >
                    {/* Scene Card Header */}
                    <div className="flex items-center justify-between p-3.5 border-b border-neutral-800/60 bg-neutral-900/40">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs font-bold font-mono text-amber-400">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={scene.title}
                          onChange={(e) => onUpdateScene(idx, { title: e.target.value })}
                          className="text-sm font-bold text-neutral-100 bg-transparent border-b border-transparent hover:border-neutral-700 focus:border-amber-500 outline-none px-1"
                        />
                      </div>

                      {/* Scene timing selector & Remove */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-800/80 border border-neutral-700/60 text-xs">
                          <span className="material-symbols-outlined text-[16px] text-amber-400">timer</span>
                          <select
                            value={scene.duration}
                            onChange={(e) =>
                              onUpdateScene(idx, { duration: parseInt(e.target.value, 10) })
                            }
                            className="bg-transparent text-neutral-200 font-mono font-semibold outline-none cursor-pointer"
                          >
                            {[5, 6, 7, 8, 9, 10, 11, 12].map((s) => (
                              <option key={s} value={s} className="bg-neutral-900 text-white">
                                {s} giây
                              </option>
                            ))}
                          </select>
                        </div>

                        {scenes.length > 1 && (
                          <button
                            type="button"
                            title="Xóa cảnh"
                            onClick={() => onRemoveScene(idx)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Scene Card Body */}
                    <div className="p-4 space-y-3.5">
                      {/* Visual Description */}
                      <TextInput
                        label="Mô tả trực quan cảnh bài giảng"
                        icon="visibility"
                        placeholder="Mô tả các yếu tố đồ họa, thí nghiệm, bảng tương tác xuất hiện..."
                        value={scene.visualDescription}
                        onChange={(val) => onUpdateScene(idx, { visualDescription: val })}
                      />

                      {/* Dialogue Input with 2.5 words/sec limit indicator & AI Shorten button */}
                      <div>
                        <TextInput
                          label="Lời giảng của giáo viên (Đồng bộ Khẩu hình)"
                          icon="mic"
                          placeholder="Lời nói của giáo viên trong phân cảnh này..."
                          multiline
                          rows={2}
                          value={scene.dialogue}
                          onChange={(val) => {
                            onUpdateScene(idx, {
                              dialogue: val,
                              videoPrompt: `${scene.imagePrompt}. Lip-sync speech: "${val}"`,
                            });
                          }}
                          showWordCount
                          maxWords={maxWords}
                          actionButton={
                            isExceeded ? (
                              <PillButton
                                variant="filled"
                                size="sm"
                                icon="auto_fix_high"
                                loading={scene.isShortening}
                                onClick={() => handleShortenSceneDialogue(idx)}
                                className="bg-gradient-to-r from-red-500 to-amber-500 text-white shadow-md shadow-red-500/20 text-xs py-1 px-2.5 h-7"
                              >
                                {scene.isShortening ? 'Đang nén...' : 'AI Rút gọn'}
                              </PillButton>
                            ) : null
                          }
                          warning={
                            isExceeded
                              ? `⚠️ Vượt quá ${diff} từ so với chuẩn ${scene.duration}s (${wordCount}/${maxWords} từ). Hãy bấm nút "AI Rút gọn" để tối ưu nhịp nói!`
                              : undefined
                          }
                        />
                      </div>

                      {/* Prompts preview toggle */}
                      <div className="pt-1">
                        <details className="text-xs text-neutral-400 group">
                          <summary className="cursor-pointer text-neutral-400 hover:text-amber-400 font-semibold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px] group-open:rotate-90 transition-transform">
                              chevron_right
                            </span>
                            Xem Prompt Hình ảnh & Video (Đã lồng ghép Lip-sync)
                          </summary>
                          <div className="mt-2 p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-2 font-mono text-[11px] leading-relaxed">
                            <div>
                              <span className="text-amber-400 font-bold">Image Prompt:</span>{' '}
                              <span className="text-neutral-300">{scene.imagePrompt}</span>
                            </div>
                            <div className="border-t border-neutral-900 pt-1.5">
                              <span className="text-cyan-400 font-bold">Video Lip-sync Prompt:</span>{' '}
                              <span className="text-neutral-300">{scene.videoPrompt}</span>
                            </div>
                          </div>
                        </details>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Next Step Button */}
          {scenes.length > 0 && (
            <div className="flex items-center justify-end pt-4">
              <PillButton
                variant="filled"
                size="lg"
                icon="arrow_forward"
                iconPosition="right"
                onClick={onProceedToStep2}
              >
                Chuyển sang Bước 2: Tạo hình ảnh bài giảng ({scenes.length} cảnh)
              </PillButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
