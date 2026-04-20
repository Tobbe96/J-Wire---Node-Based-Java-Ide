import type { Node } from '@xyflow/react';

const GUI_NODE_TYPES = new Set([
  'swingApp',
  'swingFrameOp',
  'swingPanelOp',
  'swingControlOp',
  'swingEventOp',
  'swingStyleOp',
  'swingDialogOp',
  'swingMenuOp',
  'javafxApp',
  'javafxStageOp',
  'javafxSceneOp',
  'javafxLayoutOp',
  'javafxControlOp',
  'javafxEventOp',
  'javafxStyleOp',
  'javafxDialogOp',
  'javafxMenuOp',
  'javafxTableOp',
  'javafxListOp',
  'javafxMediaOp',
  'javafxChartOp',
]);

interface NodeCollection {
  nodes: Node[];
}

export function isGuiProject(files: NodeCollection[]): boolean {
  return files.some(file => file.nodes.some(node => GUI_NODE_TYPES.has(node.type ?? '')));
}
