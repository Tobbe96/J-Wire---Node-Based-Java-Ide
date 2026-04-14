import { create } from 'zustand';
import { Node, Edge } from '@xyflow/react';
import { traceExecution, DebugStep } from '../utils/debugExecutor';

interface DebugState {
  isDebugging: boolean;
  breakpoints: string[];
  traceSteps: DebugStep[];
  currentStepIndex: number;
  isPlaying: boolean;
  _playInterval: ReturnType<typeof setInterval> | null;
}

interface DebugActions {
  startDebug: (nodes: Node[], edges: Edge[]) => void;
  stopDebug: () => void;
  stepForward: () => void;
  stepBack: () => void;
  continueToBreakpoint: () => void;
  toggleBreakpoint: (nodeId: string) => void;
  playAll: () => void;
  stopPlayback: () => void;
}

export type DebugStore = DebugState & DebugActions;

export const useDebugStore = create<DebugStore>()((set, get) => ({
  isDebugging: false,
  breakpoints: [],
  traceSteps: [],
  currentStepIndex: -1,
  isPlaying: false,
  _playInterval: null,

  startDebug: (nodes, edges) => {
    const hasScannerNodes = nodes.some((n: Node) => n.type === 'scanner');
    const inputProvider = hasScannerNodes
      ? (prompt: string) => window.prompt(prompt) ?? ''
      : undefined;
    const trace = traceExecution(nodes, edges, inputProvider);
    set({
      isDebugging: true,
      traceSteps: trace,
      currentStepIndex: trace.length > 0 ? 0 : -1,
      isPlaying: false,
    });
  },

  stopDebug: () => {
    const { _playInterval } = get();
    if (_playInterval) clearInterval(_playInterval);
    set({
      isDebugging: false,
      traceSteps: [],
      currentStepIndex: -1,
      isPlaying: false,
      _playInterval: null,
    });
  },

  stepForward: () => {
    const { currentStepIndex, traceSteps } = get();
    if (currentStepIndex < traceSteps.length - 1) {
      set({ currentStepIndex: currentStepIndex + 1 });
    }
  },

  stepBack: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex > 0) {
      set({ currentStepIndex: currentStepIndex - 1 });
    }
  },

  continueToBreakpoint: () => {
    const { currentStepIndex, traceSteps, breakpoints } = get();
    for (let i = currentStepIndex + 1; i < traceSteps.length; i++) {
      if (breakpoints.includes(traceSteps[i].nodeId)) {
        set({ currentStepIndex: i });
        return;
      }
    }
    // No breakpoint found — jump to end
    set({ currentStepIndex: traceSteps.length - 1 });
  },

  toggleBreakpoint: (nodeId) => {
    const { breakpoints } = get();
    if (breakpoints.includes(nodeId)) {
      set({ breakpoints: breakpoints.filter(id => id !== nodeId) });
    } else {
      set({ breakpoints: [...breakpoints, nodeId] });
    }
  },

  playAll: () => {
    const { _playInterval } = get();
    if (_playInterval) clearInterval(_playInterval);
    const interval = setInterval(() => {
      const { currentStepIndex, traceSteps, breakpoints } = get();
      if (currentStepIndex >= traceSteps.length - 1) {
        clearInterval(interval);
        set({ isPlaying: false, _playInterval: null });
        return;
      }
      const nextIndex = currentStepIndex + 1;
      // Pause at breakpoints
      if (breakpoints.includes(traceSteps[nextIndex].nodeId)) {
        clearInterval(interval);
        set({ isPlaying: false, currentStepIndex: nextIndex, _playInterval: null });
        return;
      }
      set({ currentStepIndex: nextIndex });
    }, 500);
    set({ isPlaying: true, _playInterval: interval });
  },

  stopPlayback: () => {
    const { _playInterval } = get();
    if (_playInterval) clearInterval(_playInterval);
    set({ isPlaying: false, _playInterval: null });
  },
}));
