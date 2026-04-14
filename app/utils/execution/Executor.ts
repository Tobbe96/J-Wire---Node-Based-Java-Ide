import { Node, Edge } from '@xyflow/react';
import type { ProjectFile } from '../../store/editorStore';
import { evalDataImpl } from './evalDataHandlers';
import { runLogicChainImpl } from './execChainHandlers';

export interface TreeJsNode {
  val: unknown;
  left: TreeJsNode | null;
  right: TreeJsNode | null;
}

export class Executor {
  readonly nodes: Node[];
  readonly edges: Edge[];
  readonly projectFiles?: ProjectFile[];
  readonly inputProvider?: (prompt: string) => string | null;
  readonly currentClassName?: string;

  consoleOutput: string[] = [];

  // Field memory
  readonly runtimeMemory: Record<string, unknown> = {};
  readonly scannerValues = new Map<string, unknown>();

  // Collection memories
  readonly arrayListMemory: Record<string, unknown[]> = {};
  readonly hashMapMemory: Record<string, Map<unknown, unknown>> = {};
  readonly hashSetMemory: Record<string, Set<unknown>> = {};
  readonly stackMemory: Record<string, unknown[]> = {};
  readonly queueMemory: Record<string, unknown[]> = {};
  readonly dequeMemory: Record<string, unknown[]> = {};
  readonly pqMemory: Record<string, unknown[]> = {};
  // Tree memories: each entry is the root TreeJsNode (or null for empty tree)
  readonly treeNodeMemory: Record<string, TreeJsNode | null> = {};
  readonly fxMemory: Map<string, unknown> = new Map();

  /**
   * Tracks mutable scope for cross-class calls so setVar/increment can persist
   * instance field mutations back to the caller's object reference.
   */
  methodScope: Record<string, unknown> = {};

  constructor(
    nodes: Node[],
    edges: Edge[],
    options?: {
      projectFiles?: ProjectFile[];
      inputProvider?: (prompt: string) => string | null;
      currentClassName?: string;
      methodScope?: Record<string, unknown>;
    }
  ) {
    this.nodes = nodes;
    this.edges = edges;
    this.projectFiles = options?.projectFiles;
    this.inputProvider = options?.inputProvider;
    this.currentClassName = options?.currentClassName;
    this.methodScope = options?.methodScope ?? {};

    nodes.filter(n => n.type === 'java').forEach(n => {
      const varName = n.data.label as string;
      const varType = n.data.type as string;
      if (varType === 'String') this.runtimeMemory[varName] = String(n.data.value);
      else if (varType === 'boolean') this.runtimeMemory[varName] = n.data.value === 'true';
      else if (varType === 'char') this.runtimeMemory[varName] = String(n.data.value).charAt(0) || '\0';
      else this.runtimeMemory[varName] = Number(n.data.value);
    });
  }

  /** Create a child executor that shares project context but has its own node graph and memory. */
  public createChild(
    nodes: Node[],
    edges: Edge[],
    opts?: { currentClassName?: string; methodScope?: Record<string, unknown> }
  ): Executor {
    return new Executor(nodes, edges, {
      projectFiles: this.projectFiles,
      inputProvider: this.inputProvider,
      currentClassName: opts?.currentClassName,
      methodScope: opts?.methodScope,
    });
  }

  // ─── Data Evaluator ──────────────────────────────────────────────────────────

  evaluateData(nodeId: string, sourceHandle?: string, localScope?: Record<string, unknown>): unknown {
    return evalDataImpl(this, nodeId, sourceHandle, localScope);
  }

  // ─── Logic Chain ─────────────────────────────────────────────────────────────

  runLogicChain(startNodeId: string, startHandle: string = 'exec', localScope?: Record<string, unknown>): string | undefined {
    return runLogicChainImpl(this, startNodeId, startHandle, localScope);
  }
}
