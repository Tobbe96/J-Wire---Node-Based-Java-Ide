'use client';
import React, { memo, useEffect, useState, useCallback } from 'react';
import { TYPE_COLORS } from '../utils/theme';

interface DocsModalProps {
  onClose: () => void;
}

type TabId = 'getting-started' | 'nodes' | 'shortcuts' | 'types';

const TABS: { id: TabId; label: string }[] = [
  { id: 'getting-started', label: 'Getting Started' },
  { id: 'nodes', label: 'Node Reference' },
  { id: 'shortcuts', label: 'Keyboard Shortcuts' },
  { id: 'types', label: 'Type System' },
];

// --- Styles ---

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 9999,
  background: 'rgba(0,0,0,0.75)', display: 'flex',
  alignItems: 'center', justifyContent: 'center',
};

const modal: React.CSSProperties = {
  background: '#1a1a1a', color: '#e0e0e0',
  borderRadius: 12, width: '90vw', maxWidth: 900,
  height: '85vh', display: 'flex', flexDirection: 'column',
  boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
  border: '1px solid #333', overflow: 'hidden',
};

const header: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '16px 24px', borderBottom: '1px solid #333', flexShrink: 0,
};

const tabBar: React.CSSProperties = {
  display: 'flex', gap: 4, padding: '8px 24px',
  borderBottom: '1px solid #333', flexShrink: 0, overflowX: 'auto',
};

const tabStyle = (active: boolean): React.CSSProperties => ({
  padding: '8px 16px', border: 'none', borderRadius: 6, cursor: 'pointer',
  fontSize: 13, fontWeight: active ? 700 : 400,
  background: active ? '#2563eb' : 'transparent',
  color: active ? '#fff' : '#999',
  transition: 'all .15s',
});

const content: React.CSSProperties = {
  flex: 1, overflowY: 'auto', padding: '24px',
  lineHeight: 1.7, fontSize: 14,
};

