import React, { useState } from 'react';
import { ReactionDetail } from '../types/chemistry';
import { REACTIONS_DATA } from '../data/reactions';
import { FlaskConical, Plus, ArrowRight, Sparkles } from 'lucide-react';

interface FreeLabMixerProps {
  onLoadCustomReaction: (reaction: ReactionDetail) => void;
}

interface ChemicalOption {
  id: string;
  name: string;
  formula: string;
  type: 'acid' | 'base' | 'salt' | 'metal' | 'solid';
  state: 'aq' | 's';
  color: string;
  opacity: number;
  metalType?: 'Fe' | 'Zn' | 'Cu' | 'Al';
}

const CHEMICALS_A: ChemicalOption[] = [
  { id: 'hcl', name: 'Hydrochloric acid', formula: 'HCl (aq)', type: 'acid', state: 'aq', color: '#F8FAFC', opacity: 0.15 },
  { id: 'h2so4', name: 'Sulfuric acid', formula: 'H2SO4 (aq)', type: 'acid', state: 'aq', color: '#F1F5F9', opacity: 0.15 },
  { id: 'naoh', name: 'Sodium hydroxide', formula: 'NaOH (aq)', type: 'base', state: 'aq', color: '#F8FAFC', opacity: 0.15 },
  { id: 'bacl2', name: 'Barium chloride', formula: 'BaCl2 (aq)', type: 'salt', state: 'aq', color: '#F8FAFC', opacity: 0.15 },
  { id: 'cuso4', name: 'Copper(II) sulfate', formula: 'CuSO4 (aq)', type: 'salt', state: 'aq', color: '#0284C7', opacity: 0.65 },
  { id: 'fecl3', name: 'Iron(III) chloride', formula: 'FeCl3 (aq)', type: 'salt', state: 'aq', color: '#D97706', opacity: 0.65 },
  { id: 'agno3', name: 'Silver nitrate', formula: 'AgNO3 (aq)', type: 'salt', state: 'aq', color: '#F8FAFC', opacity: 0.15 },
  { id: 'pbno32', name: 'Lead(II) nitrate', formula: 'Pb(NO3)2 (aq)', type: 'salt', state: 'aq', color: '#F8FAFC', opacity: 0.15 },
];

const CHEMICALS_B: ChemicalOption[] = [
  { id: 'naoh_b', name: 'Sodium hydroxide', formula: 'NaOH (aq)', type: 'base', state: 'aq', color: '#F8FAFC', opacity: 0.15 },
  { id: 'h2so4_b', name: 'Sulfuric acid', formula: 'H2SO4 (aq)', type: 'acid', state: 'aq', color: '#F1F5F9', opacity: 0.15 },
  { id: 'nacl_b', name: 'Sodium chloride', formula: 'NaCl (aq)', type: 'salt', state: 'aq', color: '#F8FAFC', opacity: 0.15 },
  { id: 'ki_b', name: 'Potassium iodide', formula: 'KI (aq)', type: 'salt', state: 'aq', color: '#F8FAFC', opacity: 0.15 },
  { id: 'caco3_b', name: 'Calcium carbonate', formula: 'CaCO3 (s)', type: 'solid', state: 's', color: '#CBD5E1', opacity: 0.8 },
  { id: 'fe_b', name: 'Iron', formula: 'Fe (s)', type: 'metal', state: 's', color: '#64748B', opacity: 1, metalType: 'Fe' },
  { id: 'zn_b', name: 'Zinc', formula: 'Zn (s)', type: 'metal', state: 's', color: '#94A3B8', opacity: 1, metalType: 'Zn' as any },
  { id: 'cu_b', name: 'Copper', formula: 'Cu (s)', type: 'metal', state: 's', color: '#EA580C', opacity: 1, metalType: 'Cu' as any },
];

