import { describe, it, expect } from 'vitest';
import {
  isValidJavaIdentifier,
  isValidClassName,
  getIdentifierError,
  sanitizeIdentifier,
} from '../validators';

describe('isValidJavaIdentifier', () => {
  it('accepts valid identifiers', () => {
    expect(isValidJavaIdentifier('myVar')).toBe(true);
    expect(isValidJavaIdentifier('_private')).toBe(true);
    expect(isValidJavaIdentifier('$dollar')).toBe(true);
    expect(isValidJavaIdentifier('camelCase123')).toBe(true);
    expect(isValidJavaIdentifier('x')).toBe(true);
    expect(isValidJavaIdentifier('_')).toBe(true);
    expect(isValidJavaIdentifier('$')).toBe(true);
    expect(isValidJavaIdentifier('_$mixed1')).toBe(true);
  });

  it('rejects empty string', () => {
    expect(isValidJavaIdentifier('')).toBe(false);
  });

  it('rejects identifiers starting with a digit', () => {
    expect(isValidJavaIdentifier('123abc')).toBe(false);
    expect(isValidJavaIdentifier('0x')).toBe(false);
  });

  it('rejects identifiers with invalid characters', () => {
    expect(isValidJavaIdentifier('my-var')).toBe(false);
    expect(isValidJavaIdentifier('my var')).toBe(false);
    expect(isValidJavaIdentifier('hello!')).toBe(false);
    expect(isValidJavaIdentifier('a.b')).toBe(false);
  });

  it('rejects Java reserved words', () => {
    expect(isValidJavaIdentifier('for')).toBe(false);
    expect(isValidJavaIdentifier('class')).toBe(false);
    expect(isValidJavaIdentifier('while')).toBe(false);
    expect(isValidJavaIdentifier('int')).toBe(false);
    expect(isValidJavaIdentifier('boolean')).toBe(false);
    expect(isValidJavaIdentifier('return')).toBe(false);
    expect(isValidJavaIdentifier('void')).toBe(false);
    expect(isValidJavaIdentifier('static')).toBe(false);
  });
});

describe('isValidClassName', () => {
  it('accepts valid class names (uppercase start + valid identifier)', () => {
    expect(isValidClassName('MyClass')).toBe(true);
    expect(isValidClassName('A')).toBe(true);
    expect(isValidClassName('VisualScript')).toBe(true);
    expect(isValidClassName('Node123')).toBe(true);
  });

  it('rejects names starting with lowercase', () => {
    expect(isValidClassName('myClass')).toBe(false);
  });

  it('rejects names starting with underscore or dollar', () => {
    expect(isValidClassName('_Private')).toBe(false);
    expect(isValidClassName('$Dollar')).toBe(false);
  });

  it('rejects invalid identifiers even with uppercase start', () => {
    expect(isValidClassName('My-Class')).toBe(false);
    expect(isValidClassName('')).toBe(false);
  });

  it('rejects reserved words (none start with uppercase, but ensure logic)', () => {
    expect(isValidClassName('for')).toBe(false);
  });
});

describe('getIdentifierError', () => {
  it('returns null for valid identifiers', () => {
    expect(getIdentifierError('myVar')).toBeNull();
    expect(getIdentifierError('_x')).toBeNull();
    expect(getIdentifierError('$y')).toBeNull();
  });

  it('returns error for empty string', () => {
    expect(getIdentifierError('')).toBe('Identifier cannot be empty');
  });

  it('returns error for reserved words', () => {
    expect(getIdentifierError('for')).toBe("'for' is a Java reserved word");
    expect(getIdentifierError('class')).toBe("'class' is a Java reserved word");
    expect(getIdentifierError('int')).toBe("'int' is a Java reserved word");
  });

  it('returns error for names starting with a digit', () => {
    expect(getIdentifierError('123abc')).toBe(
      'Must start with a letter, underscore, or dollar sign'
    );
  });

  it('returns error for invalid characters', () => {
    expect(getIdentifierError('my-var')).toBe(
      'Contains invalid characters (only letters, digits, _, $ allowed)'
    );
    expect(getIdentifierError('my var')).toBe(
      'Contains invalid characters (only letters, digits, _, $ allowed)'
    );
  });
});

describe('sanitizeIdentifier', () => {
  it('removes invalid characters', () => {
    expect(sanitizeIdentifier('my-var')).toBe('myvar');
    expect(sanitizeIdentifier('hello world!')).toBe('helloworld');
    expect(sanitizeIdentifier('a.b.c')).toBe('abc');
  });

  it('prepends underscore if result starts with a digit', () => {
    expect(sanitizeIdentifier('123abc')).toBe('_123abc');
    expect(sanitizeIdentifier('0x')).toBe('_0x');
  });

  it('returns empty string for all-invalid input', () => {
    expect(sanitizeIdentifier('---')).toBe('');
    expect(sanitizeIdentifier('!!!')).toBe('');
  });

  it('preserves valid identifiers', () => {
    expect(sanitizeIdentifier('myVar')).toBe('myVar');
    expect(sanitizeIdentifier('_private')).toBe('_private');
    expect(sanitizeIdentifier('$dollar')).toBe('$dollar');
  });

  it('keeps underscores and dollar signs', () => {
    expect(sanitizeIdentifier('a_b$c')).toBe('a_b$c');
  });
});
