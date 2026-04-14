export const SCANNER_JAVA_TYPES: Record<string, string> = {
  nextLine: 'String',
  nextInt: 'int',
  nextFloat: 'float',
  nextDouble: 'double',
  nextLong: 'long',
  nextBoolean: 'boolean',
};

/** Maps a primitive Java type to its boxed wrapper (needed for generics). */
export function boxedType(t: string): string {
  const map: Record<string, string> = {
    int: 'Integer', float: 'Float', double: 'Double',
    long: 'Long', short: 'Short', byte: 'Byte',
    char: 'Character', boolean: 'Boolean',
  };
  return map[t] || t;
}

export interface ClassMeta {
  classType?: 'class' | 'interface' | 'enum';
  extendsClass?: string;
  implementsInterfaces?: string[];
  isAbstract?: boolean;
  packageName?: string;
}
