import type { Node, Edge } from '@xyflow/react';

export interface TemplateFile {
  className: string;
  classType?: 'class' | 'interface' | 'enum';
  extendsClass?: string;
  implementsInterfaces?: string[];
  nodes: Node[];
  edges: Edge[];
}

export interface Template {
  id: string;
  name: string;
  description: string;
  className: string;
  nodes: Node[];
  edges: Edge[];
  files?: TemplateFile[];
}

// Shared accepts arrays (mirrors theme.ts constants)
const ALL_NUMERIC = ['int', 'float', 'double', 'long', 'short', 'byte'];
const ALL_TYPES = [...ALL_NUMERIC, 'String', 'boolean'];

// ─── 1. Hello World ────────────────────────────────────────────

const helloWorld: Template = {
  id: 'hello-world',
  name: 'Hello World',
  description: 'Print "Hello, World!" to the console',
  className: 'HelloWorld',
  nodes: [
    {
      id: 'main',
      type: 'main',
      position: { x: 50, y: 150 },
      data: { label: 'Main' },
    },
    {
      id: 'lit-hello',
      type: 'literal',
      position: { x: 100, y: 300 },
      data: { label: 'Literal', literalType: 'String', value: 'Hello, World!' },
    },
    {
      id: 'print',
      type: 'print',
      position: { x: 350, y: 150 },
      data: { label: 'Print', accepts: ALL_TYPES },
    },
  ],
  edges: [
    {
      id: 'e-main-print-exec-out',
      source: 'main',
      target: 'print',
      sourceHandle: 'exec-out',
      targetHandle: 'exec-in',
    },
    {
      id: 'e-lit-hello-print-data-out',
      source: 'lit-hello',
      target: 'print',
      sourceHandle: 'data-out',
      targetHandle: 'data-in',
    },
  ],
};

// ─── 2. Simple Calculator ──────────────────────────────────────

const simpleCalculator: Template = {
  id: 'simple-calculator',
  name: 'Simple Calculator',
  description: 'Read two integers, add them, and print the result',
  className: 'SimpleCalculator',
  nodes: [
    {
      id: 'main',
      type: 'main',
      position: { x: 0, y: 150 },
      data: { label: 'Main' },
    },
    {
      id: 'prompt-a',
      type: 'literal',
      position: { x: 50, y: 350 },
      data: { label: 'Literal', literalType: 'String', value: 'Enter first number: ' },
    },
    {
      id: 'scan-a',
      type: 'scanner',
      position: { x: 250, y: 150 },
      data: { label: 'Read Int', readType: 'nextInt' },
    },
    {
      id: 'prompt-b',
      type: 'literal',
      position: { x: 300, y: 350 },
      data: { label: 'Literal', literalType: 'String', value: 'Enter second number: ' },
    },
    {
      id: 'scan-b',
      type: 'scanner',
      position: { x: 500, y: 150 },
      data: { label: 'Read Int', readType: 'nextInt' },
    },
    {
      id: 'math-add',
      type: 'math',
      position: { x: 550, y: 400 },
      data: {
        type: 'int',
        label: 'ADD',
        symbol: '+',
        operation: '+',
        accepts: ALL_NUMERIC,
      },
    },
    {
      id: 'print',
      type: 'print',
      position: { x: 750, y: 150 },
      data: { label: 'Print', accepts: ALL_TYPES },
    },
  ],
  edges: [
    {
      id: 'e-main-scan-a-exec-out',
      source: 'main',
      target: 'scan-a',
      sourceHandle: 'exec-out',
      targetHandle: 'exec-in',
    },
    {
      id: 'e-scan-a-scan-b-exec-out',
      source: 'scan-a',
      target: 'scan-b',
      sourceHandle: 'exec-out',
      targetHandle: 'exec-in',
    },
    {
      id: 'e-scan-b-print-exec-out',
      source: 'scan-b',
      target: 'print',
      sourceHandle: 'exec-out',
      targetHandle: 'exec-in',
    },
    {
      id: 'e-prompt-a-scan-a-data-out',
      source: 'prompt-a',
      target: 'scan-a',
      sourceHandle: 'data-out',
      targetHandle: 'data-in-prompt',
    },
    {
      id: 'e-prompt-b-scan-b-data-out',
      source: 'prompt-b',
      target: 'scan-b',
      sourceHandle: 'data-out',
      targetHandle: 'data-in-prompt',
    },
    {
      id: 'e-scan-a-math-add-data-out',
      source: 'scan-a',
      target: 'math-add',
      sourceHandle: 'data-out',
      targetHandle: 'data-in-a',
    },
    {
      id: 'e-scan-b-math-add-data-out',
      source: 'scan-b',
      target: 'math-add',
      sourceHandle: 'data-out',
      targetHandle: 'data-in-b',
    },
    {
      id: 'e-math-add-print-data-out',
      source: 'math-add',
      target: 'print',
      sourceHandle: 'data-out',
      targetHandle: 'data-in',
    },
  ],
};

// ─── 3. FizzBuzz (simplified: for 1‑20 printing index) ────────

const fizzBuzz: Template = {
  id: 'fizzbuzz',
  name: 'FizzBuzz',
  description: 'For loop from 1 to 20, printing each index',
  className: 'FizzBuzz',
  nodes: [
    {
      id: 'main',
      type: 'main',
      position: { x: 50, y: 100 },
      data: { label: 'Main' },
    },
    {
      id: 'lit-start',
      type: 'literal',
      position: { x: 100, y: 280 },
      data: { label: 'Literal', literalType: 'int', value: '1' },
    },
    {
      id: 'lit-end',
      type: 'literal',
      position: { x: 100, y: 400 },
      data: { label: 'Literal', literalType: 'int', value: '20' },
    },
    {
      id: 'for-loop',
      type: 'for',
      position: { x: 350, y: 100 },
      data: { label: 'FOR Loop', accepts: ALL_NUMERIC },
    },
    {
      id: 'print',
      type: 'print',
      position: { x: 650, y: 50 },
      data: { label: 'Print', accepts: ALL_TYPES },
    },
  ],
  edges: [
    {
      id: 'e-main-for-loop-exec-out',
      source: 'main',
      target: 'for-loop',
      sourceHandle: 'exec-out',
      targetHandle: 'exec-in',
    },
    {
      id: 'e-lit-start-for-loop-data-out',
      source: 'lit-start',
      target: 'for-loop',
      sourceHandle: 'data-out',
      targetHandle: 'data-start',
    },
    {
      id: 'e-lit-end-for-loop-data-out',
      source: 'lit-end',
      target: 'for-loop',
      sourceHandle: 'data-out',
      targetHandle: 'data-end',
    },
    {
      id: 'e-for-loop-print-exec-body',
      source: 'for-loop',
      target: 'print',
      sourceHandle: 'exec-body',
      targetHandle: 'exec-in',
    },
    {
      id: 'e-for-loop-print-data-index',
      source: 'for-loop',
      target: 'print',
      sourceHandle: 'data-index',
      targetHandle: 'data-in',
    },
  ],
};

// ─── 4. Counter (while loop 0‑9) ──────────────────────────────

