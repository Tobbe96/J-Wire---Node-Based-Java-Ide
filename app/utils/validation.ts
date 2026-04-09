import { Connection, Node, Edge } from '@xyflow/react';
import type { Parameter, LocalVariable } from './nodeTypes';

/**
 * Resolves the data type of a source handle on a given node.
 * For regular nodes, the type comes from node.data.type.
 * For method nodes, param-out-* and local-out-* handles carry per-slot types.
 */
function resolveSourceType(node: Node, sourceHandle: string): string | undefined {
  const paramMatch = sourceHandle.match(/^param-out-(\d+)$/);
  if (paramMatch) {
    const index = parseInt(paramMatch[1], 10);
    const params = (node.data.parameters as Parameter[]) || [];
    return params[index]?.type;
  }

  const localMatch = sourceHandle.match(/^local-out-(\d+)$/);
  if (localMatch) {
    const index = parseInt(localMatch[1], 10);
    const locals = (node.data.localVariables as LocalVariable[]) || [];
    return locals[index]?.type;
  }

  return node.data.type as string | undefined;
}

/**
 * Resolves the accepted types for a target handle on a given node.
 * For regular nodes, the accepted types come from node.data.accepts.
 * For callMethod nodes, arg-in-* handles accept the type of the matching method parameter.
 */
function resolveTargetAccepts(node: Node, targetHandle: string, allNodes: Node[]): string[] | undefined {
  const argMatch = targetHandle.match(/^arg-in-(\d+)$/);
  if (argMatch && node.type === 'callMethod') {
    const index = parseInt(argMatch[1], 10);
    const methodName = node.data.methodName as string;
    const methodNode = allNodes.find(n => n.type === 'method' && n.data.label === methodName);
    if (methodNode) {
      const params = (methodNode.data.parameters as Parameter[]) || [];
      const paramType = params[index]?.type;
      if (paramType) return [paramType];
    }
    return undefined;
  }

  // SetLocalVar data-in accepts the type of the targeted local variable
  if (targetHandle === 'data-in' && node.type === 'setLocalVar') {
    const methodName = node.data.methodName as string;
    const varName = node.data.localVarName as string;
    const methodNode = allNodes.find(n => n.type === 'method' && n.data.label === methodName);
    if (methodNode) {
      const locals = (methodNode.data.localVariables as LocalVariable[]) || [];
      const local = locals.find((l: LocalVariable) => l.name === varName);
      if (local) return [local.type];
    }
    return undefined;
  }

  return node.data.accepts as string[] | undefined;
}

/**
 * Validates connections based on Java type rules.
 * Handles both new connections (Connection) and existing ones (Edge).
 */
export const isValidJavaConnection = (
  connection: Connection | Edge, 
  nodes: Node[]
): boolean => {
  if (!connection.source || !connection.target) return false;

  const sourceNode = nodes.find((n) => n.id === connection.source);
  const targetNode = nodes.find((n) => n.id === connection.target);

  if (!sourceNode || !targetNode) return false;

  const sourceHandle = connection.sourceHandle || '';
  const targetHandle = connection.targetHandle || '';

  // EXECUTION FLOW VALIDATION
  const isSourceExec = sourceHandle.startsWith('exec');
  const isTargetExec = targetHandle.startsWith('exec');

  if (isSourceExec || isTargetExec) {
    return isSourceExec && isTargetExec;
  }

  // DATA FLOW VALIDATION
  const sourceDataType = resolveSourceType(sourceNode, sourceHandle);
  const acceptedTypes = resolveTargetAccepts(targetNode, targetHandle, nodes);

  if (acceptedTypes) {
    return !!sourceDataType && acceptedTypes.includes(sourceDataType);
  }

  return !!sourceDataType && sourceDataType === (targetNode.data.type as string);
};