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

  it('prints empty when no data is connected and no inline value', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> ');
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

  // --- Scanner tests ---

  it('reads scanner input via inputProvider and prints it', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('sc1', 'scanner', { label: 'Read Line', readType: 'nextLine' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'sc1', 'exec-out', 'exec-in'),
      makeEdge('sc1', 'p1', 'exec-out', 'exec-in'),
      makeEdge('sc1', 'p1', 'data-out', 'data-in'),
    ];
    const inputProvider = () => 'Hello World';
    const output = executeGraph(nodes, edges, inputProvider);
    expect(output).toContain('> Hello World');
    expect(output).toContain('< Hello World');
  });

  it('reads scanner nextInt and parses to number', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('sc1', 'scanner', { label: 'Read Int', readType: 'nextInt' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'sc1', 'exec-out', 'exec-in'),
      makeEdge('sc1', 'p1', 'exec-out', 'exec-in'),
      makeEdge('sc1', 'p1', 'data-out', 'data-in'),
    ];
    const inputProvider = () => '42';
    const output = executeGraph(nodes, edges, inputProvider);
    expect(output).toContain('> 42');
  });

  it('uses empty string when no inputProvider for scanner', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('sc1', 'scanner', { label: 'Read Line', readType: 'nextLine' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'sc1', 'exec-out', 'exec-in'),
      makeEdge('sc1', 'p1', 'exec-out', 'exec-in'),
      makeEdge('sc1', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> ');
    expect(output).toContain('< ');
  });

  it('shows prompt message before scanner read', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'msg', type: 'String', value: 'Enter name:' }),
      makeNode('sc1', 'scanner', { label: 'Read Line', readType: 'nextLine' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'sc1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'sc1', 'data-out', 'data-in-prompt'),
      makeEdge('sc1', 'p1', 'exec-out', 'exec-in'),
      makeEdge('sc1', 'p1', 'data-out', 'data-in'),
    ];
    const inputProvider = () => 'Alice';
    const output = executeGraph(nodes, edges, inputProvider);
    expect(output).toContain('> Enter name:');
    expect(output).toContain('> Alice');
  });

  // --- Literal node tests ---

  it('prints literal String value directly', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('lit1', 'literal', { label: 'Literal', literalType: 'String', value: 'hello world' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('lit1', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> hello world');
  });

  it('prints literal int value', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('lit1', 'literal', { label: 'Literal', literalType: 'int', value: '42' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('lit1', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> 42');
  });

  it('uses literal as scanner prompt', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('lit1', 'literal', { label: 'Literal', literalType: 'String', value: 'What is your name?' }),
      makeNode('sc1', 'scanner', { label: 'Read Line', readType: 'nextLine' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'sc1', 'exec-out', 'exec-in'),
      makeEdge('lit1', 'sc1', 'data-out', 'data-in-prompt'),
      makeEdge('sc1', 'p1', 'exec-out', 'exec-in'),
      makeEdge('sc1', 'p1', 'data-out', 'data-in'),
    ];
    const inputProvider = () => 'Bob';
    const output = executeGraph(nodes, edges, inputProvider);
    expect(output).toContain('> What is your name?');
    expect(output).toContain('> Bob');
  });

  // --- Inline default tests ---

  it('prints inline value when no data edge connected', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('p1', 'print', { label: 'Print', inlineValue: 'Hello inline' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> Hello inline');
  });

  it('uses inline prompt for scanner when no prompt edge', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('sc1', 'scanner', { label: 'Read', readType: 'nextLine', inlinePrompt: 'Your name?' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'sc1', 'exec-out', 'exec-in'),
      makeEdge('sc1', 'p1', 'exec-out', 'exec-in'),
      makeEdge('sc1', 'p1', 'data-out', 'data-in'),
    ];
    const inputProvider = () => 'Alice';
    const output = executeGraph(nodes, edges, inputProvider);
    expect(output).toContain('> Your name?');
    expect(output).toContain('> Alice');
  });

  it('uses inline A/B for math when no data edges', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('math1', 'math', { label: 'ADD', operation: '+', inlineA: '10', inlineB: '7' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('math1', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> 17');
  });

  // --- char type tests ---

  it('prints char variable value', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'letter', type: 'char', value: 'A' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> A');
  });

  // --- Increment node tests ---

  it('increments a variable (post-increment)', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'count', type: 'int', value: '5' }),
      makeNode('inc', 'increment', { label: 'Increment', variableName: 'count', mode: 'post-increment' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'inc', 'exec-out', 'exec-in'),
      makeEdge('inc', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> 6');
  });

  it('decrements a variable (post-decrement)', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'count', type: 'int', value: '5' }),
      makeNode('dec', 'increment', { label: 'Decrement', variableName: 'count', mode: 'post-decrement' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'dec', 'exec-out', 'exec-in'),
      makeEdge('dec', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> 4');
  });

  it('increments with pre-increment mode', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'x', type: 'int', value: '0' }),
      makeNode('inc', 'increment', { label: 'Inc', variableName: 'x', mode: 'pre-increment' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'inc', 'exec-out', 'exec-in'),
      makeEdge('inc', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> 1');
  });

  // --- CompoundAssign node tests ---

  it('compound assigns += to a variable', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'total', type: 'int', value: '10' }),
      makeNode('v2', 'java', { label: 'amount', type: 'int', value: '3' }),
      makeNode('ca', 'compoundAssign', { label: 'Add Assign', variableName: 'total', operator: '+=' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'ca', 'exec-out', 'exec-in'),
      makeEdge('ca', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v2', 'ca', 'data-out', 'data-in'),
      makeEdge('v1', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> 13');
  });

  it('compound assigns *= to a variable', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'total', type: 'int', value: '10' }),
      makeNode('v2', 'java', { label: 'factor', type: 'int', value: '3' }),
      makeNode('ca', 'compoundAssign', { label: 'Mul Assign', variableName: 'total', operator: '*=' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'ca', 'exec-out', 'exec-in'),
      makeEdge('ca', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v2', 'ca', 'data-out', 'data-in'),
      makeEdge('v1', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> 30');
  });

  it('compound assigns -= to a variable', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'val', type: 'int', value: '20' }),
      makeNode('v2', 'java', { label: 'sub', type: 'int', value: '7' }),
      makeNode('ca', 'compoundAssign', { label: 'Sub Assign', variableName: 'val', operator: '-=' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'ca', 'exec-out', 'exec-in'),
      makeEdge('ca', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v2', 'ca', 'data-out', 'data-in'),
      makeEdge('v1', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> 13');
  });

  // --- mathFunc tests ---

  it('evaluates Math.sqrt via mathFunc', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'x', type: 'double', value: '16.0' }),
      makeNode('mf', 'mathFunc', { label: 'Sqrt', operation: 'sqrt', type: 'double' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'mf', 'data-out', 'data-in'),
      makeEdge('mf', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> 4');
  });

  it('evaluates Math.ceil via mathFunc', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'x', type: 'double', value: '3.2' }),
      makeNode('mf', 'mathFunc', { label: 'Ceil', operation: 'ceil', type: 'double' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'mf', 'data-out', 'data-in'),
      makeEdge('mf', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> 4');
  });

  it('evaluates Math.floor via mathFunc', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'x', type: 'double', value: '3.7' }),
      makeNode('mf', 'mathFunc', { label: 'Floor', operation: 'floor', type: 'double' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'mf', 'data-out', 'data-in'),
      makeEdge('mf', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> 3');
  });

  it('evaluates Math.round via mathFunc', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'x', type: 'double', value: '3.5' }),
      makeNode('mf', 'mathFunc', { label: 'Round', operation: 'round', type: 'double' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'mf', 'data-out', 'data-in'),
      makeEdge('mf', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> 4');
  });

  it('evaluates Math.random via mathFunc', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('mf', 'mathFunc', { label: 'Random', operation: 'random', type: 'double' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('mf', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    const randLine = output.find(l => l.startsWith('> ') && !l.includes('Starting') && !l.includes('finished'));
    expect(randLine).toBeDefined();
    const randVal = Number(randLine!.replace('> ', ''));
    expect(randVal).toBeGreaterThanOrEqual(0);
    expect(randVal).toBeLessThan(1);
  });

  it('evaluates Math.abs via mathFunc', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'x', type: 'int', value: '-7' }),
      makeNode('mf', 'mathFunc', { label: 'Abs', operation: 'abs', type: 'int' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'mf', 'data-out', 'data-in'),
      makeEdge('mf', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> 7');
  });

  it('evaluates Math.pow via mathFunc', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'base', type: 'int', value: '2' }),
      makeNode('v2', 'java', { label: 'exp', type: 'int', value: '10' }),
      makeNode('mf', 'mathFunc', { label: 'Pow', operation: 'pow', type: 'int' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'mf', 'data-out', 'data-in-a'),
      makeEdge('v2', 'mf', 'data-out', 'data-in-b'),
      makeEdge('mf', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> 1024');
  });

  // --- StringFormat node tests ---

  it('formats string with single argument', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'name', type: 'String', value: 'World' }),
      makeNode('sf', 'stringFormat', { label: 'Format', formatString: 'Hello %s!', argCount: 1 }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'sf', 'data-out', 'data-in-arg-0'),
      makeEdge('sf', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> Hello World!');
  });

  it('formats string with multiple arguments', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'name', type: 'String', value: 'Alice' }),
      makeNode('v2', 'java', { label: 'age', type: 'int', value: '25' }),
      makeNode('sf', 'stringFormat', { label: 'Format', formatString: '%s is %d years old', argCount: 2 }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'sf', 'data-out', 'data-in-arg-0'),
      makeEdge('v2', 'sf', 'data-out', 'data-in-arg-1'),
      makeEdge('sf', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> Alice is 25 years old');
  });

  // --- ArrayList operation tests ---

  it('creates arraylist, adds element, and gets it', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'x', type: 'int', value: '42' }),
      makeNode('idx', 'java', { label: 'i', type: 'int', value: '0' }),
      makeNode('al_create', 'arrayListOp', { label: 'Create', operation: 'create', variableName: 'nums', elementType: 'int' }),
      makeNode('al_add', 'arrayListOp', { label: 'Add', operation: 'add', variableName: 'nums' }),
      makeNode('al_get', 'arrayListOp', { label: 'Get', operation: 'get', variableName: 'nums' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'al_create', 'exec-out', 'exec-in'),
      makeEdge('al_create', 'al_add', 'exec-out', 'exec-in'),
      makeEdge('al_add', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'al_add', 'data-out', 'data-in-value'),
      makeEdge('idx', 'al_get', 'data-out', 'data-in-index'),
      makeEdge('al_get', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> 42');
  });

  it('reports arraylist size after adding elements', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'x', type: 'int', value: '10' }),
      makeNode('v2', 'java', { label: 'y', type: 'int', value: '20' }),
      makeNode('al_create', 'arrayListOp', { label: 'Create', operation: 'create', variableName: 'nums', elementType: 'int' }),
      makeNode('al_add1', 'arrayListOp', { label: 'Add1', operation: 'add', variableName: 'nums' }),
      makeNode('al_add2', 'arrayListOp', { label: 'Add2', operation: 'add', variableName: 'nums' }),
      makeNode('al_size', 'arrayListOp', { label: 'Size', operation: 'size', variableName: 'nums' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'al_create', 'exec-out', 'exec-in'),
      makeEdge('al_create', 'al_add1', 'exec-out', 'exec-in'),
      makeEdge('al_add1', 'al_add2', 'exec-out', 'exec-in'),
      makeEdge('al_add2', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'al_add1', 'data-out', 'data-in-value'),
      makeEdge('v2', 'al_add2', 'data-out', 'data-in-value'),
      makeEdge('al_size', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> 2');
  });

  it('checks arraylist contains', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'x', type: 'int', value: '7' }),
      makeNode('al_create', 'arrayListOp', { label: 'Create', operation: 'create', variableName: 'items', elementType: 'int' }),
      makeNode('al_add', 'arrayListOp', { label: 'Add', operation: 'add', variableName: 'items' }),
      makeNode('al_contains', 'arrayListOp', { label: 'Contains', operation: 'contains', variableName: 'items' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'al_create', 'exec-out', 'exec-in'),
      makeEdge('al_create', 'al_add', 'exec-out', 'exec-in'),
      makeEdge('al_add', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'al_add', 'data-out', 'data-in-value'),
      makeEdge('v1', 'al_contains', 'data-out', 'data-in-value'),
      makeEdge('al_contains', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> true');
  });

  // --- HashMap operation tests ---

  it('creates hashmap, puts entry, and gets value', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('key1', 'java', { label: 'k', type: 'String', value: 'hello' }),
      makeNode('val1', 'java', { label: 'v', type: 'int', value: '99' }),
      makeNode('hm_create', 'hashMapOp', { label: 'Create', operation: 'create', variableName: 'map', keyType: 'String', valueType: 'int' }),
      makeNode('hm_put', 'hashMapOp', { label: 'Put', operation: 'put', variableName: 'map' }),
      makeNode('hm_get', 'hashMapOp', { label: 'Get', operation: 'get', variableName: 'map' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'hm_create', 'exec-out', 'exec-in'),
      makeEdge('hm_create', 'hm_put', 'exec-out', 'exec-in'),
      makeEdge('hm_put', 'p1', 'exec-out', 'exec-in'),
      makeEdge('key1', 'hm_put', 'data-out', 'data-in-key'),
      makeEdge('val1', 'hm_put', 'data-out', 'data-in-value'),
      makeEdge('key1', 'hm_get', 'data-out', 'data-in-key'),
      makeEdge('hm_get', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> 99');
  });

  it('checks hashmap containsKey', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('key1', 'java', { label: 'k', type: 'String', value: 'foo' }),
      makeNode('val1', 'java', { label: 'v', type: 'int', value: '1' }),
      makeNode('hm_create', 'hashMapOp', { label: 'Create', operation: 'create', variableName: 'myMap', keyType: 'String', valueType: 'int' }),
      makeNode('hm_put', 'hashMapOp', { label: 'Put', operation: 'put', variableName: 'myMap' }),
      makeNode('hm_contains', 'hashMapOp', { label: 'ContainsKey', operation: 'containsKey', variableName: 'myMap' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'hm_create', 'exec-out', 'exec-in'),
      makeEdge('hm_create', 'hm_put', 'exec-out', 'exec-in'),
      makeEdge('hm_put', 'p1', 'exec-out', 'exec-in'),
      makeEdge('key1', 'hm_put', 'data-out', 'data-in-key'),
      makeEdge('val1', 'hm_put', 'data-out', 'data-in-value'),
      makeEdge('key1', 'hm_contains', 'data-out', 'data-in-key'),
      makeEdge('hm_contains', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> true');
  });

  it('reports hashmap size', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('k1', 'java', { label: 'k1', type: 'String', value: 'a' }),
      makeNode('k2', 'java', { label: 'k2', type: 'String', value: 'b' }),
      makeNode('val1', 'java', { label: 'v1', type: 'int', value: '1' }),
      makeNode('val2', 'java', { label: 'v2', type: 'int', value: '2' }),
      makeNode('hm_create', 'hashMapOp', { label: 'Create', operation: 'create', variableName: 'sizeMap', keyType: 'String', valueType: 'int' }),
      makeNode('hm_put1', 'hashMapOp', { label: 'Put1', operation: 'put', variableName: 'sizeMap' }),
      makeNode('hm_put2', 'hashMapOp', { label: 'Put2', operation: 'put', variableName: 'sizeMap' }),
      makeNode('hm_size', 'hashMapOp', { label: 'Size', operation: 'size', variableName: 'sizeMap' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'hm_create', 'exec-out', 'exec-in'),
      makeEdge('hm_create', 'hm_put1', 'exec-out', 'exec-in'),
      makeEdge('hm_put1', 'hm_put2', 'exec-out', 'exec-in'),
      makeEdge('hm_put2', 'p1', 'exec-out', 'exec-in'),
      makeEdge('k1', 'hm_put1', 'data-out', 'data-in-key'),
      makeEdge('val1', 'hm_put1', 'data-out', 'data-in-value'),
      makeEdge('k2', 'hm_put2', 'data-out', 'data-in-key'),
      makeEdge('val2', 'hm_put2', 'data-out', 'data-in-value'),
      makeEdge('hm_size', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> 2');
  });

  // --- Extended String Operations ---
  it('split returns array from split', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'csv', type: 'String', value: 'a,b,c' }),
      makeNode('v2', 'java', { label: 'delim', type: 'String', value: ',' }),
      makeNode('so', 'stringOp', { label: 'Split', operation: 'split' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'so', 'data-out', 'data-in'),
      makeEdge('v2', 'so', 'data-out', 'data-in-delimiter'),
      makeEdge('so', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> a,b,c');
  });

  it('contains returns true when substring found', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'msg', type: 'String', value: 'hello world' }),
      makeNode('v2', 'java', { label: 'sub', type: 'String', value: 'world' }),
      makeNode('so', 'stringOp', { label: 'Contains', operation: 'contains' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'so', 'data-out', 'data-in'),
      makeEdge('v2', 'so', 'data-out', 'data-in-target'),
      makeEdge('so', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> true');
  });

  it('contains returns false when substring not found', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'msg', type: 'String', value: 'hello world' }),
      makeNode('v2', 'java', { label: 'sub', type: 'String', value: 'xyz' }),
      makeNode('so', 'stringOp', { label: 'Contains', operation: 'contains' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'so', 'data-out', 'data-in'),
      makeEdge('v2', 'so', 'data-out', 'data-in-target'),
      makeEdge('so', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> false');
  });

  it('startsWith returns true when string starts with prefix', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'word', type: 'String', value: 'hello' }),
      makeNode('v2', 'java', { label: 'prefix', type: 'String', value: 'hel' }),
      makeNode('so', 'stringOp', { label: 'StartsWith', operation: 'startsWith' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'so', 'data-out', 'data-in'),
      makeEdge('v2', 'so', 'data-out', 'data-in-target'),
      makeEdge('so', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> true');
  });

  it('startsWith returns false when string does not start with prefix', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'word', type: 'String', value: 'hello' }),
      makeNode('v2', 'java', { label: 'prefix', type: 'String', value: 'world' }),
      makeNode('so', 'stringOp', { label: 'StartsWith', operation: 'startsWith' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'so', 'data-out', 'data-in'),
      makeEdge('v2', 'so', 'data-out', 'data-in-target'),
      makeEdge('so', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> false');
  });

  it('endsWith returns true when string ends with suffix', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'file', type: 'String', value: 'test.java' }),
      makeNode('v2', 'java', { label: 'suffix', type: 'String', value: '.java' }),
      makeNode('so', 'stringOp', { label: 'EndsWith', operation: 'endsWith' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'so', 'data-out', 'data-in'),
      makeEdge('v2', 'so', 'data-out', 'data-in-target'),
      makeEdge('so', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> true');
  });

  it('endsWith returns false when string does not end with suffix', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'file', type: 'String', value: 'test.java' }),
      makeNode('v2', 'java', { label: 'suffix', type: 'String', value: '.py' }),
      makeNode('so', 'stringOp', { label: 'EndsWith', operation: 'endsWith' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'so', 'data-out', 'data-in'),
      makeEdge('v2', 'so', 'data-out', 'data-in-target'),
      makeEdge('so', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> false');
  });

  // --- Trig Math Functions ---
  it('evaluates Math.sin', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'x', type: 'double', value: '0' }),
      makeNode('mf', 'mathFunc', { label: 'Sin', operation: 'sin', type: 'double' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'mf', 'data-out', 'data-in'),
      makeEdge('mf', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain(`> ${Math.sin(0)}`);
  });

  it('evaluates Math.cos', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'x', type: 'double', value: '0' }),
      makeNode('mf', 'mathFunc', { label: 'Cos', operation: 'cos', type: 'double' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'mf', 'data-out', 'data-in'),
      makeEdge('mf', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain(`> ${Math.cos(0)}`);
  });

  it('evaluates Math.tan', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'x', type: 'double', value: '0' }),
      makeNode('mf', 'mathFunc', { label: 'Tan', operation: 'tan', type: 'double' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'mf', 'data-out', 'data-in'),
      makeEdge('mf', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain(`> ${Math.tan(0)}`);
  });

  it('evaluates Math.asin', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'x', type: 'double', value: '0.5' }),
      makeNode('mf', 'mathFunc', { label: 'Asin', operation: 'asin', type: 'double' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'mf', 'data-out', 'data-in'),
      makeEdge('mf', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain(`> ${Math.asin(0.5)}`);
  });

  it('evaluates Math.acos', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'x', type: 'double', value: '0.5' }),
      makeNode('mf', 'mathFunc', { label: 'Acos', operation: 'acos', type: 'double' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'mf', 'data-out', 'data-in'),
      makeEdge('mf', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain(`> ${Math.acos(0.5)}`);
  });

  it('evaluates Math.atan', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'x', type: 'double', value: '1' }),
      makeNode('mf', 'mathFunc', { label: 'Atan', operation: 'atan', type: 'double' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'mf', 'data-out', 'data-in'),
      makeEdge('mf', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain(`> ${Math.atan(1)}`);
  });

  // --- Bitwise Operations ---
  it('evaluates bitwise AND', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'a', type: 'int', value: '6' }),
      makeNode('v2', 'java', { label: 'b', type: 'int', value: '3' }),
      makeNode('m1', 'math', { label: 'AND', operation: '&', type: 'int' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'm1', 'data-out', 'data-in-a'),
      makeEdge('v2', 'm1', 'data-out', 'data-in-b'),
      makeEdge('m1', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain(`> ${6 & 3}`);
  });

  it('evaluates bitwise OR', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'a', type: 'int', value: '6' }),
      makeNode('v2', 'java', { label: 'b', type: 'int', value: '3' }),
      makeNode('m1', 'math', { label: 'OR', operation: '|', type: 'int' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'm1', 'data-out', 'data-in-a'),
      makeEdge('v2', 'm1', 'data-out', 'data-in-b'),
      makeEdge('m1', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain(`> ${6 | 3}`);
  });

  it('evaluates bitwise XOR', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'a', type: 'int', value: '6' }),
      makeNode('v2', 'java', { label: 'b', type: 'int', value: '3' }),
      makeNode('m1', 'math', { label: 'XOR', operation: '^', type: 'int' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'm1', 'data-out', 'data-in-a'),
      makeEdge('v2', 'm1', 'data-out', 'data-in-b'),
      makeEdge('m1', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain(`> ${6 ^ 3}`);
  });

  it('evaluates left shift', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'a', type: 'int', value: '1' }),
      makeNode('v2', 'java', { label: 'b', type: 'int', value: '4' }),
      makeNode('m1', 'math', { label: 'Shl', operation: '<<', type: 'int' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'm1', 'data-out', 'data-in-a'),
      makeEdge('v2', 'm1', 'data-out', 'data-in-b'),
      makeEdge('m1', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain(`> ${1 << 4}`);
  });

  it('evaluates right shift', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'a', type: 'int', value: '16' }),
      makeNode('v2', 'java', { label: 'b', type: 'int', value: '2' }),
      makeNode('m1', 'math', { label: 'Shr', operation: '>>', type: 'int' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'm1', 'data-out', 'data-in-a'),
      makeEdge('v2', 'm1', 'data-out', 'data-in-b'),
      makeEdge('m1', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain(`> ${16 >> 2}`);
  });

  it('evaluates bitwise NOT (~)', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'x', type: 'int', value: '5' }),
      makeNode('n1', 'not', { label: 'BitNot', operation: '~' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'n1', 'data-out', 'data-in'),
      makeEdge('n1', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain(`> ${~5}`);
  });

  // --- HashSet Operations ---
  it('creates hashset, adds element, and contains returns true', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'x', type: 'int', value: '42' }),
      makeNode('hs_create', 'hashSetOp', { label: 'Create', operation: 'create', variableName: 'mySet', elementType: 'int' }),
      makeNode('hs_add', 'hashSetOp', { label: 'Add', operation: 'add', variableName: 'mySet' }),
      makeNode('hs_contains', 'hashSetOp', { label: 'Contains', operation: 'contains', variableName: 'mySet' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'hs_create', 'exec-out', 'exec-in'),
      makeEdge('hs_create', 'hs_add', 'exec-out', 'exec-in'),
      makeEdge('hs_add', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'hs_add', 'data-out', 'data-in-value'),
      makeEdge('v1', 'hs_contains', 'data-out', 'data-in-value'),
      makeEdge('hs_contains', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> true');
  });

  it('hashset size returns count of elements', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'a', type: 'int', value: '1' }),
      makeNode('v2', 'java', { label: 'b', type: 'int', value: '2' }),
      makeNode('hs_create', 'hashSetOp', { label: 'Create', operation: 'create', variableName: 'mySet', elementType: 'int' }),
      makeNode('hs_add1', 'hashSetOp', { label: 'Add1', operation: 'add', variableName: 'mySet' }),
      makeNode('hs_add2', 'hashSetOp', { label: 'Add2', operation: 'add', variableName: 'mySet' }),
      makeNode('hs_size', 'hashSetOp', { label: 'Size', operation: 'size', variableName: 'mySet' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'hs_create', 'exec-out', 'exec-in'),
      makeEdge('hs_create', 'hs_add1', 'exec-out', 'exec-in'),
      makeEdge('hs_add1', 'hs_add2', 'exec-out', 'exec-in'),
      makeEdge('hs_add2', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'hs_add1', 'data-out', 'data-in-value'),
      makeEdge('v2', 'hs_add2', 'data-out', 'data-in-value'),
      makeEdge('hs_size', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    expect(output).toContain('> 2');
  });

  // --- Sort / Reverse (arrayListOp) ---
  it('sorts an arraylist and prints sorted order', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'c', type: 'int', value: '3' }),
      makeNode('v2', 'java', { label: 'a', type: 'int', value: '1' }),
      makeNode('v3', 'java', { label: 'b', type: 'int', value: '2' }),
      makeNode('idx0', 'java', { label: 'i0', type: 'int', value: '0' }),
      makeNode('al_create', 'arrayListOp', { label: 'Create', operation: 'create', variableName: 'nums', elementType: 'int' }),
      makeNode('al_add1', 'arrayListOp', { label: 'Add1', operation: 'add', variableName: 'nums' }),
      makeNode('al_add2', 'arrayListOp', { label: 'Add2', operation: 'add', variableName: 'nums' }),
      makeNode('al_add3', 'arrayListOp', { label: 'Add3', operation: 'add', variableName: 'nums' }),
      makeNode('al_sort', 'arrayListOp', { label: 'Sort', operation: 'sort', variableName: 'nums' }),
      makeNode('al_get', 'arrayListOp', { label: 'Get', operation: 'get', variableName: 'nums' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'al_create', 'exec-out', 'exec-in'),
      makeEdge('al_create', 'al_add1', 'exec-out', 'exec-in'),
      makeEdge('al_add1', 'al_add2', 'exec-out', 'exec-in'),
      makeEdge('al_add2', 'al_add3', 'exec-out', 'exec-in'),
      makeEdge('al_add3', 'al_sort', 'exec-out', 'exec-in'),
      makeEdge('al_sort', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'al_add1', 'data-out', 'data-in-value'),
      makeEdge('v2', 'al_add2', 'data-out', 'data-in-value'),
      makeEdge('v3', 'al_add3', 'data-out', 'data-in-value'),
      makeEdge('idx0', 'al_get', 'data-out', 'data-in-index'),
      makeEdge('al_get', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    // After sorting [3,1,2], first element should be 1
    expect(output).toContain('> 1');
  });

  it('reverses an arraylist and prints first element', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'a', type: 'int', value: '1' }),
      makeNode('v2', 'java', { label: 'b', type: 'int', value: '2' }),
      makeNode('v3', 'java', { label: 'c', type: 'int', value: '3' }),
      makeNode('idx0', 'java', { label: 'i0', type: 'int', value: '0' }),
      makeNode('al_create', 'arrayListOp', { label: 'Create', operation: 'create', variableName: 'nums', elementType: 'int' }),
      makeNode('al_add1', 'arrayListOp', { label: 'Add1', operation: 'add', variableName: 'nums' }),
      makeNode('al_add2', 'arrayListOp', { label: 'Add2', operation: 'add', variableName: 'nums' }),
      makeNode('al_add3', 'arrayListOp', { label: 'Add3', operation: 'add', variableName: 'nums' }),
      makeNode('al_rev', 'arrayListOp', { label: 'Reverse', operation: 'reverse', variableName: 'nums' }),
      makeNode('al_get', 'arrayListOp', { label: 'Get', operation: 'get', variableName: 'nums' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'al_create', 'exec-out', 'exec-in'),
      makeEdge('al_create', 'al_add1', 'exec-out', 'exec-in'),
      makeEdge('al_add1', 'al_add2', 'exec-out', 'exec-in'),
      makeEdge('al_add2', 'al_add3', 'exec-out', 'exec-in'),
      makeEdge('al_add3', 'al_rev', 'exec-out', 'exec-in'),
      makeEdge('al_rev', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'al_add1', 'data-out', 'data-in-value'),
      makeEdge('v2', 'al_add2', 'data-out', 'data-in-value'),
      makeEdge('v3', 'al_add3', 'data-out', 'data-in-value'),
      makeEdge('idx0', 'al_get', 'data-out', 'data-in-index'),
      makeEdge('al_get', 'p1', 'data-out', 'data-in'),
    ];
    const output = executeGraph(nodes, edges);
    // After reversing [1,2,3], first element should be 3
    expect(output).toContain('> 3');
  });
});
