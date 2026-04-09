import { describe, it, expect } from 'vitest';
import { executeGraph } from '../executor';
import type { Node, Edge } from '@xyflow/react';

function makeNode(id: string, type: string, data: Record<string, unknown>): Node {
  return { id, type, position: { x: 0, y: 0 }, data };
}

function makeEdge(source: string, target: string, sourceHandle: string, targetHandle: string): Edge {
  return { id: `e-${source}-${target}-${sourceHandle}`, source, target, sourceHandle, targetHandle };
}

describe('executeGraph', () => {
  it('returns error when no main node exists', () => {
    const output = executeGraph([], []);
    expect(output).toEqual(['> FATAL ERROR: No Main() found!']);
  });

  it('executes empty main method', () => {
    const nodes: Node[] = [makeNode('main', 'main', { label: 'Main' })];
    const output = executeGraph(nodes, []);
    expect(output[0]).toBe('> Starting JVM...');
    expect(output[output.length - 1]).toBe('> Process finished.');
  });

  it('prints null when no data is connected', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> null');
  });

  it('prints variable value', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'score', type: 'int', value: '42' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> 42');
  });

  it('evaluates math operations', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'a', type: 'int', value: '10' }),
      makeNode('v2', 'java', { label: 'b', type: 'int', value: '3' }),
      makeNode('m1', 'math', { label: 'Add', operation: '+', type: 'int' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'm1', 'data-out', 'data-in-a'),
      makeEdge('v2', 'm1', 'data-out', 'data-in-b'),
      makeEdge('m1', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> 13');
  });

  it('evaluates subtraction', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'a', type: 'int', value: '10' }),
      makeNode('v2', 'java', { label: 'b', type: 'int', value: '3' }),
      makeNode('m1', 'math', { label: 'Sub', operation: '-', type: 'int' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'm1', 'data-out', 'data-in-a'),
      makeEdge('v2', 'm1', 'data-out', 'data-in-b'),
      makeEdge('m1', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> 7');
  });

  it('evaluates multiplication', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'a', type: 'int', value: '4' }),
      makeNode('v2', 'java', { label: 'b', type: 'int', value: '5' }),
      makeNode('m1', 'math', { label: 'Mul', operation: '*', type: 'int' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'm1', 'data-out', 'data-in-a'),
      makeEdge('v2', 'm1', 'data-out', 'data-in-b'),
      makeEdge('m1', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> 20');
  });

  it('evaluates comparison (>)', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'a', type: 'int', value: '10' }),
      makeNode('v2', 'java', { label: 'b', type: 'int', value: '3' }),
      makeNode('m1', 'math', { label: 'GT', operation: '>', type: 'boolean' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'm1', 'data-out', 'data-in-a'),
      makeEdge('v2', 'm1', 'data-out', 'data-in-b'),
      makeEdge('m1', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> true');
  });

  it('calls a method and executes its body', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('meth1', 'method', {
        label: 'sayHi',
        type: 'void',
        parameters: [],
        localVariables: [],
      }),
      makeNode('call1', 'callMethod', { methodName: 'sayHi' }),
      makeNode('p1', 'print', { label: 'Print inside method' }),
      makeNode('v1', 'java', { label: 'greeting', type: 'String', value: 'Hi' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'call1', 'exec-out', 'exec-in'),
      makeEdge('meth1', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> Hi');
  });

  it('passes arguments to method calls', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('meth1', 'method', {
        label: 'showNum',
        type: 'void',
        parameters: [{ id: 'p0', name: 'num', type: 'int' }],
        localVariables: [],
      }),
      makeNode('call1', 'callMethod', { methodName: 'showNum' }),
      makeNode('p1', 'print', { label: 'Print' }),
      makeNode('v1', 'java', { label: 'myVal', type: 'int', value: '99' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'call1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'call1', 'data-out', 'arg-in-0'),
      makeEdge('meth1', 'p1', 'exec-out', 'exec-in'),
      makeEdge('meth1', 'p1', 'param-out-0', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> 99');
  });

  it('executes branch - true path', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('br', 'branch', { label: 'Branch' }),
      makeNode('m1', 'math', { label: 'GT', operation: '>', type: 'boolean' }),
      makeNode('v1', 'java', { label: 'a', type: 'int', value: '10' }),
      makeNode('v2', 'java', { label: 'b', type: 'int', value: '5' }),
      makeNode('pTrue', 'print', { label: 'True' }),
      makeNode('pFalse', 'print', { label: 'False' }),
      makeNode('vTrue', 'java', { label: 'yes', type: 'String', value: 'YES' }),
      makeNode('vFalse', 'java', { label: 'no', type: 'String', value: 'NO' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'br', 'exec-out', 'exec-in'),
      makeEdge('v1', 'm1', 'data-out', 'data-in-a'),
      makeEdge('v2', 'm1', 'data-out', 'data-in-b'),
      makeEdge('m1', 'br', 'data-out', 'data-in'),
      makeEdge('br', 'pTrue', 'exec-out-true', 'exec-in'),
      makeEdge('br', 'pFalse', 'exec-out-false', 'exec-in'),
      makeEdge('vTrue', 'pTrue', 'data-out', 'data-in'),
      makeEdge('vFalse', 'pFalse', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> YES');
    expect(output).not.toContain('> NO');
  });

  it('executes branch - false path', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('br', 'branch', { label: 'Branch' }),
      makeNode('m1', 'math', { label: 'GT', operation: '>', type: 'boolean' }),
      makeNode('v1', 'java', { label: 'a', type: 'int', value: '2' }),
      makeNode('v2', 'java', { label: 'b', type: 'int', value: '5' }),
      makeNode('pTrue', 'print', { label: 'True' }),
      makeNode('pFalse', 'print', { label: 'False' }),
      makeNode('vTrue', 'java', { label: 'yes', type: 'String', value: 'YES' }),
      makeNode('vFalse', 'java', { label: 'no', type: 'String', value: 'NO' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'br', 'exec-out', 'exec-in'),
      makeEdge('v1', 'm1', 'data-out', 'data-in-a'),
      makeEdge('v2', 'm1', 'data-out', 'data-in-b'),
      makeEdge('m1', 'br', 'data-out', 'data-in'),
      makeEdge('br', 'pTrue', 'exec-out-true', 'exec-in'),
      makeEdge('br', 'pFalse', 'exec-out-false', 'exec-in'),
      makeEdge('vTrue', 'pTrue', 'data-out', 'data-in'),
      makeEdge('vFalse', 'pFalse', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> NO');
    expect(output).not.toContain('> YES');
  });

  it('sets class variable', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'counter', type: 'int', value: '0' }),
      makeNode('sv1', 'setVar', { label: 'Set counter', variableName: 'counter' }),
      makeNode('newVal', 'java', { label: 'val', type: 'int', value: '100' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'sv1', 'exec-out', 'exec-in'),
      makeEdge('newVal', 'sv1', 'data-out', 'data-in'),
      makeEdge('sv1', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> 100');
  });

  it('reports missing method on callMethod', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('call1', 'callMethod', { methodName: 'nonExistent' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'call1', 'exec-out', 'exec-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output.some(l => l.includes("ERROR: Method 'nonExistent' not found"))).toBe(true);
  });

  it('chains multiple print statements', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('p1', 'print', { label: 'Print 1' }),
      makeNode('p2', 'print', { label: 'Print 2' }),
      makeNode('v1', 'java', { label: 'first', type: 'String', value: 'Hello' }),
      makeNode('v2', 'java', { label: 'second', type: 'String', value: 'World' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('p1', 'p2', 'exec-out', 'exec-in'),
      makeEdge('v1', 'p1', 'data-out', 'data-in'),
      makeEdge('v2', 'p2', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    const printedLines = output.filter(l => l.startsWith('> ') && !l.includes('Starting') && !l.includes('finished'));
    expect(printedLines).toEqual(['> Hello', '> World']);
  });

  it('handles String variable initialization', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'name', type: 'String', value: 'Alice' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> Alice');
  });

  it('handles equality comparison (==)', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'a', type: 'int', value: '5' }),
      makeNode('v2', 'java', { label: 'b', type: 'int', value: '5' }),
      makeNode('m1', 'math', { label: 'EQ', operation: '==', type: 'boolean' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'm1', 'data-out', 'data-in-a'),
      makeEdge('v2', 'm1', 'data-out', 'data-in-b'),
      makeEdge('m1', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> true');
  });
});
