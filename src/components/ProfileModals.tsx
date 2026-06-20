import React, { useState } from 'react';
import { X, Copy, Edit3, Trash2, Download, Upload, History, RotateCcw } from 'lucide-react';
import { SoundProfile } from '../types';
import { useProfileStore } from '../store/profileStore';
import { useUIStore } from '../store/uiStore';

interface ProfileModalsProps {
  selectedProfile: SoundProfile | null;
}

export function RenameProfileModal({ selectedProfile }: ProfileModalsProps) {
  const { closeModal } = useUIStore();
  const { renameProfile } = useProfileStore();
  const [newName, setNewName] = useState(selectedProfile?.name || '');

  const handleRename = () => {
    if (newName.trim() && selectedProfile) {
      renameProfile(selectedProfile.id, newName);
      useUIStore.setState(state => ({
        notifications: [...state.notifications, {
          id: Date.now().toString(),
          type: 'success',
          message: `Profile renamed to "${newName}"`,
          duration: 2000
        }]
      }));
      closeModal('rename-profile');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#121212] border border-white/[0.08] rounded-3xl p-8 max-w-sm w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-[#e5e2e1]">Rename Profile</h3>
          <button onClick={() => closeModal('rename-profile')} className="text-[#8b90a0] hover:text-[#e5e2e1]">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New profile name"
          className="w-full h-11 bg-[#1c1b1b] border border-white/[0.08] rounded-xl px-4 text-[#e5e2e1] placeholder-[#8b90a0] outline-none focus:border-[#adc6ff] mb-6"
        />
        
        <div className="flex gap-3">
          <button
            onClick={() => closeModal('rename-profile')}
            className="flex-1 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#e5e2e1] text-sm font-semibold hover:bg-white/[0.08] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleRename}
            className="flex-1 h-10 rounded-lg bg-[#adc6ff] text-[#002e69] text-sm font-semibold hover:bg-[#adc6ff]/90 transition-all"
          >
            Rename
          </button>
        </div>
      </div>
    </div>
  );
}

export function DuplicateProfileModal({ selectedProfile }: ProfileModalsProps) {
  const { closeModal } = useUIStore();
  const { duplicateProfile } = useProfileStore();
  const [newName, setNewName] = useState(`${selectedProfile?.name || 'Profile'} (Copy)`);

  const handleDuplicate = () => {
    if (newName.trim() && selectedProfile) {
      duplicateProfile(selectedProfile.id, newName);
      useUIStore.setState(state => ({
        notifications: [...state.notifications, {
          id: Date.now().toString(),
          type: 'success',
          message: 'Profile duplicated successfully',
          duration: 2000
        }]
      }));
      closeModal('duplicate-profile');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#121212] border border-white/[0.08] rounded-3xl p-8 max-w-sm w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-[#e5e2e1]">Duplicate Profile</h3>
          <button onClick={() => closeModal('duplicate-profile')} className="text-[#8b90a0] hover:text-[#e5e2e1]">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-sm text-[#c1c6d7] mb-4 opacity-75">
          Create a copy of "{selectedProfile?.name}" with a new name.
        </p>
        
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New profile name"
          className="w-full h-11 bg-[#1c1b1b] border border-white/[0.08] rounded-xl px-4 text-[#e5e2e1] placeholder-[#8b90a0] outline-none focus:border-[#adc6ff] mb-6"
        />
        
        <div className="flex gap-3">
          <button
            onClick={() => closeModal('duplicate-profile')}
            className="flex-1 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#e5e2e1] text-sm font-semibold hover:bg-white/[0.08] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleDuplicate}
            className="flex-1 h-10 rounded-lg bg-[#adc6ff] text-[#002e69] text-sm font-semibold hover:bg-[#adc6ff]/90 transition-all"
          >
            Duplicate
          </button>
        </div>
      </div>
    </div>
  );
}

export function DeleteProfileModal({ selectedProfile }: ProfileModalsProps) {
  const { closeModal } = useUIStore();
  const { deleteProfile } = useProfileStore();

  const handleDelete = () => {
    if (selectedProfile && !selectedProfile.isDefault) {
      deleteProfile(selectedProfile.id);
      useUIStore.setState(state => ({
        notifications: [...state.notifications, {
          id: Date.now().toString(),
          type: 'success',
          message: 'Profile deleted successfully',
          duration: 2000
        }]
      }));
      closeModal('delete-profile');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#121212] border border-white/[0.08] rounded-3xl p-8 max-w-sm w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-[#e5e2e1]">Delete Profile</h3>
          <button onClick={() => closeModal('delete-profile')} className="text-[#8b90a0] hover:text-[#e5e2e1]">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-sm text-[#c1c6d7] mb-6 opacity-75">
          Are you sure you want to delete "{selectedProfile?.name}"? This action cannot be undone.
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={() => closeModal('delete-profile')}
            className="flex-1 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#e5e2e1] text-sm font-semibold hover:bg-white/[0.08] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 h-10 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-semibold hover:bg-red-500/30 transition-all"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export function ExportProfileModal({ selectedProfile }: ProfileModalsProps) {
  const { closeModal } = useUIStore();
  const [format, setFormat] = useState<'json' | 'yaml'>('json');
  const { profiles } = useProfileStore();

  const handleExport = () => {
    if (!selectedProfile) return;
    
    const data = JSON.stringify([selectedProfile], null, 2);
    const element = document.createElement('a');
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(data)}`);
    element.setAttribute('download', `${selectedProfile.name.replace(/\s+/g, '-')}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    useUIStore.setState(state => ({
      notifications: [...state.notifications, {
        id: Date.now().toString(),
        type: 'success',
        message: 'Profile exported successfully',
        duration: 2000
      }]
    }));
    closeModal('export-profile');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#121212] border border-white/[0.08] rounded-3xl p-8 max-w-sm w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-[#e5e2e1]">Export Profile</h3>
          <button onClick={() => closeModal('export-profile')} className="text-[#8b90a0] hover:text-[#e5e2e1]">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-sm text-[#c1c6d7] mb-4 opacity-75">
          Download "{selectedProfile?.name}" as a portable file.
        </p>
        
        <div className="flex gap-2 mb-6">
          {(['json', 'yaml'] as const).map(fmt => (
            <button
              key={fmt}
              onClick={() => setFormat(fmt)}
              className={`flex-1 h-10 rounded-lg text-sm font-semibold transition-all ${
                format === fmt
                  ? 'bg-[#adc6ff] text-[#002e69]'
                  : 'bg-white/[0.04] border border-white/[0.08] text-[#e5e2e1] hover:bg-white/[0.08]'
              }`}
            >
              {fmt.toUpperCase()}
            </button>
          ))}
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => closeModal('export-profile')}
            className="flex-1 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#e5e2e1] text-sm font-semibold hover:bg-white/[0.08] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="flex-1 h-10 rounded-lg bg-[#adc6ff] text-[#002e69] text-sm font-semibold hover:bg-[#adc6ff]/90 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>
    </div>
  );
}

export function ImportProfileModal() {
  const { closeModal } = useUIStore();
  const { importProfiles } = useProfileStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const result = importProfiles(json, true);
        
        if (result.success) {
          useUIStore.setState(state => ({
            notifications: [...state.notifications, {
              id: Date.now().toString(),
              type: 'success',
              message: `Imported ${result.added} profile(s)`,
              duration: 2000
            }]
          }));
          closeModal('import-profile');
        } else {
          useUIStore.setState(state => ({
            notifications: [...state.notifications, {
              id: Date.now().toString(),
              type: 'error',
              message: 'Invalid profile file format',
              duration: 3000
            }]
          }));
        }
      } catch (error) {
        useUIStore.setState(state => ({
          notifications: [...state.notifications, {
            id: Date.now().toString(),
            type: 'error',
            message: 'Failed to import profile',
            duration: 3000
          }]
        }));
      } finally {
        setIsLoading(false);
      }
    };
    
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#121212] border border-white/[0.08] rounded-3xl p-8 max-w-sm w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-[#e5e2e1]">Import Profile</h3>
          <button onClick={() => closeModal('import-profile')} className="text-[#8b90a0] hover:text-[#e5e2e1]">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-sm text-[#c1c6d7] mb-6 opacity-75">
          Upload a profile file (JSON format) to add it to your collection.
        </p>
        
        <label className="flex items-center justify-center gap-3 w-full h-24 rounded-xl border-2 border-dashed border-white/[0.08] hover:border-[#adc6ff] cursor-pointer transition-colors bg-white/[0.02]">
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            disabled={isLoading}
            className="hidden"
          />
          <Upload className="w-6 h-6 text-[#adc6ff]" />
          <span className="text-sm font-semibold text-[#e5e2e1]">
            {isLoading ? 'Importing...' : 'Choose File or Drag'}
          </span>
        </label>
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => closeModal('import-profile')}
            className="flex-1 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#e5e2e1] text-sm font-semibold hover:bg-white/[0.08] transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export function HistoryProfileModal({ selectedProfile }: ProfileModalsProps) {
  const { closeModal } = useUIStore();
  const { getProfileVersions, restoreProfileVersion } = useProfileStore();
  
  if (!selectedProfile) return null;
  
  const versions = getProfileVersions(selectedProfile.id);

  const handleRestore = (index: number) => {
    restoreProfileVersion(selectedProfile.id, index);
    useUIStore.setState(state => ({
      notifications: [...state.notifications, {
        id: Date.now().toString(),
        type: 'success',
        message: 'Profile version restored successfully',
        duration: 2000
      }]
    }));
    closeModal('history-profile');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#121212] border border-white/[0.08] rounded-3xl p-8 max-w-sm w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-[#e5e2e1] flex items-center gap-2">
            <History className="w-5 h-5 text-[#adc6ff]" />
            Version History
          </h3>
          <button onClick={() => closeModal('history-profile')} className="text-[#8b90a0] hover:text-[#e5e2e1]">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-sm text-[#c1c6d7] mb-6 opacity-75">
          Restore "{selectedProfile.name}" to a previous state. Auto-saves the last 20 changes.
        </p>
        
        <div className="max-h-64 overflow-y-auto no-scrollbar space-y-2 mb-6">
          {versions.length === 0 ? (
            <div className="text-center py-6 text-[#8b90a0] text-sm">No version history available.</div>
          ) : (
            [...versions].reverse().map((v, i) => {
              const actualIndex = versions.length - 1 - i;
              const date = new Date(v.updated_at || Date.now());
              return (
                <div key={actualIndex} className="flex flex-col gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#e5e2e1] font-semibold">
                      {date.toLocaleDateString()} {date.toLocaleTimeString()}
                    </span>
                    <button
                      onClick={() => handleRestore(actualIndex)}
                      className="p-1.5 rounded-lg bg-[#adc6ff]/10 text-[#adc6ff] hover:bg-[#adc6ff]/20 transition-colors"
                      title="Restore this version"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-xs text-[#8b90a0]">
                    EQ: [{v.eq.join(', ')}]
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => closeModal('history-profile')}
            className="w-full h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#e5e2e1] text-sm font-semibold hover:bg-white/[0.08] transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
