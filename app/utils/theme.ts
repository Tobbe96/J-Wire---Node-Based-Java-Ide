// Shared theme utilities — single source of truth for type colors, helpers, defaults

export const TYPE_COLORS: Record<string, string> = {
  int: '#00eeff',
  float: '#a1ff00',
  double: '#a1ff00',
  long: '#00ccaa',
  short: '#66ddff',
  byte: '#88ccee',
  String: '#ff00d4',
  boolean: '#ff0000',
  void: '#9b59b6',
};

const DEFAULT_COLOR = '#6366f1';

/** Returns the wire/handle color for a Java type */
export function getTypeColor(type: string): string {
  return TYPE_COLORS[type] ?? DEFAULT_COLOR;
}

/** Whether the type is numeric (supports inline number editing) */
export function isNumericType(type: string): boolean {
  return NUMERIC_TYPES.includes(type as typeof NUMERIC_TYPES[number]);
}

/** Java-source default literal for a type (used by compiler) */
export function getDefaultLiteral(type: string): string {
  switch (type) {
    case 'int': return '0';
    case 'float': return '0.0f';
    case 'double': return '0.0';
    case 'long': return '0L';
    case 'short': return '(short)0';
    case 'byte': return '(byte)0';
    case 'String': return '""';
    case 'boolean': return 'false';
    default: return 'null';
  }
}

/** Runtime default value for a type (used by executor) */
export function getRuntimeDefault(type: string, defaultValue?: string): unknown {
  switch (type) {
    case 'int':
    case 'float':
    case 'double':
    case 'long':
    case 'short':
    case 'byte':
      return Number(defaultValue ?? 0);
    case 'boolean':
      return defaultValue === 'true';
    case 'String':
      return defaultValue ?? '';
    default:
      return defaultValue ?? null;
  }
}

/** All supported Java types for dropdowns */
export const JAVA_TYPES = ['int', 'float', 'double', 'long', 'short', 'byte', 'String', 'boolean'] as const;

/** Numeric Java types for dropdowns that support number input */
export const NUMERIC_TYPES = ['int', 'float', 'double', 'long', 'short', 'byte'] as const;

/** All numeric type names as a plain array (for accepts lists) */
export const ALL_NUMERIC: string[] = [...NUMERIC_TYPES];

/** All value types (for generic accepts) */
export const ALL_TYPES: string[] = [...JAVA_TYPES];
