# DevFlow

[![CI](https://github.com/Tobbe96/DevFlow/actions/workflows/ci.yml/badge.svg)](https://github.com/Tobbe96/DevFlow/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](#license)

A **node-based visual IDE** for building Java programs through drag-and-drop flowcharts. Connect nodes to define variables, methods, control flow, and I/O — then see real-time Java code generation and execute your program instantly.

Available as a **web app** or a **desktop app** (via Electron).

<!-- Screenshot placeholder: replace with an actual screenshot -->
<!-- ![DevFlow screenshot](docs/screenshot.png) -->

## Features

- **Visual Programming** — Drag-and-drop 75+ node types to build Java programs without writing code
- **Comprehensive Node Library** — Variables, methods, constructors, control flow (if/else, switch, for, while, try/catch), collections (ArrayList, HashMap, Stack, Queue, BST, AVL), algorithms (sort, search, BFS/DFS), and GUI (JavaFX & Swing)
- **Live Java Preview** — See generated Java source code update in real time with Shiki syntax highlighting
- **Dual Execution Modes** — Run in-browser instantly or compile with a real JDK server-side
- **Type-Safe Connections** — Color-coded wires enforce Java type compatibility with auto-cast support
- **Multi-File Projects** — Create classes, interfaces, and enums across multiple files with cross-class references
- **Step-Through Debugger** — Set breakpoints, step forward/back, and inspect variable state at each node
- **Graph Validation** — Real-time static analysis catches errors (missing Main, unreachable nodes, type mismatches)
- **Undo/Redo** — Full history support via Zundo
- **Save, Load & Export** — Persist to localStorage, export/import JSON, or download generated `.java` files
- **Starter Templates** — Hello World and other templates to get started quickly
- **Dark/Light Theme** — Toggle between themes with optional particle effects
- **Keyboard Shortcuts** — Ctrl+Z/Y (undo/redo), Ctrl+S (save), Ctrl+C/V (copy/paste), and more
- **Desktop App** — Run as a native desktop application via Electron (Windows, macOS, Linux)
- **PWA Support** — Install from the browser for an app-like experience

## Quick Start

### Prerequisites

- **Node.js 22+** and **npm 10+**
- **JDK 17+** (optional — needed only for server-side Java compilation)

### Web App

```bash
git clone https://github.com/Tobbe96/DevFlow.git
cd DevFlow
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start building.

### Desktop App (Electron)

```bash
npm run electron:dev
```

This starts the Next.js dev server and opens DevFlow in a native desktop window. Java compilation works locally if JDK is installed.

#### Build Desktop Installers

```bash
npm run electron:build:win    # Windows (.exe installer)
npm run electron:build:mac    # macOS (.dmg)
npm run electron:build:linux  # Linux (AppImage + .deb)
```

## Tech Stack

- **[Next.js 16](https://nextjs.org/)** + **[React 19](https://react.dev/)** — Application framework
- **[React Flow v12](https://reactflow.dev/)** — Node-based graph editor
- **[Zustand 5](https://zustand-demo.pmnd.rs/)** — State management with undo/redo
- **[Shiki](https://shiki.style/)** — Syntax highlighting for Java code preview
- **[Tailwind CSS 4](https://tailwindcss.com/)** — Utility-first styling
- **[Electron](https://www.electronjs.org/)** — Desktop application shell
- **[Vitest](https://vitest.dev/)** — Unit testing
- **[Playwright](https://playwright.dev/)** — End-to-end testing
- **[Zod](https://zod.dev/)** — Schema validation
- **TypeScript** — Full type safety throughout

## Documentation

- **[Contributing Guide](CONTRIBUTING.md)** — Setup, code style, testing, and PR process
- **[Architecture](docs/ARCHITECTURE.md)** — Detailed system architecture, node system, compiler, executor, and state management

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
