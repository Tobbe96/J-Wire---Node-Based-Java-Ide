import type { Node, IsValidConnection } from '@xyflow/react';

// ─── Shared Data Structures ────────────────────────────────────

export interface Parameter {
  id: string;
  name: string;
  type: string;
  defaultValue?: string;
}

export interface LocalVariable {
  id: string;
  name: string;
  type: string;
  value: string;
}

// ─── Per-Node Data Interfaces ──────────────────────────────────

export interface MethodNodeData extends Record<string, unknown> {
  label: string;
  type: string;
  returnType?: string;
  modifier?: string;
  isStatic?: boolean;
  isAbstract?: boolean;
  parameters?: Parameter[];
  localVariables?: LocalVariable[];
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

export interface CallMethodNodeData extends Record<string, unknown> {
  methodName: string;
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
  methodNodes?: Node[];
}

export interface SetLocalVarNodeData extends Record<string, unknown> {
  label: string;
  methodName: string;
  localVarName: string;
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
  methodNodes?: Node[];
}

export interface JavaNodeData extends Record<string, unknown> {
  label: string;
  type: string;
  value: string;
  modifier?: string;
}

export interface MathNodeData extends Record<string, unknown> {
  type: string;
  label: string;
  symbol: string;
  operation: string;
  accepts: string[];
}

export interface PrintNodeData extends Record<string, unknown> {
  label: string;
  accepts?: string[];
}

export interface BranchNodeData extends Record<string, unknown> {
  label: string;
  accepts: string[];
}

export interface WhileNodeData extends Record<string, unknown> {
  label: string;
  accepts: string[];
}

export interface ForNodeData extends Record<string, unknown> {
  label: string;
  accepts: string[];
}

export interface ReturnNodeData extends Record<string, unknown> {
  label: string;
  accepts: string[];
}

export interface MainNodeData extends Record<string, unknown> {
  label: string;
}

export interface GetterNodeData extends Record<string, unknown> {
  label: string;
  type: string;
  variableId: string;
  isValidConnection?: IsValidConnection;
}

export interface SetVarNodeData extends Record<string, unknown> {
  variableName: string;
  label: string;
  accepts: string[];
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

export interface StringOpNodeData extends Record<string, unknown> {
  label: string;
  operation: string;
}

export interface MathFuncNodeData extends Record<string, unknown> {
  label: string;
  type: string;
  operation: string;
  accepts: string[];
}

export interface ArrayNodeData extends Record<string, unknown> {
  label: string;
  operation: string; // 'literal' | 'access' | 'length' | 'set' | 'new'
  arrayType: string; // 'int' | 'float' | 'double' | 'long' | 'short' | 'byte' | 'String' | 'boolean'
  values?: string;   // comma-separated values for literal
}

export interface ForEachNodeData extends Record<string, unknown> {
  label: string;
  elementType?: string;
}

export interface TryCatchFinallyNodeData extends Record<string, unknown> {
  label: string;
  exceptionType?: string;
  exceptionVarName?: string;
  catchCount?: number;
  catches?: Array<{ exceptionType: string; exceptionVarName: string }>;
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

export interface ThrowNodeData extends Record<string, unknown> {
  label: string;
  accepts: string[];
}

export interface ScannerNodeData extends Record<string, unknown> {
  label: string;
  readType: string; // 'nextLine' | 'nextInt' | 'nextFloat' | 'nextDouble' | 'nextLong' | 'nextBoolean'
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

export interface LiteralNodeData extends Record<string, unknown> {
  label: string;
  literalType: string; // 'String' | 'int' | 'float' | 'double' | 'long' | 'short' | 'byte' | 'boolean'
  value: string;
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

export interface CommentNodeData extends Record<string, unknown> {
  label: string;
  text: string;
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

export interface IncrementNodeData extends Record<string, unknown> {
  label: string;
  variableName: string;
  mode: 'post-increment' | 'post-decrement' | 'pre-increment' | 'pre-decrement';
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

export interface CompoundAssignNodeData extends Record<string, unknown> {
  label: string;
  variableName: string;
  operator: '+=' | '-=' | '*=' | '/=' | '%=';
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

export interface StringFormatNodeData extends Record<string, unknown> {
  label: string;
  formatString: string;
  argCount: number;
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

export interface ArrayListOpNodeData extends Record<string, unknown> {
  label: string;
  operation: 'create' | 'add' | 'get' | 'set' | 'remove' | 'size' | 'contains' | 'clear' | 'sort' | 'reverse' | 'indexOf' | 'lastIndexOf' | 'shuffle';
  elementType: string;
  variableName: string;
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

export interface HashMapOpNodeData extends Record<string, unknown> {
  label: string;
  operation: 'create' | 'put' | 'get' | 'remove' | 'containsKey' | 'size' | 'keySet' | 'getOrDefault' | 'values' | 'entrySet';
  keyType: string;
  valueType: string;
  variableName: string;
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

export interface HashSetOpNodeData extends Record<string, unknown> {
  label: string;
  operation: 'create' | 'add' | 'remove' | 'contains' | 'size' | 'clear';
  elementType: string;
  variableName: string;
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

export interface CallStaticMethodNodeData extends Record<string, unknown> {
  label: string;
  targetClass: string;
  methodName: string;
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
  projectFiles?: Array<{
    id: string;
    className: string;
    methods: Array<{ name: string; returnType: string; parameters: Parameter[] }>;
  }>;
}

export interface CustomCodeNodeData extends Record<string, unknown> {
  label: string;
  code: string;
  mode: 'statement' | 'expression';
  inputs: Array<{ id: string; name: string; type: string }>;
  outputType: string;
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

export interface ConstructorNodeData extends Record<string, unknown> {
  label: string;
  modifier?: string;
  parameters?: Parameter[];
  localVariables?: LocalVariable[];
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

export interface NewObjectNodeData extends Record<string, unknown> {
  label: string;
  targetClass: string;
  constructorIndex?: number;
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
  projectFiles?: Array<{
    id: string;
    className: string;
    constructors: Array<{ index: number; parameters: Parameter[] }>;
  }>;
}

export interface CallInstanceMethodNodeData extends Record<string, unknown> {
  label: string;
  methodName: string;
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
  projectFiles?: Array<{
    id: string;
    className: string;
    methods: Array<{ name: string; returnType: string; parameters: Parameter[]; isStatic?: boolean }>;
  }>;
}

export interface SuperConstructorCallNodeData extends Record<string, unknown> {
  label: string;
  argCount?: number;
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
  projectFiles?: Array<{
    id: string;
    className: string;
    classType?: string;
    extendsClass?: string;
    constructors?: Array<{ index: number; parameters: Parameter[] }>;
  }>;
}

export interface EnumConstantsNodeData extends Record<string, unknown> {
  label: string;
  constants?: string[];
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

export interface StackOpNodeData extends Record<string, unknown> {
  label: string;
  operation: 'create' | 'push' | 'pop' | 'peek' | 'isEmpty' | 'size';
  elementType: string;
  variableName: string;
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

export interface QueueOpNodeData extends Record<string, unknown> {
  label: string;
  operation: 'create' | 'offer' | 'poll' | 'peek' | 'isEmpty' | 'size';
  elementType: string;
  variableName: string;
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

export interface PriorityQueueOpNodeData extends Record<string, unknown> {
  label: string;
  operation: 'create' | 'add' | 'poll' | 'peek' | 'isEmpty' | 'size';
  elementType: string;
  variableName: string;
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

export interface DequeOpNodeData extends Record<string, unknown> {
  label: string;
  operation: 'create' | 'offerFirst' | 'offerLast' | 'pollFirst' | 'pollLast' | 'peekFirst' | 'peekLast' | 'isEmpty' | 'size';
  elementType: string;
  variableName: string;
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

export interface AlgorithmNodeData extends Record<string, unknown> {
  label: string;
  operation: 'bfs' | 'dfs' | 'binarySearch' | 'linearSearch' | 'bubbleSort' | 'mergeSort' | 'quickSort'
    | 'inorderTraversal' | 'preorderTraversal' | 'postorderTraversal' | 'dijkstra' | 'bellmanFord';
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

export interface InstanceOfNodeData extends Record<string, unknown> {
  label: string;
  typeName: string;
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

export interface AssertNodeData extends Record<string, unknown> {
  label: string;
}

export interface ArraysUtilNodeData extends Record<string, unknown> {
  label: string;
  operation: 'sort' | 'fill' | 'copyOf' | 'equals' | 'toString';
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

export interface TreeNodeOpNodeData extends Record<string, unknown> {
  label: string;
  operation: 'create' | 'getValue' | 'setValue' | 'getLeft' | 'setLeft' | 'getRight' | 'setRight' | 'isNull' | 'hasLeft' | 'hasRight';
  valueType: string;
  variableName: string;
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

export interface BSTOpNodeData extends Record<string, unknown> {
  label: string;
  operation: 'create' | 'insert' | 'delete' | 'search' | 'min' | 'max' | 'height' | 'size' | 'contains' | 'inorder' | 'preorder' | 'postorder';
  valueType: string;
  variableName: string;
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

export interface AVLTreeOpNodeData extends Record<string, unknown> {
  label: string;
  operation: 'create' | 'insert' | 'delete' | 'search' | 'height' | 'size' | 'inorder';
  valueType: string;
  variableName: string;
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

// ─── JavaFX GUI Node Interfaces ────────────────────────────────

export interface JavaFXAppNodeData extends Record<string, unknown> {
  label: string;
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

export interface JavaFXStageOpNodeData extends Record<string, unknown> {
  label: string;
  operation: 'create' | 'setTitle' | 'setScene' | 'show' | 'setWidth' | 'setHeight' | 'setResizable' | 'close';
  variableName: string;
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

export interface JavaFXSceneOpNodeData extends Record<string, unknown> {
  label: string;
  operation: 'create';
  variableName: string;
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

export interface JavaFXLayoutOpNodeData extends Record<string, unknown> {
  label: string;
  operation: 'create' | 'addChild' | 'setSpacing' | 'setAlignment' | 'setPadding' | 'setHgap' | 'setVgap' | 'setTop' | 'setBottom' | 'setLeft' | 'setRight' | 'setCenter';
  layoutType: 'VBox' | 'HBox' | 'GridPane' | 'BorderPane' | 'StackPane' | 'FlowPane' | 'AnchorPane' | 'ScrollPane';
  variableName: string;
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

export interface JavaFXControlOpNodeData extends Record<string, unknown> {
  label: string;
  operation: 'create' | 'setText' | 'getText' | 'setPromptText' | 'setDisable' | 'setVisible' | 'setValue' | 'getValue' | 'setSelected' | 'isSelected';
  controlType: 'Button' | 'Label' | 'TextField' | 'TextArea' | 'CheckBox' | 'RadioButton' | 'ToggleButton' | 'ComboBox' | 'Slider' | 'ProgressBar' | 'PasswordField' | 'Hyperlink' | 'ColorPicker' | 'DatePicker' | 'Spinner' | 'Separator';
  variableName: string;
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

export interface JavaFXEventOpNodeData extends Record<string, unknown> {
  label: string;
  operation: 'setOnAction' | 'setOnMouseClicked' | 'setOnMouseEntered' | 'setOnMouseExited' | 'setOnKeyPressed' | 'setOnKeyReleased' | 'addChangeListener';
  variableName: string;
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

export interface JavaFXStyleOpNodeData extends Record<string, unknown> {
  label: string;
  operation: 'setStyle' | 'setPrefWidth' | 'setPrefHeight' | 'setPrefSize' | 'setMinSize' | 'setMaxSize' | 'setFont' | 'setTextFill' | 'setBackground' | 'setOpacity' | 'setRotate' | 'setId' | 'getStyleClass';
  variableName: string;
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

export interface JavaFXDialogOpNodeData extends Record<string, unknown> {
  label: string;
  operation: 'alertInfo' | 'alertWarning' | 'alertError' | 'alertConfirm' | 'textInputDialog' | 'choiceDialog';
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

export interface JavaFXMenuOpNodeData extends Record<string, unknown> {
  label: string;
  operation: 'createMenuBar' | 'createMenu' | 'createMenuItem' | 'createCheckMenuItem' | 'createSeparatorMenuItem' | 'addMenu' | 'addMenuItem' | 'setOnAction';
  variableName: string;
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

export interface JavaFXTableOpNodeData extends Record<string, unknown> {
  label: string;
  operation: 'create' | 'addColumn' | 'addRow' | 'setItems' | 'getSelectedItem' | 'setEditable' | 'setCellValueFactory';
  variableName: string;
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

export interface JavaFXListOpNodeData extends Record<string, unknown> {
  label: string;
  operation: 'create' | 'setItems' | 'addItem' | 'removeItem' | 'getSelectedItem' | 'setOrientation' | 'setCellFactory';
  variableName: string;
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

export interface JavaFXMediaOpNodeData extends Record<string, unknown> {
  label: string;
  operation: 'createImageView' | 'setImage' | 'setFitWidth' | 'setFitHeight' | 'createMediaPlayer' | 'createMediaView' | 'play' | 'pause' | 'stop';
  variableName: string;
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

export interface JavaFXChartOpNodeData extends Record<string, unknown> {
  label: string;
  operation: 'createLineChart' | 'createBarChart' | 'createPieChart' | 'createAreaChart' | 'addSeries' | 'addData' | 'setTitle' | 'setAxisLabels';
  variableName: string;
  updateNodeData?: (id: string, data: Record<string, unknown>) => void;
}

// ─── Cross-class method info ───────────────────────────────────

export interface ProjectMethodInfo {
  name: string;
  returnType: string;
  parameters: Parameter[];
  isStatic?: boolean;
}

export interface ProjectConstructorInfo {
  index: number;
  parameters: Parameter[];
}

export interface ProjectClassInfo {
  id: string;
  className: string;
  classType?: 'class' | 'interface' | 'enum';
  extendsClass?: string;
  implementsInterfaces?: string[];
  isAbstract?: boolean;
  methods: ProjectMethodInfo[];
  constructors?: ProjectConstructorInfo[];
}

// ─── Enriched Data (injected at runtime by page.tsx) ───────────

export type EnrichedData<T> = T & {
  updateNodeData: (id: string, data: Record<string, unknown>) => void;
  isValidConnection: IsValidConnection;
  methodNodes: Node[];
};
