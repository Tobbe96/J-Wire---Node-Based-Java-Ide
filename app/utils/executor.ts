import { Node, Edge } from '@xyflow/react';
import { getRuntimeDefault } from './theme';
import type { Parameter, LocalVariable } from './nodeTypes';

export function executeGraph(nodes: Node[], edges: Edge[]): string[] {
  const consoleOutput: string[] = [];
  const runtimeMemory: Record<string, unknown> = {};
  
  // 1. Initialize Memory (Variables)
  nodes.filter(n => n.type === 'java').forEach(n => {
    const varName = n.data.label as string;
    runtimeMemory[varName] = n.data.type === 'int' ? Number(n.data.value) : String(n.data.value);
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
    
    if (node.type === 'print') {
      const dataEdge = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
      return dataEdge ? evaluateData(dataEdge.source, dataEdge.sourceHandle || undefined, localScope) : "";
    }
    
    if (node.type === 'math') {
      const edgeA = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-a');
      const edgeB = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-b');
      const valA = evaluateData(edgeA?.source || "", edgeA?.sourceHandle || undefined, localScope);
      const valB = evaluateData(edgeB?.source || "", edgeB?.sourceHandle || undefined, localScope);

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
      if (op === 'abs') {
        const edgeIn = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
        const val = evaluateData(edgeIn?.source || "", edgeIn?.sourceHandle || undefined, localScope);
        return Math.abs(Number(val));
      }
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
        case 'int': return parseInt(String(val), 10) || 0;
        case 'float':
        case 'double': return parseFloat(String(val)) || 0;
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
          return arrayType === 'int'
            ? items.map(v => Number(v))
            : items.map(v => String(v));
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

    if (node.type === 'for') {
      if (localScope && ('__for_index__' + nodeId) in localScope) {
        return localScope['__for_index__' + nodeId];
      }
      return 0;
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
        const val = evaluateData(dataEdge?.source || "", dataEdge?.sourceHandle || undefined, localScope);
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
          runtimeMemory[varName] = evaluateData(dataEdge?.source || "", dataEdge?.sourceHandle || undefined, localScope);
        }
      }

      if (nextNode.type === 'setLocalVar') {
        const localVarName = nextNode.data.localVarName as string;
        const dataEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in');
        if (localVarName && localScope) {
          localScope[localVarName] = evaluateData(dataEdge?.source || "", dataEdge?.sourceHandle || undefined, localScope);
        }
      }

      if (nextNode.type === 'branch') {
        const condEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in');
        const condition = evaluateData(condEdge?.source || "", condEdge?.sourceHandle || undefined, localScope);
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