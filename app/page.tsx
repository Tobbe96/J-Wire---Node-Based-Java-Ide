'use client';
import React from 'react';
import { ReactFlow, Background, Controls, ReactFlowProvider } from '@xyflow/react';
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
import ReturnNode from './components/Nodes/ReturnNode';
import SetLocalVarNode from './components/Nodes/SetLocalVarNode';
import SetVariableNode from './components/Nodes/SetVariableNode';
import VariableGetterNode from './components/Nodes/VariableGetterNode';

// Panels & UI
import LeftSidebar from './components/Panels/LeftSidebar';
import LivePreview from './components/LivePreview';
import Terminal from './components/Panels/Terminal';
import NodeBrowser from './components/NodeBrowse';
import ErrorBoundary from './components/ErrorBoundary';

// Hooks
import { useContextMenu } from './utils/useContextMenu';
import { useFlowEditor } from './utils/useFlowEditor';

const nodeTypes = {
  java: JavaNode,
  print: PrintNode,
  method: MethodNode,
  math: MathNode,
  main: MainNode,
  callMethod: CallMethodNode,
  branch: BranchNode,
  while: WhileNode,
  return: ReturnNode,
  getter: VariableGetterNode,
  setLocalVar: SetLocalVarNode,
  setVar: SetVariableNode,
};

function JavaNodeEditor() {
  const menu = useContextMenu();
  const editor = useFlowEditor(menu);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#121212', display: 'flex', overflow: 'hidden' }}>
      <ErrorBoundary fallbackLabel="Sidebar">
        <LeftSidebar
          nodes={editor.nodes}
          selectedNodeId={editor.selectedSidebarNodeId}
          onSelectNode={editor.setSelectedSidebarNodeId}
          onSave={editor.saveNodeGraph}
          onLoad={editor.loadNodeGraph}
          updateNodeModifier={editor.updateNodeModifier}
          updateNodeData={editor.updateNodeData}
          onAddGetter={editor.onAddGetter}
        />
      </ErrorBoundary>

      <div style={{ flexGrow: 1, position: 'relative' }}>
        <ErrorBoundary fallbackLabel="Canvas">
          <ReactFlow
            nodes={editor.enrichedNodes}
            edges={editor.edges}
            nodeTypes={nodeTypes}
            onNodesChange={editor.onNodesChange}
            onEdgesChange={editor.onEdgesChange}
            onConnect={editor.onConnect}
            onConnectStart={editor.onConnectStart}
            onConnectEnd={editor.onConnectEnd}
            onPaneClick={editor.onPaneClick}
            onSelectionChange={editor.onSelectionChange}
            isValidConnection={editor.validateConnection}
            deleteKeyCode={['Backspace', 'Delete']}
            fitView
          >
            <Background color="#333" gap={20} />
            <Controls />
          </ReactFlow>
        </ErrorBoundary>

        {menu.menuVisible && (
          <NodeBrowser
            position={menu.menuPosition}
            onAddNode={editor.addNodeAndConnect}
            onClose={() => menu.setMenuVisible(false)}
          />
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', width: '350px', borderLeft: '1px solid #000', zIndex: 10 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <ErrorBoundary fallbackLabel="Preview">
            <LivePreview code={editor.generatedJavaCode} />
          </ErrorBoundary>
        </div>

        <ErrorBoundary fallbackLabel="Terminal">
          <Terminal consoleOutput={editor.consoleOutput} onRun={editor.runScript} />
        </ErrorBoundary>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <JavaNodeEditor />
    </ReactFlowProvider>
  );
}