const counter: Template = {
  id: 'counter',
  name: 'Counter',
  description: 'Count from 0 to 9 using a while loop',
  className: 'Counter',
  nodes: [
    // Execution chain
    {
      id: 'main',
      type: 'main',
      position: { x: 0, y: 100 },
      data: { label: 'Main' },
    },
    {
      id: 'var-count',
      type: 'java',
      position: { x: 250, y: 100 },
      data: { type: 'int', value: '0', label: 'count' },
    },
    {
      id: 'while',
      type: 'while',
      position: { x: 500, y: 100 },
      data: { label: 'WHILE Loop', accepts: ['boolean'] },
    },
    {
      id: 'print',
      type: 'print',
      position: { x: 750, y: 50 },
      data: { label: 'Print', accepts: ALL_TYPES },
    },
    {
      id: 'set-count',
      type: 'setVar',
      position: { x: 1000, y: 50 },
      data: { variableName: 'count', label: 'Set Variable', accepts: ALL_TYPES },
    },
    // Condition: count < 10
    {
      id: 'get-cond',
      type: 'getter',
      position: { x: 200, y: 320 },
      data: { label: 'count', type: 'int', variableId: 'var-count' },
    },
    {
      id: 'lit-10',
      type: 'literal',
      position: { x: 200, y: 450 },
      data: { label: 'Literal', literalType: 'int', value: '10' },
    },
    {
      id: 'cmp-lt',
      type: 'math',
      position: { x: 420, y: 370 },
      data: {
        type: 'boolean',
        label: 'LESS THAN',
        symbol: '<',
        operation: '<',
        accepts: ALL_NUMERIC,
      },
    },
    // Loop body data: print count value
    {
      id: 'get-print',
      type: 'getter',
      position: { x: 600, y: 250 },
      data: { label: 'count', type: 'int', variableId: 'var-count' },
    },
    // Increment: count + 1
    {
      id: 'get-inc',
      type: 'getter',
      position: { x: 750, y: 300 },
      data: { label: 'count', type: 'int', variableId: 'var-count' },
    },
    {
      id: 'lit-1',
      type: 'literal',
      position: { x: 750, y: 430 },
      data: { label: 'Literal', literalType: 'int', value: '1' },
    },
    {
      id: 'math-add',
      type: 'math',
      position: { x: 950, y: 350 },
      data: {
        type: 'int',
        label: 'ADD',
        symbol: '+',
        operation: '+',
        accepts: ALL_NUMERIC,
      },
    },
  ],
  edges: [
    // Exec chain
    {
      id: 'e-main-var-count-exec-out',
      source: 'main',
      target: 'var-count',
      sourceHandle: 'exec-out',
      targetHandle: 'exec-in',
    },
    {
      id: 'e-var-count-while-exec-out',
      source: 'var-count',
      target: 'while',
      sourceHandle: 'exec-out',
      targetHandle: 'exec-in',
    },
    {
      id: 'e-while-print-exec-body',
      source: 'while',
      target: 'print',
      sourceHandle: 'exec-body',
      targetHandle: 'exec-in',
    },
    {
      id: 'e-print-set-count-exec-out',
      source: 'print',
      target: 'set-count',
      sourceHandle: 'exec-out',
      targetHandle: 'exec-in',
    },
    // Condition wiring
    {
      id: 'e-get-cond-cmp-lt-data-out',
      source: 'get-cond',
      target: 'cmp-lt',
      sourceHandle: 'data-out',
      targetHandle: 'data-in-a',
    },
    {
      id: 'e-lit-10-cmp-lt-data-out',
      source: 'lit-10',
      target: 'cmp-lt',
      sourceHandle: 'data-out',
      targetHandle: 'data-in-b',
    },
    {
      id: 'e-cmp-lt-while-data-out',
      source: 'cmp-lt',
      target: 'while',
      sourceHandle: 'data-out',
      targetHandle: 'data-in',
    },
    // Print the current count
    {
      id: 'e-get-print-print-data-out',
      source: 'get-print',
      target: 'print',
      sourceHandle: 'data-out',
      targetHandle: 'data-in',
    },
    // Increment wiring
    {
      id: 'e-get-inc-math-add-data-out',
      source: 'get-inc',
      target: 'math-add',
      sourceHandle: 'data-out',
      targetHandle: 'data-in-a',
    },
    {
      id: 'e-lit-1-math-add-data-out',
      source: 'lit-1',
      target: 'math-add',
      sourceHandle: 'data-out',
      targetHandle: 'data-in-b',
    },
    {
      id: 'e-math-add-set-count-data-out',
      source: 'math-add',
      target: 'set-count',
      sourceHandle: 'data-out',
      targetHandle: 'data-in',
    },
  ],
};

// ─── 5. Greeting Method ────────────────────────────────────────

const greetingMethod: Template = {
  id: 'greeting-method',
  name: 'Greeting Method',
  description: 'Define and call a greet() method that prints a name',
  className: 'GreetingMethod',
  nodes: [
    // Main execution flow
    {
      id: 'main',
      type: 'main',
      position: { x: 0, y: 100 },
      data: { label: 'Main' },
    },
    {
      id: 'var-name',
      type: 'java',
      position: { x: 250, y: 100 },
      data: { type: 'String', value: 'World', label: 'name' },
    },
    {
      id: 'call-greet',
      type: 'callMethod',
      position: { x: 550, y: 100 },
      data: { methodName: 'greet' },
    },
    {
      id: 'get-name',
      type: 'getter',
      position: { x: 350, y: 320 },
      data: { label: 'name', type: 'String', variableId: 'var-name' },
    },
    // Method definition (separate execution chain)
    {
      id: 'method-greet',
      type: 'method',
      position: { x: 0, y: 500 },
      data: {
        label: 'greet',
        type: 'void',
        returnType: 'void',
        parameters: [
          { id: 'p-name', name: 'name', type: 'String', defaultValue: '' },
        ],
        localVariables: [],
      },
    },
    {
      id: 'print-greet',
      type: 'print',
      position: { x: 400, y: 550 },
      data: { label: 'Print', accepts: ALL_TYPES },
    },
  ],
  edges: [
    // Main exec chain
    {
      id: 'e-main-var-name-exec-out',
      source: 'main',
      target: 'var-name',
      sourceHandle: 'exec-out',
      targetHandle: 'exec-in',
    },
    {
      id: 'e-var-name-call-greet-exec-out',
      source: 'var-name',
      target: 'call-greet',
      sourceHandle: 'exec-out',
      targetHandle: 'exec-in',
    },
    // Pass name variable as argument
    {
      id: 'e-get-name-call-greet-data-out',
      source: 'get-name',
      target: 'call-greet',
      sourceHandle: 'data-out',
      targetHandle: 'arg-in-0',
    },
    // Method body
    {
      id: 'e-method-greet-print-exec-out',
      source: 'method-greet',
      target: 'print-greet',
      sourceHandle: 'exec-out',
      targetHandle: 'exec-in',
    },
    {
      id: 'e-method-greet-print-param-out-0',
      source: 'method-greet',
      target: 'print-greet',
      sourceHandle: 'param-out-0',
      targetHandle: 'data-in',
    },
  ],
};

// ─── 6. Max of Two ─────────────────────────────────────────────

