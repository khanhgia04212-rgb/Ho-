import React, { useEffect, useRef } from 'react';
import { ReactionDetail } from '../types/chemistry';
import { X, ZoomIn, Atom } from 'lucide-react';

interface MicroscopeIonViewProps {
  reaction: ReactionDetail;
  isOpen: boolean;
  onClose: () => void;
}

export const MicroscopeIonView: React.FC<MicroscopeIonViewProps> = ({
  reaction,
  isOpen,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let tick = 0;

    // Simulated ions in microscopic water solution
    const ions = reaction.microscopicView.ionsInvolved.map((ionName, idx) => {
      return {
        name: ionName,
        x: 100 + (idx * 90) % 360,
        y: 70 + ((idx * 70) % 200),
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: ionName.includes('+') ? 20 : ionName.includes('-') ? 24 : 22,
        color: getIonColor(ionName),
      };
    });

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;

      // Dark blue aqueous solvent background with water molecules
      ctx.fillStyle = '#091528';
      ctx.fillRect(0, 0, w, h);

      // Water molecules (H2O solvent subtle background dots)
      ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
      for (let i = 0; i < 40; i++) {
        const hx = ((i * 73 + tick * 0.3) % w);
        const hy = ((i * 47 + tick * 0.2) % h);
        ctx.beginPath();
        ctx.arc(hx, hy, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Microscope Lens Reticle Lines
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w / 2, h);
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      // Microscope crosshair circles
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 80, 0, Math.PI * 2);
      ctx.arc(w / 2, h / 2, 150, 0, Math.PI * 2);
      ctx.stroke();

      // Update & Draw Ions
      ions.forEach((ion) => {
        ion.x += ion.vx;
        ion.y += ion.vy;

        // Bounce on boundaries
        if (ion.x < ion.radius + 10 || ion.x > w - ion.radius - 10) ion.vx *= -1;
        if (ion.y < ion.radius + 10 || ion.y > h - ion.radius - 10) ion.vy *= -1;

        // Draw Hydrated ion sphere with glowing radial gradient
        const radGrad = ctx.createRadialGradient(
          ion.x - ion.radius * 0.3,
          ion.y - ion.radius * 0.3,
          2,
          ion.x,
          ion.y,
          ion.radius
        );
        radGrad.addColorStop(0, '#FFFFFF');
        radGrad.addColorStop(0.3, ion.color);
        radGrad.addColorStop(1, 'rgba(15, 23, 42, 0.8)');

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(ion.x, ion.y, ion.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = ion.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Ion formula text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '700 12px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ion.name, ion.x, ion.y);
      });

      // Central Reaction Highlight Box
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(w / 2 - 150, h - 45, 300, 32, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#E0F2FE';
      ctx.font = '600 11px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(reaction.microscopicView.mechanismSummary, w / 2, h - 29);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animId);
  }, [isOpen, reaction]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-slate-900 border border-cyan-500/40 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-cyan-950/80 border border-cyan-500/30 rounded-lg text-cyan-400">
              <ZoomIn className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                Kính Hiển Vi Vi Mô (Cấp Độ Hạt & Ion)
              </h3>
              <p className="text-[10px] text-slate-400">
                Quan sát sự va chạm và chuyển dịch của các hạt ion trong dung dịch
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

        {/* Microscopic Simulation Canvas */}
        <div className="relative w-full h-60 flex items-center justify-center bg-slate-950">
          <canvas
            ref={canvasRef}
            width={580}
            height={240}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2.5 left-3 bg-slate-900/80 backdrop-blur-sm px-2 py-0.5 rounded border border-slate-700 text-[10px] font-mono text-cyan-300">
            Độ phóng đại: 10,000,000x (Hạt ion trong dung môi)
          </div>
        </div>

        {/* Scientific Explanation Footer */}
        <div className="p-3.5 bg-slate-900 space-y-2">
          <div className="flex items-start gap-2 bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
            <Atom className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-[11px] font-semibold text-cyan-300 mb-0.5">
                Bản chất vi mô: {reaction.microscopicView.title}
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {reaction.microscopicView.description}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-0.5">
            <span>Phương trình ion rút gọn:</span>
            <span className="font-mono font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30 text-xs">
              {reaction.equations.netIonic}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

function getIonColor(ion: string): string {
  if (ion.includes('Cu')) return '#0284C7';
  if (ion.includes('Fe3+')) return '#D97706';
  if (ion.includes('Fe2+')) return '#10B981';
  if (ion.includes('Ba')) return '#38BDF8';
  if (ion.includes('SO4')) return '#6366F1';
  if (ion.includes('OH-')) return '#EC4899';
  if (ion.includes('H+')) return '#EF4444';
  if (ion.includes('Ag')) return '#E2E8F0';
  if (ion.includes('I-')) return '#FACC15';
  if (ion.includes('Cl-')) return '#84CC16';
  if (ion.includes('Zn')) return '#94A3B8';
  if (ion.includes('MnO4')) return '#A21CAF';
  return '#38BDF8';
}
