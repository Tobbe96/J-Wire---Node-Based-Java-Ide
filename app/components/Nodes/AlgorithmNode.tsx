import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { nodeContainer, nodeHeaderSolid, execHandleStyle, dataHandleStyle } from '../../utils/nodeStyles';
import { getTypeColor } from '../../utils/theme';
import { TREE_NODE_COLOR } from './TreeNodeOpNode';

const ACCENT = '#c0392b';
const INT_COLOR = getTypeColor('int');
const INT_ARR_COLOR = '#38bdf8';
const LIST_COLOR = '#2dd4bf';
const GRAPH_COLOR = '#a78bfa';

const lbl: React.CSSProperties = { fontSize: '11px', color: '#ccc' };
const bold: React.CSSProperties = { fontSize: '11px', color: '#fff', fontWeight: 'bold' };
const row: React.CSSProperties = { display: 'flex', alignItems: 'center', position: 'relative' };
const between: React.CSSProperties = { display: 'flex', justifyContent: 'space-between' };
const col: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '14px' };

const LABELS: Record<string, string> = {
  bfs: 'BFS (Breadth-First)',
  dfs: 'DFS (Depth-First)',
  binarySearch: 'Binary Search',
  linearSearch: 'Linear Search',
  bubbleSort: 'Bubble Sort',
  mergeSort: 'Merge Sort',
  quickSort: 'Quick Sort',
  inorderTraversal: 'Inorder Traversal',
  preorderTraversal: 'Preorder Traversal',
  postorderTraversal: 'Postorder Traversal',
  dijkstra: 'Dijkstra (Shortest Path)',
  bellmanFord: 'Bellman-Ford',
};

type Props = { id: string; data: Record<string, unknown>; selected?: boolean };

