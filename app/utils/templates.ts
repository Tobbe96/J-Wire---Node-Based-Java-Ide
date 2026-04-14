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

// ─── 11. Swing Registration Form (Multi-File) ────────────────

const swingRegistration: Template = {
  id: 'swing-registration',
  name: 'Swing Registration Form',
  description: 'Multi-file Swing app with registration GUI (frontend) and user validation service (backend). Works with any JDK 8+.',
  className: 'RegistrationApp',
  nodes: [],
  edges: [],
  files: [
    // ─── File 1: RegistrationApp.java ──────────────────────────
    {
      className: 'RegistrationApp',
      classType: 'class',
      nodes: [
        // Swing entry point
        { id: 'sw-app', type: 'swingApp', position: { x: 0, y: 0 }, data: { label: 'Swing Application' } },

        // Frame: setTitle
        { id: 'frame-title', type: 'swingFrameOp', position: { x: 300, y: 0 },
          data: { label: 'JFrame: Set Title', operation: 'setTitle', variableName: 'this' } },
        { id: 'lit-title', type: 'literal', position: { x: 200, y: 120 },
          data: { label: 'Literal', literalType: 'String', value: 'User Registration' } },

        // Frame: setSize
        { id: 'frame-size', type: 'swingFrameOp', position: { x: 600, y: 0 },
          data: { label: 'JFrame: Set Size', operation: 'setSize', variableName: 'this' } },
        { id: 'lit-w', type: 'literal', position: { x: 500, y: 100 },
          data: { label: 'Literal', literalType: 'int', value: '400' } },
        { id: 'lit-h', type: 'literal', position: { x: 500, y: 170 },
          data: { label: 'Literal', literalType: 'int', value: '350' } },

        // Frame: setDefaultCloseOperation
        { id: 'frame-close', type: 'swingFrameOp', position: { x: 900, y: 0 },
          data: { label: 'JFrame: Default Close', operation: 'setDefaultCloseOperation', variableName: 'this' } },

        // Panel: create GridLayout
        { id: 'panel-create', type: 'swingPanelOp', position: { x: 1200, y: 0 },
          data: { label: 'JPanel: GridLayout', operation: 'create', layoutType: 'GridLayout', variableName: 'panel' } },

        // Panel: setBorder
        { id: 'panel-border', type: 'swingPanelOp', position: { x: 1500, y: 0 },
          data: { label: 'JPanel: Set Border', operation: 'setBorder', layoutType: 'GridLayout', variableName: 'panel' } },
        { id: 'lit-border', type: 'literal', position: { x: 1400, y: 150 },
          data: { label: 'Literal', literalType: 'int', value: '20, 20, 20, 20' } },

        // Controls: create labels and fields
        { id: 'ctrl-user-label', type: 'swingControlOp', position: { x: 1800, y: 0 },
          data: { label: 'JLabel: Create', operation: 'create', controlType: 'JLabel', variableName: 'usernameLabel' } },
        { id: 'ctrl-user-setText', type: 'swingControlOp', position: { x: 2100, y: 0 },
          data: { label: 'JLabel: Set Text', operation: 'setText', controlType: 'JLabel', variableName: 'usernameLabel' } },
        { id: 'lit-user-text', type: 'literal', position: { x: 2000, y: 150 },
          data: { label: 'Literal', literalType: 'String', value: 'Username:' } },

        { id: 'ctrl-user-field', type: 'swingControlOp', position: { x: 2400, y: 0 },
          data: { label: 'JTextField: Create', operation: 'create', controlType: 'JTextField', variableName: 'usernameField' } },

        { id: 'ctrl-email-label', type: 'swingControlOp', position: { x: 2700, y: 0 },
          data: { label: 'JLabel: Create', operation: 'create', controlType: 'JLabel', variableName: 'emailLabel' } },
        { id: 'ctrl-email-setText', type: 'swingControlOp', position: { x: 3000, y: 0 },
          data: { label: 'JLabel: Set Text', operation: 'setText', controlType: 'JLabel', variableName: 'emailLabel' } },
        { id: 'lit-email-text', type: 'literal', position: { x: 2900, y: 150 },
          data: { label: 'Literal', literalType: 'String', value: 'Email:' } },

        { id: 'ctrl-email-field', type: 'swingControlOp', position: { x: 3300, y: 0 },
          data: { label: 'JTextField: Create', operation: 'create', controlType: 'JTextField', variableName: 'emailField' } },

        { id: 'ctrl-pass-label', type: 'swingControlOp', position: { x: 3600, y: 0 },
          data: { label: 'JLabel: Create', operation: 'create', controlType: 'JLabel', variableName: 'passwordLabel' } },
        { id: 'ctrl-pass-setText', type: 'swingControlOp', position: { x: 3900, y: 0 },
          data: { label: 'JLabel: Set Text', operation: 'setText', controlType: 'JLabel', variableName: 'passwordLabel' } },
        { id: 'lit-pass-text', type: 'literal', position: { x: 3800, y: 150 },
          data: { label: 'Literal', literalType: 'String', value: 'Password:' } },

        { id: 'ctrl-pass-field', type: 'swingControlOp', position: { x: 4200, y: 0 },
          data: { label: 'JPasswordField: Create', operation: 'create', controlType: 'JPasswordField', variableName: 'passwordField' } },

        // Register button
        { id: 'ctrl-btn', type: 'swingControlOp', position: { x: 4500, y: 0 },
          data: { label: 'JButton: Create', operation: 'create', controlType: 'JButton', variableName: 'registerBtn' } },
        { id: 'ctrl-btn-text', type: 'swingControlOp', position: { x: 4800, y: 0 },
          data: { label: 'JButton: Set Text', operation: 'setText', controlType: 'JButton', variableName: 'registerBtn' } },
        { id: 'lit-btn-text', type: 'literal', position: { x: 4700, y: 150 },
          data: { label: 'Literal', literalType: 'String', value: 'Register' } },

        // Add components to panel
        { id: 'panel-add-ul', type: 'swingPanelOp', position: { x: 5100, y: 0 },
          data: { label: 'JPanel: Add', operation: 'add', layoutType: 'GridLayout', variableName: 'panel' } },
        { id: 'panel-add-uf', type: 'swingPanelOp', position: { x: 5400, y: 0 },
          data: { label: 'JPanel: Add', operation: 'add', layoutType: 'GridLayout', variableName: 'panel' } },
        { id: 'panel-add-el', type: 'swingPanelOp', position: { x: 5700, y: 0 },
          data: { label: 'JPanel: Add', operation: 'add', layoutType: 'GridLayout', variableName: 'panel' } },
        { id: 'panel-add-ef', type: 'swingPanelOp', position: { x: 6000, y: 0 },
          data: { label: 'JPanel: Add', operation: 'add', layoutType: 'GridLayout', variableName: 'panel' } },
        { id: 'panel-add-pl', type: 'swingPanelOp', position: { x: 6300, y: 0 },
          data: { label: 'JPanel: Add', operation: 'add', layoutType: 'GridLayout', variableName: 'panel' } },
        { id: 'panel-add-pf', type: 'swingPanelOp', position: { x: 6600, y: 0 },
          data: { label: 'JPanel: Add', operation: 'add', layoutType: 'GridLayout', variableName: 'panel' } },
        { id: 'panel-add-btn', type: 'swingPanelOp', position: { x: 6900, y: 0 },
          data: { label: 'JPanel: Add', operation: 'add', layoutType: 'GridLayout', variableName: 'panel' } },

        // Event: button action listener
        { id: 'btn-event', type: 'swingEventOp', position: { x: 7200, y: 0 },
          data: { label: 'Action Listener', operation: 'addActionListener', variableName: 'registerBtn' } },

        // Dialog: show success
        { id: 'dialog-success', type: 'swingDialogOp', position: { x: 7500, y: 200 },
          data: { label: 'Message Dialog', operation: 'showMessageDialog' } },
        { id: 'lit-success-title', type: 'literal', position: { x: 7350, y: 350 },
          data: { label: 'Literal', literalType: 'String', value: 'Success' } },
        { id: 'lit-success-msg', type: 'literal', position: { x: 7350, y: 420 },
          data: { label: 'Literal', literalType: 'String', value: 'Registration complete!' } },

        // Add panel to frame + center + show
        { id: 'frame-add', type: 'swingPanelOp', position: { x: 7800, y: 0 },
          data: { label: 'Add to Frame', operation: 'add', layoutType: 'BorderLayout', variableName: 'this' } },
        { id: 'lit-center', type: 'literal', position: { x: 7700, y: 150 },
          data: { label: 'Literal', literalType: 'String', value: 'Center' } },
        { id: 'frame-center', type: 'swingFrameOp', position: { x: 8100, y: 0 },
          data: { label: 'JFrame: Center', operation: 'setLocationRelativeTo', variableName: 'this' } },
        { id: 'frame-visible', type: 'swingFrameOp', position: { x: 8400, y: 0 },
          data: { label: 'JFrame: Set Visible', operation: 'setVisible', variableName: 'this' } },
        { id: 'lit-true', type: 'literal', position: { x: 8300, y: 150 },
          data: { label: 'Literal', literalType: 'boolean', value: 'true' } },
      ],
      edges: [
        // Exec chain
        { id: 'e1', source: 'sw-app', target: 'frame-title', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e2', source: 'frame-title', target: 'frame-size', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e3', source: 'frame-size', target: 'frame-close', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e4', source: 'frame-close', target: 'panel-create', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e5', source: 'panel-create', target: 'panel-border', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e6', source: 'panel-border', target: 'ctrl-user-label', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e7', source: 'ctrl-user-label', target: 'ctrl-user-setText', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e8', source: 'ctrl-user-setText', target: 'ctrl-user-field', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e9', source: 'ctrl-user-field', target: 'ctrl-email-label', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e10', source: 'ctrl-email-label', target: 'ctrl-email-setText', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e11', source: 'ctrl-email-setText', target: 'ctrl-email-field', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e12', source: 'ctrl-email-field', target: 'ctrl-pass-label', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e13', source: 'ctrl-pass-label', target: 'ctrl-pass-setText', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e14', source: 'ctrl-pass-setText', target: 'ctrl-pass-field', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e15', source: 'ctrl-pass-field', target: 'ctrl-btn', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e16', source: 'ctrl-btn', target: 'ctrl-btn-text', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e17', source: 'ctrl-btn-text', target: 'panel-add-ul', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e18', source: 'panel-add-ul', target: 'panel-add-uf', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e19', source: 'panel-add-uf', target: 'panel-add-el', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e20', source: 'panel-add-el', target: 'panel-add-ef', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e21', source: 'panel-add-ef', target: 'panel-add-pl', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e22', source: 'panel-add-pl', target: 'panel-add-pf', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e23', source: 'panel-add-pf', target: 'panel-add-btn', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e24', source: 'panel-add-btn', target: 'btn-event', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e25', source: 'btn-event', target: 'frame-add', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e26', source: 'frame-add', target: 'frame-center', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e27', source: 'frame-center', target: 'frame-visible', sourceHandle: 'exec-out', targetHandle: 'exec-in' },

        // Event body
        { id: 'e-evt', source: 'btn-event', target: 'dialog-success', sourceHandle: 'event-body', targetHandle: 'exec-in' },

        // Data edges
        { id: 'd1', source: 'lit-title', target: 'frame-title', sourceHandle: 'data-out', targetHandle: 'data-in-text' },
        { id: 'd2', source: 'lit-w', target: 'frame-size', sourceHandle: 'data-out', targetHandle: 'data-in-w' },
        { id: 'd3', source: 'lit-h', target: 'frame-size', sourceHandle: 'data-out', targetHandle: 'data-in-h' },
        { id: 'd4', source: 'lit-border', target: 'panel-border', sourceHandle: 'data-out', targetHandle: 'data-in-value' },
        { id: 'd5', source: 'lit-user-text', target: 'ctrl-user-setText', sourceHandle: 'data-out', targetHandle: 'data-in-text' },
        { id: 'd6', source: 'lit-email-text', target: 'ctrl-email-setText', sourceHandle: 'data-out', targetHandle: 'data-in-text' },
        { id: 'd7', source: 'lit-pass-text', target: 'ctrl-pass-setText', sourceHandle: 'data-out', targetHandle: 'data-in-text' },
        { id: 'd8', source: 'lit-btn-text', target: 'ctrl-btn-text', sourceHandle: 'data-out', targetHandle: 'data-in-text' },
        // Add component refs to panel
        { id: 'd-add-ul', source: 'ctrl-user-label', target: 'panel-add-ul', sourceHandle: 'data-out', targetHandle: 'data-in-child' },
        { id: 'd-add-uf', source: 'ctrl-user-field', target: 'panel-add-uf', sourceHandle: 'data-out', targetHandle: 'data-in-child' },
        { id: 'd-add-el', source: 'ctrl-email-label', target: 'panel-add-el', sourceHandle: 'data-out', targetHandle: 'data-in-child' },
        { id: 'd-add-ef', source: 'ctrl-email-field', target: 'panel-add-ef', sourceHandle: 'data-out', targetHandle: 'data-in-child' },
        { id: 'd-add-pl', source: 'ctrl-pass-label', target: 'panel-add-pl', sourceHandle: 'data-out', targetHandle: 'data-in-child' },
        { id: 'd-add-pf', source: 'ctrl-pass-field', target: 'panel-add-pf', sourceHandle: 'data-out', targetHandle: 'data-in-child' },
        { id: 'd-add-btn', source: 'ctrl-btn', target: 'panel-add-btn', sourceHandle: 'data-out', targetHandle: 'data-in-child' },
        // Panel ref → add to frame
        { id: 'd-panel-frame', source: 'panel-create', target: 'frame-add', sourceHandle: 'data-out', targetHandle: 'data-in-child' },
        { id: 'd-center-frame', source: 'lit-center', target: 'frame-add', sourceHandle: 'data-out', targetHandle: 'data-in-constraint' },
        // Dialog data
        { id: 'd-success-title', source: 'lit-success-title', target: 'dialog-success', sourceHandle: 'data-out', targetHandle: 'data-in-title' },
        { id: 'd-success-msg', source: 'lit-success-msg', target: 'dialog-success', sourceHandle: 'data-out', targetHandle: 'data-in-msg' },
        // Visible
        { id: 'd-true', source: 'lit-true', target: 'frame-visible', sourceHandle: 'data-out', targetHandle: 'data-in-value' },
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
          data: { label: 'validateUser', returnType: 'boolean', isStatic: false,
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
          data: { label: 'registerUser', returnType: 'void', isStatic: false,
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
        { id: 'e-branch1-true', source: 'branch-user', target: 'print-user-err', sourceHandle: 'exec-out-true', targetHandle: 'exec-in' },
        { id: 'e-printerr1-ret1', source: 'print-user-err', target: 'return-false-1', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        // branch false (username ok) → check password
        { id: 'e-branch1-false', source: 'branch-user', target: 'branch-pass', sourceHandle: 'exec-out-false', targetHandle: 'exec-in' },
        // branch true (password short) → print error → return false
        { id: 'e-branch2-true', source: 'branch-pass', target: 'print-pass-err', sourceHandle: 'exec-out-true', targetHandle: 'exec-in' },
        { id: 'e-printerr2-ret2', source: 'print-pass-err', target: 'return-false-2', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        // branch false (password ok) → print success → return true
        { id: 'e-branch2-false', source: 'branch-pass', target: 'print-ok', sourceHandle: 'exec-out-false', targetHandle: 'exec-in' },
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

// ─── 12. Swing To-Do List Manager (Multi-File) ──────────────────
const swingTodoList: Template = {
  id: 'swing-todo-list',
  name: 'Swing To-Do List Manager',
  description: 'Multi-file Swing app: To-Do GUI with BorderLayout, multiple event listeners, and a backend service with for-loop, branching, and ArrayList operations. JDK 8+.',
  className: 'TodoApp',
  nodes: [],
  edges: [],
  files: [
    // ─── File 1: TodoApp.java ──────────────────────────────────
    {
      className: 'TodoApp',
      classType: 'class',
      nodes: [
        // Swing entry point
        { id: 'sw-app', type: 'swingApp', position: { x: 0, y: 0 }, data: { label: 'Swing Application' } },

        // Frame: setTitle
        { id: 'frame-title', type: 'swingFrameOp', position: { x: 300, y: 0 },
          data: { label: 'JFrame: Set Title', operation: 'setTitle', variableName: 'this' } },
        { id: 'lit-title', type: 'literal', position: { x: 200, y: 130 },
          data: { label: 'Literal', literalType: 'String', value: 'To-Do List Manager' } },

        // Frame: setSize
        { id: 'frame-size', type: 'swingFrameOp', position: { x: 600, y: 0 },
          data: { label: 'JFrame: Set Size', operation: 'setSize', variableName: 'this' } },
        { id: 'lit-w', type: 'literal', position: { x: 500, y: 100 },
          data: { label: 'Literal', literalType: 'int', value: '600' } },
        { id: 'lit-h', type: 'literal', position: { x: 500, y: 170 },
          data: { label: 'Literal', literalType: 'int', value: '450' } },

        // Frame: setDefaultCloseOperation
        { id: 'frame-close', type: 'swingFrameOp', position: { x: 900, y: 0 },
          data: { label: 'JFrame: Default Close', operation: 'setDefaultCloseOperation', variableName: 'this' } },

        // Main panel: BorderLayout
        { id: 'panel-main', type: 'swingPanelOp', position: { x: 1200, y: 0 },
          data: { label: 'JPanel: BorderLayout', operation: 'create', layoutType: 'BorderLayout', variableName: 'mainPanel' } },

        // Top panel: FlowLayout (input + buttons)
        { id: 'panel-top', type: 'swingPanelOp', position: { x: 1500, y: 0 },
          data: { label: 'JPanel: FlowLayout', operation: 'create', layoutType: 'FlowLayout', variableName: 'topPanel' } },

        // Input field
        { id: 'ctrl-input', type: 'swingControlOp', position: { x: 1800, y: 0 },
          data: { label: 'JTextField: Create', operation: 'create', controlType: 'JTextField', variableName: 'inputField' } },

        // Style: set preferred size on input
        { id: 'style-input-size', type: 'swingStyleOp', position: { x: 2100, y: 0 },
          data: { label: 'Style: Preferred Size', operation: 'setPreferredSize', variableName: 'inputField' } },
        { id: 'lit-input-w', type: 'literal', position: { x: 2000, y: 100 },
          data: { label: 'Literal', literalType: 'int', value: '350' } },
        { id: 'lit-input-h', type: 'literal', position: { x: 2000, y: 170 },
          data: { label: 'Literal', literalType: 'int', value: '30' } },

        // Add Task button
        { id: 'ctrl-add-btn', type: 'swingControlOp', position: { x: 2400, y: 0 },
          data: { label: 'JButton: Create', operation: 'create', controlType: 'JButton', variableName: 'addBtn' } },
        { id: 'ctrl-add-text', type: 'swingControlOp', position: { x: 2700, y: 0 },
          data: { label: 'JButton: Set Text', operation: 'setText', controlType: 'JButton', variableName: 'addBtn' } },
        { id: 'lit-add-text', type: 'literal', position: { x: 2600, y: 150 },
          data: { label: 'Literal', literalType: 'String', value: 'Add Task' } },

        // Remove button
        { id: 'ctrl-remove-btn', type: 'swingControlOp', position: { x: 3000, y: 0 },
          data: { label: 'JButton: Create', operation: 'create', controlType: 'JButton', variableName: 'removeBtn' } },
        { id: 'ctrl-remove-text', type: 'swingControlOp', position: { x: 3300, y: 0 },
          data: { label: 'JButton: Set Text', operation: 'setText', controlType: 'JButton', variableName: 'removeBtn' } },
        { id: 'lit-remove-text', type: 'literal', position: { x: 3200, y: 150 },
          data: { label: 'Literal', literalType: 'String', value: 'Remove' } },

        // Text area for task display
        { id: 'ctrl-display', type: 'swingControlOp', position: { x: 3600, y: 0 },
          data: { label: 'JTextArea: Create', operation: 'create', controlType: 'JTextArea', variableName: 'taskDisplay' } },

        // Style: font on display
        { id: 'style-display-font', type: 'swingStyleOp', position: { x: 3900, y: 0 },
          data: { label: 'Style: Set Font', operation: 'setFont', variableName: 'taskDisplay' } },
        { id: 'lit-font-size', type: 'literal', position: { x: 3800, y: 150 },
          data: { label: 'Literal', literalType: 'int', value: '14' } },

        // Style: tooltip on display
        { id: 'style-display-tip', type: 'swingStyleOp', position: { x: 4200, y: 0 },
          data: { label: 'Style: Tooltip', operation: 'setToolTipText', variableName: 'taskDisplay' } },
        { id: 'lit-tip', type: 'literal', position: { x: 4100, y: 150 },
          data: { label: 'Literal', literalType: 'String', value: 'Your tasks appear here' } },

        // Add components to top panel
        { id: 'top-add-input', type: 'swingPanelOp', position: { x: 4500, y: 0 },
          data: { label: 'TopPanel: Add', operation: 'add', variableName: 'topPanel' } },
        { id: 'top-add-addbtn', type: 'swingPanelOp', position: { x: 4800, y: 0 },
          data: { label: 'TopPanel: Add', operation: 'add', variableName: 'topPanel' } },
        { id: 'top-add-removebtn', type: 'swingPanelOp', position: { x: 5100, y: 0 },
          data: { label: 'TopPanel: Add', operation: 'add', variableName: 'topPanel' } },

        // Add panels to main panel
        { id: 'main-add-top', type: 'swingPanelOp', position: { x: 5400, y: 0 },
          data: { label: 'Main: Add North', operation: 'add', variableName: 'mainPanel' } },
        { id: 'lit-north', type: 'literal', position: { x: 5300, y: 150 },
          data: { label: 'Literal', literalType: 'String', value: 'North' } },
        { id: 'main-add-display', type: 'swingPanelOp', position: { x: 5700, y: 0 },
          data: { label: 'Main: Add Center', operation: 'add', variableName: 'mainPanel' } },
        { id: 'lit-center', type: 'literal', position: { x: 5600, y: 150 },
          data: { label: 'Literal', literalType: 'String', value: 'Center' } },

        // Event: Add button → message dialog
        { id: 'evt-add', type: 'swingEventOp', position: { x: 6000, y: 0 },
          data: { label: 'Add Listener', operation: 'addActionListener', variableName: 'addBtn' } },
        { id: 'dialog-add', type: 'swingDialogOp', position: { x: 6200, y: 200 },
          data: { label: 'Message Dialog', operation: 'showMessageDialog' } },
        { id: 'lit-add-dlg-title', type: 'literal', position: { x: 6050, y: 350 },
          data: { label: 'Literal', literalType: 'String', value: 'Added' } },
        { id: 'lit-add-dlg-msg', type: 'literal', position: { x: 6050, y: 420 },
          data: { label: 'Literal', literalType: 'String', value: 'Task has been added!' } },

        // Event: Remove button → confirm dialog
        { id: 'evt-remove', type: 'swingEventOp', position: { x: 6500, y: 0 },
          data: { label: 'Remove Listener', operation: 'addActionListener', variableName: 'removeBtn' } },
        { id: 'dialog-confirm', type: 'swingDialogOp', position: { x: 6700, y: 200 },
          data: { label: 'Confirm Dialog', operation: 'showConfirmDialog' } },
        { id: 'lit-confirm-title', type: 'literal', position: { x: 6550, y: 350 },
          data: { label: 'Literal', literalType: 'String', value: 'Confirm' } },
        { id: 'lit-confirm-msg', type: 'literal', position: { x: 6550, y: 420 },
          data: { label: 'Literal', literalType: 'String', value: 'Remove selected task?' } },

        // Add main panel to frame + center + show
        { id: 'frame-add', type: 'swingPanelOp', position: { x: 7000, y: 0 },
          data: { label: 'Add to Frame', operation: 'add', variableName: 'this' } },
        { id: 'frame-center', type: 'swingFrameOp', position: { x: 7300, y: 0 },
          data: { label: 'JFrame: Center', operation: 'setLocationRelativeTo', variableName: 'this' } },
        { id: 'frame-visible', type: 'swingFrameOp', position: { x: 7600, y: 0 },
          data: { label: 'JFrame: Set Visible', operation: 'setVisible', variableName: 'this' } },
        { id: 'lit-true', type: 'literal', position: { x: 7500, y: 150 },
          data: { label: 'Literal', literalType: 'boolean', value: 'true' } },
      ],
      edges: [
        // ═══ Exec chain ═══
        { id: 'e1', source: 'sw-app', target: 'frame-title', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e2', source: 'frame-title', target: 'frame-size', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e3', source: 'frame-size', target: 'frame-close', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e4', source: 'frame-close', target: 'panel-main', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e5', source: 'panel-main', target: 'panel-top', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e6', source: 'panel-top', target: 'ctrl-input', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e7', source: 'ctrl-input', target: 'style-input-size', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e8', source: 'style-input-size', target: 'ctrl-add-btn', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e9', source: 'ctrl-add-btn', target: 'ctrl-add-text', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e10', source: 'ctrl-add-text', target: 'ctrl-remove-btn', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e11', source: 'ctrl-remove-btn', target: 'ctrl-remove-text', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e12', source: 'ctrl-remove-text', target: 'ctrl-display', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e13', source: 'ctrl-display', target: 'style-display-font', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e14', source: 'style-display-font', target: 'style-display-tip', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e15', source: 'style-display-tip', target: 'top-add-input', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e16', source: 'top-add-input', target: 'top-add-addbtn', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e17', source: 'top-add-addbtn', target: 'top-add-removebtn', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e18', source: 'top-add-removebtn', target: 'main-add-top', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e19', source: 'main-add-top', target: 'main-add-display', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e20', source: 'main-add-display', target: 'evt-add', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e21', source: 'evt-add', target: 'evt-remove', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e22', source: 'evt-remove', target: 'frame-add', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e23', source: 'frame-add', target: 'frame-center', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e24', source: 'frame-center', target: 'frame-visible', sourceHandle: 'exec-out', targetHandle: 'exec-in' },

        // ═══ Event bodies ═══
        { id: 'e-evt-add', source: 'evt-add', target: 'dialog-add', sourceHandle: 'event-body', targetHandle: 'exec-in' },
        { id: 'e-evt-remove', source: 'evt-remove', target: 'dialog-confirm', sourceHandle: 'event-body', targetHandle: 'exec-in' },

        // ═══ Data edges ═══
        { id: 'd1', source: 'lit-title', target: 'frame-title', sourceHandle: 'data-out', targetHandle: 'data-in-text' },
        { id: 'd2', source: 'lit-w', target: 'frame-size', sourceHandle: 'data-out', targetHandle: 'data-in-w' },
        { id: 'd3', source: 'lit-h', target: 'frame-size', sourceHandle: 'data-out', targetHandle: 'data-in-h' },
        { id: 'd-input-w', source: 'lit-input-w', target: 'style-input-size', sourceHandle: 'data-out', targetHandle: 'data-in-w' },
        { id: 'd-input-h', source: 'lit-input-h', target: 'style-input-size', sourceHandle: 'data-out', targetHandle: 'data-in-h' },
        { id: 'd-add-text', source: 'lit-add-text', target: 'ctrl-add-text', sourceHandle: 'data-out', targetHandle: 'data-in-text' },
        { id: 'd-remove-text', source: 'lit-remove-text', target: 'ctrl-remove-text', sourceHandle: 'data-out', targetHandle: 'data-in-text' },
        { id: 'd-font-size', source: 'lit-font-size', target: 'style-display-font', sourceHandle: 'data-out', targetHandle: 'data-in-value' },
        { id: 'd-tip', source: 'lit-tip', target: 'style-display-tip', sourceHandle: 'data-out', targetHandle: 'data-in-value' },
        // Panel add child refs
        { id: 'd-add-input', source: 'ctrl-input', target: 'top-add-input', sourceHandle: 'data-out', targetHandle: 'data-in-child' },
        { id: 'd-add-addbtn', source: 'ctrl-add-btn', target: 'top-add-addbtn', sourceHandle: 'data-out', targetHandle: 'data-in-child' },
        { id: 'd-add-removebtn', source: 'ctrl-remove-btn', target: 'top-add-removebtn', sourceHandle: 'data-out', targetHandle: 'data-in-child' },
        { id: 'd-top-to-main', source: 'panel-top', target: 'main-add-top', sourceHandle: 'data-out', targetHandle: 'data-in-child' },
        { id: 'd-north', source: 'lit-north', target: 'main-add-top', sourceHandle: 'data-out', targetHandle: 'data-in-constraint' },
        { id: 'd-display-to-main', source: 'ctrl-display', target: 'main-add-display', sourceHandle: 'data-out', targetHandle: 'data-in-child' },
        { id: 'd-center', source: 'lit-center', target: 'main-add-display', sourceHandle: 'data-out', targetHandle: 'data-in-constraint' },
        // Dialog data
        { id: 'd-add-dlg-title', source: 'lit-add-dlg-title', target: 'dialog-add', sourceHandle: 'data-out', targetHandle: 'data-in-title' },
        { id: 'd-add-dlg-msg', source: 'lit-add-dlg-msg', target: 'dialog-add', sourceHandle: 'data-out', targetHandle: 'data-in-msg' },
        { id: 'd-confirm-title', source: 'lit-confirm-title', target: 'dialog-confirm', sourceHandle: 'data-out', targetHandle: 'data-in-title' },
        { id: 'd-confirm-msg', source: 'lit-confirm-msg', target: 'dialog-confirm', sourceHandle: 'data-out', targetHandle: 'data-in-msg' },
        // Frame add main panel
        { id: 'd-panel-frame', source: 'panel-main', target: 'frame-add', sourceHandle: 'data-out', targetHandle: 'data-in-child' },
        // Visible
        { id: 'd-true', source: 'lit-true', target: 'frame-visible', sourceHandle: 'data-out', targetHandle: 'data-in-value' },
      ],
    },

    // ─── File 2: TaskManager.java ──────────────────────────────
    {
      className: 'TaskManager',
      classType: 'class',
      nodes: [
        // Field: ArrayList<String> tasks
        { id: 'field-tasks', type: 'java', position: { x: 50, y: 0 },
          data: { label: 'tasks', type: 'ArrayList<String>', value: 'new ArrayList<>()', modifier: 'private', isStatic: false } },

        // ═══ Method: addTask(String task) ═══
        { id: 'method-add', type: 'method', position: { x: 50, y: 200 },
          data: { label: 'addTask', returnType: 'void', isStatic: false,
                  parameters: [{ name: 'task', type: 'String' }] } },

        { id: 'get-task', type: 'getter', position: { x: 50, y: 400 },
          data: { label: 'task', type: 'String' } },
        { id: 'str-empty', type: 'stringOp', position: { x: 250, y: 350 },
          data: { label: 'String isEmpty', operation: 'isEmpty', variableName: 'task' } },
        { id: 'branch-empty', type: 'branch', position: { x: 350, y: 200 },
          data: { label: 'If Empty?', accepts: ['boolean'] } },

        // True branch: error + return
        { id: 'print-err', type: 'print', position: { x: 650, y: 300 },
          data: { label: 'Print', accepts: ALL_TYPES } },
        { id: 'lit-err', type: 'literal', position: { x: 550, y: 440 },
          data: { label: 'Literal', literalType: 'String', value: 'Error: Task cannot be empty' } },
        { id: 'return-void', type: 'return', position: { x: 950, y: 300 },
          data: { label: 'Return' } },

        // False branch: add + print success
        { id: 'al-add', type: 'arrayListOp', position: { x: 650, y: 100 },
          data: { label: 'ArrayList Add', operation: 'add', variableName: 'tasks', elementType: 'String' } },
        { id: 'get-task-2', type: 'getter', position: { x: 550, y: 50 },
          data: { label: 'task', type: 'String' } },
        { id: 'print-added', type: 'print', position: { x: 950, y: 100 },
          data: { label: 'Print', accepts: ALL_TYPES } },
        { id: 'str-fmt-add', type: 'stringFormat', position: { x: 800, y: -50 },
          data: { label: 'String.format', formatString: 'Added: %s', argCount: 1 } },
        { id: 'get-task-3', type: 'getter', position: { x: 650, y: -100 },
          data: { label: 'task', type: 'String' } },

        // ═══ Method: listTasks() ═══
        { id: 'method-list', type: 'method', position: { x: 50, y: 600 },
          data: { label: 'listTasks', returnType: 'void', isStatic: false, parameters: [] } },

        { id: 'for-loop', type: 'for', position: { x: 350, y: 600 },
          data: { label: 'For Loop', comparison: '<' } },
        { id: 'al-size-list', type: 'arrayListOp', position: { x: 250, y: 750 },
          data: { label: 'ArrayList Size', operation: 'size', variableName: 'tasks', elementType: 'String' } },
        { id: 'print-item', type: 'print', position: { x: 650, y: 700 },
          data: { label: 'Print', accepts: ALL_TYPES } },
        { id: 'al-get', type: 'arrayListOp', position: { x: 500, y: 830 },
          data: { label: 'ArrayList Get', operation: 'get', variableName: 'tasks', elementType: 'String' } },
        { id: 'getter-i', type: 'getter', position: { x: 350, y: 900 },
          data: { label: 'i', type: 'int' } },

        // ═══ Method: getTaskCount() ═══
        { id: 'method-count', type: 'method', position: { x: 50, y: 1050 },
          data: { label: 'getTaskCount', returnType: 'int', isStatic: false, parameters: [] } },
        { id: 'return-count', type: 'return', position: { x: 350, y: 1050 },
          data: { label: 'Return', accepts: ['int'] } },
        { id: 'al-size-count', type: 'arrayListOp', position: { x: 250, y: 1200 },
          data: { label: 'ArrayList Size', operation: 'size', variableName: 'tasks', elementType: 'String' } },

        // ═══ Main ═══
        { id: 'main', type: 'main', position: { x: 50, y: 1350 },
          data: { label: 'Main' } },
        { id: 'print-demo', type: 'print', position: { x: 350, y: 1350 },
          data: { label: 'Print', accepts: ALL_TYPES } },
        { id: 'lit-demo', type: 'literal', position: { x: 250, y: 1500 },
          data: { label: 'Literal', literalType: 'String', value: 'TaskManager ready — use with TodoApp' } },
      ],
      edges: [
        // ═══ addTask exec chain ═══
        { id: 'e-add-branch', source: 'method-add', target: 'branch-empty', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e-branch-true', source: 'branch-empty', target: 'print-err', sourceHandle: 'exec-out-true', targetHandle: 'exec-in' },
        { id: 'e-printerr-return', source: 'print-err', target: 'return-void', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e-branch-false', source: 'branch-empty', target: 'al-add', sourceHandle: 'exec-out-false', targetHandle: 'exec-in' },
        { id: 'e-aladd-print', source: 'al-add', target: 'print-added', sourceHandle: 'exec-out', targetHandle: 'exec-in' },

        // ═══ addTask data ═══
        { id: 'e-d-gettask-strempty', source: 'get-task', target: 'str-empty', sourceHandle: 'data-out', targetHandle: 'data-in' },
        { id: 'e-d-strempty-branch', source: 'str-empty', target: 'branch-empty', sourceHandle: 'data-out', targetHandle: 'data-in' },
        { id: 'e-d-literr-printerr', source: 'lit-err', target: 'print-err', sourceHandle: 'data-out', targetHandle: 'data-in' },
        { id: 'e-d-gettask2-aladd', source: 'get-task-2', target: 'al-add', sourceHandle: 'data-out', targetHandle: 'data-in-value' },
        { id: 'e-d-gettask3-strfmt', source: 'get-task-3', target: 'str-fmt-add', sourceHandle: 'data-out', targetHandle: 'data-in-arg-0' },
        { id: 'e-d-strfmt-printadd', source: 'str-fmt-add', target: 'print-added', sourceHandle: 'data-out', targetHandle: 'data-in' },

        // ═══ listTasks exec chain ═══
        { id: 'e-list-for', source: 'method-list', target: 'for-loop', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e-for-body', source: 'for-loop', target: 'print-item', sourceHandle: 'exec-body', targetHandle: 'exec-in' },

        // ═══ listTasks data ═══
        { id: 'e-d-alsize-for', source: 'al-size-list', target: 'for-loop', sourceHandle: 'data-out', targetHandle: 'data-end' },
        { id: 'e-d-getteri-alget', source: 'getter-i', target: 'al-get', sourceHandle: 'data-out', targetHandle: 'data-in-index' },
        { id: 'e-d-alget-printitem', source: 'al-get', target: 'print-item', sourceHandle: 'data-out', targetHandle: 'data-in' },

        // ═══ getTaskCount ═══
        { id: 'e-count-return', source: 'method-count', target: 'return-count', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e-d-alsize-return', source: 'al-size-count', target: 'return-count', sourceHandle: 'data-out', targetHandle: 'data-in' },

        // ═══ Main ═══
        { id: 'e-main-print', source: 'main', target: 'print-demo', sourceHandle: 'exec-out', targetHandle: 'exec-in' },
        { id: 'e-d-litdemo-print', source: 'lit-demo', target: 'print-demo', sourceHandle: 'data-out', targetHandle: 'data-in' },
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
  swingRegistration,
  swingTodoList,
];
