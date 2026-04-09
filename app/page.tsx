'use client';
import React, { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import { ReactFlow, Background, Controls, MiniMap, ReactFlowProvider, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Node Components
import JavaNode from './components/JavaNode';
import PrintNode from './components/Nodes/PrintNode';
import MethodNode from './components/Nodes/MethodNode';
import MathNode from './components/Nodes/MathNode';
import MainNode from './components/Nodes/MainNode';
import CallMethodNode from './components/Nodes/CallMethodNode';
import BranchNode from './components/Nodes/BranchNode';
import WhileNode from './components/Nodes/WhileNode';
import ForNode from './components/Nodes/ForNode';
import NotNode from './components/Nodes/NotNode';
import ReturnNode from './components/Nodes/ReturnNode';
import SetLocalVarNode from './components/Nodes/SetLocalVarNode';
import SetVariableNode from './components/Nodes/SetVariableNode';
import VariableGetterNode from './components/Nodes/VariableGetterNode';
import StringOpNode from './components/Nodes/StringOpNode';
import ArrayOpNode from './components/Nodes/ArrayOpNode';
import MathFuncNode from './components/Nodes/MathFuncNode';
import CastNode from './components/Nodes/CastNode';
import TernaryNode from './components/Nodes/TernaryNode';
import DoWhileNode from './components/Nodes/DoWhileNode';
import SwitchNode from './components/Nodes/SwitchNode';
import BreakNode from './components/Nodes/BreakNode';
import ContinueNode from './components/Nodes/ContinueNode';

// Panels & UI
import LeftSidebar from './components/Panels/LeftSidebar';
import LivePreview from './components/LivePreview';
import Terminal from './components/Panels/Terminal';
import NodeBrowser from './components/NodeBrowse';
import ErrorBoundary from './components/ErrorBoundary';
import { Toast } from './components/Toast';
import ThemeToggle from './components/ThemeToggle';
import DocsModal from './components/DocsModal';
import DebugPanel from './components/DebugPanel';

// Store
import { useEditorStore } from './store/editorStore';
import { useDebugStore } from './store/debugStore';
import { getTypeColor } from './utils/theme';

const nodeTypes = {
  java: JavaNode,
  print: PrintNode,
  method: MethodNode,
  math: MathNode,
  main: MainNode,
  callMethod: CallMethodNode,
  branch: BranchNode,
  while: WhileNode,
  for: ForNode,
  not: NotNode,
  return: ReturnNode,
  getter: VariableGetterNode,
  setLocalVar: SetLocalVarNode,
  setVar: SetVariableNode,
  stringOp: StringOpNode,
  arrayOp: ArrayOpNode,
  mathFunc: MathFuncNode,
  cast: CastNode,
  ternary: TernaryNode,
  doWhile: DoWhileNode,
  switch: SwitchNode,
  break: BreakNode,
  continue: ContinueNode,
};

function JavaNodeEditor() {
  const {
    nodes,
    edges,
    consoleOutput,
    selectedSidebarNodeId,
    className,
    menuVisible,
    menuPosition,
    isCompiling,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onSelectionChange,
    validateConnection,
    runScript,
    saveNodeGraph,
    loadNodeGraph,
    exportToFile,
    importFromFile,
    updateNodeData,
    updateNodeModifier,
    addGetter,
    setSelectedSidebarNodeId,
    setClassName,
    setMenuVisible,
    setMenuPosition,
    setRfInstance,
    autoLayout,
    addNodeAndConnect,
    getGeneratedCode,
    compileAndRunJava,
    files,
    activeFileId,
    addFile,
    removeFile,
    switchFile,
    renameFile,
  } = useEditorStore();

  const { isDebugging, currentStepIndex, traceSteps, breakpoints, startDebug, stopDebug, toggleBreakpoint } = useDebugStore();
  const activeDebugNodeId = isDebugging && currentStepIndex >= 0 ? traceSteps[currentStepIndex]?.nodeId : null;

  const { screenToFlowPosition, toObject } = useReactFlow();

  // Bridge React Flow instance into the store
  useEffect(() => {
    setRfInstance({ screenToFlowPosition, toObject });
  }, [screenToFlowPosition, toObject, setRfInstance]);

  // Undo/Redo from zundo temporal store
  const { undo, redo } = useEditorStore.temporal.getState();

  // Load on mount
  useEffect(() => { loadNodeGraph(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard shortcuts
  const mousePos = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => { mousePos.current = { x: e.clientX, y: e.clientY }; };
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = (e.target as HTMLElement).tagName === 'INPUT' ||
                      (e.target as HTMLElement).tagName === 'TEXTAREA' ||
                      (e.target as HTMLElement).tagName === 'SELECT';

      if (e.key === 'Tab' && !isInput) {
        e.preventDefault();
        e.stopPropagation();
        if (menuVisible) {
          setMenuVisible(false);
        } else {
          setMenuPosition(mousePos.current);
          setMenuVisible(true);
        }
      }
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
        if (e.key === 'z' && e.shiftKey) { e.preventDefault(); redo(); }
        if (e.key === 'y') { e.preventDefault(); redo(); }
        if (e.key === 's') { e.preventDefault(); saveNodeGraph(); }
      }
      if (e.key === 'Escape') { setMenuVisible(false); setSelectedSidebarNodeId(null); }
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [menuVisible, setMenuPosition, setMenuVisible, undo, redo, saveNodeGraph, setSelectedSidebarNodeId]);

  // Connection drag state
  const dragConnectStart = useRef<{ nodeId: string; handleId: string } | null>(null);
  const lastConnectEnd = useRef<number>(0);
  const [connectionLineColor, setConnectionLineColor] = useState('#fff');
  const [showDocs, setShowDocs] = useState(false);

  const handleDebugToggle = useCallback(() => {
    if (isDebugging) {
      stopDebug();
    } else {
      startDebug(nodes, edges);
    }
  }, [isDebugging, stopDebug, startDebug, nodes, edges]);

  const onNodeDoubleClick = useCallback((_: React.MouseEvent, node: { id: string }) => {
    toggleBreakpoint(node.id);
  }, [toggleBreakpoint]);

  const onConnectStart = useCallback((_: unknown, { nodeId, handleId }: { nodeId: string | null; handleId: string | null }) => {
    if (nodeId && handleId) {
      dragConnectStart.current = { nodeId, handleId };
      if (handleId.includes('exec')) {
        setConnectionLineColor('#fff');
      } else {
        const sourceNode = nodes.find(n => n.id === nodeId);
        const type = sourceNode?.data?.type as string | undefined;
        setConnectionLineColor(type ? getTypeColor(type) : '#888');
      }
    }
  }, [nodes]);

  const onConnectEnd = useCallback((event: MouseEvent | TouchEvent) => {
    if (!dragConnectStart.current) return;
    const target = event.target as HTMLElement;
    if (target.closest('.react-flow__node')) { dragConnectStart.current = null; return; }
    lastConnectEnd.current = Date.now();
    const x = 'clientX' in event ? event.clientX : event.touches?.[0]?.clientX ?? 0;
    const y = 'clientY' in event ? event.clientY : event.touches?.[0]?.clientY ?? 0;
    setMenuPosition({ x, y });
    setMenuVisible(true);
  }, [setMenuPosition, setMenuVisible]);

  const onPaneClick = useCallback(() => {
    if (Date.now() - lastConnectEnd.current < 100) return;
    setMenuVisible(false);
    dragConnectStart.current = null;
    setSelectedSidebarNodeId(null);
  }, [setMenuVisible, setSelectedSidebarNodeId]);

  const handleAddNodeAndConnect = useCallback((nodeKind: string) => {
    if (dragConnectStart.current) {
      addNodeAndConnect(nodeKind, dragConnectStart.current.nodeId, dragConnectStart.current.handleId);
      dragConnectStart.current = null;
    } else {
      // No drag — just add node at menu position
      const config = useEditorStore.getState();
      const flowPos = screenToFlowPosition(config.menuPosition);
      useEditorStore.getState().addNode(nodeKind, flowPos);
      setMenuVisible(false);
    }
  }, [addNodeAndConnect, screenToFlowPosition, setMenuVisible]);

  // Enrich nodes with callbacks + debug state
  const enrichedNodes = useMemo(() => {
    const methodNodes = nodes.filter(n => n.type === 'method');
    return nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        updateNodeData,
        isValidConnection: validateConnection,
        methodNodes,
      },
      style: {
        ...(node.style || {}),
        ...(activeDebugNodeId === node.id
          ? { boxShadow: '0 0 20px 6px #fbbf24', outline: '2px solid #fbbf24', borderRadius: 8, transition: 'box-shadow 0.2s' }
          : {}),
        ...(breakpoints.includes(node.id)
          ? { outline: '2px solid #ef4444', borderRadius: 8 }
          : {}),
      },
    }));
  }, [nodes, updateNodeData, validateConnection, activeDebugNodeId, breakpoints]);

  const generatedJavaCode = useMemo(() => getGeneratedCode(), [getGeneratedCode, nodes, edges, className]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#121212', display: 'flex', overflow: 'hidden' }}>
      <ErrorBoundary fallbackLabel="Sidebar">
        <LeftSidebar
          nodes={nodes}
          selectedNodeId={selectedSidebarNodeId}
          onSelectNode={setSelectedSidebarNodeId}
          onSave={saveNodeGraph}
          onLoad={loadNodeGraph}
          onExport={exportToFile}
          onImport={importFromFile}
          updateNodeModifier={updateNodeModifier}
          updateNodeData={updateNodeData}
          onAddGetter={addGetter}
          className={className}
          onClassNameChange={setClassName}
          files={files}
          activeFileId={activeFileId}
          onSwitchFile={switchFile}
          onAddFile={addFile}
          onRemoveFile={removeFile}
          onRenameFile={renameFile}
        />
      </ErrorBoundary>

      <div style={{ flexGrow: 1, position: 'relative' }}>
        <ThemeToggle />
        <button
          onClick={autoLayout}
          style={{ position: 'absolute', top: 10, right: 90, zIndex: 20, background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '11px', cursor: 'pointer', fontWeight: 700 }}
        >
          Auto Layout
        </button>
        <button
          onClick={() => setShowDocs(true)}
          title="Help / Documentation"
          style={{ position: 'absolute', top: 10, right: 50, zIndex: 20, background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '6px', padding: '6px 10px', fontSize: '13px', cursor: 'pointer', fontWeight: 700, lineHeight: 1 }}
        >
          ?
        </button>
        <ErrorBoundary fallbackLabel="Canvas">
          <ReactFlow
            nodes={enrichedNodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onConnectStart={onConnectStart}
            onConnectEnd={onConnectEnd}
            onPaneClick={onPaneClick}
            onSelectionChange={onSelectionChange}
            onNodeDoubleClick={onNodeDoubleClick}
            isValidConnection={validateConnection}
            connectionLineStyle={{ stroke: connectionLineColor, strokeWidth: 2 }}
            deleteKeyCode={['Backspace', 'Delete']}
            fitView
          >
            <Background color="#333" gap={20} />
            <Controls />
            <MiniMap
              nodeColor={(n) => {
                if (n.type === 'main') return '#e74c3c';
                if (n.type === 'method') return '#9b59b6';
                if (n.type === 'java') return '#2ecc71';
                if (n.type === 'print') return '#3498db';
                return '#666';
              }}
              maskColor="rgba(0,0,0,0.7)"
              style={{ background: '#1a1a1a', border: '1px solid #333' }}
            />
          </ReactFlow>
        </ErrorBoundary>

        {menuVisible && (
          <NodeBrowser
            position={menuPosition}
            onAddNode={handleAddNodeAndConnect}
            onClose={() => setMenuVisible(false)}
          />
        )}

        <DebugPanel />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', width: '350px', borderLeft: '1px solid #000', zIndex: 10 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <ErrorBoundary fallbackLabel="Preview">
            <LivePreview code={generatedJavaCode} />
          </ErrorBoundary>
        </div>

        <ErrorBoundary fallbackLabel="Terminal">
          <Terminal
            consoleOutput={consoleOutput}
            onRun={runScript}
            onRunJava={compileAndRunJava}
            onDebug={handleDebugToggle}
            isCompiling={isCompiling}
            isDebugging={isDebugging}
          />
        </ErrorBoundary>
      </div>

      {showDocs && <DocsModal onClose={() => setShowDocs(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <JavaNodeEditor />
      <Toast />
    </ReactFlowProvider>
  );
}