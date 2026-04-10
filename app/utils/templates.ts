import type { Node, Edge } from '@xyflow/react';

export interface Template {
  id: string;
  name: string;
  description: string;
  className: string;
  nodes: Node[];
  edges: Edge[];
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

// ─── Export ────────────────────────────────────────────────────

export const TEMPLATES: Template[] = [
  helloWorld,
  simpleCalculator,
  fizzBuzz,
  counter,
  greetingMethod,
  maxOfTwo,
];
