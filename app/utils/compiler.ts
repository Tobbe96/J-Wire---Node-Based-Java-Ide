import { Node, Edge } from '@xyflow/react';
import { getDefaultLiteral } from './theme';
import type { Parameter, LocalVariable } from './nodeTypes';

export function generateJavaCode(nodes: Node[], edges: Edge[], className: string = 'VisualScript'): string {
  let code = `public class ${className} {\n\n`;

  // 1. Generate Class Fields (Variables)
  const vars = nodes.filter(n => n.type === 'java');
  if (vars.length > 0) {
    code += "  // --- Variables ---\n";
    vars.forEach(v => {
      const val = v.data.type === 'String' ? `"${v.data.value}"` : v.data.value;
      const modifier = v.data.modifier || 'public';
      code += `  ${modifier} ${v.data.type} ${v.data.label as string} = ${val};\n`;
    });
    code += "\n";
  }

  // --- RECURSIVE DATA READER (now handle-aware) ---
  const evaluateDataNode = (nodeId: string, sourceHandle?: string): string => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return 'null';

    // Method node parameter output: resolve to parameter name
    if (node.type === 'method' && sourceHandle) {
      const paramMatch = sourceHandle.match(/^param-out-(\d+)$/);
      if (paramMatch) {
        const index = parseInt(paramMatch[1], 10);
        const params = (node.data.parameters as Parameter[]) || [];
        return params[index]?.name || 'null';
      }
      const localMatch = sourceHandle.match(/^local-out-(\d+)$/);
      if (localMatch) {
        const index = parseInt(localMatch[1], 10);
        const locals = (node.data.localVariables as LocalVariable[]) || [];
        return locals[index]?.name || 'null';
      }
    }

    if (node.type === 'java') return node.data.label as string;
    if (node.type === 'getter') return node.data.label as string;
    if (node.type === 'math') {
      const edgeA = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-a');
      const edgeB = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-b');
      const valA = edgeA ? evaluateDataNode(edgeA.source, edgeA.sourceHandle || undefined) : '0';
      const valB = edgeB ? evaluateDataNode(edgeB.source, edgeB.sourceHandle || undefined) : '0';
      return `(${valA} ${node.data.operation} ${valB})`;
    }
    if (node.type === 'not') {
      const edgeA = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
      const val = edgeA ? evaluateDataNode(edgeA.source, edgeA.sourceHandle || undefined) : 'false';
      return `(!${val})`;
    }
    if (node.type === 'stringOp') {
      switch (node.data.operation) {
        case 'concat': {
          const edgeA = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-a');
          const edgeB = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-b');
          const valA = edgeA ? evaluateDataNode(edgeA.source, edgeA.sourceHandle || undefined) : '""';
          const valB = edgeB ? evaluateDataNode(edgeB.source, edgeB.sourceHandle || undefined) : '""';
          return `(${valA} + ${valB})`;
        }
        case 'length': {
          const edgeIn = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
          const valA = edgeIn ? evaluateDataNode(edgeIn.source, edgeIn.sourceHandle || undefined) : '""';
          return `${valA}.length()`;
        }
        case 'substring': {
          const edgeStr = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
          const edgeStart = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-start');
          const edgeEnd = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-end');
          const val = edgeStr ? evaluateDataNode(edgeStr.source, edgeStr.sourceHandle || undefined) : '""';
          const start = edgeStart ? evaluateDataNode(edgeStart.source, edgeStart.sourceHandle || undefined) : '0';
          const end = edgeEnd ? evaluateDataNode(edgeEnd.source, edgeEnd.sourceHandle || undefined) : '0';
          return `${val}.substring(${start}, ${end})`;
        }
        case 'charAt': {
          const edgeStr = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
          const edgeIdx = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-index');
          const val = edgeStr ? evaluateDataNode(edgeStr.source, edgeStr.sourceHandle || undefined) : '""';
          const idx = edgeIdx ? evaluateDataNode(edgeIdx.source, edgeIdx.sourceHandle || undefined) : '0';
          return `String.valueOf(${val}.charAt(${idx}))`;
        }
        case 'indexOf': {
          const edgeStr = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
          const edgeTarget = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-target');
          const val = edgeStr ? evaluateDataNode(edgeStr.source, edgeStr.sourceHandle || undefined) : '""';
          const target = edgeTarget ? evaluateDataNode(edgeTarget.source, edgeTarget.sourceHandle || undefined) : '""';
          return `${val}.indexOf(${target})`;
        }
        case 'replace': {
          const edgeStr = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
          const edgeTarget = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-target');
          const edgeRepl = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-replacement');
          const val = edgeStr ? evaluateDataNode(edgeStr.source, edgeStr.sourceHandle || undefined) : '""';
          const target = edgeTarget ? evaluateDataNode(edgeTarget.source, edgeTarget.sourceHandle || undefined) : '""';
          const repl = edgeRepl ? evaluateDataNode(edgeRepl.source, edgeRepl.sourceHandle || undefined) : '""';
          return `${val}.replace(${target}, ${repl})`;
        }
        case 'trim': {
          const edgeIn = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
          const val = edgeIn ? evaluateDataNode(edgeIn.source, edgeIn.sourceHandle || undefined) : '""';
          return `${val}.trim()`;
        }
        case 'toUpperCase': {
          const edgeIn = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
          const val = edgeIn ? evaluateDataNode(edgeIn.source, edgeIn.sourceHandle || undefined) : '""';
          return `${val}.toUpperCase()`;
        }
        case 'toLowerCase': {
          const edgeIn = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
          const val = edgeIn ? evaluateDataNode(edgeIn.source, edgeIn.sourceHandle || undefined) : '""';
          return `${val}.toLowerCase()`;
        }
        default: return '""';
      }
    }
    if (node.type === 'mathFunc') {
      const op = node.data.operation as string;
      if (op === 'abs') {
        const edgeIn = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
        const val = edgeIn ? evaluateDataNode(edgeIn.source, edgeIn.sourceHandle || undefined) : '0';
        return `Math.abs(${val})`;
      }
      const edgeA = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-a');
      const edgeB = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-b');
      const valA = edgeA ? evaluateDataNode(edgeA.source, edgeA.sourceHandle || undefined) : '0';
      const valB = edgeB ? evaluateDataNode(edgeB.source, edgeB.sourceHandle || undefined) : '0';
      if (op === 'pow') return `(int)Math.pow(${valA}, ${valB})`;
      return `Math.${op}(${valA}, ${valB})`;
    }
    if (node.type === 'cast') {
      const edgeIn = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
      const val = edgeIn ? evaluateDataNode(edgeIn.source, edgeIn.sourceHandle || undefined) : 'null';
      const targetType = (node.data.targetType as string) || 'String';
      switch (targetType) {
        case 'int': return `Integer.parseInt(String.valueOf(${val}))`;
        case 'float': return `Float.parseFloat(String.valueOf(${val}))`;
        case 'double': return `Double.parseDouble(String.valueOf(${val}))`;
        case 'boolean': return `Boolean.parseBoolean(String.valueOf(${val}))`;
        case 'String': return `String.valueOf(${val})`;
        default: return `(${targetType})${val}`;
      }
    }
    if (node.type === 'ternary') {
      const edgeCond = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-condition');
      const edgeTrue = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-true');
      const edgeFalse = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-false');
      const cond = edgeCond ? evaluateDataNode(edgeCond.source, edgeCond.sourceHandle || undefined) : 'false';
      const trueVal = edgeTrue ? evaluateDataNode(edgeTrue.source, edgeTrue.sourceHandle || undefined) : 'null';
      const falseVal = edgeFalse ? evaluateDataNode(edgeFalse.source, edgeFalse.sourceHandle || undefined) : 'null';
      return `(${cond} ? ${trueVal} : ${falseVal})`;
    }
    if (node.type === 'arrayOp') {
      switch (node.data.operation) {
        case 'literal': {
          const arrayType = (node.data.arrayType as string) || 'int';
          const rawValues = (node.data.values as string) || '';
          const items = rawValues.split(',').map(v => v.trim()).filter(Boolean);
          const formatted = arrayType === 'String'
            ? items.map(v => `"${v}"`).join(', ')
            : items.join(', ');
          return `new ${arrayType}[]{${formatted}}`;
        }
        case 'access': {
          const edgeArr = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-array');
          const edgeIdx = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-index');
          const arrExpr = edgeArr ? evaluateDataNode(edgeArr.source, edgeArr.sourceHandle || undefined) : 'null';
          const idxExpr = edgeIdx ? evaluateDataNode(edgeIdx.source, edgeIdx.sourceHandle || undefined) : '0';
          return `${arrExpr}[${idxExpr}]`;
        }
        case 'length': {
          const edgeIn = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
          const arrExpr = edgeIn ? evaluateDataNode(edgeIn.source, edgeIn.sourceHandle || undefined) : 'null';
          return `${arrExpr}.length`;
        }
        default: return 'null';
      }
    }
    if (node.type === 'for') {
      return 'i';
    }
    return '""';
  };

  // --- LOGIC TRAVERSAL ---
  const buildMethodBody = (startNodeId: string, startHandle: string = 'exec', visited = new Set<string>()): string => {
    let currentNodeId = startNodeId;
    let currentHandle = startHandle;
    let methodBody = "";

    while (true) {
      const execEdge = edges.find(e => 
        e.source === currentNodeId && 
        e.sourceHandle && 
        e.sourceHandle.includes(currentHandle)
      );
      
      if (!execEdge) break;
      const nextNode = nodes.find(n => n.id === execEdge.target);
      if (!nextNode) break;

      if (visited.has(nextNode.id)) {
        methodBody += "    // [Warning: Infinite Loop Detected]\n";
        break;
      }
      visited.add(nextNode.id);

      if (nextNode.type === 'print') {
        const dataEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in');
        const printTarget = dataEdge ? evaluateDataNode(dataEdge.source, dataEdge.sourceHandle || undefined) : '""';
        methodBody += `    System.out.println(${printTarget});\n`;
      }
      
      if (nextNode.type === 'callMethod') {
        const methodName = nextNode.data.methodName as string;
        const targetMethodNode = nodes.find(n => n.type === 'method' && n.data.label === methodName);
      const targetParams = (targetMethodNode?.data?.parameters as Parameter[]) || [];

        if (targetParams.length > 0) {
          const args = targetParams.map((p: Parameter, index: number) => {
            const argEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === `arg-in-${index}`);
            return argEdge ? evaluateDataNode(argEdge.source, argEdge.sourceHandle || undefined) : (p.defaultValue ?? getDefaultLiteral(p.type));
          });
          methodBody += `    ${methodName}(${args.join(', ')});\n`;
        } else {
          methodBody += `    ${methodName}();\n`;
        }
      }

      if (nextNode.type === 'return') {
        const dataEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in');
        const returnVal = dataEdge ? evaluateDataNode(dataEdge.source, dataEdge.sourceHandle || undefined) : 'null';
        methodBody += `    return ${returnVal};\n`;
        break; 
      }

      if (nextNode.type === 'break') {
        methodBody += `    break;\n`;
        break;
      }

      if (nextNode.type === 'continue') {
        methodBody += `    continue;\n`;
        break;
      }

      if (nextNode.type === 'setVar') {
        const dataEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in');
        const newValue = dataEdge ? evaluateDataNode(dataEdge.source, dataEdge.sourceHandle || undefined) : '0';
        methodBody += `    ${nextNode.data.variableName} = ${newValue};\n`;
      }

      if (nextNode.type === 'setLocalVar') {
        const localVarName = nextNode.data.localVarName as string;
        const dataEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in');
        const newValue = dataEdge ? evaluateDataNode(dataEdge.source, dataEdge.sourceHandle || undefined) : '0';
        if (localVarName) {
          methodBody += `    ${localVarName} = ${newValue};\n`;
        }
      }

      if (nextNode.type === 'branch') {
        const condEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in');
        const condition = condEdge ? evaluateDataNode(condEdge.source, condEdge.sourceHandle || undefined) : 'false';
        methodBody += `    if (${condition}) {\n`;
        methodBody += buildMethodBody(nextNode.id, 'exec-out-true', visited);
        methodBody += `    } else {\n`;
        methodBody += buildMethodBody(nextNode.id, 'exec-out-false', visited);
        methodBody += `    }\n`;
        break; 
      }

      if (nextNode.type === 'while') {
        const condEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in');
        const condition = condEdge ? evaluateDataNode(condEdge.source, condEdge.sourceHandle || undefined) : 'false';
        methodBody += `    while (${condition}) {\n`;
        methodBody += buildMethodBody(nextNode.id, 'exec-body', visited);
        methodBody += `    }\n`;
        methodBody += buildMethodBody(nextNode.id, 'exec-out', visited);
        break; 
      }

      if (nextNode.type === 'for') {
        const startEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-start');
        const endEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-end');
        const startVal = startEdge ? evaluateDataNode(startEdge.source, startEdge.sourceHandle || undefined) : '0';
        const endVal = endEdge ? evaluateDataNode(endEdge.source, endEdge.sourceHandle || undefined) : '10';
        methodBody += `    for (int i = ${startVal}; i < ${endVal}; i++) {\n`;
        methodBody += buildMethodBody(nextNode.id, 'exec-body', visited);
        methodBody += `    }\n`;
        methodBody += buildMethodBody(nextNode.id, 'exec-out', visited);
        break;
      }

      if (nextNode.type === 'doWhile') {
        const condEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in');
        const condition = condEdge ? evaluateDataNode(condEdge.source, condEdge.sourceHandle || undefined) : 'false';
        methodBody += `    do {\n`;
        methodBody += buildMethodBody(nextNode.id, 'exec-body', visited);
        methodBody += `    } while (${condition});\n`;
        methodBody += buildMethodBody(nextNode.id, 'exec-out', visited);
        break;
      }

      if (nextNode.type === 'switch') {
        const valEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in');
        const switchVal = valEdge ? evaluateDataNode(valEdge.source, valEdge.sourceHandle || undefined) : '0';
        const caseCount = (nextNode.data.caseCount as number) || 2;
        methodBody += `    switch (${switchVal}) {\n`;
        for (let i = 0; i < caseCount; i++) {
          const caseEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === `data-case-${i}`);
          const caseVal = caseEdge ? evaluateDataNode(caseEdge.source, caseEdge.sourceHandle || undefined) : String(i);
          methodBody += `      case ${caseVal}:\n`;
          methodBody += buildMethodBody(nextNode.id, `exec-case-${i}`, visited);
          methodBody += `        break;\n`;
        }
        methodBody += `      default:\n`;
        methodBody += buildMethodBody(nextNode.id, 'exec-default', visited);
        methodBody += `        break;\n`;
        methodBody += `    }\n`;
        methodBody += buildMethodBody(nextNode.id, 'exec-out', visited);
        break;
      }

      currentNodeId = nextNode.id;
      currentHandle = 'exec';
    }
    return methodBody;
  };

  // Methods
  nodes.filter(n => n.type === 'method').forEach(m => {
    const params = (m.data.parameters as Parameter[]) || [];
    const locals = (m.data.localVariables as LocalVariable[]) || [];
    const paramSignature = params.map((p: Parameter) => `${p.type} ${p.name}`).join(', ');

    let body = '';
    locals.forEach((l: LocalVariable) => {
      const val = l.type === 'String' ? `"${l.value}"` : l.value;
      body += `    ${l.type} ${l.name} = ${val};\n`;
    });
    body += buildMethodBody(m.id);

    const returnType = (m.data.returnType as string) || 'void';
    code += `  public ${returnType} ${m.data.label as string}(${paramSignature}) {\n${body}  }\n\n`;
  });

  // Main
  const mainNode = nodes.find(n => n.type === 'main');
  if (mainNode) {
    code += `  public static void main(String[] args) {\n${buildMethodBody(mainNode.id)}  }\n\n`;
  }

  code += "}";
  return code;
}