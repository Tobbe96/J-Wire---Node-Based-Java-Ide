import { Connection, Node, Edge } from '@xyflow/react';
import type { Parameter, LocalVariable } from './nodeTypes';
import { ALL_NUMERIC, ALL_TYPES, isNumericType } from './theme';

/**
 * Resolves the data type of a source handle on a given node.
 * For regular nodes, the type comes from node.data.type.
 * For method nodes, param-out-* and local-out-* handles carry per-slot types.
 */
export function resolveSourceType(node: Node, sourceHandle: string): string | undefined {
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

  // StringOp output type depends on the operation
  if (node.type === 'stringOp') {
    const op = node.data.operation as string;
    if (op === 'length' || op === 'indexOf') return 'int';
    if (op === 'contains' || op === 'startsWith' || op === 'endsWith') return 'boolean';
    if (op === 'split') return 'String[]';
    return 'String';
  }

  // For nodes expose data-index (e.g., for-loop index output)
  if (node.type === 'for' && sourceHandle === 'data-index') return 'int';

  // ForEach output types
  if (node.type === 'forEach') {
    if (sourceHandle === 'data-out-element') return (node.data.elementType as string) || 'int';
    if (sourceHandle === 'data-out-index') return 'int';
  }

  // ArrayOp: array-length outputs int; literal/new/access output depends on arrayType
  if (node.type === 'arrayOp') {
    if ((node.data.operation as string) === 'length') return 'int';
  }

  // CastNode output type is the selected target type
  if (node.type === 'cast') return (node.data.targetType as string) || 'String';

  // LiteralNode output type is the selected literal type
  if (node.type === 'literal') return (node.data.literalType as string) || 'String';

  // StringFormat always outputs String
  if (node.type === 'stringFormat') return 'String';

  // NewObjectNode outputs the target class name as type
  if (node.type === 'newObject') return (node.data.targetClass as string) || undefined;

  // CallInstanceMethodNode outputs its method return type
  if (node.type === 'callInstanceMethod') {
    const fullName = node.data.methodName as string;
    if (fullName && fullName.includes('.')) {
      const methodName = fullName.split('.')[1];
      const projectFiles = node.data.projectFiles as Array<{ methods: Array<{ name: string; returnType: string }> }> | undefined;
      if (projectFiles) {
        for (const f of projectFiles) {
          const m = f.methods.find(m => m.name === methodName);
          if (m) return m.returnType !== 'void' ? m.returnType : undefined;
        }
      }
    }
    return undefined;
  }

  // ArrayListOp output types
  if (node.type === 'arrayListOp') {
    const op = node.data.operation as string;
    if (op === 'size') return 'int';
    if (op === 'contains') return 'boolean';
    if (op === 'get') return (node.data.elementType as string) || 'int';
    return undefined;
  }

  // HashMapOp output types
  if (node.type === 'hashMapOp') {
    const op = node.data.operation as string;
    if (op === 'size') return 'int';
    if (op === 'containsKey') return 'boolean';
    if (op === 'get') return (node.data.valueType as string) || 'String';
    if (op === 'keySet') return 'String';
    return undefined;
  }

  // HashSetOp output types
  if (node.type === 'hashSetOp') {
    const op = node.data.operation as string;
    if (op === 'size') return 'int';
    if (op === 'contains') return 'boolean';
    return undefined;
  }

  // MathFunc output type
  if (node.type === 'mathFunc') {
    const op = node.data.operation as string;
    if (op === 'round') return 'long';
    if (op === 'random') return 'double';
    return 'double';
  }

  // ScannerNode output type depends on readType
  if (node.type === 'scanner') {
    const readType = (node.data.readType as string) || 'nextLine';
    const typeMap: Record<string, string> = {
      nextLine: 'String', nextInt: 'int', nextFloat: 'float',
      nextDouble: 'double', nextLong: 'long', nextBoolean: 'boolean',
    };
    return typeMap[readType] || 'String';
  }

  return node.data.type as string | undefined;
}

/**
 * Resolves the accepted types for a target handle on a given node.
 * For regular nodes, the accepted types come from node.data.accepts.
 * For callMethod nodes, arg-in-* handles accept the type of the matching method parameter.
 */
