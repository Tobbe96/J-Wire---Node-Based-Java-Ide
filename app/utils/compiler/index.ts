import { Node, Edge } from '@xyflow/react';
import type { Parameter, LocalVariable, ProjectClassInfo } from '../nodeTypes';
import { ClassMeta } from './types';
import { createEvaluateDataNode } from './evaluateData';
import { createBuildMethodBody } from './buildBody';

export type { ClassMeta };

export function generateJavaCode(
  nodes: Node[],
  edges: Edge[],
  className: string = 'VisualScript',
  projectClasses: ProjectClassInfo[] = [],
  classMeta: ClassMeta = {},
): string {
  const { classType = 'class', extendsClass, implementsInterfaces, isAbstract, packageName } = classMeta;

  // Enum: short-circuit — just emit the constants
  if (classType === 'enum') {
    const enumConstantsNode = nodes.find(n => n.type === 'enumConstants');
    const constants: string[] = (enumConstantsNode?.data.constants as string[]) || [];
    const pkgLine = packageName ? `package ${packageName};\n\n` : '';
    if (constants.length === 0) return `${pkgLine}public enum ${className} {\n  // Add enum constants\n}\n`;
    return `${pkgLine}public enum ${className} {\n  ${constants.join(',\n  ')}\n}\n`;
  }

  const hasScannerNodes = nodes.some(n => n.type === 'scanner');
  const hasArrayListNodes = nodes.some(n => n.type === 'arrayListOp');
  const hasHashMapNodes = nodes.some(n => n.type === 'hashMapOp');
  const hasHashSetNodes = nodes.some(n => n.type === 'hashSetOp');
  const hasCollectionsUtil = nodes.some(n =>
    (n.type === 'arrayListOp' && ['sort', 'reverse'].includes(n.data.operation as string)) ||
    (n.type === 'algorithm' && ['bubbleSort', 'quickSort', 'mergeSort'].includes(n.data.operation as string) &&
      edges.some(e => e.target === n.id && e.targetHandle === 'data-in-list')),
  );
  const hasStackNodes = nodes.some(n => n.type === 'stackOp');
  const hasQueueNodes = nodes.some(n => n.type === 'queueOp');
  const hasDequeNodes = nodes.some(n => n.type === 'dequeOp');
  const hasPriorityQueueNodes = nodes.some(n => n.type === 'priorityQueueOp');
  const hasTreeNodes = nodes.some(n => n.type === 'treeNodeOp' || n.type === 'bstOp' || n.type === 'avlTreeOp' ||
    (n.type === 'algorithm' && ['inorderTraversal','preorderTraversal','postorderTraversal'].includes(n.data.operation as string)));
  const hasBstNodes = nodes.some(n => n.type === 'bstOp');
  const hasAvlNodes = nodes.some(n => n.type === 'avlTreeOp');
  const hasFxNodes = nodes.some(n => ['javafxApp','javafxStageOp','javafxSceneOp','javafxLayoutOp','javafxControlOp','javafxEventOp','javafxStyleOp','javafxDialogOp','javafxMenuOp','javafxTableOp','javafxListOp','javafxMediaOp','javafxChartOp'].includes(n.type as string));
  const hasFxMedia = nodes.some(n => n.type === 'javafxMediaOp');
  const hasFxCharts = nodes.some(n => n.type === 'javafxChartOp');
  const javafxAppNode = nodes.find(n => n.type === 'javafxApp');
  const hasSwingNodes = nodes.some(n => ['swingApp','swingFrameOp','swingPanelOp','swingControlOp','swingEventOp','swingStyleOp','swingDialogOp','swingMenuOp'].includes(n.type as string));
  const swingAppNode = nodes.find(n => n.type === 'swingApp');
  // Tree traversals output ArrayList, so we need it imported even without arrayListOp nodes
  const needsArrayList = hasArrayListNodes || hasTreeNodes;

  let code = '';
  if (packageName) code += `package ${packageName};\n\n`;
  if (hasScannerNodes)      code += 'import java.util.Scanner;\n';
  if (needsArrayList)       code += 'import java.util.ArrayList;\n';
  if (hasHashMapNodes)      code += 'import java.util.HashMap;\n';
  if (hasHashSetNodes)      code += 'import java.util.HashSet;\n';
  if (hasCollectionsUtil)   code += 'import java.util.Collections;\n';
  if (hasStackNodes)        code += 'import java.util.Stack;\n';
  if (hasQueueNodes)        code += 'import java.util.Queue;\nimport java.util.LinkedList;\n';
  if (hasDequeNodes)        code += 'import java.util.Deque;\nimport java.util.ArrayDeque;\n';
  if (hasPriorityQueueNodes) code += 'import java.util.PriorityQueue;\n';
  if (hasFxNodes) {
    code += 'import javafx.application.Application;\n';
    code += 'import javafx.stage.Stage;\n';
    code += 'import javafx.scene.Scene;\n';
    code += 'import javafx.scene.layout.*;\n';
    code += 'import javafx.scene.control.*;\n';
    code += 'import javafx.geometry.*;\n';
    code += 'import javafx.collections.*;\n';
  }
  if (hasFxMedia) {
    code += 'import javafx.scene.image.*;\n';
    code += 'import javafx.scene.media.*;\n';
  }
  if (hasFxCharts) {
    code += 'import javafx.scene.chart.*;\n';
  }
  if (hasSwingNodes) {
    code += 'import javax.swing.*;\n';
    code += 'import java.awt.*;\n';
    code += 'import java.awt.event.*;\n';
  }
  if (hasScannerNodes || needsArrayList || hasHashMapNodes || hasHashSetNodes ||
      hasCollectionsUtil || hasStackNodes || hasQueueNodes || hasDequeNodes || hasPriorityQueueNodes || hasFxNodes || hasSwingNodes) {
    code += '\n';
  }

  // Class declaration
  const abstractMod = (classType === 'class' && isAbstract) ? 'abstract ' : '';
  const keyword = classType === 'interface' ? 'interface' : 'class';
  const extendsPart = (classType === 'class' && extendsClass) ? ` extends ${extendsClass}`
    : (classType === 'class' && hasFxNodes && !extendsClass) ? ' extends Application'
    : (classType === 'class' && hasSwingNodes && swingAppNode && !extendsClass) ? ' extends JFrame' : '';
  const implementsPart = (classType === 'class' && implementsInterfaces?.length)
    ? ` implements ${implementsInterfaces.join(', ')}` : '';
  const extendsInterfacePart = (classType === 'interface' && implementsInterfaces?.length)
    ? ` extends ${implementsInterfaces.join(', ')}` : '';
  code += `public ${abstractMod}${keyword} ${className}${extendsPart}${implementsPart}${extendsInterfacePart} {\n\n`;

  // Interface: only method signatures
  if (classType === 'interface') {
    const methodNodes = nodes.filter(n => n.type === 'method');
    if (methodNodes.length > 0) {
      code += '  // --- Method Signatures ---\n';
      methodNodes.forEach(m => {
        const params: Parameter[] = (m.data.parameters as Parameter[]) || [];
        const paramStr = params.map(p => `${p.type} ${p.name}`).join(', ');
        code += `  ${(m.data.returnType as string) || 'void'} ${m.data.label as string}(${paramStr});\n`;
      });
      code += '\n';
    }
    code += '}\n';
    return code;
  }

  if (hasScannerNodes) code += '  static Scanner __scanner = new Scanner(System.in);\n\n';

  // Class fields
  const vars = nodes.filter(n => n.type === 'java');
  if (vars.length > 0) {
    code += '  // --- Variables ---\n';
    vars.forEach(v => {
      let val: string;
      const rawVal = v.data.value as string;
      switch (v.data.type) {
        case 'String': val = `"${rawVal}"`; break;
        case 'char':   val = rawVal && rawVal.length > 0 ? `'${rawVal.charAt(0)}'` : `'\\u0000'`; break;
        case 'float':  val = /f$/i.test(rawVal) ? rawVal : `${rawVal}f`; break;
        case 'long':   val = rawVal.endsWith('L') ? rawVal : `${rawVal}L`; break;
        default:       val = rawVal; break;
      }
      const modifier = v.data.modifier || 'public';
      const isStatic = v.data.isStatic !== false;
      code += `  ${modifier}${isStatic ? ' static' : ''} ${v.data.type} ${v.data.label as string} = ${val};\n`;
    });
    code += '\n';
  }

  // Build the two core closures — they share scanner state
  const scannerVarMap = new Map<string, string>();
  const scannerVarCounterRef = { current: 0 };
  const evaluateDataNode = createEvaluateDataNode(nodes, edges, projectClasses, scannerVarMap);
  const buildMethodBody = createBuildMethodBody(nodes, edges, projectClasses, evaluateDataNode, scannerVarMap, scannerVarCounterRef);

  // Methods
  nodes.filter(n => n.type === 'method').forEach(m => {
    const params: Parameter[] = (m.data.parameters as Parameter[]) || [];
    const locals: LocalVariable[] = (m.data.localVariables as LocalVariable[]) || [];
    const paramSignature = params.map(p => `${p.type} ${p.name}`).join(', ');
    const returnType = (m.data.returnType as string) || 'void';
    const isStatic = m.data.isStatic !== false;
    const isMethodAbstract = m.data.isAbstract === true;

    if (isMethodAbstract) {
      code += `  ${(m.data.modifier as string) || 'public'} abstract ${returnType} ${m.data.label as string}(${paramSignature});\n\n`;
      return;
    }

    let body = '';
    locals.forEach(l => {
      const val = l.type === 'String' ? `"${l.value}"` : l.value;
      body += `    ${l.type} ${l.name} = ${val};\n`;
    });
    body += buildMethodBody(m.id);

    code += `  ${(m.data.modifier as string) || 'public'}${isStatic ? ' static' : ''} ${returnType} ${m.data.label as string}(${paramSignature}) {\n${body}  }\n\n`;
  });

  // Constructors
  nodes.filter(n => n.type === 'constructor').forEach(c => {
    const params: Parameter[] = (c.data.parameters as Parameter[]) || [];
    const locals: LocalVariable[] = (c.data.localVariables as LocalVariable[]) || [];
    const paramSignature = params.map(p => `${p.type} ${p.name}`).join(', ');

    let body = '';
    locals.forEach(l => {
      const val = l.type === 'String' ? `"${l.value}"` : l.value;
      body += `    ${l.type} ${l.name} = ${val};\n`;
    });
    body += buildMethodBody(c.id);

    code += `  ${(c.data.modifier as string) || 'public'} ${className}(${paramSignature}) {\n${body}  }\n\n`;
  });

  // Main method
  const mainNode = nodes.find(n => n.type === 'main');
  if (mainNode) {
    code += `  public static void main(String[] args) {\n${buildMethodBody(mainNode.id)}  }\n\n`;
  }

  // JavaFX start() method
  if (javafxAppNode) {
    code += `  @Override\n  public void start(Stage primaryStage) {\n${buildMethodBody(javafxAppNode.id)}  }\n\n`;
    if (!mainNode) {
      code += `  public static void main(String[] args) {\n    launch(args);\n  }\n\n`;
    }
  }

  // Swing constructor + main
  if (swingAppNode) {
    code += `  public ${className}() {\n${buildMethodBody(swingAppNode.id)}  }\n\n`;
    if (!mainNode) {
      code += `  public static void main(String[] args) {\n    SwingUtilities.invokeLater(() -> new ${className}());\n  }\n\n`;
    }
  }

  // TreeNode inner class + BST/AVL helper methods
  if (hasTreeNodes) {
    code += `  // --- TreeNode ---\n`;
    code += `  static class TreeNode {\n    int val;\n    TreeNode left, right;\n    TreeNode(int val) { this.val = val; }\n  }\n\n`;
  }
  if (hasBstNodes) {
    code += `  // --- BST Helpers ---\n`;
    code += `  private static TreeNode bstInsert(TreeNode node, int val) {\n    if (node == null) return new TreeNode(val);\n    if (val < node.val) node.left = bstInsert(node.left, val);\n    else if (val > node.val) node.right = bstInsert(node.right, val);\n    return node;\n  }\n`;
    code += `  private static TreeNode bstDelete(TreeNode node, int val) {\n    if (node == null) return null;\n    if (val < node.val) { node.left = bstDelete(node.left, val); return node; }\n    if (val > node.val) { node.right = bstDelete(node.right, val); return node; }\n    if (node.left == null) return node.right;\n    if (node.right == null) return node.left;\n    TreeNode min = node.right;\n    while (min.left != null) min = min.left;\n    node.val = min.val;\n    node.right = bstDelete(node.right, min.val);\n    return node;\n  }\n`;
    code += `  private static boolean bstSearch(TreeNode node, int val) {\n    if (node == null) return false;\n    if (node.val == val) return true;\n    return val < node.val ? bstSearch(node.left, val) : bstSearch(node.right, val);\n  }\n`;
    code += `  private static int bstMin(TreeNode node) {\n    while (node.left != null) node = node.left;\n    return node.val;\n  }\n`;
    code += `  private static int bstMax(TreeNode node) {\n    while (node.right != null) node = node.right;\n    return node.val;\n  }\n`;
    code += `  private static int bstHeight(TreeNode node) {\n    if (node == null) return 0;\n    return 1 + Math.max(bstHeight(node.left), bstHeight(node.right));\n  }\n`;
    code += `  private static int bstSize(TreeNode node) {\n    if (node == null) return 0;\n    return 1 + bstSize(node.left) + bstSize(node.right);\n  }\n`;
    code += `  private static ArrayList<Integer> bstInorder(TreeNode node) {\n    ArrayList<Integer> list = new ArrayList<>();\n    bstInorderHelper(node, list);\n    return list;\n  }\n`;
    code += `  private static void bstInorderHelper(TreeNode node, ArrayList<Integer> list) {\n    if (node == null) return;\n    bstInorderHelper(node.left, list);\n    list.add(node.val);\n    bstInorderHelper(node.right, list);\n  }\n`;
    code += `  private static ArrayList<Integer> bstPreorder(TreeNode node) {\n    ArrayList<Integer> list = new ArrayList<>();\n    bstPreorderHelper(node, list);\n    return list;\n  }\n`;
    code += `  private static void bstPreorderHelper(TreeNode node, ArrayList<Integer> list) {\n    if (node == null) return;\n    list.add(node.val);\n    bstPreorderHelper(node.left, list);\n    bstPreorderHelper(node.right, list);\n  }\n`;
    code += `  private static ArrayList<Integer> bstPostorder(TreeNode node) {\n    ArrayList<Integer> list = new ArrayList<>();\n    bstPostorderHelper(node, list);\n    return list;\n  }\n`;
    code += `  private static void bstPostorderHelper(TreeNode node, ArrayList<Integer> list) {\n    if (node == null) return;\n    bstPostorderHelper(node.left, list);\n    bstPostorderHelper(node.right, list);\n    list.add(node.val);\n  }\n\n`;
  }
  if (hasAvlNodes) {
    code += `  // --- AVL Helpers ---\n`;
    code += `  private static int avlHeight(TreeNode node) {\n    return node == null ? 0 : 1 + Math.max(avlHeight(node.left), avlHeight(node.right));\n  }\n`;
    code += `  private static int avlGetBalance(TreeNode node) {\n    return node == null ? 0 : avlHeight(node.left) - avlHeight(node.right);\n  }\n`;
    code += `  private static TreeNode avlRotateRight(TreeNode y) {\n    TreeNode x = y.left, T2 = x.right;\n    x.right = y; y.left = T2;\n    return x;\n  }\n`;
    code += `  private static TreeNode avlRotateLeft(TreeNode x) {\n    TreeNode y = x.right, T2 = y.left;\n    y.left = x; x.right = T2;\n    return y;\n  }\n`;
    code += `  private static TreeNode avlInsert(TreeNode node, int val) {\n    if (node == null) return new TreeNode(val);\n    if (val < node.val) node.left = avlInsert(node.left, val);\n    else if (val > node.val) node.right = avlInsert(node.right, val);\n    else return node;\n    int bal = avlGetBalance(node);\n    if (bal > 1 && val < node.left.val)  return avlRotateRight(node);\n    if (bal < -1 && val > node.right.val) return avlRotateLeft(node);\n    if (bal > 1 && val > node.left.val)  { node.left = avlRotateLeft(node.left); return avlRotateRight(node); }\n    if (bal < -1 && val < node.right.val) { node.right = avlRotateRight(node.right); return avlRotateLeft(node); }\n    return node;\n  }\n`;
    code += `  private static TreeNode avlDelete(TreeNode node, int val) {\n    if (node == null) return null;\n    if (val < node.val) node.left = avlDelete(node.left, val);\n    else if (val > node.val) node.right = avlDelete(node.right, val);\n    else {\n      if (node.left == null || node.right == null) { node = (node.left != null) ? node.left : node.right; }\n      else { TreeNode min = node.right; while (min.left != null) min = min.left; node.val = min.val; node.right = avlDelete(node.right, min.val); }\n    }\n    if (node == null) return null;\n    int bal = avlGetBalance(node);\n    if (bal > 1 && avlGetBalance(node.left) >= 0)  return avlRotateRight(node);\n    if (bal > 1 && avlGetBalance(node.left) < 0)   { node.left = avlRotateLeft(node.left); return avlRotateRight(node); }\n    if (bal < -1 && avlGetBalance(node.right) <= 0) return avlRotateLeft(node);\n    if (bal < -1 && avlGetBalance(node.right) > 0)  { node.right = avlRotateRight(node.right); return avlRotateLeft(node); }\n    return node;\n  }\n`;
    code += `  private static boolean avlSearch(TreeNode node, int val) { return bstSearch(node, val); }\n`;
    code += `  private static int avlSize(TreeNode node) { return bstSize(node); }\n`;
    code += `  private static ArrayList<Integer> avlInorder(TreeNode node) { return bstInorder(node); }\n\n`;
  }

  code += '}';
  return code;
}
