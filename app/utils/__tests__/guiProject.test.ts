import { describe, expect, it } from 'vitest';
import type { Node } from '@xyflow/react';
import { isGuiProject } from '../guiProject';

function makeNode(id: string, type: string): Node {
  return { id, type, position: { x: 0, y: 0 }, data: {} };
}

describe('isGuiProject', () => {
  it('returns true for Swing projects', () => {
    expect(isGuiProject([{ nodes: [makeNode('s1', 'swingApp')] }])).toBe(true);
  });

  it('returns true for JavaFX projects', () => {
    expect(isGuiProject([{ nodes: [makeNode('j1', 'javafxApp')] }])).toBe(true);
  });

  it('returns false for non-GUI projects', () => {
    expect(isGuiProject([{ nodes: [makeNode('m1', 'main'), makeNode('p1', 'print')] }])).toBe(false);
  });
});
