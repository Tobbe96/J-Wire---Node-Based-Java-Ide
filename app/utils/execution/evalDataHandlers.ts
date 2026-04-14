import type { Executor, TreeJsNode } from './Executor';
import { sandboxExpression } from './sandbox';
import { getRuntimeDefault } from '../theme';
import type { Parameter, LocalVariable } from '../nodeTypes';
import type { ProjectFile } from '../../store/editorStore';
import { Node } from '@xyflow/react';

// ─── Tree JS helpers ──────────────────────────────────────────────────────────

function bstSearch(node: TreeJsNode | null, val: unknown): boolean {
  if (!node) return false;
  if (node.val === val) return true;
  const n = Number(node.val), v = Number(val);
  return v < n ? bstSearch(node.left, val) : bstSearch(node.right, val);
}

function bstMin(node: TreeJsNode | null): unknown {
  if (!node) return null;
  return node.left ? bstMin(node.left) : node.val;
}

function bstMax(node: TreeJsNode | null): unknown {
  if (!node) return null;
  return node.right ? bstMax(node.right) : node.val;
}

function treeHeight(node: TreeJsNode | null): number {
  if (!node) return 0;
  return 1 + Math.max(treeHeight(node.left), treeHeight(node.right));
}

function treeSize(node: TreeJsNode | null): number {
  if (!node) return 0;
  return 1 + treeSize(node.left) + treeSize(node.right);
}

function inorder(node: TreeJsNode | null, out: unknown[]): void {
  if (!node) return;
  inorder(node.left, out);
  out.push(node.val);
  inorder(node.right, out);
}

function preorder(node: TreeJsNode | null, out: unknown[]): void {
  if (!node) return;
  out.push(node.val);
  preorder(node.left, out);
  preorder(node.right, out);
}

function postorder(node: TreeJsNode | null, out: unknown[]): void {
  if (!node) return;
  postorder(node.left, out);
  postorder(node.right, out);
  out.push(node.val);
}

// Dijkstra (adjacency matrix, 0 = no edge)
function dijkstraJS(graph: unknown[][], start: number, end: number): number {
  const n = graph.length;
  const dist = Array(n).fill(Infinity);
  const visited = Array(n).fill(false);
  dist[start] = 0;
  for (let i = 0; i < n; i++) {
    let u = -1;
    for (let j = 0; j < n; j++) if (!visited[j] && (u === -1 || dist[j] < dist[u])) u = j;
    if (u === -1 || dist[u] === Infinity) break;
    visited[u] = true;
    for (let v = 0; v < n; v++) {
      const w = Number(graph[u][v]);
      if (w > 0 && dist[u] + w < dist[v]) dist[v] = dist[u] + w;
    }
  }
  return dist[end] === Infinity ? -1 : dist[end];
}

// Bellman-Ford (adjacency matrix, 0 = no edge)
function bellmanFordJS(graph: unknown[][], start: number, end: number): number {
  const n = graph.length;
  const dist = Array(n).fill(Infinity);
  dist[start] = 0;
  for (let i = 0; i < n - 1; i++) {
    for (let u = 0; u < n; u++) {
      for (let v = 0; v < n; v++) {
        const w = Number(graph[u][v]);
        if (w > 0 && dist[u] !== Infinity && dist[u] + w < dist[v]) dist[v] = dist[u] + w;
      }
    }
  }
  return dist[end] === Infinity ? -1 : dist[end];
}

/**
 * Implementation of `Executor.evaluateData`, extracted to keep `Executor.ts` lean.
 * All `this.xxx` references are replaced with `exec.xxx`.
 */
