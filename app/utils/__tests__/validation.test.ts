import { describe, it, expect } from 'vitest';
import type { Node, Edge, Connection } from '@xyflow/react';
import {
  resolveSourceType,
  resolveTargetAccepts,
  getAutoConvertType,
  isValidJavaConnection,
  getCompatibleNodeKinds,
} from '../validation';

// ── helpers ──────────────────────────────────────────────────────

function makeNode(id: string, type: string, data: Record<string, unknown> = {}): Node {
  return { id, type, position: { x: 0, y: 0 }, data };
}

function makeEdge(
  source: string,
  target: string,
  sourceHandle: string,
  targetHandle: string,
): Edge {
  return { id: `e-${source}-${target}-${sourceHandle}`, source, target, sourceHandle, targetHandle };
}

function makeConnection(
  source: string,
  target: string,
  sourceHandle: string,
  targetHandle: string,
): Connection {
  return { source, target, sourceHandle, targetHandle };
}

// ── resolveSourceType ────────────────────────────────────────────

describe('resolveSourceType', () => {
  describe('stringOp', () => {
    it('length → int', () => {
      const node = makeNode('s1', 'stringOp', { operation: 'length' });
      expect(resolveSourceType(node, 'data-out')).toBe('int');
    });

    it('indexOf → int', () => {
      const node = makeNode('s1', 'stringOp', { operation: 'indexOf' });
      expect(resolveSourceType(node, 'data-out')).toBe('int');
    });

    it('contains → boolean', () => {
      const node = makeNode('s1', 'stringOp', { operation: 'contains' });
      expect(resolveSourceType(node, 'data-out')).toBe('boolean');
    });

    it('startsWith → boolean', () => {
      const node = makeNode('s1', 'stringOp', { operation: 'startsWith' });
      expect(resolveSourceType(node, 'data-out')).toBe('boolean');
    });

    it('endsWith → boolean', () => {
      const node = makeNode('s1', 'stringOp', { operation: 'endsWith' });
      expect(resolveSourceType(node, 'data-out')).toBe('boolean');
    });

    it('split → String[]', () => {
      const node = makeNode('s1', 'stringOp', { operation: 'split' });
      expect(resolveSourceType(node, 'data-out')).toBe('String[]');
    });

    it('default ops → String', () => {
      const node = makeNode('s1', 'stringOp', { operation: 'concat' });
      expect(resolveSourceType(node, 'data-out')).toBe('String');
    });
  });

  describe('for loop', () => {
    it('data-index → int', () => {
      const node = makeNode('f1', 'for', {});
      expect(resolveSourceType(node, 'data-index')).toBe('int');
    });
  });

  describe('forEach', () => {
    it('data-out-element → elementType or default int', () => {
      const node = makeNode('fe1', 'forEach', { elementType: 'String' });
      expect(resolveSourceType(node, 'data-out-element')).toBe('String');
    });

    it('data-out-element defaults to int', () => {
      const node = makeNode('fe1', 'forEach', {});
      expect(resolveSourceType(node, 'data-out-element')).toBe('int');
    });

    it('data-out-index → int', () => {
      const node = makeNode('fe1', 'forEach', {});
      expect(resolveSourceType(node, 'data-out-index')).toBe('int');
    });
  });

  describe('mathFunc', () => {
    it('round → long', () => {
      const node = makeNode('m1', 'mathFunc', { operation: 'round' });
      expect(resolveSourceType(node, 'data-out')).toBe('long');
    });

    it('random → double', () => {
      const node = makeNode('m1', 'mathFunc', { operation: 'random' });
      expect(resolveSourceType(node, 'data-out')).toBe('double');
    });

    it('other mathFunc ops → double', () => {
      const node = makeNode('m1', 'mathFunc', { operation: 'sqrt' });
      expect(resolveSourceType(node, 'data-out')).toBe('double');
    });
  });

  describe('cast', () => {
    it('outputs the selected targetType', () => {
      const node = makeNode('c1', 'cast', { targetType: 'int' });
      expect(resolveSourceType(node, 'data-out')).toBe('int');
    });

    it('defaults to String', () => {
      const node = makeNode('c1', 'cast', {});
      expect(resolveSourceType(node, 'data-out')).toBe('String');
    });
  });

  describe('literal', () => {
    it('outputs the selected literalType', () => {
      const node = makeNode('l1', 'literal', { literalType: 'boolean' });
      expect(resolveSourceType(node, 'data-out')).toBe('boolean');
    });

    it('defaults to String', () => {
      const node = makeNode('l1', 'literal', {});
      expect(resolveSourceType(node, 'data-out')).toBe('String');
    });
  });

  describe('stringFormat', () => {
    it('always returns String', () => {
      const node = makeNode('sf1', 'stringFormat', {});
      expect(resolveSourceType(node, 'data-out')).toBe('String');
    });
  });

  describe('arrayOp', () => {
    it('length operation → int', () => {
      const node = makeNode('ao1', 'arrayOp', { operation: 'length' });
      expect(resolveSourceType(node, 'data-out')).toBe('int');
    });
  });

  describe('scanner', () => {
    it('nextLine → String', () => {
      const node = makeNode('sc1', 'scanner', { readType: 'nextLine' });
      expect(resolveSourceType(node, 'data-out')).toBe('String');
    });

    it('nextInt → int', () => {
      const node = makeNode('sc1', 'scanner', { readType: 'nextInt' });
      expect(resolveSourceType(node, 'data-out')).toBe('int');
    });

    it('nextDouble → double', () => {
      const node = makeNode('sc1', 'scanner', { readType: 'nextDouble' });
      expect(resolveSourceType(node, 'data-out')).toBe('double');
    });

    it('nextBoolean → boolean', () => {
      const node = makeNode('sc1', 'scanner', { readType: 'nextBoolean' });
      expect(resolveSourceType(node, 'data-out')).toBe('boolean');
    });

    it('defaults to String when no readType', () => {
      const node = makeNode('sc1', 'scanner', {});
      expect(resolveSourceType(node, 'data-out')).toBe('String');
    });
  });

  describe('method param-out handles', () => {
    it('resolves param-out-0 from parameters array', () => {
      const node = makeNode('m1', 'method', {
        parameters: [{ id: 'p0', name: 'x', type: 'int' }],
      });
      expect(resolveSourceType(node, 'param-out-0')).toBe('int');
    });

    it('returns undefined for out-of-range param index', () => {
      const node = makeNode('m1', 'method', { parameters: [] });
      expect(resolveSourceType(node, 'param-out-5')).toBeUndefined();
    });
  });

  describe('method local-out handles', () => {
    it('resolves local-out-0 from localVariables', () => {
      const node = makeNode('m1', 'method', {
        localVariables: [{ id: 'l0', name: 'tmp', type: 'String', value: '' }],
      });
      expect(resolveSourceType(node, 'local-out-0')).toBe('String');
    });
  });

  describe('arrayListOp', () => {
    it('create → ArrayList', () => {
      const node = makeNode('al1', 'arrayListOp', { operation: 'create' });
      expect(resolveSourceType(node, 'data-out')).toBe('ArrayList');
    });

    it('size → int', () => {
      const node = makeNode('al1', 'arrayListOp', { operation: 'size' });
      expect(resolveSourceType(node, 'data-out')).toBe('int');
    });

    it('contains → boolean', () => {
      const node = makeNode('al1', 'arrayListOp', { operation: 'contains' });
      expect(resolveSourceType(node, 'data-out')).toBe('boolean');
    });

    it('get → elementType or default int', () => {
      const node = makeNode('al1', 'arrayListOp', { operation: 'get', elementType: 'String' });
      expect(resolveSourceType(node, 'data-out')).toBe('String');
    });
  });

  describe('hashMapOp', () => {
    it('size → int', () => {
      const node = makeNode('hm1', 'hashMapOp', { operation: 'size' });
      expect(resolveSourceType(node, 'data-out')).toBe('int');
    });

    it('containsKey → boolean', () => {
      const node = makeNode('hm1', 'hashMapOp', { operation: 'containsKey' });
      expect(resolveSourceType(node, 'data-out')).toBe('boolean');
    });

    it('get → valueType or default String', () => {
      const node = makeNode('hm1', 'hashMapOp', { operation: 'get', valueType: 'int' });
      expect(resolveSourceType(node, 'data-out')).toBe('int');
    });

    it('keySet → String', () => {
      const node = makeNode('hm1', 'hashMapOp', { operation: 'keySet' });
      expect(resolveSourceType(node, 'data-out')).toBe('String');
    });
  });

  describe('hashSetOp', () => {
    it('size → int', () => {
      const node = makeNode('hs1', 'hashSetOp', { operation: 'size' });
      expect(resolveSourceType(node, 'data-out')).toBe('int');
    });

    it('contains → boolean', () => {
      const node = makeNode('hs1', 'hashSetOp', { operation: 'contains' });
      expect(resolveSourceType(node, 'data-out')).toBe('boolean');
    });
  });

  describe('newObject', () => {
    it('outputs targetClass', () => {
      const node = makeNode('no1', 'newObject', { targetClass: 'MyClass' });
      expect(resolveSourceType(node, 'data-out')).toBe('MyClass');
    });
  });

  describe('fallback', () => {
    it('returns node.data.type for generic nodes', () => {
      const node = makeNode('v1', 'java', { type: 'int' });
      expect(resolveSourceType(node, 'data-out')).toBe('int');
    });

    it('returns undefined when no type info available', () => {
      const node = makeNode('x1', 'unknown', {});
      expect(resolveSourceType(node, 'data-out')).toBeUndefined();
    });
  });
});

