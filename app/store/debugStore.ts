import { create } from 'zustand';
import { Node, Edge } from '@xyflow/react';
import { traceExecution, DebugStep } from '../utils/debugExecutor';

interface DebugState {
  isDebugging: boolean;
  breakpoints: string[];
  traceSteps: DebugStep[];
  currentStepIndex: number;
  isPlaying: boolean;
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

let playInterval: ReturnType<typeof setInterval> | null = null;

export const useDebugStore = create<DebugStore>()((set, get) => ({
  isDebugging: false,
  breakpoints: [],
  traceSteps: [],
  currentStepIndex: -1,
  isPlaying: false,

  startDebug: (nodes, edges) => {
    const trace = traceExecution(nodes, edges);
    set({
      isDebugging: true,
      traceSteps: trace,
      currentStepIndex: trace.length > 0 ? 0 : -1,
      isPlaying: false,
    });
  },

  stopDebug: () => {
    if (playInterval) { clearInterval(playInterval); playInterval = null; }
    set({
      isDebugging: false,
      traceSteps: [],
      currentStepIndex: -1,
      isPlaying: false,
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
    if (playInterval) clearInterval(playInterval);
    set({ isPlaying: true });
    playInterval = setInterval(() => {
      const { currentStepIndex, traceSteps, breakpoints } = get();
      if (currentStepIndex >= traceSteps.length - 1) {
        if (playInterval) { clearInterval(playInterval); playInterval = null; }
        set({ isPlaying: false });
        return;
      }
      const nextIndex = currentStepIndex + 1;
      // Pause at breakpoints
      if (breakpoints.includes(traceSteps[nextIndex].nodeId)) {
        if (playInterval) { clearInterval(playInterval); playInterval = null; }
        set({ isPlaying: false, currentStepIndex: nextIndex });
        return;
      }
      set({ currentStepIndex: nextIndex });
    }, 500);
  },

  stopPlayback: () => {
    if (playInterval) { clearInterval(playInterval); playInterval = null; }
    set({ isPlaying: false });
  },
}));
