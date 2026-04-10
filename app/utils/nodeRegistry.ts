import { ALL_NUMERIC, ALL_TYPES } from './theme';

export const NODE_CATEGORIES = {
  Variables: ['int', 'float', 'double', 'long', 'short', 'byte', 'char', 'String', 'boolean'],
  Logic: ['main', 'method', 'callMethod', 'branch', 'while', 'for', 'doWhile', 'switch', 'tryCatchFinally', 'throw', 'break', 'continue', 'setVar', 'setLocalVar', 'print', 'return', 'increment', 'compoundAssign'],
  Input: ['scanner-nextLine', 'scanner-nextInt', 'scanner-nextFloat', 'scanner-nextDouble', 'scanner-nextLong', 'scanner-nextBoolean'],
  Math: ['math-add', 'math-sub', 'math-mul', 'math-div', 'math-mod', 'math-gt', 'math-lt', 'math-lte', 'math-gte', 'math-eq', 'math-neq', 'math-and', 'math-or', 'math-not'],
  'Math Functions': ['math-abs', 'math-min', 'math-max', 'math-pow', 'math-sqrt', 'math-random', 'math-ceil', 'math-floor', 'math-round', 'math-log', 'math-log10'],
  Conversion: ['cast', 'ternary', 'literal'],
  Strings: ['string-concat', 'string-length', 'string-substring', 'string-charAt', 'string-indexOf', 'string-replace', 'string-trim', 'string-toUpperCase', 'string-toLowerCase', 'stringFormat'],
  Arrays: ['array-literal', 'array-new', 'array-access', 'array-set', 'array-length', 'forEach'],
  Collections: ['arrayList-create', 'arrayList-add', 'arrayList-get', 'arrayList-set', 'arrayList-remove', 'arrayList-size', 'arrayList-contains', 'arrayList-clear', 'hashMap-create', 'hashMap-put', 'hashMap-get', 'hashMap-remove', 'hashMap-containsKey', 'hashMap-size', 'hashMap-keySet'],
  Utility: ['comment'],
};