// ── getAutoConvertType ───────────────────────────────────────────

describe('getAutoConvertType', () => {
  it('returns null when source type is already accepted', () => {
    expect(getAutoConvertType('int', ['int', 'double'])).toBeNull();
  });

  it('numeric → numeric widening returns first accepted numeric', () => {
    expect(getAutoConvertType('int', ['double', 'float'])).toBe('double');
    expect(getAutoConvertType('float', ['int', 'long'])).toBe('int');
  });

  it('numeric → String', () => {
    expect(getAutoConvertType('int', ['String'])).toBe('String');
  });

  it('String → numeric', () => {
    expect(getAutoConvertType('String', ['int', 'double'])).toBe('int');
  });

  it('boolean → String', () => {
    expect(getAutoConvertType('boolean', ['String'])).toBe('String');
  });

  it('String → boolean', () => {
    expect(getAutoConvertType('String', ['boolean'])).toBe('boolean');
  });

  it('returns null for incompatible types', () => {
    expect(getAutoConvertType('boolean', ['int', 'double'])).toBeNull();
  });

  it('returns null when accepted list is empty', () => {
    expect(getAutoConvertType('int', [])).toBeNull();
  });
});

// ── isValidJavaConnection ────────────────────────────────────────

describe('isValidJavaConnection', () => {
  it('exec → exec is valid', () => {
    const nodes = [
      makeNode('a', 'print', { type: 'void' }),
      makeNode('b', 'print', { type: 'void' }),
    ];
    const conn = makeConnection('a', 'b', 'exec-out', 'exec-in');
    expect(isValidJavaConnection(conn, nodes)).toBe(true);
  });

  it('exec → data is invalid', () => {
    const nodes = [
      makeNode('a', 'print', { type: 'void' }),
      makeNode('b', 'java', { type: 'int', accepts: ['int'] }),
    ];
    const conn = makeConnection('a', 'b', 'exec-out', 'data-in');
    expect(isValidJavaConnection(conn, nodes)).toBe(false);
  });

  it('data → exec is invalid', () => {
    const nodes = [
      makeNode('a', 'java', { type: 'int' }),
      makeNode('b', 'print', { type: 'void' }),
    ];
    const conn = makeConnection('a', 'b', 'data-out', 'exec-in');
    expect(isValidJavaConnection(conn, nodes)).toBe(false);
  });

  it('compatible data types are valid', () => {
    const nodes = [
      makeNode('a', 'java', { type: 'int' }),
      makeNode('b', 'java', { type: 'int', accepts: ['int'] }),
    ];
    const conn = makeConnection('a', 'b', 'data-out', 'data-in');
    expect(isValidJavaConnection(conn, nodes)).toBe(true);
  });

  it('incompatible data types are invalid', () => {
    const nodes = [
      makeNode('a', 'java', { type: 'String' }),
      makeNode('b', 'java', { type: 'void', accepts: ['void'] }),
    ];
    const conn = makeConnection('a', 'b', 'data-out', 'data-in');
    expect(isValidJavaConnection(conn, nodes)).toBe(false);
  });

  it('auto-convertible data types are valid', () => {
    const nodes = [
      makeNode('a', 'java', { type: 'int' }),
      makeNode('b', 'java', { type: 'double', accepts: ['double'] }),
    ];
    const conn = makeConnection('a', 'b', 'data-out', 'data-in');
    expect(isValidJavaConnection(conn, nodes)).toBe(true);
  });

  it('returns false for missing source node', () => {
    const nodes = [makeNode('b', 'java', { type: 'int' })];
    const conn = makeConnection('missing', 'b', 'data-out', 'data-in');
    expect(isValidJavaConnection(conn, nodes)).toBe(false);
  });

  it('returns false for missing target node', () => {
    const nodes = [makeNode('a', 'java', { type: 'int' })];
    const conn = makeConnection('a', 'missing', 'data-out', 'data-in');
    expect(isValidJavaConnection(conn, nodes)).toBe(false);
  });

  it('returns false when source is null', () => {
    const conn = { source: null, target: 'b', sourceHandle: 'data-out', targetHandle: 'data-in' } as unknown as Connection;
    expect(isValidJavaConnection(conn, [])).toBe(false);
  });

  it('works with Edge objects', () => {
    const nodes = [
      makeNode('a', 'print', {}),
      makeNode('b', 'print', {}),
    ];
    const edge = makeEdge('a', 'b', 'exec-out', 'exec-in');
    expect(isValidJavaConnection(edge, nodes)).toBe(true);
  });

  it('data → data matching via node.data.type (no accepts)', () => {
    const nodes = [
      makeNode('a', 'java', { type: 'int' }),
      makeNode('b', 'java', { type: 'int' }),
    ];
    const conn = makeConnection('a', 'b', 'data-out', 'data-in');
    expect(isValidJavaConnection(conn, nodes)).toBe(true);
  });

  it('data → data mismatch via node.data.type returns false', () => {
    const nodes = [
      makeNode('a', 'java', { type: 'boolean' }),
      makeNode('b', 'java', { type: 'int' }),
    ];
    const conn = makeConnection('a', 'b', 'data-out', 'data-in');
    expect(isValidJavaConnection(conn, nodes)).toBe(false);
  });
});

