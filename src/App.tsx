import React, { useState, useEffect } from 'react';
import { User, LayoutGrid, SlidersHorizontal, Users2, Settings } from 'lucide-react';
import { View, UserState } from './types';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import ProfilesView from './components/ProfilesView';
import DisplayAnimationView from './components/DisplayAnimationView';
import CommunityView from './components/CommunityView';
import SettingsView from './components/SettingsView';
import AuthView from './components/AuthView';
import UserProfileView from './components/UserProfileView';
import { audioEngine } from './audio';
import { socket } from './socket';
import { useProfileStore, initializeProfiles } from './store/profileStore';
import { useDeviceStore, initializeDevice } from './store/deviceStore';
import { useLocalStorageState } from './hooks/useLocalStorageState';
import { useUIStore, initializeUI } from './store/uiStore';
import {
  RenameProfileModal,
  DuplicateProfileModal,
  DeleteProfileModal,
  ExportProfileModal,
  ImportProfileModal,
  HistoryProfileModal
} from './components/ProfileModals';

/**
 * Main App Component
 * Handles global routing, state persistence, and initialization of stores.
 */
export default function App() {
  // Global persisted states
  const [currentView, setCurrentView] = useLocalStorageState<View>('dac_currentView', 'dashboard');
  const [volume, setVolume] = useLocalStorageState<number>('dac_volume', 80);
  const [customEq, setCustomEq] = useLocalStorageState<number[]>('dac_customEq', [4, 3, 1, -1, -2, 0, 2, 3, 1, -1]);

  const activeProfileId = useProfileStore(state => state.activeProfileId);
  const setActiveProfileId = useProfileStore(state => state.setActiveProfile);

  const [gainStage, setGainStage] = useLocalStorageState<'Low' | 'High'>('dac_gainStage', 'Low');
  const [routing, setRouting] = useLocalStorageState<'Balanced' | 'Single-Ended'>('dac_routing', 'Balanced');
  const [currentUser, setCurrentUser] = useLocalStorageState<UserState | null>('dac_currentUser', {
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    isLoggedIn: true
  });
  const [showAuth, setShowAuth] = useState<boolean>(false);

  useEffect(() => {
    const handleStateUpdate = (updates: any) => {
      if (updates.volume !== undefined) setVolume(updates.volume);
      if (updates.gainStage !== undefined) setGainStage(updates.gainStage);
      if (updates.customEq !== undefined) setCustomEq(updates.customEq);
    };
    socket.on('state:update', handleStateUpdate);
    socket.on('state:init', handleStateUpdate);
    return () => {
      socket.off('state:update', handleStateUpdate);
      socket.off('state:init', handleStateUpdate);
    };
  }, [setVolume, setGainStage, setCustomEq]);

  const handleSetVolume = (v: number) => {
    setVolume(v);
    socket.emit('cmd:setVolume', { volume: v });
  };

  const handleSetGainStage = (g: 'Low' | 'High') => {
    setGainStage(g);
    socket.emit('cmd:setGainStage', { gainStage: g });
  };

  const handleSetCustomEq = (eq: number[]) => {
    setCustomEq(eq);
    socket.emit('cmd:setEq', { eq });
  };

  // Load profile EQ when activeProfileId changes
  useEffect(() => {
    const currentProfiles = useProfileStore.getState().profiles;
    const activeProfile = currentProfiles.find(p => p.id === activeProfileId);
    if (activeProfile) {
      setCustomEq([...activeProfile.eq]);
    }
  }, [activeProfileId]);

  // Initialize stores on mount
  useEffect(() => {
    initializeUI();
    initializeDevice();
    // Default profiles
    const defaultProfiles = [
      {
        id: 'balanced',
        name: 'Balanced',
        description: 'A neutral, reference-grade tuning designed to present audio exactly as the creator intended. Flat frequency response across the spectrum.',
        category: 'Musical',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxzZmVjCyEcvOsGpmUHqdAvEAxCCzX73ZldZ0Cd19qu-JnF0Y3PlzoPlnwfBl7RsOk4qpR3gHrLE8JlkyovuUy8cKLuVY6PdGAfDjKSqFFsZTmUxz7QVLyv4VW_nmLvFZbIM-6cLjLs3PGXweBjeWdtjwSxxBeXFttRFZnrZBBClCSdvTxbFCGoRiQ0FN7zVIFTR7P-d2rwqXet_UUbzzrTGkvrNkle0IS0eSwVR3kavqaBHT6EdNS',
        isDefault: true,
        eq: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      },
      {
        id: 'bass-boost',
        name: 'Bass Boost',
        description: 'Elevates the sub-bass and mid-bass frequencies for a punchy, energetic low-end response. Ideal for electronic and hip-hop genres.',
        category: 'Fun',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHYXcO0HuyDtbXYeOD3AnbU8d1L9DBA_mLJAKVCTwuMoTDc8dOtsLWdpcNUM5kfgJNa7JPh4AiQAGdOTYPkh-20NhcJSnncF4SogaF3Rk8g3noMoQKphaUzoKbcR6LHzbo2nCnkD4XJKyP98evDx2Z3N9iJwUpUlFbsnfwHF2nDliaHvoirGtqR0yWtJCISwK9pzADghDgF_URuosUMu9AidwQb-VEPxi4yzmNADzYqpUzuQLcx5Nk',
        eq: [6, 5, 3, 1, 0, -1, 0, 1, 0, 0]
      },
      {
        id: 'vocal-clear',
        name: 'Vocal Clear',
        description: 'Enhances mid-range frequencies and upper-mid clarity to bring vocals forward in the mix. Perfect for podcasts and acoustic tracks.',
        category: 'Analytical',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAo1FEzqnbqmdvkwGbcgNRf_iKBjudGPYpsCDOVPWy6sqVssEEprwR5xRj5lBk6Wz0KupgsEuOhrwOxgR68tp_AzjxZSHR3jOTwjx1KK67HaSShp7SnHYUG0VWk8FIcMxJd7k9ctw4FVtt5QqhwT4pzAim2pUZlq25ab0EVgXL3oc25FA2ND-DtzJGncVVctaqehabguuSCJH8LxagjUULgCtcFBz0ekwVG2cddPd1RcEfO6rnuGdp8',
        eq: [-3, -2, -1, 1, 4, 5, 4, 2, 1, 0]
      },
      {
        id: 'gaming-fps',
        name: 'Gaming FPS',
        description: 'Maximizes spatial imaging and highlights high-frequency details like footsteps and reloads while subduing muddy low-end explosions.',
        category: 'Gaming',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQXa_rPnT4M0ZVFBiUjoU8hxBZ1OyUZlt0EDec1Cmt4_eBHWAIz9lydPA5x9llQTSpsss3CdA6GNiF7TJ1iERfUtXmPIsYrTut281aA0hPWImdFdcAo1bg7TW1-eBWP_zaCyHsQ1Z0nS4bRJyhVr1AI4aH1Z3_Pr00DGeqnObRJhW73AMOvyfPmxsL_l2hKNOpbNkdzPCIw1O8zrz0gyCNnVkDOMYRB15Z027Uq6VFv0gQycBG7j4r',
        eq: [-6, -4, -2, 0, 1, 2, 4, 6, 5, 3]
      },
      {
        id: 'movie-mode',
        name: 'Movie Mode',
        description: 'Expands the soundstage and boosts both sub-bass for cinematic rumble and center-channel frequencies for clear dialogue.',
        category: 'Fun',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDd9UMr9NwHrB2FI7gjTJrcEHVrD1stzwh3W94zhKSCkYpYl0YcczHkCjajiSO3Fb1wE3C8bEFSxoBp6X_hiDnO_iV3EKEhp5UxqlhZWDOSORyC-b2Rs0VGXqwvMqHf1Q-Zw_htTG7pHVF7O8Fra5Edwlu3fdwW1EElQZRFihOAp3ac48BeGcLUrAl2Ot2C16ZEP85C3mY8QNzYNhURoyaEl78y-SNbRQuKXF2pM-kzjSWVT03v8X7M',
        eq: [8, 6, 2, -1, 1, 3, 2, 4, 3, 1]
      },
      {
        id: 'warm-sound',
        name: 'Warm Sound',
        description: 'Gently rolls off harsh treble frequencies and slightly boosts the lower-mids to simulate the cozy, rich sound of analog tube amplifiers.',
        category: 'Musical',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBppGzbicuWjg2HmiVgrqEgLUkKt5bqPB93Xwo69do91n3XPC4l9xNoW0leW_t1S6LjpaubCaAD6MlrJWyj5Em2Wfk9fNuF1x8D2y3PKPW1wsQXepwJ-vhhU7ztb3ra-xgboFQSSrkLEHchOCeYzyfWIUlaSP6upzaZnI1Pjwkpsp9AlP5TiSVcyp87lhfTbBw89sZM0rMTBhlSdTtPdOcke9Eijkqo6XH9bz4H96y-OSj3lCsjzGYR',
        eq: [2, 4, 5, 3, 1, 0, -1, -2, -3, -4]
      }
    ];
    initializeProfiles(defaultProfiles);
  }, []);

  // Sync volume attenuation parameters directly inside Web Audio Engine on changes
  useEffect(() => {
    audioEngine.setVolume(volume);
  }, [volume]);

  // Authenticate triggers
  const handleAuthSuccess = (user: UserState) => {
    setCurrentUser(user);
    // Switch view to profiles or dashboard on registration
    setCurrentView('profiles');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    audioEngine.playTest('bass', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] font-sans antialiased text-[#e5e2e1] overflow-x-hidden md:pl-64 pb-20 md:pb-0">
      
      {/* Background radial spotlights decor */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none">
        <div className="absolute top-[-10%] left-[20%] w-[60vw] h-[50vh] rounded-full bg-[#adc6ff]/[0.01] blur-[140px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[50vw] h-[55vh] rounded-full bg-[#e9b3ff]/[0.01] blur-[150px]" />
      </div>

      {/* Global Status Header bar */}
      <header className="hidden md:flex justify-between items-center px-10 fixed top-0 left-64 right-0 h-16 bg-[#0A0A0A]/40 backdrop-blur-xl border-b border-white/[0.04] z-45 select-none">
        <div className="flex-1" />
        <div className="flex items-center gap-6 text-xs text-[#8b90a0] font-semibold">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-white/[0.04] border border-white/[0.04]">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-mono tracking-wider text-[#34d399] font-bold uppercase">DAC Online</span>
          </div>
        </div>
      </header>

      {/* Responsive Left Navigation rail */}
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        setEqMode={(mode) => setCurrentView(mode)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAuth={() => setShowAuth(true)}
      />

      {/* Unified view controller display panel */}
      <main className={`relative z-10 px-6 md:px-10 pt-8 md:pt-16 pb-6 min-h-screen ${(currentView === 'dashboard' || currentView === 'animation' || currentView === 'settings') ? 'md:h-screen md:overflow-hidden' : ''}`}>
        {currentView === 'dashboard' && (
          <DashboardView 
            volume={volume}
            setVolume={handleSetVolume}
            gainStage={gainStage}
            setGainStage={handleSetGainStage}
            routing={routing}
            setRouting={setRouting}
          />
        )}

        {(currentView === 'profiles' || currentView === 'simple' || currentView === 'advanced') && (
          <ProfilesView 
            eqMode={currentView === 'simple' ? 'simple' : 'advanced'}
            setEqMode={(mode) => setCurrentView(mode)}
            volume={volume}
            customEq={customEq}
            setCustomEq={handleSetCustomEq}
            activeProfileId={activeProfileId}
            setActiveProfileId={setActiveProfileId}
          />
        )}

        {currentView === 'animation' && (
          <DisplayAnimationView />
        )}

        {currentView === 'community' && (
          <CommunityView 
            volume={volume}
            setCustomEq={setCustomEq}
            setActiveProfileId={setActiveProfileId}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView />
        )}

        {currentView === 'user-profile' && currentUser && (
          <UserProfileView 
            currentUser={currentUser}
            updateUser={(data) => setCurrentUser(prev => prev ? { ...prev, ...data } : null)}
          />
        )}
      </main>

      {/* Authentication slide-over modal */}
      {showAuth && (
        <AuthView 
          onSuccess={handleAuthSuccess}
          onClose={() => setShowAuth(false)}
        />
      )}

      {/* Profile Management Modals */}
      {(() => {
        const { activeModal, selectedProfile } = useUIStore();
        
        return (
          <>
            {activeModal === 'rename-profile' && selectedProfile && (
              <RenameProfileModal selectedProfile={selectedProfile} />
            )}
            {activeModal === 'duplicate-profile' && selectedProfile && (
              <DuplicateProfileModal selectedProfile={selectedProfile} />
            )}
            {activeModal === 'delete-profile' && selectedProfile && (
              <DeleteProfileModal selectedProfile={selectedProfile} />
            )}
            {activeModal === 'export-profile' && selectedProfile && (
              <ExportProfileModal selectedProfile={selectedProfile} />
            )}
            {activeModal === 'history-profile' && selectedProfile && (
              <HistoryProfileModal selectedProfile={selectedProfile} />
            )}
            {activeModal === 'import-profile' && (
              <ImportProfileModal />
            )}
          </>
        );
      })()}

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0E0E0E]/95 border-t border-white/[0.06] backdrop-blur-xl z-[90] flex items-center justify-around px-4 select-none">
        <button 
          onClick={() => setCurrentView('dashboard')}
          className={`flex flex-col items-center gap-1 transition-all ${currentView === 'dashboard' ? 'text-[#adc6ff]' : 'text-[#8b90a0]'}`}
        >
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Home</span>
        </button>

        <button 
          onClick={() => {
            setCurrentView('profiles');
          }}
          className={`flex flex-col items-center gap-1 transition-all ${(currentView === 'profiles' || currentView === 'simple' || currentView === 'advanced') ? 'text-[#adc6ff]' : 'text-[#8b90a0]'}`}
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Tuning</span>
        </button>

        <button 
          onClick={() => setCurrentView('community')}
          className={`flex flex-col items-center gap-1 transition-all ${currentView === 'community' ? 'text-[#adc6ff]' : 'text-[#8b90a0]'}`}
        >
          <Users2 className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Group</span>
        </button>

        <button 
          onClick={() => setCurrentView('settings')}
          className={`flex flex-col items-center gap-1 transition-all ${currentView === 'settings' ? 'text-[#adc6ff]' : 'text-[#8b90a0]'}`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Device</span>
        </button>
      </nav>

    </div>
  );
}
