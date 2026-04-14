import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockStorage: Record<string, string> = {};
vi.stubGlobal('localStorage', {
  getItem: (key: string) => mockStorage[key] ?? null,
  setItem: (key: string, value: string) => {
    mockStorage[key] = value;
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
});

// Import after mocking localStorage so the store reads from our mock
import { useThemeStore } from '../themeStore';

beforeEach(() => {
  for (const key of Object.keys(mockStorage)) delete mockStorage[key];
  useThemeStore.setState({ theme: 'dark' });
});

describe('useThemeStore', () => {
  it('defaults to dark theme', () => {
    expect(useThemeStore.getState().theme).toBe('dark');
  });

  it('toggleTheme switches dark to light', () => {
    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().theme).toBe('light');
  });

  it('toggleTheme switches light back to dark', () => {
    useThemeStore.getState().toggleTheme(); // dark → light
    useThemeStore.getState().toggleTheme(); // light → dark
    expect(useThemeStore.getState().theme).toBe('dark');
  });

  it('toggleTheme persists to localStorage', () => {
    useThemeStore.getState().toggleTheme();
    expect(mockStorage['jwire-theme']).toBe('light');
  });

  it('setTheme sets a specific theme', () => {
    useThemeStore.getState().setTheme('light');
    expect(useThemeStore.getState().theme).toBe('light');
  });

  it('setTheme persists to localStorage', () => {
    useThemeStore.getState().setTheme('light');
    expect(mockStorage['jwire-theme']).toBe('light');
    useThemeStore.getState().setTheme('dark');
    expect(mockStorage['jwire-theme']).toBe('dark');
  });
});