// ── resolveTargetAccepts ─────────────────────────────────────────

describe('resolveTargetAccepts', () => {
  it('stringOp data-in accepts String', () => {
    const node = makeNode('s1', 'stringOp', {});
    expect(resolveTargetAccepts(node, 'data-in', [])).toEqual(['String']);
  });

  it('stringOp data-in-index accepts int', () => {
    const node = makeNode('s1', 'stringOp', {});
    expect(resolveTargetAccepts(node, 'data-in-index', [])).toEqual(['int']);
  });

  it('cast data-in accepts all types', () => {
    const node = makeNode('c1', 'cast', {});
    const accepted = resolveTargetAccepts(node, 'data-in', []);
    expect(accepted).toBeDefined();
    expect(accepted!.length).toBeGreaterThan(0);
    expect(accepted).toContain('int');
    expect(accepted).toContain('String');
  });

  it('ternary condition accepts boolean', () => {
    const node = makeNode('t1', 'ternary', {});
    expect(resolveTargetAccepts(node, 'data-in-condition', [])).toEqual(['boolean']);
  });

  it('scanner prompt accepts String', () => {
    const node = makeNode('sc1', 'scanner', {});
    expect(resolveTargetAccepts(node, 'data-in-prompt', [])).toEqual(['String']);
  });

  it('callMethod arg-in resolves from method parameters', () => {
    const methodNode = makeNode('m1', 'method', {
      label: 'doStuff',
      parameters: [{ id: 'p0', name: 'x', type: 'int' }],
    });
    const callNode = makeNode('c1', 'callMethod', { methodName: 'doStuff' });
    expect(resolveTargetAccepts(callNode, 'arg-in-0', [methodNode, callNode])).toEqual(['int']);
  });

  it('falls back to node.data.accepts', () => {
    const node = makeNode('g1', 'java', { accepts: ['int', 'double'] });
    expect(resolveTargetAccepts(node, 'data-in', [])).toEqual(['int', 'double']);
  });
});

// ── getCompatibleNodeKinds ───────────────────────────────────────

describe('getCompatibleNodeKinds', () => {
  it('returns exec-target kinds for exec source handle', () => {
    const node = makeNode('a', 'print', {});
    const kinds = getCompatibleNodeKinds(node, 'exec-out', [node]);
    expect(kinds.size).toBeGreaterThan(0);
    expect(kinds.has('print')).toBe(true);
    expect(kinds.has('branch')).toBe(true);
  });

  it('returns data-compatible kinds for data source handle', () => {
    const node = makeNode('a', 'java', { type: 'int' });
    const kinds = getCompatibleNodeKinds(node, 'data-out', [node]);
    // Should include at least some node types that accept int
    expect(kinds.size).toBeGreaterThan(0);
  });

  it('returns empty set when source type is undefined', () => {
    const node = makeNode('a', 'unknown', {});
    const kinds = getCompatibleNodeKinds(node, 'data-out', [node]);
    expect(kinds.size).toBe(0);
  });
});
