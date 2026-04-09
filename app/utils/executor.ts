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
        case '>': return Number(valA) > Number(valB);
        case '==': return valA == valB;
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
        default: return "";
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
  const runLogicChain = (startNodeId: string, startHandle: string = 'exec', localScope?: Record<string, unknown>) => {
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
          // Build argument scope from wired inputs
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
        runLogicChain(nextNode.id, condition ? 'exec-out-true' : 'exec-out-false', localScope);
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
          runLogicChain(nextNode.id, 'exec-body', forScope);
        }
        runLogicChain(nextNode.id, 'exec', localScope);
        break;
      }

      if (nextNode.type === 'return') {
        break;
      }

      currentNodeId = nextNode.id;
      currentHandle = 'exec';
    }
  };

  consoleOutput.push(`> Starting JVM...`);
  runLogicChain(mainNode.id);
  consoleOutput.push("> Process finished.");
  return consoleOutput;
}