import React from 'react';
import { ReactionCategory, ReactionDetail } from '../types/chemistry';
import { REACTIONS_DATA } from '../data/reactions';
import { Droplet, Sparkles, Wind, Layers, Flame, FlaskConical, Filter } from 'lucide-react';

interface ReactionSelectorProps {
  selectedCategory: ReactionCategory | 'all';
  onSelectCategory: (category: ReactionCategory | 'all') => void;
  selectedReactionId: string;
  onSelectReaction: (reaction: ReactionDetail) => void;
  selectedGrade: string;
  onSelectGrade: (grade: string) => void;
}

const CATEGORY_SHORT_LABELS: Record<ReactionCategory, string> = {
  neutralization: '1. Trung hòa',
  precipitation: '2. Kết tủa',
  gas: '3. Tạo khí',
  metal_displacement: '4. Kim loại + Muối',
  redox: '5. Oxi hóa - khử',
};

const CATEGORY_ICONS: Record<ReactionCategory, React.ReactNode> = {
  neutralization: <Droplet className="w-3 h-3 text-pink-400" />,
  precipitation: <Sparkles className="w-3 h-3 text-cyan-400" />,
  gas: <Wind className="w-3 h-3 text-emerald-400" />,
  metal_displacement: <Layers className="w-3 h-3 text-amber-400" />,
  redox: <Flame className="w-3 h-3 text-purple-400" />,
};

export const ReactionSelector: React.FC<ReactionSelectorProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedReactionId,
  onSelectReaction,
  selectedGrade,
  onSelectGrade,
}) => {
  const filteredReactions = REACTIONS_DATA.filter((r) => {
    const matchesCategory = selectedCategory === 'all' || r.category === selectedCategory;
    const matchesGrade = selectedGrade === 'all' || r.gradeLevel.includes(selectedGrade);
    return matchesCategory && matchesGrade;
  });

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Phân loại phản ứng dạng tab tinh gọn */}
      <div className="flex flex-wrap items-center gap-1 p-0.5 bg-slate-950/70 rounded-lg border border-slate-800">
        <button
          onClick={() => onSelectCategory('all')}
          className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-md transition-all cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-cyan-500 text-slate-950 shadow-sm font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <FlaskConical className="w-2.5 h-2.5" />
          <span>Tất cả (15)</span>
        </button>

        {(Object.keys(CATEGORY_SHORT_LABELS) as ReactionCategory[]).map((catKey) => {
          const isActive = selectedCategory === catKey;
          return (
            <button
              key={catKey}
              onClick={() => onSelectCategory(catKey)}
              className={`flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold rounded-md transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-700 text-white shadow-sm ring-1 ring-slate-600 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {CATEGORY_ICONS[catKey]}
              <span>{CATEGORY_SHORT_LABELS[catKey]}</span>
            </button>
          );
        })}
      </div>

      {/* Bộ lọc khối lớp */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 px-0.5">
        <div className="flex items-center gap-1">
          <Filter className="w-2.5 h-2.5 text-slate-500" />
          <span>Lớp:</span>
          {['all', 'Lớp 8', 'Lớp 9', 'Lớp 10', 'Lớp 11', 'Lớp 12'].map((g) => (
            <button
              key={g}
              onClick={() => onSelectGrade(g)}
              className={`px-1.5 py-0.5 rounded text-[9px] font-medium transition-colors cursor-pointer ${
                selectedGrade === g
                  ? 'bg-slate-800 text-cyan-300 font-bold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {g === 'all' ? 'Tất cả' : g.replace('Lớp ', 'L')}
            </button>
          ))}
        </div>
        <span className="font-mono text-[9px] text-slate-500">
          {filteredReactions.length} bài thí nghiệm
        </span>
      </div>

      {/* Danh sách các bài phản ứng */}
      <div className="flex flex-col gap-1.5 max-h-[350px] sm:max-h-[390px] overflow-y-auto pr-1 scrollbar-thin">
        {filteredReactions.map((item) => {
          const isSelected = item.id === selectedReactionId;
          return (
            <button
              key={item.id}
              onClick={() => onSelectReaction(item)}
              className={`text-left p-2 rounded-lg border transition-all flex flex-col gap-1 cursor-pointer ${
                isSelected
                  ? 'bg-cyan-950/50 border-cyan-500/80 shadow-sm ring-1 ring-cyan-500/50'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-start justify-between gap-1.5">
                <span className="text-[11px] font-bold text-slate-100 truncate">
                  {item.name}
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800/90 text-slate-400 shrink-0 border border-slate-700/60">
                  {item.gradeLevel}
                </span>
              </div>

              {/* Nhãn công thức hóa chất */}
              <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-300">
                <span className="px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700/50 text-cyan-300">
                  {item.reactant1.formula}
                </span>
                <span className="text-slate-500">+</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700/50 text-amber-300">
                  {item.reactant2.formula}
                </span>
                <span className="text-slate-500">&rarr;</span>
                <span className="text-slate-400 truncate text-[9px] font-sans">
                  {item.result.hasPrecipitate
                    ? `Kết tủa: ${item.result.precipitateName}`
                    : item.result.hasGas
                    ? `Khí: ${item.result.gasName}`
                    : item.result.hasMetalPlating
                    ? `Kim loại: ${item.result.metalPlatingName}`
                    : 'Đổi màu dung dịch'}
                </span>
              </div>

              <div className="text-[9px] text-slate-400 line-clamp-2 leading-relaxed">
                {item.summaryObservation}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
