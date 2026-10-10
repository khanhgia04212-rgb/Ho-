import React, { useEffect, useRef, useState } from 'react';
import { ReactionDetail } from '../types/chemistry';
import {
  Flame,
  Sparkles,
  Pipette,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Thermometer,
  Wind,
} from 'lucide-react';

interface LabCanvasProps {
  reaction: ReactionDetail;
  simulationState: 'idle' | 'running' | 'completed';
  progress: number; // 0 to 1
  showAnnotations: boolean;
  onStart: () => void;
  onReset: () => void;
  splintActive: boolean;
  onToggleSplint: () => void;
  starchActive: boolean;
  onToggleStarch: () => void;
  litmusActive: boolean;
  onToggleLitmus: () => void;
  thermometerActive?: boolean;
  onToggleThermometer?: () => void;
}

export const LabCanvas: React.FC<LabCanvasProps> = ({
  reaction,
  simulationState,
  progress,
  showAnnotations,
  splintActive,
  onToggleSplint,
  starchActive,
  onToggleStarch,
  litmusActive,
  onToggleLitmus,
  thermometerActive = false,
  onToggleThermometer,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Local interactive controls for glassware
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [shakeIntensity, setShakeIntensity] = useState<number>(0);
  const [showThermo, setShowThermo] = useState<boolean>(thermometerActive);

  // Synchronize external thermometer prop
  useEffect(() => {
    setShowThermo(thermometerActive);
  }, [thermometerActive]);

  // Particle systems
  const bubblesRef = useRef<
    Array<{
      x: number;
      y: number;
      r: number;
      speed: number;
      opacity: number;
      wobble: number;
      nucleationStream: number;
    }>
  >([]);

  const precipitatesRef = useRef<
    Array<{
      x: number;
      y: number;
      r: number;
      vy: number;
      settled: boolean;
      color: string;
      drift: number;
      sparklePhase: number;
      isClump: boolean;
    }>
  >([]);

  const smokeRef = useRef<
    Array<{
      x: number;
      y: number;
      r: number;
      vy: number;
      vx: number;
      opacity: number;
      color: string;
      expansion: number;
    }>
  >([]);

  const foamRef = useRef<
    Array<{
      x: number;
      y: number;
      r: number;
      life: number;
      maxLife: number;
    }>
  >([]);

  // Trigger brief shake animation on user click
  const handleShakeTube = () => {
    setShakeIntensity(1);
    let decay = 1;
    const interval = setInterval(() => {
      decay -= 0.12;
      if (decay <= 0) {
        setShakeIntensity(0);
        clearInterval(interval);
      } else {
        setShakeIntensity(decay);
      }
    }, 40);
  };

  const isMetalReaction = reaction.reactant2.containerType === 'metal_strip';
  const isSolidPowder = reaction.reactant1.containerType === 'solid_powder';

  // Reset particles on reaction change
  useEffect(() => {
    bubblesRef.current = [];
    precipitatesRef.current = [];
    smokeRef.current = [];
    foamRef.current = [];
  }, [reaction.id, simulationState]);

  // Main canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;

      // Zoom scale transform if toggled
      ctx.save();
      if (isZoomed) {
        ctx.translate(width * 0.45, height * 0.5);
        ctx.scale(1.3, 1.3);
        ctx.translate(-width * 0.45, -height * 0.5);
      }

      // Draw modern laboratory test tube stand rack
      drawLabRack(ctx, width, height);

      // Geometry coordinates (Compact, fitted scale)
      const shakeOffset = Math.sin(tick * 0.8) * 3 * shakeIntensity;
      const tube1X = width * 0.36 + shakeOffset;
      const tube1Y = height * 0.16;
      const tubeWidth = 56;
      const tubeHeight = 205;

      // Tube 1 liquid filling calculation
      const baseFill = 0.34;
      const finalFill = isMetalReaction ? 0.48 : 0.68;
      const currentFill = baseFill + (finalFill - baseFill) * progress;

      // Interpolate liquid color
      const currentLiquidColor = interpolateColor(
        reaction.reactant1.liquidColor,
        starchActive && reaction.id === 'cl2_ki_starch'
          ? '#1E3A8A'
          : reaction.result.finalLiquidColor,
        progress
      );
      const currentOpacity =
        reaction.reactant1.liquidOpacity +
        (reaction.result.finalLiquidOpacity - reaction.reactant1.liquidOpacity) * progress;

      // Handle Tube 2 (Pouring reagent or metal immersion)
      let tube2X = width * 0.68;
      let tube2Y = height * 0.16;
      let tube2Angle = 0;
      let tube2Fill = Math.max(0, 0.4 * (1 - progress * 1.15));

      if (simulationState === 'running' || simulationState === 'completed') {
        if (!isMetalReaction && !isSolidPowder) {
          const pourFactor = Math.min(1, progress * 1.35);
          tube2X = width * 0.68 - (width * 0.68 - (tube1X + tubeWidth + 20)) * pourFactor;
          tube2Y = height * 0.16 - 55 * Math.sin(pourFactor * Math.PI * 0.5);
          tube2Angle = -Math.min(1.22, pourFactor * 1.18);

          // Draw dynamic pouring stream of liquid with droplet splash
          if (progress > 0.05 && progress < 0.85) {
            drawPouringStream(
              ctx,
              tube2X - 10,
              tube2Y + 16,
              tube1X + tubeWidth * 0.5,
              tube1Y + tubeHeight * (1 - currentFill),
              reaction.reactant2.liquidColor,
              tick
            );
          }
        }
      }

      // Draw Receiver Tube 1
      drawTestTube(
        ctx,
        tube1X,
        tube1Y,
        tubeWidth,
        tubeHeight,
        currentFill,
        currentLiquidColor,
        currentOpacity,
        progress,
        shakeIntensity
      );

      // Clip inside Tube 1 interior for contents
      ctx.save();
      clipTubeInterior(ctx, tube1X, tube1Y, tubeWidth, tubeHeight);

      const liquidSurfaceY = tube1Y + tubeHeight - tubeHeight * currentFill;
      const liquidBottomY = tube1Y + tubeHeight - 20;

      // Dynamic Turbidity Swirling Vortex at contact zone
      if (reaction.result.hasPrecipitate && progress > 0.08 && progress < 0.9) {
        drawTurbiditySwirl(
          ctx,
          tube1X,
          tubeWidth,
          liquidSurfaceY,
          liquidBottomY,
          reaction.result.precipitateColor || '#FFFFFF',
          progress,
          tick
        );
      }

      // Solid powder at bottom (CaCO3, CuO)
      if (isSolidPowder) {
        drawSolidPowderAtBottom(ctx, tube1X, tube1Y, tubeWidth, tubeHeight, reaction, progress);
      }

      // Metal strip immersion (Fe, Zn, Cu)
      if (isMetalReaction) {
        drawMetalStrip(ctx, tube1X, tube1Y, tubeWidth, tubeHeight, reaction, progress, simulationState);
      }

      // Precipitate particles & settling sedimentation cake
      if (reaction.result.hasPrecipitate && progress > 0.12) {
        updateAndDrawPrecipitates(
          ctx,
          tube1X,
          tubeWidth,
          liquidSurfaceY,
          liquidBottomY,
          reaction.result.precipitateColor || '#FFFFFF',
          reaction.result.precipitateType || 'fine',
          progress,
          tick,
          precipitatesRef,
          shakeIntensity
        );
      }

      // Gas Bubbles rising & Foam generation
      if (reaction.result.hasGas && progress > 0.06) {
        updateAndDrawBubbles(
          ctx,
          tube1X,
          tubeWidth,
          liquidSurfaceY,
          liquidBottomY,
          reaction.result.gasRate || 'medium',
          progress,
          tick,
          bubblesRef,
          foamRef
        );

        // Draw effervescent foam layer at liquid meniscus
        drawMeniscusFoam(ctx, tube1X, tubeWidth, liquidSurfaceY, foamRef, progress, tick);
      }

      ctx.restore();

      // Draw Volumetric Gas Smoke & Vapor billowing out of mouth
      if (reaction.result.hasGas && progress > 0.12) {
        drawGasVapor(
          ctx,
          tube1X + tubeWidth / 2,
          tube1Y - 4,
          tick,
          smokeRef,
          reaction.result.gasName,
          reaction.result.gasColor
        );
      }

      // Draw Tube 2 (Pouring Tube)
      if (!isMetalReaction && !isSolidPowder) {
        ctx.save();
        ctx.translate(tube2X, tube2Y);
        ctx.rotate(tube2Angle);
        drawTestTube(
          ctx,
          -tubeWidth / 2,
          0,
          tubeWidth,
          tubeHeight,
          tube2Fill,
          reaction.reactant2.liquidColor,
          reaction.reactant2.liquidOpacity,
          0,
          0
        );
        ctx.restore();
      }

      // Draw Thermometer in Tube 1 if active
      if (showThermo) {
        drawVirtualThermometer(
          ctx,
          tube1X + tubeWidth * 0.72,
          tube1Y - 26,
          tubeHeight * 0.85,
          reaction,
          progress
        );
      }

      // Testing tool effects (Splint test, Litmus strip)
      if (splintActive) {
        drawSplintTest(ctx, tube1X + tubeWidth / 2, tube1Y - 14, reaction, progress, tick);
      }

      if (litmusActive) {
        drawLitmusTest(ctx, tube1X + tubeWidth / 2 + 18, tube1Y - 10, reaction, progress);
      }

      ctx.restore(); // Undo zoom if applied

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    reaction,
    simulationState,
    progress,
    starchActive,
    splintActive,
    litmusActive,
    showThermo,
    isZoomed,
    shakeIntensity,
  ]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-900/95 via-slate-950 to-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-xl">
      {/* Top Floating Glassware Utility Toolbar */}
      <div className="absolute top-2 inset-x-2.5 flex items-center justify-between z-20 pointer-events-none">
        {/* Reaction Live Status Badge */}
        <div className="flex items-center gap-1.5 bg-slate-900/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/80 shadow-sm pointer-events-auto">
          <div
            className={`w-2 h-2 rounded-full ${
              simulationState === 'idle'
                ? 'bg-amber-400'
                : simulationState === 'running'
                ? 'bg-cyan-400 animate-ping'
                : 'bg-emerald-400'
            }`}
          />
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-100">
              {simulationState === 'idle' && 'Ống nghiệm sẵn sàng'}
              {simulationState === 'running' && 'Đang phản ứng...'}
              {simulationState === 'completed' && 'Hoàn thành (Cân bằng)'}
            </span>
            <span className="text-[10px] text-cyan-400 font-mono font-bold">
              {Math.round(progress * 100)}%
            </span>
          </div>
        </div>

        {/* Interactive Gadgets & Testing Kit */}
        <div className="flex items-center gap-1 pointer-events-auto">
          {/* Shake Tube Button */}
          <button
            onClick={handleShakeTube}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Lắc nhẹ ống nghiệm để khuấy đều hoặc kích thích bọt khí"
          >
            <RotateCw className="w-2.5 h-2.5 text-cyan-400" />
            <span>Lắc ống</span>
          </button>

          {/* Thermometer Toggle */}
          <button
            onClick={() => {
              setShowThermo(!showThermo);
              if (onToggleThermometer) onToggleThermometer();
            }}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold transition-all shadow-sm cursor-pointer ${
              showThermo
                ? 'bg-rose-500 text-white font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30'
            }`}
            title="Cắm nhiệt kế đo phản ứng tỏa nhiệt"
          >
            <Thermometer className="w-2.5 h-2.5" />
            <span>{showThermo ? 'Cất nhiệt kế' : 'Nhiệt kế'}</span>
          </button>

          {/* Splint Tool for Gas Reactions */}
          {reaction.result.hasGas && (
            <button
              onClick={onToggleSplint}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold transition-all shadow-sm cursor-pointer ${
                splintActive
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40'
              }`}
              title="Đưa que đóm đang cháy vào miệng ống nghiệm để thử khí"
            >
              <Flame className="w-2.5 h-2.5" />
              <span>{splintActive ? 'Bỏ que đóm' : 'Thử que đóm'}</span>
            </button>
          )}

          {/* Litmus Paper Tool */}
          <button
            onClick={onToggleLitmus}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold transition-all shadow-sm cursor-pointer ${
              litmusActive
                ? 'bg-purple-600 text-white font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/40'
            }`}
            title="Nhúng giấy quỳ tím kiểm tra môi trường axit / bazơ"
          >
            <Pipette className="w-2.5 h-2.5" />
            <span>{litmusActive ? 'Cất quỳ tím' : 'Thử quỳ tím'}</span>
          </button>

          {/* Starch Indicator for I2 reaction */}
          {reaction.id === 'cl2_ki_starch' && (
            <button
              onClick={onToggleStarch}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold transition-all shadow-sm cursor-pointer ${
                starchActive
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-500/40'
              }`}
              title="Nhỏ dung dịch hồ tinh bột để nhận biết Iodine"
            >
              <Sparkles className="w-2.5 h-2.5" />
              <span>{starchActive ? 'Bỏ tinh bột' : 'Hồ tinh bột'}</span>
            </button>
          )}

          {/* Zoom Toggle */}
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className={`p-1 rounded text-[10px] border transition-colors cursor-pointer ${
              isZoomed
                ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
            }`}
            title={isZoomed ? 'Thu nhỏ góc nhìn' : 'Phóng to 1.3x chi tiết ống nghiệm'}
          >
            {isZoomed ? <ZoomOut className="w-3 h-3" /> : <ZoomIn className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Main Glassware Canvas */}
      <canvas
        ref={canvasRef}
        width={760}
        height={390}
        className="w-full h-full max-h-[390px] object-contain drop-shadow-lg"
      />

      {/* Dynamic Gas / Precipitate Phenomenon Pop-up Indicator Banner */}
      {simulationState === 'running' && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-10 pointer-events-none animate-bounce">
          {reaction.result.hasPrecipitate && (
            <div className="bg-cyan-950/90 text-cyan-200 text-[10px] px-2.5 py-0.5 rounded-full border border-cyan-500/60 shadow-md font-semibold flex items-center gap-1 backdrop-blur-sm">
              <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
              <span>Xuất hiện kết tủa {reaction.result.precipitateName}</span>
            </div>
          )}
          {reaction.result.hasGas && (
            <div className="bg-emerald-950/90 text-emerald-200 text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-500/60 shadow-md font-semibold flex items-center gap-1 backdrop-blur-sm">
              <Wind className="w-2.5 h-2.5 text-emerald-400" />
              <span>Sủi bọt khí {reaction.result.gasName}</span>
            </div>
          )}
        </div>
      )}

      {/* Bottom Floating Info Banners (Hiển thị đầy đủ không bị cắt chữ) */}
      {showAnnotations && (
        <div className="absolute bottom-2 inset-x-2.5 flex items-end justify-between gap-2 pointer-events-none">
          {/* Receiver Tube Info */}
          <div className="bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/80 shadow-md text-left shrink-0 max-w-[140px] sm:max-w-[170px] pointer-events-auto">
            <span className="text-[8px] font-mono tracking-wider text-cyan-400 block font-bold uppercase">
              Ống 1 (Dung dịch nhận)
            </span>
            <div className="text-[10px] font-bold text-slate-100 break-words leading-tight">
              {reaction.reactant1.name}
            </div>
          </div>

          {/* Central Phenomenon Summary Card - Hiển thị toàn bộ câu văn đầy đủ */}
          <div className="bg-slate-900/95 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-cyan-500/50 shadow-lg text-center flex-1 max-w-xl mx-auto pointer-events-auto">
            <span className="text-[9px] font-mono tracking-wider text-emerald-400 block font-bold uppercase mb-0.5">
              Hiện tượng quan sát
            </span>
            <div className="text-[11px] font-medium text-slate-100 leading-snug break-words">
              {simulationState === 'idle'
                ? 'Nhấn nút Bắt đầu để quan sát phản ứng xảy ra.'
                : simulationState === 'running'
                ? 'Đang xảy ra phản ứng hóa học...'
                : reaction.summaryObservation}
            </div>
          </div>

          {/* Secondary Reactant Info */}
          <div className="bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/80 shadow-md text-right shrink-0 max-w-[140px] sm:max-w-[170px] pointer-events-auto">
            <span className="text-[8px] font-mono tracking-wider text-amber-400 block font-bold uppercase">
              Ống 2 / Mẫu thử
            </span>
            <div className="text-[10px] font-bold text-slate-100 break-words leading-tight">
              {reaction.reactant2.name}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ================= CANVAS HELPER FUNCTIONS =================

function drawLabRack(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const rackY = height * 0.77;
  const rackHeight = 22;
  const rackWidth = width * 0.84;
  const rackX = (width - rackWidth) / 2;

  ctx.save();
  const grad = ctx.createLinearGradient(rackX, rackY, rackX, rackY + rackHeight);
  grad.addColorStop(0, '#334155');
  grad.addColorStop(0.3, '#1E293B');
  grad.addColorStop(1, '#0F172A');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(rackX, rackY, rackWidth, rackHeight, [6, 6, 2, 2]);
  ctx.fill();

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Test tube socket recess holes
  const socketX1 = width * 0.36;
  const socketX2 = width * 0.68;
  const socketW = 56;

  [socketX1, socketX2].forEach((sx) => {
    ctx.fillStyle = '#090D16';
    ctx.beginPath();
    ctx.ellipse(sx + socketW / 2, rackY + 5, socketW / 2 + 3, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // Bench surface highlight
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
  ctx.beginPath();
  ctx.moveTo(rackX, rackY);
  ctx.lineTo(rackX + rackWidth, rackY);
  ctx.stroke();

  ctx.restore();
}

function drawTestTube(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fillLevel: number,
  liquidColor: string,
  liquidOpacity: number,
  progress: number,
  shakeIntensity: number
) {
  const r = w / 2;

  ctx.save();

  // 1. Draw Liquid Inside if present
  if (fillLevel > 0) {
    const liquidHeight = Math.min(h - r, h * fillLevel);
    const liquidTop = y + h - liquidHeight;

    ctx.save();
    clipTubeInterior(ctx, x, y, w, h);

    // Liquid gradient body
    const liquidGrad = ctx.createLinearGradient(x, liquidTop, x + w, liquidTop);
    liquidGrad.addColorStop(0, hexToRgba(liquidColor, Math.min(1, liquidOpacity + 0.1)));
    liquidGrad.addColorStop(0.5, hexToRgba(liquidColor, liquidOpacity));
    liquidGrad.addColorStop(1, hexToRgba(liquidColor, Math.min(1, liquidOpacity + 0.15)));

    ctx.fillStyle = liquidGrad;
    ctx.fillRect(x + 2, liquidTop, w - 4, h - (liquidTop - y));

    // Meniscus surface curve
    const waveOffset = Math.sin(Date.now() * 0.01) * 2 * shakeIntensity;
    ctx.beginPath();
    ctx.ellipse(x + r, liquidTop + waveOffset, r - 3, 4.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(liquidColor, Math.min(1, liquidOpacity + 0.3));
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Graduated volume ticks (10, 20, 30, 40, 50 ml)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '500 8px JetBrains Mono, monospace';

    for (let i = 1; i <= 5; i++) {
      const tickY = y + h - (h * 0.78 * (i / 5));
      ctx.beginPath();
      ctx.moveTo(x + 4, tickY);
      ctx.lineTo(x + 12, tickY);
      ctx.stroke();
      ctx.fillText(`${i * 10}`, x + 15, tickY + 3);
    }

    ctx.restore();
  }

  // 2. Draw Crystal Clear Glass Outline and Rim
  ctx.beginPath();
  // Flared rim top
  ctx.moveTo(x - 4, y);
  ctx.lineTo(x + w + 4, y);
  ctx.lineTo(x + w + 4, y + 5);
  ctx.lineTo(x + w, y + 7);
  // Right wall
  ctx.lineTo(x + w, y + h - r);
  // Semicircular bottom
  ctx.arc(x + r, y + h - r, r, 0, Math.PI, false);
  // Left wall
  ctx.lineTo(x, y + 7);
  ctx.lineTo(x - 4, y + 5);
  ctx.closePath();

  // Glass specular reflection
  const glassGrad = ctx.createLinearGradient(x, y, x + w, y);
  glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
  glassGrad.addColorStop(0.15, 'rgba(255, 255, 255, 0.04)');
  glassGrad.addColorStop(0.85, 'rgba(255, 255, 255, 0.06)');
  glassGrad.addColorStop(1, 'rgba(255, 255, 255, 0.3)');

  ctx.fillStyle = glassGrad;
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Long specular reflection streak down the glass
  ctx.beginPath();
  ctx.moveTo(x + 7, y + 12);
  ctx.lineTo(x + 7, y + h - r - 8);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Top lip ellipse
  ctx.beginPath();
  ctx.ellipse(x + r, y + 2.5, r + 4, 3, 0, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 1.6;
  ctx.stroke();

  ctx.restore();
}

function drawPouringStream(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  color: string,
  tick: number
) {
  ctx.save();
  ctx.beginPath();

  const midX = (fromX + toX) / 2 + Math.sin(tick * 0.25) * 3;
  const midY = (fromY + toY) / 2;

  ctx.moveTo(fromX, fromY);
  ctx.quadraticCurveTo(midX, midY, toX, toY);

  ctx.strokeStyle = hexToRgba(color, 0.85);
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Droplet splash at entry point
  ctx.fillStyle = hexToRgba(color, 0.75);
  for (let i = 0; i < 3; i++) {
    const splashX = toX + Math.sin(tick * 0.4 + i) * 6;
    const splashY = toY - 4 - Math.abs(Math.cos(tick * 0.4 + i)) * 6;
    ctx.beginPath();
    ctx.arc(splashX, splashY, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function clipTubeInterior(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const r = w / 2;
  ctx.beginPath();
  ctx.moveTo(x + 2, y + 5);
  ctx.lineTo(x + w - 2, y + 5);
  ctx.lineTo(x + w - 2, y + h - r);
  ctx.arc(x + r, y + h - r, r - 2, 0, Math.PI, false);
  ctx.lineTo(x + 2, y + 5);
  ctx.closePath();
  ctx.clip();
}

function drawTurbiditySwirl(
  ctx: CanvasRenderingContext2D,
  tubeX: number,
  tubeW: number,
  surfaceY: number,
  bottomY: number,
  color: string,
  progress: number,
  tick: number
) {
  ctx.save();
  const centerX = tubeX + tubeW / 2;
  const swirlHeight = Math.min(bottomY - surfaceY, 90 * progress);

  for (let i = 0; i < 4; i++) {
    const t = tick * 0.05 + i * 1.5;
    const yPos = surfaceY + (swirlHeight / 4) * i + Math.sin(t) * 4;
    const radiusX = (tubeW * 0.35) * Math.sin(t * 0.7);

    ctx.beginPath();
    ctx.ellipse(centerX + Math.cos(t) * 4, yPos, Math.abs(radiusX), 7, 0, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(color, 0.45 * (1 - progress * 0.5));
    ctx.fill();
  }
  ctx.restore();
}

function updateAndDrawPrecipitates(
  ctx: CanvasRenderingContext2D,
  tubeX: number,
  tubeW: number,
  surfaceY: number,
  bottomY: number,
  color: string,
  precipitateType: 'heavy' | 'gelatinous' | 'fine' | 'crystalline',
  progress: number,
  tick: number,
  particlesRef: React.MutableRefObject<any[]>,
  shakeIntensity: number
) {
  const particles = particlesRef.current;
  const maxParticles = precipitateType === 'fine' ? 120 : precipitateType === 'crystalline' ? 90 : 60;

  // Generate new particles
  if (particles.length < maxParticles && progress < 0.85) {
    for (let i = 0; i < 3; i++) {
      particles.push({
        x: tubeX + 6 + Math.random() * (tubeW - 12),
        y: surfaceY + Math.random() * 15,
        r: precipitateType === 'gelatinous' ? 3 + Math.random() * 3.5 : 1.2 + Math.random() * 2.2,
        vy: precipitateType === 'heavy' ? 0.9 + Math.random() * 0.8 : 0.35 + Math.random() * 0.45,
        settled: false,
        color,
        drift: (Math.random() - 0.5) * 0.4,
        sparklePhase: Math.random() * Math.PI * 2,
        isClump: Math.random() > 0.7,
      });
    }
  }

  // Draw settled sediment cake layer at bottom
  const cakeHeight = Math.min(22, 22 * progress);
  if (cakeHeight > 2) {
    ctx.save();
    const cakeGrad = ctx.createLinearGradient(
      tubeX,
      bottomY - cakeHeight,
      tubeX,
      bottomY
    );
    cakeGrad.addColorStop(0, hexToRgba(color, 0.85));
    cakeGrad.addColorStop(1, hexToRgba(color, 0.98));

    ctx.fillStyle = cakeGrad;
    ctx.fillRect(tubeX + 2, bottomY - cakeHeight, tubeW - 4, cakeHeight + 10);

    // Mounded meniscus curve of sediment
    ctx.beginPath();
    ctx.ellipse(tubeX + tubeW / 2, bottomY - cakeHeight, tubeW / 2 - 4, 3.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(color, 0.95);
    ctx.fill();
    ctx.restore();
  }

  // Update and render particles
  ctx.save();
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];

    if (!p.settled) {
      p.y += p.vy + shakeIntensity * (Math.random() - 0.5) * 4;
      p.x += p.drift + Math.sin(tick * 0.05 + p.sparklePhase) * 0.3;

      p.x = Math.max(tubeX + 4, Math.min(tubeX + tubeW - 4, p.x));

      if (p.y >= bottomY - cakeHeight) {
        p.settled = true;
        p.y = bottomY - cakeHeight + (Math.random() * 3);
      }
    }

    ctx.fillStyle = p.color;

    if (precipitateType === 'crystalline') {
      const sparkle = (Math.sin(tick * 0.15 + p.sparklePhase) + 1) * 0.5;
      ctx.fillStyle = sparkle > 0.7 ? '#FEF08A' : p.color;
      ctx.fillRect(p.x - p.r, p.y - p.r, p.r * 1.8, p.r * 1.8);
    } else if (precipitateType === 'gelatinous') {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(p.color, 0.8);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function updateAndDrawBubbles(
  ctx: CanvasRenderingContext2D,
  tubeX: number,
  tubeW: number,
  surfaceY: number,
  bottomY: number,
  rate: 'vigorous' | 'medium' | 'gentle',
  progress: number,
  tick: number,
  bubblesRef: React.MutableRefObject<any[]>,
  foamRef: React.MutableRefObject<any[]>
) {
  const bubbles = bubblesRef.current;
  const maxBubbles = rate === 'vigorous' ? 90 : rate === 'medium' ? 50 : 25;
  const spawnChance = rate === 'vigorous' ? 0.75 : rate === 'medium' ? 0.45 : 0.25;

  const nucleationPoints = [
    tubeX + tubeW * 0.25,
    tubeX + tubeW * 0.45,
    tubeX + tubeW * 0.65,
    tubeX + tubeW * 0.8,
  ];

  if (bubbles.length < maxBubbles && Math.random() < spawnChance) {
    const originX = nucleationPoints[Math.floor(Math.random() * nucleationPoints.length)];
    bubbles.push({
      x: originX + (Math.random() - 0.5) * 6,
      y: bottomY - Math.random() * 15,
      r: 1 + Math.random() * 2.8,
      speed: 1.2 + Math.random() * (rate === 'vigorous' ? 2.8 : 1.4),
      opacity: 0.65 + Math.random() * 0.35,
      wobble: Math.random() * Math.PI * 2,
    });
  }

  ctx.save();

  for (let i = bubbles.length - 1; i >= 0; i--) {
    const b = bubbles[i];
    b.y -= b.speed;
    b.x += Math.sin(tick * 0.1 + b.wobble) * 0.6;
    b.speed += 0.02;

    if (b.y <= surfaceY + 2) {
      if (Math.random() > 0.4 && foamRef.current.length < 35) {
        foamRef.current.push({
          x: b.x,
          y: surfaceY,
          r: 2 + Math.random() * 3,
          life: 0,
          maxLife: 40 + Math.random() * 60,
        });
      }
      bubbles.splice(i, 1);
      continue;
    }

    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${b.opacity * 0.4})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(255, 255, 255, ${b.opacity * 0.9})`;
    ctx.lineWidth = 0.9;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawMeniscusFoam(
  ctx: CanvasRenderingContext2D,
  tubeX: number,
  tubeW: number,
  surfaceY: number,
  foamRef: React.MutableRefObject<any[]>,
  progress: number,
  tick: number
) {
  const foam = foamRef.current;
  ctx.save();

  for (let i = foam.length - 1; i >= 0; i--) {
    const f = foam[i];
    f.life++;

    if (f.life >= f.maxLife) {
      foam.splice(i, 1);
      continue;
    }

    const alpha = 1 - f.life / f.maxLife;
    ctx.beginPath();
    ctx.arc(f.x, f.y - Math.sin(tick * 0.1 + i) * 1, f.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.55})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.85})`;
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  ctx.restore();
}

function drawGasVapor(
  ctx: CanvasRenderingContext2D,
  mouthX: number,
  mouthY: number,
  tick: number,
  smokeRef: React.MutableRefObject<any[]>,
  gasName?: string,
  gasColor?: string
) {
  const smoke = smokeRef.current;
  if (smoke.length < 30 && Math.random() > 0.35) {
    smoke.push({
      x: mouthX + (Math.random() - 0.5) * 12,
      y: mouthY,
      r: 3 + Math.random() * 4,
      vy: 0.8 + Math.random() * 0.9,
      vx: (Math.random() - 0.5) * 0.5,
      opacity: 0.45,
      expansion: 0.08,
      color: gasColor === 'transparent' ? 'rgba(226, 232, 240, ' : 'rgba(253, 230, 138, ',
    });
  }

  ctx.save();
  for (let i = smoke.length - 1; i >= 0; i--) {
    const s = smoke[i];
    s.y -= s.vy;
    s.x += s.vx + Math.sin(tick * 0.05 + i) * 0.3;
    s.r += s.expansion;
    s.opacity -= 0.008;

    if (s.opacity <= 0) {
      smoke.splice(i, 1);
      continue;
    }

    ctx.fillStyle = `${s.color}${s.opacity})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawSolidPowderAtBottom(
  ctx: CanvasRenderingContext2D,
  tubeX: number,
  tubeY: number,
  tubeW: number,
  tubeH: number,
  reaction: ReactionDetail,
  progress: number
) {
  const powderBottom = tubeY + tubeH - 12;
  const initialPowderH = 20;
  const currentPowderH = Math.max(3, initialPowderH * (1 - progress * 0.85));

  ctx.save();
  const powderColor = reaction.reactant1.liquidColor;

  ctx.fillStyle = powderColor;
  ctx.beginPath();
  ctx.ellipse(tubeX + tubeW / 2, powderBottom - currentPowderH, tubeW / 2 - 4, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillRect(tubeX + 4, powderBottom - currentPowderH, tubeW - 8, currentPowderH + 8);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  for (let i = 0; i < 15; i++) {
    const gx = tubeX + 8 + (i * 2.8) % (tubeW - 16);
    const gy = powderBottom - currentPowderH + (i * 1.8) % currentPowderH;
    ctx.fillRect(gx, gy, 1.5, 1.5);
  }

  ctx.restore();
}

function drawMetalStrip(
  ctx: CanvasRenderingContext2D,
  tubeX: number,
  tubeY: number,
  tubeW: number,
  tubeH: number,
  reaction: ReactionDetail,
  progress: number,
  simState: string
) {
  const metalW = 14;
  const metalH = 150;
  const stripX = tubeX + (tubeW - metalW) / 2;
  const dipY = simState === 'idle' ? tubeY - 50 : tubeY + 25;

  ctx.save();

  const metalGrad = ctx.createLinearGradient(stripX, dipY, stripX + metalW, dipY);
  metalGrad.addColorStop(0, '#94A3B8');
  metalGrad.addColorStop(0.5, '#CBD5E1');
  metalGrad.addColorStop(1, '#64748B');

  ctx.fillStyle = metalGrad;
  ctx.fillRect(stripX, dipY, metalW, metalH);
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1;
  ctx.strokeRect(stripX, dipY, metalW, metalH);

  if (reaction.result.hasMetalPlating && progress > 0.1) {
    const platingH = metalH * 0.65;
    const platingY = dipY + metalH - platingH;
    const platingColor = reaction.result.metalPlatingColor || '#B45309';

    ctx.fillStyle = hexToRgba(platingColor, Math.min(1, progress * 1.2));
    ctx.fillRect(stripX - 1.5, platingY, metalW + 3, platingH);

    if (reaction.id === 'zn_agno3' && progress > 0.25) {
      ctx.strokeStyle = '#F8FAFC';
      ctx.lineWidth = 1.4;
      for (let j = 0; j < 8; j++) {
        const ny = platingY + 12 * j;
        ctx.beginPath();
        ctx.moveTo(stripX, ny);
        ctx.lineTo(stripX - 5 - progress * 4, ny - 4);
        ctx.moveTo(stripX + metalW, ny);
        ctx.lineTo(stripX + metalW + 5 + progress * 4, ny - 4);
        ctx.stroke();
      }
    }
  }

  ctx.restore();
}

function drawVirtualThermometer(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  height: number,
  reaction: ReactionDetail,
  progress: number
) {
  ctx.save();
  const width = 6;
  const bulbR = 6;

  ctx.fillStyle = 'rgba(241, 245, 249, 0.4)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(x - width / 2, y, width, height, [3, 3, 0, 0]);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(x, y + height + bulbR * 0.7, bulbR, 0, Math.PI * 2);
  ctx.fillStyle = '#EF4444';
  ctx.fill();
  ctx.stroke();

  const isExothermic = reaction.result.temperatureChange !== 'none';
  const tempRise = isExothermic ? progress * 35 : 0;
  const columnH = 30 + tempRise;

  ctx.fillStyle = '#EF4444';
  ctx.fillRect(x - 1.8, y + height - columnH, 3.6, columnH);

  const baseTemp = 25;
  const currentTemp = Math.round(baseTemp + (isExothermic ? progress * 17 : 0));

  ctx.fillStyle = '#0F172A';
  ctx.strokeStyle = '#EF4444';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x + 10, y + 10, 42, 17, 4);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#F87171';
  ctx.font = '700 9px JetBrains Mono, monospace';
  ctx.fillText(`${currentTemp}°C`, x + 16, y + 22);

  ctx.restore();
}

function drawSplintTest(
  ctx: CanvasRenderingContext2D,
  mouthX: number,
  mouthY: number,
  reaction: ReactionDetail,
  progress: number,
  tick: number
) {
  ctx.save();

  const splintStartX = mouthX + 60;
  const splintStartY = mouthY - 45;
  const splintEndX = mouthX;
  const splintEndY = mouthY - 4;

  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(splintStartX, splintStartY);
  ctx.lineTo(splintEndX, splintEndY);
  ctx.stroke();

  const isExtinguished =
    reaction.result.splintTestResult === 'extinguishes' && progress > 0.18;

  if (isExtinguished) {
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(splintEndX, splintEndY, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
    ctx.beginPath();
    ctx.arc(splintEndX + Math.sin(tick * 0.1) * 3, splintEndY - 8, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#EF4444';
    ctx.font = '700 10px Plus Jakarta Sans, sans-serif';
    ctx.fillText('Que đóm tắt ngúm (Khí dập tắt lửa)', mouthX + 10, mouthY - 20);
  } else {
    const flameSize = 7 + Math.sin(tick * 0.3) * 2;
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(splintEndX, splintEndY, flameSize, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(splintEndX, splintEndY, flameSize * 0.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FCD34D';
    ctx.font = '700 10px Plus Jakarta Sans, sans-serif';
    ctx.fillText('Đang đưa que đóm vào...', mouthX + 10, mouthY - 20);
  }

  ctx.restore();
}

function drawLitmusTest(
  ctx: CanvasRenderingContext2D,
  mouthX: number,
  mouthY: number,
  reaction: ReactionDetail,
  progress: number
) {
  ctx.save();
  const stripW = 8;
  const stripH = 34;

  let litmusColor = '#A855F7';
  let litmusStatus = 'Quỳ tím trung tính (pH ~ 7)';

  if (reaction.category === 'neutralization' && progress > 0.3) {
    litmusColor = '#A855F7';
    litmusStatus = 'Quỳ tím (pH ~ 7 Trung hòa)';
  } else if (reaction.id === 'nh4cl_naoh' && progress > 0.18) {
    litmusColor = '#3B82F6';
    litmusStatus = 'Quỳ tím hóa XANH (Khí Ammonia bazơ)';
  } else if (reaction.id === 'caco3_hcl' || reaction.id === 'bacl2_h2so4') {
    litmusColor = '#EF4444';
    litmusStatus = 'Quỳ tím hóa ĐỎ (Môi trường axit)';
  }

  ctx.fillStyle = litmusColor;
  ctx.fillRect(mouthX, mouthY, stripW, stripH);
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(mouthX, mouthY, stripW, stripH);

  ctx.fillStyle = litmusColor;
  ctx.font = '700 10px Plus Jakarta Sans, sans-serif';
  ctx.fillText(litmusStatus, mouthX + 14, mouthY + 18);

  ctx.restore();
}

// Color interpolation utility
function interpolateColor(color1: string, color2: string, factor: number): string {
  const c1 = hexToRgb(color1) || { r: 248, g: 250, b: 252 };
  const c2 = hexToRgb(color2) || { r: 248, g: 250, b: 252 };

  const r = Math.round(c1.r + (c2.r - c1.r) * factor);
  const g = Math.round(c1.g + (c2.g - c1.g) * factor);
  const b = Math.round(c1.b + (c2.b - c1.b) * factor);

  return `rgb(${r}, ${g}, ${b})`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  if (hex.startsWith('rgb')) {
    const match = hex.match(/\d+/g);
    if (match && match.length >= 3) {
      return { r: parseInt(match[0]), g: parseInt(match[1]), b: parseInt(match[2]) };
    }
  }

  const cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    return {
      r: parseInt(cleanHex[0] + cleanHex[0], 16),
      g: parseInt(cleanHex[1] + cleanHex[1], 16),
      b: parseInt(cleanHex[2] + cleanHex[2], 16),
    };
  }
  if (cleanHex.length === 6) {
    return {
      r: parseInt(cleanHex.substring(0, 2), 16),
      g: parseInt(cleanHex.substring(2, 4), 16),
      b: parseInt(cleanHex.substring(4, 6), 16),
    };
  }
  return null;
}

function hexToRgba(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return `rgba(248, 250, 252, ${alpha})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}
