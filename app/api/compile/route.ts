import { execSync } from 'child_process';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';
import { isValidJavaIdentifier } from '../../utils/validators';

export const dynamic = 'force-dynamic';

const EXECUTION_TIMEOUT_MS = 10_000;
const MAX_BODY_SIZE = 500 * 1024; // 500KB

type ErrorCode =
  | 'INVALID_INPUT'
  | 'COMPILATION_ERROR'
  | 'RUNTIME_ERROR'
  | 'TIMEOUT'
  | 'JDK_MISSING'
  | 'INTERNAL_ERROR';

interface JavaFile {
  code: string;
  className: string;
}

interface CompileRequest {
  /** Multi-file mode */
  files?: JavaFile[];
  mainClass?: string;
  /** Legacy single-file mode */
  code?: string;
  className?: string;
  inputs?: string[];
}

interface CompileResponse {
  success: boolean;
  output?: string;
  error?: string;
  errorCode?: ErrorCode;
  compilationError?: string;
}

function sanitizeClassName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_]/g, '');
}

export async function POST(request: Request): Promise<Response> {
  let workDir: string | null = null;

  try {
    // Body size validation
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
      return Response.json(
        { success: false, error: 'Request body too large (max 500KB)', errorCode: 'INVALID_INPUT' } satisfies CompileResponse,
        { status: 400 }
      );
    }

    const rawBody = await request.text();
    if (rawBody.length > MAX_BODY_SIZE) {
      return Response.json(
        { success: false, error: 'Request body too large (max 500KB)', errorCode: 'INVALID_INPUT' } satisfies CompileResponse,
        { status: 400 }
      );
    }

    const body = JSON.parse(rawBody) as CompileRequest;
    const { inputs } = body;

    // Normalize to multi-file format (support legacy single-file requests)
    let javaFiles: JavaFile[];
    let mainClass: string;

    if (body.files && body.files.length > 0) {
      javaFiles = body.files;
      mainClass = body.mainClass || body.files[0].className;
    } else if (body.code && body.className) {
      javaFiles = [{ code: body.code, className: body.className }];
      mainClass = body.className;
    } else {
      return Response.json(
        { success: false, error: 'Missing code/className or files array', errorCode: 'INVALID_INPUT' } satisfies CompileResponse,
        { status: 400 }
      );
    }

    const safeMainClass = sanitizeClassName(mainClass);
    if (!safeMainClass) {
      return Response.json(
        { success: false, error: 'Invalid main class name', errorCode: 'INVALID_INPUT' } satisfies CompileResponse,
        { status: 400 }
      );
    }

    // Validate class names are valid Java identifiers
    const allClassNames = javaFiles.map(f => f.className);
    for (const cn of allClassNames) {
      if (!isValidJavaIdentifier(cn)) {
        return Response.json(
          { success: false, error: `Invalid Java identifier: '${cn}'`, errorCode: 'INVALID_INPUT' } satisfies CompileResponse,
          { status: 400 }
        );
      }
    }

    // Create an isolated temp directory
    workDir = join(tmpdir(), `jflow-${randomUUID()}`);
    mkdirSync(workDir, { recursive: true });

    // Write all Java source files
    const fileNames: string[] = [];
    for (const file of javaFiles) {
      const safeName = sanitizeClassName(file.className);
      if (!safeName) continue;
      const fileName = `${safeName}.java`;
      writeFileSync(join(workDir, fileName), file.code, 'utf-8');
      fileNames.push(fileName);
    }

    if (fileNames.length === 0) {
      return Response.json(
        { success: false, error: 'No valid Java files to compile', errorCode: 'INVALID_INPUT' } satisfies CompileResponse,
        { status: 400 }
      );
    }

    // --- Compile all files together ---
    try {
      const fileArgs = fileNames.map(f => `"${f}"`).join(' ');
      execSync(`javac ${fileArgs}`, {
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
        errorCode: 'COMPILATION_ERROR',
      } satisfies CompileResponse);
    }

    // --- Execute main class ---
    try {
      const stdinInput = inputs && inputs.length > 0 ? inputs.join('\n') + '\n' : undefined;
      const stdout = execSync(`java "${safeMainClass}"`, {
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
        errorCode: isTimeout ? 'TIMEOUT' : 'RUNTIME_ERROR',
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
          errorCode: 'JDK_MISSING',
          error:
            'Java Development Kit (JDK) not found. Please install a JDK and ensure javac/java are on your PATH.',
        } satisfies CompileResponse,
        { status: 500 }
      );
    }

    return Response.json(
      { success: false, error: message, errorCode: 'INTERNAL_ERROR' } satisfies CompileResponse,
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
