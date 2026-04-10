import { Node, Edge } from '@xyflow/react';
import { getDefaultLiteral } from './theme';
import type { Parameter, LocalVariable, ProjectClassInfo } from './nodeTypes';

const SCANNER_JAVA_TYPES: Record<string, string> = {
  nextLine: 'String',
  nextInt: 'int',
  nextFloat: 'float',
  nextDouble: 'double',
  nextLong: 'long',
  nextBoolean: 'boolean',
};

/** Wrapper type for Java's boxed type names (needed for generics) */
function boxedType(t: string): string {
  const map: Record<string, string> = {
    int: 'Integer', float: 'Float', double: 'Double',
    long: 'Long', short: 'Short', byte: 'Byte',
    char: 'Character', boolean: 'Boolean',
  };
  return map[t] || t;
}

export function generateJavaCode(nodes: Node[], edges: Edge[], className: string = 'VisualScript', projectClasses: ProjectClassInfo[] = []): string {
  const hasScannerNodes = nodes.some(n => n.type === 'scanner');
  const hasArrayListNodes = nodes.some(n => n.type === 'arrayListOp');
  const hasHashMapNodes = nodes.some(n => n.type === 'hashMapOp');
  const hasHashSetNodes = nodes.some(n => n.type === 'hashSetOp');
  const hasCollectionsUtil = nodes.some(n => n.type === 'arrayListOp' && ['sort', 'reverse'].includes(n.data.operation as string));

  // Helper to resolve a node's output type for a given handle
  const resolveNodeOutputType = (node: Node, sourceHandle?: string): string | null => {
    if (node.type === 'java' || node.type === 'getter') return (node.data.type as string) || null;
    if (node.type === 'literal') return (node.data.literalType as string) || 'String';
    if (node.type === 'scanner') {
      const readType = (node.data.readType as string) || 'nextLine';
      return SCANNER_JAVA_TYPES[readType] || 'String';
    }
    if (node.type === 'cast') return (node.data.targetType as string) || 'String';
    if (node.type === 'stringOp') {
      const op = node.data.operation as string;
      if (op === 'length' || op === 'indexOf') return 'int';
      if (op === 'contains' || op === 'startsWith' || op === 'endsWith') return 'boolean';
      return 'String';
    }
    if (node.type === 'method' && sourceHandle) {
      const paramMatch = sourceHandle.match(/^param-out-(\d+)$/);
      if (paramMatch) {
        const params = (node.data.parameters as Parameter[]) || [];
        return params[parseInt(paramMatch[1], 10)]?.type || null;
      }
      const localMatch = sourceHandle.match(/^local-out-(\d+)$/);
      if (localMatch) {
        const locals = (node.data.localVariables as LocalVariable[]) || [];
        return locals[parseInt(localMatch[1], 10)]?.type || null;
      }
    }
    return (node.data.type as string) || null;
  };

  let code = '';
  if (hasScannerNodes) code += 'import java.util.Scanner;\n';
  if (hasArrayListNodes) code += 'import java.util.ArrayList;\n';
  if (hasHashMapNodes) code += 'import java.util.HashMap;\n';
  if (hasHashSetNodes) code += 'import java.util.HashSet;\n';
  if (hasCollectionsUtil) code += 'import java.util.Collections;\n';
  if (hasScannerNodes || hasArrayListNodes || hasHashMapNodes || hasHashSetNodes || hasCollectionsUtil) code += '\n';
  code += `public class ${className} {\n\n`;

  if (hasScannerNodes) {
    code += '  static Scanner __scanner = new Scanner(System.in);\n\n';
  }

  // 1. Generate Class Fields (Variables)
  const vars = nodes.filter(n => n.type === 'java');
  if (vars.length > 0) {
    code += "  // --- Variables ---\n";
    vars.forEach(v => {
      let val: string;
      const rawVal = v.data.value as string;
      switch (v.data.type) {
        case 'String': val = `"${rawVal}"`; break;
        case 'char': val = `'${rawVal.charAt(0) || '\\u0000'}'`; break;
        case 'float': val = rawVal.includes('f') ? rawVal : `${rawVal}f`; break;
        case 'long': val = rawVal.endsWith('L') ? rawVal : `${rawVal}L`; break;
        default: val = rawVal; break;
      }
      const modifier = v.data.modifier || 'public';
      code += `  ${modifier} static ${v.data.type} ${v.data.label as string} = ${val};\n`;
    });
    code += "\n";
  }

  // --- RECURSIVE DATA READER (now handle-aware) ---
  const scannerVarMap = new Map<string, string>();
  let scannerVarCounter = 0;

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
    if (node.type === 'literal') {
      const litType = (node.data.literalType as string) || 'String';
      const rawVal = (node.data.value as string) || '';
      switch (litType) {
        case 'String': return `"${rawVal}"`;
        case 'float': return rawVal.includes('f') ? rawVal : `${rawVal}f`;
        case 'long': return rawVal.endsWith('L') ? rawVal : `${rawVal}L`;
        default: return rawVal || '0';
      }
    }
    if (node.type === 'math') {
      const edgeA = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-a');
      const edgeB = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-b');
      const valA = edgeA ? evaluateDataNode(edgeA.source, edgeA.sourceHandle || undefined) : ((node.data.inlineA as string) || '0');
      const valB = edgeB ? evaluateDataNode(edgeB.source, edgeB.sourceHandle || undefined) : ((node.data.inlineB as string) || '0');
      const op = node.data.operation as string;
      // Use .equals() for String == / != comparisons
      if ((op === '==' || op === '!=') && edgeA) {
        const srcNode = nodes.find(n => n.id === edgeA.source);
        const srcType = srcNode ? resolveNodeOutputType(srcNode, edgeA.sourceHandle || undefined) : null;
        if (srcType === 'String') {
          return op === '==' ? `${valA}.equals(${valB})` : `!${valA}.equals(${valB})`;
        }
      }
      return `(${valA} ${op} ${valB})`;
    }
    if (node.type === 'not') {
      const op = (node.data.operation as string) || '!';
      const edgeA = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
      const val = edgeA ? evaluateDataNode(edgeA.source, edgeA.sourceHandle || undefined) : (op === '~' ? '0' : 'false');
      return `(${op}${val})`;
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
        case 'split': {
          const edgeStr = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
          const edgeDelim = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-delimiter');
          const val = edgeStr ? evaluateDataNode(edgeStr.source, edgeStr.sourceHandle || undefined) : '""';
          const delim = edgeDelim ? evaluateDataNode(edgeDelim.source, edgeDelim.sourceHandle || undefined) : '","';
          return `${val}.split(${delim})`;
        }
        case 'contains': {
          const edgeStr = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
          const edgeTarget = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-target');
          const val = edgeStr ? evaluateDataNode(edgeStr.source, edgeStr.sourceHandle || undefined) : '""';
          const target = edgeTarget ? evaluateDataNode(edgeTarget.source, edgeTarget.sourceHandle || undefined) : '""';
          return `${val}.contains(${target})`;
        }
        case 'startsWith': {
          const edgeStr = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
          const edgeTarget = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-target');
          const val = edgeStr ? evaluateDataNode(edgeStr.source, edgeStr.sourceHandle || undefined) : '""';
          const target = edgeTarget ? evaluateDataNode(edgeTarget.source, edgeTarget.sourceHandle || undefined) : '""';
          return `${val}.startsWith(${target})`;
        }
        case 'endsWith': {
          const edgeStr = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
          const edgeTarget = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-target');
          const val = edgeStr ? evaluateDataNode(edgeStr.source, edgeStr.sourceHandle || undefined) : '""';
          const target = edgeTarget ? evaluateDataNode(edgeTarget.source, edgeTarget.sourceHandle || undefined) : '""';
          return `${val}.endsWith(${target})`;
        }
        default: return '""';
      }
    }
    if (node.type === 'mathFunc') {
      const op = node.data.operation as string;
      // Single-input functions
      if (['abs', 'sqrt', 'ceil', 'floor', 'round', 'log', 'log10', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan'].includes(op)) {
        const edgeIn = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in');
        const val = edgeIn ? evaluateDataNode(edgeIn.source, edgeIn.sourceHandle || undefined) : '0';
        if (op === 'abs') return `Math.abs(${val})`;
        if (op === 'sqrt') return `Math.sqrt(${val})`;
        if (op === 'ceil') return `(int)Math.ceil(${val})`;
        if (op === 'floor') return `(int)Math.floor(${val})`;
        if (op === 'round') return `(int)Math.round(${val})`;
        if (op === 'log') return `Math.log(${val})`;
        if (op === 'log10') return `Math.log10(${val})`;
        if (op === 'sin') return `Math.sin(${val})`;
        if (op === 'cos') return `Math.cos(${val})`;
        if (op === 'tan') return `Math.tan(${val})`;
        if (op === 'asin') return `Math.asin(${val})`;
        if (op === 'acos') return `Math.acos(${val})`;
        if (op === 'atan') return `Math.atan(${val})`;
      }
      if (op === 'random') return 'Math.random()';
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
        case 'long': return `Long.parseLong(String.valueOf(${val}))`;
        case 'short': return `Short.parseShort(String.valueOf(${val}))`;
        case 'byte': return `Byte.parseByte(String.valueOf(${val}))`;
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
            : arrayType === 'boolean'
              ? items.join(', ')
              : arrayType === 'float'
                ? items.map(v => v.includes('.') ? v + 'f' : v + '.0f').join(', ')
                : arrayType === 'long'
                  ? items.map(v => v + 'L').join(', ')
                  : items.join(', ');
          return `new ${arrayType}[]{${formatted}}`;
        }
        case 'new': {
          const arrayType = (node.data.arrayType as string) || 'int';
          const sizeEdge = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-size');
          const sizeExpr = sizeEdge ? evaluateDataNode(sizeEdge.source, sizeEdge.sourceHandle || undefined) : '0';
          return `new ${arrayType}[${sizeExpr}]`;
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
    if (node.type === 'stringFormat') {
      const fmt = (node.data.formatString as string) || '';
      const argCount = (node.data.argCount as number) || 0;
      const args: string[] = [];
      for (let i = 0; i < argCount; i++) {
        const argEdge = edges.find(e => e.target === nodeId && e.targetHandle === `data-in-arg-${i}`);
        args.push(argEdge ? evaluateDataNode(argEdge.source, argEdge.sourceHandle || undefined) : '""');
      }
      return args.length > 0
        ? `String.format("${fmt}", ${args.join(', ')})`
        : `String.format("${fmt}")`;
    }
    if (node.type === 'arrayListOp') {
      const op = node.data.operation as string;
      const varName = (node.data.variableName as string) || 'list';
      if (op === 'get') {
        const idxEdge = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-index');
        const idx = idxEdge ? evaluateDataNode(idxEdge.source, idxEdge.sourceHandle || undefined) : '0';
        return `${varName}.get(${idx})`;
      }
      if (op === 'size') return `${varName}.size()`;
      if (op === 'contains') {
        const valEdge = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-value');
        const val = valEdge ? evaluateDataNode(valEdge.source, valEdge.sourceHandle || undefined) : 'null';
        return `${varName}.contains(${val})`;
      }
      return 'null';
    }
    if (node.type === 'hashMapOp') {
      const op = node.data.operation as string;
      const varName = (node.data.variableName as string) || 'map';
      if (op === 'get') {
        const keyEdge = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-key');
        const key = keyEdge ? evaluateDataNode(keyEdge.source, keyEdge.sourceHandle || undefined) : 'null';
        return `${varName}.get(${key})`;
      }
      if (op === 'containsKey') {
        const keyEdge = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-key');
        const key = keyEdge ? evaluateDataNode(keyEdge.source, keyEdge.sourceHandle || undefined) : 'null';
        return `${varName}.containsKey(${key})`;
      }
      if (op === 'size') return `${varName}.size()`;
      if (op === 'keySet') return `${varName}.keySet()`;
      return 'null';
    }
    if (node.type === 'hashSetOp') {
      const op = node.data.operation as string;
      const varName = (node.data.variableName as string) || 'set';
      if (op === 'contains') {
        const valEdge = edges.find(e => e.target === nodeId && e.targetHandle === 'data-in-value');
        const val = valEdge ? evaluateDataNode(valEdge.source, valEdge.sourceHandle || undefined) : 'null';
        return `${varName}.contains(${val})`;
      }
      if (op === 'size') return `${varName}.size()`;
      return 'null';
    }
    if (node.type === 'forEach') {
      if (sourceHandle === 'data-out-element') return '__elem__';
      if (sourceHandle === 'data-out-index') return '__idx__';
      return '""';
    }
    if (node.type === 'for') {
      return 'i';
    }
    if (node.type === 'tryCatchFinally') {
      if (sourceHandle === 'data-out-exception') return 'e.getMessage()';
    }
    if (node.type === 'scanner') {
      return scannerVarMap.get(nodeId) || 'null';
    }
    if (node.type === 'callStaticMethod') {
      const targetClass = node.data.targetClass as string;
      const methodName = node.data.methodName as string;
      if (targetClass && methodName) {
        const targetFile = projectClasses.find(f => f.className === targetClass);
        const targetMethod = targetFile?.methods.find(m => m.name === methodName);
        const targetParams = targetMethod?.parameters || [];
        const args = targetParams.map((p: Parameter, index: number) => {
          const argEdge = edges.find(e => e.target === nodeId && e.targetHandle === `arg-in-${index}`);
          return argEdge ? evaluateDataNode(argEdge.source, argEdge.sourceHandle || undefined) : getDefaultLiteral(p.type);
        });
        return `${targetClass}.${methodName}(${args.join(', ')})`;
      }
      return 'null';
    }
    if (node.type === 'customCode' && node.data.mode === 'expression') {
      let code = (node.data.code as string) || '0';
      const inputs = (node.data.inputs as Array<{id: string; name: string; type: string}>) || [];
      inputs.forEach((input, index) => {
        const inputEdge = edges.find(e => e.target === nodeId && e.targetHandle === `custom-in-${index}`);
        const val = inputEdge ? evaluateDataNode(inputEdge.source, inputEdge.sourceHandle || undefined) : getDefaultLiteral(input.type);
        code = code.replaceAll(input.name, `(${val})`);
      });
      return `(${code})`;
    }
    return '""';
  };

  // --- LOGIC TRAVERSAL ---
  // Helper: get inline value as Java literal for a node's data-in handle
  const getInlineValue = (node: Node, key: string, javaType: string = 'String'): string | null => {
    const val = node.data[key] as string | undefined;
    if (val === undefined || val === null || val === '') return null;
    if (javaType === 'String') return `"${val}"`;
    return val;
  };

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
            const argEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === `arg-in-${index}`);
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
          const targetMethod = targetFile?.methods.find(m => m.name === methodName);
          const targetParams = targetMethod?.parameters || [];
          const args = targetParams.map((p: Parameter, index: number) => {
            const argEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === `arg-in-${index}`);
            return argEdge ? evaluateDataNode(argEdge.source, argEdge.sourceHandle || undefined) : getDefaultLiteral(p.type);
          });
          methodBody += `    ${targetClass}.${methodName}(${args.join(', ')});\n`;
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
        const newValue = dataEdge
          ? evaluateDataNode(dataEdge.source, dataEdge.sourceHandle || undefined)
          : (getInlineValue(nextNode, 'inlineValue', 'raw') ?? '0');
        methodBody += `    ${nextNode.data.variableName} = ${newValue};\n`;
      }

      if (nextNode.type === 'setLocalVar') {
        const localVarName = nextNode.data.localVarName as string;
        const dataEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in');
        const newValue = dataEdge
          ? evaluateDataNode(dataEdge.source, dataEdge.sourceHandle || undefined)
          : (getInlineValue(nextNode, 'inlineValue', 'raw') ?? '0');
        if (localVarName) {
          methodBody += `    ${localVarName} = ${newValue};\n`;
        }
      }

      if (nextNode.type === 'increment') {
        const varName = (nextNode.data.variableName as string) || 'x';
        const mode = (nextNode.data.mode as string) || 'post-increment';
        switch (mode) {
          case 'post-increment': methodBody += `    ${varName}++;\n`; break;
          case 'post-decrement': methodBody += `    ${varName}--;\n`; break;
          case 'pre-increment': methodBody += `    ++${varName};\n`; break;
          case 'pre-decrement': methodBody += `    --${varName};\n`; break;
        }
      }

      if (nextNode.type === 'compoundAssign') {
        const varName = (nextNode.data.variableName as string) || 'x';
        const operator = (nextNode.data.operator as string) || '+=';
        const dataEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in');
        const value = dataEdge
          ? evaluateDataNode(dataEdge.source, dataEdge.sourceHandle || undefined)
          : (getInlineValue(nextNode, 'inlineValue', 'raw') ?? '0');
        methodBody += `    ${varName} ${operator} ${value};\n`;
      }

      if (nextNode.type === 'comment') {
        const text = (nextNode.data.text as string) || '';
        const lines = text.split('\n');
        lines.forEach(line => {
          methodBody += `    // ${line}\n`;
        });
      }

      if (nextNode.type === 'customCode' && nextNode.data.mode === 'statement') {
        let code = (nextNode.data.code as string) || '';
        const inputs = (nextNode.data.inputs as Array<{id: string; name: string; type: string}>) || [];
        inputs.forEach((input, index) => {
          const inputEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === `custom-in-${index}`);
          const val = inputEdge ? evaluateDataNode(inputEdge.source, inputEdge.sourceHandle || undefined) : getDefaultLiteral(input.type);
          code = code.replaceAll(input.name, val);
        });
        const codeLines = code.split('\n');
        codeLines.forEach(line => {
          methodBody += `    ${line}\n`;
        });
      }

      if (nextNode.type === 'arrayListOp') {
        const op = nextNode.data.operation as string;
        const varName = (nextNode.data.variableName as string) || 'list';
        const elemType = (nextNode.data.elementType as string) || 'int';
        if (op === 'create') {
          methodBody += `    ArrayList<${boxedType(elemType)}> ${varName} = new ArrayList<>();\n`;
        } else if (op === 'add') {
          const valEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in-value');
          const val = valEdge ? evaluateDataNode(valEdge.source, valEdge.sourceHandle || undefined) : getDefaultLiteral(elemType);
          methodBody += `    ${varName}.add(${val});\n`;
        } else if (op === 'set') {
          const idxEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in-index');
          const valEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in-value');
          const idx = idxEdge ? evaluateDataNode(idxEdge.source, idxEdge.sourceHandle || undefined) : '0';
          const val = valEdge ? evaluateDataNode(valEdge.source, valEdge.sourceHandle || undefined) : getDefaultLiteral(elemType);
          methodBody += `    ${varName}.set(${idx}, ${val});\n`;
        } else if (op === 'remove') {
          const idxEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in-index');
          const idx = idxEdge ? evaluateDataNode(idxEdge.source, idxEdge.sourceHandle || undefined) : '0';
          methodBody += `    ${varName}.remove(${idx});\n`;
        } else if (op === 'clear') {
          methodBody += `    ${varName}.clear();\n`;
        } else if (op === 'sort') {
          methodBody += `    Collections.sort(${varName});\n`;
        } else if (op === 'reverse') {
          methodBody += `    Collections.reverse(${varName});\n`;
        }
      }

      if (nextNode.type === 'hashSetOp') {
        const op = nextNode.data.operation as string;
        const varName = (nextNode.data.variableName as string) || 'set';
        const elemType = (nextNode.data.elementType as string) || 'int';
        if (op === 'create') {
          methodBody += `    HashSet<${boxedType(elemType)}> ${varName} = new HashSet<>();\n`;
        } else if (op === 'add') {
          const valEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in-value');
          const val = valEdge ? evaluateDataNode(valEdge.source, valEdge.sourceHandle || undefined) : getDefaultLiteral(elemType);
          methodBody += `    ${varName}.add(${val});\n`;
        } else if (op === 'remove') {
          const valEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in-value');
          const val = valEdge ? evaluateDataNode(valEdge.source, valEdge.sourceHandle || undefined) : getDefaultLiteral(elemType);
          methodBody += `    ${varName}.remove(${val});\n`;
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
          const keyEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in-key');
          const valEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in-value');
          const key = keyEdge ? evaluateDataNode(keyEdge.source, keyEdge.sourceHandle || undefined) : getDefaultLiteral(keyType);
          const val = valEdge ? evaluateDataNode(valEdge.source, valEdge.sourceHandle || undefined) : getDefaultLiteral(valType);
          methodBody += `    ${varName}.put(${key}, ${val});\n`;
        } else if (op === 'remove') {
          const keyEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in-key');
          const key = keyEdge ? evaluateDataNode(keyEdge.source, keyEdge.sourceHandle || undefined) : getDefaultLiteral(keyType);
          methodBody += `    ${varName}.remove(${key});\n`;
        }
      }

      if (nextNode.type === 'branch') {
        const condEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in');
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

      // Array Set: arr[idx] = value;
      if (nextNode.type === 'arrayOp' && nextNode.data.operation === 'set') {
        const arrEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in-array');
        const idxEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in-index');
        const valEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in-value');
        const arrExpr = arrEdge ? evaluateDataNode(arrEdge.source, arrEdge.sourceHandle || undefined) : 'arr';
        const idxExpr = idxEdge ? evaluateDataNode(idxEdge.source, idxEdge.sourceHandle || undefined) : '0';
        const valExpr = valEdge ? evaluateDataNode(valEdge.source, valEdge.sourceHandle || undefined) : '0';
        methodBody += `    ${arrExpr}[${idxExpr}] = ${valExpr};\n`;
      }

      // For-Each: for (Type elem : arr) { ... }
      if (nextNode.type === 'forEach') {
        const elemType = (nextNode.data.elementType as string) || 'int';
        const arrEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in-array');
        const arrExpr = arrEdge ? evaluateDataNode(arrEdge.source, arrEdge.sourceHandle || undefined) : 'new int[]{}';
        methodBody += `    { int __idx__ = 0;\n`;
        methodBody += `    for (${elemType} __elem__ : ${arrExpr}) {\n`;
        methodBody += buildMethodBody(nextNode.id, 'exec-body', visited);
        methodBody += `      __idx__++;\n`;
        methodBody += `    }}\n`;
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

      if (nextNode.type === 'tryCatchFinally') {
        methodBody += `    try {\n`;
        methodBody += buildMethodBody(nextNode.id, 'exec-try', visited);
        methodBody += `    } catch (Exception e) {\n`;
        methodBody += buildMethodBody(nextNode.id, 'exec-catch', visited);
        methodBody += `    } finally {\n`;
        methodBody += buildMethodBody(nextNode.id, 'exec-finally', visited);
        methodBody += `    }\n`;
        methodBody += buildMethodBody(nextNode.id, 'exec-out', visited);
        break;
      }

      if (nextNode.type === 'throw') {
        const msgEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in');
        const message = msgEdge
          ? evaluateDataNode(msgEdge.source, msgEdge.sourceHandle || undefined)
          : (getInlineValue(nextNode, 'inlineValue') ?? '"Error"');
        methodBody += `    throw new RuntimeException(${message});\n`;
        break;
      }

      if (nextNode.type === 'scanner') {
        const readType = (nextNode.data.readType as string) || 'nextLine';
        const javaType = SCANNER_JAVA_TYPES[readType] || 'String';
        const varName = `__input_${scannerVarCounter++}__`;
        scannerVarMap.set(nextNode.id, varName);

        const promptEdge = edges.find(e => e.target === nextNode.id && e.targetHandle === 'data-in-prompt');
        if (promptEdge) {
          const promptExpr = evaluateDataNode(promptEdge.source, promptEdge.sourceHandle || undefined);
          methodBody += `    System.out.print(${promptExpr});\n`;
        } else {
          const inlinePrompt = getInlineValue(nextNode, 'inlinePrompt');
          if (inlinePrompt) {
            methodBody += `    System.out.print(${inlinePrompt});\n`;
          }
        }
        methodBody += `    ${javaType} ${varName} = __scanner.${readType}();\n`;
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
    code += `  public static ${returnType} ${m.data.label as string}(${paramSignature}) {\n${body}  }\n\n`;
  });

  // Main
  const mainNode = nodes.find(n => n.type === 'main');
  if (mainNode) {
    code += `  public static void main(String[] args) {\n${buildMethodBody(mainNode.id)}  }\n\n`;
  }

  code += "}";
  return code;
}