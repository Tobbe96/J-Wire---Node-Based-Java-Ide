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

// ─── Enriched Data (injected at runtime by page.tsx) ───────────

export type EnrichedData<T> = T & {
  updateNodeData: (id: string, data: Record<string, unknown>) => void;
  isValidConnection: IsValidConnection;
  methodNodes: Node[];
};
