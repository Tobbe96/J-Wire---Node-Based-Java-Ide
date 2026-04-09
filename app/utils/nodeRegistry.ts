export const NODE_CATEGORIES = {
  Variables: ['int', 'String', 'boolean'],
  Logic: ['main', 'method', 'callMethod', 'branch', 'while', 'for', 'setVar', 'setLocalVar', 'print', 'return'],
  Math: ['math-add', 'math-sub', 'math-mul', 'math-div', 'math-gt', 'math-eq', 'math-and', 'math-or', 'math-not'],
  Strings: ['string-concat', 'string-length', 'string-substring']
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
  
  // Comparison nodes output 'boolean' and accept 'int'
  'math-gt':  { type: 'math', data: { type: 'boolean', label: 'GREATER THAN', symbol: '>', operation: '>', accepts: ['int'] } },
  'math-eq':  { type: 'math', data: { type: 'boolean', label: 'EQUALS', symbol: '==', operation: '==', accepts: ['int', 'String', 'boolean'] } },
  
  // Logical nodes output 'boolean' and accept 'boolean'
  'math-and': { type: 'math', data: { type: 'boolean', label: 'AND', symbol: '&&', operation: '&&', accepts: ['boolean'] } },
  'math-or':  { type: 'math', data: { type: 'boolean', label: 'OR', symbol: '||', operation: '||', accepts: ['boolean'] } },
  'math-not': { type: 'not', data: { type: 'boolean', label: 'NOT', symbol: '!', operation: '!', accepts: ['boolean'] } },
  
  // --- STRING OPERATIONS ---
  'string-concat': { type: 'stringOp', data: { label: 'STRING: Concat', operation: 'concat' } },
  'string-length': { type: 'stringOp', data: { label: 'STRING: Length', operation: 'length' } },
  'string-substring': { type: 'stringOp', data: { label: 'STRING: Substring', operation: 'substring' } },

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