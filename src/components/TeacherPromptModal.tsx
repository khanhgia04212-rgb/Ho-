import React from 'react';
import { ReactionDetail } from '../types/chemistry';
import { GraduationCap, HelpCircle, CheckCircle2, MessageSquare, X } from 'lucide-react';

interface TeacherPromptModalProps {
  reaction: ReactionDetail;
  isOpen: boolean;
  onClose: () => void;
}

export const TeacherPromptModal: React.FC<TeacherPromptModalProps> = ({
  reaction,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-slate-900 border border-emerald-500/40 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-emerald-950/30">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-900/50 border border-emerald-500/30 rounded-lg text-emerald-400">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Gợi Ý Lời Dẫn Sư Phạm Cho Giáo Viên
              </h3>
              <p className="text-[10px] text-emerald-400/90">
                Bộ câu hỏi phát vấn định hướng học sinh quan sát và tư duy
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-3.5 overflow-y-auto">
          {/* 1. Lời dẫn mở đầu thí nghiệm */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-cyan-400">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>1. Lời dẫn nhập môn trước khi bắt đầu:</span>
            </div>
            <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800 text-xs text-slate-200 leading-relaxed italic">
              "{reaction.didacticGuide.teacherIntro}"
            </div>
          </div>

          {/* 2. Hệ thống câu hỏi gợi mở trong khi diễn ra */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-400">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>2. Câu hỏi phát vấn học sinh quan sát:</span>
            </div>
            <div className="space-y-1.5">
              {reaction.didacticGuide.keyQuestions.map((question, idx) => (
                <div
                  key={idx}
                  className="p-2 bg-slate-800/50 rounded-lg border border-slate-700/60 text-xs text-slate-300 flex items-start gap-2"
                >
                  <span className="w-4 h-4 rounded-full bg-slate-700 text-cyan-300 flex items-center justify-center font-mono font-bold shrink-0 text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="leading-snug">{question}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Kết luận sư phạm cốt lõi */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>3. Kết luận bài học (Học sinh cần ghi nhớ):</span>
            </div>
            <div className="p-2.5 bg-emerald-950/30 rounded-lg border border-emerald-500/30 text-xs text-emerald-200 leading-relaxed font-medium">
              {reaction.didacticGuide.conceptTakeaway}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950/70 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm cursor-pointer"
          >
            Đã hiểu & Tiếp tục giảng bài
          </button>
        </div>
      </div>
    </div>
  );
};
