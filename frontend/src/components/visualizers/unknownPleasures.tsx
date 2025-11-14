'use client';

import React, { useEffect, useRef } from 'react';

export default function UnknownPleasures({
  audioData,
  isPlaying,
  width = 900,
  height = 900,
  bg = '#0b1a20',        // deep navy/black
  lineColor = '#f3f5f4', // off-white
  lines = 48,
  pointsPerLine = 200,
  gain = 1.2,            // slightly lower to avoid overshoot
  smoothing = 0.85,      // 0..1 (higher = smoother)
}: {
  audioData: {
    bass: number;
    mid: number;
    treble: number;
    volume: number;
    beat: boolean;
    frequencyData: number[];
    timeDomainData: number[];
  };
  isPlaying: boolean;
  width?: number;
  height?: number;
  bg?: string;
  lineColor?: string;
  lines?: number;
  pointsPerLine?: number;
  gain?: number;
  smoothing?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const historyRef = useRef<number[][]>([]);

  // utils
  const clamp = (v: number, lo: number, hi: number) =>
    v < lo ? lo : v > hi ? hi : v;

  // init history
  useEffect(() => {
    historyRef.current = Array.from({ length: lines }, () =>
      new Array(pointsPerLine).fill(0)
    );
  }, [lines, pointsPerLine]);

  useEffect(() => {
    let mounted = true;

    const tick = () => {
      const canvas = canvasRef.current;
      if (!canvas || !mounted) return;
      const ctx = canvas.getContext('2d')!;
      const W = canvas.width;
      const H = canvas.height;

      // draw area with padding (keeps lines safely inside)
      const paddingX = W * 0.18;
      const paddingY = H * 0.18;
      const drawW = W - paddingX * 2;
      const drawH = H - paddingY * 2;
      const lineGap = drawH / (lines - 1);

      // --- waveform build (central motion only) ---
      const waveform = new Array(pointsPerLine).fill(0);
      if (isPlaying && audioData?.timeDomainData?.length) {
        const raw = audioData.timeDomainData as number[];

        // detect format and normalize to [-1, 1]
        let sample: number[] = [];
        // heuristic: if values mostly between 0..255, treat as bytes
        const maxRaw = Math.max(...raw);
        const minRaw = Math.min(...raw);
        if (maxRaw > 1.2 || minRaw < -1.2) {
          // byte data (0..255) -> [-1, 1]
          sample = raw.map(v => (v - 128) / 128);
        } else {
          // already float in [-1, 1]
          sample = raw as number[];
        }

        // resample to pointsPerLine with small-window averaging for stability
        const step = Math.max(1, Math.floor(sample.length / pointsPerLine));
        for (let i = 0, k = 0; i < pointsPerLine; i++) {
          let acc = 0;
          for (let j = 0; j < step; j++) acc += sample[k + j] || 0;
          waveform[i] = (acc / step) * gain;
          k += step;
        }
      } else {
        // idle: subtle central breathing
        const t = performance.now() * 0.001;
        for (let i = 0; i < pointsPerLine; i++) {
          const u = i / (pointsPerLine - 1);
          const x = (u - 0.5) * 2;
          const center = Math.exp(-(x * x) / (2 * 0.14 * 0.14)); // narrow
          waveform[i] = Math.sin(t * 0.8) * 0.08 * center;
        }
      }

      // keep a rolling history (top = newest)
      const history = historyRef.current;
      history.unshift(waveform);
      if (history.length > lines) history.pop();

      // clear
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = lineColor;

      // central envelope: only the middle moves; edges stay flat
      // gaussian with small sigma for tight center (adjust 0.18..0.28 to taste)
      const sigma = 0.22;
      const centerBump = (u: number) => {
        const x = (u - 0.5) * 2;
        return Math.exp(-(x * x) / (2 * sigma * sigma));
      };

      // displacement cap so lines never leave their bands
      const maxDisp = lineGap * 0.72; // < lineGap keeps within band

      // small per-row offset for flowing feel
      const time = performance.now() * 0.001;
      const rowPhaseSpeed = 0.7; // lower = slower drift
      const rowOffsetAmt = 0.18; // lower = subtler offset

      for (let r = 0; r < history.length; r++) {
        const yBase = paddingY + r * lineGap;
        const row = history[r];
        const prev = history[r + 1] ?? row;

        const phase = time * rowPhaseSpeed + r * rowOffsetAmt;

        ctx.beginPath();
        for (let i = 0; i < pointsPerLine; i++) {
          const u = i / (pointsPerLine - 1);

          // blend with prev row for smooth stacks
          const s = row[i] * (1 - smoothing) + prev[i] * smoothing;

          // center-only motion + subtle oscillation to keep middle alive
          const envelope = centerBump(u);
          const dispRaw = s * envelope + Math.sin(phase + u * Math.PI * 2) * 0.02 * envelope;

          // bound displacement so it never exits its band
          const disp = clamp(dispRaw, -1, 1) * maxDisp;

          const x = paddingX + u * drawW;
          const y = yBase - disp;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            // smooth quadratic to midpoint
            const uPrev = (i - 1) / (pointsPerLine - 1);
            const sPrev = row[i - 1] * (1 - smoothing) + prev[i - 1] * smoothing;
            const envPrev = centerBump(uPrev);
            const dispPrevRaw =
              sPrev * envPrev + Math.sin(phase + uPrev * Math.PI * 2) * 0.02 * envPrev;
            const yPrev = yBase - clamp(dispPrevRaw, -1, 1) * maxDisp;

            const xPrev = paddingX + uPrev * drawW;
            const cx = (xPrev + x) / 2;
            const cy = (yPrev + y) / 2;
            ctx.quadraticCurveTo(xPrev, yPrev, cx, cy);
          }
        }
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    // start one loop
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [audioData, isPlaying, lines, pointsPerLine, bg, lineColor, gain, smoothing, width, height]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div
        className="rounded-2xl shadow-lg overflow-hidden"
        style={{ width: '100%', maxWidth: width, aspectRatio: '1/1' }}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{ width: '100%', height: '100%', display: 'block', background: bg }}
        />
      </div>
    </div>
  );
}
