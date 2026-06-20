import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, 
  Cpu, 
  RefreshCw, 
  Layers, 
  Clock, 
  ShieldCheck, 
  RotateCcw,
  Check,
  Zap,
  Power
} from 'lucide-react';
import { audioEngine } from '../audio';
import { useLocalStorageState } from '../hooks/useLocalStorageState';

export default function SettingsView() {
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      const height = window.innerHeight;
      const width = window.innerWidth - 256; // Adjust for 64px (w-64) sidebar width
      
      const heightFactor = (height - 120) / 650;
      const widthFactor = (width - 80) / 1280; // 1280px is max-w-7xl, 80 is padding
      
      const factor = Math.min(heightFactor, widthFactor);
      setScale(Math.max(0.6, Math.min(1.3, factor)));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [brightness, setBrightness] = useLocalStorageState<number>('dac_settings_brightness', 75);
  const [autoSleep, setAutoSleep] = useLocalStorageState<boolean>('dac_settings_autoSleep', true);
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<'idle' | 'checking' | 'latest'>('idle');
  const [rebooting, setRebooting] = useState(false);

  const firmwareHistory = [
    {
      version: 'v2.4.1',
      date: 'Oct 12, 2023',
      changes: 'Improved DSD512 playback stability over USB connections. Fixed minor UI glitch on OLED display during critical boot sequences.',
      isCurrent: true
    },
    {
      version: 'v2.3.0',
      date: 'Aug 05, 2023',
      changes: 'Major DSP engine core overhaul. Added custom parametric EQ profile support and enhanced Bluetooth LDAC codecs latency values.',
      isCurrent: false
    },
    {
      version: 'v2.2.4',
      date: 'Jun 18, 2023',
      changes: 'Security patch and high-resolution MQA rendering optimization.',
      isCurrent: false
    }
  ];

  const handleUpdateCheck = () => {
    setCheckResult('checking');
    setChecking(true);
    setTimeout(() => {
      setCheckResult('latest');
      setChecking(false);
      // Sweeping sound
      audioEngine.playTest('vocal', [0, 1, 2, 3, 4, 3, 2, 1, 0, 0]);
    }, 2000);
  };

  const handleReboot = () => {
    setRebooting(true);
    setTimeout(() => {
      setRebooting(false);
      audioEngine.playTest('bass', [6, 4, 2, 0, 0, 0, 0, 0, 0, 0]);
    }, 1500);
  };

  return (
    <div 
      className="flex-1 animate-fade-in text-[#e5e2e1] flex flex-col justify-start pt-4 md:pt-8"
      ref={containerRef}
    >
      <div 
      className="w-full max-w-7xl mx-auto origin-top transition-transform duration-300 ease-out"
        style={{ transform: `scale(${scale})` }}
      >
        {/* Title */}
      <section className="mb-10 max-w-7xl">
        <h2 className="font-sans font-bold text-4xl text-[#e5e2e1] leading-tight mb-2">System Configuration</h2>
        <p className="font-sans text-[#c1c6d7] text-sm md:text-base opacity-75">
          Manage your device physical parameters, display sleep periods, and ensure your hardware receiver is running the latest verified firmware build.
        </p>
      </section>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl">
        
        {/* Left Column: Display and Interface (Span 7) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-[#121212]/90 border border-white/[0.08] p-8 rounded-3xl backdrop-blur-xl premium-shadow">
            <h3 className="text-sm font-bold text-[#adc6ff] uppercase tracking-wider mb-6 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Display & Interface
            </h3>

            {/* Brightness state */}
            <div className="space-y-4 pb-6 border-b border-white/[0.04]">
              <div className="flex justify-between items-baseline">
                <div>
                  <h4 className="text-sm font-semibold text-white">OLED Brightness Dimmer</h4>
                  <p className="text-xs text-[#8b90a0] mt-0.5">Adjusts general front panel indicator intensity levels.</p>
                </div>
                <span className="font-mono text-sm font-bold text-[#adc6ff]">{brightness}%</span>
              </div>
              
              <div className="relative pt-2">
                <input 
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={brightness}
                  onChange={(e) => setBrightness(parseInt(e.target.value))}
                  className="w-full accent-[#adc6ff] bg-[#0a0a0a] rounded-lg h-1.5 cursor-pointer"
                />
              </div>
            </div>

            {/* Auto sleep display status toggles */}
            <div className="flex items-center justify-between py-6 border-b border-white/[0.04]">
              <div>
                <h4 className="text-sm font-semibold text-white">Auto-Sleep Display</h4>
                <p className="text-xs text-[#8b90a0] mt-0.5">Turn off physical display after 5 minutes of inactivity.</p>
              </div>
              <button 
                onClick={() => setAutoSleep(!autoSleep)}
                className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                  autoSleep ? 'bg-[#adc6ff]' : 'bg-[#0a0a0a] border border-white/[0.08]'
                }`}
              >
                <div className={`w-4 h-4 rounded-full transition-transform duration-200 ${
                  autoSleep ? 'translate-x-5 bg-[#002e69]' : 'translate-x-0 bg-[#8b90a0]'
                }`} />
              </button>
            </div>

            {/* Hardware Reboot block */}
            <div className="flex items-center justify-between pt-6">
              <div>
                <h4 className="text-sm font-semibold text-white">Reboot DAC Controller</h4>
                <p className="text-xs text-[#8b90a0] mt-0.5">Force a hard power cycle resetting the audio master clocks.</p>
              </div>
              <button 
                onClick={handleReboot}
                disabled={rebooting}
                className="px-5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/15 text-red-400 hover:text-red-300 transition-all border border-red-500/15 text-xs font-bold active:scale-95 shrink-0"
              >
                {rebooting ? 'Resetting...' : 'Reboot Link'}
              </button>
            </div>

          </div>

          {/* Quick diagnostics status cards */}
          <div className="bg-gradient-to-tr from-[#161616]/70 to-[#121212]/90 border border-white/[0.05] rounded-3xl p-6 flex gap-4 backdrop-blur-md">
            <ShieldCheck className="w-5 h-5 text-[#adc6ff] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-[#e5e2e1] uppercase tracking-wider mb-1">Hardware Health Lock</h4>
              <p className="text-xs text-[#c1c6d7] opacity-75 leading-relaxed">
                ASIO drivers detect bit-perfect signal matching. Temperature readings stand safe at 34.2 °C inside the secondary clock chassis.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Firmware Logs and Checks (Span 5) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Main Firmware state card */}
          <div className="bg-[#121212]/90 border border-white/[0.08] p-8 rounded-3xl backdrop-blur-xl premium-shadow flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#adc6ff]" />
                Firmware Engine
              </h3>
              <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-[9px] font-mono text-[#8b90a0]">
                ACTIVE v2.4.1
              </span>
            </div>

            <div className="bg-[#0a0a0a] border border-white/[0.04] rounded-2xl p-5 text-xs text-[#c1c6d7] leading-relaxed">
              Your device runs the latest verified firmware. Checking for beta pre-releases or developer previews requires an active premium account.
            </div>

            {/* Update Checker Button Trigger */}
            <button
              onClick={handleUpdateCheck}
              disabled={checking}
              className="w-full h-12 rounded-2xl bg-[#adc6ff] hover:bg-[#adc6ff]/90 text-[#002e69] text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 text-[#002e69] ${checking ? 'animate-spin' : ''}`} />
              {checkResult === 'checking' 
                ? 'Contacting AI Studio Servers...' 
                : checkResult === 'latest' 
                  ? 'All Set! Up To Date.' 
                  : 'Check For Updates'}
            </button>

            {/* History logs block */}
            <hr className="border-white/[0.04] my-2" />

            <div className="space-y-6">
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#8b90a0] block leading-none">
                VERIFIED RELEASE HISTORY
              </span>

              {firmwareHistory.map((log) => (
                <div key={log.version} className="relative pl-5 border-l border-white/[0.08] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white font-mono">{log.version}</span>
                    <span className="text-[10px] text-[#8b90a0] font-mono">{log.date}</span>
                  </div>
                  <p className="text-[11px] text-[#c1c6d7] opacity-80 leading-relaxed">{log.changes}</p>
                  
                  {/* Absolute positioning marker dot node */}
                  <div className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full border border-[#121212] ${
                    log.isCurrent ? 'bg-[#adc6ff] shadow-[0_0_8px_#adc6ff]' : 'bg-[#252525]'
                  }`} />
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>

      </div>
    </div>
  );
}
