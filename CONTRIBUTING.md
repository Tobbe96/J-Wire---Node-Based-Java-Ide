# Contributing to DevFlow

Thank you for your interest in contributing to DevFlow! This guide will help you get set up and start contributing.

## Getting Started

### Prerequisites

- **Node.js 22+** (LTS recommended)
- **npm 10+**
- **JDK 17+** — required for the Java compilation feature (`javac` and `java` must be on your PATH)

### Setup

```bash
git clone https://github.com/Tobbe96/DevFlow.git
cd DevFlow
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start the development server.

## Development

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run all tests once (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm start` | Start the production server (after build) |
| `npm run electron:dev` | Launch the desktop app (dev mode) |
| `npm run electron:build` | Build desktop installer for current platform |
| `npm run electron:build:win` | Build Windows installer (.exe) |
| `npm run electron:build:mac` | Build macOS installer (.dmg) |
| `npm run electron:build:linux` | Build Linux installer (AppImage + .deb) |

### Project Structure

```
app/
├── api/compile/        # POST endpoint — compiles & runs Java via javac/java
├── components/
│   ├── Nodes/          # 75+ node components (one per Java construct)
│   ├── Panels/         # Sidebar, terminal, details panel, template gallery
│   ├── vfx/            # Visual effects (particles, sparks, ripples)
│   ├── JavaNode.tsx     # Base variable node component
│   ├── LivePreview.tsx  # Real-time Java code preview with Shiki highlighting
│   ├── ContextMenu.tsx  # Right-click context menu on the canvas
│   ├── DebugPanel.tsx   # Step-through debugger UI
│   └── ...
├── hooks/              # Custom React hooks (keyboard shortcuts, connection handlers)
├── store/              # Zustand state stores (editor, debug, theme, vfx, toast)
├── utils/
│   ├── compiler/       # Java code generation (graph → Java source)
│   ├── execution/      # In-browser graph executor (simulates Java runtime)
│   ├── validation.ts   # Type-safe connection validation
│   ├── graphValidator.ts # Static analysis of the node graph
│   ├── nodeRegistry.ts  # Node category/config registry
│   ├── nodeTypes.ts     # TypeScript interfaces for node data
│   ├── templates.ts     # Starter templates (Hello World, etc.)
│   └── theme.ts         # Type colors, defaults, and helpers
├── layout.tsx          # Root layout (fonts, metadata, service worker)
└── page.tsx            # Main editor page (React Flow canvas + panels)
electron/
├── main.js             # Electron main process (dev/prod server management)
└── preload.js          # Secure context bridge for renderer
e2e/
└── app.spec.ts         # Playwright E2E smoke tests
public/
└── sw.js               # Service worker for offline support
```

### Code Style

- **ESLint** with `eslint-config-next` (core-web-vitals + TypeScript rules)
- **Pre-commit hooks** via [Husky](https://typicode.github.io/husky/) + [lint-staged](https://github.com/lint-staged/lint-staged) — lint runs automatically on staged files
- **Zero tolerance** for lint warnings: `--max-warnings 0`
- TypeScript strict mode throughout

### Testing

- **Vitest** with `jsdom` environment
- Tests are co-located with source in `__tests__/` directories
- Path alias `@` maps to `./app` (configured in `vitest.config.ts`)
- Current test coverage includes:
  - `compiler.test.ts` — Java code generation
  - `validation.test.ts` — Connection type validation
  - `graphValidator.test.ts` — Static graph analysis
  - `executor.test.ts` — In-browser execution engine
  - `theme.test.ts` — Type colors and helpers
  - `validators.test.ts` — Input validators
  - `toastStore.test.ts`, `themeStore.test.ts`, `vfxStore.test.ts` — Store tests

Run all tests before submitting:

```bash
npm test
```

### Pull Requests

1. Fork the repository and create a feature branch
2. Make your changes with clear, focused commits
3. Write tests for new features or bug fixes
4. Ensure all checks pass locally:
   ```bash
   npm run lint && npm test && npm run build
   ```
5. Open a PR against `main` — CI will run lint, test, and build automatically
6. All PRs must pass CI before merging

### CI Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs four jobs on every push and PR:

1. **Lint** — `npm run lint`
2. **Test** — `npx vitest run --reporter=verbose`
3. **Build** — `npm run build` (depends on lint + test passing)
4. **E2E** — `npx playwright test` (depends on build passing)

## Deployment

### Docker (Full Features)

```bash
docker build -t devflow .
docker run -p 3000:3000 devflow
```

The Docker image includes JDK 17 for server-side Java compilation.

### Vercel (Frontend Only)

Deploy to Vercel for the frontend experience. Note: server-side Java compilation requires JDK, which isn't available on Vercel's default runtime. The in-browser execution mode still works.

### Electron (Desktop)

Build distributable desktop installers:

```bash
npm run electron:build:win    # Windows: NSIS installer + portable .exe
npm run electron:build:mac    # macOS: .dmg disk image
npm run electron:build:linux  # Linux: AppImage + .deb
```

Output goes to `dist-electron/`. The portable Windows build can be run directly without installation.

> **Note:** On Windows, if the build fails with a symlink error, set the environment variable `CSC_IDENTITY_AUTO_DISCOVERY=false` or enable Windows Developer Mode in Settings.

## Architecture

For a detailed overview of the system architecture, node system, compiler, executor, and state management, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
