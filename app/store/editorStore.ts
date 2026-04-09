import { create } from 'zustand';
import { temporal } from 'zundo';
import {
  Node,
  Edge,
  Connection,
  OnNodesChange,
  OnEdgesChange,
  OnSelectionChangeParams,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  IsValidConnection,
} from '@xyflow/react';
import { getTypeColor } from '../utils/theme';
import { getLayoutedElements } from '../utils/autoLayout';
import { generateJavaCode } from '../utils/compiler';
import { executeGraph } from '../utils/executor';
import { NODE_CONFIGS } from '../utils/nodeRegistry';
import { isValidJavaConnection } from '../utils/validation';
import { useToastStore } from './toastStore';

const STORAGE_KEY = 'java-nodegraph-save';

function getEdgeStyle(sourceNode: Node | undefined, sourceHandle: string | null) {
  if (!sourceNode || !sourceHandle) return { stroke: '#fff', strokeWidth: 2 };
  if (sourceHandle.includes('exec')) return { stroke: '#fff', strokeWidth: 3, animated: true };
  return { stroke: getTypeColor(sourceNode.data.type as string), strokeWidth: 2 };
}

// --- State Types ---

export interface EditorState {
  // Graph state
  nodes: Node[];
  edges: Edge[];

  // Application state
  consoleOutput: string[];
  selectedSidebarNodeId: string | null;
  className: string;

  // Compilation
  isCompiling: boolean;

  // Context menu
  menuVisible: boolean;
  menuPosition: { x: number; y: number };

  // React Flow instance reference (set after mount)
  _rfInstance: {
    screenToFlowPosition: (pos: { x: number; y: number }) => { x: number; y: number };
    toObject: () => { nodes: Node[]; edges: Edge[]; viewport: unknown };
  } | null;
}

export interface EditorActions {
  // Graph mutations
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  updateNodeData: (nodeId: string, data: Record<string, unknown> | object) => void;

  // Selection
  onSelectionChange: (params: OnSelectionChangeParams) => void;
  setSelectedSidebarNodeId: (id: string | null) => void;

  // Code generation & execution
  getGeneratedCode: () => string;
  runScript: () => void;
  compileAndRunJava: () => Promise<void>;

  // Node operations
  addNode: (nodeKind: string, position: { x: number; y: number }) => string;
  addNodeAndConnect: (
    nodeKind: string,
    sourceId: string,
    sourceHandle: string
  ) => void;
  addGetter: (variableNode: Node) => void;
  updateNodeModifier: (id: string, modifier: string) => void;

  // Context menu
  setMenuVisible: (visible: boolean) => void;
  setMenuPosition: (pos: { x: number; y: number }) => void;

  // Class name
  setClassName: (name: string) => void;

  // Persistence
  saveNodeGraph: () => void;
  loadNodeGraph: () => void;
  exportToFile: () => void;
  exportToJava: () => void;
  importFromFile: (file: File) => void;

  // Validation
  validateConnection: IsValidConnection;

  // Layout
  autoLayout: () => void;

  // Internal
  setRfInstance: (instance: EditorState['_rfInstance']) => void;
}

export type EditorStore = EditorState & EditorActions;

// Separate tracked state (for undo/redo) from ephemeral state
const isTrackedKey = (key: string) =>
  key === 'nodes' || key === 'edges';