const AlgorithmNode = ({ data, selected }: Props) => {
  const op = (data.operation as string) || 'bfs';
  const header = LABELS[op] ?? op;

  const execL = <><Handle type="target" position={Position.Left} id="exec-in" style={{ ...execHandleStyle('left'), left: '-6px' }} /><span style={bold}>Exec</span></>;
  const execR = <><span style={{ ...bold, marginRight: '5px' }}>Out</span><Handle type="source" position={Position.Right} id="exec-out" style={{ ...execHandleStyle('right'), right: '-6px' }} /></>;

  const wrap = (children: React.ReactNode) => (
    <div style={{ ...nodeContainer(ACCENT, !!selected), minWidth: '210px' }}>
      <div className="jwire-header-shimmer" style={nodeHeaderSolid(ACCENT)}>🧮 {header}</div>
      <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>{children}</div>
    </div>
  );

  // BFS / DFS: graph (adjacency list) + start int → result ArrayList<Integer>
  if (op === 'bfs' || op === 'dfs') return wrap(
    <div style={between}>
      <div style={col}>
        <div style={row}>{execL}</div>
        <div style={row}><Handle type="target" position={Position.Left} id="data-in-graph" style={{ ...dataHandleStyle(GRAPH_COLOR, 'left'), left: '-6px' }} /><span style={lbl}>graph</span></div>
        <div style={row}><Handle type="target" position={Position.Left} id="data-in-start" style={{ ...dataHandleStyle(INT_COLOR, 'left'), left: '-6px' }} /><span style={lbl}>start: int</span></div>
      </div>
      <div style={col}>
        <div style={row}>{execR}</div>
        <div style={row}><span style={{ ...lbl, marginRight: '5px' }}>visited</span><Handle type="source" position={Position.Right} id="data-out" style={{ ...dataHandleStyle(LIST_COLOR, 'right'), right: '-6px' }} /></div>
      </div>
    </div>
  );

  // Binary Search / Linear Search: int[] + target → index int
  if (op === 'binarySearch' || op === 'linearSearch') return wrap(
    <div style={between}>
      <div style={col}>
        <div style={row}>{execL}</div>
        <div style={row}><Handle type="target" position={Position.Left} id="data-in-array" style={{ ...dataHandleStyle(INT_ARR_COLOR, 'left'), left: '-6px' }} /><span style={lbl}>array: int[]</span></div>
        <div style={row}><Handle type="target" position={Position.Left} id="data-in-target" style={{ ...dataHandleStyle(INT_COLOR, 'left'), left: '-6px' }} /><span style={lbl}>target: int</span></div>
      </div>
      <div style={col}>
        <div style={row}>{execR}</div>
        <div style={row}><span style={{ ...lbl, marginRight: '5px' }}>index</span><Handle type="source" position={Position.Right} id="data-out" style={{ ...dataHandleStyle(INT_COLOR, 'right'), right: '-6px' }} /></div>
      </div>
    </div>
  );

  // Bubble Sort / Quick Sort: sorts int[] or ArrayList in-place, no result
  if (op === 'bubbleSort' || op === 'quickSort') return wrap(
    <div style={between}>
      <div style={col}>
        <div style={row}>{execL}</div>
        <div style={row}><Handle type="target" position={Position.Left} id="data-in-array" style={{ ...dataHandleStyle(INT_ARR_COLOR, 'left'), left: '-6px' }} /><span style={lbl}>array: int[]</span></div>
        <div style={row}><Handle type="target" position={Position.Left} id="data-in-list" style={{ ...dataHandleStyle(LIST_COLOR, 'left'), left: '-6px' }} /><span style={lbl}>list: ArrayList</span></div>
      </div>
      <div style={row}>{execR}</div>
    </div>
  );

  // Merge Sort: int[] or ArrayList → sorted copy
  if (op === 'mergeSort') return wrap(
    <div style={between}>
      <div style={col}>
        <div style={row}>{execL}</div>
        <div style={row}><Handle type="target" position={Position.Left} id="data-in-array" style={{ ...dataHandleStyle(INT_ARR_COLOR, 'left'), left: '-6px' }} /><span style={lbl}>array: int[]</span></div>
        <div style={row}><Handle type="target" position={Position.Left} id="data-in-list" style={{ ...dataHandleStyle(LIST_COLOR, 'left'), left: '-6px' }} /><span style={lbl}>list: ArrayList</span></div>
      </div>
      <div style={col}>
        <div style={row}>{execR}</div>
        <div style={row}><span style={{ ...lbl, marginRight: '5px' }}>sorted</span><Handle type="source" position={Position.Right} id="data-out" style={{ ...dataHandleStyle(INT_ARR_COLOR, 'right'), right: '-6px' }} /></div>
      </div>
    </div>
  );

  // Tree traversals: root TreeNode → List<T>
  if (op === 'inorderTraversal' || op === 'preorderTraversal' || op === 'postorderTraversal') return wrap(
    <div style={between}>
      <div style={col}>
        <div style={row}>{execL}</div>
        <div style={row}><Handle type="target" position={Position.Left} id="data-in-root" style={{ ...dataHandleStyle(TREE_NODE_COLOR, 'left'), left: '-6px' }} /><span style={lbl}>root: TreeNode</span></div>
      </div>
      <div style={col}>
        <div style={row}>{execR}</div>
        <div style={row}><span style={{ ...lbl, marginRight: '5px' }}>result list</span><Handle type="source" position={Position.Right} id="data-out" style={{ ...dataHandleStyle(LIST_COLOR, 'right'), right: '-6px' }} /></div>
      </div>
    </div>
  );

  // Dijkstra / Bellman-Ford: graph + start + end → shortest distance int
  if (op === 'dijkstra' || op === 'bellmanFord') return wrap(
    <div style={between}>
      <div style={col}>
        <div style={row}>{execL}</div>
        <div style={row}><Handle type="target" position={Position.Left} id="data-in-graph" style={{ ...dataHandleStyle(GRAPH_COLOR, 'left'), left: '-6px' }} /><span style={lbl}>graph (adj matrix)</span></div>
        <div style={row}><Handle type="target" position={Position.Left} id="data-in-start" style={{ ...dataHandleStyle(INT_COLOR, 'left'), left: '-6px' }} /><span style={lbl}>start: int</span></div>
        <div style={row}><Handle type="target" position={Position.Left} id="data-in-end" style={{ ...dataHandleStyle(INT_COLOR, 'left'), left: '-6px' }} /><span style={lbl}>end: int</span></div>
      </div>
      <div style={col}>
        <div style={row}>{execR}</div>
        <div style={row}><span style={{ ...lbl, marginRight: '5px' }}>distance: int</span><Handle type="source" position={Position.Right} id="data-out" style={{ ...dataHandleStyle(INT_COLOR, 'right'), right: '-6px' }} /></div>
      </div>
    </div>
  );

  // fallback
  return wrap(<div style={row}>{execL}</div>);
};

export default memo(AlgorithmNode);

