import { useRef, useState, useCallback } from 'react';
import type { Node, Connection } from '@xyflow/react';
import { getTypeColor } from '../utils/theme';
import { triggerConnectionSpark } from '../components/vfx/ConnectionSpark';

interface ConnectionHandlerDeps {
  nodes: Node[];
  onConnect: (connection: Connection) => void;
  vfxEnabled: boolean;
  setMenuPosition: (pos: { x: number; y: number }) => void;
  setMenuVisible: (v: boolean) => void;
  setSelectedSidebarNodeId: (id: string | null) => void;
}

export function useConnectionHandlers(deps: ConnectionHandlerDeps) {
  const { nodes, onConnect, vfxEnabled, setMenuPosition, setMenuVisible, setSelectedSidebarNodeId } = deps;

  const [dragConnectStart, setDragConnectStart] = useState<{ nodeId: string; handleId: string } | null>(null);
  const lastConnectEnd = useRef<number>(0);
  const [connectionLineColor, setConnectionLineColor] = useState('#fff');

  const handleConnect = useCallback((...args: Parameters<typeof onConnect>) => {
    onConnect(...args);
    const connection = args[0];
    if (vfxEnabled && connection.target) {
      const targetEl = document.querySelector(`[data-handleid="${connection.targetHandle}"][data-nodeid="${connection.target}"]`);
      if (targetEl) {
        const rect = targetEl.getBoundingClientRect();
        const sourceNode = nodes.find((n) => n.id === connection.source);
        const color = connection.sourceHandle?.includes('exec')
          ? '#ffffff'
          : getTypeColor((sourceNode?.data?.type as string) || '');
        triggerConnectionSpark(rect.left + rect.width / 2, rect.top + rect.height / 2, color);
      }
    }
  }, [onConnect, vfxEnabled, nodes]);

  const onConnectStart = useCallback((_: unknown, { nodeId, handleId }: { nodeId: string | null; handleId: string | null }) => {
    if (nodeId && handleId) {
      setDragConnectStart({ nodeId, handleId });
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
    if (!dragConnectStart) return;
    const target = event.target as HTMLElement;
    if (target.closest('.react-flow__node')) { setDragConnectStart(null); return; }
    lastConnectEnd.current = Date.now();
    const x = 'clientX' in event ? event.clientX : event.touches?.[0]?.clientX ?? 0;
    const y = 'clientY' in event ? event.clientY : event.touches?.[0]?.clientY ?? 0;
    setMenuPosition({ x, y });
    setMenuVisible(true);
  }, [dragConnectStart, setMenuPosition, setMenuVisible]);

  const onPaneClick = useCallback(() => {
    if (Date.now() - lastConnectEnd.current < 100) return;
    setMenuVisible(false);
    setDragConnectStart(null);
    setSelectedSidebarNodeId(null);
  }, [setMenuVisible, setSelectedSidebarNodeId]);

  return {
    connectionLineColor,
    onConnectStart,
    onConnectEnd,
    onPaneClick,
    handleConnect,
    dragConnectStart,
  };
}