export function evalDataImpl(
  exec: Executor,
  nodeId: string,
  sourceHandle?: string,
  localScope?: Record<string, unknown>,
): unknown {
  const node = exec.nodes.find(n => n.id === nodeId);
  if (!node) return null;

  if ((node.type === 'method' || node.type === 'constructor') && sourceHandle) {
    const paramMatch = sourceHandle.match(/^param-out-(\d+)$/);
    if (paramMatch && localScope) {
      const params = (node.data.parameters as Parameter[]) || [];
      const paramName = params[parseInt(paramMatch[1], 10)]?.name;
      if (paramName && paramName in localScope) return localScope[paramName];
      return null;
    }
    const localMatch = sourceHandle.match(/^local-out-(\d+)$/);
    if (localMatch && localScope) {
      const locals = (node.data.localVariables as LocalVariable[]) || [];
      const localName = locals[parseInt(localMatch[1], 10)]?.name;
      if (localName && localName in localScope) return localScope[localName];
      return null;
    }
  }

  if (node.type === 'java') return exec.runtimeMemory[node.data.label as string];
  if (node.type === 'getter') {
    const varName = node.data.label as string;
    if (localScope && varName in localScope) return localScope[varName];
    return exec.runtimeMemory[varName] ?? 0;
  }

  if (node.type === 'literal') {
    const litType = (node.data.literalType as string) || 'String';
    const rawVal = (node.data.value as string) || '';
    if (litType === 'String') return rawVal;
    if (litType === 'boolean') return rawVal === 'true';
    if (litType === 'enum') return rawVal;
    return Number(rawVal) || 0;
  }

  if (node.type === 'print') {
    const e = exec.edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
    return e ? exec.evaluateData(e.source, e.sourceHandle || undefined, localScope) : ((node.data.inlineValue as string) ?? '');
  }

  if (node.type === 'math') {
    const eA = exec.edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-a');
    const eB = exec.edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-b');
    const valA = eA ? exec.evaluateData(eA.source, eA.sourceHandle || undefined, localScope)
      : (node.data.inlineA != null && node.data.inlineA !== '' ? Number(node.data.inlineA) || 0 : 0);
    const valB = eB ? exec.evaluateData(eB.source, eB.sourceHandle || undefined, localScope)
      : (node.data.inlineB != null && node.data.inlineB !== '' ? Number(node.data.inlineB) || 0 : 0);
    const na = Number(valA), nb = Number(valB);
    switch (node.data.operation) {
      case '+': return na + nb;
      case '-': return na - nb;
      case '*': return na * nb;
      case '/': return nb !== 0 ? na / nb : 0;
      case '%': return nb !== 0 ? na % nb : 0;
      case '>': return na > nb;
      case '<': return na < nb;
      case '<=': return na <= nb;
      case '>=': return na >= nb;
      case '==': return valA == valB;
      case '!=': return valA != valB;
      case '&&': return Boolean(valA) && Boolean(valB);
      case '||': return Boolean(valA) || Boolean(valB);
      case '&': return na & nb;
      case '|': return na | nb;
      case '^': return na ^ nb;
      case '<<': return na << nb;
      case '>>': return na >> nb;
      default: return 0;
    }
  }

  if (node.type === 'not') {
    const op = (node.data.operation as string) || '!';
    const eA = exec.edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
    const val = exec.evaluateData(eA?.source || '', eA?.sourceHandle || undefined, localScope);
    return op === '~' ? ~Number(val) : !val;
  }

  if (node.type === 'stringOp') {
    const e = (h: string) => exec.edges.find(e => e.target === nodeId && e.targetHandle === h);
    const ev = (h: string) => exec.evaluateData(e(h)?.source || '', e(h)?.sourceHandle || undefined, localScope);
    switch (node.data.operation) {
      case 'concat':      return String(ev('data-in-a')) + String(ev('data-in-b'));
      case 'length':      return String(ev('data-in')).length;
      case 'substring':   return String(ev('data-in')).substring(Number(ev('data-in-start')), Number(ev('data-in-end')));
      case 'charAt': {
        const s = String(ev('data-in')); const i = Number(ev('data-in-index'));
        return i >= 0 && i < s.length ? s.charAt(i) : '';
      }
      case 'indexOf':     return String(ev('data-in')).indexOf(String(ev('data-in-target')));
      case 'replace':     return String(ev('data-in')).replace(String(ev('data-in-target')), String(ev('data-in-replacement')));
      case 'trim':        return String(ev('data-in')).trim();
      case 'toUpperCase': return String(ev('data-in')).toUpperCase();
      case 'toLowerCase': return String(ev('data-in')).toLowerCase();
      case 'split':       return String(ev('data-in')).split(String(ev('data-in-delimiter')));
      case 'contains':    return String(ev('data-in')).includes(String(ev('data-in-target')));
      case 'startsWith':  return String(ev('data-in')).startsWith(String(ev('data-in-target')));
      case 'endsWith':    return String(ev('data-in')).endsWith(String(ev('data-in-target')));
      case 'equalsIgnoreCase': return String(ev('data-in')).toLowerCase() === String(ev('data-in-other')).toLowerCase();
      case 'matches': { try { return new RegExp(String(ev('data-in-regex'))).test(String(ev('data-in'))); } catch { return false; } }
      case 'replaceAll': { try { return String(ev('data-in')).replace(new RegExp(String(ev('data-in-regex')), 'g'), String(ev('data-in-replacement'))); } catch { return String(ev('data-in')); } }
      case 'isEmpty': return String(ev('data-in')).length === 0;
      case 'compareTo': return String(ev('data-in')) < String(ev('data-in-other')) ? -1 : String(ev('data-in')) > String(ev('data-in-other')) ? 1 : 0;
      default: return '';
    }
  }

  if (node.type === 'mathFunc') {
    const op = node.data.operation as string;
    if (['abs','sqrt','ceil','floor','round','log','log10','sin','cos','tan','asin','acos','atan'].includes(op)) {
      const eIn = exec.edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
      const val = Number(exec.evaluateData(eIn?.source || '', eIn?.sourceHandle || undefined, localScope));
      switch (op) {
        case 'abs': return Math.abs(val);
        case 'sqrt': return Math.sqrt(val);
        case 'ceil': return Math.ceil(val);
        case 'floor': return Math.floor(val);
        case 'round': return Math.round(val);
        case 'log': return Math.log(val);
        case 'log10': return Math.log10(val);
        case 'sin': return Math.sin(val);
        case 'cos': return Math.cos(val);
        case 'tan': return Math.tan(val);
        case 'asin': return Math.asin(val);
        case 'acos': return Math.acos(val);
        case 'atan': return Math.atan(val);
      }
    }
    if (op === 'random') return Math.random();
    const eA = exec.edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-a');
    const eB = exec.edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-b');
    const a = Number(exec.evaluateData(eA?.source || '', eA?.sourceHandle || undefined, localScope));
    const b = Number(exec.evaluateData(eB?.source || '', eB?.sourceHandle || undefined, localScope));
    switch (op) {
      case 'min': return Math.min(a, b);
      case 'max': return Math.max(a, b);
      case 'pow': return Math.floor(Math.pow(a, b));
      default: return 0;
    }
  }

  if (node.type === 'cast') {
    const eIn = exec.edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
    const val = exec.evaluateData(eIn?.source || '', eIn?.sourceHandle || undefined, localScope);
    switch ((node.data.targetType as string) || 'String') {
      case 'int': case 'short': case 'byte': return parseInt(String(val), 10) || 0;
      case 'float': case 'double': case 'long': return parseFloat(String(val)) || 0;
      case 'boolean': return val === 'true' || val === true || val === 1;
      case 'String': return String(val);
      default: return val;
    }
  }

  if (node.type === 'ternary') {
    const eCond = exec.edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-condition');
    const cond = exec.evaluateData(eCond?.source || '', eCond?.sourceHandle || undefined, localScope);
    if (cond) {
      const eTrue = exec.edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-true');
      if (eTrue) return exec.evaluateData(eTrue.source, eTrue.sourceHandle || undefined, localScope);
      return (node.data.inlineTrue as string) ?? null;
    } else {
      const eFalse = exec.edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-false');
      if (eFalse) return exec.evaluateData(eFalse.source, eFalse.sourceHandle || undefined, localScope);
      return (node.data.inlineFalse as string) ?? null;
    }
  }

  if (node.type === 'arrayOp') {
    const ev = (h: string) => {
      const edge = exec.edges.find(e => e.target === nodeId && e.targetHandle === h);
      return exec.evaluateData(edge?.source || '', edge?.sourceHandle || undefined, localScope);
    };
    switch (node.data.operation) {
      case 'literal': {
        const arrayType = (node.data.arrayType as string) || 'int';
        const items = ((node.data.values as string) || '').split(',').map(v => v.trim()).filter(Boolean);
        if (arrayType === 'String') return items.map(v => String(v));
        if (arrayType === 'boolean') return items.map(v => v === 'true');
        return items.map(v => Number(v));
      }
      case 'new': return new Array(Number(ev('data-in-size')) || 0).fill(null);
      case 'access': {
        const arr = ev('data-in-array');
        const idx = Number(ev('data-in-index'));
        if (Array.isArray(arr)) {
          if (idx < 0 || idx >= arr.length) {
            exec.consoleOutput.push(`> ERROR: ArrayIndexOutOfBoundsException: index ${idx} is out of bounds for array of length ${arr.length}`);
            return null;
          }
          return arr[idx] ?? null;
        }
        return null;
      }
      case 'length': { const arr = ev('data-in'); return Array.isArray(arr) ? arr.length : 0; }
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
      const e = exec.edges.find(e => e.target === nodeId && e.targetHandle === `data-in-arg-${i}`);
      args.push(e ? exec.evaluateData(e.source, e.sourceHandle || undefined, localScope) : '');
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
    const ev = (h: string) => {
      const e = exec.edges.find(e => e.target === nodeId && e.targetHandle === h);
      return exec.evaluateData(e?.source || '', e?.sourceHandle || undefined, localScope);
    };
    if (op === 'indexOf') return exec.arrayListMemory[varName]?.indexOf(ev('data-in-value')) ?? -1;
    if (op === 'lastIndexOf') return exec.arrayListMemory[varName]?.lastIndexOf(ev('data-in-value')) ?? -1;
    if (op === 'get') return exec.arrayListMemory[varName]?.[Number(ev('data-in-index'))] ?? null;
    if (op === 'size') return exec.arrayListMemory[varName]?.length ?? 0;
    if (op === 'contains') return exec.arrayListMemory[varName]?.includes(ev('data-in-value')) ?? false;
    if (op === 'create') return exec.arrayListMemory[varName] ?? null;
    return null;
  }

  if (node.type === 'hashMapOp') {
    const op = node.data.operation as string;
    const varName = (node.data.variableName as string) || 'map';
    const map = exec.hashMapMemory[varName];
    const ev = (h: string) => {
      const e = exec.edges.find(e => e.target === nodeId && e.targetHandle === h);
      return exec.evaluateData(e?.source || '', e?.sourceHandle || undefined, localScope);
    };
    if (op === 'getOrDefault') { const defaultVal = ev('data-in-default'); return map?.has(ev('data-in-key')) ? map.get(ev('data-in-key')) : defaultVal; }
    if (op === 'values') return map ? Array.from(map.values()) : [];
    if (op === 'entrySet') return map ? Array.from(map.entries()).map(([k, v]) => `${k}=${v}`) : [];
    if (op === 'get') return map?.get(ev('data-in-key')) ?? null;
    if (op === 'containsKey') return map?.has(ev('data-in-key')) ?? false;
    if (op === 'size') return map?.size ?? 0;
    if (op === 'keySet') return map ? Array.from(map.keys()) : [];
    return null;
  }

  if (node.type === 'hashSetOp') {
    const op = node.data.operation as string;
    const varName = (node.data.variableName as string) || 'set';
    const set = exec.hashSetMemory[varName];
    if (op === 'contains') {
      const e = exec.edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-value');
      return set?.has(exec.evaluateData(e?.source || '', e?.sourceHandle || undefined, localScope)) ?? false;
    }
    if (op === 'size') return set?.size ?? 0;
    return null;
  }

  if (node.type === 'stackOp') {
    const op = node.data.operation as string;
    const stack = exec.stackMemory[(node.data.variableName as string) || 'stack'];
    if (op === 'peek') return stack && stack.length > 0 ? stack[stack.length - 1] : null;
    if (op === 'isEmpty') return !stack || stack.length === 0;
    if (op === 'size') return stack?.length ?? 0;
    if (op === 'pop') return stack && stack.length > 0 ? stack[stack.length - 1] : null;
    return null;
  }

  if (node.type === 'queueOp') {
    const op = node.data.operation as string;
    const queue = exec.queueMemory[(node.data.variableName as string) || 'queue'];
    if (op === 'peek') return queue && queue.length > 0 ? queue[0] : null;
    if (op === 'isEmpty') return !queue || queue.length === 0;
    if (op === 'size') return queue?.length ?? 0;
    if (op === 'poll') return queue && queue.length > 0 ? queue[0] : null;
    return null;
  }

  if (node.type === 'dequeOp') {
    const op = node.data.operation as string;
    const deque = exec.dequeMemory[(node.data.variableName as string) || 'deque'];
    if (op === 'peekFirst') return deque && deque.length > 0 ? deque[0] : null;
    if (op === 'peekLast') return deque && deque.length > 0 ? deque[deque.length - 1] : null;
    if (op === 'pollFirst') return deque && deque.length > 0 ? deque[0] : null;
    if (op === 'pollLast') return deque && deque.length > 0 ? deque[deque.length - 1] : null;
    if (op === 'isEmpty') return !deque || deque.length === 0;
    if (op === 'size') return deque?.length ?? 0;
    return null;
  }

  if (node.type === 'priorityQueueOp') {
    const op = node.data.operation as string;
    const pq = exec.pqMemory[(node.data.variableName as string) || 'pq'];
    if (op === 'peek') return pq && pq.length > 0 ? pq[0] : null;
    if (op === 'isEmpty') return !pq || pq.length === 0;
    if (op === 'size') return pq?.length ?? 0;
    if (op === 'poll') return pq && pq.length > 0 ? pq[0] : null;
    return null;
  }

  if (node.type === 'algorithm') {
    const op = node.data.operation as string;
    const ev = (h: string) => {
      const e = exec.edges.find(e => e.target === nodeId && e.targetHandle === h);
      return exec.evaluateData(e?.source || '', e?.sourceHandle || undefined, localScope);
    };
    if (op === 'binarySearch' || op === 'linearSearch') {
      const arr = ev('data-in-array');
      const target = ev('data-in-target');
      if (!Array.isArray(arr)) return -1;
      if (op === 'linearSearch') return arr.findIndex(x => x == target);
      let lo = 0, hi = arr.length - 1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (arr[mid] == target) return mid;
        if (Number(arr[mid]) < Number(target)) lo = mid + 1; else hi = mid - 1;
      }
      return -1;
    }
    if (op === 'mergeSort') {
      const arr = ev('data-in-array');
      if (!Array.isArray(arr)) return [];
      return [...arr].sort((a, b) => Number(a) - Number(b));
    }
    if (op === 'inorderTraversal')   { const out: unknown[] = []; inorder(ev('data-in-root') as TreeJsNode | null, out); return out; }
    if (op === 'preorderTraversal')  { const out: unknown[] = []; preorder(ev('data-in-root') as TreeJsNode | null, out); return out; }
    if (op === 'postorderTraversal') { const out: unknown[] = []; postorder(ev('data-in-root') as TreeJsNode | null, out); return out; }
    if (op === 'dijkstra') {
      const g = ev('data-in-graph') as unknown[][];
      return Array.isArray(g) ? dijkstraJS(g, Number(ev('data-in-start')), Number(ev('data-in-end'))) : -1;
    }
    if (op === 'bellmanFord') {
      const g = ev('data-in-graph') as unknown[][];
      return Array.isArray(g) ? bellmanFordJS(g, Number(ev('data-in-start')), Number(ev('data-in-end'))) : -1;
    }
    return null;
  }

  if (node.type === 'for') {
    if (localScope && ('__for_index__' + nodeId) in localScope) return localScope['__for_index__' + nodeId];
    return 0;
  }

  if (node.type === 'tryCatchFinally') {
    if (sourceHandle === 'data-out-exception' && localScope) return localScope['__exception_msg__' + nodeId] ?? '';
    const exMsgMatch = sourceHandle?.match(/^data-out-exception-(\d+)$/);
    if (exMsgMatch && localScope) return localScope['__exception_msg__' + nodeId] ?? '';
  }

  if (node.type === 'scanner') return exec.scannerValues.get(nodeId) ?? '';

  if (node.type === 'newObject') {
    const targetClassName = node.data.targetClass as string;
    if (targetClassName && exec.projectFiles) {
      const targetFile = exec.projectFiles.find((f: ProjectFile) => f.className === targetClassName);
      if (targetFile) {
        const ctorIndex = (node.data.constructorIndex as number) || 0;
        const ctorNodes = targetFile.nodes.filter((n: Node) => n.type === 'constructor');
        const ctorNode = ctorNodes[ctorIndex] || ctorNodes[0];

        const instanceFields: Record<string, unknown> = {};
        const initFieldsFromHierarchy = (className: string) => {
          const file = exec.projectFiles!.find((f: ProjectFile) => f.className === className);
          if (!file) return;
          if (file.extendsClass) initFieldsFromHierarchy(file.extendsClass);
          file.nodes.filter((n: Node) => n.type === 'java' && n.data.isStatic === false).forEach((n: Node) => {
            const varType = n.data.type as string;
            const varName = n.data.label as string;
            if (varType === 'String') instanceFields[varName] = String(n.data.value ?? '');
            else if (varType === 'boolean') instanceFields[varName] = n.data.value === 'true';
            else instanceFields[varName] = Number(n.data.value ?? 0);
          });
        };
        initFieldsFromHierarchy(targetClassName);

        if (ctorNode) {
          const ctorScope: Record<string, unknown> = { ...instanceFields };
          const params = (ctorNode.data.parameters as Parameter[]) || [];
          params.forEach((param: Parameter, index: number) => {
            const argEdge = exec.edges.find(e => e.target === nodeId && e.targetHandle === `arg-in-${index}`);
            ctorScope[param.name] = argEdge
              ? exec.evaluateData(argEdge.source, argEdge.sourceHandle || undefined, localScope)
              : getRuntimeDefault(param.type, param.defaultValue);
          });
          const ctorLocals = (ctorNode.data.localVariables as LocalVariable[]) || [];
          ctorLocals.forEach((local: LocalVariable) => { ctorScope[local.name] = getRuntimeDefault(local.type, local.value); });
          const child = exec.createChild(targetFile.nodes, targetFile.edges, { currentClassName: targetClassName, methodScope: ctorScope });
          child.runLogicChain(ctorNode.id, 'exec-out', ctorScope);
          exec.consoleOutput.push(...child.consoleOutput);
          const paramNames = new Set(params.map(p => p.name));
          Object.keys(ctorScope).forEach(k => { if (!paramNames.has(k)) instanceFields[k] = ctorScope[k]; });
        }
        return { __class__: targetClassName, fields: instanceFields };
      }
    }
    return null;
  }

  if (node.type === 'callInstanceMethod') {
    const fullMethodName = node.data.methodName as string;
    if (fullMethodName?.includes('.') && exec.projectFiles) {
      const [targetClass, methodName] = fullMethodName.split('.');
      const objEdge = exec.edges.find(e => e.target === nodeId && e.targetHandle === 'obj-in');
      const objRef = objEdge
        ? exec.evaluateData(objEdge.source, objEdge.sourceHandle || undefined, localScope) as { __class__: string; fields: Record<string, unknown> } | null
        : null;
      if (objRef && objRef.__class__ === targetClass) {
        const findMethod = (className: string): { file: ProjectFile; methodDef: Node } | null => {
          const file = exec.projectFiles!.find((f: ProjectFile) => f.className === className);
          if (!file) return null;
          const methodDef = file.nodes.find((n: Node) => n.type === 'method' && n.data.label === methodName);
          if (methodDef) return { file, methodDef };
          return file.extendsClass ? findMethod(file.extendsClass) : null;
        };
        const found = findMethod(targetClass);
        if (found) {
          const { file: targetFile, methodDef } = found;
          const methodScope: Record<string, unknown> = { ...objRef.fields };
          const params = (methodDef.data.parameters as Parameter[]) || [];
          params.forEach((param: Parameter, index: number) => {
            const argEdge = exec.edges.find(e => e.target === nodeId && e.targetHandle === `arg-in-${index}`);
            methodScope[param.name] = argEdge
              ? exec.evaluateData(argEdge.source, argEdge.sourceHandle || undefined, localScope)
              : getRuntimeDefault(param.type, param.defaultValue);
          });
          (methodDef.data.localVariables as LocalVariable[] || []).forEach((local: LocalVariable) => { methodScope[local.name] = getRuntimeDefault(local.type, local.value); });
          const child = exec.createChild(targetFile.nodes, targetFile.edges, { methodScope });
          child.runLogicChain(methodDef.id, 'exec-out', methodScope);
          exec.consoleOutput.push(...child.consoleOutput);
          Object.keys(objRef.fields).forEach(k => { if (k in methodScope && !k.startsWith('__')) objRef.fields[k] = methodScope[k]; });
          const returnNode = targetFile.nodes.find((n: Node) => n.type === 'return');
          if (returnNode) {
            const retEdge = targetFile.edges.find(e => e.target === returnNode.id && e.targetHandle === 'data-in');
            if (retEdge) return methodScope['__return__'] ?? null;
          }
        }
      }
    }
    return null;
  }

  if (node.type === 'customCode' && node.data.mode === 'expression') {
    const code = (node.data.code as string) || '0';
    const inputs = (node.data.inputs as Array<{id: string; name: string; type: string}>) || [];
    const inputValues: Record<string, unknown> = {};
    inputs.forEach((input, index) => {
      const e = exec.edges.find(e => e.target === nodeId && e.targetHandle === `custom-in-${index}`);
      inputValues[input.name] = e ? exec.evaluateData(e.source, e.sourceHandle || undefined, localScope) : getRuntimeDefault(input.type);
    });
    try {
      const fn = sandboxExpression(Object.keys(inputValues), code);
      return fn(...Object.values(inputValues));
    } catch { return null; }
  }

  if (node.type === 'callMethod') {
    const key = `__callMethod_return__${nodeId}`;
    if (localScope && key in localScope) return localScope[key];
    return exec.runtimeMemory[key] ?? null;
  }

  if (node.type === 'instanceOf') {
    const typeName = (node.data.typeName as string) || 'Object';
    const eIn = exec.edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
    const val = exec.evaluateData(eIn?.source || '', eIn?.sourceHandle || undefined, localScope);
    if (typeName === 'String') return typeof val === 'string';
    if (typeName === 'int' || typeName === 'double' || typeName === 'float' || typeName === 'long' || typeName === 'short' || typeName === 'byte') return typeof val === 'number';
    if (typeName === 'boolean') return typeof val === 'boolean';
    if (typeName === 'Object') return val !== null && val !== undefined;
    return false;
  }

  if (node.type === 'arraysUtil') {
    const op = node.data.operation as string;
    const ev = (h: string) => {
      const e = exec.edges.find(e => e.target === nodeId && e.targetHandle === h);
      return exec.evaluateData(e?.source || '', e?.sourceHandle || undefined, localScope);
    };
    if (op === 'copyOf') {
      const arr = ev('data-in-array');
      const len = Number(ev('data-in-length'));
      if (Array.isArray(arr)) return arr.slice(0, len).concat(new Array(Math.max(0, len - arr.length)).fill(null));
      return null;
    }
    if (op === 'equals') {
      const a = ev('data-in-a'), b = ev('data-in-b');
      if (!Array.isArray(a) || !Array.isArray(b)) return false;
      if (a.length !== b.length) return false;
      return a.every((v, i) => v == b[i]);
    }
    if (op === 'toString') {
      const arr = ev('data-in');
      if (Array.isArray(arr)) return '[' + arr.join(', ') + ']';
      return '[]';
    }
    return null;
  }


  // ─── Tree Node Ops ─────────────────────────────────────────────────────────

  if (node.type === 'treeNodeOp') {
    const op = node.data.operation as string;
    const varName = node.data.variableName as string;
    const treeNode = exec.treeNodeMemory[varName] ?? null;
    const ev = (h: string) => {
      const e = exec.edges.find(e => e.target === nodeId && e.targetHandle === h);
      return e ? exec.evaluateData(e.source, e.sourceHandle || undefined, localScope) : null;
    };
    if (op === 'getValue') return treeNode ? treeNode.val : null;
    if (op === 'getLeft')  return treeNode?.left ?? null;
    if (op === 'getRight') return treeNode?.right ?? null;
    if (op === 'isNull')   return treeNode === null;
    if (op === 'hasLeft')  return !!(treeNode?.left);
    if (op === 'hasRight') return !!(treeNode?.right);
    if (op === 'setValue') { const v = ev('data-in-value'); if (treeNode) treeNode.val = v; return v; }
    if (op === 'setLeft')  { const n = ev('data-in-node') as TreeJsNode | null; if (treeNode) treeNode.left = n; return n; }
    if (op === 'setRight') { const n = ev('data-in-node') as TreeJsNode | null; if (treeNode) treeNode.right = n; return n; }
    return null;
  }

  if (node.type === 'bstOp') {
    const op = node.data.operation as string;
    const varName = node.data.variableName as string;
    const root = exec.treeNodeMemory[varName] ?? null;
    const ev = (h: string) => {
      const e = exec.edges.find(e => e.target === nodeId && e.targetHandle === h);
      return e ? exec.evaluateData(e.source, e.sourceHandle || undefined, localScope) : null;
    };
    if (op === 'search' || op === 'contains') return bstSearch(root, ev('data-in-value'));
    if (op === 'min')       return bstMin(root);
    if (op === 'max')       return bstMax(root);
    if (op === 'height')    return treeHeight(root);
    if (op === 'size')      return treeSize(root);
    if (op === 'inorder')   { const out: unknown[] = []; inorder(root, out); return out; }
    if (op === 'preorder')  { const out: unknown[] = []; preorder(root, out); return out; }
    if (op === 'postorder') { const out: unknown[] = []; postorder(root, out); return out; }
    return null;
  }

  if (node.type === 'avlTreeOp') {
    const op = node.data.operation as string;
    const varName = node.data.variableName as string;
    const root = exec.treeNodeMemory[varName] ?? null;
    const ev = (h: string) => {
      const e = exec.edges.find(e => e.target === nodeId && e.targetHandle === h);
      return e ? exec.evaluateData(e.source, e.sourceHandle || undefined, localScope) : null;
    };
    if (op === 'search')  return bstSearch(root, ev('data-in-value'));
    if (op === 'height')  return treeHeight(root);
    if (op === 'size')    return treeSize(root);
    if (op === 'inorder') { const out: unknown[] = []; inorder(root, out); return out; }
    return null;
  }

  if (['javafxControlOp', 'javafxTableOp', 'javafxListOp', 'javafxLayoutOp',
       'javafxStageOp', 'javafxSceneOp', 'javafxMenuOp', 'javafxMediaOp',
       'javafxChartOp', 'javafxStyleOp', 'javafxEventOp'].includes(node.type as string)) {
    const op = node.data.operation as string;
    const varName = (node.data.variableName as string) || 'fxNode';
    if (op === 'getText') return '';
    if (op === 'getValue') return 0;
    if (op === 'isSelected') return false;
    if (op === 'getSelectedItem') return null;
    if (op === 'getStyleClass') return '';
    return exec.fxMemory.get(varName) ?? null;
  }

  if (node.type === 'javafxDialogOp') {
    const op = node.data.operation as string;
    if (op === 'textInputDialog') return '';
    if (op === 'choiceDialog') return null;
    if (op === 'alertConfirm') return false;
    return null;
  }

  // ── Swing data evaluation ──
  if (['swingControlOp', 'swingFrameOp', 'swingPanelOp',
       'swingMenuOp', 'swingStyleOp', 'swingEventOp'].includes(node.type as string)) {
    const op = node.data.operation as string;
    const varName = (node.data.variableName as string) || 'swingNode';
    if (op === 'getText') return '';
    if (op === 'isSelected') return false;
    return exec.fxMemory.get(varName) ?? null;
  }

  if (node.type === 'swingDialogOp') {
    const op = node.data.operation as string;
    if (op === 'showInputDialog') return '';
    if (op === 'showConfirmDialog' || op === 'showOptionDialog') return 0;
    return null;
  }

  return '';
}
