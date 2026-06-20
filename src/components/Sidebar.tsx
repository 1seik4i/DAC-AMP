import React from 'react';
import { 
  LayoutGrid, 
  SlidersHorizontal, 
  Sparkles, 
  Activity, 
  Tv, 
  Users2, 
  Settings, 
  Cpu, 
  Radio,
  User,
  Power,
  Plus,
  Unplug
} from 'lucide-react';
import { View } from '../types';
import { useDeviceStore } from '../store/deviceStore';
import { socket } from '../socket';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  setEqMode: (mode: 'simple' | 'advanced') => void;
  currentUser: { fullName: string; isLoggedIn: boolean } | null;
  onLogout: () => void;
  onOpenAuth: () => void;
}

export default function Sidebar({ 
  currentView, 
  setCurrentView, 
  setEqMode,
  currentUser,
  onLogout,
  onOpenAuth
}: SidebarProps) {
  const isDeviceConnected = useDeviceStore(state => state.connectionStatus === 'connected');
  
  const toggleConnection = () => {
    if (isDeviceConnected) {
      socket.emit('cmd:disconnectDevice');
    } else {
      socket.emit('cmd:connectDevice');
    }
  };

  const handleNavClick = (view: View, eqMode?: 'simple' | 'advanced') => {
    setCurrentView(view);
    if (eqMode) {
      setEqMode(eqMode);
    }
  };

  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutGrid,
      action: () => handleNavClick('dashboard'),
      isViewCurrent: (cv: View) => cv === 'dashboard'
    },
    { 
      id: 'profiles', 
      label: 'Profiles', 
      icon: SlidersHorizontal,
      action: () => handleNavClick('profiles', 'simple'),
      isViewCurrent: (cv: View) => cv === 'profiles' || cv === 'simple' || cv === 'advanced'
    },

    { 
      id: 'animation', 
      label: 'Display Animation', 
      icon: Tv,
      action: () => handleNavClick('animation'),
      isViewCurrent: (cv: View) => cv === 'animation'
    },
    { 
      id: 'community', 
      label: 'Community', 
      icon: Users2,
      action: () => handleNavClick('community'),
      isViewCurrent: (cv: View) => cv === 'community'
    }
  ];

  return (
    <aside 
      id="side-nav" 
      className="hidden md:flex h-screen w-64 fixed left-0 top-0 bg-[#0E0E0E] text-[#e5e2e1] flex-col border-r border-[#414755]/30 z-50 select-none"
    >
      {/* Brand Header */}
      <div className="pt-8 pb-6 px-6 border-b border-white/[0.04]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#cdc6ff] to-[#4b8eff] flex items-center justify-center text-[#0E0E0E] font-bold shadow-lg shadow-[#4b8eff]/10">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-sans font-bold text-xl tracking-tight leading-none text-[#adc6ff]">DAC Studio</h1>
            <p className="font-sans text-[11px] text-[#c1c6d7] opacity-60 mt-1 uppercase tracking-wider font-semibold">Hi-Fi Control</p>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <ul className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = item.isViewCurrent(currentView);

          return (
            <li key={item.label}>
              <button
                onClick={item.action}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-sans text-sm font-medium transition-all duration-200 group active:scale-[0.98] ${
                  isActive 
                    ? 'text-[#adc6ff] bg-[#adc6ff]/10 font-bold border-r-2 border-[#adc6ff] shadow-sm shadow-[#adc6ff]/5' 
                    : 'text-[#c1c6d7] hover:text-[#e5e2e1] hover:bg-white/[0.04]'
                }`}
              >
                <item.icon className={`w-4.5 h-4.5 transition-colors duration-200 ${
                  isActive ? 'text-[#adc6ff]' : 'text-[#8b90a0] group-hover:text-[#c1c6d7]'
                }`} />
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>

      {/* User Section / Access Button */}
      <div className="px-4 py-3 border-t border-white/[0.04] bg-white/[0.01]">
        {currentUser?.isLoggedIn ? (
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <div 
              className="flex items-center gap-3 truncate min-w-0 flex-1 cursor-pointer hover:bg-white/[0.04] p-1 -m-1 rounded-lg transition-colors"
              onClick={() => handleNavClick('user-profile')}
            >
              <div className="w-8 h-8 rounded-full bg-[#primary] bg-gradient-to-tr from-[#adc6ff] to-[#e9b3ff] flex items-center justify-center text-[#131313] font-bold text-xs shrink-0 uppercase">
                {currentUser.fullName.charAt(0)}
              </div>
              <div className="truncate shrink min-w-0">
                <p className="text-xs font-semibold text-[#e5e2e1] truncate leading-tight">{currentUser.fullName}</p>
              </div>
            </div>
            <button 
              onClick={onLogout} 
              className="p-1 px-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors text-[10px] uppercase tracking-wider font-bold shrink-0"
              title="Logout"
            >
              <Power className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-white/[0.06] to-white/[0.03] hover:from-white/[0.1] hover:to-white/[0.05] border border-white/[0.08] text-xs font-medium text-[#e5e2e1] flex items-center justify-center gap-2.5 transition-all"
          >
            <User className="w-3.5 h-3.5 text-[#adc6ff]" />
            Request Pro Access
          </button>
        )}
      </div>

      {/* Footer Nav Links */}
      <div className="px-4 space-y-1.5 pb-3">
        <button
          onClick={() => setCurrentView('settings')}
          className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-sans text-xs transition-colors ${
            currentView === 'settings' 
              ? 'text-[#adc6ff] bg-[#adc6ff]/5 font-bold' 
              : 'text-[#8b90a0] hover:text-[#e5e2e1]'
          }`}
        >
          <Settings className="w-4 h-4 text-[#8b90a0]" />
          Device Settings
        </button>

      </div>

      {/* Active Device Dashboard Status Indicator */}
      <div className={`p-4 mx-4 mb-6 bg-[#161616]/90 border border-white/[0.04] rounded-xl transition-all duration-300 ${isDeviceConnected ? 'active-glow' : 'opacity-70'}`}>
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2 shadow-glow shrink-0">
              {isDeviceConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isDeviceConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
            </span>
            <span className="font-sans text-[11px] font-bold text-[#e5e2e1] uppercase tracking-wider">
              {isDeviceConnected ? 'Sonic Pro X1' : 'No Device'}
            </span>
          </div>
          
          <button 
            onClick={toggleConnection}
            className={`p-1.5 rounded-lg transition-colors ${isDeviceConnected ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'}`}
            title={isDeviceConnected ? 'Disconnect Device' : 'Connect Device'}
          >
            {isDeviceConnected ? <Unplug className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        </div>
        
        <div className="flex items-center justify-between text-[#8b90a0] text-[10px] font-mono">
          <span>{isDeviceConnected ? 'Connected' : 'Disconnected'}</span>
          {isDeviceConnected && (
            <span className="px-1.5 py-0.5 rounded bg-white/[0.06] text-amber-500/90 font-semibold tracking-wider font-sans text-[9px]">384kHz</span>
          )}
        </div>
      </div>
    </aside>
  );
}
