'use client';
import React, { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import { ReactFlow, Background, Controls, MiniMap, ReactFlowProvider, useReactFlow, SelectionMode } from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import type { Parameter } from './utils/nodeTypes';
import '@xyflow/react/dist/style.css';

// Panels & UI
import LeftSidebar from './components/Panels/LeftSidebar';
import LivePreview from './components/LivePreview';
import Terminal from './components/Panels/Terminal';
import NodeBrowser from './components/NodeBrowse';
import ErrorBoundary from './components/ErrorBoundary';
import { Toast } from './components/Toast';
import ThemeToggle from './components/ThemeToggle';
import VfxToggle from './components/VfxToggle';
import DocsModal from './components/DocsModal';
import DebugPanel from './components/DebugPanel';
import ResizeHandle from './components/ResizeHandle';

// VFX
import AmbientParticles from './components/vfx/AmbientParticles';
import ConnectionSpark from './components/vfx/ConnectionSpark';
import CanvasRipple from './components/vfx/CanvasRipple';

// Store
import { useEditorStore } from './store/editorStore';
import { useDebugStore } from './store/debugStore';
import { useVfxStore } from './store/vfxStore';
import { getTypeColor } from './utils/theme';

// Extracted modules
import { nodeTypes, edgeTypes } from './utils/nodeTypeMap';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useConnectionHandlers } from './hooks/useConnectionHandlers';

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
    copySelection,
    pasteClipboard,
    duplicateSelection,
    groupSelection,
  } = useEditorStore();

  const { isDebugging, currentStepIndex, traceSteps, breakpoints, startDebug, stopDebug, toggleBreakpoint } = useDebugStore();
  const activeDebugNodeId = isDebugging && currentStepIndex >= 0 ? traceSteps[currentStepIndex]?.nodeId : null;
  const vfxEnabled = useVfxStore((s) => s.vfxEnabled);
  const hydrateVfx = useVfxStore((s) => s.hydrate);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const { screenToFlowPosition, toObject } = useReactFlow();

  // Bridge React Flow instance into the store
  useEffect(() => {
    setRfInstance({ screenToFlowPosition, toObject });
  }, [screenToFlowPosition, toObject, setRfInstance]);

  // Undo/Redo from zundo temporal store
  const { undo, redo } = useEditorStore.temporal.getState();

  // Load on mount
  useEffect(() => { loadNodeGraph(); hydrateVfx(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard shortcuts (extracted hook)
  useKeyboardShortcuts({
    menuVisible, setMenuVisible, setMenuPosition, setSelectedSidebarNodeId,
    undo, redo, saveNodeGraph, copySelection, pasteClipboard, duplicateSelection, groupSelection,
  });

  // Connection handling (extracted hook)
  const {
    connectionLineColor, onConnectStart, onConnectEnd, onPaneClick, handleConnect, dragConnectStart,
  } = useConnectionHandlers({
    nodes, onConnect, vfxEnabled, setMenuPosition, setMenuVisible, setSelectedSidebarNodeId,
  });

  const [showDocs, setShowDocs] = useState(false);

  // Resizable panel dimensions
  const [leftWidth, setLeftWidth] = useState(240);
  const [rightWidth, setRightWidth] = useState(350);
  const [terminalHeight, setTerminalHeight] = useState(250);

  const onResizeLeft = useCallback((delta: number) => {
    setLeftWidth((w) => Math.max(160, Math.min(500, w + delta)));
  }, []);
  const onResizeRight = useCallback((delta: number) => {
    setRightWidth((w) => Math.max(250, Math.min(600, w - delta)));
  }, []);
  const onResizeTerminal = useCallback((delta: number) => {
    setTerminalHeight((h) => Math.max(120, Math.min(500, h - delta)));
  }, []);

  const handleDebugToggle = useCallback(() => {
    if (isDebugging) {
      stopDebug();
    } else {
      startDebug(nodes, edges);
    }
  }, [isDebugging, stopDebug, startDebug, nodes, edges]);

  const handleLoadTemplate = useCallback((tplNodes: Node[], tplEdges: Edge[]) => {
    useEditorStore.setState({ nodes: tplNodes, edges: tplEdges });
  }, []);

  const onNodeDoubleClick = useCallback((_: React.MouseEvent, node: { id: string }) => {
    toggleBreakpoint(node.id);
  }, [toggleBreakpoint]);

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

  // Enrich nodes with callbacks + debug state + cross-class info
  const enrichedNodes = useMemo(() => {
    const methodNodes = nodes.filter(n => n.type === 'method');

    // Build projectFiles for cross-class method calls (sync current file state)
    const allFilesSync = files.map(f =>
      f.id === activeFileId ? { ...f, nodes, edges, className } : f
    );
    const projectFiles = allFilesSync
      .filter(f => f.id !== activeFileId)
      .map(f => ({
        id: f.id,
        className: f.className,
        methods: f.nodes
          .filter((n: Node) => n.type === 'method')
          .map((m: Node) => ({
            name: m.data.label as string,
            returnType: (m.data.returnType as string) || 'void',
            parameters: (m.data.parameters as Parameter[]) || [],
          })),
      }));

    return nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        updateNodeData,
        isValidConnection: validateConnection,
        methodNodes,
        projectFiles,
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
  }, [nodes, edges, updateNodeData, validateConnection, activeDebugNodeId, breakpoints, files, activeFileId, className]);

  // Enrich edges with animated type when VFX enabled
  const enrichedEdges = useMemo(() => {
    if (!vfxEnabled) return edges;
    return edges.map((edge) => ({
      ...edge,
      type: 'animated',
    }));
  }, [edges, vfxEnabled]);

  const generatedJavaCode = useMemo(() => getGeneratedCode(), [getGeneratedCode, nodes, edges, className]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      data-vfx={vfxEnabled ? 'on' : 'off'}
      style={{ width: '100vw', height: '100vh', background: '#121212', display: 'flex', overflow: 'hidden' }}
    >
      {vfxEnabled && <AmbientParticles />}
      <ErrorBoundary fallbackLabel="Sidebar">
        <LeftSidebar
          nodes={nodes}
          edges={edges}
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
          onLoadTemplate={handleLoadTemplate}
          width={leftWidth}
        />
      </ErrorBoundary>

      <ResizeHandle direction="vertical" onResize={onResizeLeft} />

      <div ref={canvasContainerRef} style={{ flexGrow: 1, position: 'relative' }}>
        <div style={{
          position: 'absolute', top: 10, right: 10, zIndex: 20,
          display: 'flex', gap: 6, alignItems: 'center',
          background: '#1a1a1acc', backdropFilter: 'blur(8px)',
          borderRadius: 8, padding: '4px 6px',
          border: '1px solid #333',
        }}>
          <button
            onClick={autoLayout}
            style={{
              height: 28, borderRadius: 5, border: '1px solid #333',
              cursor: 'pointer', fontSize: 11, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '0 8px', backgroundColor: '#1e1e1e', color: '#3b82f6',
              transition: 'background 0.15s ease, border-color 0.15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2a2a2a'; e.currentTarget.style.borderColor = '#555'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#1e1e1e'; e.currentTarget.style.borderColor = '#333'; }}
          >
            ⊞ Layout
          </button>
          <VfxToggle />
          <ThemeToggle />
          <button
            onClick={() => setShowDocs(true)}
            title="Help / Documentation"
            style={{
              height: 28, width: 28, borderRadius: 5, border: '1px solid #333',
              cursor: 'pointer', fontSize: 11, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 0, backgroundColor: '#1e1e1e', color: '#999',
              transition: 'background 0.15s ease, border-color 0.15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2a2a2a'; e.currentTarget.style.borderColor = '#555'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#1e1e1e'; e.currentTarget.style.borderColor = '#333'; }}
          >
            ?
          </button>
        </div>

        <CanvasRipple containerRef={canvasContainerRef} />

        <ErrorBoundary fallbackLabel="Canvas">
          <ReactFlow
            nodes={enrichedNodes}
            edges={enrichedEdges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={handleConnect}
            onConnectStart={onConnectStart}
            onConnectEnd={onConnectEnd}
            onPaneClick={onPaneClick}
            onSelectionChange={onSelectionChange}
            onNodeDoubleClick={onNodeDoubleClick}
            isValidConnection={validateConnection}
            connectionLineStyle={{ stroke: connectionLineColor, strokeWidth: 2 }}
            deleteKeyCode={['Backspace', 'Delete']}
            selectionOnDrag
            panOnDrag={[1, 2]}
            selectionMode={SelectionMode.Partial}
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
        <ConnectionSpark />
      </div>

      <ResizeHandle direction="vertical" onResize={onResizeRight} />

      <div style={{ display: 'flex', flexDirection: 'column', width: rightWidth, borderLeft: '1px solid #000' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
          <ErrorBoundary fallbackLabel="Preview">
            <LivePreview code={generatedJavaCode} />
          </ErrorBoundary>
        </div>

        <ResizeHandle direction="horizontal" onResize={onResizeTerminal} />

        <ErrorBoundary fallbackLabel="Terminal">
          <Terminal
            consoleOutput={consoleOutput}
            onRun={runScript}
            onRunJava={compileAndRunJava}
            onDebug={handleDebugToggle}
            isCompiling={isCompiling}
            isDebugging={isDebugging}
            height={terminalHeight}
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