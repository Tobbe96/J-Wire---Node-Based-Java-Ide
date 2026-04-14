import { ALL_NUMERIC, ALL_TYPES } from './theme';

export type FlatCategory = string[];
export type GroupedCategory = Record<string, string[]>;
export type CategoryContent = FlatCategory | GroupedCategory;

export function isGrouped(content: CategoryContent): content is GroupedCategory {
  return !Array.isArray(content);
}

export const NODE_CATEGORIES: Record<string, CategoryContent> = {
  Variables: ['int', 'float', 'double', 'long', 'short', 'byte', 'char', 'String', 'boolean'],
  Logic: {
    'Class': ['main', 'method', 'constructor', 'superConstructorCall'],
    'Calls': ['callMethod', 'callStaticMethod', 'callInstanceMethod', 'newObject'],
    'Control Flow': ['branch', 'switch', 'tryCatchFinally', 'throw', 'break', 'continue', 'assert'],
    'Loops': ['while', 'for', 'doWhile', 'forEach'],
    'Assignment': ['setVar', 'setLocalVar', 'increment', 'compoundAssign', 'print', 'return'],
  },
  Math: {
    'Arithmetic': ['math-add', 'math-sub', 'math-mul', 'math-div', 'math-mod'],
    'Comparison': ['math-gt', 'math-lt', 'math-lte', 'math-gte', 'math-eq', 'math-neq'],
    'Logic': ['math-and', 'math-or', 'math-not'],
    'Bitwise': ['math-bitand', 'math-bitor', 'math-bitxor', 'math-bitnot', 'math-shl', 'math-shr'],
  },
  'Math Functions': {
    'Basic': ['math-abs', 'math-min', 'math-max', 'math-round', 'math-ceil', 'math-floor'],
    'Power & Log': ['math-pow', 'math-sqrt', 'math-log', 'math-log10', 'math-random'],
    'Trig': ['math-sin', 'math-cos', 'math-tan', 'math-asin', 'math-acos', 'math-atan'],
  },
  Conversion: ['cast', 'ternary', 'literal', 'instanceOf'],
  Strings: {
    'Basic': ['string-concat', 'string-length', 'stringFormat'],
    'Access': ['string-substring', 'string-charAt', 'string-indexOf', 'string-split'],
    'Search': ['string-contains', 'string-startsWith', 'string-endsWith', 'string-equalsIgnoreCase', 'string-matches', 'string-isEmpty', 'string-compareTo'],
    'Transform': ['string-replace', 'string-trim', 'string-toUpperCase', 'string-toLowerCase', 'string-replaceAll'],
  },
  Arrays: ['array-literal', 'array-new', 'array-access', 'array-set', 'array-length', 'forEach', 'arrays-sort', 'arrays-fill', 'arrays-copyOf', 'arrays-equals', 'arrays-toString'],
  Collections: {
    'ArrayList': ['arrayList-create', 'arrayList-add', 'arrayList-get', 'arrayList-set', 'arrayList-remove', 'arrayList-size', 'arrayList-contains', 'arrayList-clear', 'arrayList-sort', 'arrayList-reverse', 'arrayList-indexOf', 'arrayList-lastIndexOf', 'arrayList-shuffle'],
    'HashSet': ['hashSet-create', 'hashSet-add', 'hashSet-remove', 'hashSet-contains', 'hashSet-size', 'hashSet-clear'],
    'HashMap': ['hashMap-create', 'hashMap-put', 'hashMap-get', 'hashMap-remove', 'hashMap-containsKey', 'hashMap-size', 'hashMap-keySet', 'hashMap-getOrDefault', 'hashMap-values', 'hashMap-entrySet'],
    'Stack': ['stack-create', 'stack-push', 'stack-pop', 'stack-peek', 'stack-isEmpty', 'stack-size'],
    'Queue': ['queue-create', 'queue-offer', 'queue-poll', 'queue-peek', 'queue-isEmpty', 'queue-size'],
    'Deque': ['deque-create', 'deque-offerFirst', 'deque-offerLast', 'deque-pollFirst', 'deque-pollLast', 'deque-peekFirst', 'deque-peekLast', 'deque-isEmpty', 'deque-size'],
    'PriorityQueue': ['pq-create', 'pq-add', 'pq-poll', 'pq-peek', 'pq-isEmpty', 'pq-size'],
    'Trees': [
      'treeNode-create', 'treeNode-getValue', 'treeNode-setValue', 'treeNode-getLeft', 'treeNode-setLeft', 'treeNode-getRight', 'treeNode-setRight', 'treeNode-isNull', 'treeNode-hasLeft', 'treeNode-hasRight',
      'bst-create', 'bst-insert', 'bst-delete', 'bst-search', 'bst-min', 'bst-max', 'bst-height', 'bst-size', 'bst-contains', 'bst-inorder', 'bst-preorder', 'bst-postorder',
      'avl-create', 'avl-insert', 'avl-delete', 'avl-search', 'avl-height', 'avl-size', 'avl-inorder',
    ],
  },
  Algorithms: {
    'Search': ['algo-binarySearch', 'algo-linearSearch'],
    'Sort': ['algo-bubbleSort', 'algo-quickSort', 'algo-mergeSort'],
    'Graph': ['algo-bfs', 'algo-dfs', 'algo-dijkstra', 'algo-bellmanFord'],
    'Tree': ['algo-inorderTraversal', 'algo-preorderTraversal', 'algo-postorderTraversal'],
  },
  GUI: {
    'Application': ['fx-app', 'fx-stage-create', 'fx-stage-setTitle', 'fx-stage-setScene', 'fx-stage-show', 'fx-stage-setWidth', 'fx-stage-setHeight', 'fx-stage-close', 'fx-scene-create'],
    'Layouts': ['fx-layout-vbox', 'fx-layout-hbox', 'fx-layout-gridpane', 'fx-layout-borderpane', 'fx-layout-stackpane', 'fx-layout-flowpane', 'fx-layout-anchorpane', 'fx-layout-scrollpane', 'fx-layout-addChild', 'fx-layout-setSpacing', 'fx-layout-setAlignment', 'fx-layout-setPadding'],
    'Controls': ['fx-control-button', 'fx-control-label', 'fx-control-textfield', 'fx-control-textarea', 'fx-control-checkbox', 'fx-control-radiobutton', 'fx-control-togglebutton', 'fx-control-hyperlink', 'fx-control-combobox', 'fx-control-slider', 'fx-control-progressbar', 'fx-control-passwordfield', 'fx-control-colorpicker', 'fx-control-datepicker', 'fx-control-spinner', 'fx-control-separator', 'fx-control-setText', 'fx-control-getText', 'fx-control-setPromptText', 'fx-control-setDisable', 'fx-control-setVisible', 'fx-control-setValue', 'fx-control-getValue', 'fx-control-setSelected', 'fx-control-isSelected'],
    'Events': ['fx-event-setOnAction', 'fx-event-setOnMouseClicked', 'fx-event-setOnMouseEntered', 'fx-event-setOnMouseExited', 'fx-event-setOnKeyPressed', 'fx-event-setOnKeyReleased', 'fx-event-addChangeListener'],
    'Styling': ['fx-style-setStyle', 'fx-style-setPrefWidth', 'fx-style-setPrefHeight', 'fx-style-setPrefSize', 'fx-style-setMinSize', 'fx-style-setMaxSize', 'fx-style-setFont', 'fx-style-setTextFill', 'fx-style-setBackground', 'fx-style-setOpacity', 'fx-style-setRotate', 'fx-style-setId', 'fx-style-getStyleClass'],
    'Dialogs': ['fx-dialog-alertInfo', 'fx-dialog-alertWarning', 'fx-dialog-alertError', 'fx-dialog-alertConfirm', 'fx-dialog-textInputDialog', 'fx-dialog-choiceDialog'],
    'Menus': ['fx-menu-createMenuBar', 'fx-menu-createMenu', 'fx-menu-createMenuItem', 'fx-menu-createCheckMenuItem', 'fx-menu-createSeparatorMenuItem', 'fx-menu-addMenu', 'fx-menu-addMenuItem', 'fx-menu-setOnAction'],
    'Tables': ['fx-table-create', 'fx-table-addColumn', 'fx-table-addRow', 'fx-table-setItems', 'fx-table-getSelectedItem', 'fx-table-setEditable', 'fx-table-setCellValueFactory'],
    'Lists': ['fx-list-create', 'fx-list-setItems', 'fx-list-addItem', 'fx-list-removeItem', 'fx-list-getSelectedItem', 'fx-list-setOrientation', 'fx-list-setCellFactory'],
    'Media': ['fx-media-createImageView', 'fx-media-setImage', 'fx-media-setFitWidth', 'fx-media-setFitHeight', 'fx-media-createMediaPlayer', 'fx-media-createMediaView', 'fx-media-play', 'fx-media-pause', 'fx-media-stop'],
    'Charts': ['fx-chart-createLineChart', 'fx-chart-createBarChart', 'fx-chart-createPieChart', 'fx-chart-createAreaChart', 'fx-chart-addSeries', 'fx-chart-addData', 'fx-chart-setTitle', 'fx-chart-setAxisLabels'],
    'Swing App': ['sw-app', 'sw-frame-setTitle', 'sw-frame-setSize', 'sw-frame-setDefaultCloseOperation', 'sw-frame-setVisible', 'sw-frame-setResizable', 'sw-frame-pack', 'sw-frame-setLocationRelativeTo'],
    'Swing Panels': ['sw-panel-create-flow', 'sw-panel-create-border', 'sw-panel-create-grid', 'sw-panel-create-box', 'sw-panel-add', 'sw-panel-setLayout', 'sw-panel-setBorder'],
    'Swing Controls': ['sw-control-jbutton', 'sw-control-jlabel', 'sw-control-jtextfield', 'sw-control-jtextarea', 'sw-control-jcheckbox', 'sw-control-jradiobutton', 'sw-control-jcombobox', 'sw-control-jslider', 'sw-control-jprogressbar', 'sw-control-jpasswordfield', 'sw-control-jspinner', 'sw-control-setText', 'sw-control-getText', 'sw-control-setEnabled', 'sw-control-setVisible', 'sw-control-setSelected', 'sw-control-isSelected'],
    'Swing Events': ['sw-event-addActionListener', 'sw-event-addMouseListener', 'sw-event-addKeyListener', 'sw-event-addChangeListener', 'sw-event-addItemListener'],
    'Swing Styling': ['sw-style-setFont', 'sw-style-setForeground', 'sw-style-setBackground', 'sw-style-setPreferredSize', 'sw-style-setBorder', 'sw-style-setToolTipText', 'sw-style-setOpaque'],
    'Swing Dialogs': ['sw-dialog-showMessageDialog', 'sw-dialog-showConfirmDialog', 'sw-dialog-showInputDialog', 'sw-dialog-showOptionDialog'],
    'Swing Menus': ['sw-menu-createMenuBar', 'sw-menu-createMenu', 'sw-menu-createMenuItem', 'sw-menu-createCheckBoxMenuItem', 'sw-menu-addSeparator', 'sw-menu-addMenu', 'sw-menu-addMenuItem'],
  },
  Input: ['scanner-nextLine', 'scanner-nextInt', 'scanner-nextFloat', 'scanner-nextDouble', 'scanner-nextLong', 'scanner-nextBoolean'],
  Utility: ['comment', 'customCode', 'enumConstants'],
};

