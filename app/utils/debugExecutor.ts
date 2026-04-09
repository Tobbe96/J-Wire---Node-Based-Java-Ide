import { Node, Edge } from '@xyflow/react';
import { getRuntimeDefault } from './theme';
import type { Parameter, LocalVariable } from './nodeTypes';

export interface DebugStep {
  nodeId: string;
  nodeType: string;
  action: string;
  globalMemory: Record<string, unknown>;
  localScope: Record<string, unknown>;
  consoleOutput: string[];
  callStack: string[];
}

/**
 * Trace-generating executor: mirrors executeGraph logic but records
 * a DebugStep for every node visited so the UI can step through them.
 */
export function traceExecution(nodes: Node[], edges: Edge[]): DebugStep[] {
  const steps: DebugStep[] = [];
  const consoleOutput: string[] = [];
  const runtimeMemory: Record<string, unknown> = {};

  // Initialize variables
  nodes.filter(n => n.type === 'java').forEach(n => {
    const varName = n.data.label as string;
    runtimeMemory[varName] = n.data.type === 'int' ? Number(n.data.value) : String(n.data.value);
  });

  const mainNode = nodes.find(n => n.type === 'main');
  if (!mainNode) {
    steps.push({
      nodeId: '',
      nodeType: 'error',
      action: 'FATAL ERROR: No Main() found!',
      globalMemory: { ...runtimeMemory },
      localScope: {},
      consoleOutput: ['> FATAL ERROR: No Main() found!'],
      callStack: [],
    });
    return steps;
  }

  const snap = (scope: Record<string, unknown>) => ({ ...scope });

  function pushStep(
    nodeId: string,
    nodeType: string,
    action: string,
    localScope: Record<string, unknown>,
    callStack: string[]
  ) {
    steps.push({
      nodeId,
      nodeType,
      action,
      globalMemory: snap(runtimeMemory),
      localScope: snap(localScope),
      consoleOutput: [...consoleOutput],
      callStack: [...callStack],
    });
  }

  // --- Data evaluator (identical to executor.ts) ---
  const evaluateData = (
    nodeId: string,
    sourceHandle?: string,
    localScope?: Record<string, unknown>
  ): unknown => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return null;

    if (node.type === 'method' && sourceHandle) {
      const paramMatch = sourceHandle.match(/^param-out-(\d+)$/);
      if (paramMatch && localScope) {
        const index = parseInt(paramMatch[1], 10);
        const params = (node.data.parameters as Parameter[]) || [];
        const paramName = params[index]?.name;
        if (paramName && paramName in localScope) return localScope[paramName];
        return null;
      }
      const localMatch = sourceHandle.match(/^local-out-(\d+)$/);
      if (localMatch && localScope) {
        const index = parseInt(localMatch[1], 10);
        const locals = (node.data.localVariables as LocalVariable[]) || [];
        const localName = locals[index]?.name;
        if (localName && localName in localScope) return localScope[localName];
        return null;
      }
    }

    if (node.type === 'java') return runtimeMemory[node.data.label as string];

    if (node.type === 'print') {
      const dataEdge = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
      return dataEdge ? evaluateData(dataEdge.source, dataEdge.sourceHandle || undefined, localScope) : '';
    }

    if (node.type === 'math') {
      const edgeA = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-a');
      const edgeB = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-b');
      const valA = evaluateData(edgeA?.source || '', edgeA?.sourceHandle || undefined, localScope);
      const valB = evaluateData(edgeB?.source || '', edgeB?.sourceHandle || undefined, localScope);
      switch (node.data.operation) {
        case '+': return Number(valA) + Number(valB);
        case '-': return Number(valA) - Number(valB);
        case '*': return Number(valA) * Number(valB);
        case '/': return Number(valA) / Number(valB);
        case '>': return Number(valA) > Number(valB);
        case '==': return valA == valB;
        case '&&': return Boolean(valA) && Boolean(valB);
        case '||': return Boolean(valA) || Boolean(valB);
        default: return 0;
      }
    }

    if (node.type === 'not') {
      const edgeA = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
      const val = evaluateData(edgeA?.source || '', edgeA?.sourceHandle || undefined, localScope);
      return !val;
    }

    if (node.type === 'stringOp') {
      switch (node.data.operation) {
        case 'concat': {
          const edgeA = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-a');
          const edgeB = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-b');
          const valA = evaluateData(edgeA?.source || '', edgeA?.sourceHandle || undefined, localScope);
          const valB = evaluateData(edgeB?.source || '', edgeB?.sourceHandle || undefined, localScope);
          return String(valA) + String(valB);
        }
        case 'length': {
          const edgeIn = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
          const val = evaluateData(edgeIn?.source || '', edgeIn?.sourceHandle || undefined, localScope);
          return String(val).length;
        }
        case 'substring': {
          const edgeStr = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
          const edgeStart = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-start');
          const edgeEnd = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-end');
          const val = evaluateData(edgeStr?.source || '', edgeStr?.sourceHandle || undefined, localScope);
          const start = evaluateData(edgeStart?.source || '', edgeStart?.sourceHandle || undefined, localScope);
          const end = evaluateData(edgeEnd?.source || '', edgeEnd?.sourceHandle || undefined, localScope);
          return String(val).substring(Number(start), Number(end));
        }
        default: return '';
      }
    }

    if (node.type === 'arrayOp') {
      switch (node.data.operation) {
        case 'literal': {
          const arrayType = (node.data.arrayType as string) || 'int';
          const rawValues = (node.data.values as string) || '';
          const items = rawValues.split(',').map(v => v.trim()).filter(Boolean);
          return arrayType === 'int' ? items.map(v => Number(v)) : items.map(v => String(v));
        }
        case 'access': {
          const edgeArr = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-array');
          const edgeIdx = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-index');
          const arr = evaluateData(edgeArr?.source || '', edgeArr?.sourceHandle || undefined, localScope);
          const idx = Number(evaluateData(edgeIdx?.source || '', edgeIdx?.sourceHandle || undefined, localScope));
          if (Array.isArray(arr)) return arr[idx] ?? null;
          return null;
        }
        case 'length': {
          const edgeIn = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
          const arr = evaluateData(edgeIn?.source || '', edgeIn?.sourceHandle || undefined, localScope);
          if (Array.isArray(arr)) return arr.length;
          return 0;
        }
        default: return null;
      }
    }

    if (node.type === 'for') {
      if (localScope && ('__for_index__' + nodeId) in localScope) {
        return localScope['__for_index__' + nodeId];
      }
      return 0;
    }

    return '';
  };

  // --- Traced logic chain ---
  const runLogicChain = (
    startNodeId: string,
    startHandle: string = 'exec',
    localScope: Record<string, unknown> = {},
    callStack: string[] = ['main']
  ) => {
    let currentNodeId = startNodeId;
    let currentHandle = startHandle;
    let stepCount = 0;

    while (stepCount < 1000) {
      stepCount++;
      const execEdge = edges.find(
        e => e.source === currentNodeId && e.sourceHandle?.includes(currentHandle)
      );
      if (!execEdge) break;
      const nextNode = nodes.find(n => n.id === execEdge.target);
      if (!nextNode) break;

      if (nextNode.type === 'print') {
        const dataEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in');
        const val = evaluateData(dataEdge?.source || '', dataEdge?.sourceHandle || undefined, localScope);
        consoleOutput.push(`> ${val}`);
        pushStep(nextNode.id, 'print', `Print: ${val}`, localScope, callStack);
      }

      if (nextNode.type === 'callMethod') {
        const targetMethodName = nextNode.data.methodName;
        const methodDef = nodes.find(n => n.type === 'method' && n.data.label === targetMethodName);
        pushStep(nextNode.id, 'callMethod', `Call ${targetMethodName}()`, localScope, callStack);

        if (methodDef) {
          const methodScope: Record<string, unknown> = {};
          const params = (methodDef.data.parameters as Parameter[]) || [];
          params.forEach((param: Parameter, index: number) => {
            const argEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === `arg-in-${index}`);
            if (argEdge) {
              methodScope[param.name] = evaluateData(argEdge.source, argEdge.sourceHandle || undefined, localScope);
            } else {
              methodScope[param.name] = getRuntimeDefault(param.type, param.defaultValue);
            }
          });
          const locals = (methodDef.data.localVariables as LocalVariable[]) || [];
          locals.forEach((local: LocalVariable) => {
            methodScope[local.name] = getRuntimeDefault(local.type, local.value);
          });

          pushStep(methodDef.id, 'method', `Enter ${targetMethodName}()`, methodScope, [...callStack, String(targetMethodName)]);
          runLogicChain(methodDef.id, 'exec-out', methodScope, [...callStack, String(targetMethodName)]);
        } else {
          consoleOutput.push(`> ERROR: Method '${targetMethodName}' not found.`);
        }
      }

      if (nextNode.type === 'setVar') {
        const varName = nextNode.data.variableName as string;
        const dataEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in');
        if (varName) {
          runtimeMemory[varName] = evaluateData(dataEdge?.source || '', dataEdge?.sourceHandle || undefined, localScope);
        }
        pushStep(nextNode.id, 'setVar', `Set ${varName} = ${runtimeMemory[varName]}`, localScope, callStack);
      }

      if (nextNode.type === 'setLocalVar') {
        const localVarName = nextNode.data.localVarName as string;
        const dataEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in');
        if (localVarName && localScope) {
          localScope[localVarName] = evaluateData(dataEdge?.source || '', dataEdge?.sourceHandle || undefined, localScope);
        }
        pushStep(nextNode.id, 'setLocalVar', `Set local ${localVarName} = ${localScope[localVarName]}`, localScope, callStack);
      }

      if (nextNode.type === 'branch') {
        const condEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in');
        const condition = evaluateData(condEdge?.source || '', condEdge?.sourceHandle || undefined, localScope);
        pushStep(nextNode.id, 'branch', `Branch: ${condition ? 'TRUE' : 'FALSE'}`, localScope, callStack);
        runLogicChain(nextNode.id, condition ? 'exec-out-true' : 'exec-out-false', localScope, callStack);
        break;
      }

      if (nextNode.type === 'for') {
        const startEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-start');
        const endEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-end');
        const startVal = Number(evaluateData(startEdge?.source || '', startEdge?.sourceHandle || undefined, localScope)) || 0;
        const endVal = Number(evaluateData(endEdge?.source || '', endEdge?.sourceHandle || undefined, localScope)) || 0;

        pushStep(nextNode.id, 'for', `For loop: ${startVal} to ${endVal}`, localScope, callStack);
        const forScope = localScope ? { ...localScope } : {};
        for (let i = startVal; i < endVal; i++) {
          forScope['__for_index__' + nextNode.id] = i;
          pushStep(nextNode.id, 'for', `For iteration i=${i}`, forScope, callStack);
          runLogicChain(nextNode.id, 'exec-body', forScope, callStack);
        }
        runLogicChain(nextNode.id, 'exec', localScope, callStack);
        break;
      }

      if (nextNode.type === 'while') {
        pushStep(nextNode.id, 'while', 'While loop entry', localScope, callStack);
      }

      if (nextNode.type === 'return') {
        pushStep(nextNode.id, 'return', 'Return', localScope, callStack);
        break;
      }

      // Default fallthrough nodes (not already handled above with break)
      if (!['print', 'callMethod', 'setVar', 'setLocalVar', 'branch', 'for', 'return', 'while'].includes(nextNode.type || '')) {
        pushStep(nextNode.id, nextNode.type || 'unknown', `Execute ${nextNode.type}`, localScope, callStack);
      }

      currentNodeId = nextNode.id;
      currentHandle = 'exec';
    }
  };

  // Start trace
  consoleOutput.push('> Starting JVM...');
  pushStep(mainNode.id, 'main', 'Program start', {}, ['main']);
  runLogicChain(mainNode.id);
  consoleOutput.push('> Process finished.');
  pushStep(
    mainNode.id,
    'main',
    'Program finished',
    {},
    ['main']
  );

  return steps;
}
