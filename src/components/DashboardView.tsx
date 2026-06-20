import React, { useState, useEffect, useRef } from 'react';
import { 
  CloudLightning, 
  RefreshCw, 
  Download, 
  ArrowUpCircle, 
  Info,
  Layers,
  Shuffle, 
  VolumeX, 
  Volume2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { audioEngine } from '../audio';

interface DashboardViewProps {
  volume: number;
  setVolume: React.Dispatch<React.SetStateAction<number>>;
  gainStage: 'Low' | 'High';
  setGainStage: (val: 'Low' | 'High') => void;
  routing: 'Balanced' | 'Single-Ended';
  setRouting: (val: 'Balanced' | 'Single-Ended') => void;
}

export default function DashboardView({
  volume,
  setVolume,
  gainStage,
  setGainStage,
  routing,
  setRouting
}: DashboardViewProps) {
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'checking'>('idle');
  const [backupStatus, setBackupStatus] = useState<'idle' | 'backing' | 'synced'>('idle');
  const [firmwareStatus, setFirmwareStatus] = useState<'idle' | 'checking' | 'latest'>('idle');

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

  // Knob dragging mechanics
  const knobRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Sync Device action
  const handleSyncDevice = () => {
    setSyncStatus('checking');
    setTimeout(() => {
      setSyncStatus('success');
      // Subtle sound trigger
      audioEngine.playTest('vocal', [1, 2, 3, 2, 1, 0, -1, -2, -1, 0]);
      setTimeout(() => setSyncStatus('idle'), 3000);
    }, 1500);
  };

  const handleBackup = () => {
    setBackupStatus('backing');
    setTimeout(() => {
      setBackupStatus('synced');
      setTimeout(() => setBackupStatus('idle'), 3000);
    }, 1200);
  };

  const handleCheckFirmware = () => {
    setFirmwareStatus('checking');
    setTimeout(() => {
      setFirmwareStatus('latest');
      setTimeout(() => setFirmwareStatus('idle'), 3500);
    }, 1800);
  };

  // Convert volume (0 to 100 %) to dial angle for SVG representation
  const volMin = 0;
  const volMax = 100;
  const percentage = Math.min(100, Math.max(0, volume));
  
  // Calculate stroke dasharray for the SVG gauge arc
  const radius = 90;
  const circumference = 2 * Math.PI * radius; // Approx 565.48
  const arcSpan = 360; // Sweep angle
  const offset = circumference - (circumference * percentage) / 100;

  // Handle drag to adjust volume
  const handleMouseDown = () => setIsDragging(true);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !knobRef.current) return;
      const rect = knobRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      
      // Calculate angle in degrees
      let angle = Math.atan2(dy, dx) * (180 / Math.PI);
      
      // Shift angle to align with visual dial starting at top (-90 deg relative to rightwards 0)
      let adjustedAngle = angle + 90;
      if (adjustedAngle < 0) adjustedAngle += 360;
      
      // Map adjustedAngle (0 to 360) to volume percentage (0 to 100)
      const newVol = Math.round((adjustedAngle / 360) * 100);
      
      setVolume(prev => {
        // Prevent wrap-around jumping across the 0/100 (12 o'clock) boundary
        if (prev > 80 && newVol < 20) {
          return 100;
        }
        if (prev < 20 && newVol > 80) {
          return 0;
        }
        return newVol;
      });
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, setVolume]);

  // Wheel scroll to adjust volume smoothly with mouse wheel
  useEffect(() => {
    const knob = knobRef.current;
    if (!knob) return;

    const onWheelEvent = (e: WheelEvent) => {
      e.preventDefault();
      // Calculate a step that scales with the scroll delta for a natural, premium feel.
      // Standard wheel tick delta is ~100-120. We scale it so one tick is ~4-5%.
      const rawStep = -e.deltaY * 0.04;
      // Make sure the minimum step for any scroll event is at least 1 unit to avoid dead scroll on slow trackpads
      const step = rawStep > 0 ? Math.max(1, Math.round(rawStep)) : Math.min(-1, Math.round(rawStep));
      setVolume(prev => Math.max(0, Math.min(100, prev + step)));
    };

    knob.addEventListener('wheel', onWheelEvent, { passive: false });
    return () => knob.removeEventListener('wheel', onWheelEvent);
  }, [setVolume]);

  const handleStepUpDown = (step: 'up' | 'down') => {
    let delta = step === 'up' ? 1 : -1;
    let nextVal = Math.max(volMin, Math.min(volMax, volume + delta));
    setVolume(nextVal);
  };

  return (
    <div 
      className="flex-1 animate-fade-in text-[#e5e2e1] flex flex-col justify-start"
      style={{ transform: `scale(${scale})`, transformOrigin: 'top center', width: '100%' }}
    >
      {/* Top Banner section */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
        <div>
          <h2 className="font-sans font-bold text-4xl text-[#e5e2e1] leading-tight mb-1">Dashboard</h2>
        </div>
        
        {/* Rapid Actions */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button 
            onClick={handleBackup} e-id="backup-btn"
            disabled={backupStatus !== 'idle'}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-xs font-semibold hover:border-white/[0.12] transition-all duration-200"
          >
            <Download className="w-4 h-4 text-[#adc6ff]" />
            {backupStatus === 'backing' ? 'Saving...' : backupStatus === 'synced' ? 'All Saved!' : 'Backup All'}
          </button>
          
          <button 
            onClick={handleCheckFirmware}
            disabled={firmwareStatus !== 'idle'}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-xs font-semibold hover:border-white/[0.12] transition-all duration-200"
          >
            <ArrowUpCircle className="w-4 h-4 text-[#e9b3ff]" />
            {firmwareStatus === 'checking' ? 'Querying...' : firmwareStatus === 'latest' ? 'Up to date v2.4.1' : 'Update Firmware'}
          </button>

          <button 
            onClick={handleSyncDevice}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#adc6ff]/10 hover:bg-[#adc6ff]/15 border border-[#adc6ff]/20 text-xs font-bold text-[#adc6ff] active:scale-[0.97] transition-all duration-200"
          >
            <CloudLightning className="w-4 h-4" />
            Sync Cloud
          </button>
        </div>
      </section>

      {/* Main Stats Layout Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl">
        
        {/* LEFT COLUMN: Device Info Specs */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="bg-[#121212]/80 border border-white/[0.08] rounded-3xl p-6 flex flex-col justify-between backdrop-blur-xl flex-1 premium-shadow relative overflow-hidden">
            {/* Top glass lighting card decoration */}
            <div className="absolute top-0 left-0 right-0 h-[100px] bg-gradient-to-b from-[#adc6ff]/[0.02] to-transparent pointer-events-none" />
            
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#adc6ff] tracking-wider">Device Status</span>
                  <h3 className="font-sans font-bold text-xl text-[#e5e2e1] mt-1">Sonic Pro X1</h3>
                </div>
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse" />
              </div>

              {/* Matrix details */}
              <div className="space-y-3.5 pt-1">
                <div className="flex items-center justify-between border-b border-white/[0.04] pb-2.5">
                  <span className="text-xs font-medium text-[#c1c6d7] opacity-6 w-1/2">Connection Type</span>
                  <span className="text-xs font-semibold text-[#e5e2e1] text-right truncate flex items-center justify-end gap-1.5 font-mono">
                    USB Audio Class 2.0
                    <Layers className="w-3.5 h-3.5 text-[#8b90a0]" />
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-white/[0.04] pb-2.5">
                  <span className="text-xs font-medium text-[#c1c6d7] opacity-60 w-1/2">Active Firmware</span>
                  <span className="text-xs font-bold text-[#adc6ff] font-mono">v2.4.1</span>
                </div>

                <div className="flex items-center justify-between border-b border-white/[0.04] pb-2.5">
                  <span className="text-xs font-medium text-[#c1c6d7] opacity-60 w-1/2">Sample Rate Match</span>
                  <span className="text-xs font-semibold text-[#e9b3ff] font-mono">384.0 kHz / 24-Bit</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#c1c6d7] opacity-60 w-1/2">ASIO Driver State</span>
                  <span className="text-xs font-semibold text-[#e5e2e1]">Lock • Ultra Low Latency</span>
                </div>
              </div>
            </div>

            {/* Clickable Action button inside columns */}
            <button 
              onClick={handleSyncDevice}
              disabled={syncStatus === 'checking'}
              className="w-full h-11 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.12] hover:bg-white/[0.06] font-medium text-xs text-[#e5e2e1] flex items-center justify-center gap-2.5 transition-all mt-4"
            >
              <RefreshCw className={`w-4 h-4 text-[#adc6ff] ${syncStatus === 'checking' ? 'animate-spin' : ''}`} />
              {syncStatus === 'checking' 
                ? 'Validating Device Interconnect...' 
                : syncStatus === 'success' 
                  ? 'Device Calibration Finished!' 
                  : 'Sync Device Hardware'}
            </button>
          </div>

          {/* Quick Informational Tip Card */}
          <div className="bg-gradient-to-tr from-[#161616]/70 to-[#121212]/90 border border-white/[0.05] rounded-3xl p-5 flex gap-4 backdrop-blur-md">
            <Info className="w-5 h-5 text-[#adc6ff] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-[#e5e2e1] uppercase tracking-wider mb-1">Hi-Fi Bit Perfect Tip</h4>
              <p className="text-xs text-[#c1c6d7] opacity-75 leading-relaxed">
                For optimal dynamic range, keep Windows / MacOS system master volumes set to 100% and dial output attenuation directly within DAC Studio controls below.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Output Level and volume circular knob */}
        <div className="lg:col-span-7">
          <div className="bg-[#121212]/80 border border-white/[0.08] rounded-3xl p-6 backdrop-blur-xl flex flex-col gap-4 relative overflow-hidden premium-shadow">
            
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#e9b3ff] tracking-widest leading-none">Output Signal Tuning</span>
              <Volume2 className="w-4 h-4 text-[#8b90a0]" />
            </div>

            {/* Circular Knob Controller Zone */}
            <div className="flex flex-col items-center justify-center py-2">
              <div 
                ref={knobRef}
                onMouseDown={handleMouseDown}
                className="relative w-52 h-52 rounded-full bg-[#0a0a0a] border border-white/[0.05] flex items-center justify-center cursor-pointer select-none group focus:outline-none"
              >
                {/* SVG Gauge Indicator Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 transform" viewBox="0 0 220 220">
                  {/* Gauge trail background */}
                  <circle 
                    cx="110" 
                    cy="110" 
                    r="90" 
                    fill="transparent" 
                    stroke="rgba(255,255,255,0.02)"
                    strokeWidth="10"
                    className="origin-center"
                  />
                  {/* Glowing Active Arc */}
                  <circle 
                    cx="110" 
                    cy="110" 
                    r="90" 
                    fill="transparent" 
                    stroke="url(#dialGradient)"
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className={`origin-center ${isDragging ? 'transition-none' : 'transition-all duration-200 ease-out'}`}
                  />
                  {/* Gradients */}
                  <defs>
                    <linearGradient id="dialGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4b8eff" />
                      <stop offset="50%" stopColor="#adc6ff" />
                      <stop offset="100%" stopColor="#e9b3ff" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Inner actual metal dial body */}
                <div 
                  className={`w-40 h-40 rounded-full bg-[#161616] border border-white/[0.08] flex flex-col items-center justify-center shadow-2xl relative ${isDragging ? 'transition-none' : 'transition-transform duration-200 ease-out'}`}
                  style={{ transform: `rotate(${(percentage / 100) * 360}deg)` }}
                >
                  {/* Indentation/notch indicator node */}
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-2 h-2.5 rounded-full bg-[#adc6ff] shadow-[0_0_8px_#adc6ff] pointer-events-none" />
                </div>

                {/* Overlaid static decibel reading (centered) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-[10px] font-bold text-[#c1c6d7] opacity-60 tracking-wider">VOLUME</span>
                  <div className="flex items-baseline justify-center gap-0.5 mt-0.5">
                    <span className="text-3xl font-headline font-bold text-[#e5e2e1]">{volume}</span>
                    <span className="text-[10px] font-semibold text-[#8b90a0]">%</span>
                  </div>
                  {volume === 100 ? (
                    <span className="text-[9px] uppercase font-bold text-[#adc6ff] tracking-widest mt-0.5">MAX VOL</span>
                  ) : volume === 0 ? (
                    <span className="text-[9px] uppercase font-bold text-red-500/80 tracking-widest mt-0.5">MUTED</span>
                  ) : (
                    <span className="text-[9px] uppercase font-semibold text-[#8b90a0] tracking-widest mt-0.5">ACTIVE</span>
                  )}
                </div>
              </div>

              {/* Extra button increments for precise accessible control */}
              <div className="flex items-center gap-4 mt-4">
                <button 
                  onClick={() => handleStepUpDown('down')}
                  className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] flex items-center justify-center text-[#e5e2e1] active:scale-95 transition-all"
                  title="Minimize attenuation"
                >
                  -
                </button>
                <span className="text-xs font-mono text-[#8b90a0]">Attenuation Increment</span>
                <button 
                  onClick={() => handleStepUpDown('up')}
                  className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] flex items-center justify-center text-[#e5e2e1] active:scale-95 transition-all"
                  title="Maximize volume"
                >
                  +
                </button>
              </div>
            </div>

            {/* Quick parameter switches */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1 pt-4 border-t border-white/[0.04]">
              {/* Gain Stage switcher */}
              <div>
                <label className="block text-xs font-semibold text-[#8b90a0] uppercase tracking-wider mb-1.5">Gain Stage</label>
                <div className="flex p-1 rounded-xl bg-[#0a0a0a] border border-white/[0.05]">
                  <button 
                    onClick={() => {
                      setGainStage('Low');
                      audioEngine.playTest('vocal', [-4, -2, 0, 1, 1, 0, -1, -2, -3, -4]); 
                    }}
                    className={`flex-1 h-9 rounded-lg text-xs font-bold transition-all ${gainStage === 'Low' ? 'bg-[#adc6ff]/10 text-[#adc6ff] border border-[#adc6ff]/25 shadow-inner' : 'text-[#8b90a0] hover:text-[#e5e2e1]'}`}
                  >
                    Low Gain
                  </button>
                  <button 
                    onClick={() => {
                      setGainStage('High');
                      audioEngine.playTest('bass', [4, 3, 2, 0, -1, -2, -1, 0, 1, 2]);
                    }}
                    className={`flex-1 h-9 rounded-lg text-xs font-bold transition-all ${gainStage === 'High' ? 'bg-[#adc6ff]/10 text-[#adc6ff] border border-[#adc6ff]/25 shadow-inner' : 'text-[#8b90a0] hover:text-[#e5e2e1]'}`}
                  >
                    High Gain
                  </button>
                </div>
              </div>

              {/* Output Routing selection */}
              <div>
                <label className="block text-xs font-semibold text-[#8b90a0] uppercase tracking-wider mb-1.5">Analog Output Routing</label>
                <div className="flex p-1 rounded-xl bg-[#0a0a0a] border border-white/[0.05]">
                  <button 
                    onClick={() => {
                      setRouting('Balanced');
                      audioEngine.playTest('vocal', [1, 2, 3, 4, 3, 2, 1, 0, 1, 2]);
                    }}
                    className={`flex-1 h-9 rounded-lg text-xs font-bold transition-all ${routing === 'Balanced' ? 'bg-[#e9b3ff]/10 text-[#e9b3ff] border border-[#e9b3ff]/25' : 'text-[#8b90a0] hover:text-[#e5e2e1]'}`}
                  >
                    Balanced
                  </button>
                  <button 
                    onClick={() => {
                      setRouting('Single-Ended');
                      audioEngine.playTest('musical', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
                    }}
                    className={`flex-1 h-9 rounded-lg text-xs font-bold transition-all ${routing === 'Single-Ended' ? 'bg-[#e9b3ff]/10 text-[#e9b3ff] border border-[#e9b3ff]/25' : 'text-[#8b90a0] hover:text-[#e5e2e1]'}`}
                  >
                    Single-Ended
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
