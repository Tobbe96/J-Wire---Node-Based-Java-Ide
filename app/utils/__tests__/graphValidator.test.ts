import { describe, it, expect } from 'vitest';
import type { Node, Edge } from '@xyflow/react';
import { validateGraph, type GraphIssue } from '../graphValidator';

/* ── helpers ────────────────────────────────────────────────────── */

const makeNode = (id: string, type: string, data: Record<string, unknown> = {}): Node => ({
  id,
  type,
  position: { x: 0, y: 0 },
  data: { label: type, ...data },
});

const makeEdge = (
  source: string,
  target: string,
  sourceHandle = 'exec-out',
  targetHandle = 'exec-in',
): Edge => ({
  id: `${source}-${target}`,
  source,
  target,
  sourceHandle,
  targetHandle,
});

const mainNode = (id = 'main') => makeNode(id, 'main', { label: 'Main' });

/* ── 1 & 7 — Main node checks ──────────────────────────────────── */

describe('Main node checks', () => {
  it('flags missing main node', () => {
    const issues = validateGraph([], []);
    expect(issues).toContainEqual(
      expect.objectContaining({ severity: 'error', message: expect.stringContaining('no Main node') }),
    );
  });

  it('flags multiple main nodes', () => {
    const nodes = [mainNode('m1'), mainNode('m2')];
    const issues = validateGraph(nodes, []);
    const multiples = issues.filter((i) => i.message.includes('multiple Main'));
    expect(multiples).toHaveLength(2);
    expect(multiples.every((i) => i.severity === 'error')).toBe(true);
  });

  it('no main error when exactly one main exists', () => {
    const issues = validateGraph([mainNode()], []);
    expect(issues.find((i) => i.message.includes('Main node'))).toBeUndefined();
  });
});

/* ── 2 — Duplicate variable names ───────────────────────────────── */

describe('Duplicate variable names', () => {
  it('warns on duplicate java-node labels', () => {
    const nodes = [
      mainNode(),
      makeNode('v1', 'java', { label: 'count', type: 'int', value: '0' }),
      makeNode('v2', 'java', { label: 'count', type: 'int', value: '1' }),
    ];
    const issues = validateGraph(nodes, []);
    const dupes = issues.filter((i) => i.message.includes('Duplicate variable'));
    expect(dupes).toHaveLength(2);
    expect(dupes[0].severity).toBe('warning');
  });

  it('no warning when labels are unique', () => {
    const nodes = [
      mainNode(),
      makeNode('v1', 'java', { label: 'a', type: 'int', value: '0' }),
      makeNode('v2', 'java', { label: 'b', type: 'int', value: '0' }),
    ];
    const issues = validateGraph(nodes, []);
    expect(issues.filter((i) => i.message.includes('Duplicate'))).toHaveLength(0);
  });
});

/* ── 3 — Unconnected exec-in ────────────────────────────────────── */

describe('Unconnected exec-in', () => {
  it('warns when a print node has no incoming exec edge', () => {
    const nodes = [mainNode(), makeNode('p1', 'print')];
    const issues = validateGraph(nodes, []);
    const unconnected = issues.filter((i) => i.message.includes('no incoming execution'));
    expect(unconnected.some((i) => i.nodeId === 'p1')).toBe(true);
  });

  it('no warning when the print node is connected', () => {
    const nodes = [mainNode(), makeNode('p1', 'print')];
    const edges = [makeEdge('main', 'p1')];
    const issues = validateGraph(nodes, edges);
    expect(issues.filter((i) => i.nodeId === 'p1' && i.message.includes('no incoming execution'))).toHaveLength(0);
  });

  it('does not warn about the main node itself', () => {
    const issues = validateGraph([mainNode()], []);
    expect(issues.filter((i) => i.message.includes('no incoming execution'))).toHaveLength(0);
  });

  it('warns for arrayOp with operation=set but not for access', () => {
    const nodes = [
      mainNode(),
      makeNode('a1', 'arrayOp', { label: 'Array Set', operation: 'set' }),
      makeNode('a2', 'arrayOp', { label: 'Array Access', operation: 'access' }),
    ];
    const issues = validateGraph(nodes, []);
    const unconnected = issues.filter((i) => i.message.includes('no incoming execution'));
    expect(unconnected.some((i) => i.nodeId === 'a1')).toBe(true);
    expect(unconnected.some((i) => i.nodeId === 'a2')).toBe(false);
  });
});

