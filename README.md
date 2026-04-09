# j-flow

A **node-based visual IDE** for building Java programs through drag-and-drop flowcharts. Connect nodes to define variables, methods, control flow, and I/O — then see real-time Java code generation and execute your program instantly.

## Features

- **Visual Programming** — Drag-and-drop nodes to build Java programs without writing code
- **12 Node Types** — Variables, methods, print, math, branching (if/else), loops (while), return, and more
- **Live Java Preview** — See generated Java source code update in real time with syntax highlighting
- **In-Browser Execution** — Run your visual program and see console output instantly
- **Type-Safe Connections** — Color-coded wires enforce Java type compatibility
- **Save & Load** — Persist your node graphs to localStorage

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start building.

## Tech Stack

- **Next.js 16** + **React 19** — Application framework
- **React Flow** — Node-based graph editor
- **Shiki** — Syntax highlighting for Java code preview
- **Tailwind CSS 4** — Utility-first styling
- **TypeScript** — Full type safety throughout