export const FreeLabMixer: React.FC<FreeLabMixerProps> = ({ onLoadCustomReaction }) => {
  const [chemA, setChemA] = useState<ChemicalOption>(CHEMICALS_A[4]); // CuSO4 default
  const [chemB, setChemB] = useState<ChemicalOption>(CHEMICALS_B[0]); // NaOH default

  const handleMix = () => {
    if (chemA.id === 'cuso4' && chemB.id === 'naoh_b') {
      const match = REACTIONS_DATA.find((r) => r.id === 'cuso4_naoh');
      if (match) {
        onLoadCustomReaction(match);
        return;
      }
    }
    if (chemA.id === 'bacl2' && chemB.id === 'h2so4_b') {
      const match = REACTIONS_DATA.find((r) => r.id === 'bacl2_h2so4');
      if (match) {
        onLoadCustomReaction(match);
        return;
      }
    }
    if (chemA.id === 'fecl3' && chemB.id === 'naoh_b') {
      const match = REACTIONS_DATA.find((r) => r.id === 'fecl3_naoh');
      if (match) {
        onLoadCustomReaction(match);
        return;
      }
    }
    if (chemA.id === 'pbno32' && chemB.id === 'ki_b') {
      const match = REACTIONS_DATA.find((r) => r.id === 'pbno32_ki');
      if (match) {
        onLoadCustomReaction(match);
        return;
      }
    }
    if (chemA.id === 'agno3' && chemB.id === 'nacl_b') {
      const match = REACTIONS_DATA.find((r) => r.id === 'agno3_nacl');
      if (match) {
        onLoadCustomReaction(match);
        return;
      }
    }
    if (chemA.id === 'hcl' && chemB.id === 'caco3_b') {
      const match = REACTIONS_DATA.find((r) => r.id === 'caco3_hcl');
      if (match) {
        onLoadCustomReaction(match);
        return;
      }
    }
    if (chemA.id === 'cuso4' && chemB.id === 'fe_b') {
      const match = REACTIONS_DATA.find((r) => r.id === 'fe_cuso4');
      if (match) {
        onLoadCustomReaction(match);
        return;
      }
    }
    if (chemA.id === 'agno3' && chemB.id === 'zn_b') {
      const match = REACTIONS_DATA.find((r) => r.id === 'zn_agno3');
      if (match) {
        onLoadCustomReaction(match);
        return;
      }
    }
    if (chemA.id === 'agno3' && chemB.id === 'cu_b') {
      const match = REACTIONS_DATA.find((r) => r.id === 'cu_agno3');
      if (match) {
        onLoadCustomReaction(match);
        return;
      }
    }
    if (chemA.id === 'naoh' && chemB.id === 'h2so4_b') {
      const match = REACTIONS_DATA.find((r) => r.id === 'hcl_naoh_phenolphthalein');
      if (match) {
        onLoadCustomReaction(match);
        return;
      }
    }

    // Khi không xảy ra phản ứng trao đổi ion
    const noReaction: ReactionDetail = {
      id: `custom_${chemA.id}_${chemB.id}`,
      category: 'neutralization',
      name: `${chemA.formula} + ${chemB.formula} (Không có phản ứng)`,
      gradeLevel: 'Tự do thử nghiệm',
      summaryObservation:
        'Không có hiện tượng gì xảy ra! Dung dịch vẫn đồng nhất, không có kết tủa, không có bọt khí, không có sự đổi màu.',
      reactant1: {
        name: chemA.name,
        formula: chemA.formula,
        state: chemA.state,
        liquidColor: chemA.color,
        liquidOpacity: chemA.opacity,
        containerType: 'test_tube',
      },
      reactant2: {
        name: chemB.name,
        formula: chemB.formula,
        state: chemB.state,
        liquidColor: chemB.color,
        liquidOpacity: chemB.opacity,
        containerType: chemB.type === 'metal' ? 'metal_strip' : 'test_tube',
        metalType: chemB.metalType,
      },
      result: {
        finalLiquidColor: chemA.color,
        finalLiquidOpacity: chemA.opacity,
        hasPrecipitate: false,
        hasGas: false,
        hasMetalPlating: false,
      },
      equations: {
        molecular: `${chemA.formula} + ${chemB.formula} -> Không phản ứng`,
        molecularHtml: `${chemA.formula} + ${chemB.formula} &rarr; <i>Không xảy ra phản ứng</i>`,
        netIonic: 'Không có ion nào kết hợp',
        netIonicHtml: '<i>Các ion vẫn tồn tại độc lập trong dung dịch điện li</i>',
        reactionType: 'Không phản ứng (Không thỏa mãn điều kiện)',
        keyMechanism:
          'Để phản ứng trao đổi ion trong dung dịch xảy ra, sản phẩm phải tạo thành ít nhất một chất kết tủa, chất khí hoặc chất điện li yếu (như H2O). Cặp chất này không thỏa mãn điều kiện trên!',
      },
      didacticGuide: {
        teacherIntro:
          'Các em hãy quan sát kỹ xem hai chất này khi tiếp xúc có sinh ra hiện tượng gì không.',
        keyQuestions: [
          'Có kết tủa lắng xuống không?',
          'Có bọt khí bay lên hay màu sắc biến đổi không?',
          'Tại sao hai chất này lại không xảy ra phản ứng trao đổi ion trong dung dịch?',
        ],
        conceptTakeaway:
          'Điều kiện để phản ứng trao đổi trong dung dịch chất điện li xảy ra là sản phẩm phải tạo thành: chất kết tủa, chất khí hoặc chất điện li yếu.',
      },
      microscopicView: {
        title: 'Các ion tự do không kết hợp',
        description:
          'Các ion của hai chất phân li và bơi tự do trong dung dịch mà không hút nhau thành mạng tinh thể kết tủa hay tạo phân tử khí/nước.',
        ionsInvolved: ['Na+', 'Cl-', 'K+', 'NO3-'],
        mechanismSummary: 'Không tạo chất kết tủa / khí / điện li yếu',
      },
    };

    onLoadCustomReaction(noReaction);
  };

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-800 p-2.5 sm:p-3 shadow-md flex flex-col gap-2">
      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
        <div className="flex items-center gap-1.5">
          <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />
          <h4 className="text-xs font-bold text-slate-100">
            Giá Hóa Chất Tự Do: Tự Phối Trộn & Khảo Sát
          </h4>
        </div>
        <span className="text-[10px] text-slate-400">
          Chọn 2 hóa chất để thử nghiệm
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* Giá hóa chất A */}
        <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
          <div className="text-[10px] font-semibold text-cyan-400 mb-1">
            Ống 1: Dung dịch ban đầu
          </div>
          <div className="grid grid-cols-2 gap-1">
            {CHEMICALS_A.map((c) => (
              <button
                key={c.id}
                onClick={() => setChemA(c)}
                className={`p-1 rounded border text-left text-xs transition-all cursor-pointer ${
                  chemA.id === c.id
                    ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200 font-bold ring-1 ring-cyan-500'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="font-mono text-[10px] text-cyan-300 font-bold">{c.formula}</div>
                <div className="text-[9px] text-slate-400 truncate">{c.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Giá hóa chất B */}
        <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
          <div className="text-[10px] font-semibold text-amber-400 mb-1">
            Ống 2 / Mẫu: Chất rót hoặc nhúng
          </div>
          <div className="grid grid-cols-2 gap-1">
            {CHEMICALS_B.map((c) => (
              <button
                key={c.id}
                onClick={() => setChemB(c)}
                className={`p-1 rounded border text-left text-xs transition-all cursor-pointer ${
                  chemB.id === c.id
                    ? 'bg-amber-950/60 border-amber-500 text-amber-200 font-bold ring-1 ring-amber-500'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="font-mono text-[10px] text-amber-300 font-bold">{c.formula}</div>
                <div className="text-[9px] text-slate-400 truncate">{c.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-0.5">
        <div className="text-[10px] text-slate-400 flex items-center gap-1">
          <span>Đã chọn:</span>
          <span className="font-mono font-bold text-cyan-300">{chemA.formula}</span>
          <Plus className="w-2.5 h-2.5 text-slate-500" />
          <span className="font-mono font-bold text-amber-300">{chemB.formula}</span>
        </div>

        <button
          onClick={handleMix}
          className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-sm cursor-pointer"
        >
          <Sparkles className="w-3 h-3" />
          <span>Nạp vào mô phỏng</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