const h2: React.CSSProperties = { fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 16px' };
const h3: React.CSSProperties = { fontSize: 16, fontWeight: 600, color: '#ccc', margin: '20px 0 8px' };
const code: React.CSSProperties = {
  background: '#2a2a2a', padding: '2px 6px', borderRadius: 4,
  fontFamily: 'monospace', fontSize: 13, color: '#7dd3fc',
};
const kbd: React.CSSProperties = {
  background: '#333', padding: '3px 8px', borderRadius: 4,
  fontFamily: 'monospace', fontSize: 12, color: '#fff',
  border: '1px solid #555', marginRight: 4,
};
const card: React.CSSProperties = {
  background: '#222', borderRadius: 8, padding: '14px 18px',
  marginBottom: 12, border: '1px solid #333',
};
const badge = (color: string): React.CSSProperties => ({
  display: 'inline-block', padding: '2px 8px', borderRadius: 4,
  fontSize: 11, fontWeight: 600, marginRight: 6,
  background: color + '22', color, border: `1px solid ${color}55`,
});

// --- Node documentation data ---

interface NodeDoc {
  name: string;
  category: string;
  description: string;
  inputs: string;
  outputs: string;
  example: string;
}

const NODE_DOCS: NodeDoc[] = [
  // Variables
  { name: 'int', category: 'Variables', description: 'Declares an integer variable with a default value. Serves as a data source for math and logic nodes.', inputs: 'None (set value inline)', outputs: 'int value', example: 'Create an int node, name it "count", set value to 0, then wire it to a math node.' },
  { name: 'String', category: 'Variables', description: 'Declares a String variable. Use it as a data source for print or string operation nodes.', inputs: 'None (set value inline)', outputs: 'String value', example: 'Create a String node, name it "greeting", set value to "Hello", wire to Print.' },
  { name: 'boolean', category: 'Variables', description: 'Declares a boolean variable (true/false). Feed it into Branch or logical nodes.', inputs: 'None (set value inline)', outputs: 'boolean value', example: 'Create a boolean set to "true", wire to a Branch condition input.' },

  // Logic & Flow
  { name: 'Main', category: 'Logic', description: 'The program entry point. Execution starts here and flows through the exec output.', inputs: 'None', outputs: 'exec (execution flow)', example: 'Every program needs exactly one Main node. Connect its exec out to your first statement.' },
  { name: 'Method', category: 'Logic', description: 'Defines a reusable method with a configurable return type. Contains its own exec flow.', inputs: 'exec in, parameters via local vars', outputs: 'exec out, return value', example: 'Create a Method named "add", set return type to int, add logic inside, then call it with Call Method.' },
  { name: 'Call Method', category: 'Logic', description: 'Calls a defined method by name. Triggers the method\'s execution flow and receives its return value.', inputs: 'exec in, method name selection', outputs: 'exec out, return value', example: 'Add a Call Method node, select "add" from the dropdown, wire exec to continue after call.' },
  { name: 'Branch', category: 'Logic', description: 'If/else conditional. Routes execution flow based on a boolean condition input.', inputs: 'exec in, boolean condition', outputs: 'exec True, exec False', example: 'Wire a comparison (e.g., GREATER THAN) to condition, then connect True/False exec outputs.' },
  { name: 'WHILE Loop', category: 'Logic', description: 'Repeats its body while the boolean condition is true.', inputs: 'exec in, boolean condition', outputs: 'exec body (loop), exec done', example: 'Wire a boolean comparison to condition; connect body exec to the loop contents.' },
  { name: 'FOR Loop', category: 'Logic', description: 'Repeats its body a given number of times (0 to N-1).', inputs: 'exec in, int count', outputs: 'exec body (loop), exec done, int index', example: 'Wire an int node with value 10 to count; use the index output inside the loop body.' },
  { name: 'Set Variable', category: 'Logic', description: 'Assigns a new value to a declared variable by name.', inputs: 'exec in, value (int/String/boolean)', outputs: 'exec out', example: 'Wire exec from a loop body, select "count" as target, wire a math result to value.' },
  { name: 'Set Local Var', category: 'Logic', description: 'Assigns a value to a local variable within a method scope.', inputs: 'exec in, value', outputs: 'exec out', example: 'Inside a method, use Set Local Var to store intermediate computation results.' },
  { name: 'Print', category: 'Logic', description: 'Outputs a value to the console. Accepts int, String, or boolean.', inputs: 'exec in, value (int/String/boolean)', outputs: 'exec out', example: 'Wire any data output to Print\'s value input to see it in the terminal.' },
  { name: 'Return', category: 'Logic', description: 'Returns a value from a method. The accepted type matches the method\'s return type.', inputs: 'exec in, return value', outputs: 'None (terminates method)', example: 'At the end of a method, wire a Return node with the computed value.' },

  // Math & Comparison
  { name: 'ADD (+)', category: 'Math', description: 'Adds two integer values.', inputs: 'int A, int B', outputs: 'int result', example: 'Wire two int nodes into A and B; output goes to Print or another math node.' },
  { name: 'SUBTRACT (−)', category: 'Math', description: 'Subtracts B from A.', inputs: 'int A, int B', outputs: 'int result', example: 'Wire count and 1 into A and B to decrement.' },
  { name: 'MULTIPLY (×)', category: 'Math', description: 'Multiplies two integer values.', inputs: 'int A, int B', outputs: 'int result', example: 'Wire width and height to compute area.' },
  { name: 'DIVIDE (÷)', category: 'Math', description: 'Divides A by B (integer division).', inputs: 'int A, int B', outputs: 'int result', example: 'Wire total and count to compute average.' },
  { name: 'GREATER THAN (>)', category: 'Math', description: 'Compares two ints; outputs true if A > B.', inputs: 'int A, int B', outputs: 'boolean result', example: 'Wire to a Branch condition to create if(a > b) logic.' },
  { name: 'EQUALS (==)', category: 'Math', description: 'Checks equality. Accepts int, String, or boolean.', inputs: 'A, B (same type)', outputs: 'boolean result', example: 'Compare two strings for equality, feed result to Branch.' },
  { name: 'AND (&&)', category: 'Math', description: 'Logical AND of two boolean values.', inputs: 'boolean A, boolean B', outputs: 'boolean result', example: 'Combine two conditions before feeding into Branch.' },
  { name: 'OR (||)', category: 'Math', description: 'Logical OR of two boolean values.', inputs: 'boolean A, boolean B', outputs: 'boolean result', example: 'Check if either condition is true.' },
  { name: 'NOT (!)', category: 'Math', description: 'Logical negation of a boolean value.', inputs: 'boolean input', outputs: 'boolean result', example: 'Invert a condition before feeding into Branch.' },

  // Strings
  { name: 'String Concat', category: 'Strings', description: 'Concatenates two strings together.', inputs: 'String A, String B', outputs: 'String result', example: 'Wire "Hello" and "World" to produce "HelloWorld".' },
  { name: 'String Length', category: 'Strings', description: 'Returns the length of a string as an integer.', inputs: 'String input', outputs: 'int length', example: 'Wire a String variable to get its character count.' },
  { name: 'String Substring', category: 'Strings', description: 'Extracts a portion of a string by start and end index.', inputs: 'String input, int start, int end', outputs: 'String result', example: 'Extract first 5 characters: start=0, end=5.' },

  // Arrays
  { name: 'Array Literal', category: 'Arrays', description: 'Creates an array from comma-separated values. Configurable element type.', inputs: 'None (set values inline)', outputs: 'array value', example: 'Set type to int and values to "1,2,3" to create int[] {1,2,3}.' },
  { name: 'Array Access', category: 'Arrays', description: 'Reads an element from an array at a given index.', inputs: 'array, int index', outputs: 'element value', example: 'Wire an array and index 0 to get the first element.' },
  { name: 'Array Length', category: 'Arrays', description: 'Returns the number of elements in an array.', inputs: 'array input', outputs: 'int length', example: 'Wire an array to get its .length value for loop bounds.' },
];

const CATEGORY_COLORS: Record<string, string> = {
  Variables: '#2ecc71',
  Logic: '#e74c3c',
  Math: '#3498db',
  Strings: '#ff00d4',
  Arrays: '#f39c12',
};

// --- Tab content components ---

function GettingStarted() {
  return (
    <div>
      <h2 style={h2}>Getting Started with J-Flow</h2>
      <p style={{ color: '#bbb', marginBottom: 16 }}>
        J-Flow is a visual node-based IDE for building Java programs. Instead of writing code
        line by line, you connect visual nodes that represent variables, logic, and operations.
      </p>

      <h3 style={h3}>Adding Nodes</h3>
      <div style={card}>
        <p><strong>Right-click</strong> on the canvas to open the node browser, or press <span style={kbd}>Tab</span> anywhere.</p>
        <p>Browse categories (Variables, Logic, Math, Strings, Arrays) and click a node to place it.</p>
      </div>

      <h3 style={h3}>Connecting Nodes</h3>
      <div style={card}>
        <p><strong>Drag from a handle</strong> (the small circles on node edges) to another compatible handle.</p>
        <p>White handles carry <strong>execution flow</strong> (the order things run). Colored handles carry <strong>data</strong> (values).</p>
        <p>If you drag from a handle into empty space, the node browser opens so you can create a connected node in one step.</p>
      </div>

      <h3 style={h3}>Running Your Program</h3>
      <div style={card}>
        <p>Click the <strong>Run</strong> button in the bottom-right terminal panel. Output appears in the console below.</p>
        <p>The generated Java code is visible in the live preview panel on the right.</p>
      </div>

      <h3 style={h3}>Saving &amp; Loading</h3>
      <div style={card}>
        <p><span style={kbd}>Ctrl</span><span style={kbd}>S</span> saves your graph to browser local storage.</p>
        <p>Use the sidebar buttons to <strong>Export</strong> your graph as a JSON file or <strong>Import</strong> a previously saved one.</p>
        <p>The <strong>Save</strong> and <strong>Load</strong> buttons in the sidebar manage local storage persistence.</p>
      </div>

      <h3 style={h3}>Tips</h3>
      <div style={card}>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>Every program needs a <strong>Main</strong> node as the entry point.</li>
          <li>Use <strong>Auto Layout</strong> (top-right) to tidy your graph.</li>
          <li>Use <span style={kbd}>Ctrl</span><span style={kbd}>Z</span> to undo mistakes.</li>
          <li>Select nodes and press <span style={kbd}>Delete</span> to remove them.</li>
          <li>Click a node in the left sidebar to inspect and edit its properties.</li>
        </ul>
      </div>
    </div>
  );
}

function NodeReference() {
  const [filter, setFilter] = useState<string>('All');
  const categories = ['All', ...Object.keys(CATEGORY_COLORS)];
  const filtered = filter === 'All' ? NODE_DOCS : NODE_DOCS.filter(n => n.category === filter);

  return (
    <div>
      <h2 style={h2}>Node Types Reference</h2>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            style={{
              ...tabStyle(filter === c),
              background: filter === c ? (CATEGORY_COLORS[c] ?? '#2563eb') : '#2a2a2a',
              fontSize: 12,
            }}
          >
            {c}
          </button>
        ))}
      </div>
      {filtered.map((node, i) => (
        <div key={i} style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <strong style={{ color: '#fff', fontSize: 15 }}>{node.name}</strong>
            <span style={badge(CATEGORY_COLORS[node.category] ?? '#888')}>{node.category}</span>
          </div>
          <p style={{ margin: '0 0 8px', color: '#bbb' }}>{node.description}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
            <div><span style={{ color: '#888' }}>Inputs:</span> <span style={code}>{node.inputs}</span></div>
            <div><span style={{ color: '#888' }}>Outputs:</span> <span style={code}>{node.outputs}</span></div>
          </div>
          <p style={{ margin: '8px 0 0', color: '#888', fontSize: 12, fontStyle: 'italic' }}>💡 {node.example}</p>
        </div>
      ))}
    </div>
  );
}

