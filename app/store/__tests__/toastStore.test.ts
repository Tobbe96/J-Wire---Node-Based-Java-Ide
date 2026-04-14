import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useToastStore } from '../toastStore';

beforeEach(() => {
  vi.useFakeTimers();
  useToastStore.setState({ toasts: [] });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useToastStore', () => {
  it('starts with an empty toasts array', () => {
    expect(useToastStore.getState().toasts).toEqual([]);
  });

  it('addToast adds a toast with id, message, and type', () => {
    useToastStore.getState().addToast('Hello', 'success');
    const toasts = useToastStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe('Hello');
    expect(toasts[0].type).toBe('success');
    expect(toasts[0].id).toBeDefined();
  });

  it('multiple toasts accumulate', () => {
    const { addToast } = useToastStore.getState();
    addToast('First', 'info');
    addToast('Second', 'error');
    addToast('Third', 'warning');
    expect(useToastStore.getState().toasts).toHaveLength(3);
  });

  it('removeToast removes a specific toast by id', () => {
    useToastStore.getState().addToast('Keep', 'info');
    useToastStore.getState().addToast('Remove', 'error');
    const toasts = useToastStore.getState().toasts;
    const idToRemove = toasts[1].id;
    useToastStore.getState().removeToast(idToRemove);
    const remaining = useToastStore.getState().toasts;
    expect(remaining).toHaveLength(1);
    expect(remaining[0].message).toBe('Keep');
  });

  it('auto-removes toast after 3000ms timeout', () => {
    useToastStore.getState().addToast('Temporary', 'success');
    expect(useToastStore.getState().toasts).toHaveLength(1);
    vi.advanceTimersByTime(3000);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('does not auto-remove before timeout', () => {
    useToastStore.getState().addToast('Still here', 'info');
    vi.advanceTimersByTime(2999);
    expect(useToastStore.getState().toasts).toHaveLength(1);
  });

  it('supports all toast types', () => {
    const types = ['success', 'error', 'info', 'warning'] as const;
    for (const t of types) {
      useToastStore.getState().addToast(`msg-${t}`, t);
    }
    const toasts = useToastStore.getState().toasts;
    expect(toasts).toHaveLength(4);
    expect(toasts.map((t) => t.type)).toEqual([...types]);
  });

  it('removeToast with non-existent id does nothing', () => {
    useToastStore.getState().addToast('Stay', 'info');
    useToastStore.getState().removeToast('non-existent-id');
    expect(useToastStore.getState().toasts).toHaveLength(1);
  });

  it('each toast gets a unique id', () => {
    const { addToast } = useToastStore.getState();
    addToast('A', 'info');
    addToast('B', 'info');
    const [a, b] = useToastStore.getState().toasts;
    expect(a.id).not.toBe(b.id);
  });
});
