import Dagre from '@dagrejs/dagre';
import { Node, Edge } from '@xyflow/react';

export function getLayoutedElements(nodes: Node[], edges: Edge[], direction: 'TB' | 'LR' = 'LR') {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, nodesep: 50, ranksep: 100 });

  nodes.forEach((node) => {
    g.setNode(node.id, { width: 250, height: 150 });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  Dagre.layout(g);

  const layoutedNodes = nodes.map((node) => {
    const position = g.node(node.id);
    return { ...node, position: { x: position.x - 125, y: position.y - 75 } };
  });

  return { nodes: layoutedNodes, edges };
}
