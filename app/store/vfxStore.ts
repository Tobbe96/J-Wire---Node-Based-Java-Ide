import { create } from 'zustand';

interface VfxStore {
  vfxEnabled: boolean;
  hydrated: boolean;
  toggleVfx: () => void;
  setVfxEnabled: (enabled: boolean) => void;
  hydrate: () => void;
}

export const useVfxStore = create<VfxStore>((set) => ({
  vfxEnabled: false,
  hydrated: false,
  hydrate: () => {
    const stored = localStorage.getItem('jflow-vfx');
    set({ vfxEnabled: stored !== 'false', hydrated: true });
  },
  toggleVfx: () =>
    set((state) => {
      const next = !state.vfxEnabled;
      localStorage.setItem('jflow-vfx', String(next));
      return { vfxEnabled: next };
    }),
  setVfxEnabled: (enabled) => {
    localStorage.setItem('jflow-vfx', String(enabled));
    set({ vfxEnabled: enabled });
  },
}));
