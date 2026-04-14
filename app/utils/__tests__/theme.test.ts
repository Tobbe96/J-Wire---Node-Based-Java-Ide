import { describe, it, expect } from 'vitest';
import {
  getTypeColor,
  isNumericType,
  getDefaultLiteral,
  getRuntimeDefault,
  TYPE_COLORS,
  JAVA_TYPES,
  NUMERIC_TYPES,
  ALL_NUMERIC,
  ALL_TYPES,
} from '../theme';

describe('TYPE_COLORS', () => {
  it('has entries for all JAVA_TYPES', () => {
    for (const t of JAVA_TYPES) {
      expect(TYPE_COLORS[t]).toBeDefined();
    }
  });
});

describe('getTypeColor', () => {
  it('returns correct color for known types', () => {
    expect(getTypeColor('int')).toBe('#00eeff');
    expect(getTypeColor('String')).toBe('#ff00d4');
    expect(getTypeColor('boolean')).toBe('#ff0000');
    expect(getTypeColor('double')).toBe('#a1ff00');
    expect(getTypeColor('float')).toBe('#a1ff00');
    expect(getTypeColor('long')).toBe('#00ccaa');
    expect(getTypeColor('short')).toBe('#66ddff');
    expect(getTypeColor('byte')).toBe('#88ccee');
    expect(getTypeColor('char')).toBe('#ff8800');
    expect(getTypeColor('void')).toBe('#9b59b6');
  });

  it('returns default color for unknown types', () => {
    expect(getTypeColor('SomeClass')).toBe('#6366f1');
    expect(getTypeColor('unknown')).toBe('#6366f1');
    expect(getTypeColor('')).toBe('#6366f1');
  });
});

describe('isNumericType', () => {
  it('returns true for numeric types', () => {
    expect(isNumericType('int')).toBe(true);
    expect(isNumericType('float')).toBe(true);
    expect(isNumericType('double')).toBe(true);
    expect(isNumericType('long')).toBe(true);
    expect(isNumericType('short')).toBe(true);
    expect(isNumericType('byte')).toBe(true);
  });

  it('returns false for non-numeric types', () => {
    expect(isNumericType('String')).toBe(false);
    expect(isNumericType('boolean')).toBe(false);
    expect(isNumericType('void')).toBe(false);
    expect(isNumericType('char')).toBe(false);
    expect(isNumericType('unknown')).toBe(false);
  });
});

describe('getDefaultLiteral', () => {
  it('returns correct Java literal defaults', () => {
    expect(getDefaultLiteral('int')).toBe('0');
    expect(getDefaultLiteral('float')).toBe('0.0f');
    expect(getDefaultLiteral('double')).toBe('0.0');
    expect(getDefaultLiteral('long')).toBe('0L');
    expect(getDefaultLiteral('short')).toBe('(short)0');
    expect(getDefaultLiteral('byte')).toBe('(byte)0');
    expect(getDefaultLiteral('char')).toBe("'\\u0000'");
    expect(getDefaultLiteral('String')).toBe('""');
    expect(getDefaultLiteral('boolean')).toBe('false');
  });

  it('returns null for unknown types', () => {
    expect(getDefaultLiteral('SomeClass')).toBe('null');
    expect(getDefaultLiteral('void')).toBe('null');
  });
});

describe('getRuntimeDefault', () => {
  it('returns 0 for numeric types without a default', () => {
    expect(getRuntimeDefault('int')).toBe(0);
    expect(getRuntimeDefault('float')).toBe(0);
    expect(getRuntimeDefault('double')).toBe(0);
    expect(getRuntimeDefault('long')).toBe(0);
    expect(getRuntimeDefault('short')).toBe(0);
    expect(getRuntimeDefault('byte')).toBe(0);
  });

  it('parses numeric default values', () => {
    expect(getRuntimeDefault('int', '42')).toBe(42);
    expect(getRuntimeDefault('double', '3.14')).toBe(3.14);
  });

  it('returns empty string for String without default', () => {
    expect(getRuntimeDefault('String')).toBe('');
  });

  it('returns the provided default for String', () => {
    expect(getRuntimeDefault('String', 'hello')).toBe('hello');
  });

  it('returns false for boolean without default', () => {
    expect(getRuntimeDefault('boolean')).toBe(false);
  });

  it('returns true for boolean with "true" default', () => {
    expect(getRuntimeDefault('boolean', 'true')).toBe(true);
  });

  it('returns false for boolean with non-"true" default', () => {
    expect(getRuntimeDefault('boolean', 'false')).toBe(false);
    expect(getRuntimeDefault('boolean', 'yes')).toBe(false);
  });

  it('returns null-char for char without default', () => {
    expect(getRuntimeDefault('char')).toBe('\0');
  });

  it('returns provided default for char', () => {
    expect(getRuntimeDefault('char', 'A')).toBe('A');
  });

  it('returns null for unknown types without default', () => {
    expect(getRuntimeDefault('SomeClass')).toBeNull();
  });

  it('returns provided default for unknown types', () => {
    expect(getRuntimeDefault('SomeClass', 'value')).toBe('value');
  });
});

describe('constant arrays', () => {
  it('NUMERIC_TYPES contains exactly the six numeric types', () => {
    expect(NUMERIC_TYPES).toEqual(['int', 'float', 'double', 'long', 'short', 'byte']);
  });

  it('ALL_NUMERIC is a mutable copy of NUMERIC_TYPES', () => {
    expect(ALL_NUMERIC).toEqual([...NUMERIC_TYPES]);
  });

  it('ALL_TYPES is a mutable copy of JAVA_TYPES', () => {
    expect(ALL_TYPES).toEqual([...JAVA_TYPES]);
  });

  it('JAVA_TYPES contains all nine types', () => {
    expect(JAVA_TYPES).toHaveLength(9);
    expect(JAVA_TYPES).toContain('String');
    expect(JAVA_TYPES).toContain('boolean');
  });
});
