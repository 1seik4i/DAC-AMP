import React, { useState, useEffect, useRef } from 'react';
import { 
  Tv, 
  Settings, 
  Sparkles, 
  Cpu, 
  Upload, 
  Layers, 
  Zap, 
  Moon,
  Volume2
} from 'lucide-react';
import { audioEngine } from '../audio';
import { useLocalStorageState } from '../hooks/useLocalStorageState';

export default function DisplayAnimationView() {
  const [activePreset, setActivePreset] = useLocalStorageState<'spectrum' | 'waveform' | 'vu' | 'liquid' | 'clock' | 'matrix' | 'starfield' | 'pulse' | 'fire' | 'glitch' | 'oscilloscope'>('dac_anim_preset', 'spectrum');
  const [speed, setSpeed] = useLocalStorageState<number>('dac_anim_speed', 1.2); // seconds helper
  const [brightness, setBrightness] = useLocalStorageState<number>('dac_anim_brightness', 85); // %
  const [accentColor, setAccentColor] = useLocalStorageState<string>('dac_anim_accentColor', '#adc6ff'); // Blue default
  const [logoAsset, setLogoAsset] = useLocalStorageState<string | null>('dac_anim_logo', null);
  const [autoSleep, setAutoSleep] = useLocalStorageState<string>('dac_anim_autoSleep', '15 Minutes');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle');

  // Dynamic viewport scale helper to fit content without scrolling
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const handleResize = () => {
      const height = window.innerHeight;
      if (height < 850) {
        const factor = Math.max(0.75, Math.min(1.0, (height - 140) / 710));
        setScale(factor);
      } else {
        setScale(1);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persistent state refs for animations
  const starfieldRef = useRef<Array<{x: number; y: number; z: number; speed: number}>>([]);
  const matrixColsRef = useRef<number[]>([]);
  const fireDataRef = useRef<number[]>([]);

  const colors = [
    { color: '#adc6ff', name: 'Electric Blue' },
    { color: '#c5a3ff', name: 'Cosmic Violet' },
    { color: '#ffb4ab', name: 'Crimson Ember' },
    { color: '#88f3ff', name: 'Hyper Cyan' },
    { color: '#ffb595', name: 'Analog Amber' },
  ];

  const presets = [
    { id: 'spectrum' as const, name: 'Spectrum', icon: '📊' },
    { id: 'waveform' as const, name: 'Waveform', icon: '〰️' },
    { id: 'vu' as const, name: 'VU Meter', icon: '📻' },
    { id: 'liquid' as const, name: 'Liquid', icon: '💧' },
    { id: 'clock' as const, name: 'Clock', icon: '🕒' },
    { id: 'matrix' as const, name: 'Matrix', icon: '👾' },
    { id: 'starfield' as const, name: 'Starfield', icon: '✨' },
    { id: 'pulse' as const, name: 'Pulse Ring', icon: '🔘' },
    { id: 'fire' as const, name: 'Fire', icon: '🔥' },
    { id: 'glitch' as const, name: 'Glitch', icon: '⚡' },
    { id: 'oscilloscope' as const, name: 'Scope', icon: '📈' },
  ];

  // Canvas dimensions matching real OLED: 640x260 landscape
  const CW = 640;
  const CH = 260;

  // HTML5 Canvas continuous render loops simulating dynamic OLED displays
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frameCount = 0;

    // Define spectrum values state
    const barsCount = 32;
    const barHeights = Array(barsCount).fill(0).map(() => Math.random() * 80);

    // Initialize starfield
    if (starfieldRef.current.length === 0) {
      for (let i = 0; i < 80; i++) {
        starfieldRef.current.push({
          x: Math.random() * CW - CW / 2,
          y: Math.random() * CH - CH / 2,
          z: Math.random() * CW,
          speed: Math.random() * 2 + 0.5
        });
      }
    }

    // Initialize matrix columns
    if (matrixColsRef.current.length === 0) {
      const colCount = Math.floor(CW / 10);
      matrixColsRef.current = Array(colCount).fill(0).map(() => Math.random() * CH);
    }

    // Initialize fire data
    if (fireDataRef.current.length === 0) {
      fireDataRef.current = Array(CW * CH).fill(0);
    }

    const render = () => {
      frameCount += (speed * 0.35); // adjust render cycle frequency
      
      // Clear canvas with deep true OLED black
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, CW, CH);

      // OLED Brightness styling mapping
      ctx.globalAlpha = brightness / 100;

      // Parse accent color to RGB for advanced effects
      const hexToRgb = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return { r, g, b };
      };
      const rgb = hexToRgb(accentColor);

      // ====== RENDER PRESET ANIMATIONS ======
      if (activePreset === 'spectrum') {
        const padding = 3;
        const totalPadding = padding * (barsCount - 1);
        const barWidth = (CW - 16 - totalPadding) / barsCount;

        for (let i = 0; i < barsCount; i++) {
          const targetHeight = Math.abs(Math.sin(i * 0.15 + frameCount * 0.08)) * (CH - 60) + 10;
          barHeights[i] += (targetHeight - barHeights[i]) * 0.15;

          const h = barHeights[i];
          const x = 8 + i * (barWidth + padding);
          const y = CH - 20 - h;

          ctx.fillStyle = accentColor;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, h, 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = 0.45 * (brightness / 100);
          ctx.fillRect(x, Math.max(8, y - 3), barWidth, 2);
          ctx.globalAlpha = brightness / 100;
        }

      } else if (activePreset === 'waveform') {
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < CW; x++) {
          const y = CH / 2 + 
                    Math.sin(x * 0.04 + frameCount * 0.1) * 40 + 
                    Math.sin(x * 0.08 - frameCount * 0.08) * 15;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.globalAlpha = 0.15 * (brightness / 100);
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x < CW; x++) {
          const y = CH / 2 + 
                    Math.sin(x * 0.03 - frameCount * 0.05) * 55 + 
                    Math.cos(x * 0.06 + frameCount * 0.1) * 20;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

      } else if (activePreset === 'vu') {
        const drawNeedle = (cx: number, cy: number, radius: number, activeAngle: number) => {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, -Math.PI * 0.8, -Math.PI * 0.2);
          ctx.stroke();

          ctx.strokeStyle = accentColor;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, -Math.PI * 0.8, activeAngle);
          ctx.stroke();

          ctx.strokeStyle = '#e5e2e1';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(activeAngle) * (radius - 12), cy + Math.sin(activeAngle) * (radius - 12));
          ctx.stroke();

          ctx.fillStyle = accentColor;
          ctx.beginPath();
          ctx.arc(cx, cy, 6, 0, Math.PI * 2);
          ctx.fill();
        };

        const needle1Angle = -Math.PI * 0.8 + Math.abs(Math.sin(frameCount * 0.05) * Math.cos(frameCount * 0.02)) * (Math.PI * 0.6);
        const needle2Angle = -Math.PI * 0.8 + Math.abs(Math.sin(frameCount * 0.04 + 1)) * (Math.PI * 0.6);

        // Side-by-side for landscape
        drawNeedle(CW * 0.3, CH * 0.8, 120, needle1Angle);
        drawNeedle(CW * 0.7, CH * 0.8, 120, needle2Angle);

        // Labels
        ctx.fillStyle = accentColor;
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('L', CW * 0.3, CH * 0.8 - 135);
        ctx.fillText('R', CW * 0.7, CH * 0.8 - 135);

      } else if (activePreset === 'liquid') {
        ctx.fillStyle = accentColor;
        for (let i = 0; i < 5; i++) {
          const x = CW / 2 + Math.cos(frameCount * 0.03 + i * 1.3) * 50;
          const y = CH / 2 + Math.sin(frameCount * 0.04 - i * 0.8) * 80;
          const r = Math.abs(Math.sin(frameCount * 0.01 + i)) * 18 + 12;

          ctx.globalAlpha = (0.4 + i * 0.1) * (brightness / 100);
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = brightness / 100;

      } else if (activePreset === 'clock') {
        const now = new Date();
        const hrs = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        const secs = String(now.getSeconds()).padStart(2, '0');

        ctx.fillStyle = accentColor;
        ctx.font = 'bold 80px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${hrs}:${mins}`, CW / 2 - 30, CH / 2 - 10);

        ctx.font = 'bold 36px monospace';
        ctx.globalAlpha = 0.6 * (brightness / 100);
        ctx.fillText(`:${secs}`, CW / 2 + 130, CH / 2 + 5);
        ctx.globalAlpha = brightness / 100;

        ctx.font = '14px sans-serif';
        ctx.fillStyle = '#8b90a0';
        ctx.fillText('LOCAL TIME', CW / 2, CH / 2 + 70);

      } else if (activePreset === 'matrix') {
        ctx.fillStyle = accentColor;
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'left';

        const colWidth = 10;
        const colsCount = Math.floor(CW / colWidth);
        for (let i = 0; i < colsCount; i++) {
          const chars = 'アイウエオカキクケコサシスセソ0123456789ABCDEF';
          const randomChar = chars[Math.floor(Math.random() * chars.length)];
          matrixColsRef.current[i] = ((matrixColsRef.current[i] || 0) + (1 + (i % 3)) * speed * 2) % CH;
          
          const yOffset = matrixColsRef.current[i];
          
          // Draw trail
          for (let j = 0; j < 8; j++) {
            const trailY = yOffset - j * 12;
            if (trailY > 0 && trailY < CH) {
              ctx.globalAlpha = ((8 - j) / 8) * 0.8 * (brightness / 100);
              const trailChar = chars[Math.floor(Math.random() * chars.length)];
              ctx.fillText(trailChar, i * colWidth + 2, trailY);
            }
          }
          ctx.globalAlpha = brightness / 100;
        }

      } else if (activePreset === 'starfield') {
        // 3D starfield warp effect
        const cx = CW / 2;
        const cy = CH / 2;
        const stars = starfieldRef.current;

        for (let i = 0; i < stars.length; i++) {
          const star = stars[i];
          star.z -= star.speed * speed * 1.5;

          if (star.z <= 0) {
            star.x = Math.random() * CW - cx;
            star.y = Math.random() * CH - cy;
            star.z = CW;
            star.speed = Math.random() * 2 + 0.5;
          }

          const sx = (star.x / star.z) * CW + cx;
          const sy = (star.y / star.z) * CH + cy;
          const size = Math.max(0.5, (1 - star.z / CW) * 3);

          if (sx >= 0 && sx < CW && sy >= 0 && sy < CH) {
            const alpha = (1 - star.z / CW) * (brightness / 100);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = accentColor;
            ctx.beginPath();
            ctx.arc(sx, sy, size, 0, Math.PI * 2);
            ctx.fill();

            // Trail line
            const prevSx = (star.x / (star.z + star.speed * 4)) * CW + cx;
            const prevSy = (star.y / (star.z + star.speed * 4)) * CH + cy;
            ctx.strokeStyle = accentColor;
            ctx.lineWidth = size * 0.5;
            ctx.globalAlpha = alpha * 0.4;
            ctx.beginPath();
            ctx.moveTo(prevSx, prevSy);
            ctx.lineTo(sx, sy);
            ctx.stroke();
          }
        }
        ctx.globalAlpha = brightness / 100;

      } else if (activePreset === 'pulse') {
        // Concentric pulsing rings
        const cx = CW / 2;
        const cy = CH / 2;
        const maxRadius = Math.min(CW, CH) * 0.4;

        for (let i = 0; i < 6; i++) {
          const phase = (frameCount * 0.06 * speed + i * 0.8) % (Math.PI * 2);
          const radius = (Math.sin(phase) * 0.5 + 0.5) * maxRadius + 8;
          const alpha = (1 - radius / maxRadius) * 0.7;

          ctx.strokeStyle = accentColor;
          ctx.lineWidth = 2;
          ctx.globalAlpha = Math.max(0, alpha) * (brightness / 100);
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Center dot
        ctx.globalAlpha = brightness / 100;
        ctx.fillStyle = accentColor;
        const pulseSize = 4 + Math.sin(frameCount * 0.1) * 2;
        ctx.beginPath();
        ctx.arc(cx, cy, pulseSize, 0, Math.PI * 2);
        ctx.fill();

        // Rotating arc
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.3 * (brightness / 100);
        const arcAngle = frameCount * 0.03;
        ctx.beginPath();
        ctx.arc(cx, cy, maxRadius + 10, arcAngle, arcAngle + Math.PI * 0.5);
        ctx.stroke();
        ctx.globalAlpha = brightness / 100;

      } else if (activePreset === 'fire') {
        // Fire/plasma rising effect
        const imgData = ctx.getImageData(0, 0, CW, CH);
        const data = imgData.data;

        // Generate heat source at bottom
        for (let x = 0; x < CW; x++) {
          const idx = ((CH - 1) * CW + x);
          fireDataRef.current[idx] = Math.random() > 0.4 ? 255 : 0;
          const idx2 = ((CH - 2) * CW + x);
          fireDataRef.current[idx2] = Math.random() > 0.5 ? 200 : 0;
        }

        // Propagate fire upward
        for (let y = 0; y < CH - 2; y++) {
          for (let x = 1; x < CW - 1; x++) {
            const src = (y + 1) * CW + x;
            const dest = y * CW + x;
            const avg = (
              fireDataRef.current[src] +
              fireDataRef.current[src - 1] +
              fireDataRef.current[src + 1] +
              fireDataRef.current[(y + 2) * CW + x]
            ) / 4.08;
            fireDataRef.current[dest] = Math.max(0, avg);
          }
        }

        // Map fire data to colored pixels
        for (let y = 0; y < CH; y++) {
          for (let x = 0; x < CW; x++) {
            const val = fireDataRef.current[y * CW + x];
            const pixIdx = (y * CW + x) * 4;
            // Map intensity to accent color gradient
            const intensity = val / 255;
            data[pixIdx] = Math.min(255, rgb.r * intensity + 200 * intensity * intensity);
            data[pixIdx + 1] = Math.min(255, rgb.g * intensity * 0.5);
            data[pixIdx + 2] = Math.min(255, rgb.b * intensity * 0.2);
            data[pixIdx + 3] = Math.max(0, val * 0.9) * (brightness / 100);
          }
        }
        ctx.putImageData(imgData, 0, 0);

      } else if (activePreset === 'glitch') {
        // Digital glitch / noise effect
        // Base scanlines
        for (let y = 0; y < CH; y += 2) {
          ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${0.03 * (brightness / 100)})`;
          ctx.fillRect(0, y, CW, 1);
        }

        // Random glitch blocks
        const glitchCount = 3 + Math.floor(Math.sin(frameCount * 0.2) * 2 + 2);
        for (let i = 0; i < glitchCount; i++) {
          const gx = Math.random() * CW;
          const gy = Math.random() * CH;
          const gw = Math.random() * 60 + 10;
          const gh = Math.random() * 8 + 2;

          ctx.fillStyle = accentColor;
          ctx.globalAlpha = (Math.random() * 0.5 + 0.2) * (brightness / 100);
          ctx.fillRect(gx, gy, gw, gh);
        }

        // Large displacement block
        if (Math.sin(frameCount * 0.15) > 0.7) {
          const blockY = Math.random() * CH;
          const blockH = Math.random() * 30 + 10;
          const shift = (Math.random() - 0.5) * 20;
          ctx.globalAlpha = 0.8 * (brightness / 100);
          ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`;
          ctx.fillRect(shift, blockY, CW, blockH);
        }

        // Center text glitch
        ctx.globalAlpha = (0.6 + Math.random() * 0.4) * (brightness / 100);
        ctx.fillStyle = accentColor;
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        const offsetX = (Math.random() - 0.5) * 4;
        const offsetY = (Math.random() - 0.5) * 4;
        ctx.fillText('SIGNAL', CW / 2 + offsetX, CH / 2 - 10 + offsetY);
        ctx.font = 'bold 10px monospace';
        ctx.fillText('ERROR', CW / 2 - offsetX, CH / 2 + 10 - offsetY);

        // RGB split effect
        ctx.globalAlpha = 0.15 * (brightness / 100);
        ctx.fillStyle = '#ff0000';
        ctx.fillText('ERROR', CW / 2 + 2, CH / 2 + 10);
        ctx.fillStyle = '#0000ff';
        ctx.fillText('ERROR', CW / 2 - 2, CH / 2 + 10);

        ctx.globalAlpha = brightness / 100;

      } else if (activePreset === 'oscilloscope') {
        // Lissajous oscilloscope pattern
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 1.5;
        
        // Grid lines
        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 8; i++) {
          const gy = (CH / 8) * i;
          ctx.beginPath();
          ctx.moveTo(0, gy);
          ctx.lineTo(CW, gy);
          ctx.stroke();
        }
        for (let i = 0; i < 5; i++) {
          const gx = (CW / 4) * i;
          ctx.beginPath();
          ctx.moveTo(gx, 0);
          ctx.lineTo(gx, CH);
          ctx.stroke();
        }

        // Lissajous figure
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const freqA = 3;
        const freqB = 2;
        const phaseShift = frameCount * 0.02;
        for (let t = 0; t < Math.PI * 2; t += 0.01) {
          const x = CW / 2 + Math.sin(freqA * t + phaseShift) * (CW / 2 - 15);
          const y = CH / 2 + Math.sin(freqB * t) * (CH / 2 - 40);
          if (t === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Glow duplicate
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 4;
        ctx.globalAlpha = 0.12 * (brightness / 100);
        ctx.beginPath();
        for (let t = 0; t < Math.PI * 2; t += 0.01) {
          const x = CW / 2 + Math.sin(freqA * t + phaseShift) * (CW / 2 - 15);
          const y = CH / 2 + Math.sin(freqB * t) * (CH / 2 - 40);
          if (t === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.globalAlpha = brightness / 100;

        // Dot at current position
        const dotT = (frameCount * 0.05) % (Math.PI * 2);
        const dotX = CW / 2 + Math.sin(freqA * dotT + phaseShift) * (CW / 2 - 15);
        const dotY = CH / 2 + Math.sin(freqB * dotT) * (CH / 2 - 40);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw custom logo asset overlay if loaded
      if (logoAsset) {
        ctx.save();
        ctx.globalAlpha = 0.15;
        const img = new Image();
        img.src = logoAsset;
        ctx.drawImage(img, CW / 2 - 20, 10, 40, 40);
        ctx.restore();
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [activePreset, speed, brightness, accentColor, logoAsset]);

  const handleAssetUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setLogoAsset(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const syncSettings = () => {
    setSyncStatus('syncing');
    audioEngine.playTest('gaming', [5, 5, 5, 5, 5, 5, 5, 5, 5, 5]);
    setTimeout(() => {
      setSyncStatus('synced');
      setTimeout(() => setSyncStatus('idle'), 2500);
    }, 1200);
  };

  return (
    <div 
      className="flex-1 animate-fade-in text-[#e5e2e1] flex flex-col justify-start"
      style={{ transform: `scale(${scale})`, transformOrigin: 'top center', width: '100%' }}
    >
      
      {/* Head section */}
      <section className="mb-5 max-w-7xl">
        <h2 className="font-sans font-bold text-3xl text-[#e5e2e1] leading-tight mb-1">Display Animation</h2>
        <p className="font-sans text-[#c1c6d7] text-sm opacity-75">
          Program the front panel OLED screen. Tailor speeds, presets, sensitivity, and pixel contrast.
        </p>
      </section>

      {/* Primary configuration columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 max-w-7xl">
        
        {/* LEFT COLUMN: Main live preview display panel */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          <div className="bg-[#121212]/90 border border-white/[0.08] p-5 rounded-2xl backdrop-blur-xl flex flex-col gap-4 premium-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#8b90a0] tracking-widest leading-none">LIVE HARDWARE PREVIEW</span>
              <span className="text-[9px] uppercase font-mono text-[#adc6ff]/60 tracking-wider">640 × 260 OLED</span>
            </div>
            
            {/* Visualizer Frame — landscape */}
            <div className="flex justify-center w-full">
              <div className="w-full rounded-2xl border-4 border-[#252525] bg-[#050505] overflow-hidden relative shadow-inner shadow-black/50" style={{ aspectRatio: '640/260' }}>
                <canvas 
                  ref={canvasRef} 
                  width={CW} 
                  height={CH} 
                  className="block w-full h-full"
                />
              </div>
            </div>

            {/* Sync buttons */}
            <div className="flex items-center gap-3">
              <button 
                onClick={syncSettings}
                className="flex-1 h-10 rounded-xl bg-[#adc6ff] hover:bg-[#adc6ff]/90 text-[#002e69] text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-3.5 h-3.5 text-[#002e69]" />
                Apply Changes
              </button>
              
              <button 
                onClick={syncSettings}
                className="h-10 px-5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-xs font-bold text-white transition-all flex items-center justify-center gap-2"
              >
                {syncStatus === 'syncing' ? 'Syncing...' : syncStatus === 'synced' ? 'Synchronized!' : 'Sync Settings'}
              </button>
            </div>
          </div>

          {/* Preset Buttons Grid */}
          <div className="bg-[#1c1b1b]/40 border border-white/[0.06] p-5 rounded-2xl">
            <h3 className="text-[10px] font-bold text-[#c1c6d7] uppercase tracking-wider mb-4">Preset Modes</h3>
            
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-6 gap-2">
              {presets.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePreset(item.id);
                    audioEngine.playTest('vocal', [-4, -3, -2, -1, 0, 1, 2, 3, 4, 5]);
                  }}
                  className={`flex flex-col items-center justify-center gap-1.5 h-16 rounded-xl border transition-all ${
                    activePreset === item.id 
                      ? 'bg-[#adc6ff]/10 border-[#adc6ff]/40 text-[#adc6ff] font-bold shadow-md shadow-[#adc6ff]/5' 
                      : 'bg-[#121212] border-white/[0.05] text-[#8b90a0] hover:text-[#e5e2e1] hover:border-white/[0.12]'
                  }`}
                >
                  <span className="text-lg filter saturate-75">{item.icon}</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider">{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Extra adjustments & properties */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          
          {/* OLED adjustments panel */}
          <div className="bg-[#121212]/90 border border-white/[0.08] p-5 rounded-2xl backdrop-blur-xl premium-shadow flex flex-col gap-4">
            <h3 className="text-[10px] font-bold text-[#e5e2e1] uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-3.5 h-3.5 text-[#adc6ff]" />
              Display Hardware Config
            </h3>

            {/* Animation Speed Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#c1c6d7] opacity-80 font-medium">Render Frame Delay</span>
                <span className="font-mono text-[#adc6ff] font-bold">{speed.toFixed(1)}s</span>
              </div>
              <input 
                type="range"
                min="0.2"
                max="3.0"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full accent-[#adc6ff] bg-[#0a0a0a] rounded-lg h-1.5 cursor-pointer"
              />
            </div>

            {/* OLED brightness slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#c1c6d7] opacity-80 font-medium">OLED Brightness</span>
                <span className="font-mono text-[#adc6ff] font-bold">{brightness}%</span>
              </div>
              <input 
                type="range"
                min="10"
                max="100"
                step="5"
                value={brightness}
                onChange={(e) => setBrightness(parseInt(e.target.value))}
                className="w-full accent-[#adc6ff] bg-[#0a0a0a] rounded-lg h-1.5 cursor-pointer"
              />
            </div>


            {/* Accent Color Circles Picker */}
            <div className="flex flex-col gap-2">
              <span className="text-xs text-[#c1c6d7] opacity-80 font-medium">Emission Hue</span>
              <div className="flex items-center gap-3">
                {colors.map((c) => (
                  <button
                    key={c.color}
                    onClick={() => setAccentColor(c.color)}
                    className={`w-7 h-7 rounded-full cursor-pointer relative flex items-center justify-center transition-all ${
                      accentColor === c.color ? 'scale-110 shadow-lg' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.color }}
                    title={c.name}
                  >
                    {accentColor === c.color && (
                      <span className="w-2 h-2 rounded-full bg-[#121212]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Custom Identity block */}
          <div className="bg-[#121212]/90 border border-white/[0.08] p-5 rounded-2xl backdrop-blur-xl premium-shadow flex flex-col gap-4">
            <h3 className="text-[10px] font-bold text-[#e5e2e1] uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-[#e9b3ff]" />
              Branding & Idle Assets
            </h3>

            {/* drag drop dummy file box */}
            <div 
              onClick={handleAssetUploadClick}
              className="border-2 border-dashed border-white/[0.08] hover:border-[#adc6ff]/40 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 transition-colors cursor-pointer group bg-white/[0.01]"
            >
              <Upload className="w-6 h-6 text-[#adc6ff] opacity-60 group-hover:opacity-100 transition-opacity" />
              <div>
                <p className="text-xs font-bold text-[#e5e2e1]">Upload Graphic Asset</p>
                <p className="text-[10px] text-[#8b90a0] mt-0.5">GIF, JPG or PNG (Max 172×320px)</p>
              </div>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="hidden" 
              />
            </div>


            {/* Auto sleep settings */}
            <div className="flex items-center justify-between border-t border-white/[0.04] pt-3">
              <div>
                <span className="text-xs font-semibold text-[#e5e2e1] block">Display Sleep Timer</span>
                <span className="text-[10px] text-[#8b90a0]">{autoSleep} timeout</span>
              </div>
              <select 
                value={autoSleep}
                onChange={(e) => setAutoSleep(e.target.value)}
                className="bg-[#0a0a0a] border border-white/[0.08] text-xs font-medium text-[#adc6ff] rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option>5 Minutes</option>
                <option>15 Minutes</option>
                <option>30 Minutes</option>
                <option>Never Sleep</option>
              </select>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
