/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ReactionDetail, ReactionCategory } from './types/chemistry';
import { REACTIONS_DATA } from './data/reactions';
import { LabCanvas } from './components/LabCanvas';
import { ControlPanel } from './components/ControlPanel';
import { EquationCard } from './components/EquationCard';
import { ReactionSelector } from './components/ReactionSelector';
import { TeacherPromptModal } from './components/TeacherPromptModal';
import { MicroscopeIonView } from './components/MicroscopeIonView';
import { FreeLabMixer } from './components/FreeLabMixer';
import {
  FlaskConical,
  GraduationCap,
  Sparkles,
  Maximize2,
  Minimize2,
  Droplet,
  Wind,
  Layers,
  Flame,
} from 'lucide-react';

const FEATURED_PRESETS = [
  { id: 'bacl2_h2so4', label: 'BaSO4 (Barium sulfate)', icon: <Sparkles className="w-3 h-3 text-cyan-400" /> },
  { id: 'cuso4_naoh', label: 'Cu(OH)2 (Copper(II) hydroxide)', icon: <Sparkles className="w-3 h-3 text-blue-400" /> },
  { id: 'pbno32_ki', label: 'PbI2 ("Mưa vàng" Lead(II) iodide)', icon: <Sparkles className="w-3 h-3 text-yellow-400" /> },
  { id: 'caco3_hcl', label: 'CaCO3 + HCl (Khí Carbon dioxide)', icon: <Wind className="w-3 h-3 text-emerald-400" /> },
  { id: 'na2so3_h2so4', label: 'Na2SO3 + H2SO4 (Khí Sulfur dioxide)', icon: <Wind className="w-3 h-3 text-amber-400" /> },
  { id: 'fe_cuso4', label: 'Fe + CuSO4 (Kim loại Copper)', icon: <Layers className="w-3 h-3 text-orange-400" /> },
  { id: 'zn_agno3', label: 'Zn + AgNO3 ("Cây bạc" Silver)', icon: <Layers className="w-3 h-3 text-slate-300" /> },
  { id: 'hcl_naoh_phenolphthalein', label: 'HCl + NaOH (Trung hòa)', icon: <Droplet className="w-3 h-3 text-pink-400" /> },
  { id: 'cl2_ki_starch', label: 'Cl2 + KI (Thử hồ tinh bột)', icon: <Flame className="w-3 h-3 text-purple-400" /> },
];

