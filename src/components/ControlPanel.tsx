import React from 'react';
import { ReactionDetail } from '../types/chemistry';
import {
  Play,
  RotateCcw,
  Gauge,
  Tag,
  GraduationCap,
  ZoomIn,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface ControlPanelProps {
  reaction: ReactionDetail;
  simulationState: 'idle' | 'running' | 'completed';
  progress: number;
  speed: number;
  onSetSpeed: (speed: number) => void;
  showAnnotations: boolean;
  onToggleAnnotations: () => void;
  onStart: () => void;
  onReset: () => void;
  onOpenTeacherPrompts: () => void;
  onOpenIonView: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  reaction,
  simulationState,
  progress,
  speed,
  onSetSpeed,
  showAnnotations,
  onToggleAnnotations,
  onStart,
  onReset,
  onOpenTeacherPrompts,
  onOpenIonView,
  isFullscreen,
  onToggleFullscreen,
}) => {
  const isMetal = reaction.reactant2.containerType === 'metal_strip';
  const startButtonLabel = isMetal ? 'Nhúng kim loại' : 'Bắt đầu phản ứng';

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-800 p-2 sm:p-2.5 shadow-md flex flex-col gap-1.5">
      {/* 1. Thanh tiến trình phản ứng tinh gọn */}
      <div className="flex items-center gap-2 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800/80 text-xs">
        <span className="text-[10px] font-mono text-cyan-400 font-bold shrink-0">
          Tiến trình: {Math.round(progress * 100)}%
        </span>
        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 rounded-full transition-all duration-150"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[9px] text-slate-400 font-medium shrink-0">
          <span className={progress < 0.1 ? 'text-cyan-300 font-bold' : ''}>1. Sẵn sàng</span>
          <span>&rarr;</span>
          <span className={progress >= 0.1 && progress < 0.4 ? 'text-cyan-300 font-bold' : ''}>
            2. Rót/Nhúng
          </span>
          <span>&rarr;</span>
          <span className={progress >= 0.4 && progress < 0.85 ? 'text-amber-300 font-bold' : ''}>
            3. Phản ứng
          </span>
          <span>&rarr;</span>
          <span className={progress >= 0.85 ? 'text-emerald-300 font-bold' : ''}>4. Cân bằng</span>
        </div>
      </div>

      {/* 2. Thanh nút điều khiển */}
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        {/* Play & Reset Buttons */}
        <div className="flex items-center gap-1.5">
          {simulationState === 'idle' ? (
            <button
              onClick={onStart}
              className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-md shadow-cyan-500/20 cursor-pointer whitespace-nowrap"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              <span>{startButtonLabel}</span>
            </button>
          ) : simulationState === 'running' ? (
            <button
              disabled
              className="flex items-center gap-1 px-3 py-1.5 bg-cyan-800/60 text-cyan-200 font-bold rounded-lg text-xs cursor-not-allowed whitespace-nowrap"
            >
              <div className="w-3 h-3 border-2 border-cyan-200 border-t-transparent rounded-full animate-spin" />
              <span>Đang phản ứng...</span>
            </button>
          ) : (
            <button
              onClick={onReset}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold rounded-lg text-xs transition-all shadow-sm cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Lặp lại thí nghiệm</span>
            </button>
          )}

          <button
            onClick={onReset}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 transition-colors whitespace-nowrap cursor-pointer"
            title="Làm mới lại thí nghiệm"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Làm lại</span>
          </button>
        </div>

        {/* Speed Adjustment: 0.5x, 1x, 2x */}
        <div className="flex items-center gap-0.5 bg-slate-950/70 p-0.5 rounded-lg border border-slate-800 text-xs">
          <Gauge className="w-3 h-3 text-slate-400 ml-1 mr-0.5" />
          {[0.5, 1, 2].map((s) => (
            <button
              key={s}
              onClick={() => onSetSpeed(s)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                speed === s
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Secondary Utility Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleAnnotations}
            className={`p-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              showAnnotations
                ? 'bg-slate-800 text-cyan-300 border-cyan-500/50'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Bật/Tắt chú thích"
          >
            <Tag className="w-3 h-3" />
          </button>

          <button
            onClick={onOpenTeacherPrompts}
            className="flex items-center gap-1 px-2 py-1 bg-emerald-950/70 hover:bg-emerald-900/90 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            title="Mở lời dẫn gợi ý cho giáo viên"
          >
            <GraduationCap className="w-3 h-3" />
            <span className="hidden sm:inline">Gợi ý GV</span>
          </button>

          <button
            onClick={onOpenIonView}
            className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            title="Quan sát cấp độ hạt ion vi mô"
          >
            <ZoomIn className="w-3 h-3" />
            <span className="hidden sm:inline">Vi mô</span>
          </button>

          <button
            onClick={onToggleFullscreen}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-lg transition-colors cursor-pointer"
            title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
          >
            {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </button>
        </div>
      </div>
    </div>
  );
};
