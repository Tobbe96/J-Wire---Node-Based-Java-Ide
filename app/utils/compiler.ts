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