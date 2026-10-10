import React, { useState } from 'react';
import { ReactionDetail } from '../types/chemistry';
import { BookOpen, Copy, Check, Info } from 'lucide-react';

interface EquationCardProps {
  reaction: ReactionDetail;
  simulationState: 'idle' | 'running' | 'completed';
}

export const EquationCard: React.FC<EquationCardProps> = ({
  reaction,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = `Phương trình phân tử: ${reaction.equations.molecular}\nPhương trình ion rút gọn: ${reaction.equations.netIonic}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-800 p-2 sm:p-2.5 shadow-md flex flex-col gap-1.5">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          <h4 className="text-xs font-bold text-slate-100">
            Phương Trình Hóa Học & Bản Chất Phản Ứng
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 hidden sm:inline">
            {reaction.equations.reactionType}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-mono transition-colors cursor-pointer"
            title="Sao chép phương trình"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
          </button>
        </div>
      </div>

      {/* Equations Grid: Molecular & Net Ionic */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {/* Molecular Equation */}
        <div className="bg-slate-950/70 rounded-lg p-2 border border-slate-800">
          <div className="text-[9px] font-mono uppercase text-slate-400 mb-0.5 flex items-center justify-between">
            <span>1. Phương trình phân tử</span>
            <span className="text-cyan-400">Cân bằng</span>
          </div>
          <div
            className="text-xs font-mono font-semibold text-slate-100 overflow-x-auto py-0.5 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: reaction.equations.molecularHtml }}
          />
        </div>

        {/* Net Ionic Equation */}
        <div className="bg-slate-950/70 rounded-lg p-2 border border-cyan-500/30">
          <div className="text-[9px] font-mono uppercase text-cyan-400 mb-0.5 flex items-center justify-between">
            <span>2. Phương trình ion rút gọn</span>
            <span className="text-emerald-400">Bản chất ion</span>
          </div>
          <div
            className="text-xs font-mono font-semibold text-cyan-200 overflow-x-auto py-0.5 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: reaction.equations.netIonicHtml }}
          />
        </div>
      </div>

      {/* Concise Mechanism Note */}
      <div className="bg-slate-800/40 rounded-lg px-2 py-1 border border-slate-700/50 flex items-start gap-1.5 text-[10px]">
        <Info className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-slate-300 leading-snug break-words">
          <span className="font-semibold text-slate-200 mr-1">Bản chất:</span>
          {reaction.equations.keyMechanism}
        </div>
      </div>
    </div>
  );
};
