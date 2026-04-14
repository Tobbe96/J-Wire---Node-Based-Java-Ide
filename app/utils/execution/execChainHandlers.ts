import type { Executor, TreeJsNode } from './Executor';
import { getRuntimeDefault } from '../theme';
import type { Parameter, LocalVariable } from '../nodeTypes';
import type { ProjectFile } from '../../store/editorStore';
import { Node } from '@xyflow/react';

// ─── BST / AVL helpers ────────────────────────────────────────────────────────

function bstInsertJS(node: TreeJsNode | null, val: unknown): TreeJsNode {
  if (!node) return { val, left: null, right: null };
  const n = Number(node.val), v = Number(val);
  if (v < n) return { ...node, left: bstInsertJS(node.left, val) };
  if (v > n) return { ...node, right: bstInsertJS(node.right, val) };
  return node;
}

function bstMinNode(node: TreeJsNode): TreeJsNode {
  return node.left ? bstMinNode(node.left) : node;
}

function bstDeleteJS(node: TreeJsNode | null, val: unknown): TreeJsNode | null {
  if (!node) return null;
  const n = Number(node.val), v = Number(val);
  if (v < n) return { ...node, left: bstDeleteJS(node.left, val) };
  if (v > n) return { ...node, right: bstDeleteJS(node.right, val) };
  if (!node.left) return node.right;
  if (!node.right) return node.left;
  const successor = bstMinNode(node.right);
  return { val: successor.val, left: node.left, right: bstDeleteJS(node.right, successor.val) };
}

function avlHeight(node: TreeJsNode | null): number {
  return node ? 1 + Math.max(avlHeight(node.left), avlHeight(node.right)) : 0;
}

function avlBalance(node: TreeJsNode | null): number {
  return node ? avlHeight(node.left) - avlHeight(node.right) : 0;
}

function rotateRight(y: TreeJsNode): TreeJsNode {
  const x = y.left!;
  return { ...x, right: { ...y, left: x.right } };
}

function rotateLeft(x: TreeJsNode): TreeJsNode {
  const y = x.right!;
  return { ...y, left: { ...x, right: y.left } };
}

function avlInsertJS(node: TreeJsNode | null, val: unknown): TreeJsNode {
  if (!node) return { val, left: null, right: null };
  const n = Number(node.val), v = Number(val);
  let result: TreeJsNode;
  if (v < n)      result = { ...node, left: avlInsertJS(node.left, val) };
  else if (v > n) result = { ...node, right: avlInsertJS(node.right, val) };
  else            return node;
  const bal = avlBalance(result);
  if (bal > 1 && Number(val) < Number(result.left?.val))  return rotateRight(result);
  if (bal < -1 && Number(val) > Number(result.right?.val)) return rotateLeft(result);
  if (bal > 1 && Number(val) > Number(result.left?.val))  { result = { ...result, left: rotateLeft(result.left!) }; return rotateRight(result); }
  if (bal < -1 && Number(val) < Number(result.right?.val)) { result = { ...result, right: rotateRight(result.right!) }; return rotateLeft(result); }
  return result;
}

function avlDeleteJS(node: TreeJsNode | null, val: unknown): TreeJsNode | null {
  const deleted = bstDeleteJS(node, val);
  if (!deleted) return null;
  const bal = avlBalance(deleted);
  if (bal > 1) {
    if (avlBalance(deleted.left) >= 0) return rotateRight(deleted);
    return rotateRight({ ...deleted, left: rotateLeft(deleted.left!) });
  }
  if (bal < -1) {
    if (avlBalance(deleted.right) <= 0) return rotateLeft(deleted);
    return rotateLeft({ ...deleted, right: rotateRight(deleted.right!) });
  }
  return deleted;
}

/**
 * Implementation of `Executor.runLogicChain`, extracted to keep `Executor.ts` lean.
 * All `this.xxx` references are replaced with `exec.xxx`.
 */