export const NODE_CONFIGS: Record<string, any> = {
  // --- LOGIC & FLOW ---
  method: { 
    type: 'method', 
    data: { type: 'void', label: 'newMethod' } 
  },
  main: { 
    type: 'main', 
    data: { label: 'Main' } 
  },
  print: { 
    type: 'print', 
    data: { 
      label: 'Print', 
      accepts: ALL_TYPES
    } 
  },
  branch: { 
    type: 'branch', 
    data: { 
      label: 'Branch', 
      accepts: ['boolean']
    } 
  },
  callMethod: { 
    type: 'callMethod', 
    data: { methodName: 'newMethod' } 
  },
  setVar: {
    type: 'setVar', 
    data: {
      variableName: 'myVar', 
      label:'Set Variable',
      accepts: ALL_TYPES
    }
  },
  setLocalVar: {
    type: 'setLocalVar',
    data: {
      label: 'Set Local Var',
      methodName: '',
      localVarName: ''
    }
  },
  while: {
    type: 'while', 
    data: {
      label: "WHILE Loop",
      accepts: ['boolean']
    }
  },
  for: {
    type: 'for',
    data: {
      label: 'FOR Loop',
      accepts: ALL_NUMERIC
    }
  },
  return: {
    type: 'return', 
    data: {
      label: 'Return',
      accepts: ALL_TYPES
    }
  },

  doWhile: {
    type: 'doWhile',
    data: {
      label: 'DO-WHILE Loop',
      accepts: ['boolean']
    }
  },
  switch: {
    type: 'switch',
    data: {
      label: 'SWITCH',
      caseCount: 2,
      accepts: ALL_NUMERIC
    }
  },
  cast: {
    type: 'cast',
    data: {
      label: 'Cast',
      targetType: 'String'
    }
  },
  ternary: {
    type: 'ternary',
    data: {
      label: 'Ternary'
    }
  },
  literal: {
    type: 'literal',
    data: {
      label: 'Literal',
      literalType: 'String',
      value: ''
    }
  },
  break: {
    type: 'break',
    data: {
      label: 'Break'
    }
  },
  continue: {
    type: 'continue',
    data: {
      label: 'Continue'
    }
  },
  tryCatchFinally: {
    type: 'tryCatchFinally',
    data: {
      label: 'Try / Catch / Finally'
    }
  },
  throw: {
    type: 'throw',
    data: {
      label: 'Throw',
      accepts: ['String']
    }
  },

  getter: {
    type: 'getter',
    data: {
      label: 'Variable',
      type: 'int'
    }
  },

  // --- MATH & COMPARISON ---
  'math-add': { type: 'math', data: { type: 'int', label: 'ADD', symbol: '+', operation: '+', accepts: ALL_NUMERIC } },
  'math-sub': { type: 'math', data: { type: 'int', label: 'SUBTRACT', symbol: '-', operation: '-', accepts: ALL_NUMERIC } },
  'math-mul': { type: 'math', data: { type: 'int', label: 'MULTIPLY', symbol: '*', operation: '*', accepts: ALL_NUMERIC } },
  'math-div': { type: 'math', data: { type: 'int', label: 'DIVIDE', symbol: '/', operation: '/', accepts: ALL_NUMERIC } },
  'math-mod': { type: 'math', data: { type: 'int', label: 'MODULO', symbol: '%', operation: '%', accepts: ALL_NUMERIC } },
  
  // Comparison nodes output 'boolean' and accept all numeric types
  'math-gt':  { type: 'math', data: { type: 'boolean', label: 'GREATER THAN', symbol: '>', operation: '>', accepts: ALL_NUMERIC } },
  'math-lt':  { type: 'math', data: { type: 'boolean', label: 'LESS THAN', symbol: '<', operation: '<', accepts: ALL_NUMERIC } },
  'math-lte': { type: 'math', data: { type: 'boolean', label: 'LESS OR EQUAL', symbol: '<=', operation: '<=', accepts: ALL_NUMERIC } },
  'math-gte': { type: 'math', data: { type: 'boolean', label: 'GREATER OR EQUAL', symbol: '>=', operation: '>=', accepts: ALL_NUMERIC } },
  'math-eq':  { type: 'math', data: { type: 'boolean', label: 'EQUALS', symbol: '==', operation: '==', accepts: ALL_TYPES } },
  'math-neq': { type: 'math', data: { type: 'boolean', label: 'NOT EQUALS', symbol: '!=', operation: '!=', accepts: ALL_TYPES } },
  
  // Logical nodes output 'boolean' and accept 'boolean'
  'math-and': { type: 'math', data: { type: 'boolean', label: 'AND', symbol: '&&', operation: '&&', accepts: ['boolean'] } },
  'math-or':  { type: 'math', data: { type: 'boolean', label: 'OR', symbol: '||', operation: '||', accepts: ['boolean'] } },
  'math-not': { type: 'not', data: { type: 'boolean', label: 'NOT', symbol: '!', operation: '!', accepts: ['boolean'] } },
  
  // --- MATH FUNCTIONS ---
  'math-abs': { type: 'mathFunc', data: { type: 'int', label: 'ABS', operation: 'abs', accepts: ALL_NUMERIC } },
  'math-min': { type: 'mathFunc', data: { type: 'int', label: 'MIN', operation: 'min', accepts: ALL_NUMERIC } },
  'math-max': { type: 'mathFunc', data: { type: 'int', label: 'MAX', operation: 'max', accepts: ALL_NUMERIC } },
  'math-pow': { type: 'mathFunc', data: { type: 'int', label: 'POW', operation: 'pow', accepts: ALL_NUMERIC } },

  // --- STRING OPERATIONS ---
  'string-concat': { type: 'stringOp', data: { label: 'STRING: Concat', operation: 'concat' } },
  'string-length': { type: 'stringOp', data: { label: 'STRING: Length', operation: 'length' } },
  'string-substring': { type: 'stringOp', data: { label: 'STRING: Substring', operation: 'substring' } },
  'string-charAt': { type: 'stringOp', data: { label: 'STRING: CharAt', operation: 'charAt' } },
  'string-indexOf': { type: 'stringOp', data: { label: 'STRING: IndexOf', operation: 'indexOf' } },
  'string-replace': { type: 'stringOp', data: { label: 'STRING: Replace', operation: 'replace' } },
  'string-trim': { type: 'stringOp', data: { label: 'STRING: Trim', operation: 'trim' } },
  'string-toUpperCase': { type: 'stringOp', data: { label: 'STRING: ToUpperCase', operation: 'toUpperCase' } },
  'string-toLowerCase': { type: 'stringOp', data: { label: 'STRING: ToLowerCase', operation: 'toLowerCase' } },

  // --- ARRAY OPERATIONS ---
  'array-literal': { type: 'arrayOp', data: { label: 'Array Literal', operation: 'literal', arrayType: 'int', values: '1,2,3' } },
  'array-new': { type: 'arrayOp', data: { label: 'Array New', operation: 'new', arrayType: 'int' } },
  'array-access': { type: 'arrayOp', data: { label: 'Array Access', operation: 'access' } },
  'array-set': { type: 'arrayOp', data: { label: 'Array Set', operation: 'set' } },
  'array-length': { type: 'arrayOp', data: { label: 'Array Length', operation: 'length' } },
  forEach: {
    type: 'forEach',
    data: {
      label: 'For-Each',
      elementType: 'int'
    }
  },

  // --- SCANNER (User Input) ---
  'scanner-nextLine': { type: 'scanner', data: { label: 'Read Line', readType: 'nextLine' } },
  'scanner-nextInt': { type: 'scanner', data: { label: 'Read Int', readType: 'nextInt' } },
  'scanner-nextFloat': { type: 'scanner', data: { label: 'Read Float', readType: 'nextFloat' } },
  'scanner-nextDouble': { type: 'scanner', data: { label: 'Read Double', readType: 'nextDouble' } },
  'scanner-nextLong': { type: 'scanner', data: { label: 'Read Long', readType: 'nextLong' } },
  'scanner-nextBoolean': { type: 'scanner', data: { label: 'Read Boolean', readType: 'nextBoolean' } },

  // --- VARIABLES ---
  int: { type: 'java', data: { type: 'int', value: '0', label: 'NewInt' } },
  float: { type: 'java', data: { type: 'float', value: '0.0', label: 'NewFloat' } },
  double: { type: 'java', data: { type: 'double', value: '0.0', label: 'NewDouble' } },
  long: { type: 'java', data: { type: 'long', value: '0', label: 'NewLong' } },
  short: { type: 'java', data: { type: 'short', value: '0', label: 'NewShort' } },
  byte: { type: 'java', data: { type: 'byte', value: '0', label: 'NewByte' } },
  char: { type: 'java', data: { type: 'char', value: 'A', label: 'NewChar' } },
  String: { type: 'java', data: { type: 'String', value: '', label: 'NewString' } },
  boolean: { type: 'java', data: { type: 'boolean', value: 'true', label: 'NewBool' } },

  // --- INCREMENT / DECREMENT ---
  increment: {
    type: 'increment',
    data: {
      label: 'Increment',
      variableName: 'myVar',
      mode: 'post-increment'
    }
  },

  // --- COMPOUND ASSIGNMENT ---
  compoundAssign: {
    type: 'compoundAssign',
    data: {
      label: 'Compound Assign',
      variableName: 'myVar',
      operator: '+='
    }
  },

  // --- STRING FORMAT ---
  stringFormat: {
    type: 'stringFormat',
    data: {
      label: 'String.format',
      formatString: 'Hello %s, you are %d years old',
      argCount: 2
    }
  },

  // --- COMMENT ---
  comment: {
    type: 'comment',
    data: {
      label: 'Comment',
      text: 'Add your notes here...'
    }
  },

  // --- ADDITIONAL MATH FUNCTIONS ---
  'math-sqrt': { type: 'mathFunc', data: { type: 'double', label: 'SQRT', operation: 'sqrt', accepts: ALL_NUMERIC } },
  'math-random': { type: 'mathFunc', data: { type: 'double', label: 'RANDOM', operation: 'random', accepts: [] } },
  'math-ceil': { type: 'mathFunc', data: { type: 'int', label: 'CEIL', operation: 'ceil', accepts: ALL_NUMERIC } },
  'math-floor': { type: 'mathFunc', data: { type: 'int', label: 'FLOOR', operation: 'floor', accepts: ALL_NUMERIC } },
  'math-round': { type: 'mathFunc', data: { type: 'int', label: 'ROUND', operation: 'round', accepts: ALL_NUMERIC } },
  'math-log': { type: 'mathFunc', data: { type: 'double', label: 'LOG', operation: 'log', accepts: ALL_NUMERIC } },
  'math-log10': { type: 'mathFunc', data: { type: 'double', label: 'LOG10', operation: 'log10', accepts: ALL_NUMERIC } },

  // --- ARRAYLIST OPERATIONS ---
  'arrayList-create': { type: 'arrayListOp', data: { label: 'ArrayList: Create', operation: 'create', elementType: 'int', variableName: 'myList' } },
  'arrayList-add': { type: 'arrayListOp', data: { label: 'ArrayList: Add', operation: 'add', elementType: 'int', variableName: 'myList' } },
  'arrayList-get': { type: 'arrayListOp', data: { label: 'ArrayList: Get', operation: 'get', elementType: 'int', variableName: 'myList' } },
  'arrayList-set': { type: 'arrayListOp', data: { label: 'ArrayList: Set', operation: 'set', elementType: 'int', variableName: 'myList' } },
  'arrayList-remove': { type: 'arrayListOp', data: { label: 'ArrayList: Remove', operation: 'remove', elementType: 'int', variableName: 'myList' } },
  'arrayList-size': { type: 'arrayListOp', data: { label: 'ArrayList: Size', operation: 'size', elementType: 'int', variableName: 'myList' } },
  'arrayList-contains': { type: 'arrayListOp', data: { label: 'ArrayList: Contains', operation: 'contains', elementType: 'int', variableName: 'myList' } },
  'arrayList-clear': { type: 'arrayListOp', data: { label: 'ArrayList: Clear', operation: 'clear', elementType: 'int', variableName: 'myList' } },

  // --- HASHMAP OPERATIONS ---
  'hashMap-create': { type: 'hashMapOp', data: { label: 'HashMap: Create', operation: 'create', keyType: 'String', valueType: 'int', variableName: 'myMap' } },
  'hashMap-put': { type: 'hashMapOp', data: { label: 'HashMap: Put', operation: 'put', keyType: 'String', valueType: 'int', variableName: 'myMap' } },
  'hashMap-get': { type: 'hashMapOp', data: { label: 'HashMap: Get', operation: 'get', keyType: 'String', valueType: 'int', variableName: 'myMap' } },
  'hashMap-remove': { type: 'hashMapOp', data: { label: 'HashMap: Remove', operation: 'remove', keyType: 'String', valueType: 'int', variableName: 'myMap' } },
  'hashMap-containsKey': { type: 'hashMapOp', data: { label: 'HashMap: ContainsKey', operation: 'containsKey', keyType: 'String', valueType: 'int', variableName: 'myMap' } },
  'hashMap-size': { type: 'hashMapOp', data: { label: 'HashMap: Size', operation: 'size', keyType: 'String', valueType: 'int', variableName: 'myMap' } },
  'hashMap-keySet': { type: 'hashMapOp', data: { label: 'HashMap: KeySet', operation: 'keySet', keyType: 'String', valueType: 'int', variableName: 'myMap' } },
};