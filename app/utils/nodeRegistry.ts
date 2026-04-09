export const NODE_CATEGORIES = {
  Variables: ['int', 'String', 'boolean'],
  Logic: ['main', 'method', 'callMethod', 'branch', 'while', 'for', 'doWhile', 'switch', 'break', 'continue', 'setVar', 'setLocalVar', 'print', 'return'],
  Math: ['math-add', 'math-sub', 'math-mul', 'math-div', 'math-mod', 'math-gt', 'math-lt', 'math-lte', 'math-gte', 'math-eq', 'math-neq', 'math-and', 'math-or', 'math-not'],
  'Math Functions': ['math-abs', 'math-min', 'math-max', 'math-pow'],
  Conversion: ['cast', 'ternary'],
  Strings: ['string-concat', 'string-length', 'string-substring', 'string-charAt', 'string-indexOf', 'string-replace', 'string-trim', 'string-toUpperCase', 'string-toLowerCase'],
  Arrays: ['array-literal', 'array-access', 'array-length']
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
      accepts: ['int', 'String', 'boolean'] // Accepts anything printable
    } 
  },
  branch: { 
    type: 'branch', 
    data: { 
      label: 'Branch', 
      accepts: ['boolean'] // MUST be a boolean condition
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
      accepts: ['int', 'String', 'boolean']
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
      accepts: ['boolean'] // Condition must be boolean
    }
  },
  for: {
    type: 'for',
    data: {
      label: 'FOR Loop',
      accepts: ['int']
    }
  },
  return: {
    type: 'return', 
    data: {
      label: 'Return',
      accepts: ['int', 'String', 'boolean'] // Updated dynamically by the IDE later
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
      accepts: ['int']
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

  getter: {
    type: 'getter',
    data: {
      label: 'Variable',
      type: 'int'
    }
  },

  // --- MATH & COMPARISON ---
  // Math nodes specifically output 'int' and accept 'int'
  'math-add': { type: 'math', data: { type: 'int', label: 'ADD', symbol: '+', operation: '+', accepts: ['int'] } },
  'math-sub': { type: 'math', data: { type: 'int', label: 'SUBTRACT', symbol: '-', operation: '-', accepts: ['int'] } },
  'math-mul': { type: 'math', data: { type: 'int', label: 'MULTIPLY', symbol: '*', operation: '*', accepts: ['int'] } },
  'math-div': { type: 'math', data: { type: 'int', label: 'DIVIDE', symbol: '/', operation: '/', accepts: ['int'] } },
  'math-mod': { type: 'math', data: { type: 'int', label: 'MODULO', symbol: '%', operation: '%', accepts: ['int'] } },
  
  // Comparison nodes output 'boolean' and accept 'int'
  'math-gt':  { type: 'math', data: { type: 'boolean', label: 'GREATER THAN', symbol: '>', operation: '>', accepts: ['int'] } },
  'math-lt':  { type: 'math', data: { type: 'boolean', label: 'LESS THAN', symbol: '<', operation: '<', accepts: ['int'] } },
  'math-lte': { type: 'math', data: { type: 'boolean', label: 'LESS OR EQUAL', symbol: '<=', operation: '<=', accepts: ['int'] } },
  'math-gte': { type: 'math', data: { type: 'boolean', label: 'GREATER OR EQUAL', symbol: '>=', operation: '>=', accepts: ['int'] } },
  'math-eq':  { type: 'math', data: { type: 'boolean', label: 'EQUALS', symbol: '==', operation: '==', accepts: ['int', 'String', 'boolean'] } },
  'math-neq': { type: 'math', data: { type: 'boolean', label: 'NOT EQUALS', symbol: '!=', operation: '!=', accepts: ['int', 'String', 'boolean'] } },
  
  // Logical nodes output 'boolean' and accept 'boolean'
  'math-and': { type: 'math', data: { type: 'boolean', label: 'AND', symbol: '&&', operation: '&&', accepts: ['boolean'] } },
  'math-or':  { type: 'math', data: { type: 'boolean', label: 'OR', symbol: '||', operation: '||', accepts: ['boolean'] } },
  'math-not': { type: 'not', data: { type: 'boolean', label: 'NOT', symbol: '!', operation: '!', accepts: ['boolean'] } },
  
  // --- MATH FUNCTIONS ---
  'math-abs': { type: 'mathFunc', data: { type: 'int', label: 'ABS', operation: 'abs', accepts: ['int'] } },
  'math-min': { type: 'mathFunc', data: { type: 'int', label: 'MIN', operation: 'min', accepts: ['int'] } },
  'math-max': { type: 'mathFunc', data: { type: 'int', label: 'MAX', operation: 'max', accepts: ['int'] } },
  'math-pow': { type: 'mathFunc', data: { type: 'int', label: 'POW', operation: 'pow', accepts: ['int'] } },

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
  'array-access': { type: 'arrayOp', data: { label: 'Array Access', operation: 'access' } },
  'array-length': { type: 'arrayOp', data: { label: 'Array Length', operation: 'length' } },

  // --- VARIABLES ---
  int: { 
    type: 'java', 
    data: { type: 'int', value: '0', label: 'NewInt' } 
  },
  String: { 
    type: 'java', 
    data: { type: 'String', value: '', label: 'NewString' } 
  },
  boolean: { 
    type: 'java', 
    data: { type: 'boolean', value: 'true', label: 'NewBool' } 
  },
};