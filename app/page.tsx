'use client';
import React, { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import { ReactFlow, Background, Controls, MiniMap, ReactFlowProvider, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Node & Edge type registries (complete)
import { nodeTypes, edgeTypes } from './utils/nodeTypeMap';

// Panels & UI
import LeftSidebar from './components/Panels/LeftSidebar';
import LivePreview from './components/LivePreview';
import Terminal from './components/Panels/Terminal';
import NodeBrowser from './components/NodeBrowse';
import ContextMenu from './components/ContextMenu';
import ErrorBoundary from './components/ErrorBoundary';
import { Toast } from './components/Toast';
import ThemeToggle from './components/ThemeToggle';
import VfxToggle from './components/VfxToggle';
import DocsModal from './components/DocsModal';
import DebugPanel from './components/DebugPanel';

// VFX
import AmbientParticles from './components/vfx/AmbientParticles';
import ConnectionSpark from './components/vfx/ConnectionSpark';
import CanvasRipple from './components/vfx/CanvasRipple';

// Store
import { useEditorStore } from './store/editorStore';
import { useDebugStore } from './store/debugStore';
import { useVfxStore } from './store/vfxStore';
import { useThemeStore } from './store/themeStore';

// Hooks
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useConnectionHandlers } from './hooks/useConnectionHandlers';

// Utilities
import { getCompatibleNodeKinds } from './utils/validation';

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
    loadTemplate,
    copySelection,
    pasteClipboard,
    duplicateSelection,
    groupSelection,
  } = useEditorStore();

  const { isDebugging, currentStepIndex, traceSteps, breakpoints, startDebug, stopDebug, toggleBreakpoint } = useDebugStore();
  const activeDebugNodeId = isDebugging && currentStepIndex >= 0 ? traceSteps[currentStepIndex]?.nodeId : null;
  const vfxEnabled = useVfxStore((s) => s.vfxEnabled);
  const { theme } = useThemeStore();
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const { screenToFlowPosition, toObject } = useReactFlow();

  // Bridge React Flow instance into the store
  useEffect(() => {
    setRfInstance({ screenToFlowPosition, toObject });
  }, [screenToFlowPosition, toObject, setRfInstance]);

  // Undo/Redo from zundo temporal store
  const { undo, redo } = useEditorStore.temporal.getState();

  // Load on mount
  useEffect(() => { loadNodeGraph(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Keyboard shortcuts (replaces inline useEffect) ──────────────────────
  useKeyboardShortcuts({
    menuVisible,
    setMenuVisible,
    setMenuPosition,
    setSelectedSidebarNodeId,
    undo,
    redo,
    saveNodeGraph,
    copySelection,
    pasteClipboard,
    duplicateSelection,
    groupSelection,
  });

  // ── Connection drag handlers (replaces inline logic) ─────────────────────
  const {
    connectionLineColor,
    onConnectStart,
    onConnectEnd,
    onPaneClick,
    handleConnect,
    dragConnectStart,
  } = useConnectionHandlers({
    nodes,
    onConnect,
    vfxEnabled,
    setMenuPosition,
    setMenuVisible,
    setSelectedSidebarNodeId,
  });

  // ── Context menu state ────────────────────────────────────────────────────
  const [contextMenu, setContextMenu] = useState<{
    x: number; y: number; type: 'node' | 'pane'; nodeId?: string;
  } | null>(null);

  const [showDocs, setShowDocs] = useState(false);

  const handleDebugToggle = useCallback(() => {
    if (isDebugging) stopDebug();
    else startDebug(nodes, edges);
  }, [isDebugging, stopDebug, startDebug, nodes, edges]);

  const onNodeDoubleClick = useCallback((_: React.MouseEvent, node: { id: string }) => {
    toggleBreakpoint(node.id);
  }, [toggleBreakpoint]);

  const onNodeContextMenu = useCallback((e: React.MouseEvent, node: { id: string }) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, type: 'node', nodeId: node.id });
  }, []);

  const onPaneContextMenu = useCallback((e: React.MouseEvent | MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: (e as React.MouseEvent).clientX, y: (e as React.MouseEvent).clientY, type: 'pane' });
  }, []);

  const handleDeleteSelected = useCallback(() => {
    const removeChanges = nodes
      .filter(n => n.selected)
      .map(n => ({ id: n.id, type: 'remove' as const }));
    if (removeChanges.length) onNodesChange(removeChanges);
  }, [nodes, onNodesChange]);

  const handleSelectAll = useCallback(() => {
    onNodesChange(nodes.map(n => ({ id: n.id, type: 'select' as const, selected: true })));
  }, [nodes, onNodesChange]);

  // ── Connection-aware NodeBrowser filtering ────────────────────────────────
  const compatibleKinds = useMemo(() => {
    if (!dragConnectStart || !menuVisible) return undefined;
    const sourceNode = nodes.find(n => n.id === dragConnectStart.nodeId);
    if (!sourceNode) return undefined;
    return getCompatibleNodeKinds(sourceNode, dragConnectStart.handleId, nodes);
  }, [menuVisible, nodes, dragConnectStart]);

  const handleAddNodeAndConnect = useCallback((nodeKind: string) => {
    if (dragConnectStart) {
      addNodeAndConnect(nodeKind, dragConnectStart.nodeId, dragConnectStart.handleId);
    } else {
      const flowPos = screenToFlowPosition(useEditorStore.getState().menuPosition);
      useEditorStore.getState().addNode(nodeKind, flowPos);
      setMenuVisible(false);
    }
  }, [addNodeAndConnect, screenToFlowPosition, setMenuVisible, dragConnectStart]);

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
      data-theme={theme}
      role="application"
      style={{ width: '100vw', height: '100vh', background: 'var(--jf-canvas-bg)', position: 'relative', overflow: 'hidden' }}
    >
      {vfxEnabled && <AmbientParticles />}

      <div style={{ display: 'flex', width: '100%', height: '100%', position: 'relative', zIndex: 1 }}>
      <aside aria-label="Project sidebar">
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
          onLoadTemplate={loadTemplate}
        />
      </ErrorBoundary>
      </aside>

      <main aria-label="Flow canvas">
      <div ref={canvasContainerRef} style={{ flexGrow: 1, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 10, right: 290, zIndex: 20, display: 'flex', gap: 6 }}>
          <ThemeToggle />
          <VfxToggle />
        </div>
        <button
          onClick={autoLayout}
          aria-label="Auto layout nodes"
          style={{ position: 'absolute', top: 10, right: 170, zIndex: 20, background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '11px', cursor: 'pointer', fontWeight: 700 }}
        >
          Auto Layout
        </button>
        <button
          onClick={() => setShowDocs(true)}
          title="Help / Documentation"
          aria-label="Open documentation"
          style={{ position: 'absolute', top: 10, right: 50, zIndex: 20, background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '6px', padding: '6px 10px', fontSize: '13px', cursor: 'pointer', fontWeight: 700, lineHeight: 1 }}
        >
          ?
        </button>

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
            onPaneContextMenu={onPaneContextMenu}
            onSelectionChange={onSelectionChange}
            onNodeDoubleClick={onNodeDoubleClick}
            onNodeContextMenu={onNodeContextMenu}
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
              style={{ background: 'var(--jf-minimap-bg)', border: '1px solid var(--jf-panel-border)' }}
            />
          </ReactFlow>
        </ErrorBoundary>

        {menuVisible && (
          <NodeBrowser
            position={menuPosition}
            onAddNode={handleAddNodeAndConnect}
            onClose={() => setMenuVisible(false)}
            compatibleKinds={compatibleKinds}
          />
        )}

        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            type={contextMenu.type}
            onClose={() => setContextMenu(null)}
            onCopy={copySelection}
            onDuplicate={duplicateSelection}
            onDelete={handleDeleteSelected}
            onPaste={pasteClipboard}
            onSelectAll={handleSelectAll}
            onOpenNodeBrowser={() => {
              setMenuPosition({ x: contextMenu.x, y: contextMenu.y });
              setMenuVisible(true);
            }}
          />
        )}

        <DebugPanel />
        <ConnectionSpark />
      </div>
      </main>

      <aside aria-label="Code preview and terminal">
      <div style={{ display: 'flex', flexDirection: 'column', width: '350px', borderLeft: '1px solid #000' }}>
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
      </aside>

      {showDocs && <DocsModal onClose={() => setShowDocs(false)} />}
    </div>
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
