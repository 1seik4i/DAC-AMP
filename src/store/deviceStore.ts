import { create } from 'zustand';

export interface DeviceState {
  id: string;
  name: string;
  model: string;
  serial: string;
  firmware: string;
  connected: boolean;
  sampleRate: number;
  bitDepth: number;
  volume: number;
  temperature: number;
  cpuUsage: number;
  dspUsage: number;
  latency: number;
  usbSpeed: 'HS' | 'SS' | 'SSP';
  battery?: number;
  outputMode: 'Balanced' | 'Single-Ended';
}

interface DeviceStore {
  // State
  device: DeviceState | null;
  devices: DeviceState[];
  activeDeviceId: string | null;
  isDetecting: boolean;
  connectionStatus: 'idle' | 'detecting' | 'connected' | 'error';
  lastError: string | null;
  
  // Actions
  setDevice: (device: DeviceState) => void;
  setDevices: (devices: DeviceState[]) => void;
  setActiveDevice: (id: string) => void;
  updateDeviceStatus: (updates: Partial<DeviceState>) => void;
  setConnected: (connected: boolean) => void;
  setDetecting: (detecting: boolean) => void;
  setConnectionStatus: (status: 'idle' | 'detecting' | 'connected' | 'error') => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const DEFAULT_DEVICE: DeviceState = {
  id: 'default-dac-1',
  name: 'Sonic Pro X1',
  model: 'SPX-1000',
  serial: 'SN12345678',
  firmware: 'v2.4.1',
  connected: true,
  sampleRate: 384000,
  bitDepth: 24,
  volume: -12,
  temperature: 38,
  cpuUsage: 15,
  dspUsage: 22,
  latency: 2.5,
  usbSpeed: 'SSP',
  outputMode: 'Balanced',
};

export const useDeviceStore = create<DeviceStore>((set, get) => ({
  // Initial state
  device: DEFAULT_DEVICE,
  devices: [DEFAULT_DEVICE],
  activeDeviceId: 'default-dac-1',
  isDetecting: false,
  connectionStatus: 'connected',
  lastError: null,
  
  // Actions
  setDevice: (device) => {
    set({ device, activeDeviceId: device.id });
    localStorage.setItem('dac_device', JSON.stringify(device));
  },
  
  setDevices: (devices) => {
    set({ devices });
    localStorage.setItem('dac_devices', JSON.stringify(devices));
  },
  
  setActiveDevice: (id) => {
    const { devices } = get();
    const device = devices.find(d => d.id === id);
    if (device) {
      set({ device, activeDeviceId: id });
      localStorage.setItem('dac_active_device', id);
    }
  },
  
  updateDeviceStatus: (updates) => {
    set(state => {
      if (!state.device) return state;
      const updated = { ...state.device, ...updates };
      localStorage.setItem('dac_device', JSON.stringify(updated));
      return { device: updated };
    });
  },
  
  setConnected: (connected) => {
    get().updateDeviceStatus({ connected });
    if (connected) {
      get().setConnectionStatus('connected');
    }
  },
  
  setDetecting: (detecting) => {
    set({ isDetecting: detecting });
    if (detecting) {
      get().setConnectionStatus('detecting');
    }
  },
  
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  
  setError: (error) => set({ lastError: error }),
  
  clearError: () => set({ lastError: null }),
}));

// Load saved device state on startup
export const initializeDevice = () => {
  const saved = localStorage.getItem('dac_device');
  if (saved) {
    try {
      const device = JSON.parse(saved);
      useDeviceStore.setState({ device, activeDeviceId: device.id });
    } catch {
      // Use default device
    }
  }
};
