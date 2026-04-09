import { create } from 'zustand';

type Theme = 'dark' | 'light';

interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: (typeof window !== 'undefined' && localStorage.getItem('jflow-theme') as Theme) || 'dark',
  toggleTheme: () => set((state) => {
    const next = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('jflow-theme', next);
    return { theme: next };
  }),
  setTheme: (theme) => {
    localStorage.setItem('jflow-theme', theme);
    set({ theme });
  },
}));