const maxOfTwo: Template = {
  id: 'max-of-two',
  name: 'Max of Two',
  description: 'Compare two integers and print the larger one',
  className: 'MaxOfTwo',
  nodes: [
    // Exec chain: declare both vars then branch
    {
      id: 'main',
      type: 'main',
      position: { x: 0, y: 200 },
      data: { label: 'Main' },
    },
    {
      id: 'var-a',
      type: 'java',
      position: { x: 250, y: 150 },
      data: { type: 'int', value: '10', label: 'a' },
    },
    {
      id: 'var-b',
      type: 'java',
      position: { x: 500, y: 150 },
      data: { type: 'int', value: '5', label: 'b' },
    },
    {
      id: 'branch',
      type: 'branch',
      position: { x: 800, y: 200 },
      data: { label: 'Branch', accepts: ['boolean'] },
    },
    // Comparison: a > b
    {
      id: 'cmp-gt',
      type: 'math',
      position: { x: 550, y: 420 },
      data: {
        type: 'boolean',
        label: 'GREATER THAN',
        symbol: '>',
        operation: '>',
        accepts: ALL_NUMERIC,
      },
    },
    // True branch: print a
    {
      id: 'get-a',
      type: 'getter',
      position: { x: 900, y: 50 },
      data: { label: 'a', type: 'int', variableId: 'var-a' },
    },
    {
      id: 'print-a',
      type: 'print',
      position: { x: 1100, y: 100 },
      data: { label: 'Print', accepts: ALL_TYPES },
    },
    // False branch: print b
    {
      id: 'get-b',
      type: 'getter',
      position: { x: 900, y: 400 },
      data: { label: 'b', type: 'int', variableId: 'var-b' },
    },
    {
      id: 'print-b',
      type: 'print',
      position: { x: 1100, y: 350 },
      data: { label: 'Print', accepts: ALL_TYPES },
    },
  ],
  edges: [
    // Exec chain
    {
      id: 'e-main-var-a-exec-out',
      source: 'main',
      target: 'var-a',
      sourceHandle: 'exec-out',
      targetHandle: 'exec-in',
    },
    {
      id: 'e-var-a-var-b-exec-out',
      source: 'var-a',
      target: 'var-b',
      sourceHandle: 'exec-out',
      targetHandle: 'exec-in',
    },
    {
      id: 'e-var-b-branch-exec-out',
      source: 'var-b',
      target: 'branch',
      sourceHandle: 'exec-out',
      targetHandle: 'exec-in',
    },
    // Comparison data: use var data-out handles directly
    {
      id: 'e-var-a-cmp-gt-data-out',
      source: 'var-a',
      target: 'cmp-gt',
      sourceHandle: 'data-out',
      targetHandle: 'data-in-a',
    },
    {
      id: 'e-var-b-cmp-gt-data-out',
      source: 'var-b',
      target: 'cmp-gt',
      sourceHandle: 'data-out',
      targetHandle: 'data-in-b',
    },
    {
      id: 'e-cmp-gt-branch-data-out',
      source: 'cmp-gt',
      target: 'branch',
      sourceHandle: 'data-out',
      targetHandle: 'data-in',
    },
    // True branch → print a
    {
      id: 'e-branch-print-a-exec-out-true',
      source: 'branch',
      target: 'print-a',
      sourceHandle: 'exec-out-true',
      targetHandle: 'exec-in',
    },
    {
      id: 'e-get-a-print-a-data-out',
      source: 'get-a',
      target: 'print-a',
      sourceHandle: 'data-out',
      targetHandle: 'data-in',
    },
    // False branch → print b
    {
      id: 'e-branch-print-b-exec-out-false',
      source: 'branch',
      target: 'print-b',
      sourceHandle: 'exec-out-false',
      targetHandle: 'exec-in',
    },
    {
      id: 'e-get-b-print-b-data-out',
      source: 'get-b',
      target: 'print-b',
      sourceHandle: 'data-out',
      targetHandle: 'data-in',
    },
  ],
};

// ─── 7. Fibonacci Sequence ─────────────────────────────────────

const fibonacciSequence: Template = {
  id: 'fibonacci',
  name: 'Fibonacci Sequence',
  description: 'Print the first 10 Fibonacci numbers using a while loop and variable swapping',
  className: 'Fibonacci',
  nodes: [
    // ── exec chain ──────────────────────────────────────────────
    { id: 'main',      type: 'main',      position: { x: 0,    y: 200 }, data: { label: 'Main' } },
    { id: 'var-a',     type: 'java',      position: { x: 200,  y: 200 }, data: { type: 'int', value: '0', label: 'a' } },
    { id: 'var-b',     type: 'java',      position: { x: 400,  y: 200 }, data: { type: 'int', value: '1', label: 'b' } },
    { id: 'var-count', type: 'java',      position: { x: 600,  y: 200 }, data: { type: 'int', value: '0', label: 'count' } },
    { id: 'while-fib', type: 'while',     position: { x: 900,  y: 200 }, data: { label: 'WHILE', accepts: ['boolean'] } },
    // body: print → set-temp → set-a → set-b → inc-count
    { id: 'print-fib',   type: 'print',   position: { x: 1150, y: 100 }, data: { label: 'Print',        accepts: ALL_TYPES } },
    { id: 'set-temp',    type: 'setVar',  position: { x: 1400, y: 100 }, data: { variableName: 'temp',   label: 'Set Variable', accepts: ALL_TYPES } },
    { id: 'set-a',       type: 'setVar',  position: { x: 1650, y: 100 }, data: { variableName: 'a',      label: 'Set Variable', accepts: ALL_TYPES } },
    { id: 'set-b',       type: 'setVar',  position: { x: 1900, y: 100 }, data: { variableName: 'b',      label: 'Set Variable', accepts: ALL_TYPES } },
    { id: 'inc-count',   type: 'increment', position: { x: 2150, y: 100 }, data: { variableName: 'count', mode: 'post-increment', label: 'Increment' } },
    // ── condition data nodes ─────────────────────────────────────
    { id: 'get-count-cond', type: 'getter', position: { x: 600, y: 450 }, data: { label: 'count', type: 'int' } },
    { id: 'lit-10',         type: 'literal', position: { x: 600, y: 600 }, data: { label: 'Literal', literalType: 'int', value: '10' } },
    { id: 'math-lt',        type: 'math',    position: { x: 800, y: 520 }, data: { type: 'boolean', label: 'LESS THAN', symbol: '<', operation: '<', accepts: ALL_NUMERIC } },
    // ── body data nodes ──────────────────────────────────────────
    // print: get a
    { id: 'get-a-print', type: 'getter', position: { x: 1000, y: 450 }, data: { label: 'a', type: 'int' } },
    // temp = a + b
    { id: 'get-a-sum',   type: 'getter', position: { x: 1200, y: 400 }, data: { label: 'a', type: 'int' } },
    { id: 'get-b-sum',   type: 'getter', position: { x: 1200, y: 550 }, data: { label: 'b', type: 'int' } },
    { id: 'math-sum',    type: 'math',   position: { x: 1400, y: 470 }, data: { type: 'int', label: 'ADD', symbol: '+', operation: '+', accepts: ALL_NUMERIC } },
    // a = b
    { id: 'get-b-for-a', type: 'getter', position: { x: 1500, y: 600 }, data: { label: 'b', type: 'int' } },
    // b = temp
    { id: 'get-temp',    type: 'getter', position: { x: 1750, y: 600 }, data: { label: 'temp', type: 'int' } },
  ],
  edges: [
    // exec: declare vars → while
    { id: 'e-fib-main-va',    source: 'main',      target: 'var-a',     sourceHandle: 'exec-out',  targetHandle: 'exec-in' },
    { id: 'e-fib-va-vb',      source: 'var-a',     target: 'var-b',     sourceHandle: 'exec-out',  targetHandle: 'exec-in' },
    { id: 'e-fib-vb-vc',      source: 'var-b',     target: 'var-count', sourceHandle: 'exec-out',  targetHandle: 'exec-in' },
    { id: 'e-fib-vc-while',   source: 'var-count', target: 'while-fib', sourceHandle: 'exec-out',  targetHandle: 'exec-in' },
    // exec: while body chain
    { id: 'e-fib-while-print', source: 'while-fib',  target: 'print-fib', sourceHandle: 'exec-body', targetHandle: 'exec-in' },
    { id: 'e-fib-print-stemp', source: 'print-fib',  target: 'set-temp',  sourceHandle: 'exec-out',  targetHandle: 'exec-in' },
    { id: 'e-fib-stemp-sa',    source: 'set-temp',   target: 'set-a',     sourceHandle: 'exec-out',  targetHandle: 'exec-in' },
    { id: 'e-fib-sa-sb',       source: 'set-a',      target: 'set-b',     sourceHandle: 'exec-out',  targetHandle: 'exec-in' },
    { id: 'e-fib-sb-inc',      source: 'set-b',      target: 'inc-count', sourceHandle: 'exec-out',  targetHandle: 'exec-in' },
    // condition: count < 10
    { id: 'e-fib-gcond-mlt-a', source: 'get-count-cond', target: 'math-lt',  sourceHandle: 'data-out', targetHandle: 'data-in-a' },
    { id: 'e-fib-lit10-mlt-b', source: 'lit-10',         target: 'math-lt',  sourceHandle: 'data-out', targetHandle: 'data-in-b' },
    { id: 'e-fib-mlt-while',   source: 'math-lt',        target: 'while-fib',sourceHandle: 'data-out', targetHandle: 'data-in'   },
    // print: a
    { id: 'e-fib-ga-print',    source: 'get-a-print', target: 'print-fib', sourceHandle: 'data-out', targetHandle: 'data-in' },
    // temp = a + b
    { id: 'e-fib-ga-sum-a',    source: 'get-a-sum',  target: 'math-sum', sourceHandle: 'data-out', targetHandle: 'data-in-a' },
    { id: 'e-fib-gb-sum-b',    source: 'get-b-sum',  target: 'math-sum', sourceHandle: 'data-out', targetHandle: 'data-in-b' },
    { id: 'e-fib-msum-stemp',  source: 'math-sum',   target: 'set-temp', sourceHandle: 'data-out', targetHandle: 'data-in'   },
    // a = b
    { id: 'e-fib-gb-sa',       source: 'get-b-for-a', target: 'set-a', sourceHandle: 'data-out', targetHandle: 'data-in' },
    // b = temp
    { id: 'e-fib-gtemp-sb',    source: 'get-temp',    target: 'set-b', sourceHandle: 'data-out', targetHandle: 'data-in' },
  ],
};

