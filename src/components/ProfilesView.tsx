import React, { useState, useMemo } from 'react';
import { 
  Play, 
  Check, 
  Search, 
  Sliders, 
  Volume2, 
  VolumeX,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Award,
  MoreVertical,
  Copy,
  Edit3,
  Trash2,
  Download,
  Upload,
  History
} from 'lucide-react';
import { SoundProfile, EqBand } from '../types';
import { audioEngine } from '../audio';
import { useUIStore } from '../store/uiStore';
import { useProfileStore } from '../store/profileStore';

interface ProfilesViewProps {
  eqMode: 'simple' | 'advanced';
  setEqMode: (mode: 'simple' | 'advanced') => void;
  volume: number;
  customEq: number[]; // 10 values
  setCustomEq: (val: number[]) => void;
  activeProfileId: string;
  setActiveProfileId: (id: string) => void;
}

export default function ProfilesView({
  eqMode,
  setEqMode,
  volume,
  customEq,
  setCustomEq,
  activeProfileId,
  setActiveProfileId
}: ProfilesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [testingId, setTestingId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const { openModal, setSelectedProfile } = useUIStore();
  const { profiles } = useProfileStore();

  // Click outside to close context menu
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.menu-container')) {
        setOpenMenuId(null);
      }
    };
    if (openMenuId !== null) {
      document.addEventListener('click', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [openMenuId]);

  // Simple Mode slider states
  const [simpleSliders, setSimpleSliders] = useState({
    Bass: 4,
    Vocal: 0,
    Detail: 2,
    Space: -3,
    Footstep: 6,
    Warmth: -2
  });

  const handleSimpleSliderChange = (name: string, value: number) => {
    setSimpleSliders(prev => {
      const updated = { ...prev, [name]: value };
      // Also map simple adjustments into global customEq values to simulate real DSP integration!
      const nextEq = [...customEq];
      if (name === 'Bass') {
        nextEq[0] = Math.round(value * 1.5); // Bass 32Hz
        nextEq[1] = Math.round(value * 1.2); // Bass 64Hz
        nextEq[2] = value;                   // Low-mids 125Hz
      } else if (name === 'Vocal') {
        nextEq[4] = value;                   // 500Hz
        nextEq[5] = Math.round(value * 1.2); // 1kHz
      } else if (name === 'Detail') {
        nextEq[7] = Math.round(value * 1.2); // 4kHz
        nextEq[8] = value;                   // 8kHz
      } else if (name === 'Warmth') {
        nextEq[1] = Math.round(value * 0.8);
        nextEq[2] = updated.Warmth;
        nextEq[3] = Math.round(updated.Warmth * 0.5);
      }
      setCustomEq(nextEq);
      return updated;
    });
  };

  // Detailed 10 Bands config values
  const bandsConfig = [
    { freq: 32, label: '32Hz' },
    { freq: 64, label: '64Hz' },
    { freq: 125, label: '125Hz' },
    { freq: 250, label: '250Hz' },
    { freq: 500, label: '500Hz' },
    { freq: 1000, label: '1kHz' },
    { freq: 2000, label: '2kHz' },
    { freq: 4000, label: '4kHz' },
    { freq: 8000, label: '8kHz' },
    { freq: 16000, label: '16kHz' },
  ];

  // Q factors (standard parametrics defaults)
  const [qFactors, setQFactors] = useState([1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4]);

  // Frequency values (Hz)
  const [freqValues, setFreqValues] = useState([32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]);

  const handleFreqChange = (idx: number, val: number) => {
    setFreqValues(prev => {
      const next = [...prev];
      next[idx] = Math.max(20, Math.min(20000, val));
      return next;
    });
  };

  const handleQChange = (idx: number, val: number) => {
    setQFactors(prev => {
      const next = [...prev];
      next[idx] = Math.max(0.1, Math.min(10, val));
      return next;
    });
  };

  // Dynamic search and tab filter matching
  const filteredProfiles = useMemo(() => {
    return profiles.filter(profile => {
      const matchesSearch = profile.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        profile.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === 'All' || profile.category === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [profiles, searchQuery, activeTab]);

  // Audio Testing sweep handler
  const handleTestProfile = (profile: SoundProfile) => {
    setTestingId(profile.id);
    audioEngine.playTest(profile.name, profile.eq);
    setTimeout(() => setTestingId(null), 2000);
  };

  const handleApplyProfile = (profile: SoundProfile) => {
    setActiveProfileId(profile.id);
    setCustomEq([...profile.eq]);
    setEqMode('simple');
    // Emit soft sound tick
    audioEngine.setVolume(volume);
    audioEngine.playTest(profile.name, profile.eq);
  };

  // Profile management modal handlers
  const handleOpenRename = (profile: SoundProfile) => {
    setSelectedProfile(profile);
    openModal('rename-profile');
    setOpenMenuId(null);
  };

  const handleOpenDuplicate = (profile: SoundProfile) => {
    setSelectedProfile(profile);
    openModal('duplicate-profile');
    setOpenMenuId(null);
  };

  const handleOpenDelete = (profile: SoundProfile) => {
    setSelectedProfile(profile);
    openModal('delete-profile');
    setOpenMenuId(null);
  };

  const handleOpenExport = (profile: SoundProfile) => {
    setSelectedProfile(profile);
    openModal('export-profile');
    setOpenMenuId(null);
  };

  const handleOpenHistory = (profile: SoundProfile) => {
    setSelectedProfile(profile);
    openModal('history-profile');
    setOpenMenuId(null);
  };

  const handleOpenImport = () => {
    openModal('import-profile');
    setOpenMenuId(null);
  };

  // Advanced Band gain changes (0.5 dB precision like real DAC/AMPs)
  const handleBandGainChange = (bandIdx: number, value: number) => {
    const nextEq = [...customEq];
    const rounded = Math.round(value * 2) / 2; // snap to 0.5 dB
    nextEq[bandIdx] = Math.max(-12, Math.min(12, rounded));
    setCustomEq(nextEq);
    
    // Persist changes to the active profile
    useProfileStore.getState().updateProfile(activeProfileId, { eq: nextEq });
  };

  const handleGainStep = (bandIdx: number, step: number) => {
    const val = customEq[bandIdx] || 0;
    handleBandGainChange(bandIdx, val + step);
  };

  // Multi-band responsive graph spline math generator
  // Canvas or SVG dimensions: 900x240
  const svgGraphPath = useMemo(() => {
    const width = 900;
    const height = 240;
    const padding = 45;
    const pointsCount = customEq.length;
    const stepX = (width - padding * 2) / (pointsCount - 1);

    const points = customEq.map((db, idx) => {
      const x = padding + idx * stepX;
      // Map db value (-12 to 12 dB) to y value within heights [40 to 200]
      // 0 dB lies at exact height / 2 = 120
      const range = 12;
      const normalized = (db + range) / (range * 2); // 0 to 1
      const y = height - (normalized * (height - 80) + 40); // Flip y coordinates
      return { x, y };
    });

    // Create a smooth cubic splined SVG Path
    if (points.length === 0) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + stepX / 2.5;
      const cpY1 = p0.y;
      const cpX2 = p1.x - stepX / 2.5;
      const cpY2 = p1.y;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    return d;
  }, [customEq]);

  return (
    <div className="flex-1 animate-fade-in text-[#e5e2e1]">
      
      {eqMode === 'simple' && (
        <>
          {/* Header Bar */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 max-w-7xl">
        <div>
          <h2 className="font-sans font-bold text-4xl text-[#e5e2e1] leading-tight mb-2">Sound Profiles</h2>
          <p className="font-sans text-[#c1c6d7] text-sm md:text-base opacity-75">
            Select or customize a tuning profile to match your current audio experience.
          </p>
        </div>
        
        {/* Search and Import Controls */}
        <div className="flex gap-3 w-full md:w-auto">
          {/* Rich Search Input */}
          <div className="relative flex-1 md:flex-none md:w-80">
            <Search className="w-4 h-4 text-[#8b90a0] absolute left-4.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search profiles..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 bg-[#1c1b1b] border border-white/[0.08] hover:border-white/[0.12] focus:border-[#adc6ff] rounded-full pl-12 pr-6 text-sm outline-none transition-colors"
            />
          </div>
          
          {/* Import Button */}
          <button
            onClick={handleOpenImport}
            className="h-12 px-6 rounded-full bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-[#adc6ff]/30 text-[#e5e2e1] text-sm font-bold transition-all flex items-center gap-2 shrink-0"
          >
            <Upload className="w-4 h-4 text-[#adc6ff]" />
            <span className="hidden sm:inline">Import</span>
          </button>
        </div>
      </section>

      {/* Categories chips filtering */}
      <section className="mb-10 max-w-7xl">
        <div className="flex flex-wrap gap-2.5 items-center">
          {['All', 'Musical', 'Analytical', 'Fun', 'Gaming'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all ${
                activeTab === tab 
                  ? 'bg-[#adc6ff] text-[#002e69] shadow-md shadow-[#adc6ff]/10' 
                  : 'bg-[#1c1b1b] border border-white/[0.08] text-[#c1c6d7] hover:text-[#e5e2e1] hover:bg-white/[0.04]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      {/* Row of Profile Choice Cards */}
      <section className="flex gap-6 max-w-7xl mb-14 overflow-x-auto snap-x snap-mandatory pb-6 custom-scrollbar">
        {filteredProfiles.map((p) => {
          const isApplied = activeProfileId === p.id;
          return (
            <div 
              key={p.id} 
              className="w-[85vw] md:w-[340px] shrink-0 snap-start bg-[#1c1b1b]/60 border border-white/[0.08] rounded-3xl overflow-hidden flex flex-col premium-shadow group hover:border-[#adc6ff]/30 transition-all duration-300"
            >
              {/* Graphic container */}
              <div className="h-44 bg-[#201f1f] relative overflow-hidden">
                <img 
                  alt={p.name} 
                  referrerPolicy="no-referrer"
                  src={p.imageUrl} 
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-85 group-hover:scale-105 transition-all duration-500" 
                />
                
                {/* Visual linear gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/40 to-transparent" />
                
                {/* Top-right context menu button */}
                <div className="absolute top-4 right-4 z-20">
                  <div className="relative menu-container">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === p.id ? null : p.id)}
                      className="p-2 rounded-lg bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/[0.1] text-[#adc6ff] transition-all hover:text-white"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {/* Dropdown menu */}
                    {openMenuId === p.id && (
                      <div className="absolute top-full right-0 mt-2 w-48 bg-[#121212] border border-white/[0.08] rounded-lg shadow-lg backdrop-blur-md z-30 overflow-hidden">
                        <button
                          onClick={() => handleOpenRename(p)}
                          className="w-full px-4 py-2.5 text-sm text-[#e5e2e1] hover:bg-white/[0.08] flex items-center gap-3 transition-colors border-b border-white/[0.04] last:border-b-0"
                        >
                          <Edit3 className="w-4 h-4 text-[#adc6ff]" />
                          Rename
                        </button>
                        <button
                          onClick={() => handleOpenDuplicate(p)}
                          className="w-full px-4 py-2.5 text-sm text-[#e5e2e1] hover:bg-white/[0.08] flex items-center gap-3 transition-colors border-b border-white/[0.04] last:border-b-0"
                        >
                          <Copy className="w-4 h-4 text-[#adc6ff]" />
                          Duplicate
                        </button>
                        <button
                          onClick={() => handleOpenExport(p)}
                          className="w-full px-4 py-2.5 text-sm text-[#e5e2e1] hover:bg-white/[0.08] flex items-center gap-3 transition-colors border-b border-white/[0.04] last:border-b-0"
                        >
                          <Download className="w-4 h-4 text-[#adc6ff]" />
                          Export
                        </button>
                        <button
                          onClick={() => handleOpenHistory(p)}
                          className="w-full px-4 py-2.5 text-sm text-[#e5e2e1] hover:bg-white/[0.08] flex items-center gap-3 transition-colors border-b border-white/[0.04] last:border-b-0"
                        >
                          <History className="w-4 h-4 text-[#adc6ff]" />
                          History
                        </button>
                        {!p.isDefault && (
                          <button
                            onClick={() => handleOpenDelete(p)}
                            className="w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-3 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {p.isDefault && (
                  <div className="absolute bottom-5 left-5">
                    <span className="px-3 py-1 rounded bg-[#adc6ff]/10 border border-[#adc6ff]/35 text-[10px] font-bold text-[#adc6ff] uppercase tracking-wider backdrop-blur-md">
                      DEFAULT REFERENCE
                    </span>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-6 flex-1 flex flex-col gap-4">
                <div>
                  <h3 className="font-sans font-bold text-xl text-[#e5e2e1]">{p.name}</h3>
                  <p className="text-xs text-[#c1c6d7] opacity-75 mt-2 leading-relaxed line-clamp-2">
                    {p.description}
                  </p>
                </div>

                {/* Card Test-Drive Actions */}
                <div className="mt-auto flex gap-3 pt-4 border-t border-white/[0.04]">
                  <button 
                    onClick={() => handleTestProfile(p)}
                    className="flex-1 h-11 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.12] text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5 text-[#e9b3ff] fill-[#e9b3ff]/30" />
                    {testingId === p.id ? 'Sweeping...' : 'Quick Test'}
                  </button>
                  
                  {isApplied ? (
                    <button 
                      className="flex-1 h-11 rounded-xl bg-[#adc6ff]/10 text-[#adc6ff] border border-[#adc6ff]/20 text-xs font-bold flex items-center justify-center gap-2 cursor-default"
                    >
                      <Check className="w-4 h-4" />
                      Applied
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleApplyProfile(p)}
                      className="flex-1 h-11 rounded-xl bg-[#adc6ff] hover:bg-[#adc6ff]/90 text-[#002e69] text-xs font-bold transition-all"
                    >
                      Apply
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </section>

        </>
      )}

      {/* CUSTOMIZATION ZONE SECTION */}
      <section className={`flex flex-col gap-8 max-w-7xl ${eqMode === 'simple' ? 'pt-12 border-t border-white/[0.08]' : ''}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 className="font-sans font-bold text-3xl text-white mb-2">Custom EQ Profile</h2>
            <p className="font-sans text-sm text-[#c1c6d7] opacity-80">
              Fine-tune your audio experience using simple macros or custom advanced parametric EQ sliders.
            </p>
          </div>
          
          {/* Switch UI Button */}
          <div className="flex items-center p-1 rounded-2xl bg-[#1c1b1b] border border-white/[0.08]">
            <button 
              onClick={() => setEqMode('simple')}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                eqMode === 'simple' 
                  ? 'bg-gradient-to-r from-white/[0.08] to-white/[0.04] text-white shadow-sm' 
                  : 'text-[#c1c6d7] hover:text-[#e5e2e1]'
              }`}
            >
              Simple Mode
            </button>
            <button 
              onClick={() => setEqMode('advanced')}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                eqMode === 'advanced' 
                  ? 'bg-gradient-to-r from-white/[0.08] to-white/[0.04] text-white shadow-sm' 
                  : 'text-[#c1c6d7] hover:text-[#e5e2e1]'
              }`}
            >
              Advanced Mode
            </button>
          </div>
        </div>

        {/* ================= SIMPLE METHOD VIEW ================= */}
        {eqMode === 'simple' ? (
          <div className="flex flex-col gap-8">
            
            {/* WebGL Audio Wave Shader */}
            <div className="h-56 md:h-64 rounded-3xl bg-black border border-white/[0.08] relative overflow-hidden premium-shadow">
              <canvas
                ref={(canvas) => {
                  if (!canvas) return;
                  const existing = (canvas as any).__shaderInit;
                  if (existing) return;
                  (canvas as any).__shaderInit = true;

                  function syncSize() {
                    const w = canvas.clientWidth || 1280;
                    const h = canvas.clientHeight || 720;
                    if (canvas.width !== w || canvas.height !== h) {
                      canvas.width = w;
                      canvas.height = h;
                    }
                  }
                  syncSize();
                  new ResizeObserver(syncSize).observe(canvas);

                  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                  if (!gl) return;

                  const vs = `attribute vec2 a_position;
                  varying vec2 v_texCoord;
                  void main() {
                    v_texCoord = a_position * 0.5 + 0.5;
                    gl_Position = vec4(a_position, 0.0, 1.0);
                  }`;

                  const fs = `precision highp float;
                  varying vec2 v_texCoord;
                  uniform float u_time;
                  uniform vec2 u_resolution;
                  uniform vec2 u_mouse;

                  void main() {
                    vec2 uv = v_texCoord;
                    vec3 color = vec3(0.04, 0.04, 0.06);
                    float wave1 = sin(uv.x * 10.0 + u_time * 2.0) * 0.1 + 0.5;
                    float wave2 = sin(uv.x * 15.0 - u_time * 1.5) * 0.05 + 0.5;
                    float wave3 = sin(uv.x * 8.0 + u_time * 1.0) * 0.15 + 0.5;
                    float dist1 = 1.0 - smoothstep(0.0, 0.02, abs(uv.y - wave1));
                    float dist2 = 1.0 - smoothstep(0.0, 0.015, abs(uv.y - wave2));
                    float dist3 = 1.0 - smoothstep(0.0, 0.03, abs(uv.y - wave3));
                    vec3 blue = vec3(0.0, 0.48, 1.0);
                    vec3 purple = vec3(0.75, 0.35, 0.95);
                    color = mix(color, blue, dist1 * 0.6);
                    color = mix(color, purple, dist2 * 0.4);
                    color = mix(color, blue * 0.8 + purple * 0.2, dist3 * 0.3);
                    float vignette = 1.0 - length(uv - 0.5) * 1.2;
                    color *= max(vignette, 0.1);
                    gl_FragColor = vec4(color, 1.0);
                  }`;

                  function cs(type: number, src: string) {
                    const s = gl!.createShader(type)!;
                    gl!.shaderSource(s, src);
                    gl!.compileShader(s);
                    return s;
                  }
                  const prog = gl.createProgram()!;
                  gl.attachShader(prog, cs(gl.VERTEX_SHADER, vs));
                  gl.attachShader(prog, cs(gl.FRAGMENT_SHADER, fs));
                  gl.linkProgram(prog);
                  gl.useProgram(prog);

                  const buf = gl.createBuffer()!;
                  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
                  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
                  const pos = gl.getAttribLocation(prog, 'a_position');
                  gl.enableVertexAttribArray(pos);
                  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

                  const uTime = gl.getUniformLocation(prog, 'u_time');
                  const uRes = gl.getUniformLocation(prog, 'u_resolution');
                  const uMouse = gl.getUniformLocation(prog, 'u_mouse');

                  let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
                  window.addEventListener('mousemove', (event: MouseEvent) => {
                    const rect = canvas.getBoundingClientRect();
                    if (rect.width && rect.height) {
                      const nx = (event.clientX - rect.left) / rect.width;
                      const ny = 1.0 - (event.clientY - rect.top) / rect.height;
                      mouse.x = nx * canvas.width;
                      mouse.y = ny * canvas.height;
                    }
                  });

                  function render(t: number) {
                    syncSize();
                    gl!.viewport(0, 0, canvas.width, canvas.height);
                    if (uTime) gl!.uniform1f(uTime, t * 0.001);
                    if (uRes) gl!.uniform2f(uRes, canvas.width, canvas.height);
                    if (uMouse) gl!.uniform2f(uMouse, mouse.x, mouse.y);
                    gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
                    requestAnimationFrame(render);
                  }
                  requestAnimationFrame(render);
                }}
                style={{ display: 'block', width: '100%', height: '100%', borderRadius: '1.5rem' }}
              />
            </div>

            {/* General macro sliders (6 Sliders) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {Object.entries(simpleSliders).map(([name, val]) => {
                const value = val as number;
                return (
                  <div key={name} className="bg-[#121212]/90 border border-white/[0.06] p-6 rounded-2xl flex flex-col items-center gap-5 premium-shadow hover:border-white/[0.12] transition-colors">
                    <span className="text-xs font-bold text-[#c1c6d7] opacity-80 uppercase tracking-widest">{name}</span>
                    
                    {/* Slider rail */}
                    <div className="relative h-44 w-1.5 bg-[#0a0a0a] rounded-full">
                      {/* Active filling section */}
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-[#adc6ff] rounded-full shadow-[0_0_12px_rgba(173,198,255,0.4)]"
                        style={{ height: `${((value + 12) / 24) * 100}%`, background: 'linear-gradient(to top, #4b8eff, #adc6ff)' }}
                      />
                      
                      {/* Drag thumb node */}
                      <input 
                        type="range"
                        min="-12"
                        max="12"
                        value={value}
                        onChange={(e) => handleSimpleSliderChange(name, parseInt(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer orientation-vertical"
                        style={{ WebkitAppearance: 'slider-vertical' } as any}
                      />
                      
                      {/* Knob look-alike block representing physical sliders */}
                      <div 
                        className="absolute left-1/2 -translate-x-1/2 w-6 h-6 bg-[#adc6ff] rounded-full shadow-lg border-2 border-[#121212] pointer-events-none transition-all scale-100 hover:scale-110"
                        style={{ bottom: `calc(${((value + 12) / 24) * 100}% - 12px)` }}
                      />
                    </div>

                    <span className="text-xs font-mono font-bold text-[#adc6ff]">
                      {value > 0 ? `+${value}` : value} dB
                    </span>
                  </div>
                );
              })}
            </div>

          </div>
        ) : (
          
          // ================= ADVANCED PARAMETRIC VIEW =================
          <div className="flex flex-col gap-8">
            
            {/* Visual smooth graph spline */}
            <div className="h-64 rounded-3xl bg-[#121212] border border-white/[0.08] relative overflow-hidden mb-4 premium-shadow">
              <div className="absolute inset-0 bg-[#252525]/[0.15]" />
              
              {/* Splined line graph */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 900 240">
                {/* Horizontal reference zero line */}
                <line x1="0" y1="120" x2="900" y2="120" stroke="rgba(255,255,255,0.06)" strokeDasharray="5, 5" strokeWidth="1" />
                
                {/* Dynamic smooth curve */}
                <path 
                  d={svgGraphPath} 
                  fill="none" 
                  stroke="url(#graphGradient)" 
                  strokeWidth="3.5" 
                  className="transition-all duration-100"
                />

                {/* Dynamic points on curves representing active bands */}
                {customEq.map((db, idx) => {
                  const width = 900;
                  const padding = 45;
                  const stepX = (width - padding * 2) / (customEq.length - 1);
                  const x = padding + idx * stepX;
                  const normalized = (db + 12) / 24;
                  const y = 240 - (normalized * (240 - 80) + 40);
                  return (
                    <g key={idx} className="transition-all duration-100">
                      <circle 
                        cx={x} 
                        cy={y} 
                        r="5" 
                        fill="#adc6ff" 
                        stroke="#131313" 
                        strokeWidth="2.5" 
                        className="shadow-lg select-none pointer-events-none"
                      />
                      {db !== 0 && (
                        <text 
                          x={x} 
                          y={y - 12} 
                          fill="#adc6ff" 
                          fontSize="9" 
                          fontWeight="bold" 
                          fontFamily="monospace"
                          textAnchor="middle"
                        >
                          {db > 0 ? `+${db}` : db}
                        </text>
                      )}
                    </g>
                  );
                })}

                <defs>
                  <linearGradient id="graphGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4b8eff" />
                    <stop offset="50%" stopColor="#adc6ff" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#e9b3ff" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Freq labels below graph */}
              <div className="absolute bottom-3 left-10 right-10 flex justify-between text-[10px] font-bold text-[#8b90a0] font-mono tracking-wider opacity-60">
                {freqValues.map((f, i) => (
                  <span key={i}>{f >= 1000 ? `${f/1000}kHz` : `${f}Hz`}</span>
                ))}
              </div>
            </div>

            {/* 10 Vertical Sliders module */}
            <div className="bg-[#121212]/90 border border-white/[0.08] p-8 rounded-3xl overflow-x-auto premium-shadow no-scrollbar">
              <div className="flex flex-col gap-6 min-w-[850px]">
                
                {/* 10 Band controls */}
                <div className="grid grid-cols-10 gap-4">
                  {bandsConfig.map((band, idx) => {
                    const db = customEq[idx] || 0;
                    return (
                      <div key={band.label} className="flex flex-col items-center gap-4">
                        
                        {/* Band index tag */}
                        <div className="w-8 h-8 rounded-full bg-[#1c1b1b] border border-white/[0.06] text-xs font-bold text-[#adc6ff] flex items-center justify-center font-mono">
                          {idx + 1}
                        </div>

                        {/* Slide track */}
                        <div className="relative h-56 w-1.5 bg-[#0a0a0a] rounded-full my-2">
                          <div 
                            className="absolute bottom-0 left-0 right-0 bg-[#adc6ff] rounded-full shadow-[0_0_12px_rgba(173,198,255,0.4)]"
                            style={{ height: `${((db + 12) / 24) * 100}%`, background: 'linear-gradient(to top, #4b8eff, #adc6ff)' }}
                          />
                          <input 
                            type="range"
                            min="-12"
                            max="12"
                            step="0.5"
                            value={db}
                            onChange={(e) => handleBandGainChange(idx, parseFloat(e.target.value))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer orientation-vertical"
                            style={{ WebkitAppearance: 'slider-vertical' } as any}
                          />
                          <div 
                            className="absolute left-1/2 -translate-x-1/2 w-5 h-5 bg-white rounded-full shadow-lg border-2 border-[#adc6ff] pointer-events-none transition-all scale-100"
                            style={{ bottom: `calc(${((db + 12) / 24) * 100}% - 10px)` }}
                          />
                        </div>

                        {/* Attenuation db values */}
                        <span className="text-xs font-mono font-bold text-[#adc6ff]">
                          {db > 0 ? `+${db.toFixed(1)}` : db.toFixed(1)} dB
                        </span>

                        <span className="text-[10px] font-semibold text-[#8b90a0] font-mono whitespace-nowrap">
                          {band.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Row labels */}
                <div className="grid grid-cols-[auto_repeat(10,1fr)] gap-4 pt-6 border-t border-white/[0.04]">
                  {/* Label column */}
                  <div className="flex flex-col gap-2 justify-start pt-0.5">
                    <div className="h-[38px] flex items-center">
                      <span className="text-[9px] font-bold text-[#8b90a0] uppercase tracking-wider whitespace-nowrap">Gain<br/><span className="text-[#adc6ff]/60">dB</span></span>
                    </div>
                    <div className="h-[30px] flex items-center">
                      <span className="text-[9px] font-bold text-[#8b90a0] uppercase tracking-wider whitespace-nowrap">Freq<br/><span className="text-[#adc6ff]/60">Hz</span></span>
                    </div>
                    <div className="h-[30px] flex items-center">
                      <span className="text-[9px] font-bold text-[#8b90a0] uppercase tracking-wider whitespace-nowrap">Q<br/><span className="text-[#e9b3ff]/60">factor</span></span>
                    </div>
                  </div>

                  {bandsConfig.map((band, idx) => {
                    const db = customEq[idx] || 0;

                    return (
                      <div key={`input-${idx}`} className="flex flex-col gap-2">
                        {/* Gain control — 0.5 dB steps like real DAC/AMPs */}
                        <div className="relative bg-[#0a0a0a] rounded-xl border border-white/[0.06] overflow-hidden">
                          <input 
                            type="text" 
                            readOnly
                            value={`${db > 0 ? '+' : ''}${db.toFixed(1)}`}
                            className="w-full text-center py-2 text-[10px] bg-transparent text-[#e5e2e1] font-mono outline-none border-none pr-6" 
                          />
                          <div className="absolute right-1 top-0 bottom-0 flex flex-col justify-center gap-0.5">
                            <button 
                              onClick={() => handleGainStep(idx, 0.5)}
                              className="p-0.5 hover:text-[#adc6ff] text-[#8b90a0] transition-colors"
                              title="+0.5 dB"
                            >
                              <ChevronUp className="w-2.5 h-2.5" />
                            </button>
                            <button 
                              onClick={() => handleGainStep(idx, -0.5)}
                              className="p-0.5 hover:text-[#adc6ff] text-[#8b90a0] transition-colors"
                              title="-0.5 dB"
                            >
                              <ChevronDown className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>

                        {/* Frequency input — editable, ×2/÷2 octave stepping */}
                        <div className="relative bg-[#1c1b1b] border border-white/[0.06] py-1 rounded-lg overflow-hidden">
                          <input 
                            type="number"
                            value={freqValues[idx]}
                            onChange={(e) => handleFreqChange(idx, parseInt(e.target.value) || 20)}
                            className="w-full text-center py-1 text-[9px] bg-transparent text-[#adc6ff] font-mono outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <div className="absolute right-0.5 top-0 bottom-0 flex flex-col justify-center gap-0.5">
                            <button 
                              onClick={() => handleFreqChange(idx, freqValues[idx] * 2)}
                              className="p-0.5 hover:text-white text-[#8b90a0] transition-colors"
                              title="×2 (octave up)"
                            >
                              <ChevronUp className="w-2 h-2" />
                            </button>
                            <button 
                              onClick={() => handleFreqChange(idx, Math.round(freqValues[idx] / 2))}
                              className="p-0.5 hover:text-white text-[#8b90a0] transition-colors"
                              title="÷2 (octave down)"
                            >
                              <ChevronDown className="w-2 h-2" />
                            </button>
                          </div>
                        </div>

                        {/* Q-Factor input — 0.1 steps */}
                        <div className="relative bg-[#1c1b1b] border border-white/[0.06] py-1 rounded-lg overflow-hidden">
                          <input 
                            type="number"
                            step="0.1"
                            value={qFactors[idx]}
                            onChange={(e) => handleQChange(idx, parseFloat(e.target.value) || 0.1)}
                            className="w-full text-center py-1 text-[9px] bg-transparent text-[#e9b3ff] font-mono outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <div className="absolute right-0.5 top-0 bottom-0 flex flex-col justify-center gap-0.5">
                            <button 
                              onClick={() => handleQChange(idx, Math.round((qFactors[idx] + 0.1) * 10) / 10)}
                              className="p-0.5 hover:text-white text-[#8b90a0] transition-colors"
                              title="+0.1"
                            >
                              <ChevronUp className="w-2 h-2" />
                            </button>
                            <button 
                              onClick={() => handleQChange(idx, Math.round((qFactors[idx] - 0.1) * 10) / 10)}
                              className="p-0.5 hover:text-white text-[#8b90a0] transition-colors"
                              title="-0.1"
                            >
                              <ChevronDown className="w-2 h-2" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>

          </div>
        )}
      </section>
    </div>
  );
}
