// Node & edge type registries for React Flow

// Node Components
import JavaNode from '../components/JavaNode';
import PrintNode from '../components/Nodes/PrintNode';
import MethodNode from '../components/Nodes/MethodNode';
import MathNode from '../components/Nodes/MathNode';
import MainNode from '../components/Nodes/MainNode';
import CallMethodNode from '../components/Nodes/CallMethodNode';
import BranchNode from '../components/Nodes/BranchNode';
import WhileNode from '../components/Nodes/WhileNode';
import ForNode from '../components/Nodes/ForNode';
import NotNode from '../components/Nodes/NotNode';
import ReturnNode from '../components/Nodes/ReturnNode';
import SetLocalVarNode from '../components/Nodes/SetLocalVarNode';
import SetVariableNode from '../components/Nodes/SetVariableNode';
import VariableGetterNode from '../components/Nodes/VariableGetterNode';
import StringOpNode from '../components/Nodes/StringOpNode';
import ArrayOpNode from '../components/Nodes/ArrayOpNode';
import MathFuncNode from '../components/Nodes/MathFuncNode';
import CastNode from '../components/Nodes/CastNode';
import TernaryNode from '../components/Nodes/TernaryNode';
import DoWhileNode from '../components/Nodes/DoWhileNode';
import SwitchNode from '../components/Nodes/SwitchNode';
import BreakNode from '../components/Nodes/BreakNode';
import ContinueNode from '../components/Nodes/ContinueNode';
import TryCatchFinallyNode from '../components/Nodes/TryCatchFinallyNode';
import ThrowNode from '../components/Nodes/ThrowNode';
import ForEachNode from '../components/Nodes/ForEachNode';
import GroupNode from '../components/Nodes/GroupNode';
import ScannerNode from '../components/Nodes/ScannerNode';
import LiteralNode from '../components/Nodes/LiteralNode';
import IncrementNode from '../components/Nodes/IncrementNode';
import CompoundAssignNode from '../components/Nodes/CompoundAssignNode';
import CommentNode from '../components/Nodes/CommentNode';
import StringFormatNode from '../components/Nodes/StringFormatNode';
import ArrayListOpNode from '../components/Nodes/ArrayListOpNode';
import HashMapOpNode from '../components/Nodes/HashMapOpNode';
import HashSetOpNode from '../components/Nodes/HashSetOpNode';
import CallStaticMethodNode from '../components/Nodes/CallStaticMethodNode';
import CustomCodeNode from '../components/Nodes/CustomCodeNode';

// Edge Components
import AnimatedEdge from '../components/AnimatedEdge';

export const nodeTypes = {
  java: JavaNode,
  print: PrintNode,
  method: MethodNode,
  math: MathNode,
  main: MainNode,
  callMethod: CallMethodNode,
  branch: BranchNode,
  while: WhileNode,
  for: ForNode,
  not: NotNode,
  return: ReturnNode,
  getter: VariableGetterNode,
  setLocalVar: SetLocalVarNode,
  setVar: SetVariableNode,
  stringOp: StringOpNode,
  arrayOp: ArrayOpNode,
  mathFunc: MathFuncNode,
  cast: CastNode,
  ternary: TernaryNode,
  doWhile: DoWhileNode,
  switch: SwitchNode,
  break: BreakNode,
  continue: ContinueNode,
  tryCatchFinally: TryCatchFinallyNode,
  throw: ThrowNode,
  forEach: ForEachNode,
  group: GroupNode,
  scanner: ScannerNode,
  literal: LiteralNode,
  increment: IncrementNode,
  compoundAssign: CompoundAssignNode,
  comment: CommentNode,
  stringFormat: StringFormatNode,
  arrayListOp: ArrayListOpNode,
  hashMapOp: HashMapOpNode,
  hashSetOp: HashSetOpNode,
  callStaticMethod: CallStaticMethodNode,
  customCode: CustomCodeNode,
};

export const edgeTypes = {
  animated: AnimatedEdge,
};