export const CATEGORY_META: Record<string, { icon: string; color: string }> = {
  Variables:        { icon: '⬡', color: '#00eeff' },
  Logic:            { icon: '◈', color: '#a78bfa' },
  Math:             { icon: '±', color: '#a1ff00' },
  'Math Functions': { icon: 'ƒ', color: '#86efac' },
  Conversion:       { icon: '⇄', color: '#f9a8d4' },
  Strings:          { icon: '"', color: '#ff00d4' },
  Arrays:           { icon: '[]', color: '#38bdf8' },
  Collections:      { icon: '⊞', color: '#2dd4bf' },
  Algorithms:       { icon: '⚡', color: '#fb923c' },
  GUI:              { icon: '🖥️', color: '#ff6b00' },
  Input:            { icon: '↓', color: '#fbbf24' },
  Utility:          { icon: '⚙', color: '#94a3b8' },
};

export interface NodeConfig {
  type: string;
  data: Record<string, unknown>;
}

export const NODE_CONFIGS: Record<string, NodeConfig> = {
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
  callStaticMethod: {
    type: 'callStaticMethod',
    data: { label: 'Call Static', targetClass: '', methodName: '' }
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
      accepts: ALL_NUMERIC,
      comparison: '<',
      step: '1',
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
      label: 'Try / Catch / Finally',
      exceptionType: 'Exception',
      exceptionVarName: 'e',
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

  // --- BITWISE OPERATORS ---
  'math-bitand': { type: 'math', data: { type: 'int', label: 'BIT AND', symbol: '&', operation: '&', accepts: ALL_NUMERIC } },
  'math-bitor': { type: 'math', data: { type: 'int', label: 'BIT OR', symbol: '|', operation: '|', accepts: ALL_NUMERIC } },
  'math-bitxor': { type: 'math', data: { type: 'int', label: 'BIT XOR', symbol: '^', operation: '^', accepts: ALL_NUMERIC } },
  'math-bitnot': { type: 'not', data: { type: 'int', label: 'BIT NOT', symbol: '~', operation: '~', accepts: ALL_NUMERIC } },
  'math-shl': { type: 'math', data: { type: 'int', label: 'SHIFT LEFT', symbol: '<<', operation: '<<', accepts: ALL_NUMERIC } },
  'math-shr': { type: 'math', data: { type: 'int', label: 'SHIFT RIGHT', symbol: '>>', operation: '>>', accepts: ALL_NUMERIC } },
  
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
  'string-split': { type: 'stringOp', data: { label: 'STRING: Split', operation: 'split' } },
  'string-contains': { type: 'stringOp', data: { label: 'STRING: Contains', operation: 'contains' } },
  'string-startsWith': { type: 'stringOp', data: { label: 'STRING: StartsWith', operation: 'startsWith' } },
  'string-endsWith': { type: 'stringOp', data: { label: 'STRING: EndsWith', operation: 'endsWith' } },

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

  // --- CUSTOM CODE ---
  customCode: {
    type: 'customCode',
    data: {
      label: 'Custom Code',
      code: '',
      mode: 'statement',
      inputs: [],
      outputType: 'int',
    }
  },

  // --- CONSTRUCTOR ---
  constructor: {
    type: 'constructor',
    data: {
      label: 'Constructor',
      parameters: [],
      localVariables: [],
    }
  },

  // --- NEW OBJECT ---
  newObject: {
    type: 'newObject',
    data: {
      label: 'New Object',
      targetClass: '',
      constructorIndex: 0,
    }
  },

  // --- CALL INSTANCE METHOD ---
  callInstanceMethod: {
    type: 'callInstanceMethod',
    data: {
      label: 'Call Instance Method',
      methodName: '',
    }
  },

  superConstructorCall: {
    type: 'superConstructorCall',
    data: {
      label: 'Super Constructor',
      argCount: 0,
    }
  },

  enumConstants: {
    type: 'enumConstants',
    data: {
      label: 'Enum Constants',
      constants: [],
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
  'math-sin': { type: 'mathFunc', data: { type: 'double', label: 'SIN', operation: 'sin', accepts: ALL_NUMERIC } },
  'math-cos': { type: 'mathFunc', data: { type: 'double', label: 'COS', operation: 'cos', accepts: ALL_NUMERIC } },
  'math-tan': { type: 'mathFunc', data: { type: 'double', label: 'TAN', operation: 'tan', accepts: ALL_NUMERIC } },
  'math-asin': { type: 'mathFunc', data: { type: 'double', label: 'ASIN', operation: 'asin', accepts: ALL_NUMERIC } },
  'math-acos': { type: 'mathFunc', data: { type: 'double', label: 'ACOS', operation: 'acos', accepts: ALL_NUMERIC } },
  'math-atan': { type: 'mathFunc', data: { type: 'double', label: 'ATAN', operation: 'atan', accepts: ALL_NUMERIC } },

  // --- ARRAYLIST OPERATIONS ---
  'arrayList-create': { type: 'arrayListOp', data: { label: 'ArrayList: Create', operation: 'create', elementType: 'int', variableName: 'myList', initialValues: '' } },
  'arrayList-add': { type: 'arrayListOp', data: { label: 'ArrayList: Add', operation: 'add', elementType: 'int', variableName: 'myList' } },
  'arrayList-get': { type: 'arrayListOp', data: { label: 'ArrayList: Get', operation: 'get', elementType: 'int', variableName: 'myList' } },
  'arrayList-set': { type: 'arrayListOp', data: { label: 'ArrayList: Set', operation: 'set', elementType: 'int', variableName: 'myList' } },
  'arrayList-remove': { type: 'arrayListOp', data: { label: 'ArrayList: Remove', operation: 'remove', elementType: 'int', variableName: 'myList' } },
  'arrayList-size': { type: 'arrayListOp', data: { label: 'ArrayList: Size', operation: 'size', elementType: 'int', variableName: 'myList' } },
  'arrayList-contains': { type: 'arrayListOp', data: { label: 'ArrayList: Contains', operation: 'contains', elementType: 'int', variableName: 'myList' } },
  'arrayList-clear': { type: 'arrayListOp', data: { label: 'ArrayList: Clear', operation: 'clear', elementType: 'int', variableName: 'myList' } },
  'arrayList-sort': { type: 'arrayListOp', data: { label: 'ArrayList: Sort', operation: 'sort', elementType: 'int', variableName: 'myList' } },
  'arrayList-reverse': { type: 'arrayListOp', data: { label: 'ArrayList: Reverse', operation: 'reverse', elementType: 'int', variableName: 'myList' } },

  // --- HASHSET OPERATIONS ---
  'hashSet-create': { type: 'hashSetOp', data: { label: 'HashSet: Create', operation: 'create', elementType: 'int', variableName: 'mySet' } },
  'hashSet-add': { type: 'hashSetOp', data: { label: 'HashSet: Add', operation: 'add', elementType: 'int', variableName: 'mySet' } },
  'hashSet-remove': { type: 'hashSetOp', data: { label: 'HashSet: Remove', operation: 'remove', elementType: 'int', variableName: 'mySet' } },
  'hashSet-contains': { type: 'hashSetOp', data: { label: 'HashSet: Contains', operation: 'contains', elementType: 'int', variableName: 'mySet' } },
  'hashSet-size': { type: 'hashSetOp', data: { label: 'HashSet: Size', operation: 'size', elementType: 'int', variableName: 'mySet' } },
  'hashSet-clear': { type: 'hashSetOp', data: { label: 'HashSet: Clear', operation: 'clear', elementType: 'int', variableName: 'mySet' } },

  // --- HASHMAP OPERATIONS ---
  'hashMap-create': { type: 'hashMapOp', data: { label: 'HashMap: Create', operation: 'create', keyType: 'String', valueType: 'int', variableName: 'myMap' } },
  'hashMap-put': { type: 'hashMapOp', data: { label: 'HashMap: Put', operation: 'put', keyType: 'String', valueType: 'int', variableName: 'myMap' } },
  'hashMap-get': { type: 'hashMapOp', data: { label: 'HashMap: Get', operation: 'get', keyType: 'String', valueType: 'int', variableName: 'myMap' } },
  'hashMap-remove': { type: 'hashMapOp', data: { label: 'HashMap: Remove', operation: 'remove', keyType: 'String', valueType: 'int', variableName: 'myMap' } },
  'hashMap-containsKey': { type: 'hashMapOp', data: { label: 'HashMap: ContainsKey', operation: 'containsKey', keyType: 'String', valueType: 'int', variableName: 'myMap' } },
  'hashMap-size': { type: 'hashMapOp', data: { label: 'HashMap: Size', operation: 'size', keyType: 'String', valueType: 'int', variableName: 'myMap' } },
  'hashMap-keySet': { type: 'hashMapOp', data: { label: 'HashMap: KeySet', operation: 'keySet', keyType: 'String', valueType: 'int', variableName: 'myMap' } },

  // --- STACK OPERATIONS ---
  'stack-create':  { type: 'stackOp', data: { label: 'Stack: Create',  operation: 'create',  elementType: 'int', variableName: 'myStack' } },
  'stack-push':    { type: 'stackOp', data: { label: 'Stack: Push',    operation: 'push',    elementType: 'int', variableName: 'myStack' } },
  'stack-pop':     { type: 'stackOp', data: { label: 'Stack: Pop',     operation: 'pop',     elementType: 'int', variableName: 'myStack' } },
  'stack-peek':    { type: 'stackOp', data: { label: 'Stack: Peek',    operation: 'peek',    elementType: 'int', variableName: 'myStack' } },
  'stack-isEmpty': { type: 'stackOp', data: { label: 'Stack: IsEmpty', operation: 'isEmpty', elementType: 'int', variableName: 'myStack' } },
  'stack-size':    { type: 'stackOp', data: { label: 'Stack: Size',    operation: 'size',    elementType: 'int', variableName: 'myStack' } },

  // --- QUEUE OPERATIONS ---
  'queue-create':  { type: 'queueOp', data: { label: 'Queue: Create',  operation: 'create',  elementType: 'int', variableName: 'myQueue' } },
  'queue-offer':   { type: 'queueOp', data: { label: 'Queue: Offer',   operation: 'offer',   elementType: 'int', variableName: 'myQueue' } },
  'queue-poll':    { type: 'queueOp', data: { label: 'Queue: Poll',    operation: 'poll',    elementType: 'int', variableName: 'myQueue' } },
  'queue-peek':    { type: 'queueOp', data: { label: 'Queue: Peek',    operation: 'peek',    elementType: 'int', variableName: 'myQueue' } },
  'queue-isEmpty': { type: 'queueOp', data: { label: 'Queue: IsEmpty', operation: 'isEmpty', elementType: 'int', variableName: 'myQueue' } },
  'queue-size':    { type: 'queueOp', data: { label: 'Queue: Size',    operation: 'size',    elementType: 'int', variableName: 'myQueue' } },

  // --- DEQUE OPERATIONS ---
  'deque-create':     { type: 'dequeOp', data: { label: 'Deque: Create',     operation: 'create',     elementType: 'int', variableName: 'myDeque' } },
  'deque-offerFirst': { type: 'dequeOp', data: { label: 'Deque: OfferFirst', operation: 'offerFirst', elementType: 'int', variableName: 'myDeque' } },
  'deque-offerLast':  { type: 'dequeOp', data: { label: 'Deque: OfferLast',  operation: 'offerLast',  elementType: 'int', variableName: 'myDeque' } },
  'deque-pollFirst':  { type: 'dequeOp', data: { label: 'Deque: PollFirst',  operation: 'pollFirst',  elementType: 'int', variableName: 'myDeque' } },
  'deque-pollLast':   { type: 'dequeOp', data: { label: 'Deque: PollLast',   operation: 'pollLast',   elementType: 'int', variableName: 'myDeque' } },
  'deque-peekFirst':  { type: 'dequeOp', data: { label: 'Deque: PeekFirst',  operation: 'peekFirst',  elementType: 'int', variableName: 'myDeque' } },
  'deque-peekLast':   { type: 'dequeOp', data: { label: 'Deque: PeekLast',   operation: 'peekLast',   elementType: 'int', variableName: 'myDeque' } },
  'deque-isEmpty':    { type: 'dequeOp', data: { label: 'Deque: IsEmpty',    operation: 'isEmpty',    elementType: 'int', variableName: 'myDeque' } },
  'deque-size':       { type: 'dequeOp', data: { label: 'Deque: Size',       operation: 'size',       elementType: 'int', variableName: 'myDeque' } },

  // --- PRIORITY QUEUE OPERATIONS ---
  'pq-create':  { type: 'priorityQueueOp', data: { label: 'PQueue: Create',  operation: 'create',  elementType: 'int', variableName: 'myPQ' } },
  'pq-add':     { type: 'priorityQueueOp', data: { label: 'PQueue: Add',     operation: 'add',     elementType: 'int', variableName: 'myPQ' } },
  'pq-poll':    { type: 'priorityQueueOp', data: { label: 'PQueue: Poll',    operation: 'poll',    elementType: 'int', variableName: 'myPQ' } },
  'pq-peek':    { type: 'priorityQueueOp', data: { label: 'PQueue: Peek',    operation: 'peek',    elementType: 'int', variableName: 'myPQ' } },
  'pq-isEmpty': { type: 'priorityQueueOp', data: { label: 'PQueue: IsEmpty', operation: 'isEmpty', elementType: 'int', variableName: 'myPQ' } },
  'pq-size':    { type: 'priorityQueueOp', data: { label: 'PQueue: Size',    operation: 'size',    elementType: 'int', variableName: 'myPQ' } },

  // --- ALGORITHM NODES ---
  'algo-binarySearch':  { type: 'algorithm', data: { label: 'Binary Search',   operation: 'binarySearch'  } },
  'algo-linearSearch':  { type: 'algorithm', data: { label: 'Linear Search',   operation: 'linearSearch'  } },
  'algo-bubbleSort':    { type: 'algorithm', data: { label: 'Bubble Sort',      operation: 'bubbleSort'    } },
  'algo-quickSort':     { type: 'algorithm', data: { label: 'Quick Sort',       operation: 'quickSort'     } },
  'algo-mergeSort':     { type: 'algorithm', data: { label: 'Merge Sort',       operation: 'mergeSort'     } },
  'algo-bfs':           { type: 'algorithm', data: { label: 'BFS',              operation: 'bfs'           } },
  'algo-dfs':           { type: 'algorithm', data: { label: 'DFS',              operation: 'dfs'           } },

  // --- EXTENDED STRING OPERATIONS ---
  'string-equalsIgnoreCase': { type: 'stringOp', data: { label: 'STRING: EqualsIgnoreCase', operation: 'equalsIgnoreCase' } },
  'string-matches': { type: 'stringOp', data: { label: 'STRING: Matches', operation: 'matches' } },
  'string-replaceAll': { type: 'stringOp', data: { label: 'STRING: ReplaceAll', operation: 'replaceAll' } },
  'string-isEmpty': { type: 'stringOp', data: { label: 'STRING: IsEmpty', operation: 'isEmpty' } },
  'string-compareTo': { type: 'stringOp', data: { label: 'STRING: CompareTo', operation: 'compareTo' } },

  // --- EXTENDED ARRAYLIST OPERATIONS ---
  'arrayList-indexOf': { type: 'arrayListOp', data: { label: 'ArrayList: IndexOf', operation: 'indexOf', elementType: 'int', variableName: 'myList' } },
  'arrayList-lastIndexOf': { type: 'arrayListOp', data: { label: 'ArrayList: LastIndexOf', operation: 'lastIndexOf', elementType: 'int', variableName: 'myList' } },
  'arrayList-shuffle': { type: 'arrayListOp', data: { label: 'ArrayList: Shuffle', operation: 'shuffle', elementType: 'int', variableName: 'myList' } },

  // --- EXTENDED HASHMAP OPERATIONS ---
  'hashMap-getOrDefault': { type: 'hashMapOp', data: { label: 'HashMap: GetOrDefault', operation: 'getOrDefault', keyType: 'String', valueType: 'int', variableName: 'myMap' } },
  'hashMap-values': { type: 'hashMapOp', data: { label: 'HashMap: Values', operation: 'values', keyType: 'String', valueType: 'int', variableName: 'myMap' } },
  'hashMap-entrySet': { type: 'hashMapOp', data: { label: 'HashMap: EntrySet', operation: 'entrySet', keyType: 'String', valueType: 'int', variableName: 'myMap' } },

  // --- INSTANCEOF NODE ---
  instanceOf: { type: 'instanceOf', data: { label: 'instanceOf', typeName: 'String' } },

  // --- ASSERT NODE ---
  assert: { type: 'assert', data: { label: 'Assert' } },

  // --- ARRAYS UTILITY NODES ---
  'arrays-sort': { type: 'arraysUtil', data: { label: 'Arrays.sort', operation: 'sort' } },
  'arrays-fill': { type: 'arraysUtil', data: { label: 'Arrays.fill', operation: 'fill' } },
  'arrays-copyOf': { type: 'arraysUtil', data: { label: 'Arrays.copyOf', operation: 'copyOf' } },
  'arrays-equals': { type: 'arraysUtil', data: { label: 'Arrays.equals', operation: 'equals' } },
  'arrays-toString': { type: 'arraysUtil', data: { label: 'Arrays.toString', operation: 'toString' } },

  // --- TREE NODE OPERATIONS ---
  'treeNode-create':   { type: 'treeNodeOp', data: { label: 'TreeNode: Create',    operation: 'create',   valueType: 'int', variableName: 'node' } },
  'treeNode-getValue': { type: 'treeNodeOp', data: { label: 'TreeNode: Get Value', operation: 'getValue', valueType: 'int', variableName: 'node' } },
  'treeNode-setValue': { type: 'treeNodeOp', data: { label: 'TreeNode: Set Value', operation: 'setValue', valueType: 'int', variableName: 'node' } },
  'treeNode-getLeft':  { type: 'treeNodeOp', data: { label: 'TreeNode: Get Left',  operation: 'getLeft',  valueType: 'int', variableName: 'node' } },
  'treeNode-setLeft':  { type: 'treeNodeOp', data: { label: 'TreeNode: Set Left',  operation: 'setLeft',  valueType: 'int', variableName: 'node' } },
  'treeNode-getRight': { type: 'treeNodeOp', data: { label: 'TreeNode: Get Right', operation: 'getRight', valueType: 'int', variableName: 'node' } },
  'treeNode-setRight': { type: 'treeNodeOp', data: { label: 'TreeNode: Set Right', operation: 'setRight', valueType: 'int', variableName: 'node' } },
  'treeNode-isNull':   { type: 'treeNodeOp', data: { label: 'TreeNode: Is Null',   operation: 'isNull',   valueType: 'int', variableName: 'node' } },
  'treeNode-hasLeft':  { type: 'treeNodeOp', data: { label: 'TreeNode: Has Left',  operation: 'hasLeft',  valueType: 'int', variableName: 'node' } },
  'treeNode-hasRight': { type: 'treeNodeOp', data: { label: 'TreeNode: Has Right', operation: 'hasRight', valueType: 'int', variableName: 'node' } },

  // --- BST OPERATIONS ---
  'bst-create':    { type: 'bstOp', data: { label: 'BST: Create',    operation: 'create',    valueType: 'int', variableName: 'bstRoot' } },
  'bst-insert':    { type: 'bstOp', data: { label: 'BST: Insert',    operation: 'insert',    valueType: 'int', variableName: 'bstRoot' } },
  'bst-delete':    { type: 'bstOp', data: { label: 'BST: Delete',    operation: 'delete',    valueType: 'int', variableName: 'bstRoot' } },
  'bst-search':    { type: 'bstOp', data: { label: 'BST: Search',    operation: 'search',    valueType: 'int', variableName: 'bstRoot' } },
  'bst-min':       { type: 'bstOp', data: { label: 'BST: Min',       operation: 'min',       valueType: 'int', variableName: 'bstRoot' } },
  'bst-max':       { type: 'bstOp', data: { label: 'BST: Max',       operation: 'max',       valueType: 'int', variableName: 'bstRoot' } },
  'bst-height':    { type: 'bstOp', data: { label: 'BST: Height',    operation: 'height',    valueType: 'int', variableName: 'bstRoot' } },
  'bst-size':      { type: 'bstOp', data: { label: 'BST: Size',      operation: 'size',      valueType: 'int', variableName: 'bstRoot' } },
  'bst-contains':  { type: 'bstOp', data: { label: 'BST: Contains',  operation: 'contains',  valueType: 'int', variableName: 'bstRoot' } },
  'bst-inorder':   { type: 'bstOp', data: { label: 'BST: Inorder',   operation: 'inorder',   valueType: 'int', variableName: 'bstRoot' } },
  'bst-preorder':  { type: 'bstOp', data: { label: 'BST: Preorder',  operation: 'preorder',  valueType: 'int', variableName: 'bstRoot' } },
  'bst-postorder': { type: 'bstOp', data: { label: 'BST: Postorder', operation: 'postorder', valueType: 'int', variableName: 'bstRoot' } },

  // --- AVL TREE OPERATIONS ---
  'avl-create':  { type: 'avlTreeOp', data: { label: 'AVL: Create',  operation: 'create',  valueType: 'int', variableName: 'avlRoot' } },
  'avl-insert':  { type: 'avlTreeOp', data: { label: 'AVL: Insert',  operation: 'insert',  valueType: 'int', variableName: 'avlRoot' } },
  'avl-delete':  { type: 'avlTreeOp', data: { label: 'AVL: Delete',  operation: 'delete',  valueType: 'int', variableName: 'avlRoot' } },
  'avl-search':  { type: 'avlTreeOp', data: { label: 'AVL: Search',  operation: 'search',  valueType: 'int', variableName: 'avlRoot' } },
  'avl-height':  { type: 'avlTreeOp', data: { label: 'AVL: Height',  operation: 'height',  valueType: 'int', variableName: 'avlRoot' } },
  'avl-size':    { type: 'avlTreeOp', data: { label: 'AVL: Size',    operation: 'size',    valueType: 'int', variableName: 'avlRoot' } },
  'avl-inorder': { type: 'avlTreeOp', data: { label: 'AVL: Inorder', operation: 'inorder', valueType: 'int', variableName: 'avlRoot' } },

  // --- JAVAFX APPLICATION ---
  'fx-app': { type: 'javafxApp', data: { label: 'JavaFX Application' } },

  // --- JAVAFX STAGE ---
  'fx-stage-create':       { type: 'javafxStageOp', data: { label: 'Stage: Create',       operation: 'create',       variableName: 'stage' } },
  'fx-stage-setTitle':     { type: 'javafxStageOp', data: { label: 'Stage: Set Title',    operation: 'setTitle',     variableName: 'primaryStage' } },
  'fx-stage-setScene':     { type: 'javafxStageOp', data: { label: 'Stage: Set Scene',    operation: 'setScene',     variableName: 'primaryStage' } },
  'fx-stage-show':         { type: 'javafxStageOp', data: { label: 'Stage: Show',         operation: 'show',         variableName: 'primaryStage' } },
  'fx-stage-setWidth':     { type: 'javafxStageOp', data: { label: 'Stage: Set Width',    operation: 'setWidth',     variableName: 'primaryStage' } },
  'fx-stage-setHeight':    { type: 'javafxStageOp', data: { label: 'Stage: Set Height',   operation: 'setHeight',    variableName: 'primaryStage' } },
  'fx-stage-setResizable': { type: 'javafxStageOp', data: { label: 'Stage: Set Resizable', operation: 'setResizable', variableName: 'primaryStage' } },
  'fx-stage-close':        { type: 'javafxStageOp', data: { label: 'Stage: Close',        operation: 'close',        variableName: 'primaryStage' } },

  // --- JAVAFX SCENE ---
  'fx-scene-create': { type: 'javafxSceneOp', data: { label: 'Scene: Create', operation: 'create', variableName: 'scene' } },

  // --- JAVAFX LAYOUTS ---
  'fx-layout-vbox':         { type: 'javafxLayoutOp', data: { label: 'VBox: Create',       operation: 'create', layoutType: 'VBox',       variableName: 'vbox' } },
  'fx-layout-hbox':         { type: 'javafxLayoutOp', data: { label: 'HBox: Create',       operation: 'create', layoutType: 'HBox',       variableName: 'hbox' } },
  'fx-layout-gridpane':     { type: 'javafxLayoutOp', data: { label: 'GridPane: Create',   operation: 'create', layoutType: 'GridPane',   variableName: 'gridPane' } },
  'fx-layout-borderpane':   { type: 'javafxLayoutOp', data: { label: 'BorderPane: Create', operation: 'create', layoutType: 'BorderPane', variableName: 'borderPane' } },
  'fx-layout-stackpane':    { type: 'javafxLayoutOp', data: { label: 'StackPane: Create',  operation: 'create', layoutType: 'StackPane',  variableName: 'stackPane' } },
  'fx-layout-flowpane':     { type: 'javafxLayoutOp', data: { label: 'FlowPane: Create',   operation: 'create', layoutType: 'FlowPane',   variableName: 'flowPane' } },
  'fx-layout-anchorpane':   { type: 'javafxLayoutOp', data: { label: 'AnchorPane: Create', operation: 'create', layoutType: 'AnchorPane', variableName: 'anchorPane' } },
  'fx-layout-scrollpane':   { type: 'javafxLayoutOp', data: { label: 'ScrollPane: Create', operation: 'create', layoutType: 'ScrollPane', variableName: 'scrollPane' } },
  'fx-layout-addChild':     { type: 'javafxLayoutOp', data: { label: 'Layout: Add Child',      operation: 'addChild',     layoutType: 'VBox', variableName: 'vbox' } },
  'fx-layout-setSpacing':   { type: 'javafxLayoutOp', data: { label: 'Layout: Set Spacing',    operation: 'setSpacing',   layoutType: 'VBox', variableName: 'vbox' } },
  'fx-layout-setAlignment': { type: 'javafxLayoutOp', data: { label: 'Layout: Set Alignment',  operation: 'setAlignment', layoutType: 'VBox', variableName: 'vbox' } },
  'fx-layout-setPadding':   { type: 'javafxLayoutOp', data: { label: 'Layout: Set Padding',    operation: 'setPadding',   layoutType: 'VBox', variableName: 'vbox' } },

  // --- JAVAFX CONTROLS ---
  'fx-control-button':       { type: 'javafxControlOp', data: { label: 'Button: Create',       operation: 'create', controlType: 'Button',       variableName: 'btn' } },
  'fx-control-label':        { type: 'javafxControlOp', data: { label: 'Label: Create',        operation: 'create', controlType: 'Label',        variableName: 'lbl' } },
  'fx-control-textfield':    { type: 'javafxControlOp', data: { label: 'TextField: Create',    operation: 'create', controlType: 'TextField',    variableName: 'tf' } },
  'fx-control-textarea':     { type: 'javafxControlOp', data: { label: 'TextArea: Create',     operation: 'create', controlType: 'TextArea',     variableName: 'ta' } },
  'fx-control-checkbox':     { type: 'javafxControlOp', data: { label: 'CheckBox: Create',     operation: 'create', controlType: 'CheckBox',     variableName: 'cb' } },
  'fx-control-radiobutton':  { type: 'javafxControlOp', data: { label: 'RadioButton: Create',  operation: 'create', controlType: 'RadioButton',  variableName: 'rb' } },
  'fx-control-combobox':     { type: 'javafxControlOp', data: { label: 'ComboBox: Create',     operation: 'create', controlType: 'ComboBox',     variableName: 'combo' } },
  'fx-control-slider':       { type: 'javafxControlOp', data: { label: 'Slider: Create',       operation: 'create', controlType: 'Slider',       variableName: 'slider' } },
  'fx-control-progressbar':  { type: 'javafxControlOp', data: { label: 'ProgressBar: Create',  operation: 'create', controlType: 'ProgressBar',  variableName: 'pb' } },
  'fx-control-passwordfield':{ type: 'javafxControlOp', data: { label: 'PasswordField: Create', operation: 'create', controlType: 'PasswordField', variableName: 'pf' } },
  'fx-control-colorpicker':  { type: 'javafxControlOp', data: { label: 'ColorPicker: Create',  operation: 'create', controlType: 'ColorPicker',  variableName: 'cp' } },
  'fx-control-datepicker':   { type: 'javafxControlOp', data: { label: 'DatePicker: Create',   operation: 'create', controlType: 'DatePicker',   variableName: 'dp' } },
  'fx-control-spinner':      { type: 'javafxControlOp', data: { label: 'Spinner: Create',      operation: 'create', controlType: 'Spinner',      variableName: 'spinner' } },
  'fx-control-separator':    { type: 'javafxControlOp', data: { label: 'Separator: Create',    operation: 'create', controlType: 'Separator',    variableName: 'sep' } },
  'fx-control-togglebutton': { type: 'javafxControlOp', data: { label: 'ToggleButton: Create', operation: 'create', controlType: 'ToggleButton', variableName: 'toggleBtn' } },
  'fx-control-hyperlink':    { type: 'javafxControlOp', data: { label: 'Hyperlink: Create',    operation: 'create', controlType: 'Hyperlink',    variableName: 'link' } },
  'fx-control-setText':      { type: 'javafxControlOp', data: { label: 'Control: Set Text',    operation: 'setText',    controlType: 'Button',    variableName: 'btn' } },
  'fx-control-getText':      { type: 'javafxControlOp', data: { label: 'Control: Get Text',    operation: 'getText',    controlType: 'TextField', variableName: 'tf' } },
  'fx-control-setPromptText':{ type: 'javafxControlOp', data: { label: 'Control: Set Prompt',  operation: 'setPromptText', controlType: 'TextField', variableName: 'tf' } },
  'fx-control-setDisable':   { type: 'javafxControlOp', data: { label: 'Control: Set Disable', operation: 'setDisable', controlType: 'Button',    variableName: 'btn' } },
  'fx-control-setVisible':   { type: 'javafxControlOp', data: { label: 'Control: Set Visible', operation: 'setVisible', controlType: 'Button',    variableName: 'btn' } },
  'fx-control-setValue':     { type: 'javafxControlOp', data: { label: 'Control: Set Value',   operation: 'setValue',   controlType: 'Slider',    variableName: 'slider' } },
  'fx-control-getValue':     { type: 'javafxControlOp', data: { label: 'Control: Get Value',   operation: 'getValue',   controlType: 'Slider',    variableName: 'slider' } },
  'fx-control-setSelected':  { type: 'javafxControlOp', data: { label: 'Control: Set Selected', operation: 'setSelected', controlType: 'CheckBox', variableName: 'cb' } },
  'fx-control-isSelected':   { type: 'javafxControlOp', data: { label: 'Control: Is Selected',  operation: 'isSelected',  controlType: 'CheckBox', variableName: 'cb' } },

  // --- JAVAFX EVENTS ---
  'fx-event-setOnAction':       { type: 'javafxEventOp', data: { label: 'Event: setOnAction',       operation: 'setOnAction',       variableName: 'btn' } },
  'fx-event-setOnMouseClicked': { type: 'javafxEventOp', data: { label: 'Event: setOnMouseClicked', operation: 'setOnMouseClicked', variableName: 'node' } },
  'fx-event-setOnMouseEntered': { type: 'javafxEventOp', data: { label: 'Event: setOnMouseEntered', operation: 'setOnMouseEntered', variableName: 'node' } },
  'fx-event-setOnMouseExited':  { type: 'javafxEventOp', data: { label: 'Event: setOnMouseExited',  operation: 'setOnMouseExited',  variableName: 'node' } },
  'fx-event-setOnKeyPressed':   { type: 'javafxEventOp', data: { label: 'Event: setOnKeyPressed',   operation: 'setOnKeyPressed',   variableName: 'node' } },
  'fx-event-setOnKeyReleased':  { type: 'javafxEventOp', data: { label: 'Event: setOnKeyReleased',  operation: 'setOnKeyReleased',  variableName: 'node' } },
  'fx-event-addChangeListener': { type: 'javafxEventOp', data: { label: 'Event: addChangeListener', operation: 'addChangeListener', variableName: 'node' } },

  // --- JAVAFX STYLING ---
  'fx-style-setStyle':      { type: 'javafxStyleOp', data: { label: 'Style: setStyle',      operation: 'setStyle',      variableName: 'node' } },
  'fx-style-setPrefWidth':  { type: 'javafxStyleOp', data: { label: 'Style: setPrefWidth',  operation: 'setPrefWidth',  variableName: 'node' } },
  'fx-style-setPrefHeight': { type: 'javafxStyleOp', data: { label: 'Style: setPrefHeight', operation: 'setPrefHeight', variableName: 'node' } },
  'fx-style-setPrefSize':   { type: 'javafxStyleOp', data: { label: 'Style: setPrefSize',   operation: 'setPrefSize',   variableName: 'node' } },
  'fx-style-setFont':       { type: 'javafxStyleOp', data: { label: 'Style: setFont',       operation: 'setFont',       variableName: 'node' } },
  'fx-style-setTextFill':   { type: 'javafxStyleOp', data: { label: 'Style: setTextFill',   operation: 'setTextFill',   variableName: 'node' } },
  'fx-style-setBackground': { type: 'javafxStyleOp', data: { label: 'Style: setBackground', operation: 'setBackground', variableName: 'node' } },
  'fx-style-setOpacity':    { type: 'javafxStyleOp', data: { label: 'Style: setOpacity',    operation: 'setOpacity',    variableName: 'node' } },
  'fx-style-setRotate':     { type: 'javafxStyleOp', data: { label: 'Style: setRotate',     operation: 'setRotate',     variableName: 'node' } },
  'fx-style-setId':         { type: 'javafxStyleOp', data: { label: 'Style: setId',         operation: 'setId',         variableName: 'node' } },
  'fx-style-setMinSize':    { type: 'javafxStyleOp', data: { label: 'Style: setMinSize',    operation: 'setMinSize',    variableName: 'node' } },
  'fx-style-setMaxSize':    { type: 'javafxStyleOp', data: { label: 'Style: setMaxSize',    operation: 'setMaxSize',    variableName: 'node' } },
  'fx-style-getStyleClass': { type: 'javafxStyleOp', data: { label: 'Style: getStyleClass', operation: 'getStyleClass', variableName: 'node' } },

  // --- JAVAFX DIALOGS ---
  'fx-dialog-alertInfo':        { type: 'javafxDialogOp', data: { label: 'Dialog: Alert Info',      operation: 'alertInfo'       } },
  'fx-dialog-alertWarning':     { type: 'javafxDialogOp', data: { label: 'Dialog: Alert Warning',   operation: 'alertWarning'    } },
  'fx-dialog-alertError':       { type: 'javafxDialogOp', data: { label: 'Dialog: Alert Error',     operation: 'alertError'      } },
  'fx-dialog-alertConfirm':     { type: 'javafxDialogOp', data: { label: 'Dialog: Alert Confirm',   operation: 'alertConfirm'    } },
  'fx-dialog-textInputDialog':  { type: 'javafxDialogOp', data: { label: 'Dialog: Text Input',      operation: 'textInputDialog' } },
  'fx-dialog-choiceDialog':     { type: 'javafxDialogOp', data: { label: 'Dialog: Choice',          operation: 'choiceDialog'    } },

  // --- JAVAFX MENUS ---
  'fx-menu-createMenuBar':          { type: 'javafxMenuOp', data: { label: 'Menu: Create MenuBar',          operation: 'createMenuBar',          variableName: 'menuBar' } },
  'fx-menu-createMenu':             { type: 'javafxMenuOp', data: { label: 'Menu: Create Menu',             operation: 'createMenu',             variableName: 'menu' } },
  'fx-menu-createMenuItem':         { type: 'javafxMenuOp', data: { label: 'Menu: Create MenuItem',         operation: 'createMenuItem',         variableName: 'menuItem' } },
  'fx-menu-createCheckMenuItem':    { type: 'javafxMenuOp', data: { label: 'Menu: Create CheckMenuItem',    operation: 'createCheckMenuItem',    variableName: 'checkItem' } },
  'fx-menu-createSeparatorMenuItem':{ type: 'javafxMenuOp', data: { label: 'Menu: Create SeparatorMenuItem', operation: 'createSeparatorMenuItem', variableName: 'sep' } },
  'fx-menu-addMenu':                { type: 'javafxMenuOp', data: { label: 'Menu: Add Menu',                operation: 'addMenu',                variableName: 'menuBar' } },
  'fx-menu-addMenuItem':            { type: 'javafxMenuOp', data: { label: 'Menu: Add MenuItem',            operation: 'addMenuItem',            variableName: 'menu' } },
  'fx-menu-setOnAction':            { type: 'javafxMenuOp', data: { label: 'Menu: On Action',              operation: 'setOnAction',            variableName: 'menuItem' } },

  // --- JAVAFX TABLES ---
  'fx-table-create':          { type: 'javafxTableOp', data: { label: 'Table: Create',            operation: 'create',          variableName: 'table' } },
  'fx-table-addColumn':       { type: 'javafxTableOp', data: { label: 'Table: Add Column',        operation: 'addColumn',       variableName: 'table' } },
  'fx-table-addRow':          { type: 'javafxTableOp', data: { label: 'Table: Add Row',           operation: 'addRow',          variableName: 'table' } },
  'fx-table-setItems':        { type: 'javafxTableOp', data: { label: 'Table: Set Items',         operation: 'setItems',        variableName: 'table' } },
  'fx-table-getSelectedItem': { type: 'javafxTableOp', data: { label: 'Table: Get Selected Item', operation: 'getSelectedItem', variableName: 'table' } },
  'fx-table-setEditable':     { type: 'javafxTableOp', data: { label: 'Table: Set Editable',      operation: 'setEditable',         variableName: 'table' } },
  'fx-table-setCellValueFactory': { type: 'javafxTableOp', data: { label: 'Table: Cell Value Factory', operation: 'setCellValueFactory', variableName: 'table' } },

  // --- JAVAFX LISTS ---
  'fx-list-create':          { type: 'javafxListOp', data: { label: 'ListView: Create',         operation: 'create',          variableName: 'listView' } },
  'fx-list-setItems':        { type: 'javafxListOp', data: { label: 'ListView: Set Items',      operation: 'setItems',        variableName: 'listView' } },
  'fx-list-addItem':         { type: 'javafxListOp', data: { label: 'ListView: Add Item',       operation: 'addItem',         variableName: 'listView' } },
  'fx-list-removeItem':      { type: 'javafxListOp', data: { label: 'ListView: Remove Item',    operation: 'removeItem',      variableName: 'listView' } },
  'fx-list-getSelectedItem': { type: 'javafxListOp', data: { label: 'ListView: Get Selected',   operation: 'getSelectedItem', variableName: 'listView' } },
  'fx-list-setOrientation':  { type: 'javafxListOp', data: { label: 'ListView: Set Orientation', operation: 'setOrientation', variableName: 'listView' } },
  'fx-list-setCellFactory':  { type: 'javafxListOp', data: { label: 'ListView: Cell Factory',  operation: 'setCellFactory', variableName: 'listView' } },

  // --- JAVAFX MEDIA ---
  'fx-media-createImageView':   { type: 'javafxMediaOp', data: { label: 'Media: Create ImageView',   operation: 'createImageView',   variableName: 'imageView' } },
  'fx-media-setImage':          { type: 'javafxMediaOp', data: { label: 'Media: Set Image',          operation: 'setImage',          variableName: 'imageView' } },
  'fx-media-setFitWidth':       { type: 'javafxMediaOp', data: { label: 'Media: Set Fit Width',      operation: 'setFitWidth',       variableName: 'imageView' } },
  'fx-media-setFitHeight':      { type: 'javafxMediaOp', data: { label: 'Media: Set Fit Height',     operation: 'setFitHeight',      variableName: 'imageView' } },
  'fx-media-createMediaPlayer': { type: 'javafxMediaOp', data: { label: 'Media: Create MediaPlayer', operation: 'createMediaPlayer', variableName: 'player' } },
  'fx-media-createMediaView':   { type: 'javafxMediaOp', data: { label: 'Media: Create MediaView',   operation: 'createMediaView',   variableName: 'mediaView' } },
  'fx-media-play':              { type: 'javafxMediaOp', data: { label: 'Media: Play',               operation: 'play',              variableName: 'player' } },
  'fx-media-pause':             { type: 'javafxMediaOp', data: { label: 'Media: Pause',              operation: 'pause',             variableName: 'player' } },
  'fx-media-stop':              { type: 'javafxMediaOp', data: { label: 'Media: Stop',               operation: 'stop',              variableName: 'player' } },

  // --- JAVAFX CHARTS ---
  'fx-chart-createLineChart': { type: 'javafxChartOp', data: { label: 'Chart: Line Chart',  operation: 'createLineChart', variableName: 'lineChart' } },
  'fx-chart-createBarChart':  { type: 'javafxChartOp', data: { label: 'Chart: Bar Chart',   operation: 'createBarChart',  variableName: 'barChart' } },
  'fx-chart-createPieChart':  { type: 'javafxChartOp', data: { label: 'Chart: Pie Chart',   operation: 'createPieChart',  variableName: 'pieChart' } },
  'fx-chart-createAreaChart': { type: 'javafxChartOp', data: { label: 'Chart: Area Chart',  operation: 'createAreaChart', variableName: 'areaChart' } },
  'fx-chart-addSeries':       { type: 'javafxChartOp', data: { label: 'Chart: Add Series',  operation: 'addSeries',       variableName: 'chart' } },
  'fx-chart-addData':         { type: 'javafxChartOp', data: { label: 'Chart: Add Data',    operation: 'addData',         variableName: 'chart' } },
  'fx-chart-setTitle':        { type: 'javafxChartOp', data: { label: 'Chart: Set Title',      operation: 'setTitle',        variableName: 'chart' } },
  'fx-chart-setAxisLabels':   { type: 'javafxChartOp', data: { label: 'Chart: Set Axis Labels', operation: 'setAxisLabels',   variableName: 'chart' } },

  // ─── SWING APPLICATION ───
  'sw-app': { type: 'swingApp', data: { label: 'Swing Application' } },

  // ─── SWING FRAME ───
  'sw-frame-setTitle': { type: 'swingFrameOp', data: { label: 'JFrame: Set Title', operation: 'setTitle', variableName: 'this' } },
  'sw-frame-setSize': { type: 'swingFrameOp', data: { label: 'JFrame: Set Size', operation: 'setSize', variableName: 'this' } },
  'sw-frame-setDefaultCloseOperation': { type: 'swingFrameOp', data: { label: 'JFrame: Default Close', operation: 'setDefaultCloseOperation', variableName: 'this' } },
  'sw-frame-setVisible': { type: 'swingFrameOp', data: { label: 'JFrame: Set Visible', operation: 'setVisible', variableName: 'this' } },
  'sw-frame-setResizable': { type: 'swingFrameOp', data: { label: 'JFrame: Set Resizable', operation: 'setResizable', variableName: 'this' } },
  'sw-frame-pack': { type: 'swingFrameOp', data: { label: 'JFrame: Pack', operation: 'pack', variableName: 'this' } },
  'sw-frame-setLocationRelativeTo': { type: 'swingFrameOp', data: { label: 'JFrame: Center', operation: 'setLocationRelativeTo', variableName: 'this' } },

  // ─── SWING PANELS ───
  'sw-panel-create-flow': { type: 'swingPanelOp', data: { label: 'JPanel: FlowLayout', operation: 'create', layoutType: 'FlowLayout', variableName: 'panel' } },
  'sw-panel-create-border': { type: 'swingPanelOp', data: { label: 'JPanel: BorderLayout', operation: 'create', layoutType: 'BorderLayout', variableName: 'panel' } },
  'sw-panel-create-grid': { type: 'swingPanelOp', data: { label: 'JPanel: GridLayout', operation: 'create', layoutType: 'GridLayout', variableName: 'panel' } },
  'sw-panel-create-box': { type: 'swingPanelOp', data: { label: 'JPanel: BoxLayout', operation: 'create', layoutType: 'BoxLayout', variableName: 'panel' } },
  'sw-panel-add': { type: 'swingPanelOp', data: { label: 'JPanel: Add', operation: 'add', layoutType: 'FlowLayout', variableName: 'panel' } },
  'sw-panel-setLayout': { type: 'swingPanelOp', data: { label: 'JPanel: Set Layout', operation: 'setLayout', layoutType: 'FlowLayout', variableName: 'panel' } },
  'sw-panel-setBorder': { type: 'swingPanelOp', data: { label: 'JPanel: Set Border', operation: 'setBorder', layoutType: 'FlowLayout', variableName: 'panel' } },

  // ─── SWING CONTROLS ───
  'sw-control-jbutton': { type: 'swingControlOp', data: { label: 'JButton: Create', operation: 'create', controlType: 'JButton', variableName: 'button' } },
  'sw-control-jlabel': { type: 'swingControlOp', data: { label: 'JLabel: Create', operation: 'create', controlType: 'JLabel', variableName: 'label' } },
  'sw-control-jtextfield': { type: 'swingControlOp', data: { label: 'JTextField: Create', operation: 'create', controlType: 'JTextField', variableName: 'textField' } },
  'sw-control-jtextarea': { type: 'swingControlOp', data: { label: 'JTextArea: Create', operation: 'create', controlType: 'JTextArea', variableName: 'textArea' } },
  'sw-control-jcheckbox': { type: 'swingControlOp', data: { label: 'JCheckBox: Create', operation: 'create', controlType: 'JCheckBox', variableName: 'checkBox' } },
  'sw-control-jradiobutton': { type: 'swingControlOp', data: { label: 'JRadioButton: Create', operation: 'create', controlType: 'JRadioButton', variableName: 'radioBtn' } },
  'sw-control-jcombobox': { type: 'swingControlOp', data: { label: 'JComboBox: Create', operation: 'create', controlType: 'JComboBox', variableName: 'comboBox' } },
  'sw-control-jslider': { type: 'swingControlOp', data: { label: 'JSlider: Create', operation: 'create', controlType: 'JSlider', variableName: 'slider' } },
  'sw-control-jprogressbar': { type: 'swingControlOp', data: { label: 'JProgressBar: Create', operation: 'create', controlType: 'JProgressBar', variableName: 'progressBar' } },
  'sw-control-jpasswordfield': { type: 'swingControlOp', data: { label: 'JPasswordField: Create', operation: 'create', controlType: 'JPasswordField', variableName: 'passwordField' } },
  'sw-control-jspinner': { type: 'swingControlOp', data: { label: 'JSpinner: Create', operation: 'create', controlType: 'JSpinner', variableName: 'spinner' } },
  'sw-control-setText': { type: 'swingControlOp', data: { label: 'Swing: Set Text', operation: 'setText', controlType: 'JButton', variableName: 'control' } },
  'sw-control-getText': { type: 'swingControlOp', data: { label: 'Swing: Get Text', operation: 'getText', controlType: 'JTextField', variableName: 'control' } },
  'sw-control-append': { type: 'swingControlOp', data: { label: 'Swing: Append Text', operation: 'append', controlType: 'JTextArea', variableName: 'textArea' } },
  'sw-control-setEnabled': { type: 'swingControlOp', data: { label: 'Swing: Set Enabled', operation: 'setEnabled', controlType: 'JButton', variableName: 'control' } },
  'sw-control-setVisible': { type: 'swingControlOp', data: { label: 'Swing: Set Visible', operation: 'setVisible', controlType: 'JButton', variableName: 'control' } },
  'sw-control-setSelected': { type: 'swingControlOp', data: { label: 'Swing: Set Selected', operation: 'setSelected', controlType: 'JCheckBox', variableName: 'control' } },
  'sw-control-isSelected': { type: 'swingControlOp', data: { label: 'Swing: Is Selected', operation: 'isSelected', controlType: 'JCheckBox', variableName: 'control' } },

  // ─── SWING EVENTS ───
  'sw-event-addActionListener': { type: 'swingEventOp', data: { label: 'Action Listener', operation: 'addActionListener', variableName: 'button' } },
  'sw-event-addMouseListener': { type: 'swingEventOp', data: { label: 'Mouse Listener', operation: 'addMouseListener', variableName: 'component' } },
  'sw-event-addKeyListener': { type: 'swingEventOp', data: { label: 'Key Listener', operation: 'addKeyListener', variableName: 'component' } },
  'sw-event-addChangeListener': { type: 'swingEventOp', data: { label: 'Change Listener', operation: 'addChangeListener', variableName: 'slider' } },
  'sw-event-addItemListener': { type: 'swingEventOp', data: { label: 'Item Listener', operation: 'addItemListener', variableName: 'comboBox' } },

  // ─── SWING STYLING ───
  'sw-style-setFont': { type: 'swingStyleOp', data: { label: 'Swing: Set Font', operation: 'setFont', variableName: 'component' } },
  'sw-style-setForeground': { type: 'swingStyleOp', data: { label: 'Swing: Set Foreground', operation: 'setForeground', variableName: 'component' } },
  'sw-style-setBackground': { type: 'swingStyleOp', data: { label: 'Swing: Set Background', operation: 'setBackground', variableName: 'component' } },
  'sw-style-setPreferredSize': { type: 'swingStyleOp', data: { label: 'Swing: Set Preferred Size', operation: 'setPreferredSize', variableName: 'component' } },
  'sw-style-setBorder': { type: 'swingStyleOp', data: { label: 'Swing: Set Border', operation: 'setBorder', variableName: 'panel' } },
  'sw-style-setToolTipText': { type: 'swingStyleOp', data: { label: 'Swing: Set Tooltip', operation: 'setToolTipText', variableName: 'component' } },
  'sw-style-setOpaque': { type: 'swingStyleOp', data: { label: 'Swing: Set Opaque', operation: 'setOpaque', variableName: 'component' } },

  // ─── SWING DIALOGS ───
  'sw-dialog-showMessageDialog': { type: 'swingDialogOp', data: { label: 'Message Dialog', operation: 'showMessageDialog' } },
  'sw-dialog-showConfirmDialog': { type: 'swingDialogOp', data: { label: 'Confirm Dialog', operation: 'showConfirmDialog' } },
  'sw-dialog-showInputDialog': { type: 'swingDialogOp', data: { label: 'Input Dialog', operation: 'showInputDialog' } },
  'sw-dialog-showOptionDialog': { type: 'swingDialogOp', data: { label: 'Option Dialog', operation: 'showOptionDialog' } },

  // ─── SWING MENUS ───
  'sw-menu-createMenuBar': { type: 'swingMenuOp', data: { label: 'Create Menu Bar', operation: 'createMenuBar', variableName: 'menuBar' } },
  'sw-menu-createMenu': { type: 'swingMenuOp', data: { label: 'Create Menu', operation: 'createMenu', variableName: 'menu' } },
  'sw-menu-createMenuItem': { type: 'swingMenuOp', data: { label: 'Create Menu Item', operation: 'createMenuItem', variableName: 'menuItem' } },
  'sw-menu-createCheckBoxMenuItem': { type: 'swingMenuOp', data: { label: 'Create Check Item', operation: 'createCheckBoxMenuItem', variableName: 'checkItem' } },
  'sw-menu-addSeparator': { type: 'swingMenuOp', data: { label: 'Add Separator', operation: 'addSeparator', variableName: 'menu' } },
  'sw-menu-addMenu': { type: 'swingMenuOp', data: { label: 'Add Menu', operation: 'addMenu', variableName: 'menuBar' } },
  'sw-menu-addMenuItem': { type: 'swingMenuOp', data: { label: 'Add Item', operation: 'addMenuItem', variableName: 'menu' } },

  // --- NEW ALGORITHM NODES ---
  'algo-inorderTraversal':   { type: 'algorithm', data: { label: 'Inorder Traversal',   operation: 'inorderTraversal'   } },
  'algo-preorderTraversal':  { type: 'algorithm', data: { label: 'Preorder Traversal',  operation: 'preorderTraversal'  } },
  'algo-postorderTraversal': { type: 'algorithm', data: { label: 'Postorder Traversal', operation: 'postorderTraversal' } },
  'algo-dijkstra':           { type: 'algorithm', data: { label: 'Dijkstra',            operation: 'dijkstra'           } },
  'algo-bellmanFord':        { type: 'algorithm', data: { label: 'Bellman-Ford',        operation: 'bellmanFord'        } },


};