import { Node, Edge } from '@xyflow/react';
import { getDefaultLiteral } from '../theme';
import type { Parameter, LocalVariable, ProjectClassInfo } from '../nodeTypes';
import { SCANNER_JAVA_TYPES } from './types';

/** Returns the Java output type of a node for a given source handle. */
function resolveNodeOutputType(node: Node, sourceHandle?: string): string | null {
  if (node.type === 'java' || node.type === 'getter') return (node.data.type as string) || null;
  if (node.type === 'literal') return (node.data.literalType as string) || 'String';
  if (node.type === 'scanner') {
    return SCANNER_JAVA_TYPES[(node.data.readType as string) || 'nextLine'] || 'String';
  }
  if (node.type === 'cast') return (node.data.targetType as string) || 'String';
  if (node.type === 'stringOp') {
    const op = node.data.operation as string;
    if (op === 'length' || op === 'indexOf' || op === 'compareTo') return 'int';
    if (op === 'contains' || op === 'startsWith' || op === 'endsWith' || op === 'equalsIgnoreCase' || op === 'matches' || op === 'isEmpty') return 'boolean';
    return 'String';
  }
  if (node.type === 'method' && sourceHandle) {
    const paramMatch = sourceHandle.match(/^param-out-(\d+)$/);
    if (paramMatch) {
      const params = (node.data.parameters as Parameter[]) || [];
      return params[parseInt(paramMatch[1], 10)]?.type || null;
    }
    const localMatch = sourceHandle.match(/^local-out-(\d+)$/);
    if (localMatch) {
      const locals = (node.data.localVariables as LocalVariable[]) || [];
      return locals[parseInt(localMatch[1], 10)]?.type || null;
    }
  }
  if (node.type === 'instanceOf') return 'boolean';
  if (node.type === 'arraysUtil') {
    const op = node.data.operation as string;
    if (op === 'equals') return 'boolean';
    if (op === 'toString') return 'String';
    return null;
  }
  return (node.data.type as string) || null;
}

/**
 * Creates the `evaluateDataNode` closure.
 * The returned function recursively resolves a node + source-handle to a Java expression string.
 * `scannerVarMap` is a shared map that gets written by the body builder and read here.
 */
