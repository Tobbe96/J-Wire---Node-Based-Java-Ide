# j-flow Architecture

## Overview

j-flow is a **visual Java IDE** that lets users build Java programs by connecting nodes on a drag-and-drop flowchart canvas. The node graph is compiled to valid Java source code in real time and can be executed either in-browser (via a simulated runtime) or server-side (via `javac` + `java`).

The core loop is: **drag nodes → connect wires → see Java code → run it**.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| UI Library | [React 19](https://react.dev/) |
| Graph Editor | [React Flow v12](https://reactflow.dev/) (`@xyflow/react`) |
| State Management | [Zustand 5](https://zustand-demo.pmnd.rs/) + [Zundo](https://github.com/charkour/zundo) (undo/redo) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| Syntax Highlighting | [Shiki 4](https://shiki.style/) |
| Auto Layout | [Dagre](https://github.com/dagrejs/dagre) |
| Schema Validation | [Zod 4](https://zod.dev/) |
| Particle Effects | [tsParticles](https://particles.js.org/) |
| Testing | [Vitest 4](https://vitest.dev/) + [Testing Library](https://testing-library.com/) + jsdom |
| Linting | [ESLint 9](https://eslint.org/) + eslint-config-next |
| Git Hooks | [Husky 9](https://typicode.github.io/husky/) + lint-staged |
| Language | TypeScript 5 (strict) |

## Directory Structure

```
j-flow/
├── app/
│   ├── api/
│   │   └── compile/
│   │       └── route.ts            # POST endpoint: compiles & runs Java server-side
│   ├── components/
│   │   ├── Nodes/                  # 75+ node components (one per Java construct)
│   │   │   ├── MainNode.tsx        # Entry point node (public static void main)
│   │   │   ├── MethodNode.tsx      # User-defined method declarations
│   │   │   ├── ConstructorNode.tsx  # Constructor definitions
│   │   │   ├── VariableGetterNode.tsx  # Read a class field
│   │   │   ├── PrintNode.tsx       # System.out.println
│   │   │   ├── BranchNode.tsx      # if/else control flow
│   │   │   ├── WhileNode.tsx       # while loop
│   │   │   ├── ForNode.tsx         # for loop
│   │   │   ├── ForEachNode.tsx     # enhanced for loop
│   │   │   ├── SwitchNode.tsx      # switch/case
│   │   │   ├── TryCatchFinallyNode.tsx  # exception handling
│   │   │   ├── MathNode.tsx        # arithmetic, comparison, logical operators
│   │   │   ├── ArrayOpNode.tsx     # array operations
│   │   │   ├── ArrayListOpNode.tsx # ArrayList operations
│   │   │   ├── HashMapOpNode.tsx   # HashMap operations
│   │   │   ├── AlgorithmNode.tsx   # sorting, searching, graph algorithms
│   │   │   ├── JavaFX*.tsx         # JavaFX GUI nodes
│   │   │   ├── Swing*.tsx          # Swing GUI nodes
│   │   │   └── ...                 # Many more (BST, AVL, Queue, Stack, etc.)
│   │   ├── Panels/
│   │   │   ├── LeftSidebar.tsx     # File tree + node browser toggle
│   │   │   ├── Terminal.tsx        # Console output panel
│   │   │   ├── DetailsPanel.tsx    # Selected node property editor
│   │   │   ├── ValidationPanel.tsx # Graph validation issues list
│   │   │   └── TemplateGallery.tsx # Starter template picker
│   │   ├── vfx/                    # Visual effects
│   │   │   ├── AmbientParticles.tsx
│   │   │   ├── ConnectionSpark.tsx
│   │   │   └── CanvasRipple.tsx
│   │   ├── JavaNode.tsx            # Base component for variable nodes
│   │   ├── LivePreview.tsx         # Real-time Java code preview (Shiki)
│   │   ├── AnimatedEdge.tsx        # Custom animated edge renderer
│   │   ├── ContextMenu.tsx         # Right-click canvas menu
│   │   ├── DebugPanel.tsx          # Step-through debugger controls
│   │   ├── DocsModal.tsx           # In-app documentation viewer
│   │   ├── NodeBrowse.tsx          # Searchable node palette
│   │   ├── FileTree.tsx            # Multi-file project tree
│   │   ├── ClassSettingsPanel.tsx  # Class metadata editor
│   │   ├── ErrorBoundary.tsx       # React error boundary
│   │   ├── ThemeToggle.tsx         # Dark/light theme switch
│   │   ├── VfxToggle.tsx           # Visual effects toggle
│   │   ├── Toast.tsx               # Toast notification component
│   │   └── ResizeHandle.tsx        # Draggable panel resize
│   ├── hooks/
│   │   ├── useKeyboardShortcuts.ts # Global shortcuts (Ctrl+Z, Ctrl+S, etc.)
│   │   └── useConnectionHandlers.ts # Edge connection logic
│   ├── store/
│   │   ├── editorStore.ts          # Main Zustand store (graph, files, compilation)
│   │   ├── debugStore.ts           # Debug/trace stepping state
│   │   ├── themeStore.ts           # Dark/light theme preference
│   │   ├── vfxStore.ts             # Particle effects toggle
│   │   └── toastStore.ts           # Toast notification queue
│   ├── utils/
│   │   ├── compiler/
│   │   │   ├── index.ts            # generateJavaCode() — main entry point
│   │   │   ├── buildBody.ts        # Walks exec chains to emit method bodies
│   │   │   ├── evaluateData.ts     # Resolves data-flow inputs to Java expressions
│   │   │   └── types.ts            # Compiler types (ClassMeta, boxedType, etc.)
│   │   ├── execution/
│   │   │   ├── Executor.ts         # In-browser Java runtime simulator
│   │   │   ├── execChainHandlers.ts # Execution chain traversal
│   │   │   └── evalDataHandlers.ts  # Data evaluation at runtime
│   │   ├── validation.ts           # Connection type validation & auto-cast logic
│   │   ├── graphValidator.ts       # Static analysis (errors & warnings)
│   │   ├── executor.ts             # executeGraph() entry point
│   │   ├── debugExecutor.ts        # traceExecution() for step debugger
│   │   ├── nodeRegistry.ts         # NODE_CATEGORIES and NODE_CONFIGS
│   │   ├── nodeTypes.ts            # TypeScript interfaces (Parameter, LocalVariable, etc.)
│   │   ├── nodeTypeMap.ts          # Maps node type strings → React components
│   │   ├── nodeStyles.ts           # Node styling utilities
│   │   ├── templates.ts            # Starter templates (Hello World, etc.)
│   │   ├── validators.ts           # Input validation (Java identifiers, etc.)
│   │   ├── autoLayout.ts           # Dagre-based automatic graph layout
│   │   └── theme.ts                # Type colors, numeric type helpers, defaults
│   ├── globals.css                 # Tailwind directives + custom styles
│   ├── layout.tsx                  # Root layout (fonts, metadata, service worker)
│   ├── manifest.ts                 # PWA web app manifest
│   └── page.tsx                    # Main editor page (React Flow + all panels)
├── public/
│   └── sw.js                       # Service worker for offline caching
├── .github/workflows/ci.yml        # CI pipeline (lint → test → build)
├── vitest.config.ts                # Vitest configuration
├── eslint.config.mjs               # ESLint flat config
├── next.config.ts                  # Next.js configuration
├── tsconfig.json                   # TypeScript configuration
└── package.json
```

## Core Concepts

### Node System

Every Java construct is represented as a **node** on the React Flow canvas. There are 75+ node types organized into categories:

| Category | Examples |
|---|---|
| **Variables** | `int`, `float`, `double`, `String`, `boolean`, `char`, etc. |
| **Logic** | `main`, `method`, `constructor`, `callMethod`, `branch`, `switch`, `while`, `for`, `forEach`, `return`, `break`, `continue`, `tryCatchFinally`, `throw` |
| **Math** | Arithmetic (`+`, `-`, `*`, `/`, `%`), comparison (`>`, `<`, `==`), logical (`&&`, `\|\|`, `!`), bitwise operators |
| **Math Functions** | `abs`, `min`, `max`, `pow`, `sqrt`, `sin`, `cos`, `random`, etc. |
| **Conversion** | `cast`, `ternary`, `literal`, `instanceOf` |
| **Strings** | `concat`, `substring`, `length`, `charAt`, `replace`, `split`, `format`, etc. |
| **Arrays** | `literal`, `new`, `access`, `set`, `length`, `sort`, `fill`, `copyOf` |
| **Collections** | `ArrayList`, `HashMap`, `HashSet`, `Stack`, `Queue`, `Deque`, `PriorityQueue`, `TreeNode`, `BST`, `AVL` |
| **Algorithms** | Binary search, linear search, bubble sort, quick sort, merge sort, BFS, DFS, Dijkstra, tree traversals |
| **GUI** | JavaFX (Application, Stage, Scene, controls, events, charts) and Swing (JFrame, panels, controls, events) |

Each node is a React component (in `app/components/Nodes/`) that renders handles (connection points), input fields, and labels. Node configurations are defined in `app/utils/nodeRegistry.ts`.

### Edge System: Execution Flow vs Data Flow

Connections between nodes fall into two distinct categories:

#### Execution Edges (white, animated)
- Connect `exec-out` handles to `exec-in` handles
- Define the **order of statement execution** (like lines of code)
- Flow from `Main → Print → Branch → ...`
- Styled with white color and animation

#### Data Edges (color-coded)
- Connect `data-out` handles to `data-in` handles
- Pass **values** between nodes (like variable references or expressions)
- Color matches the Java type (e.g., cyan for `int`, pink for `String`, red for `boolean`)
- Type colors are defined in `app/utils/theme.ts`

### Type System

The type system (`app/utils/validation.ts`) enforces Java-like type safety on connections:

1. **`resolveSourceType(node, handle)`** — determines the output type of a node's handle (e.g., a `StringOp` with operation `length` outputs `int`)

2. **`resolveTargetAccepts(node, handle, allNodes)`** — determines which types a target handle accepts (e.g., a `branch` node's condition handle accepts only `boolean`)

3. **`isValidJavaConnection(connection, nodes)`** — validates that a proposed connection is type-compatible, checking:
   - Exec-to-exec connections (both handles must be exec type)
   - Data-to-data connections (source type must match or be convertible to target's accepted types)

4. **`getAutoConvertType(sourceType, acceptedTypes)`** — determines if a type mismatch can be resolved by auto-inserting a Cast node (e.g., `int` → `String`, `double` → `int`)

5. **`getCompatibleNodeKinds(sourceNode, sourceHandle, allNodes)`** — returns which node types can be connected to a given output, used by the UI to filter the node palette

### Compilation: Graph → Java Source Code

The compiler (`app/utils/compiler/`) walks the node graph and generates valid Java source code:

#### Entry Point: `generateJavaCode()`
Located in `app/utils/compiler/index.ts`, this function:

1. **Detects imports** — scans for Scanner, ArrayList, HashMap, JavaFX, Swing nodes and emits the appropriate `import` statements
2. **Generates class declaration** — handles `class`, `interface`, and `enum` types with `extends`/`implements` support, including abstract classes
3. **Emits class fields** — iterates variable nodes to declare `static` fields with proper type literals
4. **Generates methods** — for each method node, builds parameter signatures and calls `buildMethodBody()` to emit the body
5. **Generates constructors** — same pattern as methods
6. **Generates `main()`** — if a Main node exists
7. **Emits helper classes** — TreeNode inner class, BST/AVL helper methods when tree nodes are present

#### Body Builder: `buildMethodBody()`
Located in `app/utils/compiler/buildBody.ts`, this function:
- Follows the **exec chain** from a starting node (method/main entry point)
- For each node in the chain, emits the corresponding Java statement
- Calls `evaluateDataNode()` to resolve data inputs into Java expressions
- Handles control flow (if/else branches, while/for loops, try/catch)

#### Data Evaluator: `evaluateDataNode()`
Located in `app/utils/compiler/evaluateData.ts`, this function:
- Traces **data edges backwards** from a target handle to find the source expression
- Resolves variable references, math operations, method call return values, etc.
- Returns a Java expression string (e.g., `"x + 5"`, `"scanner.nextInt()"`)

### Execution

j-flow supports two execution modes:

#### 1. In-Browser Execution (Script Mode)
- **Entry**: `executeGraph()` in `app/utils/executor.ts`
- Creates an `Executor` instance (`app/utils/execution/Executor.ts`) that simulates Java runtime behavior in JavaScript
- Maintains runtime memory (variables, collections, scanner values, tree structures)
- Follows exec chains and evaluates data expressions
- Supports cross-class execution for multi-file projects
- Returns console output as a string array

#### 2. Server-Side Compilation (Java Mode)
- **Entry**: `POST /api/compile` in `app/api/compile/route.ts`
- Receives generated Java source code from the client
- Writes `.java` files to a temporary directory
- Runs `javac` to compile, then `java` to execute
- Returns stdout/stderr to the client
- Includes rate limiting (30 req/min), input size validation (500KB max), execution timeout (10s), and Zod schema validation
- Cleans up temp directories in a `finally` block
- Supports multi-file projects (multiple classes compiled together)

#### 3. Debug Tracing
- **Entry**: `traceExecution()` in `app/utils/debugExecutor.ts`
- Similar to in-browser execution but records a `DebugStep` for every node visited
- Each step captures: node ID, action description, global memory snapshot, local scope, console output, and call stack
- The `DebugPanel` component lets users step forward/back through the trace

### Graph Validation

The graph validator (`app/utils/graphValidator.ts`) performs static analysis and reports errors/warnings:

| Check | Severity | Description |
|---|---|---|
| Missing Main node | Error | Every program needs exactly one Main node |
| Multiple Main nodes | Error | Only one Main node is allowed |
| Duplicate variable names | Warning | Two variable nodes with the same name cause conflicts |
| Unconnected exec-in | Warning | Nodes with no incoming execution edge will never run |
| Unreachable nodes | Warning | Nodes not reachable from Main or any method via exec edges |
| Empty method name | Error | Methods must have a name to be callable |
| Call to nonexistent method | Error | `callMethod` targeting a method that doesn't exist |
| Non-public main method | Warning | Java requires `public static void main` |
| Private constructor | Warning | Advisory that private constructors limit instantiation |

## State Management

All application state is managed via **Zustand** stores:

### `editorStore.ts` — Main Store
The central store managing:
- **Graph state**: `nodes`, `edges` (with Zundo undo/redo via `temporal` middleware)
- **Multi-file project**: `files[]`, `activeFileId`, `className`
- **Compilation state**: `isCompiling`, `consoleOutput`
- **Scanner input collection**: `pendingInputs`, `inputMode` (idle → collecting → running)
- **UI state**: `selectedSidebarNodeId`, `menuVisible`, `menuPosition`, `clipboard`

Key actions:
- `onConnect()` — validates connections, applies type-colored styling, auto-inserts Cast nodes for type mismatches
- `getGeneratedCode()` — compiles all project files to Java via `generateJavaCode()`
- `runScript()` — executes the graph in-browser via `executeGraph()`
- `compileAndRunJava()` — sends generated code to `/api/compile`
- `addNode()` / `addNodeAndConnect()` — creates nodes from the registry
- `saveNodeGraph()` / `loadNodeGraph()` — localStorage persistence
- `autoLayout()` — Dagre-based automatic layout
- `exportToFile()` / `importFromFile()` — JSON export/import
- `exportToJava()` — download generated `.java` files

### `debugStore.ts` — Debug Store
- `startDebug()` — runs `traceExecution()` and stores the step array
- `stepForward()` / `stepBack()` — navigate through debug steps
- `toggleBreakpoint()` — set breakpoints on specific nodes
- `continueToBreakpoint()` — run until the next breakpoint
- `playAll()` — auto-advance through steps on a timer

### `themeStore.ts` — Theme Store
- `theme`: `'dark'` | `'light'` — persisted to `localStorage`
- `toggleTheme()` / `setTheme()`

### `vfxStore.ts` — VFX Store
- `vfxEnabled`: boolean — controls ambient particles and connection sparks
- Persisted to `localStorage`
- Lazy-hydrated to avoid SSR mismatches

### `toastStore.ts` — Toast Store
- Manages a queue of toast notifications (success, error, info, warning)
- Auto-dismisses after 3 seconds

## Key Files Reference

| File | Purpose |
|---|---|
| `app/page.tsx` | Main page — assembles React Flow canvas with all panels, node browser, context menu, VFX |
| `app/store/editorStore.ts` | Central state store — graph, files, compilation, persistence |
| `app/utils/compiler/index.ts` | `generateJavaCode()` — converts node graph to Java source |
| `app/utils/compiler/buildBody.ts` | Walks exec chains to build method/main bodies |
| `app/utils/compiler/evaluateData.ts` | Resolves data-flow inputs to Java expressions |
| `app/utils/validation.ts` | Type-safe connection validation and auto-cast |
| `app/utils/graphValidator.ts` | Static graph analysis (errors/warnings) |
| `app/utils/execution/Executor.ts` | In-browser Java runtime simulator |
| `app/utils/debugExecutor.ts` | Step-by-step trace generator for the debugger |
| `app/utils/nodeRegistry.ts` | Node categories and configuration registry |
| `app/utils/theme.ts` | Type colors, numeric helpers, default literals |
| `app/api/compile/route.ts` | Server-side Java compilation endpoint |
| `app/components/LivePreview.tsx` | Real-time Java code preview with Shiki |
| `app/components/Nodes/` | 75+ node component implementations |

## Testing

### What's Tested

- **Compiler** (`compiler.test.ts`) — Java code generation from node graphs
- **Validation** (`validation.test.ts`) — Type checking for connections
- **Graph Validator** (`graphValidator.test.ts`) — Static analysis rules
- **Executor** (`executor.test.ts`) — In-browser execution correctness
- **Theme** (`theme.test.ts`) — Type color mapping and helpers
- **Validators** (`validators.test.ts`) — Input validation utilities
- **Stores** (`toastStore.test.ts`, `themeStore.test.ts`, `vfxStore.test.ts`) — Zustand store behavior

### Adding Tests

1. Create a test file in the `__tests__/` directory alongside the source:
   ```
   app/utils/__tests__/myModule.test.ts
   ```
2. Use Vitest globals (`describe`, `it`, `expect`) — no imports needed
3. The `@` alias resolves to `./app` in tests
4. Run tests: `npm test`
