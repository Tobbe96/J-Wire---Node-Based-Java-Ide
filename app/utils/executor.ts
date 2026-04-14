import { Node, Edge } from '@xyflow/react';
import type { ProjectFile } from '../store/editorStore';
import { Executor } from './execution/Executor';

export function executeGraph(
  nodes: Node[],
  edges: Edge[],
  inputProvider?: (prompt: string) => string | null,
  projectFiles?: ProjectFile[]
): string[] {
  const mainNode = nodes.find(n => n.type === 'main');
  if (!mainNode) return ['> FATAL ERROR: No Main() found!'];

  const executor = new Executor(nodes, edges, { projectFiles, inputProvider });
  executor.consoleOutput.push('> Starting JVM...');
  executor.runLogicChain(mainNode.id);
  executor.consoleOutput.push('> Process finished.');
  return executor.consoleOutput;
}
