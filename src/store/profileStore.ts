import { create } from 'zustand';
import { SoundProfile } from '../types';
import { socket } from '../socket';

interface ProfileStore {
  profiles: SoundProfile[];
  activeProfileId: string;
  profileVersions: Record<string, SoundProfile[]>;
  
  setProfiles: (profiles: SoundProfile[]) => void;
  addProfile: (profile: SoundProfile) => void;
  updateProfile: (id: string, updates: Partial<SoundProfile>) => void;
  deleteProfile: (id: string) => void;
  duplicateProfile: (id: string, newName: string) => void;
  renameProfile: (id: string, newName: string) => void;
  setActiveProfile: (id: string) => void;
  
  saveProfileVersion: (profileId: string, snapshot: SoundProfile) => void;
  getProfileVersions: (profileId: string) => SoundProfile[];
  restoreProfileVersion: (profileId: string, versionIndex: number) => void;
  
  exportProfiles: (profileIds?: string[]) => string;
  importProfiles: (json: string, merge?: boolean) => { success: boolean; added: number; conflicts: string[] };
}

const generateId = () => `profile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useProfileStore = create<ProfileStore>((set, get) => ({
  profiles: [],
  activeProfileId: 'balanced',
  profileVersions: {},
  
  setProfiles: (profiles) => set({ profiles }),
  
  addProfile: (profile) => {
    const newProfile = {
      ...profile,
      id: profile.id || generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    set(state => ({
      profiles: [...state.profiles, newProfile],
      profileVersions: {
        ...state.profileVersions,
        [newProfile.id]: [newProfile],
      },
    }));
    // TODO: Send to backend
    // socket.emit('profiles:create', newProfile);
  },
  
  updateProfile: (id, updates) => {
    set(state => {
      const profiles = state.profiles.map(p => 
        p.id === id 
          ? { ...p, ...updates, updated_at: new Date().toISOString() }
          : p
      );
      
      const updated = profiles.find(p => p.id === id);
      if (updated) {
        // Emit eq change directly to hardware if it's the active profile
        if (state.activeProfileId === id && updates.eq) {
          socket.emit('cmd:setEq', { eq: updates.eq });
        }

        const versions = state.profileVersions[id] || [];
        const newVersions = [...versions, updated].slice(-20);
        
        return {
          profiles,
          profileVersions: {
            ...state.profileVersions,
            [id]: newVersions,
          },
        };
      }
      return { profiles };
    });
    // TODO: Sync to Supabase via backend
  },
  
  deleteProfile: (id) => {
    set(state => {
      const profiles = state.profiles.filter(p => p.id !== id);
      const { [id]: _, ...versionsRest } = state.profileVersions;
      return {
        profiles,
        profileVersions: versionsRest,
        activeProfileId: state.activeProfileId === id ? 'balanced' : state.activeProfileId,
      };
    });
  },
  
  duplicateProfile: (id, newName) => {
    const { profiles } = get();
    const original = profiles.find(p => p.id === id);
    if (!original) return;
    
    const duplicate: SoundProfile = {
      ...original,
      id: generateId(),
      name: newName,
      description: `Copy of ${original.name}`,
      isDefault: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    get().addProfile(duplicate);
  },
  
  renameProfile: (id, newName) => {
    get().updateProfile(id, { name: newName });
  },
  
  setActiveProfile: (id) => {
    set({ activeProfileId: id });
    const profile = get().profiles.find(p => p.id === id);
    if (profile) {
      // Send active profile configuration to backend
      socket.emit('cmd:applyProfile', {
        profileId: id,
        eq: profile.eq,
        gainStage: 'Low', // This would come from actual profile settings if expanded
        volume: 80,       // This would come from actual profile settings if expanded
      });
    }
  },
  
  saveProfileVersion: (profileId, snapshot) => {
    set(state => {
      const versions = state.profileVersions[profileId] || [];
      return {
        profileVersions: {
          ...state.profileVersions,
          [profileId]: [...versions, snapshot].slice(-20),
        },
      };
    });
  },
  
  getProfileVersions: (profileId) => {
    return get().profileVersions[profileId] || [];
  },
  
  restoreProfileVersion: (profileId, versionIndex) => {
    const versions = get().getProfileVersions(profileId);
    if (versionIndex >= 0 && versionIndex < versions.length) {
      const restored = versions[versionIndex];
      get().updateProfile(profileId, {
        eq: restored.eq,
        description: `${restored.description} (restored)`,
      });
    }
  },
  
  exportProfiles: (profileIds) => {
    const { profiles } = get();
    const toExport = profileIds ? profiles.filter(p => profileIds.includes(p.id)) : profiles;
    return JSON.stringify(toExport, null, 2);
  },
  
  importProfiles: (json, merge = true) => {
    try {
      const imported = JSON.parse(json);
      if (!Array.isArray(imported)) throw new Error('Invalid format');
      
      const { profiles } = get();
      const conflicts: string[] = [];
      let added = 0;
      
      for (const profile of imported) {
        const exists = profiles.some(p => p.id === profile.id);
        if (exists && !merge) {
          conflicts.push(profile.id);
        } else if (exists && merge) {
          get().updateProfile(profile.id, profile);
        } else {
          get().addProfile({ ...profile, id: generateId() });
          added++;
        }
      }
      return { success: true, added, conflicts };
    } catch (error) {
      return { success: false, added: 0, conflicts: [] };
    }
  },
}));

export const initializeProfiles = (defaultProfiles: SoundProfile[]) => {
  // Try to load initial from backend. For now we use default profiles.
  useProfileStore.setState({ 
    profiles: defaultProfiles,
    activeProfileId: 'balanced'
  });

  socket.on('state:init', (state: any) => {
    if (state.activeProfileId) {
      useProfileStore.setState({ activeProfileId: state.activeProfileId });
    }
  });

  socket.on('state:update', (updates: any) => {
    if (updates.activeProfileId) {
      useProfileStore.setState({ activeProfileId: updates.activeProfileId });
    }
    // Update local EQ if device EQ changed from another source
    if (updates.customEq) {
      const state = useProfileStore.getState();
      state.updateProfile(state.activeProfileId, { eq: updates.customEq });
    }
  });
};