function KeyboardShortcuts() {
  const shortcuts = [
    { keys: ['Ctrl', 'Z'], action: 'Undo', description: 'Revert the last change to the node graph.' },
    { keys: ['Ctrl', 'Shift', 'Z'], action: 'Redo', description: 'Re-apply the last undone change.' },
    { keys: ['Ctrl', 'Y'], action: 'Redo (Alt)', description: 'Alternative redo shortcut.' },
    { keys: ['Ctrl', 'S'], action: 'Save', description: 'Save the current graph to browser local storage.' },
    { keys: ['Tab'], action: 'Open Node Browser', description: 'Toggle the node browser at the current mouse position.' },
    { keys: ['Escape'], action: 'Dismiss', description: 'Close the node browser, deselect sidebar node, or close this help modal.' },
    { keys: ['Delete'], action: 'Delete Selected', description: 'Remove all currently selected nodes and edges.' },
    { keys: ['Backspace'], action: 'Delete Selected', description: 'Alternative delete shortcut.' },
  ];

  return (
    <div>
      <h2 style={h2}>Keyboard Shortcuts</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {shortcuts.map((s, i) => (
          <div key={i} style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <strong style={{ color: '#fff' }}>{s.action}</strong>
              <p style={{ margin: '4px 0 0', color: '#888', fontSize: 13 }}>{s.description}</p>
            </div>
            <div style={{ flexShrink: 0, marginLeft: 16 }}>
              {s.keys.map((k, j) => (
                <span key={j} style={kbd}>{k}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TypeSystem() {
  const EXEC_COLOR = '#ffffff';
  const types = [
    { name: 'exec', color: EXEC_COLOR, description: 'Execution flow — determines the order nodes run. White wires connect exec handles.' },
    { name: 'int', color: TYPE_COLORS.int, description: 'Integer numbers (whole numbers like 0, 1, 42, -7).' },
    { name: 'float', color: TYPE_COLORS.float, description: 'Single-precision floating point numbers.' },
    { name: 'double', color: TYPE_COLORS.double, description: 'Double-precision floating point numbers.' },
    { name: 'String', color: TYPE_COLORS.String, description: 'Text values enclosed in double quotes.' },
    { name: 'boolean', color: TYPE_COLORS.boolean, description: 'True or false values, used for conditions and logic.' },
    { name: 'void', color: TYPE_COLORS.void, description: 'No return value — used for methods that don\'t return data.' },
  ];

  return (
    <div>
      <h2 style={h2}>Type System &amp; Connection Colors</h2>
      <p style={{ color: '#bbb', marginBottom: 16 }}>
        J-Flow uses color-coded connections to distinguish data types. You can only connect
        handles of the same type — the IDE prevents invalid connections automatically.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {types.map((t) => (
          <div key={t.name} style={{ ...card, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 8, flexShrink: 0,
              background: t.color + '22', border: `2px solid ${t.color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: t.color }} />
            </div>
            <div>
              <strong style={{ color: t.color, fontSize: 15 }}>{t.name}</strong>
              <p style={{ margin: '4px 0 0', color: '#bbb', fontSize: 13 }}>{t.description}</p>
            </div>
          </div>
        ))}
      </div>

      <h3 style={h3}>Connection Rules</h3>
      <div style={card}>
        <ul style={{ margin: 0, paddingLeft: 20, color: '#bbb', fontSize: 13 }}>
          <li><strong>Exec → Exec:</strong> White handles connect to white handles only. They define execution order.</li>
          <li><strong>Data → Data:</strong> Colored handles connect to same-colored handles. They pass values.</li>
          <li><strong>Output → Input:</strong> You can only drag from an output handle to an input handle (left to right).</li>
          <li><strong>Type matching:</strong> The IDE validates connections and prevents type mismatches.</li>
        </ul>
      </div>
    </div>
  );
}

// --- Main Modal ---

function DocsModal({ onClose }: DocsModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('getting-started');

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>📖</span>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff' }}>J-Flow Documentation</h1>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#333', border: '1px solid #555', borderRadius: 6,
              color: '#fff', width: 32, height: 32, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 700,
            }}
            aria-label="Close documentation"
          >
            ✕
          </button>
        </div>

        {/* Tab bar */}
        <div style={tabBar}>
          {TABS.map(tab => (
            <button key={tab.id} style={tabStyle(activeTab === tab.id)} onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={content}>
          {activeTab === 'getting-started' && <GettingStarted />}
          {activeTab === 'nodes' && <NodeReference />}
          {activeTab === 'shortcuts' && <KeyboardShortcuts />}
          {activeTab === 'types' && <TypeSystem />}
        </div>
      </div>
    </div>
  );
}

export default memo(DocsModal);
