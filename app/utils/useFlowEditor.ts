import { useCallback, useState, useEffect, useRef, useMemo } from 'react';
import {
  useEdgesState,
  useNodesState,
  addEdge,
  Connection,
  Edge,
  Node,
  useReactFlow,
  OnSelectionChangeParams,
  IsValidConnection,
} from '@xyflow/react';
import { getTypeColor } from './theme';
import { generateJavaCode } from './compiler';
import { executeGraph } from './executor';
import { NODE_CONFIGS } from './nodeRegistry';
import { usePersistence } from './usePersistence';
import { isValidJavaConnection } from './validation';
import type { ContextMenuState } from './useContextMenu';

function getEdgeStyle(sourceNode: Node | undefined, sourceHandle: string | null) {
  if (!sourceNode || !sourceHandle) return { stroke: '#fff', strokeWidth: 2 };
  if (sourceHandle.includes('exec')) return { stroke: '#fff', strokeWidth: 3, animated: true };
  return { stroke: getTypeColor(sourceNode.data.type as string), strokeWidth: 2 };
}

export function useFlowEditor(menu: ContextMenuState) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [selectedSidebarNodeId, setSelectedSidebarNodeId] = useState<string | null>(null);
  const [className, setClassName] = useState<string>('VisualScript');

  const addLog = useCallback((msg: string) => setConsoleOutput(prev => [...prev, msg]), []);
  const { saveNodeGraph, loadNodeGraph } = usePersistence(setNodes, setEdges, addLog);

  const dragConnectStart = useRef<{ nodeId: string; handleId: string } | null>(null);
  const lastConnectEnd = useRef<number>(0);

  const { screenToFlowPosition, updateNodeData } = useReactFlow();

  // ─── Derived State ───────────────────────────────────────────

  const generatedJavaCode = useMemo(() => generateJavaCode(nodes, edges, className), [nodes, edges, className]);

  const validateConnection: IsValidConnection = useCallback(
    (connection) => isValidJavaConnection(connection as Connection | Edge, nodes),
    [nodes]
  );

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
    }));
  }, [nodes, updateNodeData, validateConnection]);

  // ─── Actions ─────────────────────────────────────────────────

  const onAddGetter = useCallback((variableNode: Node) => {
    setNodes(nds => nds.concat({
      id: `getter-${Date.now()}`,
      type: 'getter',
      position: { x: 400, y: 250 },
      data: {
        label: variableNode.data.label,
        type: variableNode.data.type,
        variableId: variableNode.id,
      },
    }));
  }, [setNodes]);

  const updateNodeModifier = useCallback(
    (id: string, modifier: string) => updateNodeData(id, { modifier }),
    [updateNodeData]
  );

  const runScript = useCallback(() => {
    setConsoleOutput(executeGraph(nodes, edges));
  }, [nodes, edges]);

  // ─── Connection Handlers ─────────────────────────────────────

  const onConnect = useCallback((params: Connection) => setEdges(eds => {
    const sourceNode = nodes.find(n => n.id === params.source);
    const style = getEdgeStyle(sourceNode, params.sourceHandle);
    return addEdge({
      ...params,
      animated: style.animated || false,
      style: { stroke: style.stroke, strokeWidth: style.strokeWidth },
    } as Edge, eds);
  }), [setEdges, nodes]);

  const onConnectStart = useCallback((_: unknown, { nodeId, handleId }: { nodeId: string | null; handleId: string | null }) => {
    if (nodeId && handleId) {
      dragConnectStart.current = { nodeId, handleId };
    }
  }, []);

  const onConnectEnd = useCallback((event: MouseEvent | TouchEvent) => {
    if (!dragConnectStart.current) return;
    const target = event.target as HTMLElement;
    if (target.closest('.react-flow__node')) {
      dragConnectStart.current = null;
      return;
    }
    lastConnectEnd.current = Date.now();
    const x = 'clientX' in event ? event.clientX : event.touches?.[0]?.clientX ?? 0;
    const y = 'clientY' in event ? event.clientY : event.touches?.[0]?.clientY ?? 0;
    menu.setMenuPosition({ x, y });
    menu.setMenuVisible(true);
  }, [menu]);

  const onPaneClick = useCallback(() => {
    if (Date.now() - lastConnectEnd.current < 100) return;
    menu.setMenuVisible(false);
    dragConnectStart.current = null;
    setSelectedSidebarNodeId(null);
  }, [menu]);

  const onSelectionChange = useCallback(({ nodes: selected }: OnSelectionChangeParams) => {
    if (selected.length > 0) setSelectedSidebarNodeId(selected[0].id);
  }, []);

  const addNodeAndConnect = useCallback((nodeKind: string) => {
    const config = NODE_CONFIGS[nodeKind];
    if (!config) return;

    const newNodeId = `node-${Date.now()}`;
    const flowPos = screenToFlowPosition({ x: menu.menuPosition.x, y: menu.menuPosition.y });

    setNodes(nds => nds.concat({
      id: newNodeId,
      type: config.type,
      position: flowPos,
      data: { ...config.data },
    }));

    if (dragConnectStart.current) {
      const { nodeId: sourceId, handleId: sourceHandle } = dragConnectStart.current;
      const sourceNode = nodes.find(n => n.id === sourceId);
      const style = getEdgeStyle(sourceNode, sourceHandle);

      setEdges(eds => addEdge({
        id: `e-${sourceId}-${newNodeId}`,
        source: sourceId,
        sourceHandle,
        target: newNodeId,
        targetHandle: sourceHandle.includes('exec') ? 'exec-in' : 'data-in',
        animated: style.animated || false,
        style: { stroke: style.stroke, strokeWidth: style.strokeWidth },
      } as Edge, eds));
    }
    menu.setMenuVisible(false);
    dragConnectStart.current = null;
  }, [menu, screenToFlowPosition, setNodes, setEdges, nodes]);

  // ─── Side Effects ────────────────────────────────────────────

  useEffect(() => { loadNodeGraph(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    nodes,
    enrichedNodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onConnectStart,
    onConnectEnd,
    onPaneClick,
    onSelectionChange,
    validateConnection,
    addNodeAndConnect,
    generatedJavaCode,
    consoleOutput,
    runScript,
    selectedSidebarNodeId,
    setSelectedSidebarNodeId,
    saveNodeGraph,
    loadNodeGraph,
    updateNodeData,
    updateNodeModifier,
    onAddGetter,
    className,
    setClassName,
  };
}