export function runLogicChainImpl(
  exec: Executor,
  startNodeId: string,
  startHandle: string = 'exec',
  localScope?: Record<string, unknown>,
): string | undefined {
  let currentNodeId = startNodeId;
  let currentHandle = startHandle;
  let steps = 0;

  while (steps < 1000) {
    steps++;
    const execEdge = exec.edges.find(e => e.source === currentNodeId && e.sourceHandle?.includes(currentHandle));
    if (!execEdge) break;
    const nextNode = exec.nodes.find(n => n.id === execEdge.target);
    if (!nextNode) break;

    // ── Print ──
    if (nextNode.type === 'print') {
      const dataEdge = exec.edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in');
      const val = dataEdge
        ? exec.evaluateData(dataEdge.source, dataEdge.sourceHandle || undefined, localScope)
        : ((nextNode.data.inlineValue as string) ?? '');
      exec.consoleOutput.push(`> ${val}`);
    }

    // ── Call same-class method ──
    if (nextNode.type === 'callMethod') {
      const targetMethodName = nextNode.data.methodName as string;
      const methodDef = exec.nodes.find(n => n.type === 'method' && n.data.label === targetMethodName);
      if (methodDef) {
        const scope: Record<string, unknown> = {};
        const params = (methodDef.data.parameters as Parameter[]) || [];
        params.forEach((param: Parameter, index: number) => {
          const argEdge = exec.edges.find(e => e.target === nextNode.id && e.targetHandle === `arg-in-${index}`);
          scope[param.name] = argEdge
            ? exec.evaluateData(argEdge.source, argEdge.sourceHandle || undefined, localScope)
            : getRuntimeDefault(param.type, param.defaultValue);
        });
        (methodDef.data.localVariables as LocalVariable[] || []).forEach((local: LocalVariable) => {
          scope[local.name] = getRuntimeDefault(local.type, local.value);
        });
        exec.runLogicChain(methodDef.id, 'exec-out', scope);
        const retKey = `__callMethod_return__${nextNode.id}`;
        if (localScope) localScope[retKey] = scope['__return__'] ?? null;
        else exec.runtimeMemory[retKey] = scope['__return__'] ?? null;
      } else {
        exec.consoleOutput.push(`> ERROR: Method '${targetMethodName}' not found.`);
      }
    }

    // ── Super constructor call ──
    if (nextNode.type === 'superConstructorCall' && exec.currentClassName && exec.projectFiles) {
      const currentFile = exec.projectFiles.find((f: ProjectFile) => f.className === exec.currentClassName);
      const parentClassName = currentFile?.extendsClass;
      if (parentClassName) {
        const parentFile = exec.projectFiles.find((f: ProjectFile) => f.className === parentClassName);
        const parentCtor = parentFile?.nodes.find((n: Node) => n.type === 'constructor');
        if (parentFile && parentCtor) {
          const parentScope: Record<string, unknown> = { ...(localScope || exec.methodScope) };
          const params = (parentCtor.data.parameters as Parameter[]) || [];
          params.forEach((p: Parameter, i: number) => {
            const argEdge = exec.edges.find(e => e.target === nextNode.id && e.targetHandle === `arg-in-${i}`);
            parentScope[p.name] = argEdge
              ? exec.evaluateData(argEdge.source, argEdge.sourceHandle || undefined, localScope)
              : getRuntimeDefault(p.type, p.defaultValue);
          });
          const child = exec.createChild(parentFile.nodes, parentFile.edges, { currentClassName: parentClassName, methodScope: parentScope });
          child.runLogicChain(parentCtor.id, 'exec-out', parentScope);
          exec.consoleOutput.push(...child.consoleOutput);
          Object.keys(parentScope).forEach(k => { exec.methodScope[k] = parentScope[k]; });
        }
      }
    }

    // ── Call static method (cross-class) ──
    if (nextNode.type === 'callStaticMethod') {
      const cls = nextNode.data.targetClass as string;
      const mName = nextNode.data.methodName as string;
      if (cls && mName && exec.projectFiles) {
        const targetFile = exec.projectFiles.find((f: ProjectFile) => f.className === cls);
        const methodDef = targetFile?.nodes.find((n: Node) => n.type === 'method' && n.data.label === mName);
        if (targetFile && methodDef) {
          const scope: Record<string, unknown> = {};
          const params = (methodDef.data.parameters as Parameter[]) || [];
          params.forEach((p: Parameter, i: number) => {
            const argEdge = exec.edges.find(e => e.target === nextNode.id && e.targetHandle === `arg-in-${i}`);
            scope[p.name] = argEdge
              ? exec.evaluateData(argEdge.source, argEdge.sourceHandle || undefined, localScope)
              : getRuntimeDefault(p.type, p.defaultValue);
          });
          const child = exec.createChild(targetFile.nodes, targetFile.edges);
          child.runLogicChain(methodDef.id, 'exec-out', scope);
          exec.consoleOutput.push(...child.consoleOutput);
        } else {
          exec.consoleOutput.push(`> ERROR: ${targetFile ? `Method '${mName}'` : `Class '${cls}'`} not found.`);
        }
      }
    }

    // ── New Object (statement) ──
    if (nextNode.type === 'newObject') {
      const objRef = exec.evaluateData(nextNode.id, 'data-out', localScope);
      if (objRef != null) {
        const varKey = `__obj_${nextNode.id.replace(/-/g, '_')}__`;
        if (localScope) localScope[varKey] = objRef;
        else exec.runtimeMemory[varKey] = objRef;
      }
    }

    // ── Call instance method (statement) ──
    if (nextNode.type === 'callInstanceMethod') {
      const result = exec.evaluateData(nextNode.id, 'data-out', localScope);
      if (localScope) localScope[`__result_${nextNode.id}__`] = result;
      else exec.runtimeMemory[`__result_${nextNode.id}__`] = result;
    }

    // ── Custom code (statement) ──
    if (nextNode.type === 'customCode' && nextNode.data.mode === 'statement') {
      const code = (nextNode.data.code as string) || '';
      const inputs = (nextNode.data.inputs as Array<{id: string; name: string; type: string}>) || [];
      const inputValues: Record<string, unknown> = {};
      inputs.forEach((input, index) => {
        const inputEdge = exec.edges.find(e => e.target === nextNode.id && e.targetHandle === `custom-in-${index}`);
        inputValues[input.name] = inputEdge
          ? exec.evaluateData(inputEdge.source, inputEdge.sourceHandle || undefined, localScope)
          : getRuntimeDefault(input.type);
      });
      try {
        const fn = new Function(...Object.keys(inputValues), '__print__', '__mem__', code);
        fn(...Object.values(inputValues), (msg: unknown) => exec.consoleOutput.push(String(msg)), exec.runtimeMemory);
      } catch (err) {
        exec.consoleOutput.push(`> CUSTOM CODE ERROR: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    // ── Set Variable ──
    if (nextNode.type === 'setVar') {
      const varName = nextNode.data.variableName as string;
      const dataEdge = exec.edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in');
      if (varName) {
        const newVal = dataEdge
          ? exec.evaluateData(dataEdge.source, dataEdge.sourceHandle || undefined, localScope)
          : ((nextNode.data.inlineValue as string) ?? 0);
        exec.runtimeMemory[varName] = newVal;
        if (localScope && varName in localScope) localScope[varName] = newVal;
        exec.methodScope[varName] = newVal;
      }
    }

    // ── Set Local Variable ──
    if (nextNode.type === 'setLocalVar') {
      const localVarName = nextNode.data.localVarName as string;
      const dataEdge = exec.edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in');
      if (localVarName && localScope) {
        localScope[localVarName] = dataEdge
          ? exec.evaluateData(dataEdge.source, dataEdge.sourceHandle || undefined, localScope)
          : ((nextNode.data.inlineValue as string) ?? 0);
      }
    }

    // ── Increment / Decrement ──
    if (nextNode.type === 'increment') {
      const varName = (nextNode.data.variableName as string) || 'x';
      const mode = (nextNode.data.mode as string) || 'post-increment';
      const current = Number(localScope && varName in localScope ? localScope[varName] : (exec.runtimeMemory[varName] ?? 0));
      const newVal = (mode === 'post-increment' || mode === 'pre-increment') ? current + 1 : current - 1;
      exec.runtimeMemory[varName] = newVal;
      if (localScope && varName in localScope) localScope[varName] = newVal;
      exec.methodScope[varName] = newVal;
    }

    // ── Compound Assignment ──
    if (nextNode.type === 'compoundAssign') {
      const varName = (nextNode.data.variableName as string) || 'x';
      const operator = (nextNode.data.operator as string) || '+=';
      const dataEdge = exec.edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in');
      const value = dataEdge
        ? exec.evaluateData(dataEdge.source, dataEdge.sourceHandle || undefined, localScope)
        : Number((nextNode.data.inlineValue as string) ?? 0);
      const current = Number(localScope && varName in localScope ? localScope[varName] : (exec.runtimeMemory[varName] ?? 0));
      let newVal = current;
      switch (operator) {
        case '+=': newVal = current + Number(value); break;
        case '-=': newVal = current - Number(value); break;
        case '*=': newVal = current * Number(value); break;
        case '/=': newVal = current / Number(value); break;
        case '%=': newVal = current % Number(value); break;
      }
      exec.runtimeMemory[varName] = newVal;
      if (localScope && varName in localScope) localScope[varName] = newVal;
      exec.methodScope[varName] = newVal;
    }

    // ── ArrayList ──
    if (nextNode.type === 'arrayListOp') {
      const op = nextNode.data.operation as string;
      const varName = (nextNode.data.variableName as string) || 'list';
      const ev = (h: string) => {
        const e = exec.edges.find(e => e.target === nextNode.id && e.targetHandle === h);
        return exec.evaluateData(e?.source || '', e?.sourceHandle || undefined, localScope);
      };
      if (op === 'create') {
        const rawInitialData = nextNode.data.initialValues;
        const rawInitial = Array.isArray(rawInitialData)
          ? (rawInitialData as string[]).join(',')
          : ((rawInitialData as string) || '');
        const initVals = rawInitial.split(',').map((v: string) => v.trim()).filter((v: string) => v !== '');
        exec.arrayListMemory[varName] = initVals.length > 0
          ? initVals.map((v: string) => isNaN(Number(v)) ? v : Number(v))
          : [];
      } else if (op === 'add') {
        if (!exec.arrayListMemory[varName]) exec.arrayListMemory[varName] = [];
        exec.arrayListMemory[varName].push(ev('data-in-value'));
      } else if (op === 'set') {
        const idx = Number(ev('data-in-index'));
        if (exec.arrayListMemory[varName] && idx >= 0 && idx < exec.arrayListMemory[varName].length) {
          exec.arrayListMemory[varName][idx] = ev('data-in-value');
        }
      } else if (op === 'remove') {
        exec.arrayListMemory[varName]?.splice(Number(ev('data-in-index')), 1);
      } else if (op === 'clear') {
        exec.arrayListMemory[varName] = [];
      } else if (op === 'sort') {
        exec.arrayListMemory[varName]?.sort((a, b) =>
          typeof a === 'number' && typeof b === 'number' ? a - b : String(a).localeCompare(String(b)));
      } else if (op === 'reverse') {
        exec.arrayListMemory[varName]?.reverse();
      } else if (op === 'shuffle') {
        const arr = exec.arrayListMemory[varName];
        if (arr) {
          for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
          }
        }
      }
    }

    // ── HashSet ──
    if (nextNode.type === 'hashSetOp') {
      const op = nextNode.data.operation as string;
      const varName = (nextNode.data.variableName as string) || 'set';
      const ev = (h: string) => {
        const e = exec.edges.find(e => e.target === nextNode.id && e.targetHandle === h);
        return exec.evaluateData(e?.source || '', e?.sourceHandle || undefined, localScope);
      };
      if (op === 'create') { exec.hashSetMemory[varName] = new Set(); }
      else if (op === 'add') {
        if (!exec.hashSetMemory[varName]) exec.hashSetMemory[varName] = new Set();
        exec.hashSetMemory[varName].add(ev('data-in-value'));
      } else if (op === 'remove') {
        exec.hashSetMemory[varName]?.delete(ev('data-in-value'));
      } else if (op === 'clear') {
        exec.hashSetMemory[varName] = new Set();
      }
    }

    // ── HashMap ──
    if (nextNode.type === 'hashMapOp') {
      const op = nextNode.data.operation as string;
      const varName = (nextNode.data.variableName as string) || 'map';
      const ev = (h: string) => {
        const e = exec.edges.find(e => e.target === nextNode.id && e.targetHandle === h);
        return exec.evaluateData(e?.source || '', e?.sourceHandle || undefined, localScope);
      };
      if (op === 'create') { exec.hashMapMemory[varName] = new Map(); }
      else if (op === 'put') {
        if (!exec.hashMapMemory[varName]) exec.hashMapMemory[varName] = new Map();
        exec.hashMapMemory[varName].set(ev('data-in-key'), ev('data-in-value'));
      } else if (op === 'remove') {
        exec.hashMapMemory[varName]?.delete(ev('data-in-key'));
      }
    }

    // ── Stack ──
    if (nextNode.type === 'stackOp') {
      const op = nextNode.data.operation as string;
      const varName = (nextNode.data.variableName as string) || 'stack';
      const ev = (h: string) => {
        const e = exec.edges.find(e => e.target === nextNode.id && e.targetHandle === h);
        return exec.evaluateData(e?.source || '', e?.sourceHandle || undefined, localScope);
      };
      if (op === 'create') { exec.stackMemory[varName] = []; }
      else if (op === 'push') {
        if (!exec.stackMemory[varName]) exec.stackMemory[varName] = [];
        exec.stackMemory[varName].push(ev('data-in'));
      } else if (op === 'pop') {
        if (!exec.stackMemory[varName] || exec.stackMemory[varName].length === 0) {
          exec.consoleOutput.push(`> ERROR: EmptyStackException on '${varName}'`);
        } else { exec.stackMemory[varName].pop(); }
      }
    }

    // ── Queue ──
    if (nextNode.type === 'queueOp') {
      const op = nextNode.data.operation as string;
      const varName = (nextNode.data.variableName as string) || 'queue';
      const ev = (h: string) => {
        const e = exec.edges.find(e => e.target === nextNode.id && e.targetHandle === h);
        return exec.evaluateData(e?.source || '', e?.sourceHandle || undefined, localScope);
      };
      if (op === 'create') { exec.queueMemory[varName] = []; }
      else if (op === 'offer') {
        if (!exec.queueMemory[varName]) exec.queueMemory[varName] = [];
        exec.queueMemory[varName].push(ev('data-in'));
      } else if (op === 'poll') {
        if (!exec.queueMemory[varName] || exec.queueMemory[varName].length === 0) {
          exec.consoleOutput.push(`> ERROR: NoSuchElementException on '${varName}'`);
        } else { exec.queueMemory[varName].shift(); }
      }
    }

    // ── Deque ──
    if (nextNode.type === 'dequeOp') {
      const op = nextNode.data.operation as string;
      const varName = (nextNode.data.variableName as string) || 'deque';
      const ev = (h: string) => {
        const e = exec.edges.find(e => e.target === nextNode.id && e.targetHandle === h);
        return exec.evaluateData(e?.source || '', e?.sourceHandle || undefined, localScope);
      };
      if (op === 'create') { exec.dequeMemory[varName] = []; }
      else if (op === 'offerFirst') {
        if (!exec.dequeMemory[varName]) exec.dequeMemory[varName] = [];
        exec.dequeMemory[varName].unshift(ev('data-in'));
      } else if (op === 'offerLast') {
        if (!exec.dequeMemory[varName]) exec.dequeMemory[varName] = [];
        exec.dequeMemory[varName].push(ev('data-in'));
      } else if (op === 'pollFirst') {
        if (!exec.dequeMemory[varName] || exec.dequeMemory[varName].length === 0) {
          exec.consoleOutput.push(`> ERROR: NoSuchElementException on '${varName}'`);
        } else { exec.dequeMemory[varName].shift(); }
      } else if (op === 'pollLast') {
        if (!exec.dequeMemory[varName] || exec.dequeMemory[varName].length === 0) {
          exec.consoleOutput.push(`> ERROR: NoSuchElementException on '${varName}'`);
        } else { exec.dequeMemory[varName].pop(); }
      }
    }

    // ── PriorityQueue ──
    if (nextNode.type === 'priorityQueueOp') {
      const op = nextNode.data.operation as string;
      const varName = (nextNode.data.variableName as string) || 'pq';
      const ev = (h: string) => {
        const e = exec.edges.find(e => e.target === nextNode.id && e.targetHandle === h);
        return exec.evaluateData(e?.source || '', e?.sourceHandle || undefined, localScope);
      };
      if (op === 'create') { exec.pqMemory[varName] = []; }
      else if (op === 'add') {
        if (!exec.pqMemory[varName]) exec.pqMemory[varName] = [];
        exec.pqMemory[varName].push(ev('data-in'));
        exec.pqMemory[varName].sort((a, b) => Number(a) - Number(b));
      } else if (op === 'poll') {
        if (!exec.pqMemory[varName] || exec.pqMemory[varName].length === 0) {
          exec.consoleOutput.push(`> ERROR: NoSuchElementException on '${varName}'`);
        } else { exec.pqMemory[varName].shift(); }
      }
    }

    // ── Arrays Utility ──
    if (nextNode.type === 'arraysUtil') {
      const op = nextNode.data.operation as string;
      if (op === 'sort') {
        const arrEdge = exec.edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in-array');
        const arr = exec.evaluateData(arrEdge?.source || '', arrEdge?.sourceHandle || undefined, localScope);
        if (Array.isArray(arr)) arr.sort((a, b) => Number(a) - Number(b));
      } else if (op === 'fill') {
        const arrEdge = exec.edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in-array');
        const valEdge = exec.edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in-value');
        const arr = exec.evaluateData(arrEdge?.source || '', arrEdge?.sourceHandle || undefined, localScope);
        const val = exec.evaluateData(valEdge?.source || '', valEdge?.sourceHandle || undefined, localScope);
        if (Array.isArray(arr)) arr.fill(val);
      }
    }

    // ── Algorithm ──
    if (nextNode.type === 'algorithm') {
      const op = nextNode.data.operation as string;
      const ev = (h: string) => {
        const e = exec.edges.find(e => e.target === nextNode.id && e.targetHandle === h);
        return exec.evaluateData(e?.source || '', e?.sourceHandle || undefined, localScope);
      };
      if (op === 'bubbleSort' || op === 'quickSort' || op === 'mergeSort') {
        const listEdge = exec.edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in-list');
        const listSrcNode = listEdge ? exec.nodes.find(n => n.id === listEdge.source) : null;
        const listVarName = listSrcNode?.data.variableName as string | undefined;
        if (listVarName && exec.arrayListMemory[listVarName]) {
          exec.arrayListMemory[listVarName].sort((a, b) =>
            typeof a === 'number' && typeof b === 'number' ? a - b : String(a).localeCompare(String(b)));
        } else {
          const arr = ev('data-in-array');
          if (Array.isArray(arr)) arr.sort((a, b) => Number(a) - Number(b));
        }
      }
      // mergeSort/binarySearch/linearSearch are data-out only (handled in evaluateData)
    }

    // ── Array Set ──
    if (nextNode.type === 'arrayOp' && nextNode.data.operation === 'set') {
      const ev = (h: string) => {
        const e = exec.edges.find(e => e.target === nextNode.id && e.targetHandle === h);
        return exec.evaluateData(e?.source || '', e?.sourceHandle || undefined, localScope);
      };
      const arr = ev('data-in-array');
      const idx = Number(ev('data-in-index'));
      const val = ev('data-in-value');
      if (Array.isArray(arr)) {
        if (idx >= 0 && idx < arr.length) arr[idx] = val;
        else exec.consoleOutput.push(`> ERROR: ArrayIndexOutOfBoundsException: index ${idx} is out of bounds for array of length ${arr.length}`);
      }
    }

    // ── For-Each ──
    if (nextNode.type === 'forEach') {
      const myLabel = (nextNode.data.loopLabel as string) || '';
      const eArr = exec.edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in-array');
      const arr = exec.evaluateData(eArr?.source || '', eArr?.sourceHandle || undefined, localScope);
      if (Array.isArray(arr)) {
        const feScope = localScope ? { ...localScope } : {};
        outer: for (let i = 0; i < arr.length; i++) {
          feScope['__forEach_elem__' + nextNode.id] = arr[i];
          feScope['__forEach_idx__' + nextNode.id] = i;
          const signal = exec.runLogicChain(nextNode.id, 'exec-body', feScope);
          if (signal === 'break' || (myLabel && signal === `break:${myLabel}`)) break outer;
          if (signal === 'continue' || (myLabel && signal === `continue:${myLabel}`)) continue outer;
          if (signal) return signal;
        }
      }
      exec.runLogicChain(nextNode.id, 'exec-out', localScope);
      break;
    }

    // ── Branch ──
    if (nextNode.type === 'branch') {
      const condEdge = exec.edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in');
      const condition = condEdge
        ? exec.evaluateData(condEdge.source, condEdge.sourceHandle || undefined, localScope)
        : ((nextNode.data.inlineValue as string) === 'true');
      const signal = exec.runLogicChain(nextNode.id, condition ? 'exec-out-true' : 'exec-out-false', localScope);
      if (signal) return signal;
      break;
    }

    // ── While ──
    if (nextNode.type === 'while') {
      const myLabel = (nextNode.data.loopLabel as string) || '';
      const whileScope = localScope ? { ...localScope } : {};
      let whileSteps = 0;
      while (whileSteps < 1000) {
        whileSteps++;
        const condEdge = exec.edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in');
        if (!exec.evaluateData(condEdge?.source || '', condEdge?.sourceHandle || undefined, whileScope)) break;
        const signal = exec.runLogicChain(nextNode.id, 'exec-body', whileScope);
        if (signal === 'break' || (myLabel && signal === `break:${myLabel}`)) break;
        if (signal === 'continue' || (myLabel && signal === `continue:${myLabel}`)) continue;
        if (signal) return signal;
      }
      if (whileSteps >= 1000) exec.consoleOutput.push('> ERROR: While loop exceeded step limit.');
      if (localScope) Object.assign(localScope, whileScope);
      exec.runLogicChain(nextNode.id, 'exec-out', localScope);
      break;
    }

    // ── For ──
    if (nextNode.type === 'for') {
      const myLabel = (nextNode.data.loopLabel as string) || '';
      const eStart = exec.edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-start');
      const eEnd = exec.edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-end');
      const eStep = exec.edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-step');
      const startVal = Number(exec.evaluateData(eStart?.source || '', eStart?.sourceHandle || undefined, localScope)) || 0;
      const endVal = Number(exec.evaluateData(eEnd?.source || '', eEnd?.sourceHandle || undefined, localScope)) || 0;
      const stepVal = eStep
        ? Number(exec.evaluateData(eStep.source, eStep.sourceHandle || undefined, localScope)) || 1
        : Number((nextNode.data.step as string) || '1') || 1;
      const comparison = (nextNode.data.comparison as string) || '<';
      const forScope = localScope ? { ...localScope } : {};

      const condFn = (i: number): boolean => {
        if (comparison === '<') return i < endVal;
        if (comparison === '<=') return i <= endVal;
        if (comparison === '>') return i > endVal;
        if (comparison === '>=') return i >= endVal;
        return i < endVal;
      };

      outer: for (let i = startVal; condFn(i); i += stepVal) {
        forScope['__for_index__' + nextNode.id] = i;
        const signal = exec.runLogicChain(nextNode.id, 'exec-body', forScope);
        if (signal === 'break' || (myLabel && signal === `break:${myLabel}`)) break outer;
        if (signal === 'continue' || (myLabel && signal === `continue:${myLabel}`)) continue outer;
        if (signal) return signal;
      }
      if (localScope) Object.assign(localScope, forScope);
      exec.runLogicChain(nextNode.id, 'exec-out', localScope);
      break;
    }

    // ── Do-While ──
    if (nextNode.type === 'doWhile') {
      const myLabel = (nextNode.data.loopLabel as string) || '';
      const loopScope = localScope ? { ...localScope } : {};
      let doWhileSteps = 0;
      outer: do {
        if (doWhileSteps++ > 1000) { exec.consoleOutput.push('> ERROR: Do-While loop exceeded step limit.'); break; }
        const signal = exec.runLogicChain(nextNode.id, 'exec-body', loopScope);
        if (signal === 'break' || (myLabel && signal === `break:${myLabel}`)) break outer;
        if (signal === 'continue' || (myLabel && signal === `continue:${myLabel}`)) {
          const condEdge = exec.edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in');
          if (!exec.evaluateData(condEdge?.source || '', condEdge?.sourceHandle || undefined, loopScope)) break outer;
          continue outer;
        }
        if (signal) return signal;
        const condEdge = exec.edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in');
        if (!exec.evaluateData(condEdge?.source || '', condEdge?.sourceHandle || undefined, loopScope)) break;
      } while (true);
      if (localScope) Object.assign(localScope, loopScope);
      exec.runLogicChain(nextNode.id, 'exec-out', localScope);
      break;
    }

    // ── Switch ──
    if (nextNode.type === 'switch') {
      const valEdge = exec.edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in');
      const switchVal = exec.evaluateData(valEdge?.source || '', valEdge?.sourceHandle || undefined, localScope);
      const caseCount = (nextNode.data.caseCount as number) || 2;
      const fallThrough = (nextNode.data.fallThrough as boolean[]) || [];
      let matched = false;
      for (let i = 0; i < caseCount; i++) {
        const caseEdge = exec.edges.find(e => e.target === nextNode.id && e.targetHandle === `data-case-${i}`);
        const caseVal = exec.evaluateData(caseEdge?.source || '', caseEdge?.sourceHandle || undefined, localScope);
        if (matched || switchVal == caseVal) {
          exec.runLogicChain(nextNode.id, `exec-case-${i}`, localScope);
          matched = true;
          if (!fallThrough[i]) break;
        }
      }
      if (!matched) exec.runLogicChain(nextNode.id, 'exec-default', localScope);
      exec.runLogicChain(nextNode.id, 'exec-out', localScope);
      break;
    }

    // ── Try-Catch-Finally ──
    if (nextNode.type === 'tryCatchFinally') {
      const catches = (nextNode.data.catches as Array<{exceptionType:string; exceptionVarName:string}>) || [];
      const exVar = catches[0]?.exceptionVarName || (nextNode.data.exceptionVarName as string) || 'e';
      const tcfScope = localScope ? { ...localScope } : {};
      try {
        exec.runLogicChain(nextNode.id, 'exec-try', tcfScope);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        tcfScope[exVar] = msg;
        tcfScope['__exception_msg__' + nextNode.id] = msg;
        exec.consoleOutput.push(`> CAUGHT: ${msg}`);
        const numCatches = catches.length > 0 ? catches.length : 1;
        const execHandleId = (i: number) => i === 0 ? 'exec-catch' : `exec-catch-${i}`;
        exec.runLogicChain(nextNode.id, execHandleId(0), tcfScope);
        for (let i = 1; i < numCatches; i++) {
          exec.runLogicChain(nextNode.id, execHandleId(i), tcfScope);
        }
      } finally {
        exec.runLogicChain(nextNode.id, 'exec-finally', tcfScope);
      }
      exec.runLogicChain(nextNode.id, 'exec-out', localScope);
      break;
    }

    // ── Throw ──
    if (nextNode.type === 'throw') {
      const msgEdge = exec.edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in');
      const message = msgEdge
        ? String(exec.evaluateData(msgEdge.source, msgEdge.sourceHandle || undefined, localScope))
        : ((nextNode.data.inlineValue as string) || 'Error');
      throw new Error(message);
    }

    // ── Scanner ──
    if (nextNode.type === 'scanner') {
      const readType = (nextNode.data.readType as string) || 'nextLine';
      const promptEdge = exec.edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in-prompt');
      const promptText = promptEdge
        ? String(exec.evaluateData(promptEdge.source, promptEdge.sourceHandle || undefined, localScope))
        : ((nextNode.data.inlinePrompt as string) || '');
      if (promptText) exec.consoleOutput.push(`> ${promptText}`);
      const rawInput = exec.inputProvider ? (exec.inputProvider(promptText || 'Enter input:') ?? '') : '';
      exec.consoleOutput.push(`< ${rawInput}`);
      let value: unknown;
      switch (readType) {
        case 'nextInt': value = parseInt(rawInput, 10) || 0; break;
        case 'nextFloat': case 'nextDouble': value = parseFloat(rawInput) || 0; break;
        case 'nextLong': value = parseInt(rawInput, 10) || 0; break;
        case 'nextBoolean': value = rawInput === 'true'; break;
        default: value = rawInput;
      }
      exec.scannerValues.set(nextNode.id, value);
    }

    // ── Assert ──
    if (nextNode.type === 'assert') {
      const condEdge = exec.edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in-condition');
      const cond = exec.evaluateData(condEdge?.source || '', condEdge?.sourceHandle || undefined, localScope);
      if (!cond) {
        const msgEdge = exec.edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in-message');
        const msg = msgEdge ? exec.evaluateData(msgEdge.source, msgEdge.sourceHandle || undefined, localScope) : 'Assertion failed';
        throw new Error(String(msg));
      }
    }

    // ── Return ──
    if (nextNode.type === 'return') {
      const retEdge = exec.edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in');
      if (retEdge && localScope) localScope['__return__'] = exec.evaluateData(retEdge.source, retEdge.sourceHandle || undefined, localScope);
      break;
    }

    // ── Break / Continue ──
    if (nextNode.type === 'break') {
      const tl = nextNode.data.targetLabel as string | undefined;
      return tl ? `break:${tl}` : 'break';
    }
    if (nextNode.type === 'continue') {
      const tl = nextNode.data.targetLabel as string | undefined;
      return tl ? `continue:${tl}` : 'continue';
    }

    // ── TreeNode Ops (exec-chain) ──
    if (nextNode.type === 'treeNodeOp') {
      const op = nextNode.data.operation as string;
      const varName = (nextNode.data.variableName as string) || 'node';
      const ev = (h: string) => {
        const e = exec.edges.find(e => e.target === nextNode.id && e.targetHandle === h);
        return e ? exec.evaluateData(e.source, e.sourceHandle || undefined, localScope) : null;
      };
      if (op === 'create') {
        exec.treeNodeMemory[varName] = { val: ev('data-in-value'), left: null, right: null };
      } else if (op === 'setValue') {
        if (!exec.treeNodeMemory[varName]) exec.treeNodeMemory[varName] = { val: null, left: null, right: null };
        exec.treeNodeMemory[varName]!.val = ev('data-in-value');
      } else if (op === 'setLeft') {
        if (!exec.treeNodeMemory[varName]) exec.treeNodeMemory[varName] = { val: null, left: null, right: null };
        exec.treeNodeMemory[varName]!.left = ev('data-in-node') as TreeJsNode | null;
      } else if (op === 'setRight') {
        if (!exec.treeNodeMemory[varName]) exec.treeNodeMemory[varName] = { val: null, left: null, right: null };
        exec.treeNodeMemory[varName]!.right = ev('data-in-node') as TreeJsNode | null;
      }
    }

    // ── BST Ops (exec-chain) ──
    if (nextNode.type === 'bstOp') {
      const op = nextNode.data.operation as string;
      const varName = (nextNode.data.variableName as string) || 'root';
      const ev = (h: string) => {
        const e = exec.edges.find(e => e.target === nextNode.id && e.targetHandle === h);
        return e ? exec.evaluateData(e.source, e.sourceHandle || undefined, localScope) : null;
      };
      if (op === 'create') {
        exec.treeNodeMemory[varName] = null;
      } else if (op === 'insert') {
        exec.treeNodeMemory[varName] = bstInsertJS(exec.treeNodeMemory[varName] ?? null, ev('data-in-value'));
      } else if (op === 'delete') {
        exec.treeNodeMemory[varName] = bstDeleteJS(exec.treeNodeMemory[varName] ?? null, ev('data-in-value'));
      }
    }

    // ── AVL Tree Ops (exec-chain) ──
    if (nextNode.type === 'avlTreeOp') {
      const op = nextNode.data.operation as string;
      const varName = (nextNode.data.variableName as string) || 'root';
      const ev = (h: string) => {
        const e = exec.edges.find(e => e.target === nextNode.id && e.targetHandle === h);
        return e ? exec.evaluateData(e.source, e.sourceHandle || undefined, localScope) : null;
      };
      if (op === 'create') {
        exec.treeNodeMemory[varName] = null;
      } else if (op === 'insert') {
        exec.treeNodeMemory[varName] = avlInsertJS(exec.treeNodeMemory[varName] ?? null, ev('data-in-value'));
      } else if (op === 'delete') {
        exec.treeNodeMemory[varName] = avlDeleteJS(exec.treeNodeMemory[varName] ?? null, ev('data-in-value'));
      }
    }

    // ── JavaFX Ops (exec-chain) ──
    if (['javafxApp', 'javafxStageOp', 'javafxSceneOp', 'javafxLayoutOp', 'javafxControlOp',
         'javafxEventOp', 'javafxStyleOp', 'javafxDialogOp', 'javafxMenuOp', 'javafxTableOp',
         'javafxListOp', 'javafxMediaOp', 'javafxChartOp'].includes(nextNode.type as string)) {
      const varName = (nextNode.data.variableName as string) || 'fxNode';
      exec.fxMemory.set(varName, { type: nextNode.type, op: nextNode.data.operation });
    }

    // ── Swing Ops (exec-chain) ──
    if (['swingApp', 'swingFrameOp', 'swingPanelOp', 'swingControlOp',
         'swingEventOp', 'swingStyleOp', 'swingDialogOp', 'swingMenuOp'].includes(nextNode.type as string)) {
      const varName = (nextNode.data.variableName as string) || 'swingNode';
      exec.fxMemory.set(varName, { type: nextNode.type, op: nextNode.data.operation });
    }
    currentNodeId = nextNode.id;
    currentHandle = 'exec';
  }
  return undefined;
}
