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
import { isValidJavaConnection, resolveSourceType, resolveTargetAccepts, getAutoConvertType } from '../utils/validation';
import type { ProjectClassInfo, Parameter } from '../utils/nodeTypes';
import type { Template } from '../utils/templates';
import { useToastStore } from './toastStore';

const STORAGE_KEY = 'java-nodegraph-save';

export interface ProjectFile {
  id: string;
  className: string;
  classType?: 'class' | 'interface' | 'enum';
  extendsClass?: string;
  implementsInterfaces?: string[];
  isAbstract?: boolean;
  packageName?: string;
  nodes: Node[];
  edges: Edge[];
}

function getEdgeStyle(sourceNode: Node | undefined, sourceHandle: string | null) {
  if (!sourceNode || !sourceHandle) return { stroke: '#fff', strokeWidth: 2 };
  if (sourceHandle.includes('exec')) return { stroke: '#fff', strokeWidth: 3, animated: true };
  return { stroke: getTypeColor(sourceNode.data.type as string), strokeWidth: 2 };
}

// --- State Types ---

export interface PendingInput {
  prompt: string;
  value: string;
}

export type InputMode = 'idle' | 'collecting' | 'running';

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

  // Scanner input collection
  pendingInputs: PendingInput[];
  inputMode: InputMode;
  /** 'script' for runScript, 'java' for compileAndRunJava */
  _inputTarget: 'script' | 'java';

  // Multi-file
  files: ProjectFile[];
  activeFileId: string;

  // Context menu
  menuVisible: boolean;
  menuPosition: { x: number; y: number };

  // Clipboard
  clipboard: { nodes: Node[]; edges: Edge[] } | null;

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

  // Scanner input collection
  submitInputs: () => void;
  cancelInputs: () => void;
  updatePendingInput: (index: number, value: string) => void;

  // Node operations
  addNode: (nodeKind: string, position: { x: number; y: number }) => string;
  addNodeAndConnect: (
    nodeKind: string,
    sourceId: string,
    sourceHandle: string
  ) => void;
  addGetter: (variableNode: Node) => void;
  updateNodeModifier: (id: string, modifier: string) => void;

  // Copy / Paste / Duplicate / Group
  copySelection: () => void;
  pasteClipboard: () => void;
  duplicateSelection: () => void;
  groupSelection: () => void;

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

  // Multi-file
  addFile: (className?: string, classType?: 'class' | 'interface' | 'enum') => void;
  removeFile: (fileId: string) => void;
  switchFile: (fileId: string) => void;
  renameFile: (fileId: string, newName: string) => void;
  updateClassMetadata: (fileId: string, meta: {
    classType?: 'class' | 'interface' | 'enum';
    extendsClass?: string;
    implementsInterfaces?: string[];
    isAbstract?: boolean;
    packageName?: string;
  }) => void;

  // Templates
  loadTemplate: (template: Template) => void;

  // Internal
  setRfInstance: (instance: EditorState['_rfInstance']) => void;
}

export type EditorStore = EditorState & EditorActions;

// Separate tracked state (for undo/redo) from ephemeral state
const isTrackedKey = (key: string) =>
  key === 'nodes' || key === 'edges';

