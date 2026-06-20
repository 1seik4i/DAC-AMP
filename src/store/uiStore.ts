import { create } from 'zustand';

interface ModalState {
  isOpen: boolean;
  type: string;
  data?: any;
}

interface UIStore {
  // Modals
  modals: Record<string, ModalState>;
  openModal: (type: string, data?: any) => void;
  closeModal: (type: string) => void;
  closeAllModals: () => void;
  activeModal: string | null;
  selectedProfile: any | null;
  setSelectedProfile: (profile: any | null) => void;
  
  // Panels
  panels: Record<string, boolean>;
  openPanel: (name: string) => void;
  closePanel: (name: string) => void;
  togglePanel: (name: string) => void;
  
  // Notifications
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
  }>;
  addNotification: (type: 'success' | 'error' | 'warning' | 'info', message: string, duration?: number) => void;
  removeNotification: (id: string) => void;
  
  // Loading states
  loadingStates: Record<string, boolean>;
  setLoading: (key: string, loading: boolean) => void;
  
  // UI Preferences
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useUIStore = create<UIStore>((set, get) => ({
  // Modals
  modals: {},
  activeModal: null,
  selectedProfile: null,
  setSelectedProfile: (profile) => set({ selectedProfile: profile }),
  
  openModal: (type, data) => {
    set(state => ({
      activeModal: type,
      selectedProfile: data || state.selectedProfile,
      modals: {
        ...state.modals,
        [type]: { isOpen: true, type, data },
      },
    }));
  },
  
  closeModal: (type) => {
    set(state => ({
      activeModal: state.activeModal === type ? null : state.activeModal,
      modals: {
        ...state.modals,
        [type]: { isOpen: false, type },
      },
    }));
  },
  
  closeAllModals: () => {
    set({ modals: {}, activeModal: null, selectedProfile: null });
  },
  
  // Panels
  panels: {},
  
  openPanel: (name) => {
    set(state => ({
      panels: {
        ...state.panels,
        [name]: true,
      },
    }));
  },
  
  closePanel: (name) => {
    set(state => ({
      panels: {
        ...state.panels,
        [name]: false,
      },
    }));
  },
  
  togglePanel: (name) => {
    set(state => ({
      panels: {
        ...state.panels,
        [name]: !state.panels[name],
      },
    }));
  },
  
  // Notifications
  notifications: [],
  
  addNotification: (type, message, duration = 3000) => {
    const id = generateId();
    set(state => ({
      notifications: [...state.notifications, { id, type, message, duration }],
    }));
    
    if (duration > 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, duration);
    }
  },
  
  removeNotification: (id) => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id),
    }));
  },
  
  // Loading states
  loadingStates: {},
  
  setLoading: (key, loading) => {
    set(state => ({
      loadingStates: {
        ...state.loadingStates,
        [key]: loading,
      },
    }));
  },
  
  // UI Preferences
  theme: 'dark',
  
  setTheme: (theme) => {
    set({ theme });
    localStorage.setItem('dac_theme', theme);
  },
  
  sidebarCollapsed: false,
  
  setSidebarCollapsed: (collapsed) => {
    set({ sidebarCollapsed: collapsed });
    localStorage.setItem('dac_sidebar_collapsed', collapsed.toString());
  },
}));

// Load UI preferences from localStorage
export const initializeUI = () => {
  const savedTheme = localStorage.getItem('dac_theme') as 'dark' | 'light' | null;
  if (savedTheme) {
    useUIStore.setState({ theme: savedTheme });
  }
  
  const savedCollapsed = localStorage.getItem('dac_sidebar_collapsed');
  if (savedCollapsed) {
    useUIStore.setState({ sidebarCollapsed: savedCollapsed === 'true' });
  }
};
