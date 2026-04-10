import type { Node, Edge } from '@xyflow/react';

export type IssueSeverity = 'error' | 'warning';

export interface GraphIssue {
  severity: IssueSeverity;
  message: string;
  nodeId?: string;
}

/**
 * Node types that have an `exec-in` handle (i.e. they participate in
 * execution flow and must be wired up to run).
 * The `main` node is excluded — it is the root of the exec chain and has
 * no incoming exec handle.  `method` nodes are also excluded — they are
 * called indirectly via `callMethod`.
 */
const EXEC_IN_TYPES = new Set([
  'print',
  'callMethod',
  'setVar',
  'setLocalVar',
  'branch',
  'while',
  'for',
  'doWhile',
  'switch',
  'tryCatchFinally',
  'throw',
  'scanner',
  'return',
  'break',
  'continue',
  'forEach',
  'increment',
  'compoundAssign',
]);

/** Returns true when an arrayOp node has an exec-in handle. */
function arrayOpHasExecIn(node: Node): boolean {
  return node.type === 'arrayOp' && (node.data.operation as string) === 'set';
}

/** Returns true when the node accepts an incoming exec edge. */
function hasExecIn(node: Node): boolean {
  if (node.type === 'main' || node.type === 'method') return false;
  return EXEC_IN_TYPES.has(node.type ?? '') || arrayOpHasExecIn(node);
}

/**
 * Analyse a node graph and return a list of issues (errors / warnings).
 * The function is pure — no side effects.
 */
export function validateGraph(nodes: Node[], edges: Edge[]): GraphIssue[] {
  const issues: GraphIssue[] = [];

  // ── 1 & 7  Main-node checks ──────────────────────────────────
  const mainNodes = nodes.filter((n) => n.type === 'main');
  if (mainNodes.length === 0) {
    issues.push({ severity: 'error', message: 'Your graph has no Main node — every program needs one.' });
  } else if (mainNodes.length > 1) {
    for (const m of mainNodes) {
      issues.push({
        severity: 'error',
        message: 'There are multiple Main nodes — only one is allowed.',
        nodeId: m.id,
      });
    }
  }

  // ── 2  Duplicate variable names ───────────────────────────────
  const javaNodes = nodes.filter((n) => n.type === 'java');
  const labelCounts = new Map<string, Node[]>();
  for (const n of javaNodes) {
    const label = n.data.label as string;
    if (!label) continue;
    const arr = labelCounts.get(label) ?? [];
    arr.push(n);
    labelCounts.set(label, arr);
  }
  for (const [label, group] of labelCounts) {
    if (group.length > 1) {
      for (const n of group) {
        issues.push({
          severity: 'warning',
          message: `Duplicate variable name "${label}" — this will cause conflicts.`,
          nodeId: n.id,
        });
      }
    }
  }

  // ── 3  Unconnected exec-in ────────────────────────────────────
  const nodesWithExecIn = nodes.filter(hasExecIn);
  const targetedByExecIn = new Set(
    edges
      .filter((e) => (e.targetHandle ?? '').startsWith('exec'))
      .map((e) => e.target),
  );

  for (const n of nodesWithExecIn) {
    if (!targetedByExecIn.has(n.id)) {
      const label = (n.data.label as string) || n.type || 'node';
      issues.push({
        severity: 'warning',
        message: `"${label}" has no incoming execution connection — it will never run.`,
        nodeId: n.id,
      });
    }
  }

  // ── 4  Unreachable nodes ──────────────────────────────────────
  // BFS from every main node + every method node following outgoing exec edges.
  const reachable = new Set<string>();
  const adjacency = new Map<string, string[]>();

  for (const e of edges) {
    const sh = e.sourceHandle ?? '';
    const th = e.targetHandle ?? '';
    if (sh.startsWith('exec') && th.startsWith('exec')) {
      const list = adjacency.get(e.source) ?? [];
      list.push(e.target);
      adjacency.set(e.source, list);
    }
  }

  const startIds = nodes
    .filter((n) => n.type === 'main' || n.type === 'method')
    .map((n) => n.id);

  const queue = [...startIds];
  for (const id of queue) {
    if (reachable.has(id)) continue;
    reachable.add(id);
    const neighbours = adjacency.get(id) ?? [];
    for (const nb of neighbours) {
      if (!reachable.has(nb)) queue.push(nb);
    }
  }

  for (const n of nodesWithExecIn) {
    if (!reachable.has(n.id)) {
      const label = (n.data.label as string) || n.type || 'node';
      issues.push({
        severity: 'warning',
        message: `"${label}" is unreachable — it can't be reached from Main or any method.`,
        nodeId: n.id,
      });
    }
  }

  // ── 5  Empty method name ──────────────────────────────────────
  for (const n of nodes) {
    if (n.type === 'method' && !(n.data.label as string)?.trim()) {
      issues.push({
        severity: 'error',
        message: 'This method has no name — give it one so it can be called.',
        nodeId: n.id,
      });
    }
  }

  // ── 6  CallMethod to nonexistent method ───────────────────────
  const methodNames = new Set(
    nodes
      .filter((n) => n.type === 'method')
      .map((n) => (n.data.label as string)?.trim())
      .filter(Boolean),
  );

  for (const n of nodes) {
    if (n.type === 'callMethod') {
      const target = (n.data.methodName as string)?.trim();
      if (target && !methodNames.has(target)) {
        issues.push({
          severity: 'error',
          message: `Calls method "${target}" which doesn't exist — create it or fix the name.`,
          nodeId: n.id,
        });
      }
    }
  }

  return issues;
}