export function resolveTargetAccepts(node: Node, targetHandle: string, allNodes: Node[]): string[] | undefined {
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

  // StringOp specialized handles
  if (node.type === 'stringOp') {
    if (targetHandle === 'data-in' || targetHandle === 'data-in-a' || targetHandle === 'data-in-b'
      || targetHandle === 'data-in-target' || targetHandle === 'data-in-replacement'
      || targetHandle === 'data-in-delimiter') return ['String'];
    if (targetHandle === 'data-in-start' || targetHandle === 'data-in-end' || targetHandle === 'data-in-index') return ['int'];
    return ['String'];
  }

  // CastNode accepts any type as input
  if (node.type === 'cast' && targetHandle === 'data-in') {
    return ALL_TYPES;
  }

  // TernaryNode: condition must be boolean, true/false accept anything
  if (node.type === 'ternary') {
    if (targetHandle === 'data-in-condition') return ['boolean'];
    if (targetHandle === 'data-in-true' || targetHandle === 'data-in-false') return ALL_TYPES;
  }

  // SwitchNode: value and case inputs accept numeric types
  if (node.type === 'switch') {
    if (targetHandle === 'data-in' || targetHandle.startsWith('data-case-')) return ALL_NUMERIC;
  }

  // ArrayOp: index handles accept int, array-new size accepts int
  if (node.type === 'arrayOp') {
    if (targetHandle === 'data-in-index' || targetHandle === 'data-in-size') return ['int'];
    // data-in-value and data-in-array accept anything (generic)
    if (targetHandle === 'data-in-value' || targetHandle === 'data-in-array' || targetHandle === 'data-in') return ALL_TYPES;
  }

  // ForEach: array input accepts anything (we can't validate array-ness via type system)
  if (node.type === 'forEach') {
    if (targetHandle === 'data-in-array') return ALL_TYPES;
  }

  // StringFormat: all args accept any type
  if (node.type === 'stringFormat') {
    if (targetHandle.startsWith('data-in-arg-')) return ALL_TYPES;
  }

  // ArrayListOp handles
  if (node.type === 'arrayListOp') {
    if (targetHandle === 'data-in-index') return ['int'];
    if (targetHandle === 'data-in-value') return ALL_TYPES;
  }

  // HashMapOp handles
  if (node.type === 'hashMapOp') {
    if (targetHandle === 'data-in-key') return ALL_TYPES;
    if (targetHandle === 'data-in-value') return ALL_TYPES;
  }

  // HashSetOp handles
  if (node.type === 'hashSetOp') {
    if (targetHandle === 'data-in-value') return ALL_TYPES;
  }

  // Increment: variable name data-in accepts any
  if (node.type === 'increment') {
    if (targetHandle === 'data-in') return ALL_TYPES;
  }

  // CompoundAssign: value input accepts numeric
  if (node.type === 'compoundAssign') {
    if (targetHandle === 'data-in') return ALL_NUMERIC;
  }

  // ScannerNode: prompt accepts String
  if (node.type === 'scanner') {
    if (targetHandle === 'data-in-prompt') return ['String'];
  }

  // CallInstanceMethodNode: obj-in accepts any type (object reference), arg-in-* accepts param type
  if (node.type === 'callInstanceMethod') {
    if (targetHandle === 'obj-in') return ALL_TYPES;
    const argMatch = targetHandle.match(/^arg-in-(\d+)$/);
    if (argMatch) {
      // Accept any type — we can't easily lookup instance method params without project context
      return ALL_TYPES;
    }
  }

  // NewObjectNode: arg-in-* accepts any type
  if (node.type === 'newObject') {
    if (targetHandle.startsWith('arg-in-')) return ALL_TYPES;
  }

  return node.data.accepts as string[] | undefined;
}

/**
 * Determines if a type mismatch can be resolved by auto-inserting a Cast node.
 * Returns the target type to cast to, or null if no auto-conversion applies.
 */
export function getAutoConvertType(
  sourceType: string,
  acceptedTypes: string[]
): string | null {
  if (acceptedTypes.includes(sourceType)) return null; // exact match, no cast needed

  // Numeric → numeric: cast to the first accepted numeric type
  if (isNumericType(sourceType)) {
    const target = acceptedTypes.find(t => isNumericType(t));
    if (target) return target;
  }

  // Numeric → String or String → numeric
  if (isNumericType(sourceType) && acceptedTypes.includes('String')) return 'String';
  if (sourceType === 'String') {
    const target = acceptedTypes.find(t => isNumericType(t));
    if (target) return target;
  }

  // boolean ↔ String
  if (sourceType === 'boolean' && acceptedTypes.includes('String')) return 'String';
  if (sourceType === 'String' && acceptedTypes.includes('boolean')) return 'boolean';

  return null;
}

/**
 * Validates connections based on Java type rules.
 * Handles both new connections (Connection) and existing ones (Edge).
 * Also returns true for connections where an auto-cast can be inserted.
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
    if (!!sourceDataType && acceptedTypes.includes(sourceDataType)) return true;
    // Allow if auto-conversion is possible
    if (!!sourceDataType && getAutoConvertType(sourceDataType, acceptedTypes) !== null) return true;
    return false;
  }

  const targetType = targetNode.data.type as string;
  if (!!sourceDataType && sourceDataType === targetType) return true;
  // Allow auto-convertible mismatches for direct type checks too
  if (!!sourceDataType && targetType && getAutoConvertType(sourceDataType, [targetType]) !== null) return true;
  return false;
};