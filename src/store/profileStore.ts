import { create } from 'zustand';
import { SoundProfile } from '../types';

interface ProfileStore {
  // State
  profiles: SoundProfile[];
  activeProfileId: string;
  profileVersions: Record<string, SoundProfile[]>;
  
  // Actions
  setProfiles: (profiles: SoundProfile[]) => void;
  addProfile: (profile: SoundProfile) => void;
  updateProfile: (id: string, updates: Partial<SoundProfile>) => void;
  deleteProfile: (id: string) => void;
  duplicateProfile: (id: string, newName: string) => void;
  renameProfile: (id: string, newName: string) => void;
  setActiveProfile: (id: string) => void;
  
  // Versioning
  saveProfileVersion: (profileId: string, snapshot: SoundProfile) => void;
  getProfileVersions: (profileId: string) => SoundProfile[];
  restoreProfileVersion: (profileId: string, versionIndex: number) => void;
  
  // Import/Export
  exportProfiles: (profileIds?: string[]) => string;
  importProfiles: (json: string, merge?: boolean) => { success: boolean; added: number; conflicts: string[] };
}

const generateId = () => `profile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useProfileStore = create<ProfileStore>((set, get) => ({
  // Initial state
  profiles: [],
  activeProfileId: 'balanced',
  profileVersions: {},
  
  // Actions
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
    
    // Persist to localStorage
    const { profiles } = get();
    localStorage.setItem('dac_profiles', JSON.stringify(profiles));
  },
  
  updateProfile: (id, updates) => {
    set(state => {
      const profiles = state.profiles.map(p => 
        p.id === id 
          ? { ...p, ...updates, updated_at: new Date().toISOString() }
          : p
      );
      
      // Auto-save version on update
      const updated = profiles.find(p => p.id === id);
      if (updated) {
        const versions = state.profileVersions[id] || [];
        const newVersions = [...versions, updated].slice(-20); // Keep last 20 versions
        
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
    
    const { profiles } = get();
    localStorage.setItem('dac_profiles', JSON.stringify(profiles));
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
    
    const { profiles } = get();
    localStorage.setItem('dac_profiles', JSON.stringify(profiles));
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
    localStorage.setItem('dac_activeProfileId', id);
  },
  
  // Versioning
  saveProfileVersion: (profileId, snapshot) => {
    set(state => {
      const versions = state.profileVersions[profileId] || [];
      const newVersions = [...versions, snapshot].slice(-20);
      
      return {
        profileVersions: {
          ...state.profileVersions,
          [profileId]: newVersions,
        },
      };
    });
  },
  
  getProfileVersions: (profileId) => {
    const { profileVersions } = get();
    return profileVersions[profileId] || [];
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
  
  // Import/Export
  exportProfiles: (profileIds) => {
    const { profiles } = get();
    const toExport = profileIds 
      ? profiles.filter(p => profileIds.includes(p.id))
      : profiles;
    
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
          get().addProfile({
            ...profile,
            id: generateId(), // Generate new ID for imported
          });
          added++;
        }
      }
      
      return { success: true, added, conflicts };
    } catch (error) {
      return { success: false, added: 0, conflicts: [] };
    }
  },
}));

// Load profiles from localStorage on startup
export const initializeProfiles = (defaultProfiles: SoundProfile[]) => {
  const saved = localStorage.getItem('dac_profiles');
  const savedActiveId = localStorage.getItem('dac_activeProfileId');
  
  if (saved) {
    try {
      const profiles = JSON.parse(saved);
      useProfileStore.setState({ 
        profiles, 
        profileVersions: {},
        activeProfileId: savedActiveId || 'balanced'
      });
    } catch {
      useProfileStore.setState({ 
        profiles: defaultProfiles,
        activeProfileId: savedActiveId || 'balanced'
      });
    }
  } else {
    useProfileStore.setState({ 
      profiles: defaultProfiles,
      activeProfileId: savedActiveId || 'balanced'
    });
  }
};
