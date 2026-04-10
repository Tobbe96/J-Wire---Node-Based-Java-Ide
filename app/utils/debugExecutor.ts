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
export function traceExecution(nodes: Node[], edges: Edge[], inputProvider?: (prompt: string) => string | null): DebugStep[] {
  const steps: DebugStep[] = [];
  const consoleOutput: string[] = [];
  const runtimeMemory: Record<string, unknown> = {};
  const scannerValues = new Map<string, unknown>();
  const arrayListMemory: Record<string, unknown[]> = {};
  const hashMapMemory: Record<string, Map<unknown, unknown>> = {};
  const hashSetMemory: Record<string, Set<unknown>> = {};

  // Initialize variables
  nodes.filter(n => n.type === 'java').forEach(n => {
    const varName = n.data.label as string;
    const varType = n.data.type as string;
    if (varType === 'char') {
      runtimeMemory[varName] = String(n.data.value).charAt(0) || '\0';
    } else if (varType === 'String') {
      runtimeMemory[varName] = String(n.data.value);
    } else if (varType === 'boolean') {
      runtimeMemory[varName] = n.data.value === 'true';
    } else {
      runtimeMemory[varName] = Number(n.data.value);
    }
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

    if (node.type === 'literal') {
      const litType = (node.data.literalType as string) || 'String';
      const rawVal = (node.data.value as string) || '';
      if (litType === 'String') return rawVal;
      if (litType === 'boolean') return rawVal === 'true';
      return Number(rawVal) || 0;
    }

    if (node.type === 'print') {
      const dataEdge = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
      return dataEdge
        ? evaluateData(dataEdge.source, dataEdge.sourceHandle || undefined, localScope)
        : ((node.data.inlineValue as string) ?? '');
    }

    if (node.type === 'math') {
      const edgeA = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-a');
      const edgeB = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-b');
      const valA = edgeA
        ? evaluateData(edgeA.source, edgeA.sourceHandle || undefined, localScope)
        : (node.data.inlineA != null && node.data.inlineA !== '' ? Number(node.data.inlineA) || 0 : 0);
      const valB = edgeB
        ? evaluateData(edgeB.source, edgeB.sourceHandle || undefined, localScope)
        : (node.data.inlineB != null && node.data.inlineB !== '' ? Number(node.data.inlineB) || 0 : 0);
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
      const op = (node.data.operation as string) || '!';
      const edgeA = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
      const val = evaluateData(edgeA?.source || '', edgeA?.sourceHandle || undefined, localScope);
      if (op === '~') return ~Number(val);
      return !val;
    }

    if (node.type === 'mathFunc') {
      const op = node.data.operation as string;
      if (['abs', 'sqrt', 'ceil', 'floor', 'round', 'log', 'log10', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan'].includes(op)) {
        const edgeIn = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
        const val = evaluateData(edgeIn?.source || '', edgeIn?.sourceHandle || undefined, localScope);
        switch (op) {
          case 'abs': return Math.abs(Number(val));
          case 'sqrt': return Math.sqrt(Number(val));
          case 'ceil': return Math.ceil(Number(val));
          case 'floor': return Math.floor(Number(val));
          case 'round': return Math.round(Number(val));
          case 'log': return Math.log(Number(val));
          case 'log10': return Math.log10(Number(val));
          case 'sin': return Math.sin(Number(val));
          case 'cos': return Math.cos(Number(val));
          case 'tan': return Math.tan(Number(val));
          case 'asin': return Math.asin(Number(val));
          case 'acos': return Math.acos(Number(val));
          case 'atan': return Math.atan(Number(val));
        }
      }
      if (op === 'random') return Math.random();
      const edgeA = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-a');
      const edgeB = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-b');
      const valA = Number(evaluateData(edgeA?.source || '', edgeA?.sourceHandle || undefined, localScope));
      const valB = Number(evaluateData(edgeB?.source || '', edgeB?.sourceHandle || undefined, localScope));
      switch (op) {
        case 'min': return Math.min(valA, valB);
        case 'max': return Math.max(valA, valB);
        case 'pow': return Math.floor(Math.pow(valA, valB));
        default: return 0;
      }
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
        case 'split': {
          const edgeIn = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
          const delimEdge = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-delimiter');
          const val = evaluateData(edgeIn?.source || '', edgeIn?.sourceHandle || undefined, localScope);
          const delim = evaluateData(delimEdge?.source || '', delimEdge?.sourceHandle || undefined, localScope);
          return String(val).split(String(delim));
        }
        case 'contains': {
          const edgeIn = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
          const targetEdge = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-target');
          const val = evaluateData(edgeIn?.source || '', edgeIn?.sourceHandle || undefined, localScope);
          const target = evaluateData(targetEdge?.source || '', targetEdge?.sourceHandle || undefined, localScope);
          return String(val).includes(String(target));
        }
        case 'startsWith': {
          const edgeIn = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
          const targetEdge = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-target');
          const val = evaluateData(edgeIn?.source || '', edgeIn?.sourceHandle || undefined, localScope);
          const target = evaluateData(targetEdge?.source || '', targetEdge?.sourceHandle || undefined, localScope);
          return String(val).startsWith(String(target));
        }
        case 'endsWith': {
          const edgeIn = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
          const targetEdge = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-target');
          const val = evaluateData(edgeIn?.source || '', edgeIn?.sourceHandle || undefined, localScope);
          const target = evaluateData(targetEdge?.source || '', targetEdge?.sourceHandle || undefined, localScope);
          return String(val).endsWith(String(target));
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

    if (node.type === 'stringFormat') {
      const fmt = (node.data.formatString as string) || '';
      const argCount = (node.data.argCount as number) || 0;
      const args: unknown[] = [];
      for (let i = 0; i < argCount; i++) {
        const argEdge = edges.find(e => e.target === nodeId && e.targetHandle === `data-in-arg-${i}`);
        args.push(argEdge ? evaluateData(argEdge.source, argEdge.sourceHandle || undefined, localScope) : '');
      }
      let result = fmt;
      let argIdx = 0;
      result = result.replace(/%[sdfiblc%]/g, (match) => {
        if (match === '%%') return '%';
        if (argIdx < args.length) {
          const arg = args[argIdx++];
          if (match === '%d' || match === '%i' || match === '%l') return String(Math.floor(Number(arg)));
          if (match === '%f') return String(Number(arg));
          return String(arg);
        }
        return match;
      });
      return result;
    }

    if (node.type === 'arrayListOp') {
      const op = node.data.operation as string;
      const varName = (node.data.variableName as string) || 'list';
      if (op === 'get') {
        const idxEdge = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-index');
        const idx = Number(evaluateData(idxEdge?.source || '', idxEdge?.sourceHandle || undefined, localScope));
        return arrayListMemory[varName]?.[idx] ?? null;
      }
      if (op === 'size') return arrayListMemory[varName]?.length ?? 0;
      if (op === 'contains') {
        const valEdge = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-value');
        const val = evaluateData(valEdge?.source || '', valEdge?.sourceHandle || undefined, localScope);
        return arrayListMemory[varName]?.includes(val) ?? false;
      }
      return null;
    }

    if (node.type === 'hashMapOp') {
      const op = node.data.operation as string;
      const varName = (node.data.variableName as string) || 'map';
      const map = hashMapMemory[varName];
      if (op === 'get') {
        const keyEdge = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-key');
        const key = evaluateData(keyEdge?.source || '', keyEdge?.sourceHandle || undefined, localScope);
        return map?.get(key) ?? null;
      }
      if (op === 'containsKey') {
        const keyEdge = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-key');
        const key = evaluateData(keyEdge?.source || '', keyEdge?.sourceHandle || undefined, localScope);
        return map?.has(key) ?? false;
      }
      if (op === 'size') return map?.size ?? 0;
      if (op === 'keySet') return map ? Array.from(map.keys()) : [];
      return null;
    }

    if (node.type === 'hashSetOp') {
      const op = node.data.operation as string;
      const varName = (node.data.variableName as string) || 'set';
      const set = hashSetMemory[varName];
      if (op === 'contains') {
        const valEdge = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-value');
        const val = evaluateData(valEdge?.source || '', valEdge?.sourceHandle || undefined, localScope);
        return set?.has(val) ?? false;
      }
      if (op === 'size') return set?.size ?? 0;
      return null;
    }

    if (node.type === 'for') {
      if (localScope && ('__for_index__' + nodeId) in localScope) {
        return localScope['__for_index__' + nodeId];
      }
      return 0;
    }

    if (node.type === 'scanner') {
      return scannerValues.get(nodeId) ?? '';
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
        const val = dataEdge
          ? evaluateData(dataEdge.source, dataEdge.sourceHandle || undefined, localScope)
          : ((nextNode.data.inlineValue as string) ?? '');
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
          runtimeMemory[varName] = dataEdge
            ? evaluateData(dataEdge.source, dataEdge.sourceHandle || undefined, localScope)
            : ((nextNode.data.inlineValue as string) ?? 0);
        }
        pushStep(nextNode.id, 'setVar', `Set ${varName} = ${runtimeMemory[varName]}`, localScope, callStack);
      }

      if (nextNode.type === 'setLocalVar') {
        const localVarName = nextNode.data.localVarName as string;
        const dataEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in');
        if (localVarName && localScope) {
          localScope[localVarName] = dataEdge
            ? evaluateData(dataEdge.source, dataEdge.sourceHandle || undefined, localScope)
            : ((nextNode.data.inlineValue as string) ?? 0);
        }
        pushStep(nextNode.id, 'setLocalVar', `Set local ${localVarName} = ${localScope[localVarName]}`, localScope, callStack);
      }

      if (nextNode.type === 'increment') {
        const varName = (nextNode.data.variableName as string) || 'x';
        const mode = (nextNode.data.mode as string) || 'post-increment';
        const current = Number(runtimeMemory[varName] ?? 0);
        if (mode === 'post-increment' || mode === 'pre-increment') {
          runtimeMemory[varName] = current + 1;
        } else {
          runtimeMemory[varName] = current - 1;
        }
        pushStep(nextNode.id, 'increment', `${varName} ${mode}: ${current} → ${runtimeMemory[varName]}`, localScope, callStack);
      }

      if (nextNode.type === 'compoundAssign') {
        const varName = (nextNode.data.variableName as string) || 'x';
        const operator = (nextNode.data.operator as string) || '+=';
        const dataEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in');
        const value = dataEdge
          ? evaluateData(dataEdge.source, dataEdge.sourceHandle || undefined, localScope)
          : Number((nextNode.data.inlineValue as string) ?? 0);
        const current = Number(runtimeMemory[varName] ?? 0);
        switch (operator) {
          case '+=': runtimeMemory[varName] = current + Number(value); break;
          case '-=': runtimeMemory[varName] = current - Number(value); break;
          case '*=': runtimeMemory[varName] = current * Number(value); break;
          case '/=': runtimeMemory[varName] = current / Number(value); break;
          case '%=': runtimeMemory[varName] = current % Number(value); break;
        }
        pushStep(nextNode.id, 'compoundAssign', `${varName} ${operator} ${value} → ${runtimeMemory[varName]}`, localScope, callStack);
      }

      if (nextNode.type === 'arrayListOp') {
        const op = nextNode.data.operation as string;
        const varName = (nextNode.data.variableName as string) || 'list';
        if (op === 'create') {
          arrayListMemory[varName] = [];
          pushStep(nextNode.id, 'arrayListOp', `Create ArrayList ${varName}`, localScope, callStack);
        } else if (op === 'add') {
          const valEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in-value');
          const val = evaluateData(valEdge?.source || '', valEdge?.sourceHandle || undefined, localScope);
          if (!arrayListMemory[varName]) arrayListMemory[varName] = [];
          arrayListMemory[varName].push(val);
          pushStep(nextNode.id, 'arrayListOp', `${varName}.add(${val})`, localScope, callStack);
        } else if (op === 'set') {
          const idxEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in-index');
          const valEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in-value');
          const idx = Number(evaluateData(idxEdge?.source || '', idxEdge?.sourceHandle || undefined, localScope));
          const val = evaluateData(valEdge?.source || '', valEdge?.sourceHandle || undefined, localScope);
          if (arrayListMemory[varName] && idx >= 0 && idx < arrayListMemory[varName].length) {
            arrayListMemory[varName][idx] = val;
          }
          pushStep(nextNode.id, 'arrayListOp', `${varName}.set(${idx}, ${val})`, localScope, callStack);
        } else if (op === 'remove') {
          const idxEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in-index');
          const idx = Number(evaluateData(idxEdge?.source || '', idxEdge?.sourceHandle || undefined, localScope));
          if (arrayListMemory[varName]) arrayListMemory[varName].splice(idx, 1);
          pushStep(nextNode.id, 'arrayListOp', `${varName}.remove(${idx})`, localScope, callStack);
        } else if (op === 'clear') {
          arrayListMemory[varName] = [];
          pushStep(nextNode.id, 'arrayListOp', `${varName}.clear()`, localScope, callStack);
        } else if (op === 'sort') {
          if (arrayListMemory[varName]) {
            arrayListMemory[varName].sort((a, b) => {
              if (typeof a === 'number' && typeof b === 'number') return a - b;
              return String(a).localeCompare(String(b));
            });
          }
          pushStep(nextNode.id, 'arrayListOp', `Collections.sort(${varName})`, localScope, callStack);
        } else if (op === 'reverse') {
          if (arrayListMemory[varName]) {
            arrayListMemory[varName].reverse();
          }
          pushStep(nextNode.id, 'arrayListOp', `Collections.reverse(${varName})`, localScope, callStack);
        }
      }

      if (nextNode.type === 'hashSetOp') {
        const op = nextNode.data.operation as string;
        const varName = (nextNode.data.variableName as string) || 'set';
        if (op === 'create') {
          hashSetMemory[varName] = new Set();
          pushStep(nextNode.id, 'hashSetOp', `Create HashSet ${varName}`, localScope, callStack);
        } else if (op === 'add') {
          const valEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in-value');
          const val = evaluateData(valEdge?.source || '', valEdge?.sourceHandle || undefined, localScope);
          if (!hashSetMemory[varName]) hashSetMemory[varName] = new Set();
          hashSetMemory[varName].add(val);
          pushStep(nextNode.id, 'hashSetOp', `${varName}.add(${val})`, localScope, callStack);
        } else if (op === 'remove') {
          const valEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in-value');
          const val = evaluateData(valEdge?.source || '', valEdge?.sourceHandle || undefined, localScope);
          hashSetMemory[varName]?.delete(val);
          pushStep(nextNode.id, 'hashSetOp', `${varName}.remove(${val})`, localScope, callStack);
        } else if (op === 'clear') {
          hashSetMemory[varName] = new Set();
          pushStep(nextNode.id, 'hashSetOp', `${varName}.clear()`, localScope, callStack);
        }
      }

      if (nextNode.type === 'hashMapOp') {
        const op = nextNode.data.operation as string;
        const varName = (nextNode.data.variableName as string) || 'map';
        if (op === 'create') {
          hashMapMemory[varName] = new Map();
          pushStep(nextNode.id, 'hashMapOp', `Create HashMap ${varName}`, localScope, callStack);
        } else if (op === 'put') {
          const keyEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in-key');
          const valEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in-value');
          const key = evaluateData(keyEdge?.source || '', keyEdge?.sourceHandle || undefined, localScope);
          const val = evaluateData(valEdge?.source || '', valEdge?.sourceHandle || undefined, localScope);
          if (!hashMapMemory[varName]) hashMapMemory[varName] = new Map();
          hashMapMemory[varName].set(key, val);
          pushStep(nextNode.id, 'hashMapOp', `${varName}.put(${key}, ${val})`, localScope, callStack);
        } else if (op === 'remove') {
          const keyEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in-key');
          const key = evaluateData(keyEdge?.source || '', keyEdge?.sourceHandle || undefined, localScope);
          hashMapMemory[varName]?.delete(key);
          pushStep(nextNode.id, 'hashMapOp', `${varName}.remove(${key})`, localScope, callStack);
        }
      }

      if (nextNode.type === 'branch') {
        const condEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in');
        const condition = condEdge
          ? evaluateData(condEdge.source, condEdge.sourceHandle || undefined, localScope)
          : ((nextNode.data.inlineValue as string) === 'true');
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

      if (nextNode.type === 'scanner') {
        const readType = (nextNode.data.readType as string) || 'nextLine';
        const promptEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in-prompt');
        const promptText = promptEdge
          ? String(evaluateData(promptEdge.source, promptEdge.sourceHandle || undefined, localScope))
          : ((nextNode.data.inlinePrompt as string) || '');

        if (promptText) consoleOutput.push(`> ${promptText}`);

        const rawInput = inputProvider ? (inputProvider(promptText || 'Enter input:') ?? '') : '';
        consoleOutput.push(`< ${rawInput}`);

        let value: unknown;
        switch (readType) {
          case 'nextInt': value = parseInt(rawInput, 10) || 0; break;
          case 'nextFloat':
          case 'nextDouble': value = parseFloat(rawInput) || 0; break;
          case 'nextLong': value = parseInt(rawInput, 10) || 0; break;
          case 'nextBoolean': value = rawInput === 'true'; break;
          default: value = rawInput;
        }
        scannerValues.set(nextNode.id, value);
        pushStep(nextNode.id, 'scanner', `Read ${readType}: ${rawInput}`, localScope, callStack);
      }

      if (nextNode.type === 'return') {
        pushStep(nextNode.id, 'return', 'Return', localScope, callStack);
        break;
      }

      // Default fallthrough nodes (not already handled above with break)
      if (!['print', 'callMethod', 'setVar', 'setLocalVar', 'branch', 'for', 'return', 'while', 'scanner'].includes(nextNode.type || '')) {
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
