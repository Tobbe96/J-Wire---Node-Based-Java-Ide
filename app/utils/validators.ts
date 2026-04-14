const JAVA_RESERVED_WORDS = new Set([
  'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char',
  'class', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum',
  'extends', 'final', 'finally', 'float', 'for', 'goto', 'if', 'implements',
  'import', 'instanceof', 'int', 'interface', 'long', 'native', 'new',
  'package', 'private', 'protected', 'public', 'return', 'short', 'static',
  'strictfp', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws',
  'transient', 'try', 'void', 'volatile', 'while',
]);

const IDENTIFIER_REGEX = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

export function isValidJavaIdentifier(name: string): boolean {
  return IDENTIFIER_REGEX.test(name) && !JAVA_RESERVED_WORDS.has(name);
}

export function isValidClassName(name: string): boolean {
  return isValidJavaIdentifier(name) && /^[A-Z]/.test(name);
}

export function getIdentifierError(name: string): string | null {
  if (!name) return 'Identifier cannot be empty';
  if (JAVA_RESERVED_WORDS.has(name)) return `'${name}' is a Java reserved word`;
  if (!/^[a-zA-Z_$]/.test(name)) return 'Must start with a letter, underscore, or dollar sign';
  if (!IDENTIFIER_REGEX.test(name)) return 'Contains invalid characters (only letters, digits, _, $ allowed)';
  return null;
}

export function sanitizeIdentifier(name: string): string {
  let result = name.replace(/[^a-zA-Z0-9_$]/g, '');
  if (result && /^[0-9]/.test(result)) result = '_' + result;
  return result;
}
