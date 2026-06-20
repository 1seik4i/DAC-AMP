import { create } from 'zustand';
import { socket } from '../socket';

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
  device: DeviceState | null;
  devices: DeviceState[];
  activeDeviceId: string | null;
  isDetecting: boolean;
  connectionStatus: 'idle' | 'detecting' | 'connected' | 'error';
  lastError: string | null;
  
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
  connected: false,
  sampleRate: 384000,
  bitDepth: 24,
  volume: 50,
  temperature: 38,
  cpuUsage: 15,
  dspUsage: 22,
  latency: 2.5,
  usbSpeed: 'SSP',
  outputMode: 'Balanced',
};

export const useDeviceStore = create<DeviceStore>((set, get) => ({
  device: DEFAULT_DEVICE,
  devices: [DEFAULT_DEVICE],
  activeDeviceId: 'default-dac-1',
  isDetecting: false,
  connectionStatus: 'idle',
  lastError: null,
  
  setDevice: (device) => set({ device, activeDeviceId: device.id }),
  setDevices: (devices) => set({ devices }),
  setActiveDevice: (id) => {
    const { devices } = get();
    const device = devices.find(d => d.id === id);
    if (device) set({ device, activeDeviceId: id });
  },
  
  updateDeviceStatus: (updates) => {
    set(state => {
      if (!state.device) return state;
      return { device: { ...state.device, ...updates } };
    });
  },
  
  setConnected: (connected) => {
    get().updateDeviceStatus({ connected });
    set({ connectionStatus: connected ? 'connected' : 'idle' });
  },
  
  setDetecting: (detecting) => {
    set({ isDetecting: detecting });
    if (detecting) set({ connectionStatus: 'detecting' });
  },
  
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  setError: (error) => set({ lastError: error }),
  clearError: () => set({ lastError: null }),
}));

export const initializeDevice = () => {
  socket.on('state:init', (state: any) => {
    const store = useDeviceStore.getState();
    store.updateDeviceStatus({
      connected: state.connected,
      firmware: state.firmwareVersion,
      sampleRate: state.sampleRate,
      bitDepth: state.bitDepth,
      volume: state.volume,
      temperature: state.temperature,
      cpuUsage: state.cpuUsage,
      dspUsage: state.dspUsage,
    });
    store.setConnectionStatus(state.connected ? 'connected' : 'idle');
  });

  socket.on('state:update', (updates: any) => {
    const store = useDeviceStore.getState();
    const mapUpdates: Partial<DeviceState> = {};
    if (updates.connected !== undefined) mapUpdates.connected = updates.connected;
    if (updates.firmwareVersion !== undefined) mapUpdates.firmware = updates.firmwareVersion;
    if (updates.sampleRate !== undefined) mapUpdates.sampleRate = updates.sampleRate;
    if (updates.bitDepth !== undefined) mapUpdates.bitDepth = updates.bitDepth;
    if (updates.volume !== undefined) mapUpdates.volume = updates.volume;
    if (updates.temperature !== undefined) mapUpdates.temperature = updates.temperature;
    if (updates.cpuUsage !== undefined) mapUpdates.cpuUsage = updates.cpuUsage;
    if (updates.dspUsage !== undefined) mapUpdates.dspUsage = updates.dspUsage;
    
    if (Object.keys(mapUpdates).length > 0) {
      store.updateDeviceStatus(mapUpdates);
    }
    
    if (updates.connected !== undefined) {
      store.setConnectionStatus(updates.connected ? 'connected' : 'idle');
    }
  });
};