/* ── 4 — Unreachable nodes ──────────────────────────────────────── */

describe('Unreachable nodes', () => {
  it('flags nodes unreachable from main', () => {
    const nodes = [
      mainNode(),
      makeNode('p1', 'print'),
      makeNode('p2', 'print', { label: 'Orphan' }),
    ];
    const edges = [makeEdge('main', 'p1')];
    const issues = validateGraph(nodes, edges);
    const unreachable = issues.filter((i) => i.message.includes('unreachable'));
    expect(unreachable.some((i) => i.nodeId === 'p2')).toBe(true);
    expect(unreachable.some((i) => i.nodeId === 'p1')).toBe(false);
  });

  it('method bodies are reachable', () => {
    const nodes = [
      mainNode(),
      makeNode('m1', 'method', { label: 'doStuff' }),
      makeNode('p1', 'print'),
      makeNode('call1', 'callMethod', { methodName: 'doStuff' }),
    ];
    const edges = [
      makeEdge('main', 'call1'),
      makeEdge('m1', 'p1'),
    ];
    const issues = validateGraph(nodes, edges);
    const unreachable = issues.filter((i) => i.message.includes('unreachable'));
    expect(unreachable.some((i) => i.nodeId === 'p1')).toBe(false);
  });
});

/* ── 5 — Empty method name ──────────────────────────────────────── */

describe('Empty method name', () => {
  it('errors on method with empty label', () => {
    const nodes = [mainNode(), makeNode('m1', 'method', { label: '' })];
    const issues = validateGraph(nodes, []);
    expect(issues).toContainEqual(
      expect.objectContaining({ severity: 'error', nodeId: 'm1', message: expect.stringContaining('no name') }),
    );
  });

  it('errors on method with whitespace-only label', () => {
    const nodes = [mainNode(), makeNode('m1', 'method', { label: '   ' })];
    const issues = validateGraph(nodes, []);
    expect(issues).toContainEqual(
      expect.objectContaining({ severity: 'error', nodeId: 'm1' }),
    );
  });

  it('no error for named method', () => {
    const nodes = [mainNode(), makeNode('m1', 'method', { label: 'doWork' })];
    const issues = validateGraph(nodes, []);
    expect(issues.filter((i) => i.nodeId === 'm1' && i.severity === 'error')).toHaveLength(0);
  });
});

/* ── 6 — CallMethod to nonexistent method ───────────────────────── */

describe('CallMethod to nonexistent method', () => {
  it('errors when target method does not exist', () => {
    const nodes = [
      mainNode(),
      makeNode('c1', 'callMethod', { methodName: 'ghost' }),
    ];
    const edges = [makeEdge('main', 'c1')];
    const issues = validateGraph(nodes, edges);
    expect(issues).toContainEqual(
      expect.objectContaining({
        severity: 'error',
        nodeId: 'c1',
        message: expect.stringContaining("ghost"),
      }),
    );
  });

  it('no error when target method exists', () => {
    const nodes = [
      mainNode(),
      makeNode('m1', 'method', { label: 'doWork' }),
      makeNode('c1', 'callMethod', { methodName: 'doWork' }),
    ];
    const edges = [makeEdge('main', 'c1')];
    const issues = validateGraph(nodes, edges);
    expect(issues.filter((i) => i.nodeId === 'c1' && i.severity === 'error')).toHaveLength(0);
  });
});