export const useEditorStore = create<EditorStore>()(
  temporal(
    (set, get) => ({
      // --- Initial State ---
      nodes: [],
      edges: [],
      consoleOutput: [],
      selectedSidebarNodeId: null,
      className: 'VisualScript',
      isCompiling: false,
      menuVisible: false,
      menuPosition: { x: 0, y: 0 },
      _rfInstance: null,

      // --- Graph Mutations ---
      onNodesChange: (changes) => {
        set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) }));
      },

      onEdgesChange: (changes) => {
        set((state) => ({ edges: applyEdgeChanges(changes, state.edges) }));
      },

      onConnect: (connection) => {
        const { nodes } = get();
        const sourceNode = nodes.find((n) => n.id === connection.source);
        const style = getEdgeStyle(sourceNode, connection.sourceHandle ?? null);
        set((state) => ({
          edges: addEdge(
            {
              ...connection,
              animated: style.animated || false,
              style: { stroke: style.stroke, strokeWidth: style.strokeWidth },
            } as Edge,
            state.edges
          ),
        }));
      },

      updateNodeData: (nodeId: string, data: Record<string, unknown> | object) => {
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === nodeId ? { ...n, data: { ...n.data, ...(typeof data === 'function' ? {} : data) } } : n
          ),
        }));
      },

      // --- Selection ---
      onSelectionChange: ({ nodes: selected }) => {
        if (selected.length > 0) {
          set({ selectedSidebarNodeId: selected[0].id });
        }
      },

      setSelectedSidebarNodeId: (id) => set({ selectedSidebarNodeId: id }),

      // --- Code Generation & Execution ---
      getGeneratedCode: () => {
        const { nodes, edges, className } = get();
        return generateJavaCode(nodes, edges, className);
      },

      runScript: () => {
        const { nodes, edges } = get();
        set({ consoleOutput: executeGraph(nodes, edges) });
      },

      compileAndRunJava: async () => {
        const { nodes, edges, className } = get();
        const code = generateJavaCode(nodes, edges, className);
        const toast = useToastStore.getState();

        set({
          isCompiling: true,
          consoleOutput: ['> Compiling and running Java...'],
        });

        try {
          const res = await fetch('/api/compile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, className }),
          });
          const data = await res.json();

          if (data.success) {
            const lines = (data.output || '').split('\n').filter((l: string) => l.length > 0);
            set({ consoleOutput: ['> Compilation successful', '> Output:', ...lines] });
            toast.addToast('Java program executed successfully', 'success');
          } else if (data.compilationError) {
            const errLines = data.compilationError.split('\n').filter((l: string) => l.length > 0);
            set({ consoleOutput: ['> Compilation failed:', ...errLines] });
            toast.addToast('Compilation error', 'error');
          } else {
            const errLines = (data.error || 'Unknown error').split('\n').filter((l: string) => l.length > 0);
            const outLines = data.output ? data.output.split('\n').filter((l: string) => l.length > 0) : [];
            set({
              consoleOutput: [
                '> Runtime error:',
                ...errLines,
                ...(outLines.length ? ['> Partial output:', ...outLines] : []),
              ],
            });
            toast.addToast('Runtime error', 'error');
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          set({ consoleOutput: ['> Failed to reach compile server:', message] });
          toast.addToast('Failed to compile', 'error');
        } finally {
          set({ isCompiling: false });
        }
      },

      // --- Node Operations ---
      addNode: (nodeKind, position) => {
        const config = NODE_CONFIGS[nodeKind];
        if (!config) return '';
        const newNodeId = `node-${Date.now()}`;
        set((state) => ({
          nodes: [
            ...state.nodes,
            {
              id: newNodeId,
              type: config.type,
              position,
              data: { ...config.data },
            },
          ],
        }));
        return newNodeId;
      },

      addNodeAndConnect: (nodeKind, sourceId, sourceHandle) => {
        const { nodes, menuPosition, _rfInstance } = get();
        const config = NODE_CONFIGS[nodeKind];
        if (!config) return;

        const newNodeId = `node-${Date.now()}`;
        const flowPos = _rfInstance
          ? _rfInstance.screenToFlowPosition(menuPosition)
          : menuPosition;

        const sourceNode = nodes.find((n) => n.id === sourceId);
        const style = getEdgeStyle(sourceNode, sourceHandle);

        set((state) => ({
          nodes: [
            ...state.nodes,
            {
              id: newNodeId,
              type: config.type,
              position: flowPos,
              data: { ...config.data },
            },
          ],
          edges: addEdge(
            {
              id: `e-${sourceId}-${newNodeId}`,
              source: sourceId,
              sourceHandle,
              target: newNodeId,
              targetHandle: sourceHandle.includes('exec') ? 'exec-in' : 'data-in',
              animated: style.animated || false,
              style: { stroke: style.stroke, strokeWidth: style.strokeWidth },
            } as Edge,
            state.edges
          ),
          menuVisible: false,
        }));
      },

      addGetter: (variableNode) => {
        set((state) => ({
          nodes: [
            ...state.nodes,
            {
              id: `getter-${Date.now()}`,
              type: 'getter',
              position: { x: 400, y: 250 },
              data: {
                label: variableNode.data.label,
                type: variableNode.data.type,
                variableId: variableNode.id,
              },
            },
          ],
        }));
      },

      updateNodeModifier: (id, modifier) => {
        get().updateNodeData(id, { modifier });
      },

      // --- Context Menu ---
      setMenuVisible: (visible) => set({ menuVisible: visible }),
      setMenuPosition: (pos) => set({ menuPosition: pos }),

      // --- Class Name ---
      setClassName: (name) => set({ className: name }),

      // --- Persistence ---
      saveNodeGraph: () => {
        const { _rfInstance, className } = get();
        const flow = _rfInstance ? _rfInstance.toObject() : { nodes: get().nodes, edges: get().edges };
        const payload = { version: 2, className, ...flow, savedAt: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        set((state) => ({
          consoleOutput: [...state.consoleOutput, '> Nodegraph saved to LocalStorage'],
        }));
        useToastStore.getState().addToast('Project saved', 'success');
      },

      loadNodeGraph: () => {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
          try {
            const flow = JSON.parse(savedData);
            if (flow) {
              // Migrate v1 (no version field) to v2
              const nodes = flow.nodes || [];
              const edges = flow.edges || [];
              const cls = flow.className || 'VisualScript';
              set({
                nodes,
                edges,
                className: cls,
                consoleOutput: ['> Nodegraph loaded successfully'],
              });
              useToastStore.getState().addToast('Project loaded', 'info');
            }
          } catch (e) {
            console.error('Failed to load graph:', e);
            useToastStore.getState().addToast('Failed to load project', 'error');
          }
        }
      },

      exportToFile: () => {
        const { _rfInstance, className } = get();
        const flow = _rfInstance ? _rfInstance.toObject() : { nodes: get().nodes, edges: get().edges };
        const payload = { version: 2, className, ...flow, savedAt: new Date().toISOString() };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${className || 'jflow-project'}.json`;
        a.click();
        URL.revokeObjectURL(url);
        useToastStore.getState().addToast('Project exported', 'success');
      },

      exportToJava: () => {
        const { nodes, edges, className } = get();
        const code = generateJavaCode(nodes, edges, className);
        const blob = new Blob([code], { type: 'text/x-java-source' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${className || 'VisualScript'}.java`;
        a.click();
        URL.revokeObjectURL(url);
        useToastStore.getState().addToast('Java file exported', 'success');
      },

      importFromFile: (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const flow = JSON.parse(e.target?.result as string);
            if (flow && flow.nodes) {
              set({
                nodes: flow.nodes || [],
                edges: flow.edges || [],
                className: flow.className || 'VisualScript',
                consoleOutput: ['> Project imported from file'],
              });
              useToastStore.getState().addToast('Project imported', 'success');
            }
          } catch {
            useToastStore.getState().addToast('Invalid project file', 'error');
          }
        };
        reader.readAsText(file);
      },

      // --- Validation ---
      validateConnection: (connection) => {
        const { nodes } = get();
        return isValidJavaConnection(connection as Connection | Edge, nodes);
      },

      // --- Layout ---
      autoLayout: () => {
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(get().nodes, get().edges);
        set({ nodes: layoutedNodes, edges: layoutedEdges });
      },

      // --- Internal ---
      setRfInstance: (instance) => set({ _rfInstance: instance }),
    }),
    {
      // Only track nodes and edges for undo/redo
      partialize: (state) => {
        const tracked: Record<string, unknown> = {};
        for (const key of Object.keys(state)) {
          if (isTrackedKey(key)) {
            tracked[key] = state[key as keyof EditorState];
          }
        }
        return tracked as Pick<EditorState, 'nodes' | 'edges'>;
      },
      limit: 50,
    }
  )
);
