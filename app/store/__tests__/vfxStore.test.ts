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

import { useVfxStore } from '../vfxStore';

beforeEach(() => {
  for (const key of Object.keys(mockStorage)) delete mockStorage[key];
  useVfxStore.setState({ vfxEnabled: false, hydrated: false });
});

describe('useVfxStore', () => {
  it('defaults to vfxEnabled false and hydrated false', () => {
    const state = useVfxStore.getState();
    expect(state.vfxEnabled).toBe(false);
    expect(state.hydrated).toBe(false);
  });

  it('hydrate() enables vfx when localStorage has no value', () => {
    useVfxStore.getState().hydrate();
    const state = useVfxStore.getState();
    expect(state.vfxEnabled).toBe(true);
    expect(state.hydrated).toBe(true);
  });

  it('hydrate() reads "true" from localStorage', () => {
    mockStorage['jwire-vfx'] = 'true';
    useVfxStore.getState().hydrate();
    expect(useVfxStore.getState().vfxEnabled).toBe(true);
  });

  it('hydrate() reads "false" from localStorage', () => {
    mockStorage['jwire-vfx'] = 'false';
    useVfxStore.getState().hydrate();
    expect(useVfxStore.getState().vfxEnabled).toBe(false);
  });

  it('toggleVfx() switches state', () => {
    useVfxStore.getState().toggleVfx(); // false → true
    expect(useVfxStore.getState().vfxEnabled).toBe(true);
    useVfxStore.getState().toggleVfx(); // true → false
    expect(useVfxStore.getState().vfxEnabled).toBe(false);
  });

  it('toggleVfx() persists to localStorage', () => {
    useVfxStore.getState().toggleVfx();
    expect(mockStorage['jwire-vfx']).toBe('true');
    useVfxStore.getState().toggleVfx();
    expect(mockStorage['jwire-vfx']).toBe('false');
  });

  it('setVfxEnabled() sets specific value', () => {
    useVfxStore.getState().setVfxEnabled(true);
    expect(useVfxStore.getState().vfxEnabled).toBe(true);
    useVfxStore.getState().setVfxEnabled(false);
    expect(useVfxStore.getState().vfxEnabled).toBe(false);
  });

  it('setVfxEnabled() persists to localStorage', () => {
    useVfxStore.getState().setVfxEnabled(true);
    expect(mockStorage['jwire-vfx']).toBe('true');
    useVfxStore.getState().setVfxEnabled(false);
    expect(mockStorage['jwire-vfx']).toBe('false');
  });
});