// ─── 8. Factorial ──────────────────────────────────────────────

const factorial: Template = {
  id: 'factorial',
  name: 'Factorial',
  description: 'Compute n! (5! = 120) with a while loop, compound assignment, and increment',
  className: 'Factorial',
  nodes: [
    // ── exec chain ──────────────────────────────────────────────
    { id: 'main',        type: 'main',      position: { x: 0,   y: 200 }, data: { label: 'Main' } },
    { id: 'var-n',       type: 'java',      position: { x: 200, y: 200 }, data: { type: 'int', value: '5',  label: 'n'      } },
    { id: 'var-result',  type: 'java',      position: { x: 400, y: 200 }, data: { type: 'int', value: '1',  label: 'result' } },
    { id: 'var-i',       type: 'java',      position: { x: 600, y: 200 }, data: { type: 'int', value: '1',  label: 'i'      } },
    { id: 'while-fact',  type: 'while',     position: { x: 900, y: 200 }, data: { label: 'WHILE', accepts: ['boolean'] } },
    // while body: result *= i, then i++
    { id: 'compound-mult', type: 'compoundAssign', position: { x: 1100, y: 100 }, data: { variableName: 'result', operator: '*=', label: 'Compound *=', accepts: ALL_NUMERIC } },
    { id: 'inc-i',         type: 'increment',      position: { x: 1350, y: 100 }, data: { variableName: 'i', mode: 'post-increment', label: 'Increment' } },
    // after loop: print
    { id: 'print-result',  type: 'print',          position: { x: 1200, y: 200 }, data: { label: 'Print', accepts: ALL_TYPES } },
    // ── condition data nodes ─────────────────────────────────────
    { id: 'get-i-cond',  type: 'getter', position: { x: 600, y: 450 }, data: { label: 'i', type: 'int' } },
    { id: 'get-n-cond',  type: 'getter', position: { x: 600, y: 600 }, data: { label: 'n', type: 'int' } },
    { id: 'math-lte',    type: 'math',   position: { x: 800, y: 520 }, data: { type: 'boolean', label: 'LTE', symbol: '<=', operation: '<=', accepts: ALL_NUMERIC } },
    // ── body data nodes ──────────────────────────────────────────
    { id: 'get-i-body',  type: 'getter', position: { x: 950,  y: 450 }, data: { label: 'i',      type: 'int' } },
    // ── print data ───────────────────────────────────────────────
    { id: 'get-result',  type: 'getter', position: { x: 1000, y: 600 }, data: { label: 'result', type: 'int' } },
  ],
  edges: [
    // exec: declare vars → while
    { id: 'e-fact-main-vn',   source: 'main',       target: 'var-n',      sourceHandle: 'exec-out',  targetHandle: 'exec-in' },
    { id: 'e-fact-vn-vr',     source: 'var-n',      target: 'var-result', sourceHandle: 'exec-out',  targetHandle: 'exec-in' },
    { id: 'e-fact-vr-vi',     source: 'var-result', target: 'var-i',      sourceHandle: 'exec-out',  targetHandle: 'exec-in' },
    { id: 'e-fact-vi-while',  source: 'var-i',      target: 'while-fact', sourceHandle: 'exec-out',  targetHandle: 'exec-in' },
    // exec: while body chain
    { id: 'e-fact-while-cmult', source: 'while-fact',    target: 'compound-mult', sourceHandle: 'exec-body', targetHandle: 'exec-in' },
    { id: 'e-fact-cmult-inci',  source: 'compound-mult', target: 'inc-i',         sourceHandle: 'exec-out',  targetHandle: 'exec-in' },
    // exec: while → print after loop exits
    { id: 'e-fact-while-print', source: 'while-fact', target: 'print-result', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
    // condition: i <= n
    { id: 'e-fact-gi-lte-a',  source: 'get-i-cond', target: 'math-lte',  sourceHandle: 'data-out', targetHandle: 'data-in-a' },
    { id: 'e-fact-gn-lte-b',  source: 'get-n-cond', target: 'math-lte',  sourceHandle: 'data-out', targetHandle: 'data-in-b' },
    { id: 'e-fact-lte-while', source: 'math-lte',   target: 'while-fact',sourceHandle: 'data-out', targetHandle: 'data-in'   },
    // compound-mult: result *= i
    { id: 'e-fact-gi-cmult', source: 'get-i-body',   target: 'compound-mult', sourceHandle: 'data-out', targetHandle: 'data-in' },
    // print: result
    { id: 'e-fact-gr-print', source: 'get-result',   target: 'print-result',  sourceHandle: 'data-out', targetHandle: 'data-in' },
  ],
};

// ─── 9. Array Sum with forEach ─────────────────────────────────

const arraySumForEach: Template = {
  id: 'array-sum-foreach',
  name: 'Array Sum (forEach)',
  description: 'Sum an array of integers [10, 20, 30, 40, 50] using forEach and compound assignment',
  className: 'ArraySum',
  nodes: [
    // ── exec chain ──────────────────────────────────────────────
    { id: 'main',        type: 'main',  position: { x: 0,    y: 200 }, data: { label: 'Main' } },
    { id: 'var-sum',     type: 'java',  position: { x: 200,  y: 200 }, data: { type: 'int', value: '0', label: 'sum' } },
    { id: 'foreach',     type: 'forEach', position: { x: 550,  y: 200 }, data: { label: 'FOR EACH', accepts: ALL_TYPES, elementType: 'int' } },
    // forEach body: sum += element
    { id: 'compound-add', type: 'compoundAssign', position: { x: 750, y: 100 }, data: { variableName: 'sum', operator: '+=', label: 'Compound +=', accepts: ALL_NUMERIC } },
    // after forEach: print sum
    { id: 'print-sum', type: 'print', position: { x: 800, y: 200 }, data: { label: 'Print', accepts: ALL_TYPES } },
    // ── data nodes ───────────────────────────────────────────────
    // array literal
    { id: 'arr-lit', type: 'arrayOp', position: { x: 200, y: 450 },
      data: { label: 'Array Literal', operation: 'literal', arrayType: 'int', values: '10,20,30,40,50' } },
    // get-sum for print
    { id: 'get-sum', type: 'getter', position: { x: 600, y: 450 }, data: { label: 'sum', type: 'int' } },
  ],
  edges: [
    // exec chain
    { id: 'e-arr-main-vsum',    source: 'main',    target: 'var-sum', sourceHandle: 'exec-out',  targetHandle: 'exec-in' },
    { id: 'e-arr-vsum-foreach', source: 'var-sum', target: 'foreach', sourceHandle: 'exec-out',  targetHandle: 'exec-in' },
    // forEach body
    { id: 'e-arr-foreach-cadd', source: 'foreach', target: 'compound-add', sourceHandle: 'exec-body', targetHandle: 'exec-in' },
    // forEach → print after loop
    { id: 'e-arr-foreach-print', source: 'foreach', target: 'print-sum', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
    // array → forEach
    { id: 'e-arr-lit-foreach', source: 'arr-lit',  target: 'foreach',      sourceHandle: 'data-out',          targetHandle: 'data-in-array' },
    // forEach element → compound-add
    { id: 'e-arr-elem-cadd',   source: 'foreach',  target: 'compound-add', sourceHandle: 'data-out-element',  targetHandle: 'data-in' },
    // get-sum → print
    { id: 'e-arr-gsum-print',  source: 'get-sum',  target: 'print-sum',    sourceHandle: 'data-out',          targetHandle: 'data-in' },
  ],
};

// ─── 10. String Formatter ──────────────────────────────────────

const stringFormatter: Template = {
  id: 'string-formatter',
  name: 'String Formatter',
  description: 'Format a name and age into a greeting using String.format style formatting',
  className: 'StringFormatter',
  nodes: [
    // ── exec chain ──────────────────────────────────────────────
    { id: 'main',     type: 'main', position: { x: 0,   y: 200 }, data: { label: 'Main' } },
    { id: 'var-name', type: 'java', position: { x: 200, y: 200 }, data: { type: 'String', value: 'Alice', label: 'name' } },
    { id: 'var-age',  type: 'java', position: { x: 450, y: 200 }, data: { type: 'int',    value: '30',    label: 'age'  } },
    { id: 'print-msg', type: 'print', position: { x: 750, y: 200 }, data: { label: 'Print', accepts: ALL_TYPES } },
    // ── data nodes ───────────────────────────────────────────────
    { id: 'str-fmt', type: 'stringFormat', position: { x: 450, y: 450 },
      data: { label: 'String Format', formatString: '%s is %d years old.', argCount: 2 } },
    { id: 'get-name', type: 'getter', position: { x: 150, y: 550 }, data: { label: 'name', type: 'String' } },
    { id: 'get-age',  type: 'getter', position: { x: 150, y: 700 }, data: { label: 'age',  type: 'int'    } },
  ],
  edges: [
    // exec chain
    { id: 'e-fmt-main-vname',  source: 'main',     target: 'var-name',  sourceHandle: 'exec-out', targetHandle: 'exec-in' },
    { id: 'e-fmt-vname-vage',  source: 'var-name', target: 'var-age',   sourceHandle: 'exec-out', targetHandle: 'exec-in' },
    { id: 'e-fmt-vage-print',  source: 'var-age',  target: 'print-msg', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
    // format args
    { id: 'e-fmt-gname-arg0',  source: 'get-name', target: 'str-fmt',   sourceHandle: 'data-out', targetHandle: 'data-in-arg-0' },
    { id: 'e-fmt-gage-arg1',   source: 'get-age',  target: 'str-fmt',   sourceHandle: 'data-out', targetHandle: 'data-in-arg-1' },
    // formatted string → print
    { id: 'e-fmt-strfmt-print', source: 'str-fmt', target: 'print-msg', sourceHandle: 'data-out', targetHandle: 'data-in' },
  ],
};

// ─── 11. JavaFX Registration Form (Multi-File) ────────────────

const javafxRegistration: Template = {
  id: 'javafx-registration',
  name: 'JavaFX Registration Form',
  description: 'Multi-file JavaFX app with registration GUI (frontend) and user validation service (backend)',
  className: 'RegistrationApp',
  nodes: [],
  edges: [],
  files: [
    // ─── File 1: RegistrationApp.java ──────────────────────────
    {
      className: 'RegistrationApp',
      classType: 'class',
      extendsClass: 'Application',
      nodes: [
        // Entry point
        { id: 'fx-app', type: 'javafxApp', position: { x: 0, y: 0 }, data: { label: 'JavaFX Application' } },

        // Stage: create (uses primaryStage from start method)
        { id: 'stage-title', type: 'javafxStageOp', position: { x: 300, y: 0 },
          data: { label: 'Stage: setTitle', operation: 'setTitle', variableName: 'primaryStage' } },
        { id: 'lit-title', type: 'literal', position: { x: 200, y: 150 },
          data: { label: 'Literal', literalType: 'String', value: 'User Registration' } },

        // Layout: VBox
        { id: 'layout-create', type: 'javafxLayoutOp', position: { x: 600, y: 0 },
          data: { label: 'VBox: Create', operation: 'create', layoutType: 'VBox', variableName: 'root' } },
        { id: 'layout-spacing', type: 'javafxLayoutOp', position: { x: 900, y: 0 },
          data: { label: 'VBox: setSpacing', operation: 'setSpacing', layoutType: 'VBox', variableName: 'root' } },
        { id: 'lit-spacing', type: 'literal', position: { x: 850, y: 150 },
          data: { label: 'Literal', literalType: 'double', value: '15' } },
        { id: 'layout-padding', type: 'javafxLayoutOp', position: { x: 1200, y: 0 },
          data: { label: 'VBox: setPadding', operation: 'setPadding', layoutType: 'VBox', variableName: 'root' } },
        { id: 'lit-padding', type: 'literal', position: { x: 1150, y: 150 },
          data: { label: 'Literal', literalType: 'double', value: '20' } },

        // Title Label
        { id: 'lbl-title', type: 'javafxControlOp', position: { x: 1500, y: 0 },
          data: { label: 'Label: Create', operation: 'create', controlType: 'Label', variableName: 'titleLabel' } },
        { id: 'style-title', type: 'javafxStyleOp', position: { x: 1800, y: 0 },
          data: { label: 'Style: setFont', operation: 'setFont', variableName: 'titleLabel' } },
        { id: 'lit-font-size', type: 'literal', position: { x: 1750, y: 150 },
          data: { label: 'Literal', literalType: 'double', value: '20' } },
        { id: 'add-title-lbl', type: 'javafxLayoutOp', position: { x: 2100, y: 0 },
          data: { label: 'VBox: addChild', operation: 'addChild', layoutType: 'VBox', variableName: 'root' } },

        // Username TextField
        { id: 'tf-user', type: 'javafxControlOp', position: { x: 2400, y: 0 },
          data: { label: 'TextField: Create', operation: 'create', controlType: 'TextField', variableName: 'usernameField' } },
        { id: 'tf-user-prompt', type: 'javafxControlOp', position: { x: 2700, y: 0 },
          data: { label: 'Control: Set Prompt', operation: 'setPromptText', controlType: 'TextField', variableName: 'usernameField' } },
        { id: 'lit-user-prompt', type: 'literal', position: { x: 2600, y: 150 },
          data: { label: 'Literal', literalType: 'String', value: 'Enter username' } },
        { id: 'add-tf-user', type: 'javafxLayoutOp', position: { x: 3000, y: 0 },
          data: { label: 'VBox: addChild', operation: 'addChild', layoutType: 'VBox', variableName: 'root' } },

        // Email TextField
        { id: 'tf-email', type: 'javafxControlOp', position: { x: 3300, y: 0 },
          data: { label: 'TextField: Create', operation: 'create', controlType: 'TextField', variableName: 'emailField' } },
        { id: 'tf-email-prompt', type: 'javafxControlOp', position: { x: 3600, y: 0 },
          data: { label: 'Control: Set Prompt', operation: 'setPromptText', controlType: 'TextField', variableName: 'emailField' } },
        { id: 'lit-email-prompt', type: 'literal', position: { x: 3500, y: 150 },
          data: { label: 'Literal', literalType: 'String', value: 'Enter email' } },
        { id: 'add-tf-email', type: 'javafxLayoutOp', position: { x: 3900, y: 0 },
          data: { label: 'VBox: addChild', operation: 'addChild', layoutType: 'VBox', variableName: 'root' } },

        // Password Field
        { id: 'pf-pass', type: 'javafxControlOp', position: { x: 4200, y: 0 },
          data: { label: 'PasswordField: Create', operation: 'create', controlType: 'PasswordField', variableName: 'passwordField' } },
        { id: 'pf-pass-prompt', type: 'javafxControlOp', position: { x: 4500, y: 0 },
          data: { label: 'Control: Set Prompt', operation: 'setPromptText', controlType: 'PasswordField', variableName: 'passwordField' } },
        { id: 'lit-pass-prompt', type: 'literal', position: { x: 4400, y: 150 },
          data: { label: 'Literal', literalType: 'String', value: 'Enter password' } },
        { id: 'add-pf-pass', type: 'javafxLayoutOp', position: { x: 4800, y: 0 },
          data: { label: 'VBox: addChild', operation: 'addChild', layoutType: 'VBox', variableName: 'root' } },

        // Register Button
        { id: 'btn-register', type: 'javafxControlOp', position: { x: 5100, y: 0 },
          data: { label: 'Button: Create', operation: 'create', controlType: 'Button', variableName: 'registerBtn' } },
        { id: 'btn-set-text', type: 'javafxControlOp', position: { x: 5400, y: 0 },
          data: { label: 'Control: Set Text', operation: 'setText', controlType: 'Button', variableName: 'registerBtn' } },
        { id: 'lit-btn-text', type: 'literal', position: { x: 5300, y: 150 },
          data: { label: 'Literal', literalType: 'String', value: 'Register' } },
        { id: 'add-btn', type: 'javafxLayoutOp', position: { x: 5700, y: 0 },
          data: { label: 'VBox: addChild', operation: 'addChild', layoutType: 'VBox', variableName: 'root' } },

        // Button event handler
        { id: 'btn-event', type: 'javafxEventOp', position: { x: 6000, y: 0 },
          data: { label: 'Event: setOnAction', operation: 'setOnAction', variableName: 'registerBtn' } },

        // Inside the event handler body: show success alert
        { id: 'dlg-success', type: 'javafxDialogOp', position: { x: 6000, y: 250 },
          data: { label: 'Dialog: Alert Info', operation: 'alertInfo' } },
        { id: 'lit-dlg-title', type: 'literal', position: { x: 5800, y: 400 },
          data: { label: 'Literal', literalType: 'String', value: 'Success' } },
        { id: 'lit-dlg-msg', type: 'literal', position: { x: 6200, y: 400 },
          data: { label: 'Literal', literalType: 'String', value: 'Registration complete!' } },

        // Scene and Stage finalization
        { id: 'scene-create', type: 'javafxSceneOp', position: { x: 6300, y: 0 },
          data: { label: 'Scene: Create', operation: 'create', variableName: 'scene' } },
        { id: 'stage-scene', type: 'javafxStageOp', position: { x: 6600, y: 0 },
          data: { label: 'Stage: setScene', operation: 'setScene', variableName: 'primaryStage' } },
        { id: 'stage-show', type: 'javafxStageOp', position: { x: 6900, y: 0 },
          data: { label: 'Stage: show', operation: 'show', variableName: 'primaryStage' } },

        // Data literals for scene size
        { id: 'lit-scene-root', type: 'getter', position: { x: 6100, y: 150 },
          data: { label: 'root', type: 'VBox' } },
        { id: 'lit-scene-w', type: 'literal', position: { x: 6200, y: 250 },
          data: { label: 'Literal', literalType: 'double', value: '400' } },
        { id: 'lit-scene-h', type: 'literal', position: { x: 6400, y: 250 },
          data: { label: 'Literal', literalType: 'double', value: '450' } },

        // Data for setScene
        { id: 'get-scene', type: 'getter', position: { x: 6500, y: 150 },
          data: { label: 'scene', type: 'Scene' } },

        // Data for addChild nodes — variable references
        { id: 'get-title-lbl', type: 'getter', position: { x: 2000, y: 150 },
          data: { label: 'titleLabel', type: 'Label' } },
        { id: 'get-tf-user', type: 'getter', position: { x: 2900, y: 150 },
          data: { label: 'usernameField', type: 'TextField' } },
        { id: 'get-tf-email', type: 'getter', position: { x: 3800, y: 150 },
          data: { label: 'emailField', type: 'TextField' } },
        { id: 'get-pf-pass', type: 'getter', position: { x: 4700, y: 150 },
          data: { label: 'passwordField', type: 'PasswordField' } },
        { id: 'get-btn-reg', type: 'getter', position: { x: 5600, y: 150 },
          data: { label: 'registerBtn', type: 'Button' } },
      ],
      edges: [
        // ═══ EXEC CHAIN ═══
        { id: 'e-app-stitle', source: 'fx-app', target: 'stage-title', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e-stitle-lcreate', source: 'stage-title', target: 'layout-create', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e-lcreate-lspacing', source: 'layout-create', target: 'layout-spacing', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e-lspacing-lpadding', source: 'layout-spacing', target: 'layout-padding', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e-lpadding-lbltitle', source: 'layout-padding', target: 'lbl-title', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e-lbltitle-stitle', source: 'lbl-title', target: 'style-title', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e-stitle2-addtitle', source: 'style-title', target: 'add-title-lbl', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e-addtitle-tfuser', source: 'add-title-lbl', target: 'tf-user', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e-tfuser-tfprompt', source: 'tf-user', target: 'tf-user-prompt', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e-tfprompt-addtf', source: 'tf-user-prompt', target: 'add-tf-user', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e-addtf-tfemail', source: 'add-tf-user', target: 'tf-email', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e-tfemail-tfemailp', source: 'tf-email', target: 'tf-email-prompt', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e-tfemailp-addtfe', source: 'tf-email-prompt', target: 'add-tf-email', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e-addtfe-pfpass', source: 'add-tf-email', target: 'pf-pass', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e-pfpass-pfprompt', source: 'pf-pass', target: 'pf-pass-prompt', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e-pfprompt-addpf', source: 'pf-pass-prompt', target: 'add-pf-pass', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e-addpf-btnreg', source: 'add-pf-pass', target: 'btn-register', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e-btnreg-btntext', source: 'btn-register', target: 'btn-set-text', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e-btntext-addbtn', source: 'btn-set-text', target: 'add-btn', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e-addbtn-btnevt', source: 'add-btn', target: 'btn-event', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e-btnevt-scene', source: 'btn-event', target: 'scene-create', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e-scene-sscene', source: 'scene-create', target: 'stage-scene', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e-sscene-sshow', source: 'stage-scene', target: 'stage-show', sourceHandle: 'exec-out', targetHandle: 'exec-in' },

        // Event handler body (lambda body for button click)
        { id: 'e-btnevt-dlg', source: 'btn-event', target: 'dlg-success', sourceHandle: 'event-body', targetHandle: 'exec-in' },

        // ═══ DATA CONNECTIONS ═══
        // Stage title
        { id: 'e-d-littitle-stitle', source: 'lit-title', target: 'stage-title', sourceHandle: 'data-out', targetHandle: 'data-in-value' },
        // Layout spacing & padding
        { id: 'e-d-litspacing-lspacing', source: 'lit-spacing', target: 'layout-spacing', sourceHandle: 'data-out', targetHandle: 'data-in-value' },
        { id: 'e-d-litpadding-lpadding', source: 'lit-padding', target: 'layout-padding', sourceHandle: 'data-out', targetHandle: 'data-in-value' },
        // Font size for title label
        { id: 'e-d-litfont-stitle', source: 'lit-font-size', target: 'style-title', sourceHandle: 'data-out', targetHandle: 'data-in-value' },
        // addChild data: titleLabel → root
        { id: 'e-d-gettitlelbl-add', source: 'get-title-lbl', target: 'add-title-lbl', sourceHandle: 'data-out', targetHandle: 'data-in-child' },
        // TextField prompts
        { id: 'e-d-lituserprompt-tf', source: 'lit-user-prompt', target: 'tf-user-prompt', sourceHandle: 'data-out', targetHandle: 'data-in-text' },
        { id: 'e-d-gettfuser-add', source: 'get-tf-user', target: 'add-tf-user', sourceHandle: 'data-out', targetHandle: 'data-in-child' },
        { id: 'e-d-litemailprompt-tf', source: 'lit-email-prompt', target: 'tf-email-prompt', sourceHandle: 'data-out', targetHandle: 'data-in-text' },
        { id: 'e-d-gettfemail-add', source: 'get-tf-email', target: 'add-tf-email', sourceHandle: 'data-out', targetHandle: 'data-in-child' },
        // Password prompt
        { id: 'e-d-litpassprompt-pf', source: 'lit-pass-prompt', target: 'pf-pass-prompt', sourceHandle: 'data-out', targetHandle: 'data-in-text' },
        { id: 'e-d-getpfpass-add', source: 'get-pf-pass', target: 'add-pf-pass', sourceHandle: 'data-out', targetHandle: 'data-in-child' },
        // Button text
        { id: 'e-d-litbtntext-btn', source: 'lit-btn-text', target: 'btn-set-text', sourceHandle: 'data-out', targetHandle: 'data-in-text' },
        { id: 'e-d-getbtnreg-add', source: 'get-btn-reg', target: 'add-btn', sourceHandle: 'data-out', targetHandle: 'data-in-child' },
        // Dialog data
        { id: 'e-d-litdlgtitle-dlg', source: 'lit-dlg-title', target: 'dlg-success', sourceHandle: 'data-out', targetHandle: 'data-in-title' },
        { id: 'e-d-litdlgmsg-dlg', source: 'lit-dlg-msg', target: 'dlg-success', sourceHandle: 'data-out', targetHandle: 'data-in-msg' },
        // Scene data: root, width, height
        { id: 'e-d-getroot-scene', source: 'lit-scene-root', target: 'scene-create', sourceHandle: 'data-out', targetHandle: 'data-in-root' },
        { id: 'e-d-litscenew-scene', source: 'lit-scene-w', target: 'scene-create', sourceHandle: 'data-out', targetHandle: 'data-in-width' },
        { id: 'e-d-litsceneh-scene', source: 'lit-scene-h', target: 'scene-create', sourceHandle: 'data-out', targetHandle: 'data-in-height' },
        // Stage setScene data
        { id: 'e-d-getscene-sscene', source: 'get-scene', target: 'stage-scene', sourceHandle: 'data-out', targetHandle: 'data-in-value' },
      ],
    },

    // ─── File 2: UserService.java ──────────────────────────────
    {
      className: 'UserService',
      classType: 'class',
      nodes: [
        // Field: ArrayList<String> users
        { id: 'field-users', type: 'java', position: { x: 50, y: 0 },
          data: { label: 'users', type: 'ArrayList<String>', value: 'new ArrayList<>()', modifier: 'private', isStatic: false } },

        // Method: validateUser
        { id: 'method-validate', type: 'method', position: { x: 50, y: 200 },
          data: { label: 'validateUser', returnType: 'boolean',
                  parameters: [
                    { name: 'username', type: 'String' },
                    { name: 'email', type: 'String' },
                    { name: 'password', type: 'String' },
                  ] } },

        // Check if username is empty
        { id: 'get-username', type: 'getter', position: { x: 50, y: 400 },
          data: { label: 'username', type: 'String' } },
        { id: 'str-isempty-user', type: 'stringOp', position: { x: 250, y: 350 },
          data: { label: 'String Op', operation: 'isEmpty', variableName: 'username' } },
        { id: 'branch-user', type: 'branch', position: { x: 350, y: 200 },
          data: { label: 'If Empty?', accepts: ['boolean'] } },
        { id: 'print-user-err', type: 'print', position: { x: 650, y: 300 },
          data: { label: 'Print', accepts: ALL_TYPES } },
        { id: 'lit-user-err', type: 'literal', position: { x: 550, y: 440 },
          data: { label: 'Literal', literalType: 'String', value: 'Error: Username cannot be empty' } },
        { id: 'return-false-1', type: 'return', position: { x: 950, y: 300 },
          data: { label: 'Return', accepts: ['boolean'] } },
        { id: 'lit-false-1', type: 'literal', position: { x: 850, y: 440 },
          data: { label: 'Literal', literalType: 'boolean', value: 'false' } },

        // Check if password length < 6
        { id: 'get-password', type: 'getter', position: { x: 50, y: 550 },
          data: { label: 'password', type: 'String' } },
        { id: 'str-len-pass', type: 'stringOp', position: { x: 250, y: 550 },
          data: { label: 'String Op', operation: 'length', variableName: 'password' } },
        { id: 'lit-six', type: 'literal', position: { x: 450, y: 680 },
          data: { label: 'Literal', literalType: 'int', value: '6' } },
        { id: 'compare-len', type: 'math', position: { x: 550, y: 550 },
          data: { label: 'LESS THAN', type: 'boolean', symbol: '<', operation: '<', accepts: ALL_NUMERIC } },
        { id: 'branch-pass', type: 'branch', position: { x: 650, y: 200 },
          data: { label: 'If Short?', accepts: ['boolean'] } },
        { id: 'print-pass-err', type: 'print', position: { x: 950, y: 100 },
          data: { label: 'Print', accepts: ALL_TYPES } },
        { id: 'lit-pass-err', type: 'literal', position: { x: 850, y: 0 },
          data: { label: 'Literal', literalType: 'String', value: 'Error: Password must be at least 6 characters' } },
        { id: 'return-false-2', type: 'return', position: { x: 1250, y: 100 },
          data: { label: 'Return', accepts: ['boolean'] } },
        { id: 'lit-false-2', type: 'literal', position: { x: 1150, y: 0 },
          data: { label: 'Literal', literalType: 'boolean', value: 'false' } },

        // Success: print and return true
        { id: 'print-ok', type: 'print', position: { x: 1250, y: 200 },
          data: { label: 'Print', accepts: ALL_TYPES } },
        { id: 'lit-ok-msg', type: 'literal', position: { x: 1150, y: 340 },
          data: { label: 'Literal', literalType: 'String', value: 'User validated successfully!' } },
        { id: 'return-true', type: 'return', position: { x: 1550, y: 200 },
          data: { label: 'Return', accepts: ['boolean'] } },
        { id: 'lit-true', type: 'literal', position: { x: 1450, y: 340 },
          data: { label: 'Literal', literalType: 'boolean', value: 'true' } },

        // Method: registerUser
        { id: 'method-register', type: 'method', position: { x: 50, y: 750 },
          data: { label: 'registerUser', returnType: 'void',
                  parameters: [{ name: 'username', type: 'String' }] } },
        { id: 'al-add', type: 'arrayListOp', position: { x: 350, y: 750 },
          data: { label: 'ArrayList Add', operation: 'add', variableName: 'users', elementType: 'String' } },
        { id: 'get-username-2', type: 'getter', position: { x: 250, y: 900 },
          data: { label: 'username', type: 'String' } },
        { id: 'print-registered', type: 'print', position: { x: 650, y: 750 },
          data: { label: 'Print', accepts: ALL_TYPES } },
        { id: 'str-fmt-reg', type: 'stringFormat', position: { x: 500, y: 900 },
          data: { label: 'String.format', formatString: 'Registered: %s', argCount: 1 } },
        { id: 'get-username-3', type: 'getter', position: { x: 350, y: 1050 },
          data: { label: 'username', type: 'String' } },

        // Main method for testing
        { id: 'main', type: 'main', position: { x: 50, y: 1200 },
          data: { label: 'Main' } },
        { id: 'print-demo', type: 'print', position: { x: 350, y: 1200 },
          data: { label: 'Print', accepts: ALL_TYPES } },
        { id: 'lit-demo', type: 'literal', position: { x: 250, y: 1350 },
          data: { label: 'Literal', literalType: 'String', value: 'UserService ready — use with RegistrationApp' } },
      ],
      edges: [
        // ═══ validateUser method exec chain ═══
        { id: 'e-mval-branch1', source: 'method-validate', target: 'branch-user', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        // branch true (username empty) → print error → return false
        { id: 'e-branch1-true', source: 'branch-user', target: 'print-user-err', sourceHandle: 'true-out', targetHandle: 'exec-in' },
        { id: 'e-printerr1-ret1', source: 'print-user-err', target: 'return-false-1', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        // branch false (username ok) → check password
        { id: 'e-branch1-false', source: 'branch-user', target: 'branch-pass', sourceHandle: 'false-out', targetHandle: 'exec-in' },
        // branch true (password short) → print error → return false
        { id: 'e-branch2-true', source: 'branch-pass', target: 'print-pass-err', sourceHandle: 'true-out', targetHandle: 'exec-in' },
        { id: 'e-printerr2-ret2', source: 'print-pass-err', target: 'return-false-2', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        // branch false (password ok) → print success → return true
        { id: 'e-branch2-false', source: 'branch-pass', target: 'print-ok', sourceHandle: 'false-out', targetHandle: 'exec-in' },
        { id: 'e-printok-rettrue', source: 'print-ok', target: 'return-true', sourceHandle: 'exec-out', targetHandle: 'exec-in' },

        // ═══ validateUser data connections ═══
        { id: 'e-d-getuser-strempty', source: 'get-username', target: 'str-isempty-user', sourceHandle: 'data-out', targetHandle: 'data-in' },
        { id: 'e-d-strempty-branch1', source: 'str-isempty-user', target: 'branch-user', sourceHandle: 'data-out', targetHandle: 'data-in' },
        { id: 'e-d-litusererr-print1', source: 'lit-user-err', target: 'print-user-err', sourceHandle: 'data-out', targetHandle: 'data-in' },
        { id: 'e-d-litfalse1-ret1', source: 'lit-false-1', target: 'return-false-1', sourceHandle: 'data-out', targetHandle: 'data-in' },
        { id: 'e-d-getpass-strlen', source: 'get-password', target: 'str-len-pass', sourceHandle: 'data-out', targetHandle: 'data-in' },
        { id: 'e-d-strlen-cmp', source: 'str-len-pass', target: 'compare-len', sourceHandle: 'data-out', targetHandle: 'data-in-a' },
        { id: 'e-d-litsix-cmp', source: 'lit-six', target: 'compare-len', sourceHandle: 'data-out', targetHandle: 'data-in-b' },
        { id: 'e-d-cmplen-branch2', source: 'compare-len', target: 'branch-pass', sourceHandle: 'data-out', targetHandle: 'data-in' },
        { id: 'e-d-litpasserr-print2', source: 'lit-pass-err', target: 'print-pass-err', sourceHandle: 'data-out', targetHandle: 'data-in' },
        { id: 'e-d-litfalse2-ret2', source: 'lit-false-2', target: 'return-false-2', sourceHandle: 'data-out', targetHandle: 'data-in' },
        { id: 'e-d-litokmsg-printok', source: 'lit-ok-msg', target: 'print-ok', sourceHandle: 'data-out', targetHandle: 'data-in' },
        { id: 'e-d-littrue-rettrue', source: 'lit-true', target: 'return-true', sourceHandle: 'data-out', targetHandle: 'data-in' },

        // ═══ registerUser method ═══
        { id: 'e-mreg-aladd', source: 'method-register', target: 'al-add', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e-aladd-printreg', source: 'al-add', target: 'print-registered', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e-d-getuser2-aladd', source: 'get-username-2', target: 'al-add', sourceHandle: 'data-out', targetHandle: 'data-in-value' },
        { id: 'e-d-strfmtreg-printreg', source: 'str-fmt-reg', target: 'print-registered', sourceHandle: 'data-out', targetHandle: 'data-in' },
        { id: 'e-d-getuser3-strfmt', source: 'get-username-3', target: 'str-fmt-reg', sourceHandle: 'data-out', targetHandle: 'data-in-arg-0' },

        // ═══ Main method ═══
        { id: 'e-main-printdemo', source: 'main', target: 'print-demo', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e-d-litdemo-printdemo', source: 'lit-demo', target: 'print-demo', sourceHandle: 'data-out', targetHandle: 'data-in' },
      ],
    },
  ],
};

// ─── Export ────────────────────────────────────────────────────

export const TEMPLATES: Template[] = [
  helloWorld,
  simpleCalculator,
  fizzBuzz,
  counter,
  greetingMethod,
  maxOfTwo,
  fibonacciSequence,
  factorial,
  arraySumForEach,
  stringFormatter,
  javafxRegistration,
];