/** Extract method metadata from all project files for cross-class references */
function buildProjectClasses(files: ProjectFile[], activeFileId: string, activeNodes: Node[], activeEdges: Edge[], activeClassName: string): ProjectClassInfo[] {
  const allFiles = files.map(f =>
    f.id === activeFileId ? { ...f, nodes: activeNodes, edges: activeEdges, className: activeClassName } : f
  );
  return allFiles.map(f => ({
    id: f.id,
    className: f.className,
    classType: f.classType || 'class',
    extendsClass: f.extendsClass,
    implementsInterfaces: f.implementsInterfaces || [],
    isAbstract: f.isAbstract || false,
    methods: f.nodes
      .filter(n => n.type === 'method')
      .map(m => ({
        name: m.data.label as string,
        returnType: (m.data.returnType as string) || 'void',
        parameters: (m.data.parameters as Parameter[]) || [],
        isStatic: m.data.isStatic !== false,
      })),
    constructors: f.nodes
      .filter(n => n.type === 'constructor')
      .map((c, index) => ({
        index,
        parameters: (c.data.parameters as Parameter[]) || [],
      })),
  }));
}

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
      pendingInputs: [],
      inputMode: 'idle' as InputMode,
      _inputTarget: 'script' as const,
      files: [{ id: 'main', className: 'VisualScript', nodes: [], edges: [] }],
      activeFileId: 'main',
      menuVisible: false,
      menuPosition: { x: 0, y: 0 },
      clipboard: null,
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
        const targetNode = nodes.find((n) => n.id === connection.target);
        const sourceHandle = connection.sourceHandle ?? '';
        const targetHandle = connection.targetHandle ?? '';

        // Skip auto-convert for exec handles
        if (!sourceHandle.startsWith('exec') && sourceNode && targetNode) {
          const sourceType = resolveSourceType(sourceNode, sourceHandle);
          const acceptedTypes = resolveTargetAccepts(targetNode, targetHandle, nodes)
            ?? (targetNode.data.type ? [targetNode.data.type as string] : undefined);

          if (sourceType && acceptedTypes && !acceptedTypes.includes(sourceType)) {
            const castTo = getAutoConvertType(sourceType, acceptedTypes);
            if (castTo) {
              // Insert a Cast node between source and target
              const castId = `cast-${Date.now()}`;
              const sx = sourceNode.position.x + (sourceNode.measured?.width ?? 200);
              const tx = targetNode.position.x;
              const sy = sourceNode.position.y;
              const ty = targetNode.position.y;
              const castPos = { x: (sx + tx) / 2 - 60, y: (sy + ty) / 2 };

              const srcStyle = getEdgeStyle(sourceNode, sourceHandle);
              const castStyle = { stroke: getTypeColor(castTo), strokeWidth: 2 };

              set((state) => ({
                nodes: [
                  ...state.nodes,
                  {
                    id: castId,
                    type: 'cast',
                    position: castPos,
                    data: { label: 'Cast', targetType: castTo },
                  },
                ],
                edges: addEdge(
                  {
                    id: `e-${connection.source}-${castId}`,
                    source: connection.source!,
                    sourceHandle,
                    target: castId,
                    targetHandle: 'data-in',
                    style: { stroke: srcStyle.stroke, strokeWidth: srcStyle.strokeWidth },
                  } as Edge,
                  addEdge(
                    {
                      id: `e-${castId}-${connection.target}`,
                      source: castId,
                      sourceHandle: 'data-out',
                      target: connection.target!,
                      targetHandle,
                      style: { stroke: castStyle.stroke, strokeWidth: castStyle.strokeWidth },
                    } as Edge,
                    state.edges
                  )
                ),
              }));
              return;
            }
          }
        }

        // Normal connection (exact match or exec)
        const style = getEdgeStyle(sourceNode, sourceHandle);
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
        const { nodes, edges, className, files, activeFileId } = get();
        const projectClasses = buildProjectClasses(files, activeFileId, nodes, edges, className);
        const activeFile = files.find(f => f.id === activeFileId);
        return generateJavaCode(nodes, edges, className, projectClasses, {
          classType: activeFile?.classType,
          extendsClass: activeFile?.extendsClass,
          implementsInterfaces: activeFile?.implementsInterfaces,
          isAbstract: activeFile?.isAbstract,
          packageName: activeFile?.packageName,
        });
      },

      runScript: () => {
        const { nodes, edges, files, activeFileId, className } = get();
        const syncedFiles = files.map(f =>
          f.id === activeFileId ? { ...f, nodes, edges, className } : f
        );
        const scannerNodes = nodes.filter(n => n.type === 'scanner');

        if (scannerNodes.length > 0) {
          const prompts: PendingInput[] = scannerNodes.map(sn => {
            const readType = (sn.data.readType as string) || 'nextLine';
            const inlinePrompt = (sn.data.inlinePrompt as string) || '';
            const prompt = inlinePrompt || `Enter value for ${readType}:`;
            return { prompt, value: '' };
          });
          set({
            pendingInputs: prompts,
            inputMode: 'collecting' as InputMode,
            _inputTarget: 'script' as const,
            consoleOutput: ['> Waiting for input...'],
          });
          return;
        }

        set({ consoleOutput: executeGraph(nodes, edges, undefined, syncedFiles) });
      },

      compileAndRunJava: async () => {
        const { nodes, edges, className, files, activeFileId } = get();
        const toast = useToastStore.getState();
        const syncedFiles = files.map(f =>
          f.id === activeFileId ? { ...f, nodes, edges, className } : f
        );
        const projectClasses = buildProjectClasses(files, activeFileId, nodes, edges, className);

        // Collect inputs for scanner nodes before running
        const scannerNodes = nodes.filter(n => n.type === 'scanner');
        if (scannerNodes.length > 0 && get().inputMode !== 'running') {
          const prompts: PendingInput[] = scannerNodes.map(sn => {
            const readType = (sn.data.readType as string) || 'nextLine';
            return { prompt: `[Scanner] Enter value for ${readType}:`, value: '' };
          });
          set({
            pendingInputs: prompts,
            inputMode: 'collecting' as InputMode,
            _inputTarget: 'java' as const,
            consoleOutput: ['> Waiting for input...'],
          });
          return;
        }

        const inputs = scannerNodes.length > 0
          ? get().pendingInputs.map(p => p.value)
          : undefined;

        // Generate code for all files in the project
        const javaFiles = syncedFiles.map(f => ({
          code: generateJavaCode(f.nodes, f.edges, f.className, projectClasses, {
            classType: f.classType,
            extendsClass: f.extendsClass,
            implementsInterfaces: f.implementsInterfaces,
            isAbstract: f.isAbstract,
          }),
          className: f.className,
        }));

        set({
          isCompiling: true,
          consoleOutput: ['> Compiling and running Java...'],
          inputMode: 'idle' as InputMode,
          pendingInputs: [],
        });

        try {
          const res = await fetch('/api/compile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ files: javaFiles, mainClass: className, inputs }),
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
          let message: string;
          if (err instanceof TypeError && err.message.includes('fetch')) {
            message = 'Cannot connect to server. Make sure the dev server is running.';
          } else if (
            err instanceof Error &&
            (err.message.includes('NetworkError') || err.message.includes('Failed to fetch'))
          ) {
            message = 'Network error — check your internet connection or server status.';
          } else {
            message = err instanceof Error ? err.message : String(err);
          }
          set({ consoleOutput: ['> Failed to reach compile server:', message] });
          toast.addToast('Failed to compile', 'error');
        } finally {
          set({ isCompiling: false });
        }
      },

      // --- Scanner Input Collection ---
      updatePendingInput: (index, value) => {
        set((state) => ({
          pendingInputs: state.pendingInputs.map((p, i) =>
            i === index ? { ...p, value } : p
          ),
        }));
      },

      submitInputs: () => {
        const { _inputTarget, pendingInputs, nodes, edges, className, files, activeFileId } = get();

        if (_inputTarget === 'script') {
          const syncedFiles = files.map(f =>
            f.id === activeFileId ? { ...f, nodes, edges, className } : f
          );
          let inputIndex = 0;
          const inputProvider = () => {
            const val = pendingInputs[inputIndex]?.value ?? '';
            inputIndex++;
            return val;
          };
          set({
            inputMode: 'running' as InputMode,
            consoleOutput: executeGraph(nodes, edges, inputProvider, syncedFiles),
            pendingInputs: [],
          });
          set({ inputMode: 'idle' as InputMode });
        } else {
          // Java compile path — re-enter compileAndRunJava with inputMode='running'
          set({ inputMode: 'running' as InputMode });
          get().compileAndRunJava();
        }
      },

      cancelInputs: () => {
        set({
          pendingInputs: [],
          inputMode: 'idle' as InputMode,
          consoleOutput: ['> Input cancelled.'],
        });
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

      // --- Copy / Paste / Duplicate / Group ---
      copySelection: () => {
        const { nodes, edges } = get();
        const selectedNodes = nodes.filter(n => n.selected);
        if (selectedNodes.length === 0) return;
        const selectedIds = new Set(selectedNodes.map(n => n.id));
        const connectedEdges = edges.filter(e => selectedIds.has(e.source) && selectedIds.has(e.target));
        set({ clipboard: { nodes: selectedNodes, edges: connectedEdges } });
        useToastStore.getState().addToast(`Copied ${selectedNodes.length} node(s)`, 'info');
      },

      pasteClipboard: () => {
        const { clipboard, nodes, edges } = get();
        if (!clipboard || clipboard.nodes.length === 0) return;

        const idMap = new Map<string, string>();
        const ts = Date.now();
        clipboard.nodes.forEach((n, i) => {
          idMap.set(n.id, `paste-${ts}-${i}`);
        });

        const newNodes: Node[] = clipboard.nodes.map((n) => ({
          ...n,
          id: idMap.get(n.id)!,
          position: { x: n.position.x + 40, y: n.position.y + 40 },
          selected: true,
          data: { ...n.data },
          parentId: undefined,
        }));

        const newEdges: Edge[] = clipboard.edges.map((e, i) => ({
          ...e,
          id: `pe-${ts}-${i}`,
          source: idMap.get(e.source) || e.source,
          target: idMap.get(e.target) || e.target,
        }));

        // Deselect existing nodes
        const deselected = nodes.map(n => ({ ...n, selected: false }));

        set({
          nodes: [...deselected, ...newNodes],
          edges: [...edges, ...newEdges],
        });
        useToastStore.getState().addToast(`Pasted ${newNodes.length} node(s)`, 'info');
      },

      duplicateSelection: () => {
        // Copy then immediately paste
        get().copySelection();
        get().pasteClipboard();
      },

      groupSelection: () => {
        const { nodes } = get();
        const selectedNodes = nodes.filter(n => n.selected && n.type !== 'group');
        if (selectedNodes.length === 0) return;

        // Compute bounding box of selected nodes
        const padding = 40;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const n of selectedNodes) {
          const w = n.measured?.width ?? 200;
          const h = n.measured?.height ?? 100;
          minX = Math.min(minX, n.position.x);
          minY = Math.min(minY, n.position.y);
          maxX = Math.max(maxX, n.position.x + w);
          maxY = Math.max(maxY, n.position.y + h);
        }

        const groupId = `group-${Date.now()}`;
        const groupNode: Node = {
          id: groupId,
          type: 'group',
          position: { x: minX - padding, y: minY - padding + 30 },
          data: { label: 'Group', color: '#6366f1' },
          style: {
            width: maxX - minX + padding * 2,
            height: maxY - minY + padding * 2,
          },
          zIndex: -1,
        };

        set((state) => ({
          nodes: [groupNode, ...state.nodes],
        }));
        useToastStore.getState().addToast('Group created', 'success');
      },

      // --- Context Menu ---
      setMenuVisible: (visible) => set({ menuVisible: visible }),
      setMenuPosition: (pos) => set({ menuPosition: pos }),

      // --- Class Name ---
      setClassName: (name) => set({ className: name }),

      // --- Persistence ---
      saveNodeGraph: () => {
        const { _rfInstance, className, files, activeFileId, nodes, edges } = get();
        const viewport = _rfInstance ? _rfInstance.toObject().viewport : undefined;
        // Sync active file before saving
        const allFiles = files.map(f =>
          f.id === activeFileId ? { ...f, nodes, edges, className } : f
        );
        const payload = { version: 3, activeFileId, files: allFiles, viewport, savedAt: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        set((state) => ({
          files: allFiles,
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
              if (flow.version === 3 && flow.files) {
                // v3: multi-file
                const activeId = flow.activeFileId || flow.files[0]?.id || 'main';
                const activeFile = flow.files.find((f: ProjectFile) => f.id === activeId) || flow.files[0];
                set({
                  files: flow.files,
                  activeFileId: activeId,
                  nodes: activeFile?.nodes || [],
                  edges: activeFile?.edges || [],
                  className: activeFile?.className || 'VisualScript',
                  consoleOutput: ['> Nodegraph loaded successfully'],
                });
              } else {
                // Migrate v1/v2 to v3
                const nodes = flow.nodes || [];
                const edgesArr = flow.edges || [];
                const cls = flow.className || 'VisualScript';
                const mainFile: ProjectFile = { id: 'main', className: cls, nodes, edges: edgesArr };
                set({
                  files: [mainFile],
                  activeFileId: 'main',
                  nodes,
                  edges: edgesArr,
                  className: cls,
                  consoleOutput: ['> Nodegraph loaded successfully (migrated to v3)'],
                });
              }
              useToastStore.getState().addToast('Project loaded', 'info');
            }
          } catch (e) {
            console.error('Failed to load graph:', e);
            useToastStore.getState().addToast('Failed to load project', 'error');
          }
        }
      },

      exportToFile: () => {
        const { _rfInstance, className, files, activeFileId, nodes, edges } = get();
        const viewport = _rfInstance ? _rfInstance.toObject().viewport : undefined;
        const allFiles = files.map(f =>
          f.id === activeFileId ? { ...f, nodes, edges, className } : f
        );
        const payload = { version: 3, activeFileId, files: allFiles, viewport, savedAt: new Date().toISOString() };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `jflow-project.json`;
        a.click();
        URL.revokeObjectURL(url);
        useToastStore.getState().addToast('Project exported', 'success');
      },

      exportToJava: () => {
        const { files, activeFileId, nodes, edges, className } = get();
        // Export all files
        const allFiles = files.map(f =>
          f.id === activeFileId ? { ...f, nodes, edges, className } : f
        );
        const projectClasses = buildProjectClasses(allFiles, '', [], [], '');
        allFiles.forEach(f => {
          const code = generateJavaCode(f.nodes, f.edges, f.className, projectClasses, {
            classType: f.classType,
            extendsClass: f.extendsClass,
            implementsInterfaces: f.implementsInterfaces,
            isAbstract: f.isAbstract,
          });
          const blob = new Blob([code], { type: 'text/x-java-source' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${f.className || 'VisualScript'}.java`;
          a.click();
          URL.revokeObjectURL(url);
        });
        useToastStore.getState().addToast(`Exported ${allFiles.length} Java file(s)`, 'success');
      },

      importFromFile: (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const flow = JSON.parse(e.target?.result as string);
            if (flow) {
              if (flow.version === 3 && flow.files) {
                const activeId = flow.activeFileId || flow.files[0]?.id || 'main';
                const activeFile = flow.files.find((f: ProjectFile) => f.id === activeId) || flow.files[0];
                set({
                  files: flow.files,
                  activeFileId: activeId,
                  nodes: activeFile?.nodes || [],
                  edges: activeFile?.edges || [],
                  className: activeFile?.className || 'VisualScript',
                  consoleOutput: ['> Project imported from file'],
                });
              } else if (flow.nodes) {
                const mainFile: ProjectFile = { id: 'main', className: flow.className || 'VisualScript', nodes: flow.nodes, edges: flow.edges || [] };
                set({
                  files: [mainFile],
                  activeFileId: 'main',
                  nodes: flow.nodes,
                  edges: flow.edges || [],
                  className: flow.className || 'VisualScript',
                  consoleOutput: ['> Project imported from file'],
                });
              }
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

      // --- Multi-file ---
      addFile: (name, classType = 'class') => {
        const id = `file-${Date.now()}`;
        const className = name || `Class${get().files.length + 1}`;
        set((state) => ({
          files: [...state.files, { id, className, classType, nodes: [], edges: [] }],
        }));
        get().switchFile(id);
        useToastStore.getState().addToast(`Created ${className}.java`, 'success');
      },

      removeFile: (fileId) => {
        const { files, activeFileId } = get();
        if (files.length <= 1) return;
        const removed = files.find(f => f.id === fileId);
        const remaining = files.filter(f => f.id !== fileId);
        set({ files: remaining });
        if (activeFileId === fileId) {
          get().switchFile(remaining[0].id);
        }
        if (removed) useToastStore.getState().addToast(`Deleted ${removed.className}.java`, 'info');
      },

      switchFile: (fileId) => {
        const { activeFileId, files, nodes, edges, className } = get();
        if (fileId === activeFileId) return;
        // Save current file state
        const updatedFiles = files.map(f =>
          f.id === activeFileId ? { ...f, nodes, edges, className } : f
        );
        const newFile = updatedFiles.find(f => f.id === fileId);
        if (!newFile) return;
        set({
          files: updatedFiles,
          activeFileId: fileId,
          nodes: newFile.nodes,
          edges: newFile.edges,
          className: newFile.className,
        });
      },

      renameFile: (fileId, newName) => {
        set((state) => ({
          files: state.files.map(f => f.id === fileId ? { ...f, className: newName } : f),
          ...(state.activeFileId === fileId ? { className: newName } : {}),
        }));
      },

      updateClassMetadata: (fileId, meta) => {
        set((state) => ({
          files: state.files.map(f => f.id === fileId ? { ...f, ...meta } : f),
        }));
      },

      // --- Templates ---
      loadTemplate: (template) => {
        if (template.files && template.files.length > 0) {
          const newFiles: ProjectFile[] = template.files.map((f, idx) => ({
            id: `file-${Date.now()}-${idx}`,
            className: f.className,
            classType: f.classType || 'class',
            extendsClass: f.extendsClass,
            implementsInterfaces: f.implementsInterfaces,
            nodes: f.nodes,
            edges: f.edges,
          }));
          set({
            files: newFiles,
            activeFileId: newFiles[0].id,
            nodes: newFiles[0].nodes,
            edges: newFiles[0].edges,
            className: newFiles[0].className,
          });
          useToastStore.getState().addToast(`Loaded template with ${newFiles.length} files`, 'success');
        } else {
          set({
            nodes: template.nodes,
            edges: template.edges,
            className: template.className,
          });
        }
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