export default function App() {
  const [selectedReaction, setSelectedReaction] = useState<ReactionDetail>(REACTIONS_DATA[2]); // BaCl2 + H2SO4 mặc định
  const [selectedCategory, setSelectedCategory] = useState<ReactionCategory | 'all'>('precipitation');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'syllabus' | 'free_mix' | 'solubility_guide'>('syllabus');

  // Trạng thái mô phỏng
  const [simulationState, setSimulationState] = useState<'idle' | 'running' | 'completed'>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(1);
  const [showAnnotations, setShowAnnotations] = useState<boolean>(true);

  // Bộ dụng cụ thử nghiệm
  const [splintActive, setSplintActive] = useState<boolean>(false);
  const [starchActive, setStarchActive] = useState<boolean>(false);
  const [litmusActive, setLitmusActive] = useState<boolean>(false);
  const [thermometerActive, setThermometerActive] = useState<boolean>(false);

  // Cửa sổ tương tác
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState<boolean>(false);
  const [isIonModalOpen, setIsIonModalOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const animTimerRef = useRef<number | null>(null);

  // Điều khiển hoạt ảnh mô phỏng
  useEffect(() => {
    if (simulationState !== 'running') return;

    let startTime: number | null = null;
    const baseDurationMs = 3600;
    const duration = baseDurationMs / speed;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const nextProgress = Math.min(1, elapsed / duration);

      setProgress(nextProgress);

      if (nextProgress < 1) {
        animTimerRef.current = requestAnimationFrame(step);
      } else {
        setSimulationState('completed');
      }
    };

    animTimerRef.current = requestAnimationFrame(step);

    return () => {
      if (animTimerRef.current) {
        cancelAnimationFrame(animTimerRef.current);
      }
    };
  }, [simulationState, speed]);

  const handleStart = () => {
    if (simulationState === 'running') return;
    setSimulationState('running');
  };

  const handleReset = () => {
    if (animTimerRef.current) {
      cancelAnimationFrame(animTimerRef.current);
    }
    setSimulationState('idle');
    setProgress(0);
    setSplintActive(false);
    setStarchActive(false);
    setLitmusActive(false);
  };

  const handleSelectReaction = (reaction: ReactionDetail) => {
    handleReset();
    setSelectedReaction(reaction);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* 1. Header Bar: Tinh gọn & Hiện đại */}
      <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-md sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1480px] mx-auto px-3 sm:px-4 h-12 flex items-center justify-between gap-3">
          {/* Logo & Tên ứng dụng */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-sm shadow-cyan-500/20">
              <FlaskConical className="w-3.5 h-3.5" />
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-bold tracking-tight text-white whitespace-nowrap">
                Phòng Thí Nghiệm Ảo: Hiện Tượng Hóa Học Trong Dung Dịch
              </h1>
              <div className="text-[9px] text-slate-400 hidden sm:block">
                Hóa học THCS & THPT · Tên chất chuẩn danh pháp IUPAC
              </div>
            </div>
          </div>

          {/* Nút tác vụ */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsTeacherModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm cursor-pointer whitespace-nowrap"
              title="Mở lời dẫn sư phạm cho giáo viên"
            >
              <GraduationCap className="w-3 h-3" />
              <span>Gợi ý GV</span>
            </button>

            <button
              onClick={handleToggleFullscreen}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer border border-slate-800"
              title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* 2. Bàn thí nghiệm chính (Bố cục 2 cột tinh gọn) */}
      <main className="flex-1 max-w-[1480px] w-full mx-auto p-2 sm:p-3 flex flex-col gap-2">
        {/* Thanh chọn nhanh bài thí nghiệm tiêu biểu */}
        <div className="w-full bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800/80 shadow-sm flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1 pr-1">
            <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
            <span>Thử nhanh:</span>
          </span>

          {FEATURED_PRESETS.map((p) => {
            const isCurrent = selectedReaction.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  const match = REACTIONS_DATA.find((r) => r.id === p.id);
                  if (match) handleSelectReaction(match);
                }}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm ring-1 ring-cyan-400'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60'
                }`}
              >
                {p.icon}
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Khung tương tác 2 cột */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-start">
          {/* CỘT TRÁI: Khu vực mô phỏng ống nghiệm + Thanh điều khiển + Thẻ phương trình (7/12 cột) */}
          <div className="lg:col-span-7 flex flex-col gap-2">
            {/* Khung mô phỏng đồ họa thủy tinh */}
            <div className="h-[310px] sm:h-[340px] w-full">
              <LabCanvas
                reaction={selectedReaction}
                simulationState={simulationState}
                progress={progress}
                showAnnotations={showAnnotations}
                onStart={handleStart}
                onReset={handleReset}
                splintActive={splintActive}
                onToggleSplint={() => setSplintActive(!splintActive)}
                starchActive={starchActive}
                onToggleStarch={() => setStarchActive(!starchActive)}
                litmusActive={litmusActive}
                onToggleLitmus={() => setLitmusActive(!litmusActive)}
                thermometerActive={thermometerActive}
                onToggleThermometer={() => setThermometerActive(!thermometerActive)}
              />
            </div>

            {/* Bảng điều khiển tiến trình */}
            <ControlPanel
              reaction={selectedReaction}
              simulationState={simulationState}
              progress={progress}
              speed={speed}
              onSetSpeed={setSpeed}
              showAnnotations={showAnnotations}
              onToggleAnnotations={() => setShowAnnotations(!showAnnotations)}
              onStart={handleStart}
              onReset={handleReset}
              onOpenTeacherPrompts={() => setIsTeacherModalOpen(true)}
              onOpenIonView={() => setIsIonModalOpen(true)}
              isFullscreen={isFullscreen}
              onToggleFullscreen={handleToggleFullscreen}
            />

            {/* Thẻ phương trình phản ứng */}
            <EquationCard reaction={selectedReaction} simulationState={simulationState} />
          </div>

          {/* CỘT PHẢI: Mục lục thí nghiệm & Giá hóa chất (5/12 cột) */}
          <div className="lg:col-span-5 flex flex-col gap-2 bg-slate-900/90 p-2.5 sm:p-3 rounded-xl border border-slate-800 shadow-lg">
            {/* Thanh chuyển chế độ */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-950/70 rounded-lg border border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('syllabus')}
                className={`flex-1 py-1 px-2 rounded-md text-center transition-all cursor-pointer text-[11px] ${
                  activeTab === 'syllabus'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                15 Bài SGK
              </button>
              <button
                onClick={() => setActiveTab('free_mix')}
                className={`flex-1 py-1 px-2 rounded-md text-center transition-all cursor-pointer text-[11px] ${
                  activeTab === 'free_mix'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tự Phối Trộn
              </button>
              <button
                onClick={() => setActiveTab('solubility_guide')}
                className={`flex-1 py-1 px-2 rounded-md text-center transition-all cursor-pointer text-[11px] ${
                  activeTab === 'solubility_guide'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Bảng Màu
              </button>
            </div>

            {/* Tab 1: 15 Bài thí nghiệm phân loại theo SGK */}
            {activeTab === 'syllabus' && (
              <ReactionSelector
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                selectedReactionId={selectedReaction.id}
                onSelectReaction={handleSelectReaction}
                selectedGrade={selectedGrade}
                onSelectGrade={setSelectedGrade}
              />
            )}

            {/* Tab 2: Giá phối trộn hóa chất tự do */}
            {activeTab === 'free_mix' && (
              <FreeLabMixer onLoadCustomReaction={handleSelectReaction} />
            )}

            {/* Tab 3: Bảng tra cứu màu kết tủa, khí và kim loại */}
            {activeTab === 'solubility_guide' && (
              <SolubilityAndPrecipitateReference
                onSelectPreset={(reactionId) => {
                  const match = REACTIONS_DATA.find((r) => r.id === reactionId);
                  if (match) {
                    handleSelectReaction(match);
                    setActiveTab('syllabus');
                  }
                }}
              />
            )}
          </div>
        </div>
      </main>

      {/* MODAL LỜI DẪN SƯ PHẠM CHO GIÁO VIÊN */}
      <TeacherPromptModal
        reaction={selectedReaction}
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
      />

      {/* MODAL KÍNH HIỂN VI VI MÔ ION */}
      <MicroscopeIonView
        reaction={selectedReaction}
        isOpen={isIonModalOpen}
        onClose={() => setIsIonModalOpen(false)}
      />
    </div>
  );
}

// ================= BẢNG TRA CỨU MÀU SẮC KẾT TỦA & CHẤT KHÍ =================
function SolubilityAndPrecipitateReference({ onSelectPreset }: { onSelectPreset: (reactionId: string) => void }) {
  const PRECIPITATE_DATA = [
    { formula: 'BaSO4', name: 'Barium sulfate', color: 'Trắng', hex: '#FFFFFF', reactionId: 'bacl2_h2so4', note: 'Không tan trong axit mạnh' },
    { formula: 'Cu(OH)2', name: 'Copper(II) hydroxide', color: 'Xanh lam', hex: '#0284C7', reactionId: 'cuso4_naoh', note: 'Kết tủa dạng keo' },
    { formula: 'Fe(OH)3', name: 'Iron(III) hydroxide', color: 'Nâu đỏ', hex: '#991B1B', reactionId: 'fecl3_naoh', note: 'Dạng vón rỉ sắt' },
    { formula: 'PbI2', name: 'Lead(II) iodide', color: 'Vàng tươi', hex: '#FACC15', reactionId: 'pbno32_ki', note: 'Tinh thể "Mưa vàng"' },
    { formula: 'AgCl', name: 'Silver chloride', color: 'Trắng vón', hex: '#F1F5F9', reactionId: 'agno3_nacl', note: 'Không tan trong HNO3, hóa đen ngoài sáng' },
  ];

  const GAS_DATA = [
    { formula: 'CO2', name: 'Carbon dioxide', note: 'Không màu, dập tắt que đóm', reactionId: 'caco3_hcl' },
    { formula: 'SO2', name: 'Sulfur dioxide', note: 'Mùi hắc cay, làm mất màu brom', reactionId: 'na2so3_h2so4' },
    { formula: 'NH3', name: 'Ammonia', note: 'Mùi khai, làm xanh giấy quỳ tím', reactionId: 'nh4cl_naoh' },
  ];

  const METAL_DATA = [
    { formula: 'Fe + CuSO4', name: 'Iron + Copper(II) sulfate', desc: 'Lớp Copper đỏ gạch bám Fe', reactionId: 'fe_cuso4' },
    { formula: 'Zn + AgNO3', name: 'Zinc + Silver nitrate', desc: 'Tinh thể "Cây bạc" Silver', reactionId: 'zn_agno3' },
    { formula: 'Cu + AgNO3', name: 'Copper + Silver nitrate', desc: 'Sợi Silver bám quanh, dd Cu2+ xanh lam', reactionId: 'cu_agno3' },
  ];

  return (
    <div className="w-full flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
      {/* Bảng chất kết tủa */}
      <div>
        <div className="text-[10px] font-bold text-cyan-400 mb-1 uppercase tracking-wide">
          1. Chất kết tủa đặc trưng
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          {PRECIPITATE_DATA.map((p) => (
            <button
              key={p.formula}
              onClick={() => onSelectPreset(p.reactionId)}
              className="p-1.5 bg-slate-950/60 rounded-md border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/40 text-left transition-all flex items-center justify-between cursor-pointer"
            >
              <div>
                <span className="font-mono font-bold text-[11px] text-slate-100">{p.formula}</span>
                <div className="text-[9px] text-slate-400">{p.name}</div>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-200">
                <span
                  className="w-2 h-2 rounded-full border border-slate-600 shrink-0"
                  style={{ backgroundColor: p.hex }}
                />
                <span>{p.color}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bảng chất khí bay lên */}
      <div>
        <div className="text-[10px] font-bold text-emerald-400 mb-1 uppercase tracking-wide">
          2. Chất khí bay lên
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
          {GAS_DATA.map((g) => (
            <button
              key={g.formula}
              onClick={() => onSelectPreset(g.reactionId)}
              className="p-1.5 bg-slate-950/60 rounded-md border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/40 text-left transition-all cursor-pointer"
            >
              <span className="font-mono font-bold text-[11px] text-emerald-300">{g.formula}</span>
              <div className="text-[9px] text-slate-300">{g.name}</div>
              <div className="text-[8px] text-slate-400 truncate">{g.note}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Bảng phản ứng kim loại đẩy kim loại */}
      <div>
        <div className="text-[10px] font-bold text-amber-400 mb-1 uppercase tracking-wide">
          3. Kim loại đẩy kim loại
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
          {METAL_DATA.map((m) => (
            <button
              key={m.formula}
              onClick={() => onSelectPreset(m.reactionId)}
              className="p-1.5 bg-slate-950/60 rounded-md border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/40 text-left transition-all cursor-pointer"
            >
              <span className="font-mono font-bold text-[11px] text-amber-300">{m.formula}</span>
              <div className="text-[9px] text-slate-300 truncate">{m.name}</div>
              <div className="text-[8px] text-slate-400 truncate">{m.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
