# DevFlow

[![CI](https://github.com/Tobbe96/DevFlow/actions/workflows/ci.yml/badge.svg)](https://github.com/Tobbe96/DevFlow/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](#license)
[![Electron](https://img.shields.io/badge/Electron-Desktop_App-47848F?logo=electron&logoColor=white)](#desktop-app-electron)

A **node-based visual IDE** for building Java programs through drag-and-drop flowcharts. Connect nodes to define variables, methods, control flow, and I/O — then see real-time Java code generation and execute your program instantly.

Available as a **web app**, **desktop app** (Electron), or **PWA**.

<!-- Screenshot placeholder: replace with an actual screenshot -->
<!-- ![DevFlow screenshot](docs/screenshot.png) -->

## Features

- 🧩 **Visual Programming** — Drag-and-drop 75+ node types to build Java programs without writing code
- 📚 **Comprehensive Node Library** — Variables, methods, constructors, control flow (if/else, switch, for, while, try/catch), collections (ArrayList, HashMap, Stack, Queue, BST, AVL), algorithms (sort, search, BFS/DFS), and GUI (JavaFX & Swing)
- 👁️ **Live Java Preview** — See generated Java source code update in real time with Shiki syntax highlighting
- ⚡ **Dual Execution Modes** — Run in-browser instantly or compile with a real JDK server-side
- 🔗 **Type-Safe Connections** — Color-coded wires enforce Java type compatibility with auto-cast support
- 📁 **Multi-File Projects** — Create classes, interfaces, and enums across multiple files with cross-class references
- 🐛 **Step-Through Debugger** — Set breakpoints, step forward/back, and inspect variable state at each node
- ✅ **Graph Validation** — Real-time static analysis catches errors (missing Main, unreachable nodes, type mismatches)
- ↩️ **Undo/Redo** — Full history support via Zundo
- 💾 **Save, Load & Export** — Persist to localStorage, export/import JSON, or download generated `.java` files
- 📋 **Starter Templates** — Hello World and other templates to get started quickly
- 🌗 **Dark/Light Theme** — Toggle between themes with optional particle effects
- ⌨️ **Keyboard Shortcuts** — Ctrl+Z/Y (undo/redo), Ctrl+S (save), Ctrl+C/V (copy/paste), and more
- 🖥️ **Desktop App** — Run as a native application via Electron (Windows, macOS, Linux)
- 📱 **PWA Support** — Install from the browser for an app-like experience

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

**Development mode** — opens a native window with hot reload:

```bash
npm run electron:dev
```

**Build installers:**

| Platform | Command | Output |
|----------|---------|--------|
| Windows | `npm run electron:build:win` | Installer (.exe) + Portable (.exe) |
| macOS | `npm run electron:build:mac` | Disk image (.dmg) |
| Linux | `npm run electron:build:linux` | AppImage + Debian (.deb) |

> **Tip:** The portable Windows build requires no installation — just download and run.

### Docker

```bash
docker build -t devflow .
docker run -p 3000:3000 devflow
```

The Docker image includes JDK 17 for server-side Java compilation.

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) + [React 19](https://react.dev/) |
| Graph Editor | [React Flow v12](https://reactflow.dev/) |
| State Management | [Zustand 5](https://zustand-demo.pmnd.rs/) + [Zundo](https://github.com/charkour/zundo) |
| Syntax Highlighting | [Shiki](https://shiki.style/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| Desktop | [Electron](https://www.electronjs.org/) + [electron-builder](https://www.electron.build/) |
| Validation | [Zod](https://zod.dev/) |
| Unit Testing | [Vitest](https://vitest.dev/) |
| E2E Testing | [Playwright](https://playwright.dev/) |
| Language | TypeScript 5 (strict) |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (web) |
| `npm run build` | Production build |
| `npm test` | Run unit tests (Vitest) |
| `npm run test:e2e` | Run E2E tests (Playwright) |
| `npm run lint` | Run ESLint |
| `npm run electron:dev` | Launch desktop app (dev) |
| `npm run electron:build:win` | Build Windows desktop app |

## Documentation

- **[Contributing Guide](CONTRIBUTING.md)** — Setup, code style, testing, and PR process
- **[Architecture](docs/ARCHITECTURE.md)** — System architecture, node system, compiler, executor, and state management

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

Made by [Tobias Boström](https://github.com/Tobbe96)
