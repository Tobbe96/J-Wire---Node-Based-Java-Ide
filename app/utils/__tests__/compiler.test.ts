import { describe, it, expect } from 'vitest';
import { generateJavaCode } from '../compiler';
import type { Node, Edge } from '@xyflow/react';

// Helper to create a minimal node
function makeNode(id: string, type: string, data: Record<string, unknown>): Node {
  return { id, type, position: { x: 0, y: 0 }, data };
}

function makeEdge(source: string, target: string, sourceHandle: string, targetHandle: string): Edge {
  return { id: `e-${source}-${target}-${sourceHandle}`, source, target, sourceHandle, targetHandle };
}

describe('generateJavaCode', () => {
  it('generates an empty class with no nodes', () => {
    const code = generateJavaCode([], []);
    expect(code).toContain('public class VisualScript');
    expect(code).toContain('}');
  });

  it('generates class fields from java-type nodes', () => {
    const nodes: Node[] = [
      makeNode('v1', 'java', { label: 'score', type: 'int', value: '42', modifier: 'public' }),
      makeNode('v2', 'java', { label: 'name', type: 'String', value: 'hello', modifier: 'private' }),
    ];
    const code = generateJavaCode(nodes, []);
    expect(code).toContain('public int score = 42;');
    expect(code).toContain('private String name = "hello";');
  });

  it('generates a main method with print statement', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('public static void main(String[] args)');
    expect(code).toContain('System.out.println("")');
  });

  it('generates print with a connected variable', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'score', type: 'int', value: '10' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'p1', 'data-out', 'data-in'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('System.out.println(score)');
  });

  it('generates math expressions', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('m1', 'math', { label: 'Add', operation: '+', type: 'int' }),
      makeNode('v1', 'java', { label: 'a', type: 'int', value: '5' }),
      makeNode('v2', 'java', { label: 'b', type: 'int', value: '3' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'm1', 'data-out', 'data-in-a'),
      makeEdge('v2', 'm1', 'data-out', 'data-in-b'),
      makeEdge('m1', 'p1', 'data-out', 'data-in'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('System.out.println((a + b))');
  });

  it('generates a method with parameters', () => {
    const nodes: Node[] = [
      makeNode('meth1', 'method', {
        label: 'greet',
        type: 'void',
        parameters: [{ id: 'p0', name: 'msg', type: 'String' }],
        localVariables: [],
      }),
    ];
    const code = generateJavaCode(nodes, []);
    expect(code).toContain('public void greet(String msg)');
  });

  it('generates a method with local variables', () => {
    const nodes: Node[] = [
      makeNode('meth1', 'method', {
        label: 'compute',
        type: 'void',
        parameters: [],
        localVariables: [{ id: 'l0', name: 'total', type: 'int', value: '0' }],
      }),
    ];
    const code = generateJavaCode(nodes, []);
    expect(code).toContain('int total = 0;');
  });

  it('generates callMethod invocation', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('meth1', 'method', {
        label: 'sayHello',
        type: 'void',
        parameters: [],
        localVariables: [],
      }),
      makeNode('call1', 'callMethod', { methodName: 'sayHello' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'call1', 'exec-out', 'exec-in'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('sayHello()');
  });

  it('generates callMethod with arguments', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('meth1', 'method', {
        label: 'add',
        type: 'void',
        parameters: [
          { id: 'p0', name: 'x', type: 'int', defaultValue: '0' },
          { id: 'p1', name: 'y', type: 'int', defaultValue: '0' },
        ],
        localVariables: [],
      }),
      makeNode('call1', 'callMethod', { methodName: 'add' }),
      makeNode('v1', 'java', { label: 'a', type: 'int', value: '5' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'call1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'call1', 'data-out', 'arg-in-0'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('add(a, 0)');
  });

  it('generates if/else branches', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('br', 'branch', { label: 'Branch' }),
      makeNode('v1', 'java', { label: 'flag', type: 'boolean', value: 'true' }),
      makeNode('p1', 'print', { label: 'True Print' }),
      makeNode('p2', 'print', { label: 'False Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'br', 'exec-out', 'exec-in'),
      makeEdge('v1', 'br', 'data-out', 'data-in'),
      makeEdge('br', 'p1', 'exec-out-true', 'exec-in'),
      makeEdge('br', 'p2', 'exec-out-false', 'exec-in'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('if (flag)');
    expect(code).toContain('} else {');
  });

  it('generates while loop', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('w1', 'while', { label: 'While' }),
      makeNode('v1', 'java', { label: 'running', type: 'boolean', value: 'true' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'w1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'w1', 'data-out', 'data-in'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('while (running)');
  });

  it('generates return statement', () => {
    const nodes: Node[] = [
      makeNode('meth1', 'method', {
        label: 'getValue',
        type: 'void',
        parameters: [],
        localVariables: [],
      }),
      makeNode('r1', 'return', { label: 'Return' }),
      makeNode('v1', 'java', { label: 'result', type: 'int', value: '42' }),
    ];
    const edges: Edge[] = [
      makeEdge('meth1', 'r1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'r1', 'data-out', 'data-in'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('return result;');
  });

  it('generates setVar assignment', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('sv1', 'setVar', { label: 'Set score', variableName: 'score' }),
      makeNode('v1', 'java', { label: 'newVal', type: 'int', value: '100' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'sv1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'sv1', 'data-out', 'data-in'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('score = newVal;');
  });

  it('generates setLocalVar assignment', () => {
    const nodes: Node[] = [
      makeNode('meth1', 'method', {
        label: 'doStuff',
        type: 'void',
        parameters: [],
        localVariables: [{ id: 'l0', name: 'temp', type: 'int', value: '0' }],
      }),
      makeNode('sl1', 'setLocalVar', { label: 'Set temp', localVarName: 'temp' }),
      makeNode('v1', 'java', { label: 'x', type: 'int', value: '7' }),
    ];
    const edges: Edge[] = [
      makeEdge('meth1', 'sl1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'sl1', 'data-out', 'data-in'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('temp = x;');
  });

  it('resolves method parameter outputs via param-out handles', () => {
    const nodes: Node[] = [
      makeNode('meth1', 'method', {
        label: 'showParam',
        type: 'void',
        parameters: [{ id: 'p0', name: 'msg', type: 'String' }],
        localVariables: [],
      }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('meth1', 'p1', 'exec-out', 'exec-in'),
      makeEdge('meth1', 'p1', 'param-out-0', 'data-in'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('System.out.println(msg)');
  });

  it('resolves getter nodes to variable names', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'count', type: 'int', value: '0' }),
      makeNode('g1', 'getter', { label: 'count', type: 'int', variableId: 'v1' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('g1', 'p1', 'data-out', 'data-in'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('System.out.println(count)');
  });

  it('applies default modifier when none specified', () => {
    const nodes: Node[] = [
      makeNode('v1', 'java', { label: 'val', type: 'int', value: '1' }),
    ];
    const code = generateJavaCode(nodes, []);
    expect(code).toContain('public int val = 1;');
  });
});