export function createEvaluateDataNode(
  nodes: Node[],
  edges: Edge[],
  projectClasses: ProjectClassInfo[],
  scannerVarMap: Map<string, string>,
): (nodeId: string, sourceHandle?: string) => string {
  // O(1) lookup indexes built once per compilation
  const nodeIndex = new Map<string, Node>(nodes.map(n => [n.id, n]));
  const targetEdgeIndex = new Map<string, Edge>(
    edges.filter(e => e.targetHandle).map(e => [`${e.target}:${e.targetHandle}`, e]),
  );

  const edgeAt = (targetId: string, handle: string): Edge | undefined =>
    targetEdgeIndex.get(`${targetId}:${handle}`);

  const evaluateDataNode = (nodeId: string, sourceHandle?: string): string => {
    const node = nodeIndex.get(nodeId);
    if (!node) return 'null';

    if (node.type === 'method' && sourceHandle) {
      const paramMatch = sourceHandle.match(/^param-out-(\d+)$/);
      if (paramMatch) {
        const params = (node.data.parameters as Parameter[]) || [];
        return params[parseInt(paramMatch[1], 10)]?.name || 'null';
      }
      const localMatch = sourceHandle.match(/^local-out-(\d+)$/);
      if (localMatch) {
        const locals = (node.data.localVariables as LocalVariable[]) || [];
        return locals[parseInt(localMatch[1], 10)]?.name || 'null';
      }
    }

    if (node.type === 'java') return node.data.label as string;
    if (node.type === 'getter') return node.data.label as string;

    if (node.type === 'literal') {
      const litType = (node.data.literalType as string) || 'String';
      const rawVal = (node.data.value as string) || '';
      switch (litType) {
        case 'String': return `"${rawVal}"`;
        case 'float': return rawVal.includes('f') ? rawVal : `${rawVal}f`;
        case 'long': return rawVal.endsWith('L') ? rawVal : `${rawVal}L`;
        case 'enum': return rawVal || 'null';
        default: return rawVal || '0';
      }
    }

    if (node.type === 'math') {
      const edgeA = edgeAt(nodeId, 'data-in-a');
      const edgeB = edgeAt(nodeId, 'data-in-b');
      const valA = edgeA ? evaluateDataNode(edgeA.source, edgeA.sourceHandle || undefined) : ((node.data.inlineA as string) || '0');
      const valB = edgeB ? evaluateDataNode(edgeB.source, edgeB.sourceHandle || undefined) : ((node.data.inlineB as string) || '0');
      const op = node.data.operation as string;
      if ((op === '==' || op === '!=') && edgeA) {
        const srcNode = nodeIndex.get(edgeA.source);
        const srcType = srcNode ? resolveNodeOutputType(srcNode, edgeA.sourceHandle || undefined) : null;
        if (srcType === 'String') {
          return op === '==' ? `${valA}.equals(${valB})` : `!${valA}.equals(${valB})`;
        }
      }
      return `(${valA} ${op} ${valB})`;
    }

    if (node.type === 'not') {
      const op = (node.data.operation as string) || '!';
      const edgeA = edgeAt(nodeId, 'data-in');
      const val = edgeA ? evaluateDataNode(edgeA.source, edgeA.sourceHandle || undefined) : (op === '~' ? '0' : 'false');
      return `(${op}${val})`;
    }

    if (node.type === 'stringOp') {
      const ev = (h: string) => {
        const e = edgeAt(nodeId, h);
        return e ? evaluateDataNode(e.source, e.sourceHandle || undefined) : '""';
      };
      switch (node.data.operation) {
        case 'concat': return `(${ev('data-in-a')} + ${ev('data-in-b')})`;
        case 'length': return `${ev('data-in')}.length()`;
        case 'substring': return `${ev('data-in')}.substring(${ev('data-in-start')}, ${ev('data-in-end')})`;
        case 'charAt': return `String.valueOf(${ev('data-in')}.charAt(${ev('data-in-index')}))`;
        case 'indexOf': return `${ev('data-in')}.indexOf(${ev('data-in-target')})`;
        case 'replace': return `${ev('data-in')}.replace(${ev('data-in-target')}, ${ev('data-in-replacement')})`;
        case 'trim': return `${ev('data-in')}.trim()`;
        case 'toUpperCase': return `${ev('data-in')}.toUpperCase()`;
        case 'toLowerCase': return `${ev('data-in')}.toLowerCase()`;
        case 'split': return `${ev('data-in')}.split(${ev('data-in-delimiter')})`;
        case 'contains': return `${ev('data-in')}.contains(${ev('data-in-target')})`;
        case 'startsWith': return `${ev('data-in')}.startsWith(${ev('data-in-target')})`;
        case 'endsWith': return `${ev('data-in')}.endsWith(${ev('data-in-target')})`;
        case 'equalsIgnoreCase': return `${ev('data-in')}.equalsIgnoreCase(${ev('data-in-other')})`;
        case 'matches': return `${ev('data-in')}.matches(${ev('data-in-regex')})`;
        case 'replaceAll': return `${ev('data-in')}.replaceAll(${ev('data-in-regex')}, ${ev('data-in-replacement')})`;
        case 'isEmpty': return `${ev('data-in')}.isEmpty()`;
        case 'compareTo': return `${ev('data-in')}.compareTo(${ev('data-in-other')})`;
        default: return '""';
      }
    }

    if (node.type === 'mathFunc') {
      const op = node.data.operation as string;
      if (['abs','sqrt','ceil','floor','round','log','log10','sin','cos','tan','asin','acos','atan'].includes(op)) {
        const edgeIn = edgeAt(nodeId, 'data-in');
        const val = edgeIn ? evaluateDataNode(edgeIn.source, edgeIn.sourceHandle || undefined) : '0';
        if (op === 'abs') return `Math.abs(${val})`;
        if (op === 'sqrt') return `Math.sqrt(${val})`;
        if (op === 'ceil') return `Math.ceil(${val})`;
        if (op === 'floor') return `Math.floor(${val})`;
        if (op === 'round') return `Math.round(${val})`;
        if (op === 'log') return `Math.log(${val})`;
        if (op === 'log10') return `Math.log10(${val})`;
        if (op === 'sin') return `Math.sin(${val})`;
        if (op === 'cos') return `Math.cos(${val})`;
        if (op === 'tan') return `Math.tan(${val})`;
        if (op === 'asin') return `Math.asin(${val})`;
        if (op === 'acos') return `Math.acos(${val})`;
        if (op === 'atan') return `Math.atan(${val})`;
      }
      if (op === 'random') return 'Math.random()';
      const edgeA = edgeAt(nodeId, 'data-in-a');
      const edgeB = edgeAt(nodeId, 'data-in-b');
      const valA = edgeA ? evaluateDataNode(edgeA.source, edgeA.sourceHandle || undefined) : '0';
      const valB = edgeB ? evaluateDataNode(edgeB.source, edgeB.sourceHandle || undefined) : '0';
      if (op === 'pow') return `Math.pow(${valA}, ${valB})`;
      return `Math.${op}(${valA}, ${valB})`;
    }

    if (node.type === 'cast') {
      const edgeIn = edgeAt(nodeId, 'data-in');
      const val = edgeIn ? evaluateDataNode(edgeIn.source, edgeIn.sourceHandle || undefined) : 'null';
      const targetType = (node.data.targetType as string) || 'String';
      switch (targetType) {
        case 'int':     return `Integer.parseInt(String.valueOf(${val}))`;
        case 'float':   return `Float.parseFloat(String.valueOf(${val}))`;
        case 'double':  return `Double.parseDouble(String.valueOf(${val}))`;
        case 'long':    return `Long.parseLong(String.valueOf(${val}))`;
        case 'short':   return `Short.parseShort(String.valueOf(${val}))`;
        case 'byte':    return `Byte.parseByte(String.valueOf(${val}))`;
        case 'boolean': return `Boolean.parseBoolean(String.valueOf(${val}))`;
        case 'String':  return `String.valueOf(${val})`;
        default:        return `(${targetType})${val}`;
      }
    }

    if (node.type === 'ternary') {
      const ev = (h: string, fallback: string) => {
        const e = edgeAt(nodeId, h);
        return e ? evaluateDataNode(e.source, e.sourceHandle || undefined) : fallback;
      };
      const cond = ev('data-in-condition', 'false');
      const trueVal = ev('data-in-true', (node.data.inlineTrue as string) || 'null');
      const falseVal = ev('data-in-false', (node.data.inlineFalse as string) || 'null');
      return `(${cond} ? ${trueVal} : ${falseVal})`;
    }

    if (node.type === 'arrayOp') {
      switch (node.data.operation) {
        case 'literal': {
          const arrayType = (node.data.arrayType as string) || 'int';
          const items = ((node.data.values as string) || '').split(',').map(v => v.trim()).filter(Boolean);
          let formatted: string;
          if (arrayType === 'String') formatted = items.map(v => `"${v}"`).join(', ');
          else if (arrayType === 'float') formatted = items.map(v => v.includes('.') ? v + 'f' : v + '.0f').join(', ');
          else if (arrayType === 'long') formatted = items.map(v => v + 'L').join(', ');
          else formatted = items.join(', ');
          return `new ${arrayType}[]{${formatted}}`;
        }
        case 'new': {
          const arrayType = (node.data.arrayType as string) || 'int';
          const sizeEdge = edgeAt(nodeId, 'data-in-size');
          const sizeExpr = sizeEdge ? evaluateDataNode(sizeEdge.source, sizeEdge.sourceHandle || undefined) : '0';
          return `new ${arrayType}[${sizeExpr}]`;
        }
        case 'access': {
          const edgeArr = edgeAt(nodeId, 'data-in-array');
          const edgeIdx = edgeAt(nodeId, 'data-in-index');
          const arrExpr = edgeArr ? evaluateDataNode(edgeArr.source, edgeArr.sourceHandle || undefined) : 'null';
          const idxExpr = edgeIdx ? evaluateDataNode(edgeIdx.source, edgeIdx.sourceHandle || undefined) : '0';
          return `${arrExpr}[${idxExpr}]`;
        }
        case 'length': {
          const edgeIn = edgeAt(nodeId, 'data-in');
          const arrExpr = edgeIn ? evaluateDataNode(edgeIn.source, edgeIn.sourceHandle || undefined) : 'null';
          return `${arrExpr}.length`;
        }
        default: return 'null';
      }
    }

    if (node.type === 'stringFormat') {
      const fmt = (node.data.formatString as string) || '';
      const argCount = (node.data.argCount as number) || 0;
      const args: string[] = [];
      for (let i = 0; i < argCount; i++) {
        const argEdge = edgeAt(nodeId, `data-in-arg-${i}`);
        args.push(argEdge ? evaluateDataNode(argEdge.source, argEdge.sourceHandle || undefined) : '""');
      }
      return args.length > 0
        ? `String.format("${fmt}", ${args.join(', ')})`
        : `String.format("${fmt}")`;
    }

    if (node.type === 'arrayListOp') {
      const op = node.data.operation as string;
      const varName = (node.data.variableName as string) || 'list';
      const ev = (h: string) => {
        const e = edgeAt(nodeId, h);
        return e ? evaluateDataNode(e.source, e.sourceHandle || undefined) : 'null';
      };
      if (op === 'get') return `${varName}.get(${ev('data-in-index')})`;
      if (op === 'size') return `${varName}.size()`;
      if (op === 'contains') return `${varName}.contains(${ev('data-in-value')})`;
      if (op === 'indexOf') return `${varName}.indexOf(${ev('data-in-value')})`;
      if (op === 'lastIndexOf') return `${varName}.lastIndexOf(${ev('data-in-value')})`;
      return 'null';
    }

    if (node.type === 'hashMapOp') {
      const op = node.data.operation as string;
      const varName = (node.data.variableName as string) || 'map';
      const ev = (h: string) => {
        const e = edgeAt(nodeId, h);
        return e ? evaluateDataNode(e.source, e.sourceHandle || undefined) : 'null';
      };
      if (op === 'get') return `${varName}.get(${ev('data-in-key')})`;
      if (op === 'containsKey') return `${varName}.containsKey(${ev('data-in-key')})`;
      if (op === 'size') return `${varName}.size()`;
      if (op === 'keySet') return `${varName}.keySet()`;
      if (op === 'getOrDefault') return `${varName}.getOrDefault(${ev('data-in-key')}, ${ev('data-in-default')})`;
      if (op === 'values') return `${varName}.values()`;
      if (op === 'entrySet') return `${varName}.entrySet()`;
      return 'null';
    }

    if (node.type === 'hashSetOp') {
      const op = node.data.operation as string;
      const varName = (node.data.variableName as string) || 'set';
      const ev = (h: string) => {
        const e = edgeAt(nodeId, h);
        return e ? evaluateDataNode(e.source, e.sourceHandle || undefined) : 'null';
      };
      if (op === 'contains') return `${varName}.contains(${ev('data-in-value')})`;
      if (op === 'size') return `${varName}.size()`;
      return 'null';
    }

    if (node.type === 'forEach') {
      if (sourceHandle === 'data-out-element') return '__elem__';
      if (sourceHandle === 'data-out-index') return '__idx__';
      return '""';
    }

    if (node.type === 'for') return 'i';

    if (node.type === 'tryCatchFinally') {
      if (sourceHandle === 'data-out-exception') return 'e.getMessage()';
      const exMsgMatch = sourceHandle?.match(/^data-out-exception-(\d+)$/);
      if (exMsgMatch) {
        const catches = node.data.catches as Array<{exceptionType: string; exceptionVarName: string}> | undefined;
        const idx = parseInt(exMsgMatch[1], 10);
        const exVar = catches?.[idx]?.exceptionVarName || 'e';
        return `${exVar}.getMessage()`;
      }
    }

    if (node.type === 'scanner') return scannerVarMap.get(nodeId) || 'null';

    if (node.type === 'callStaticMethod') {
      const targetClass = node.data.targetClass as string;
      const methodName = node.data.methodName as string;
      if (targetClass && methodName) {
        const targetFile = projectClasses.find(f => f.className === targetClass);
        const targetParams = targetFile?.methods.find(m => m.name === methodName)?.parameters || [];
        const args = targetParams.map((p: Parameter, index: number) => {
          const argEdge = edgeAt(nodeId, `arg-in-${index}`);
          return argEdge ? evaluateDataNode(argEdge.source, argEdge.sourceHandle || undefined) : getDefaultLiteral(p.type);
        });
        return `${targetClass}.${methodName}(${args.join(', ')})`;
      }
      return 'null';
    }

    if (node.type === 'newObject') {
      const targetClass = node.data.targetClass as string;
      if (targetClass) {
        const targetFile = projectClasses.find(f => f.className === targetClass);
        const ctorIndex = (node.data.constructorIndex as number) || 0;
        const ctors = (targetFile as unknown as { constructors?: Array<{ index: number; parameters: Parameter[] }> })?.constructors || [];
        const ctor = ctors[ctorIndex] || { parameters: [] };
        const args = ctor.parameters.map((p: Parameter, index: number) => {
          const argEdge = edgeAt(nodeId, `arg-in-${index}`);
          return argEdge ? evaluateDataNode(argEdge.source, argEdge.sourceHandle || undefined) : getDefaultLiteral(p.type);
        });
        return `new ${targetClass}(${args.join(', ')})`;
      }
      return 'null';
    }

    if (node.type === 'callInstanceMethod') {
      const fullMethodName = node.data.methodName as string;
      if (fullMethodName?.includes('.')) {
        const [targetClass, methodName] = fullMethodName.split('.');
        const targetFile = projectClasses.find(f => f.className === targetClass);
        const targetMethod = targetFile?.methods.find(m => m.name === methodName);
        const targetParams = targetMethod?.parameters || [];
        const objEdge = edgeAt(nodeId, 'obj-in');
        const objExpr = objEdge ? evaluateDataNode(objEdge.source, objEdge.sourceHandle || undefined) : 'null';
        const args = targetParams.map((p: Parameter, index: number) => {
          const argEdge = edgeAt(nodeId, `arg-in-${index}`);
          return argEdge ? evaluateDataNode(argEdge.source, argEdge.sourceHandle || undefined) : getDefaultLiteral(p.type);
        });
        return `(${objExpr}).${methodName}(${args.join(', ')})`;
      }
      return 'null';
    }

    if (node.type === 'customCode' && node.data.mode === 'expression') {
      let code = (node.data.code as string) || '0';
      const inputs = (node.data.inputs as Array<{id: string; name: string; type: string}>) || [];
      inputs.forEach((input, index) => {
        const inputEdge = edgeAt(nodeId, `custom-in-${index}`);
        const val = inputEdge ? evaluateDataNode(inputEdge.source, inputEdge.sourceHandle || undefined) : getDefaultLiteral(input.type);
        code = code.replaceAll(input.name, `(${val})`);
      });
      return `(${code})`;
    }

    if (node.type === 'stackOp') {
      const op = node.data.operation as string;
      const varName = (node.data.variableName as string) || 'myStack';
      if (op === 'peek') return `${varName}.peek()`;
      if (op === 'isEmpty') return `${varName}.isEmpty()`;
      if (op === 'size') return `${varName}.size()`;
      if (op === 'pop') return `${varName}.pop()`;
      return 'null';
    }

    if (node.type === 'queueOp') {
      const op = node.data.operation as string;
      const varName = (node.data.variableName as string) || 'myQueue';
      if (op === 'peek') return `${varName}.peek()`;
      if (op === 'isEmpty') return `${varName}.isEmpty()`;
      if (op === 'size') return `${varName}.size()`;
      if (op === 'poll') return `${varName}.poll()`;
      return 'null';
    }

    if (node.type === 'dequeOp') {
      const op = node.data.operation as string;
      const varName = (node.data.variableName as string) || 'myDeque';
      if (op === 'peekFirst') return `${varName}.peekFirst()`;
      if (op === 'peekLast') return `${varName}.peekLast()`;
      if (op === 'pollFirst') return `${varName}.pollFirst()`;
      if (op === 'pollLast') return `${varName}.pollLast()`;
      if (op === 'isEmpty') return `${varName}.isEmpty()`;
      if (op === 'size') return `${varName}.size()`;
      return 'null';
    }

    if (node.type === 'priorityQueueOp') {
      const op = node.data.operation as string;
      const varName = (node.data.variableName as string) || 'myPQ';
      if (op === 'peek') return `${varName}.peek()`;
      if (op === 'isEmpty') return `${varName}.isEmpty()`;
      if (op === 'size') return `${varName}.size()`;
      if (op === 'poll') return `${varName}.poll()`;
      return 'null';
    }

    if (node.type === 'algorithm') {
      const op = node.data.operation as string;
      const ev = (h: string) => {
        const e = edgeAt(nodeId, h);
        return e ? evaluateDataNode(e.source, e.sourceHandle || undefined) : 'null';
      };
      if (op === 'binarySearch') return `java.util.Arrays.binarySearch(${ev('data-in-array')}, ${ev('data-in-target')})`;
      if (op === 'linearSearch') return `java.util.Arrays.asList(${ev('data-in-array')}).indexOf(${ev('data-in-target')})`;
      if (op === 'mergeSort') return `java.util.Arrays.stream(${ev('data-in-array')}).sorted().toArray()`;
      if (op === 'inorderTraversal')   return `bstInorder(${ev('data-in-root')})`;
      if (op === 'preorderTraversal')  return `bstPreorder(${ev('data-in-root')})`;
      if (op === 'postorderTraversal') return `bstPostorder(${ev('data-in-root')})`;
      if (op === 'dijkstra')    return `dijkstra(${ev('data-in-graph')}, ${ev('data-in-start')}, ${ev('data-in-end')})`;
      if (op === 'bellmanFord') return `bellmanFord(${ev('data-in-graph')}, ${ev('data-in-start')}, ${ev('data-in-end')})`;
      return 'null';
    }

    if (node.type === 'instanceOf') {
      const typeName = (node.data.typeName as string) || 'Object';
      const edgeIn = edgeAt(nodeId, 'data-in');
      const val = edgeIn ? evaluateDataNode(edgeIn.source, edgeIn.sourceHandle || undefined) : 'null';
      return `(${val} instanceof ${typeName})`;
    }

    if (node.type === 'arraysUtil') {
      const op = node.data.operation as string;
      const ev = (h: string) => {
        const e = edgeAt(nodeId, h);
        return e ? evaluateDataNode(e.source, e.sourceHandle || undefined) : 'null';
      };
      if (op === 'copyOf') return `Arrays.copyOf(${ev('data-in-array')}, ${ev('data-in-length')})`;
      if (op === 'equals') return `Arrays.equals(${ev('data-in-a')}, ${ev('data-in-b')})`;
      if (op === 'toString') return `Arrays.toString(${ev('data-in')})`;
      return 'null';
    }


    // --- Tree Node Ops (data) ---

    if (node.type === 'treeNodeOp') {
      const op = node.data.operation as string;
      const varName = (node.data.variableName as string) || 'node';
      const ev = (h: string) => { const e = edgeAt(nodeId, h); return e ? evaluateDataNode(e.source, e.sourceHandle || undefined) : 'null'; };
      if (op === 'getValue')  return `${varName}.val`;
      if (op === 'getLeft')   return `${varName}.left`;
      if (op === 'getRight')  return `${varName}.right`;
      if (op === 'isNull')    return `(${varName} == null)`;
      if (op === 'hasLeft')   return `(${varName}.left != null)`;
      if (op === 'hasRight')  return `(${varName}.right != null)`;
      if (op === 'setValue')  return `${varName}.val`;
      if (op === 'setLeft')   return `${varName}.left`;
      if (op === 'setRight')  return `${varName}.right`;
      return 'null';
    }

    if (node.type === 'bstOp') {
      const op = node.data.operation as string;
      const varName = (node.data.variableName as string) || 'root';
      const ev = (h: string) => { const e = edgeAt(nodeId, h); return e ? evaluateDataNode(e.source, e.sourceHandle || undefined) : 'null'; };
      if (op === 'search' || op === 'contains') return `bstSearch(${varName}, ${ev('data-in-value')})`;
      if (op === 'min')       return `bstMin(${varName})`;
      if (op === 'max')       return `bstMax(${varName})`;
      if (op === 'height')    return `bstHeight(${varName})`;
      if (op === 'size')      return `bstSize(${varName})`;
      if (op === 'inorder')   return `bstInorder(${varName})`;
      if (op === 'preorder')  return `bstPreorder(${varName})`;
      if (op === 'postorder') return `bstPostorder(${varName})`;
      return 'null';
    }

    if (node.type === 'avlTreeOp') {
      const op = node.data.operation as string;
      const varName = (node.data.variableName as string) || 'root';
      const ev = (h: string) => { const e = edgeAt(nodeId, h); return e ? evaluateDataNode(e.source, e.sourceHandle || undefined) : 'null'; };
      if (op === 'search')  return `avlSearch(${varName}, ${ev('data-in-value')})`;
      if (op === 'height')  return `avlHeight(${varName})`;
      if (op === 'size')    return `avlSize(${varName})`;
      if (op === 'inorder') return `avlInorder(${varName})`;
      return 'null';
    }

    // --- JavaFX data-only ops ---
    if (node.type === 'javafxControlOp') {
      const op = node.data.operation as string;
      const varName = (node.data.variableName as string) || 'control';
      if (op === 'getText') return `${varName}.getText()`;
      if (op === 'getValue') return `${varName}.getValue()`;
      if (op === 'isSelected') return `${varName}.isSelected()`;
      return varName;
    }

    if (node.type === 'javafxDialogOp') {
      const op = node.data.operation as string;
      if (op === 'textInputDialog') return '__textInput';
      if (op === 'choiceDialog') return '__choice';
      if (op === 'alertConfirm') return '__confirmed';
      return 'null';
    }

    if (node.type === 'javafxTableOp') {
      const op = node.data.operation as string;
      const varName = (node.data.variableName as string) || 'table';
      if (op === 'getSelectedItem') return `${varName}.getSelectionModel().getSelectedItem()`;
      return varName;
    }

    if (node.type === 'javafxListOp') {
      const op = node.data.operation as string;
      const varName = (node.data.variableName as string) || 'listView';
      if (op === 'getSelectedItem') return `${varName}.getSelectionModel().getSelectedItem()`;
      return varName;
    }

    if (node.type === 'javafxStyleOp') {
      const op = node.data.operation as string;
      const varName = (node.data.variableName as string) || 'node';
      if (op === 'getStyleClass') return `${varName}.getStyleClass().toString()`;
      return varName;
    }

    if (node.type === 'javafxLayoutOp' || node.type === 'javafxStageOp' ||
        node.type === 'javafxSceneOp' || node.type === 'javafxMenuOp' ||
        node.type === 'javafxMediaOp' || node.type === 'javafxChartOp') {
      return (node.data.variableName as string) || 'fxNode';
    }

    return '""';
  };

  return evaluateDataNode;
}
