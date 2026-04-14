import { Node, Edge } from '@xyflow/react';
import { getDefaultLiteral } from '../theme';
import type { Parameter, LocalVariable, ProjectClassInfo } from '../nodeTypes';
import { boxedType, SCANNER_JAVA_TYPES } from './types';

/** Returns the inline value of a node's data field as a Java literal, or null if empty. */
function getInlineValue(node: Node, key: string, javaType: string = 'String'): string | null {
  const val = node.data[key] as string | undefined;
  if (val === undefined || val === null || val === '') return null;
  if (javaType === 'String') return `"${val}"`;
  return val;
}

/**
 * Creates the `buildMethodBody` closure.
 * The returned function traverses the execution graph from a start node and emits Java statements.
 * `scannerVarCounterRef` is a shared mutable counter so scanner variables stay unique across
 * nested calls to `buildMethodBody`.
 */
export function createBuildMethodBody(
  nodes: Node[],
  edges: Edge[],
  projectClasses: ProjectClassInfo[],
  evaluateDataNode: (nodeId: string, sourceHandle?: string) => string,
  scannerVarMap: Map<string, string>,
  scannerVarCounterRef: { current: number },
): (startNodeId: string, startHandle?: string, visited?: Set<string>) => string {
  // O(1) lookup indexes built once per compilation
  const nodeIndex = new Map<string, Node>(nodes.map(n => [n.id, n]));
  const targetEdgeIndex = new Map<string, Edge>(
    edges.filter(e => e.targetHandle).map(e => [`${e.target}:${e.targetHandle}`, e]),
  );
  // Source edges grouped by sourceId for exec traversal
  const sourceEdgesIndex = new Map<string, Edge[]>();
  for (const e of edges) {
    if (!sourceEdgesIndex.has(e.source)) sourceEdgesIndex.set(e.source, []);
    sourceEdgesIndex.get(e.source)!.push(e);
  }

  const edgeAt = (targetId: string, handle: string): Edge | undefined =>
    targetEdgeIndex.get(`${targetId}:${handle}`);

  const execEdgeFrom = (sourceId: string, handleSubstr: string): Edge | undefined =>
    sourceEdgesIndex.get(sourceId)?.find(e => e.sourceHandle?.includes(handleSubstr));

  const buildMethodBody = (
    startNodeId: string,
    startHandle: string = 'exec',
    visited = new Set<string>(),
  ): string => {
    let currentNodeId = startNodeId;
    let currentHandle = startHandle;
    let methodBody = '';

    while (true) {
      const execEdge = execEdgeFrom(currentNodeId, currentHandle);
      if (!execEdge) break;
      const nextNode = nodeIndex.get(execEdge.target);
      if (!nextNode) break;

      if (visited.has(nextNode.id)) {
        methodBody += '    // [Warning: Infinite Loop Detected]\n';
        break;
      }
      visited.add(nextNode.id);

      if (nextNode.type === 'print') {
        const dataEdge = edgeAt(nextNode.id, 'data-in');
        const printTarget = dataEdge
          ? evaluateDataNode(dataEdge.source, dataEdge.sourceHandle || undefined)
          : (getInlineValue(nextNode, 'inlineValue') ?? '""');
        methodBody += `    System.out.println(${printTarget});\n`;
      }

      if (nextNode.type === 'callMethod') {
        const methodName = nextNode.data.methodName as string;
        const targetMethodNode = nodes.find(n => n.type === 'method' && n.data.label === methodName);
        const targetParams = (targetMethodNode?.data?.parameters as Parameter[]) || [];
        if (targetParams.length > 0) {
          const args = targetParams.map((p: Parameter, index: number) => {
            const argEdge = edgeAt(nextNode.id, `arg-in-${index}`);
            return argEdge ? evaluateDataNode(argEdge.source, argEdge.sourceHandle || undefined) : (p.defaultValue ?? getDefaultLiteral(p.type));
          });
          methodBody += `    ${methodName}(${args.join(', ')});\n`;
        } else {
          methodBody += `    ${methodName}();\n`;
        }
      }

      if (nextNode.type === 'callStaticMethod') {
        const targetClass = nextNode.data.targetClass as string;
        const methodName = nextNode.data.methodName as string;
        if (targetClass && methodName) {
          const targetFile = projectClasses.find(f => f.className === targetClass);
          const targetParams = targetFile?.methods.find(m => m.name === methodName)?.parameters || [];
          const args = targetParams.map((p: Parameter, index: number) => {
            const argEdge = edgeAt(nextNode.id, `arg-in-${index}`);
            return argEdge ? evaluateDataNode(argEdge.source, argEdge.sourceHandle || undefined) : getDefaultLiteral(p.type);
          });
          methodBody += `    ${targetClass}.${methodName}(${args.join(', ')});\n`;
        }
      }

      if (nextNode.type === 'newObject') {
        const targetClass = nextNode.data.targetClass as string;
        if (targetClass) {
          const targetFile = projectClasses.find(f => f.className === targetClass);
          const ctorIndex = (nextNode.data.constructorIndex as number) || 0;
          const ctors = (targetFile as unknown as { constructors?: Array<{ index: number; parameters: Parameter[] }> })?.constructors || [];
          const ctor = ctors[ctorIndex] || { parameters: [] };
          const args = ctor.parameters.map((p: Parameter, index: number) => {
            const argEdge = edgeAt(nextNode.id, `arg-in-${index}`);
            return argEdge ? evaluateDataNode(argEdge.source, argEdge.sourceHandle || undefined) : getDefaultLiteral(p.type);
          });
          methodBody += `    ${targetClass} obj${nextNode.id.replace(/-/g, '_')} = new ${targetClass}(${args.join(', ')});\n`;
        }
      }

      if (nextNode.type === 'callInstanceMethod') {
        const fullMethodName = nextNode.data.methodName as string;
        if (fullMethodName?.includes('.')) {
          const [targetClass, methodName] = fullMethodName.split('.');
          const targetFile = projectClasses.find(f => f.className === targetClass);
          const targetMethod = targetFile?.methods.find(m => m.name === methodName);
          const targetParams = targetMethod?.parameters || [];
          const objEdge = edgeAt(nextNode.id, 'obj-in');
          const objExpr = objEdge ? evaluateDataNode(objEdge.source, objEdge.sourceHandle || undefined) : 'null';
          const args = targetParams.map((p: Parameter, index: number) => {
            const argEdge = edgeAt(nextNode.id, `arg-in-${index}`);
            return argEdge ? evaluateDataNode(argEdge.source, argEdge.sourceHandle || undefined) : getDefaultLiteral(p.type);
          });
          const returnType = targetMethod?.returnType || 'void';
          if (returnType === 'void') {
            methodBody += `    (${objExpr}).${methodName}(${args.join(', ')});\n`;
          } else {
            methodBody += `    ${returnType} result_${nextNode.id.replace(/-/g, '_')} = (${objExpr}).${methodName}(${args.join(', ')});\n`;
          }
        }
      }

      if (nextNode.type === 'superConstructorCall') {
        const argCount = (nextNode.data.argCount as number) || 0;
        const args: string[] = [];
        for (let i = 0; i < argCount; i++) {
          const argEdge = edgeAt(nextNode.id, `arg-in-${i}`);
          args.push(argEdge ? evaluateDataNode(argEdge.source, argEdge.sourceHandle || undefined) : 'null');
        }
        methodBody += `    super(${args.join(', ')});\n`;
      }

      if (nextNode.type === 'return') {
        const dataEdge = edgeAt(nextNode.id, 'data-in');
        const returnVal = dataEdge ? evaluateDataNode(dataEdge.source, dataEdge.sourceHandle || undefined) : 'null';
        methodBody += `    return ${returnVal};\n`;
        break;
      }

      if (nextNode.type === 'break') {
        const tl = nextNode.data.targetLabel as string | undefined;
        methodBody += tl ? `    break ${tl};\n` : `    break;\n`;
        break;
      }

      if (nextNode.type === 'continue') {
        const tl = nextNode.data.targetLabel as string | undefined;
        methodBody += tl ? `    continue ${tl};\n` : `    continue;\n`;
        break;
      }

      if (nextNode.type === 'setVar') {
        const dataEdge = edgeAt(nextNode.id, 'data-in');
        const newValue = dataEdge
          ? evaluateDataNode(dataEdge.source, dataEdge.sourceHandle || undefined)
          : (getInlineValue(nextNode, 'inlineValue', 'raw') ?? '0');
        methodBody += `    ${nextNode.data.variableName} = ${newValue};\n`;
      }

      if (nextNode.type === 'setLocalVar') {
        const localVarName = nextNode.data.localVarName as string;
        const dataEdge = edgeAt(nextNode.id, 'data-in');
        const newValue = dataEdge
          ? evaluateDataNode(dataEdge.source, dataEdge.sourceHandle || undefined)
          : (getInlineValue(nextNode, 'inlineValue', 'raw') ?? '0');
        if (localVarName) methodBody += `    ${localVarName} = ${newValue};\n`;
      }

      if (nextNode.type === 'increment') {
        const varName = (nextNode.data.variableName as string) || 'x';
        switch (nextNode.data.mode as string) {
          case 'post-increment': methodBody += `    ${varName}++;\n`; break;
          case 'post-decrement': methodBody += `    ${varName}--;\n`; break;
          case 'pre-increment':  methodBody += `    ++${varName};\n`; break;
          case 'pre-decrement':  methodBody += `    --${varName};\n`; break;
        }
      }

      if (nextNode.type === 'compoundAssign') {
        const varName = (nextNode.data.variableName as string) || 'x';
        const operator = (nextNode.data.operator as string) || '+=';
        const dataEdge = edgeAt(nextNode.id, 'data-in');
        const value = dataEdge
          ? evaluateDataNode(dataEdge.source, dataEdge.sourceHandle || undefined)
          : (getInlineValue(nextNode, 'inlineValue', 'raw') ?? '0');
        methodBody += `    ${varName} ${operator} ${value};\n`;
      }

      if (nextNode.type === 'comment') {
        const text = (nextNode.data.text as string) || '';
        text.split('\n').forEach(line => { methodBody += `    // ${line}\n`; });
      }

      if (nextNode.type === 'customCode' && nextNode.data.mode === 'statement') {
        let code = (nextNode.data.code as string) || '';
        const inputs = (nextNode.data.inputs as Array<{id: string; name: string; type: string}>) || [];
        inputs.forEach((input, index) => {
          const inputEdge = edgeAt(nextNode.id, `custom-in-${index}`);
          const val = inputEdge ? evaluateDataNode(inputEdge.source, inputEdge.sourceHandle || undefined) : getDefaultLiteral(input.type);
          code = code.replaceAll(input.name, val);
        });
        code.split('\n').forEach(line => { methodBody += `    ${line}\n`; });
      }

      if (nextNode.type === 'arrayListOp') {
        const op = nextNode.data.operation as string;
        const varName = (nextNode.data.variableName as string) || 'list';
        const elemType = (nextNode.data.elementType as string) || 'int';
        const ev = (h: string) => {
          const e = edgeAt(nextNode.id, h);
          return e ? evaluateDataNode(e.source, e.sourceHandle || undefined) : getDefaultLiteral(elemType);
        };
        if (op === 'create') {
          const rawInitial = (nextNode.data.initialValues as string) || '';
          const initVals = rawInitial.split(',').map(v => v.trim()).filter(v => v !== '');
          if (initVals.length > 0) {
            const literals = initVals.map(v => elemType === 'String' ? `"${v}"` : v).join(', ');
            methodBody += `    ArrayList<${boxedType(elemType)}> ${varName} = new ArrayList<>(java.util.Arrays.asList(${literals}));\n`;
          } else {
            methodBody += `    ArrayList<${boxedType(elemType)}> ${varName} = new ArrayList<>();\n`;
          }
        } else if (op === 'add') {
          methodBody += `    ${varName}.add(${ev('data-in-value')});\n`;
        } else if (op === 'set') {
          methodBody += `    ${varName}.set(${ev('data-in-index')}, ${ev('data-in-value')});\n`;
        } else if (op === 'remove') {
          methodBody += `    ${varName}.remove(${ev('data-in-index')});\n`;
        } else if (op === 'clear') {
          methodBody += `    ${varName}.clear();\n`;
        } else if (op === 'sort') {
          methodBody += `    Collections.sort(${varName});\n`;
        } else if (op === 'reverse') {
          methodBody += `    Collections.reverse(${varName});\n`;
        } else if (op === 'shuffle') {
          methodBody += `    Collections.shuffle(${varName});\n`;
        }
      }

      if (nextNode.type === 'hashSetOp') {
        const op = nextNode.data.operation as string;
        const varName = (nextNode.data.variableName as string) || 'set';
        const elemType = (nextNode.data.elementType as string) || 'int';
        const ev = (h: string) => {
          const e = edgeAt(nextNode.id, h);
          return e ? evaluateDataNode(e.source, e.sourceHandle || undefined) : getDefaultLiteral(elemType);
        };
        if (op === 'create') {
          methodBody += `    HashSet<${boxedType(elemType)}> ${varName} = new HashSet<>();\n`;
        } else if (op === 'add') {
          methodBody += `    ${varName}.add(${ev('data-in-value')});\n`;
        } else if (op === 'remove') {
          methodBody += `    ${varName}.remove(${ev('data-in-value')});\n`;
        } else if (op === 'clear') {
          methodBody += `    ${varName}.clear();\n`;
        }
      }

      if (nextNode.type === 'hashMapOp') {
        const op = nextNode.data.operation as string;
        const varName = (nextNode.data.variableName as string) || 'map';
        const keyType = (nextNode.data.keyType as string) || 'String';
        const valType = (nextNode.data.valueType as string) || 'int';
        if (op === 'create') {
          methodBody += `    HashMap<${boxedType(keyType)}, ${boxedType(valType)}> ${varName} = new HashMap<>();\n`;
        } else if (op === 'put') {
          const keyEdge = edgeAt(nextNode.id, 'data-in-key');
          const valEdge = edgeAt(nextNode.id, 'data-in-value');
          const key = keyEdge ? evaluateDataNode(keyEdge.source, keyEdge.sourceHandle || undefined) : getDefaultLiteral(keyType);
          const val = valEdge ? evaluateDataNode(valEdge.source, valEdge.sourceHandle || undefined) : getDefaultLiteral(valType);
          methodBody += `    ${varName}.put(${key}, ${val});\n`;
        } else if (op === 'remove') {
          const keyEdge = edgeAt(nextNode.id, 'data-in-key');
          const key = keyEdge ? evaluateDataNode(keyEdge.source, keyEdge.sourceHandle || undefined) : getDefaultLiteral(keyType);
          methodBody += `    ${varName}.remove(${key});\n`;
        }
      }

      if (nextNode.type === 'stackOp') {
        const op = nextNode.data.operation as string;
        const varName = (nextNode.data.variableName as string) || 'myStack';
        const elemType = (nextNode.data.elementType as string) || 'int';
        if (op === 'create') {
          methodBody += `    Stack<${boxedType(elemType)}> ${varName} = new Stack<>();\n`;
        } else if (op === 'push') {
          const valEdge = edgeAt(nextNode.id, 'data-in');
          const val = valEdge ? evaluateDataNode(valEdge.source, valEdge.sourceHandle || undefined) : getDefaultLiteral(elemType);
          methodBody += `    ${varName}.push(${val});\n`;
        } else if (op === 'pop') {
          methodBody += `    ${varName}.pop();\n`;
        }
      }

      if (nextNode.type === 'queueOp') {
        const op = nextNode.data.operation as string;
        const varName = (nextNode.data.variableName as string) || 'myQueue';
        const elemType = (nextNode.data.elementType as string) || 'int';
        if (op === 'create') {
          methodBody += `    Queue<${boxedType(elemType)}> ${varName} = new LinkedList<>();\n`;
        } else if (op === 'offer') {
          const valEdge = edgeAt(nextNode.id, 'data-in');
          const val = valEdge ? evaluateDataNode(valEdge.source, valEdge.sourceHandle || undefined) : getDefaultLiteral(elemType);
          methodBody += `    ${varName}.offer(${val});\n`;
        } else if (op === 'poll') {
          methodBody += `    ${varName}.poll();\n`;
        }
      }

      if (nextNode.type === 'dequeOp') {
        const op = nextNode.data.operation as string;
        const varName = (nextNode.data.variableName as string) || 'myDeque';
        const elemType = (nextNode.data.elementType as string) || 'int';
        if (op === 'create') {
          methodBody += `    Deque<${boxedType(elemType)}> ${varName} = new ArrayDeque<>();\n`;
        } else if (op === 'offerFirst') {
          const valEdge = edgeAt(nextNode.id, 'data-in');
          const val = valEdge ? evaluateDataNode(valEdge.source, valEdge.sourceHandle || undefined) : getDefaultLiteral(elemType);
          methodBody += `    ${varName}.offerFirst(${val});\n`;
        } else if (op === 'offerLast') {
          const valEdge = edgeAt(nextNode.id, 'data-in');
          const val = valEdge ? evaluateDataNode(valEdge.source, valEdge.sourceHandle || undefined) : getDefaultLiteral(elemType);
          methodBody += `    ${varName}.offerLast(${val});\n`;
        } else if (op === 'pollFirst') {
          methodBody += `    ${varName}.pollFirst();\n`;
        } else if (op === 'pollLast') {
          methodBody += `    ${varName}.pollLast();\n`;
        }
      }

      if (nextNode.type === 'priorityQueueOp') {
        const op = nextNode.data.operation as string;
        const varName = (nextNode.data.variableName as string) || 'myPQ';
        const elemType = (nextNode.data.elementType as string) || 'int';
        if (op === 'create') {
          methodBody += `    PriorityQueue<${boxedType(elemType)}> ${varName} = new PriorityQueue<>();\n`;
        } else if (op === 'add') {
          const valEdge = edgeAt(nextNode.id, 'data-in');
          const val = valEdge ? evaluateDataNode(valEdge.source, valEdge.sourceHandle || undefined) : getDefaultLiteral(elemType);
          methodBody += `    ${varName}.add(${val});\n`;
        } else if (op === 'poll') {
          methodBody += `    ${varName}.poll();\n`;
        }
      }

      if (nextNode.type === 'algorithm') {
        const op = nextNode.data.operation as string;
        const ev = (h: string) => {
          const e = edgeAt(nextNode.id, h);
          return e ? evaluateDataNode(e.source, e.sourceHandle || undefined) : 'null';
        };
        if (op === 'bubbleSort' || op === 'quickSort' || op === 'mergeSort') {
          const listEdge = edgeAt(nextNode.id, 'data-in-list');
          if (listEdge) {
            const listSrcNode = nodeIndex.get(listEdge.source);
            const listVarName = (listSrcNode?.data.variableName as string) || 'list';
            methodBody += `    Collections.sort(${listVarName});\n`;
          } else {
            methodBody += `    java.util.Arrays.sort(${ev('data-in-array')});\n`;
          }
        } else if (op === 'bfs' || op === 'dfs') {
          methodBody += `    // ${op.toUpperCase()} traversal — implement graph logic here\n`;
        }
      }

      if (nextNode.type === 'branch') {
        const condEdge = edgeAt(nextNode.id, 'data-in');
        const condition = condEdge
          ? evaluateDataNode(condEdge.source, condEdge.sourceHandle || undefined)
          : ((nextNode.data.inlineValue as string) || 'false');
        methodBody += `    if (${condition}) {\n`;
        methodBody += buildMethodBody(nextNode.id, 'exec-out-true', visited);
        methodBody += `    } else {\n`;
        methodBody += buildMethodBody(nextNode.id, 'exec-out-false', visited);
        methodBody += `    }\n`;
        break;
      }

      if (nextNode.type === 'while') {
        const condEdge = edgeAt(nextNode.id, 'data-in');
        const condition = condEdge ? evaluateDataNode(condEdge.source, condEdge.sourceHandle || undefined) : 'false';
        const lbl = nextNode.data.loopLabel as string | undefined;
        methodBody += lbl ? `    ${lbl}: while (${condition}) {\n` : `    while (${condition}) {\n`;
        methodBody += buildMethodBody(nextNode.id, 'exec-body', visited);
        methodBody += `    }\n`;
        methodBody += buildMethodBody(nextNode.id, 'exec-out', visited);
        break;
      }

      if (nextNode.type === 'for') {
        const startEdge = edgeAt(nextNode.id, 'data-start');
        const endEdge = edgeAt(nextNode.id, 'data-end');
        const stepEdge = edgeAt(nextNode.id, 'data-step');
        const startVal = startEdge ? evaluateDataNode(startEdge.source, startEdge.sourceHandle || undefined) : '0';
        const endVal = endEdge ? evaluateDataNode(endEdge.source, endEdge.sourceHandle || undefined) : '10';
        const stepVal = stepEdge
          ? evaluateDataNode(stepEdge.source, stepEdge.sourceHandle || undefined)
          : ((nextNode.data.step as string) || '1');
        const comparison = (nextNode.data.comparison as string) || '<';
        const lbl = nextNode.data.loopLabel as string | undefined;
        // Build step expression: positive step uses +=, negative uses -=
        const stepNum = Number(stepVal);
        let stepExpr: string;
        if (!isNaN(stepNum)) {
          if (stepNum === 1) stepExpr = 'i++';
          else if (stepNum === -1) stepExpr = 'i--';
          else if (stepNum > 0) stepExpr = `i += ${stepVal}`;
          else stepExpr = `i -= ${Math.abs(stepNum)}`;
        } else {
          stepExpr = `i += ${stepVal}`;
        }
        const forDecl = `for (int i = ${startVal}; i ${comparison} ${endVal}; ${stepExpr})`;
        methodBody += lbl ? `    ${lbl}: ${forDecl} {\n` : `    ${forDecl} {\n`;
        methodBody += buildMethodBody(nextNode.id, 'exec-body', visited);
        methodBody += `    }\n`;
        methodBody += buildMethodBody(nextNode.id, 'exec-out', visited);
        break;
      }

      if (nextNode.type === 'doWhile') {
        const condEdge = edgeAt(nextNode.id, 'data-in');
        const condition = condEdge ? evaluateDataNode(condEdge.source, condEdge.sourceHandle || undefined) : 'false';
        const lbl = nextNode.data.loopLabel as string | undefined;
        methodBody += lbl ? `    ${lbl}: do {\n` : `    do {\n`;
        methodBody += buildMethodBody(nextNode.id, 'exec-body', visited);
        methodBody += `    } while (${condition});\n`;
        methodBody += buildMethodBody(nextNode.id, 'exec-out', visited);
        break;
      }

      if (nextNode.type === 'arrayOp' && nextNode.data.operation === 'set') {
        const arrEdge = edgeAt(nextNode.id, 'data-in-array');
        const idxEdge = edgeAt(nextNode.id, 'data-in-index');
        const valEdge = edgeAt(nextNode.id, 'data-in-value');
        const arrExpr = arrEdge ? evaluateDataNode(arrEdge.source, arrEdge.sourceHandle || undefined) : 'arr';
        const idxExpr = idxEdge ? evaluateDataNode(idxEdge.source, idxEdge.sourceHandle || undefined) : '0';
        const valExpr = valEdge ? evaluateDataNode(valEdge.source, valEdge.sourceHandle || undefined) : '0';
        methodBody += `    ${arrExpr}[${idxExpr}] = ${valExpr};\n`;
      }

      if (nextNode.type === 'forEach') {
        const elemType = (nextNode.data.elementType as string) || 'int';
        const arrEdge = edgeAt(nextNode.id, 'data-in-array');
        const arrExpr = arrEdge ? evaluateDataNode(arrEdge.source, arrEdge.sourceHandle || undefined) : 'new int[]{}';
        const lbl = nextNode.data.loopLabel as string | undefined;
        methodBody += `    { int __idx__ = 0;\n`;
        methodBody += lbl
          ? `    ${lbl}: for (${elemType} __elem__ : ${arrExpr}) {\n`
          : `    for (${elemType} __elem__ : ${arrExpr}) {\n`;
        methodBody += buildMethodBody(nextNode.id, 'exec-body', visited);
        methodBody += `      __idx__++;\n`;
        methodBody += `    }\n`;
        methodBody += `    }\n`;
        methodBody += buildMethodBody(nextNode.id, 'exec-out', visited);
        break;
      }

      if (nextNode.type === 'switch') {
        const valEdge = edgeAt(nextNode.id, 'data-in');
        const switchVal = valEdge ? evaluateDataNode(valEdge.source, valEdge.sourceHandle || undefined) : '0';
        const caseCount = (nextNode.data.caseCount as number) || 2;
        const caseValues = (nextNode.data.caseValues as string[]) || [];
        const fallThrough = (nextNode.data.fallThrough as boolean[]) || [];
        methodBody += `    switch (${switchVal}) {\n`;
        for (let i = 0; i < caseCount; i++) {
          const caseEdge = edgeAt(nextNode.id, `data-case-${i}`);
          const caseVal = caseEdge ? evaluateDataNode(caseEdge.source, caseEdge.sourceHandle || undefined) : (caseValues[i] ?? String(i));
          methodBody += `      case ${caseVal}:\n`;
          methodBody += buildMethodBody(nextNode.id, `exec-case-${i}`, visited);
          if (!fallThrough[i]) methodBody += `        break;\n`;
        }
        methodBody += `      default:\n`;
        methodBody += buildMethodBody(nextNode.id, 'exec-default', visited);
        methodBody += `        break;\n`;
        methodBody += `    }\n`;
        methodBody += buildMethodBody(nextNode.id, 'exec-out', visited);
        break;
      }

      if (nextNode.type === 'tryCatchFinally') {
        const catches = (nextNode.data.catches as Array<{exceptionType:string; exceptionVarName:string}>) || [];
        const catchCount = catches.length > 0 ? catches.length : 1;
        const getCatch = (i: number): {exceptionType: string; exceptionVarName: string} => {
          if (catches[i]) return catches[i];
          return {
            exceptionType: (nextNode.data.exceptionType as string) || 'Exception',
            exceptionVarName: (nextNode.data.exceptionVarName as string) || 'e',
          };
        };
        const execHandleId = (i: number) => i === 0 ? 'exec-catch' : `exec-catch-${i}`;

        methodBody += `    try {\n`;
        methodBody += buildMethodBody(nextNode.id, 'exec-try', visited);
        for (let i = 0; i < catchCount; i++) {
          const c = getCatch(i);
          methodBody += `    } catch (${c.exceptionType} ${c.exceptionVarName}) {\n`;
          methodBody += buildMethodBody(nextNode.id, execHandleId(i), visited);
        }
        methodBody += `    } finally {\n`;
        methodBody += buildMethodBody(nextNode.id, 'exec-finally', visited);
        methodBody += `    }\n`;
        methodBody += buildMethodBody(nextNode.id, 'exec-out', visited);
        break;
      }

      if (nextNode.type === 'throw') {
        const msgEdge = edgeAt(nextNode.id, 'data-in');
        const message = msgEdge
          ? evaluateDataNode(msgEdge.source, msgEdge.sourceHandle || undefined)
          : (getInlineValue(nextNode, 'inlineValue') ?? '"Error"');
        methodBody += `    throw new RuntimeException(${message});\n`;
        break;
      }

      if (nextNode.type === 'scanner') {
        const readType = (nextNode.data.readType as string) || 'nextLine';
        const javaType = SCANNER_JAVA_TYPES[readType] || 'String';
        const varName = `__input_${scannerVarCounterRef.current++}__`;
        scannerVarMap.set(nextNode.id, varName);

        const promptEdge = edgeAt(nextNode.id, 'data-in-prompt');
        if (promptEdge) {
          methodBody += `    System.out.print(${evaluateDataNode(promptEdge.source, promptEdge.sourceHandle || undefined)});\n`;
        } else {
          const inlinePrompt = getInlineValue(nextNode, 'inlinePrompt');
          if (inlinePrompt) methodBody += `    System.out.print(${inlinePrompt});\n`;
        }
        methodBody += `    ${javaType} ${varName} = __scanner.${readType}();\n`;
      }

      if (nextNode.type === 'assert') {
        const condEdge = edgeAt(nextNode.id, 'data-in-condition');
        const msgEdge = edgeAt(nextNode.id, 'data-in-message');
        const cond = condEdge ? evaluateDataNode(condEdge.source, condEdge.sourceHandle || undefined) : 'true';
        if (msgEdge) {
          const msg = evaluateDataNode(msgEdge.source, msgEdge.sourceHandle || undefined);
          methodBody += `    assert ${cond} : ${msg};\n`;
        } else {
          methodBody += `    assert ${cond};\n`;
        }
      }

      if (nextNode.type === 'arraysUtil') {
        const op = nextNode.data.operation as string;
        if (op === 'sort') {
          const arrEdge = edgeAt(nextNode.id, 'data-in-array');
          const arr = arrEdge ? evaluateDataNode(arrEdge.source, arrEdge.sourceHandle || undefined) : 'null';
          methodBody += `    Arrays.sort(${arr});\n`;
        } else if (op === 'fill') {
          const arrEdge = edgeAt(nextNode.id, 'data-in-array');
          const valEdge = edgeAt(nextNode.id, 'data-in-value');
          const arr = arrEdge ? evaluateDataNode(arrEdge.source, arrEdge.sourceHandle || undefined) : 'null';
          const val = valEdge ? evaluateDataNode(valEdge.source, valEdge.sourceHandle || undefined) : '0';
          methodBody += `    Arrays.fill(${arr}, ${val});\n`;
        }
      }


      // --- BST Ops (exec-chain) ---
      if (nextNode.type === 'bstOp') {
        const op = nextNode.data.operation as string;
        const varName = (nextNode.data.variableName as string) || 'root';
        const ev2 = (h: string) => { const e2 = edgeAt(nextNode.id, h); return e2 ? evaluateDataNode(e2.source, e2.sourceHandle || undefined) : 'null'; };
        if (op === 'create') {
          methodBody += `    TreeNode ${varName} = null;\n`;
        } else if (op === 'insert') {
          methodBody += `    ${varName} = bstInsert(${varName}, ${ev2('data-in-value')});\n`;
        } else if (op === 'delete') {
          methodBody += `    ${varName} = bstDelete(${varName}, ${ev2('data-in-value')});\n`;
        }
      }

      // --- AVL Tree Ops (exec-chain) ---
      if (nextNode.type === 'avlTreeOp') {
        const op = nextNode.data.operation as string;
        const varName = (nextNode.data.variableName as string) || 'root';
        const ev2 = (h: string) => { const e2 = edgeAt(nextNode.id, h); return e2 ? evaluateDataNode(e2.source, e2.sourceHandle || undefined) : 'null'; };
        if (op === 'create') {
          methodBody += `    TreeNode ${varName} = null;\n`;
        } else if (op === 'insert') {
          methodBody += `    ${varName} = avlInsert(${varName}, ${ev2('data-in-value')});\n`;
        } else if (op === 'delete') {
          methodBody += `    ${varName} = avlDelete(${varName}, ${ev2('data-in-value')});\n`;
        }
      }

      // --- TreeNode Ops (exec-chain) ---
      if (nextNode.type === 'treeNodeOp') {
        const op = nextNode.data.operation as string;
        const varName = (nextNode.data.variableName as string) || 'node';
        const ev2 = (h: string) => { const e2 = edgeAt(nextNode.id, h); return e2 ? evaluateDataNode(e2.source, e2.sourceHandle || undefined) : 'null'; };
        if (op === 'create') {
          methodBody += `    TreeNode ${varName} = new TreeNode(${ev2('data-in-value')});\n`;
        } else if (op === 'setValue') {
          methodBody += `    ${varName}.val = ${ev2('data-in-value')};\n`;
        } else if (op === 'setLeft') {
          methodBody += `    ${varName}.left = ${ev2('data-in-node')};\n`;
        } else if (op === 'setRight') {
          methodBody += `    ${varName}.right = ${ev2('data-in-node')};\n`;
        }
      }

      // --- JavaFX Stage Ops ---
      if (nextNode.type === 'javafxStageOp') {
        const op = nextNode.data.operation as string;
        const varName = (nextNode.data.variableName as string) || 'primaryStage';
        const ev2 = (h: string) => { const e2 = edgeAt(nextNode.id, h); return e2 ? evaluateDataNode(e2.source, e2.sourceHandle || undefined) : 'null'; };
        if (op === 'create') {
          methodBody += `    Stage ${varName} = new Stage();\n`;
        } else if (op === 'setTitle') {
          methodBody += `    ${varName}.setTitle(${ev2('data-in-title')});\n`;
        } else if (op === 'setScene') {
          methodBody += `    ${varName}.setScene(${ev2('data-in-scene')});\n`;
        } else if (op === 'show') {
          methodBody += `    ${varName}.show();\n`;
        } else if (op === 'setWidth') {
          methodBody += `    ${varName}.setWidth(${ev2('data-in-value')});\n`;
        } else if (op === 'setHeight') {
          methodBody += `    ${varName}.setHeight(${ev2('data-in-value')});\n`;
        } else if (op === 'setResizable') {
          methodBody += `    ${varName}.setResizable(${ev2('data-in-value')});\n`;
        } else if (op === 'close') {
          methodBody += `    ${varName}.close();\n`;
        }
      }

      // --- JavaFX Scene Ops ---
      if (nextNode.type === 'javafxSceneOp') {
        const op = nextNode.data.operation as string;
        const varName = (nextNode.data.variableName as string) || 'scene';
        const ev2 = (h: string) => { const e2 = edgeAt(nextNode.id, h); return e2 ? evaluateDataNode(e2.source, e2.sourceHandle || undefined) : 'null'; };
        if (op === 'create') {
          const root = ev2('data-in-root');
          const width = ev2('data-in-width');
          const height = ev2('data-in-height');
          const w = width === 'null' ? '400' : width;
          const h = height === 'null' ? '300' : height;
          methodBody += `    Scene ${varName} = new Scene(${root}, ${w}, ${h});\n`;
        }
      }

      // --- JavaFX Layout Ops ---
      if (nextNode.type === 'javafxLayoutOp') {
        const op = nextNode.data.operation as string;
        const layoutType = (nextNode.data.layoutType as string) || 'VBox';
        const varName = (nextNode.data.variableName as string) || 'layout';
        const ev2 = (h: string) => { const e2 = edgeAt(nextNode.id, h); return e2 ? evaluateDataNode(e2.source, e2.sourceHandle || undefined) : 'null'; };
        if (op === 'create') {
          methodBody += `    ${layoutType} ${varName} = new ${layoutType}();\n`;
        } else if (op === 'addChild') {
          methodBody += `    ${varName}.getChildren().add(${ev2('data-in-child')});\n`;
        } else if (op === 'setSpacing') {
          methodBody += `    ${varName}.setSpacing(${ev2('data-in-value')});\n`;
        } else if (op === 'setAlignment') {
          const align = ev2('data-in-value');
          methodBody += `    ${varName}.setAlignment(Pos.${align === 'null' ? 'CENTER' : align.replace(/^"(.*)"$/, '$1')});\n`;
        } else if (op === 'setPadding') {
          methodBody += `    ${varName}.setPadding(new Insets(${ev2('data-in-value')}));\n`;
        } else if (op === 'setHgap') {
          methodBody += `    ${varName}.setHgap(${ev2('data-in-value')});\n`;
        } else if (op === 'setVgap') {
          methodBody += `    ${varName}.setVgap(${ev2('data-in-value')});\n`;
        } else if (op === 'setTop') {
          methodBody += `    ${varName}.setTop(${ev2('data-in-child')});\n`;
        } else if (op === 'setBottom') {
          methodBody += `    ${varName}.setBottom(${ev2('data-in-child')});\n`;
        } else if (op === 'setLeft') {
          methodBody += `    ${varName}.setLeft(${ev2('data-in-child')});\n`;
        } else if (op === 'setRight') {
          methodBody += `    ${varName}.setRight(${ev2('data-in-child')});\n`;
        } else if (op === 'setCenter') {
          methodBody += `    ${varName}.setCenter(${ev2('data-in-child')});\n`;
        }
      }

      // --- JavaFX Control Ops (exec-chain) ---
      if (nextNode.type === 'javafxControlOp') {
        const op = nextNode.data.operation as string;
        const controlType = (nextNode.data.controlType as string) || 'Button';
        const varName = (nextNode.data.variableName as string) || 'control';
        const ev2 = (h: string) => { const e2 = edgeAt(nextNode.id, h); return e2 ? evaluateDataNode(e2.source, e2.sourceHandle || undefined) : 'null'; };
        if (op === 'create') {
          if (['Button', 'Label', 'Hyperlink'].includes(controlType)) {
            methodBody += `    ${controlType} ${varName} = new ${controlType}("");\n`;
          } else {
            methodBody += `    ${controlType} ${varName} = new ${controlType}();\n`;
          }
        } else if (op === 'setText' || op === 'setPromptText') {
          methodBody += `    ${varName}.${op}(${ev2('data-in-text')});\n`;
        } else if (op === 'setDisable') {
          methodBody += `    ${varName}.setDisable(${ev2('data-in-value')});\n`;
        } else if (op === 'setVisible') {
          methodBody += `    ${varName}.setVisible(${ev2('data-in-value')});\n`;
        } else if (op === 'setSelected') {
          methodBody += `    ${varName}.setSelected(${ev2('data-in-value')});\n`;
        } else if (op === 'setValue') {
          methodBody += `    ${varName}.setValue(${ev2('data-in-value')});\n`;
        }
        // getText, getValue, isSelected are data-only ops — handled in evaluateData
      }

      // --- JavaFX Event Ops ---
      if (nextNode.type === 'javafxEventOp') {
        const op = nextNode.data.operation as string;
        const varName = (nextNode.data.variableName as string) || 'node';
        const eventParam = (op === 'setOnKeyPressed' || op === 'setOnKeyReleased') ? 'KeyEvent e' : 'ActionEvent e';
        const lambdaBody = buildMethodBody(nextNode.id, 'event-body', visited);
        methodBody += `    ${varName}.${op}((${eventParam}) -> {\n${lambdaBody}    });\n`;
      }

      // --- JavaFX Style Ops ---
      if (nextNode.type === 'javafxStyleOp') {
        const op = nextNode.data.operation as string;
        const varName = (nextNode.data.variableName as string) || 'node';
        const ev2 = (h: string) => { const e2 = edgeAt(nextNode.id, h); return e2 ? evaluateDataNode(e2.source, e2.sourceHandle || undefined) : 'null'; };
        if (op === 'setStyle') {
          methodBody += `    ${varName}.setStyle(${ev2('data-in-value')});\n`;
        } else if (op === 'setPrefWidth') {
          methodBody += `    ${varName}.setPrefWidth(${ev2('data-in-value')});\n`;
        } else if (op === 'setPrefHeight') {
          methodBody += `    ${varName}.setPrefHeight(${ev2('data-in-value')});\n`;
        } else if (op === 'setPrefSize') {
          methodBody += `    ${varName}.setPrefSize(${ev2('data-in-w')}, ${ev2('data-in-h')});\n`;
        } else if (op === 'setMinSize') {
          methodBody += `    ${varName}.setMinSize(${ev2('data-in-w')}, ${ev2('data-in-h')});\n`;
        } else if (op === 'setMaxSize') {
          methodBody += `    ${varName}.setMaxSize(${ev2('data-in-w')}, ${ev2('data-in-h')});\n`;
        } else if (op === 'setFont') {
          methodBody += `    ${varName}.setFont(javafx.scene.text.Font.font(${ev2('data-in-value')}));\n`;
        } else if (op === 'setTextFill') {
          methodBody += `    ${varName}.setTextFill(javafx.scene.paint.Color.web(${ev2('data-in-value')}));\n`;
        } else if (op === 'setBackground') {
          methodBody += `    ${varName}.setStyle("-fx-background-color: " + ${ev2('data-in-value')});\n`;
        } else if (op === 'setOpacity') {
          methodBody += `    ${varName}.setOpacity(${ev2('data-in-value')});\n`;
        } else if (op === 'setRotate') {
          methodBody += `    ${varName}.setRotate(${ev2('data-in-value')});\n`;
        } else if (op === 'setId') {
          methodBody += `    ${varName}.setId(${ev2('data-in-value')});\n`;
        }
        // getStyleClass is data-only
      }

      // --- JavaFX Dialog Ops ---
      if (nextNode.type === 'javafxDialogOp') {
        const op = nextNode.data.operation as string;
        const ev2 = (h: string) => { const e2 = edgeAt(nextNode.id, h); return e2 ? evaluateDataNode(e2.source, e2.sourceHandle || undefined) : '"Dialog"'; };
        if (op === 'alertInfo') {
          methodBody += `    { Alert __alert = new Alert(Alert.AlertType.INFORMATION); __alert.setTitle(${ev2('data-in-title')}); __alert.setContentText(${ev2('data-in-msg')}); __alert.showAndWait(); }\n`;
        } else if (op === 'alertWarning') {
          methodBody += `    { Alert __alert = new Alert(Alert.AlertType.WARNING); __alert.setTitle(${ev2('data-in-title')}); __alert.setContentText(${ev2('data-in-msg')}); __alert.showAndWait(); }\n`;
        } else if (op === 'alertError') {
          methodBody += `    { Alert __alert = new Alert(Alert.AlertType.ERROR); __alert.setTitle(${ev2('data-in-title')}); __alert.setContentText(${ev2('data-in-msg')}); __alert.showAndWait(); }\n`;
        } else if (op === 'alertConfirm') {
          methodBody += `    boolean __confirmed = false;\n    { Alert __alert = new Alert(Alert.AlertType.CONFIRMATION); __alert.setTitle(${ev2('data-in-title')}); __alert.setContentText(${ev2('data-in-msg')}); java.util.Optional<ButtonType> __result = __alert.showAndWait(); __confirmed = __result.isPresent() && __result.get() == ButtonType.OK; }\n`;
        } else if (op === 'textInputDialog') {
          methodBody += `    String __textInput = "";\n    { TextInputDialog __dlg = new TextInputDialog(); __dlg.setTitle(${ev2('data-in-title')}); __dlg.setHeaderText(${ev2('data-in-prompt')}); java.util.Optional<String> __res = __dlg.showAndWait(); if (__res.isPresent()) __textInput = __res.get(); }\n`;
        } else if (op === 'choiceDialog') {
          methodBody += `    String __choice = "";\n    { ChoiceDialog<String> __cdlg = new ChoiceDialog<>(); __cdlg.setTitle(${ev2('data-in-title')}); java.util.Optional<String> __cr = __cdlg.showAndWait(); if (__cr.isPresent()) __choice = __cr.get(); }\n`;
        } else if (op === 'showAndWait') {
          methodBody += `    // showAndWait — connect to a dialog variable\n`;
        }
      }

      // --- JavaFX Menu Ops ---
      if (nextNode.type === 'javafxMenuOp') {
        const op = nextNode.data.operation as string;
        const varName = (nextNode.data.variableName as string) || 'menuBar';
        const ev2 = (h: string) => { const e2 = edgeAt(nextNode.id, h); return e2 ? evaluateDataNode(e2.source, e2.sourceHandle || undefined) : 'null'; };
        if (op === 'createMenuBar') {
          methodBody += `    MenuBar ${varName} = new MenuBar();\n`;
        } else if (op === 'createMenu') {
          methodBody += `    Menu ${varName} = new Menu(${ev2('data-in-title')});\n`;
        } else if (op === 'createMenuItem') {
          methodBody += `    MenuItem ${varName} = new MenuItem(${ev2('data-in-title')});\n`;
        } else if (op === 'createCheckMenuItem') {
          methodBody += `    CheckMenuItem ${varName} = new CheckMenuItem(${ev2('data-in-title')});\n`;
        } else if (op === 'createSeparatorMenuItem') {
          methodBody += `    SeparatorMenuItem ${varName} = new SeparatorMenuItem();\n`;
        } else if (op === 'addMenu') {
          methodBody += `    ${varName}.getMenus().add(${ev2('data-in-item')});\n`;
        } else if (op === 'addMenuItem') {
          methodBody += `    ${varName}.getItems().add(${ev2('data-in-item')});\n`;
        } else if (op === 'setOnAction') {
          const lambdaBody = buildMethodBody(nextNode.id, 'event-body', visited);
          methodBody += `    ${varName}.setOnAction((ActionEvent e) -> {\n${lambdaBody}    });\n`;
        }
      }

      // --- JavaFX Table Ops ---
      if (nextNode.type === 'javafxTableOp') {
        const op = nextNode.data.operation as string;
        const varName = (nextNode.data.variableName as string) || 'table';
        const ev2 = (h: string) => { const e2 = edgeAt(nextNode.id, h); return e2 ? evaluateDataNode(e2.source, e2.sourceHandle || undefined) : 'null'; };
        if (op === 'create') {
          methodBody += `    TableView ${varName} = new TableView();\n`;
        } else if (op === 'addColumn') {
          methodBody += `    { TableColumn __col = new TableColumn(${ev2('data-in-name')}); ${varName}.getColumns().add(__col); }\n`;
        } else if (op === 'addRow') {
          methodBody += `    ${varName}.getItems().add(${ev2('data-in-item')});\n`;
        } else if (op === 'setItems') {
          methodBody += `    ${varName}.setItems(FXCollections.observableArrayList(${ev2('data-in-list')}));\n`;
        } else if (op === 'setEditable') {
          methodBody += `    ${varName}.setEditable(${ev2('data-in-value')});\n`;
        } else if (op === 'setCellValueFactory') {
          methodBody += `    // setCellValueFactory for column: ${ev2('data-in-name')}\n`;
        }
      }

      // --- JavaFX List Ops ---
      if (nextNode.type === 'javafxListOp') {
        const op = nextNode.data.operation as string;
        const varName = (nextNode.data.variableName as string) || 'listView';
        const ev2 = (h: string) => { const e2 = edgeAt(nextNode.id, h); return e2 ? evaluateDataNode(e2.source, e2.sourceHandle || undefined) : 'null'; };
        if (op === 'create') {
          methodBody += `    ListView ${varName} = new ListView();\n`;
        } else if (op === 'setItems') {
          methodBody += `    ${varName}.setItems(FXCollections.observableArrayList(${ev2('data-in-list')}));\n`;
        } else if (op === 'addItem') {
          methodBody += `    ${varName}.getItems().add(${ev2('data-in-item')});\n`;
        } else if (op === 'removeItem') {
          methodBody += `    ${varName}.getItems().remove(${ev2('data-in-item')});\n`;
        } else if (op === 'setOrientation') {
          methodBody += `    ${varName}.setOrientation(javafx.geometry.Orientation.${ev2('data-in-value').replace(/^"(.*)"$/, '$1')});\n`;
        } else if (op === 'setCellFactory') {
          methodBody += `    // setCellFactory — implement custom cell renderer here\n`;
        }
      }

      // --- JavaFX Media Ops ---
      if (nextNode.type === 'javafxMediaOp') {
        const op = nextNode.data.operation as string;
        const varName = (nextNode.data.variableName as string) || 'mediaNode';
        const ev2 = (h: string) => { const e2 = edgeAt(nextNode.id, h); return e2 ? evaluateDataNode(e2.source, e2.sourceHandle || undefined) : 'null'; };
        if (op === 'createImageView') {
          methodBody += `    ImageView ${varName} = new ImageView();\n`;
        } else if (op === 'setImage') {
          methodBody += `    ${varName}.setImage(new Image(${ev2('data-in-path')}));\n`;
        } else if (op === 'setFitWidth') {
          methodBody += `    ${varName}.setFitWidth(${ev2('data-in-value')});\n`;
        } else if (op === 'setFitHeight') {
          methodBody += `    ${varName}.setFitHeight(${ev2('data-in-value')});\n`;
        } else if (op === 'createMediaPlayer') {
          methodBody += `    Media __media_${varName} = new Media(${ev2('data-in-path')});\n    MediaPlayer ${varName} = new MediaPlayer(__media_${varName});\n`;
        } else if (op === 'createMediaView') {
          methodBody += `    MediaView ${varName} = new MediaView();\n`;
        } else if (op === 'play') {
          methodBody += `    ${varName}.play();\n`;
        } else if (op === 'pause') {
          methodBody += `    ${varName}.pause();\n`;
        } else if (op === 'stop') {
          methodBody += `    ${varName}.stop();\n`;
        }
      }

      // --- JavaFX Chart Ops ---
      if (nextNode.type === 'javafxChartOp') {
        const op = nextNode.data.operation as string;
        const varName = (nextNode.data.variableName as string) || 'chart';
        const ev2 = (h: string) => { const e2 = edgeAt(nextNode.id, h); return e2 ? evaluateDataNode(e2.source, e2.sourceHandle || undefined) : 'null'; };
        if (op === 'createLineChart') {
          methodBody += `    NumberAxis __xAxis_${varName} = new NumberAxis(); NumberAxis __yAxis_${varName} = new NumberAxis();\n    LineChart ${varName} = new LineChart(__xAxis_${varName}, __yAxis_${varName});\n`;
        } else if (op === 'createBarChart') {
          methodBody += `    CategoryAxis __xAxis_${varName} = new CategoryAxis(); NumberAxis __yAxis_${varName} = new NumberAxis();\n    BarChart ${varName} = new BarChart(__xAxis_${varName}, __yAxis_${varName});\n`;
        } else if (op === 'createPieChart') {
          methodBody += `    PieChart ${varName} = new PieChart();\n`;
        } else if (op === 'createAreaChart') {
          methodBody += `    NumberAxis __xAxis_${varName} = new NumberAxis(); NumberAxis __yAxis_${varName} = new NumberAxis();\n    AreaChart ${varName} = new AreaChart(__xAxis_${varName}, __yAxis_${varName});\n`;
        } else if (op === 'addSeries') {
          methodBody += `    { XYChart.Series __series = new XYChart.Series(); __series.setName(${ev2('data-in-name')}); ${varName}.getData().add(__series); }\n`;
        } else if (op === 'addData') {
          methodBody += `    ${varName}.getData().add(new XYChart.Data<>(${ev2('data-in-x')}, ${ev2('data-in-y')}));\n`;
        } else if (op === 'setTitle') {
          methodBody += `    ${varName}.setTitle(${ev2('data-in-title')});\n`;
        } else if (op === 'setAxisLabels') {
          methodBody += `    // setAxisLabels: x=${ev2('data-in-x')}, y=${ev2('data-in-y')}\n`;
        }
      }
      currentNodeId = nextNode.id;
      currentHandle = 'exec';
    }
    return methodBody;
  };

  return buildMethodBody;
}
