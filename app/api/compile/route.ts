import { execSync } from 'child_process';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

const EXECUTION_TIMEOUT_MS = 10_000;

interface CompileRequest {
  code: string;
  className: string;
  inputs?: string[];
}

interface CompileResponse {
  success: boolean;
  output?: string;
  error?: string;
  compilationError?: string;
}

export async function POST(request: Request): Promise<Response> {
  let workDir: string | null = null;

  try {
    const body = (await request.json()) as CompileRequest;
    const { code, className, inputs } = body;

    if (!code || !className) {
      return Response.json(
        { success: false, error: 'Missing code or className' } satisfies CompileResponse,
        { status: 400 }
      );
    }

    // Sanitise className to prevent path traversal
    const safeClassName = className.replace(/[^a-zA-Z0-9_]/g, '');
    if (!safeClassName) {
      return Response.json(
        { success: false, error: 'Invalid className' } satisfies CompileResponse,
        { status: 400 }
      );
    }

    // Create an isolated temp directory
    workDir = join(tmpdir(), `jflow-${randomUUID()}`);
    mkdirSync(workDir, { recursive: true });

    const javaFile = join(workDir, `${safeClassName}.java`);
    writeFileSync(javaFile, code, 'utf-8');

    // --- Compile ---
    try {
      execSync(`javac "${safeClassName}.java"`, {
        cwd: workDir,
        timeout: EXECUTION_TIMEOUT_MS,
        stdio: 'pipe',
      });
    } catch (compileErr: unknown) {
      const stderr =
        compileErr instanceof Error && 'stderr' in compileErr
          ? String((compileErr as { stderr: Buffer }).stderr)
          : String(compileErr);
      return Response.json({
        success: false,
        compilationError: stderr,
      } satisfies CompileResponse);
    }

    // --- Execute ---
    try {
      const stdinInput = inputs && inputs.length > 0 ? inputs.join('\n') + '\n' : undefined;
      const stdout = execSync(`java "${safeClassName}"`, {
        cwd: workDir,
        timeout: EXECUTION_TIMEOUT_MS,
        stdio: 'pipe',
        input: stdinInput,
      });
      return Response.json({
        success: true,
        output: stdout.toString('utf-8'),
      } satisfies CompileResponse);
    } catch (runErr: unknown) {
      const stderr =
        runErr instanceof Error && 'stderr' in runErr
          ? String((runErr as { stderr: Buffer }).stderr)
          : '';
      const stdout =
        runErr instanceof Error && 'stdout' in runErr
          ? String((runErr as { stdout: Buffer }).stdout)
          : '';
      const message = runErr instanceof Error ? runErr.message : String(runErr);

      const isTimeout = message.includes('ETIMEDOUT') || message.includes('timed out');
      return Response.json({
        success: false,
        output: stdout || undefined,
        error: isTimeout
          ? 'Execution timed out (10 s limit)'
          : stderr || message,
      } satisfies CompileResponse);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);

    // Detect missing JDK
    if (
      message.includes('ENOENT') ||
      message.includes('is not recognized') ||
      message.includes('not found')
    ) {
      return Response.json(
        {
          success: false,
          error:
            'Java Development Kit (JDK) not found. Please install a JDK and ensure javac/java are on your PATH.',
        } satisfies CompileResponse,
        { status: 500 }
      );
    }

    return Response.json(
      { success: false, error: message } satisfies CompileResponse,
      { status: 500 }
    );
  } finally {
    // Cleanup temp directory
    if (workDir && existsSync(workDir)) {
      try {
        rmSync(workDir, { recursive: true, force: true });
      } catch {
        // Best-effort cleanup
      }
    }
  }
}
