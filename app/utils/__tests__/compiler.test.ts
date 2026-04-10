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
    expect(code).toContain('public static int score = 42;');
    expect(code).toContain('private static String name = "hello";');
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
    expect(code).toContain('public static void greet(String msg)');
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
    expect(code).toContain('public static int val = 1;');
  });

  // --- Scanner tests ---

  it('generates Scanner import and field when scanner nodes exist', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('sc1', 'scanner', { label: 'Read Line', readType: 'nextLine' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'sc1', 'exec-out', 'exec-in'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('import java.util.Scanner;');
    expect(code).toContain('static Scanner __scanner = new Scanner(System.in);');
  });

  it('does not generate Scanner import when no scanner nodes exist', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
    ];
    const code = generateJavaCode(nodes, []);
    expect(code).not.toContain('import java.util.Scanner');
    expect(code).not.toContain('Scanner');
  });

  it('generates scanner nextLine read', () => {
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
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('String __input_0__ = __scanner.nextLine();');
    expect(code).toContain('System.out.println(__input_0__)');
  });

  it('generates scanner nextInt read', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('sc1', 'scanner', { label: 'Read Int', readType: 'nextInt' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'sc1', 'exec-out', 'exec-in'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('int __input_0__ = __scanner.nextInt();');
  });

  it('generates scanner with prompt', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'promptMsg', type: 'String', value: 'Enter name: ' }),
      makeNode('sc1', 'scanner', { label: 'Read Line', readType: 'nextLine' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'sc1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'sc1', 'data-out', 'data-in-prompt'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('System.out.print(promptMsg);');
    expect(code).toContain('String __input_0__ = __scanner.nextLine();');
  });

  it('generates multiple scanner reads with unique variable names', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('sc1', 'scanner', { label: 'Read Line', readType: 'nextLine' }),
      makeNode('sc2', 'scanner', { label: 'Read Int', readType: 'nextInt' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'sc1', 'exec-out', 'exec-in'),
      makeEdge('sc1', 'sc2', 'exec-out', 'exec-in'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('String __input_0__ = __scanner.nextLine();');
    expect(code).toContain('int __input_1__ = __scanner.nextInt();');
  });

  // --- Literal node tests ---

  it('generates literal String value in data expressions', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('lit1', 'literal', { label: 'Literal', literalType: 'String', value: 'hello world' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('lit1', 'p1', 'data-out', 'data-in'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('System.out.println("hello world")');
  });

  it('generates literal int value', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('lit1', 'literal', { label: 'Literal', literalType: 'int', value: '42' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('lit1', 'p1', 'data-out', 'data-in'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('System.out.println(42)');
  });

  // --- String .equals() tests ---

  it('uses .equals() for String == comparison', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'name', type: 'String', value: 'test' }),
      makeNode('v2', 'java', { label: 'other', type: 'String', value: 'test' }),
      makeNode('eq', 'math', { type: 'boolean', label: 'EQUALS', operation: '==', accepts: ['String'] }),
      makeNode('br', 'branch', { label: 'Branch', accepts: ['boolean'] }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'br', 'exec-out', 'exec-in'),
      makeEdge('v1', 'eq', 'data-out', 'data-in-a'),
      makeEdge('v2', 'eq', 'data-out', 'data-in-b'),
      makeEdge('eq', 'br', 'data-out', 'data-in'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('name.equals(other)');
    expect(code).not.toContain('name == other');
  });

  it('uses !.equals() for String != comparison', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'name', type: 'String', value: 'test' }),
      makeNode('v2', 'java', { label: 'other', type: 'String', value: 'test' }),
      makeNode('neq', 'math', { type: 'boolean', label: 'NOT EQUALS', operation: '!=', accepts: ['String'] }),
      makeNode('br', 'branch', { label: 'Branch', accepts: ['boolean'] }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'br', 'exec-out', 'exec-in'),
      makeEdge('v1', 'neq', 'data-out', 'data-in-a'),
      makeEdge('v2', 'neq', 'data-out', 'data-in-b'),
      makeEdge('neq', 'br', 'data-out', 'data-in'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('!name.equals(other)');
  });

  // --- Static methods test ---

  it('generates static methods callable from main', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('m1', 'method', { label: 'greet', type: 'void', parameters: [], localVariables: [] }),
      makeNode('call1', 'callMethod', { methodName: 'greet' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'call1', 'exec-out', 'exec-in'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('public static void greet()');
    expect(code).toContain('greet();');
  });

  // --- Inline default tests ---

  it('uses inline value for print when no data edge', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('p1', 'print', { label: 'Print', inlineValue: 'Hello inline' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('System.out.println("Hello inline")');
  });

  it('uses inline value for branch when no data edge', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('br', 'branch', { label: 'Branch', inlineValue: 'true' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'br', 'exec-out', 'exec-in'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('if (true)');
  });

  it('uses inline prompt for scanner when no prompt edge', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('sc1', 'scanner', { label: 'Read', readType: 'nextLine', inlinePrompt: 'Enter name:' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'sc1', 'exec-out', 'exec-in'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('System.out.print("Enter name:")');
    expect(code).toContain('__scanner.nextLine()');
  });

  it('uses inline A/B values for math when no data edges', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('math1', 'math', { label: 'ADD', operation: '+', inlineA: '5', inlineB: '3' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('math1', 'p1', 'data-out', 'data-in'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('(5 + 3)');
  });

  it('uses inline value for throw when no data edge', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('t1', 'throw', { label: 'Throw', inlineValue: 'Something went wrong' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 't1', 'exec-out', 'exec-in'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('throw new RuntimeException("Something went wrong")');
  });

  // --- char type ---
  it('generates a char field with single-quoted value', () => {
    const nodes: Node[] = [
      makeNode('v1', 'java', { label: 'initial', type: 'char', value: 'A', modifier: 'public' }),
    ];
    const code = generateJavaCode(nodes, []);
    expect(code).toContain("public static char initial = 'A';");
  });

  // --- final modifier ---
  it('generates a final field', () => {
    const nodes: Node[] = [
      makeNode('v1', 'java', { label: 'MAX', type: 'int', value: '100', modifier: 'public final' }),
    ];
    const code = generateJavaCode(nodes, []);
    expect(code).toContain('public final static int MAX = 100;');
  });

  // --- Increment node ---
  it('generates post-increment statement', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('inc', 'increment', { label: 'Increment', variableName: 'count', mode: 'post-increment' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'inc', 'exec-out', 'exec-in'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('count++;');
  });

  it('generates post-decrement statement', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('inc', 'increment', { label: 'Decrement', variableName: 'count', mode: 'post-decrement' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'inc', 'exec-out', 'exec-in'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('count--;');
  });

  it('generates pre-increment statement', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('inc', 'increment', { label: 'Increment', variableName: 'count', mode: 'pre-increment' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'inc', 'exec-out', 'exec-in'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('++count;');
  });

  it('generates pre-decrement statement', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('inc', 'increment', { label: 'Decrement', variableName: 'count', mode: 'pre-decrement' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'inc', 'exec-out', 'exec-in'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('--count;');
  });

  // --- CompoundAssign node ---
  it('generates += compound assignment from a variable', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'bonus', type: 'int', value: '5' }),
      makeNode('ca', 'compoundAssign', { label: 'Add Assign', variableName: 'total', operator: '+=' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'ca', 'exec-out', 'exec-in'),
      makeEdge('v1', 'ca', 'data-out', 'data-in'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('total += bonus;');
  });

  it('generates *= compound assignment from a variable', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'factor', type: 'int', value: '3' }),
      makeNode('ca', 'compoundAssign', { label: 'Mul Assign', variableName: 'result', operator: '*=' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'ca', 'exec-out', 'exec-in'),
      makeEdge('v1', 'ca', 'data-out', 'data-in'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('result *= factor;');
  });

  // --- Comment node ---
  it('generates a comment inside the method body', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('c1', 'comment', { label: 'Comment', text: 'This is a comment' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'c1', 'exec-out', 'exec-in'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('// This is a comment');
  });

  // --- StringFormat node ---
  it('generates String.format with arguments', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'name', type: 'String', value: 'Alice' }),
      makeNode('v2', 'java', { label: 'age', type: 'int', value: '30' }),
      makeNode('sf', 'stringFormat', { label: 'Format', formatString: 'Hello %s, you are %d', argCount: 2 }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'sf', 'data-out', 'data-in-arg-0'),
      makeEdge('v2', 'sf', 'data-out', 'data-in-arg-1'),
      makeEdge('sf', 'p1', 'data-out', 'data-in'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('String.format("Hello %s, you are %d", name, age)');
  });

  // --- Math functions ---
  it('generates Math.sqrt', () => {
    const nodes: Node[] = [
      makeNode('v1', 'java', { label: 'x', type: 'double', value: '16.0' }),
      makeNode('mf', 'mathFunc', { label: 'Sqrt', operation: 'sqrt', type: 'double' }),
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'mf', 'data-out', 'data-in'),
      makeEdge('mf', 'p1', 'data-out', 'data-in'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('Math.sqrt(x)');
  });

  it('generates Math.random with no input', () => {
    const nodes: Node[] = [
      makeNode('mf', 'mathFunc', { label: 'Random', operation: 'random', type: 'double' }),
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('mf', 'p1', 'data-out', 'data-in'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('Math.random()');
  });

  it('generates Math.ceil, Math.floor, Math.round', () => {
    const ops = ['ceil', 'floor', 'round'] as const;
    for (const op of ops) {
      const nodes: Node[] = [
        makeNode('v1', 'java', { label: 'val', type: 'double', value: '3.7' }),
        makeNode('mf', 'mathFunc', { label: op, operation: op, type: 'double' }),
        makeNode('main', 'main', { label: 'Main' }),
        makeNode('p1', 'print', { label: 'Print' }),
      ];
      const edges: Edge[] = [
        makeEdge('main', 'p1', 'exec-out', 'exec-in'),
        makeEdge('v1', 'mf', 'data-out', 'data-in'),
        makeEdge('mf', 'p1', 'data-out', 'data-in'),
      ];
      const code = generateJavaCode(nodes, edges);
      expect(code).toContain(`Math.${op}(val)`);
    }
  });

  it('generates Math.log and Math.log10', () => {
    for (const op of ['log', 'log10']) {
      const nodes: Node[] = [
        makeNode('v1', 'java', { label: 'num', type: 'double', value: '100.0' }),
        makeNode('mf', 'mathFunc', { label: op, operation: op, type: 'double' }),
        makeNode('main', 'main', { label: 'Main' }),
        makeNode('p1', 'print', { label: 'Print' }),
      ];
      const edges: Edge[] = [
        makeEdge('main', 'p1', 'exec-out', 'exec-in'),
        makeEdge('v1', 'mf', 'data-out', 'data-in'),
        makeEdge('mf', 'p1', 'data-out', 'data-in'),
      ];
      const code = generateJavaCode(nodes, edges);
      expect(code).toContain(`Math.${op}(num)`);
    }
  });

  // --- ArrayList operations ---
  it('generates ArrayList create with import', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('al', 'arrayListOp', { label: 'Create List', operation: 'create', variableName: 'numbers', elementType: 'int' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'al', 'exec-out', 'exec-in'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('import java.util.ArrayList;');
    expect(code).toContain('ArrayList<Integer> numbers = new ArrayList<>();');
  });

  it('generates ArrayList add with connected value', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'item', type: 'int', value: '42' }),
      makeNode('al_create', 'arrayListOp', { label: 'Create', operation: 'create', variableName: 'numbers', elementType: 'int' }),
      makeNode('al_add', 'arrayListOp', { label: 'Add', operation: 'add', variableName: 'numbers', elementType: 'int' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'al_create', 'exec-out', 'exec-in'),
      makeEdge('al_create', 'al_add', 'exec-out', 'exec-in'),
      makeEdge('v1', 'al_add', 'data-out', 'data-in-value'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('numbers.add(item);');
  });

  it('generates ArrayList get as data expression', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('idx', 'java', { label: 'idx', type: 'int', value: '0' }),
      makeNode('al_get', 'arrayListOp', { label: 'Get', operation: 'get', variableName: 'numbers' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('idx', 'al_get', 'data-out', 'data-in-index'),
      makeEdge('al_get', 'p1', 'data-out', 'data-in'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('numbers.get(idx)');
  });

  it('generates ArrayList size as data expression', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('al_size', 'arrayListOp', { label: 'Size', operation: 'size', variableName: 'numbers' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('al_size', 'p1', 'data-out', 'data-in'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('numbers.size()');
  });

  // --- HashMap operations ---
  it('generates HashMap create with import', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('hm', 'hashMapOp', { label: 'Create Map', operation: 'create', variableName: 'scores', keyType: 'String', valueType: 'int' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'hm', 'exec-out', 'exec-in'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('import java.util.HashMap;');
    expect(code).toContain('HashMap<String, Integer> scores = new HashMap<>();');
  });

  it('generates HashMap put with key and value', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('k1', 'java', { label: 'playerName', type: 'String', value: 'Alice' }),
      makeNode('v1', 'java', { label: 'playerScore', type: 'int', value: '100' }),
      makeNode('hm_create', 'hashMapOp', { label: 'Create', operation: 'create', variableName: 'scores', keyType: 'String', valueType: 'int' }),
      makeNode('hm_put', 'hashMapOp', { label: 'Put', operation: 'put', variableName: 'scores', keyType: 'String', valueType: 'int' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'hm_create', 'exec-out', 'exec-in'),
      makeEdge('hm_create', 'hm_put', 'exec-out', 'exec-in'),
      makeEdge('k1', 'hm_put', 'data-out', 'data-in-key'),
      makeEdge('v1', 'hm_put', 'data-out', 'data-in-value'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('scores.put(playerName, playerScore);');
  });

  it('generates HashMap get as data expression', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('k1', 'java', { label: 'key', type: 'String', value: 'Alice' }),
      makeNode('hm_get', 'hashMapOp', { label: 'Get', operation: 'get', variableName: 'scores' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('k1', 'hm_get', 'data-out', 'data-in-key'),
      makeEdge('hm_get', 'p1', 'data-out', 'data-in'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('scores.get(key)');
  });

  it('generates HashMap containsKey as data expression', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('k1', 'java', { label: 'lookupKey', type: 'String', value: 'Bob' }),
      makeNode('hm_ck', 'hashMapOp', { label: 'ContainsKey', operation: 'containsKey', variableName: 'scores' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('k1', 'hm_ck', 'data-out', 'data-in-key'),
      makeEdge('hm_ck', 'p1', 'data-out', 'data-in'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('scores.containsKey(lookupKey)');
  });

  it('generates HashMap size as data expression', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('hm_size', 'hashMapOp', { label: 'Size', operation: 'size', variableName: 'scores' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('hm_size', 'p1', 'data-out', 'data-in'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('scores.size()');
  });

  // --- Extended String Operations ---
  it('generates str.split(delim)', () => {
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
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('csv.split(delim)');
  });

  it('generates str.contains(target)', () => {
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
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('msg.contains(sub)');
  });

  it('generates str.startsWith(target)', () => {
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
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('word.startsWith(prefix)');
  });

  it('generates str.endsWith(target)', () => {
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
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('file.endsWith(suffix)');
  });

  // --- Trig Math Functions ---
  it('generates Math.sin, Math.cos, Math.tan', () => {
    for (const op of ['sin', 'cos', 'tan']) {
      const nodes: Node[] = [
        makeNode('v1', 'java', { label: 'angle', type: 'double', value: '1.0' }),
        makeNode('mf', 'mathFunc', { label: op, operation: op, type: 'double' }),
        makeNode('main', 'main', { label: 'Main' }),
        makeNode('p1', 'print', { label: 'Print' }),
      ];
      const edges: Edge[] = [
        makeEdge('main', 'p1', 'exec-out', 'exec-in'),
        makeEdge('v1', 'mf', 'data-out', 'data-in'),
        makeEdge('mf', 'p1', 'data-out', 'data-in'),
      ];
      const code = generateJavaCode(nodes, edges);
      expect(code).toContain(`Math.${op}(angle)`);
    }
  });

  it('generates Math.asin, Math.acos, Math.atan', () => {
    for (const op of ['asin', 'acos', 'atan']) {
      const nodes: Node[] = [
        makeNode('v1', 'java', { label: 'val', type: 'double', value: '0.5' }),
        makeNode('mf', 'mathFunc', { label: op, operation: op, type: 'double' }),
        makeNode('main', 'main', { label: 'Main' }),
        makeNode('p1', 'print', { label: 'Print' }),
      ];
      const edges: Edge[] = [
        makeEdge('main', 'p1', 'exec-out', 'exec-in'),
        makeEdge('v1', 'mf', 'data-out', 'data-in'),
        makeEdge('mf', 'p1', 'data-out', 'data-in'),
      ];
      const code = generateJavaCode(nodes, edges);
      expect(code).toContain(`Math.${op}(val)`);
    }
  });

  // --- Bitwise Operations ---
  it('generates bitwise AND, OR, XOR, left shift, right shift', () => {
    const ops = ['&', '|', '^', '<<', '>>'];
    for (const op of ops) {
      const nodes: Node[] = [
        makeNode('main', 'main', { label: 'Main' }),
        makeNode('v1', 'java', { label: 'a', type: 'int', value: '6' }),
        makeNode('v2', 'java', { label: 'b', type: 'int', value: '3' }),
        makeNode('m1', 'math', { label: 'Bitwise', operation: op, type: 'int' }),
        makeNode('p1', 'print', { label: 'Print' }),
      ];
      const edges: Edge[] = [
        makeEdge('main', 'p1', 'exec-out', 'exec-in'),
        makeEdge('v1', 'm1', 'data-out', 'data-in-a'),
        makeEdge('v2', 'm1', 'data-out', 'data-in-b'),
        makeEdge('m1', 'p1', 'data-out', 'data-in'),
      ];
      const code = generateJavaCode(nodes, edges);
      expect(code).toContain(`(a ${op} b)`);
    }
  });

  it('generates bitwise NOT (~)', () => {
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
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('(~x)');
  });

  // --- HashSet Operations ---
  it('generates HashSet create with import', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('hs', 'hashSetOp', { label: 'Create Set', operation: 'create', variableName: 'names', elementType: 'String' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'hs', 'exec-out', 'exec-in'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('import java.util.HashSet;');
    expect(code).toContain('HashSet<String> names = new HashSet<>();');
  });

  it('generates HashSet add with connected value', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'item', type: 'String', value: 'hello' }),
      makeNode('hs_create', 'hashSetOp', { label: 'Create', operation: 'create', variableName: 'words', elementType: 'String' }),
      makeNode('hs_add', 'hashSetOp', { label: 'Add', operation: 'add', variableName: 'words', elementType: 'String' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'hs_create', 'exec-out', 'exec-in'),
      makeEdge('hs_create', 'hs_add', 'exec-out', 'exec-in'),
      makeEdge('v1', 'hs_add', 'data-out', 'data-in-value'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('words.add(item);');
  });

  it('generates HashSet contains as data expression', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('v1', 'java', { label: 'item', type: 'int', value: '5' }),
      makeNode('hs_contains', 'hashSetOp', { label: 'Contains', operation: 'contains', variableName: 'nums' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('v1', 'hs_contains', 'data-out', 'data-in-value'),
      makeEdge('hs_contains', 'p1', 'data-out', 'data-in'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('nums.contains(item)');
  });

  it('generates HashSet size as data expression', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('hs_size', 'hashSetOp', { label: 'Size', operation: 'size', variableName: 'nums' }),
      makeNode('p1', 'print', { label: 'Print' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'p1', 'exec-out', 'exec-in'),
      makeEdge('hs_size', 'p1', 'data-out', 'data-in'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('nums.size()');
  });

  // --- Sort / Reverse (arrayListOp) ---
  it('generates Collections.sort with import', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('al_create', 'arrayListOp', { label: 'Create', operation: 'create', variableName: 'items', elementType: 'int' }),
      makeNode('al_sort', 'arrayListOp', { label: 'Sort', operation: 'sort', variableName: 'items' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'al_create', 'exec-out', 'exec-in'),
      makeEdge('al_create', 'al_sort', 'exec-out', 'exec-in'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('import java.util.Collections;');
    expect(code).toContain('Collections.sort(items);');
  });

  it('generates Collections.reverse with import', () => {
    const nodes: Node[] = [
      makeNode('main', 'main', { label: 'Main' }),
      makeNode('al_create', 'arrayListOp', { label: 'Create', operation: 'create', variableName: 'items', elementType: 'int' }),
      makeNode('al_rev', 'arrayListOp', { label: 'Reverse', operation: 'reverse', variableName: 'items' }),
    ];
    const edges: Edge[] = [
      makeEdge('main', 'al_create', 'exec-out', 'exec-in'),
      makeEdge('al_create', 'al_rev', 'exec-out', 'exec-in'),
    ];
    const code = generateJavaCode(nodes, edges);
    expect(code).toContain('import java.util.Collections;');
    expect(code).toContain('Collections.reverse(items);');
  });
});
