import { Node, Edge } from '@xyflow/react';
import { getRuntimeDefault } from './theme';
import type { Parameter, LocalVariable } from './nodeTypes';

export function executeGraph(nodes: Node[], edges: Edge[], inputProvider?: (prompt: string) => string | null): string[] {
  const consoleOutput: string[] = [];
  const runtimeMemory: Record<string, unknown> = {};
  const scannerValues = new Map<string, unknown>();
  const arrayListMemory: Record<string, unknown[]> = {};
  const hashMapMemory: Record<string, Map<unknown, unknown>> = {};
  
  // 1. Initialize Memory (Variables)
  nodes.filter(n => n.type === 'java').forEach(n => {
    const varName = n.data.label as string;
    const varType = n.data.type as string;
    if (varType === 'String') {
      runtimeMemory[varName] = String(n.data.value);
    } else if (varType === 'boolean') {
      runtimeMemory[varName] = n.data.value === 'true';
    } else if (varType === 'char') {
      runtimeMemory[varName] = String(n.data.value).charAt(0) || '\0';
    } else {
      runtimeMemory[varName] = Number(n.data.value);
    }
  });

  const mainNode = nodes.find(n => n.type === 'main');
  if (!mainNode) return ["> FATAL ERROR: No Main() found!"];

  // --- RECURSIVE DATA EVALUATOR (handle-aware) ---
  const evaluateData = (nodeId: string, sourceHandle?: string, localScope?: Record<string, unknown>): unknown => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return null;

    // Method node parameter/local variable output handles
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
        : ((node.data.inlineValue as string) ?? "");
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
        case '%': return Number(valA) % Number(valB);
        case '>': return Number(valA) > Number(valB);
        case '<': return Number(valA) < Number(valB);
        case '<=': return Number(valA) <= Number(valB);
        case '>=': return Number(valA) >= Number(valB);
        case '==': return valA == valB;
        case '!=': return valA != valB;
        case '&&': return Boolean(valA) && Boolean(valB);
        case '||': return Boolean(valA) || Boolean(valB);
        default: return 0;
      }
    }

    if (node.type === 'not') {
      const edgeA = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
      const val = evaluateData(edgeA?.source || "", edgeA?.sourceHandle || undefined, localScope);
      return !val;
    }

    if (node.type === 'stringOp') {
      switch (node.data.operation) {
        case 'concat': {
          const edgeA = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-a');
          const edgeB = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-b');
          const valA = evaluateData(edgeA?.source || "", edgeA?.sourceHandle || undefined, localScope);
          const valB = evaluateData(edgeB?.source || "", edgeB?.sourceHandle || undefined, localScope);
          return String(valA) + String(valB);
        }
        case 'length': {
          const edgeIn = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
          const val = evaluateData(edgeIn?.source || "", edgeIn?.sourceHandle || undefined, localScope);
          return String(val).length;
        }
        case 'substring': {
          const edgeStr = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
          const edgeStart = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-start');
          const edgeEnd = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-end');
          const val = evaluateData(edgeStr?.source || "", edgeStr?.sourceHandle || undefined, localScope);
          const start = evaluateData(edgeStart?.source || "", edgeStart?.sourceHandle || undefined, localScope);
          const end = evaluateData(edgeEnd?.source || "", edgeEnd?.sourceHandle || undefined, localScope);
          return String(val).substring(Number(start), Number(end));
        }
        case 'charAt': {
          const edgeStr = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
          const edgeIdx = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-index');
          const val = evaluateData(edgeStr?.source || "", edgeStr?.sourceHandle || undefined, localScope);
          const idx = evaluateData(edgeIdx?.source || "", edgeIdx?.sourceHandle || undefined, localScope);
          const str = String(val);
          const i = Number(idx);
          return i >= 0 && i < str.length ? str.charAt(i) : '';
        }
        case 'indexOf': {
          const edgeStr = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
          const edgeTarget = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-target');
          const val = evaluateData(edgeStr?.source || "", edgeStr?.sourceHandle || undefined, localScope);
          const target = evaluateData(edgeTarget?.source || "", edgeTarget?.sourceHandle || undefined, localScope);
          return String(val).indexOf(String(target));
        }
        case 'replace': {
          const edgeStr = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
          const edgeTarget = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-target');
          const edgeRepl = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-replacement');
          const val = evaluateData(edgeStr?.source || "", edgeStr?.sourceHandle || undefined, localScope);
          const target = evaluateData(edgeTarget?.source || "", edgeTarget?.sourceHandle || undefined, localScope);
          const repl = evaluateData(edgeRepl?.source || "", edgeRepl?.sourceHandle || undefined, localScope);
          return String(val).replace(String(target), String(repl));
        }
        case 'trim': {
          const edgeIn = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
          const val = evaluateData(edgeIn?.source || "", edgeIn?.sourceHandle || undefined, localScope);
          return String(val).trim();
        }
        case 'toUpperCase': {
          const edgeIn = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
          const val = evaluateData(edgeIn?.source || "", edgeIn?.sourceHandle || undefined, localScope);
          return String(val).toUpperCase();
        }
        case 'toLowerCase': {
          const edgeIn = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
          const val = evaluateData(edgeIn?.source || "", edgeIn?.sourceHandle || undefined, localScope);
          return String(val).toLowerCase();
        }
        default: return "";
      }
    }

    if (node.type === 'mathFunc') {
      const op = node.data.operation as string;
      if (['abs', 'sqrt', 'ceil', 'floor', 'round', 'log', 'log10'].includes(op)) {
        const edgeIn = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
        const val = evaluateData(edgeIn?.source || "", edgeIn?.sourceHandle || undefined, localScope);
        switch (op) {
          case 'abs': return Math.abs(Number(val));
          case 'sqrt': return Math.sqrt(Number(val));
          case 'ceil': return Math.ceil(Number(val));
          case 'floor': return Math.floor(Number(val));
          case 'round': return Math.round(Number(val));
          case 'log': return Math.log(Number(val));
          case 'log10': return Math.log10(Number(val));
        }
      }
      if (op === 'random') return Math.random();
      const edgeA = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-a');
      const edgeB = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-b');
      const valA = Number(evaluateData(edgeA?.source || "", edgeA?.sourceHandle || undefined, localScope));
      const valB = Number(evaluateData(edgeB?.source || "", edgeB?.sourceHandle || undefined, localScope));
      switch (op) {
        case 'min': return Math.min(valA, valB);
        case 'max': return Math.max(valA, valB);
        case 'pow': return Math.floor(Math.pow(valA, valB));
        default: return 0;
      }
    }

    if (node.type === 'cast') {
      const edgeIn = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
      const val = evaluateData(edgeIn?.source || "", edgeIn?.sourceHandle || undefined, localScope);
      const targetType = (node.data.targetType as string) || 'String';
      switch (targetType) {
        case 'int':
        case 'short':
        case 'byte': return parseInt(String(val), 10) || 0;
        case 'float':
        case 'double':
        case 'long': return parseFloat(String(val)) || 0;
        case 'boolean': return val === 'true' || val === true || val === 1;
        case 'String': return String(val);
        default: return val;
      }
    }

    if (node.type === 'ternary') {
      const edgeCond = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-condition');
      const cond = evaluateData(edgeCond?.source || "", edgeCond?.sourceHandle || undefined, localScope);
      if (cond) {
        const edgeTrue = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-true');
        return evaluateData(edgeTrue?.source || "", edgeTrue?.sourceHandle || undefined, localScope);
      } else {
        const edgeFalse = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-false');
        return evaluateData(edgeFalse?.source || "", edgeFalse?.sourceHandle || undefined, localScope);
      }
    }

    if (node.type === 'arrayOp') {
      switch (node.data.operation) {
        case 'literal': {
          const arrayType = (node.data.arrayType as string) || 'int';
          const rawValues = (node.data.values as string) || '';
          const items = rawValues.split(',').map(v => v.trim()).filter(Boolean);
          if (arrayType === 'String') return items.map(v => String(v));
          if (arrayType === 'boolean') return items.map(v => v === 'true');
          return items.map(v => Number(v));
        }
        case 'new': {
          const sizeEdge = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-size');
          const size = Number(evaluateData(sizeEdge?.source || "", sizeEdge?.sourceHandle || undefined, localScope)) || 0;
          return new Array(size).fill(null);
        }
        case 'access': {
          const edgeArr = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-array');
          const edgeIdx = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-index');
          const arr = evaluateData(edgeArr?.source || "", edgeArr?.sourceHandle || undefined, localScope);
          const idx = Number(evaluateData(edgeIdx?.source || "", edgeIdx?.sourceHandle || undefined, localScope));
          if (Array.isArray(arr)) return arr[idx] ?? null;
          return null;
        }
        case 'length': {
          const edgeIn = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
          const arr = evaluateData(edgeIn?.source || "", edgeIn?.sourceHandle || undefined, localScope);
          if (Array.isArray(arr)) return arr.length;
          return 0;
        }
        default: return null;
      }
    }

    if (node.type === 'forEach') {
      if (localScope) {
        if (sourceHandle === 'data-out-element') return localScope['__forEach_elem__' + nodeId] ?? null;
        if (sourceHandle === 'data-out-index') return localScope['__forEach_idx__' + nodeId] ?? 0;
      }
      return null;
    }

    if (node.type === 'stringFormat') {
      const fmt = (node.data.formatString as string) || '';
      const argCount = (node.data.argCount as number) || 0;
      const args: unknown[] = [];
      for (let i = 0; i < argCount; i++) {
        const argEdge = edges.find(e => e.target === nodeId && e.targetHandle === `data-in-arg-${i}`);
        args.push(argEdge ? evaluateData(argEdge.source, argEdge.sourceHandle || undefined, localScope) : '');
      }
      // Simple JS format emulation: replace %s, %d, %f with args in order
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
        const idx = Number(evaluateData(idxEdge?.source || "", idxEdge?.sourceHandle || undefined, localScope));
        const arr = arrayListMemory[varName];
        return arr ? (arr[idx] ?? null) : null;
      }
      if (op === 'size') return arrayListMemory[varName]?.length ?? 0;
      if (op === 'contains') {
        const valEdge = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-value');
        const val = evaluateData(valEdge?.source || "", valEdge?.sourceHandle || undefined, localScope);
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
        const key = evaluateData(keyEdge?.source || "", keyEdge?.sourceHandle || undefined, localScope);
        return map?.get(key) ?? null;
      }
      if (op === 'containsKey') {
        const keyEdge = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-key');
        const key = evaluateData(keyEdge?.source || "", keyEdge?.sourceHandle || undefined, localScope);
        return map?.has(key) ?? false;
      }
      if (op === 'size') return map?.size ?? 0;
      if (op === 'keySet') return map ? Array.from(map.keys()) : [];
      return null;
    }

    if (node.type === 'for') {
      if (localScope && ('__for_index__' + nodeId) in localScope) {
        return localScope['__for_index__' + nodeId];
      }
      return 0;
    }

    if (node.type === 'tryCatchFinally') {
      if (sourceHandle === 'data-out-exception' && localScope) {
        return localScope['__exception_msg__' + nodeId] ?? '';
      }
    }

    if (node.type === 'scanner') {
      return scannerValues.get(nodeId) ?? '';
    }

    return "";
  };

  // --- LOGIC EXECUTION ENGINE ---
  // Returns: 'break' | 'continue' | undefined (for normal flow)
  const runLogicChain = (startNodeId: string, startHandle: string = 'exec', localScope?: Record<string, unknown>): string | undefined => {
    let currentNodeId = startNodeId;
    let currentHandle = startHandle;
    let steps = 0;

    while (steps < 1000) {
      steps++;
      const execEdge = edges.find(e => 
        e.source === currentNodeId && e.sourceHandle?.includes(currentHandle)
      );
      
      if (!execEdge) break;
      const nextNode = nodes.find(n => n.id === execEdge.target);
      if (!nextNode) break;

      if (nextNode.type === 'print') {
        const dataEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in');
        const val = dataEdge
          ? evaluateData(dataEdge.source, dataEdge.sourceHandle || undefined, localScope)
          : ((nextNode.data.inlineValue as string) ?? "");
        consoleOutput.push(`> ${val}`); 
      }

      if (nextNode.type === 'callMethod') {
        const targetMethodName = nextNode.data.methodName;
        const methodDef = nodes.find(n => n.type === 'method' && n.data.label === targetMethodName);
        
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

          runLogicChain(methodDef.id, 'exec-out', methodScope);
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
      }

      if (nextNode.type === 'setLocalVar') {
        const localVarName = nextNode.data.localVarName as string;
        const dataEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in');
        if (localVarName && localScope) {
          localScope[localVarName] = dataEdge
            ? evaluateData(dataEdge.source, dataEdge.sourceHandle || undefined, localScope)
            : ((nextNode.data.inlineValue as string) ?? 0);
        }
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
      }

      if (nextNode.type === 'arrayListOp') {
        const op = nextNode.data.operation as string;
        const varName = (nextNode.data.variableName as string) || 'list';
        if (op === 'create') {
          arrayListMemory[varName] = [];
        } else if (op === 'add') {
          const valEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in-value');
          const val = evaluateData(valEdge?.source || "", valEdge?.sourceHandle || undefined, localScope);
          if (!arrayListMemory[varName]) arrayListMemory[varName] = [];
          arrayListMemory[varName].push(val);
        } else if (op === 'set') {
          const idxEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in-index');
          const valEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in-value');
          const idx = Number(evaluateData(idxEdge?.source || "", idxEdge?.sourceHandle || undefined, localScope));
          const val = evaluateData(valEdge?.source || "", valEdge?.sourceHandle || undefined, localScope);
          if (arrayListMemory[varName] && idx >= 0 && idx < arrayListMemory[varName].length) {
            arrayListMemory[varName][idx] = val;
          }
        } else if (op === 'remove') {
          const idxEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in-index');
          const idx = Number(evaluateData(idxEdge?.source || "", idxEdge?.sourceHandle || undefined, localScope));
          if (arrayListMemory[varName]) {
            arrayListMemory[varName].splice(idx, 1);
          }
        } else if (op === 'clear') {
          arrayListMemory[varName] = [];
        }
      }

      if (nextNode.type === 'hashMapOp') {
        const op = nextNode.data.operation as string;
        const varName = (nextNode.data.variableName as string) || 'map';
        if (op === 'create') {
          hashMapMemory[varName] = new Map();
        } else if (op === 'put') {
          const keyEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in-key');
          const valEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in-value');
          const key = evaluateData(keyEdge?.source || "", keyEdge?.sourceHandle || undefined, localScope);
          const val = evaluateData(valEdge?.source || "", valEdge?.sourceHandle || undefined, localScope);
          if (!hashMapMemory[varName]) hashMapMemory[varName] = new Map();
          hashMapMemory[varName].set(key, val);
        } else if (op === 'remove') {
          const keyEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in-key');
          const key = evaluateData(keyEdge?.source || "", keyEdge?.sourceHandle || undefined, localScope);
          hashMapMemory[varName]?.delete(key);
        }
      }

      if (nextNode.type === 'branch') {
        const condEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in');
        const condition = condEdge
          ? evaluateData(condEdge.source, condEdge.sourceHandle || undefined, localScope)
          : ((nextNode.data.inlineValue as string) === 'true');
        const signal = runLogicChain(nextNode.id, condition ? 'exec-out-true' : 'exec-out-false', localScope);
        if (signal === 'break' || signal === 'continue') return signal;
        break; 
      }

      if (nextNode.type === 'while') {
        const whileScope = localScope ? { ...localScope } : {};
        let whileSteps = 0;
        while (whileSteps < 1000) {
          whileSteps++;
          const condEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in');
          const condition = evaluateData(condEdge?.source || "", condEdge?.sourceHandle || undefined, whileScope);
          if (!condition) break;
          const signal = runLogicChain(nextNode.id, 'exec-body', whileScope);
          if (signal === 'break') break;
        }
        if (whileSteps >= 1000) consoleOutput.push('> ERROR: While loop exceeded step limit.');
        runLogicChain(nextNode.id, 'exec', localScope);
        break;
      }

      if (nextNode.type === 'for') {
        const startEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-start');
        const endEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-end');
        const startVal = Number(evaluateData(startEdge?.source || "", startEdge?.sourceHandle || undefined, localScope)) || 0;
        const endVal = Number(evaluateData(endEdge?.source || "", endEdge?.sourceHandle || undefined, localScope)) || 0;

        const forScope = localScope ? { ...localScope } : {};
        for (let i = startVal; i < endVal; i++) {
          forScope['__for_index__' + nextNode.id] = i;
          const signal = runLogicChain(nextNode.id, 'exec-body', forScope);
          if (signal === 'break') break;
          // 'continue' just skips to next iteration (default behavior)
        }
        runLogicChain(nextNode.id, 'exec', localScope);
        break;
      }

      if (nextNode.type === 'doWhile') {
        const loopScope = localScope ? { ...localScope } : {};
        let doWhileSteps = 0;
        do {
          if (doWhileSteps++ > 1000) { consoleOutput.push('> ERROR: Do-While loop exceeded step limit.'); break; }
          const signal = runLogicChain(nextNode.id, 'exec-body', loopScope);
          if (signal === 'break') break;
          const condEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in');
          const condition = evaluateData(condEdge?.source || "", condEdge?.sourceHandle || undefined, loopScope);
          if (!condition) break;
        } while (true);
        runLogicChain(nextNode.id, 'exec', localScope);
        break;
      }

      // Array Set: arr[idx] = value
      if (nextNode.type === 'arrayOp' && nextNode.data.operation === 'set') {
        const arrEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in-array');
        const idxEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in-index');
        const valEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in-value');
        const arr = evaluateData(arrEdge?.source || "", arrEdge?.sourceHandle || undefined, localScope);
        const idx = Number(evaluateData(idxEdge?.source || "", idxEdge?.sourceHandle || undefined, localScope));
        const val = evaluateData(valEdge?.source || "", valEdge?.sourceHandle || undefined, localScope);
        if (Array.isArray(arr) && idx >= 0 && idx < arr.length) {
          arr[idx] = val;
        }
      }

      // For-Each: iterate over array elements
      if (nextNode.type === 'forEach') {
        const arrEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in-array');
        const arr = evaluateData(arrEdge?.source || "", arrEdge?.sourceHandle || undefined, localScope);
        if (Array.isArray(arr)) {
          const feScope = localScope ? { ...localScope } : {};
          for (let i = 0; i < arr.length; i++) {
            feScope['__forEach_elem__' + nextNode.id] = arr[i];
            feScope['__forEach_idx__' + nextNode.id] = i;
            const signal = runLogicChain(nextNode.id, 'exec-body', feScope);
            if (signal === 'break') break;
          }
        }
        runLogicChain(nextNode.id, 'exec-out', localScope);
        break;
      }

      if (nextNode.type === 'switch') {
        const valEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in');
        const switchVal = evaluateData(valEdge?.source || "", valEdge?.sourceHandle || undefined, localScope);
        const caseCount = (nextNode.data.caseCount as number) || 2;
        let matched = false;
        for (let i = 0; i < caseCount; i++) {
          const caseEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === `data-case-${i}`);
          const caseVal = evaluateData(caseEdge?.source || "", caseEdge?.sourceHandle || undefined, localScope);
          if (switchVal == caseVal) {
            runLogicChain(nextNode.id, `exec-case-${i}`, localScope);
            matched = true;
            break;
          }
        }
        if (!matched) {
          runLogicChain(nextNode.id, 'exec-default', localScope);
        }
        runLogicChain(nextNode.id, 'exec', localScope);
        break;
      }

      if (nextNode.type === 'tryCatchFinally') {
        const tcfScope = localScope ? { ...localScope } : {};
        try {
          runLogicChain(nextNode.id, 'exec-try', tcfScope);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          tcfScope['__exception_msg__' + nextNode.id] = msg;
          consoleOutput.push(`> CAUGHT: ${msg}`);
          runLogicChain(nextNode.id, 'exec-catch', tcfScope);
        } finally {
          runLogicChain(nextNode.id, 'exec-finally', tcfScope);
        }
        runLogicChain(nextNode.id, 'exec-out', localScope);
        break;
      }

      if (nextNode.type === 'throw') {
        const msgEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in');
        const message = msgEdge
          ? String(evaluateData(msgEdge.source, msgEdge.sourceHandle || undefined, localScope))
          : ((nextNode.data.inlineValue as string) || 'Error');
        throw new Error(message);
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
      }

      if (nextNode.type === 'return') {
        break;
      }

      if (nextNode.type === 'break') {
        return 'break';
      }

      if (nextNode.type === 'continue') {
        return 'continue';
      }

      currentNodeId = nextNode.id;
      currentHandle = 'exec';
    }
    return undefined;
  };

  consoleOutput.push(`> Starting JVM...`);
  runLogicChain(mainNode.id);
  consoleOutput.push("> Process finished.");
  return consoleOutput;
}