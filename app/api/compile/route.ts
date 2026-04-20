import { execFileSync } from 'child_process';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { isValidJavaIdentifier } from '../../utils/validators';

export const dynamic = 'force-dynamic';

const EXECUTION_TIMEOUT_MS = 10_000;
const MAX_BODY_SIZE = 500 * 1024; // 500KB

const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 30; // max 30 compiles per minute

const javaFileSchema = z.object({
  code: z.string().min(1).max(500_000),
  className: z.string().min(1).max(256),
});

const compileRequestSchema = z.object({
  code: z.string().min(1).max(500_000).optional(),
  className: z.string().min(1).max(256).optional(),
  files: z.array(javaFileSchema).min(1).optional(),
  mainClass: z.string().min(1).max(256).optional(),
  inputs: z.array(z.string()).optional(),
  execute: z.boolean().optional(),
  sessionId: z.string().max(100).optional(),
});

type ErrorCode =
  | 'INVALID_INPUT'
  | 'COMPILATION_ERROR'
  | 'RUNTIME_ERROR'
  | 'TIMEOUT'
  | 'JDK_MISSING'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR';

interface JavaFile {
  code: string;
  className: string;
}

interface CompileResponse {
  success: boolean;
  output?: string;
  error?: string;
  errorCode?: ErrorCode;
  compilationError?: string;
  compiledOnly?: boolean;
  details?: Record<string, string[]>;
}

function sanitizeClassName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_]/g, '');
}

function sanitizeErrorOutput(output: string, workDirPath: string | null): string {
  if (!workDirPath) return output;
  // Strip temp directory paths, leaving just the filename
  return output.replaceAll(workDirPath.replace(/\\/g, '/') + '/', '')
    .replaceAll(workDirPath + '\\', '')
    .replaceAll(workDirPath + '/', '')
    .replaceAll(workDirPath, '');
}

export async function POST(request: Request): Promise<Response> {
  let workDir: string | null = null;

  try {
    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') ?? 'unknown';
    const now = Date.now();
    const limiter = rateLimit.get(clientIP);
    if (limiter && now < limiter.resetTime) {
      if (limiter.count >= RATE_LIMIT_MAX) {
        return Response.json(
          { success: false, error: 'Too many requests. Please try again later.', errorCode: 'RATE_LIMITED' } satisfies CompileResponse,
          { status: 429 }
        );
      }
      limiter.count++;
    } else {
      rateLimit.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    }

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

    const body = JSON.parse(rawBody);
    const parseResult = compileRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return Response.json(
        { success: false, error: 'Invalid request body', errorCode: 'INVALID_INPUT', details: parseResult.error.flatten().fieldErrors } satisfies CompileResponse,
        { status: 400 }
      );
    }
    const { code, className, files, mainClass: reqMainClass, inputs, execute = true } = parseResult.data;

    // Normalize to multi-file format (support legacy single-file requests)
    let javaFiles: JavaFile[];
    let mainClass: string;

    if (files && files.length > 0) {
      javaFiles = files;
      mainClass = reqMainClass || files[0].className;
    } else if (code && className) {
      javaFiles = [{ code, className }];
      mainClass = className;
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
    workDir = join(tmpdir(), `jwire-${randomUUID()}`);
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
      execFileSync('javac', fileNames, {
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
        compilationError: sanitizeErrorOutput(stderr, workDir),
        errorCode: 'COMPILATION_ERROR',
      } satisfies CompileResponse);
    }

    if (!execute) {
      return Response.json({
        success: true,
        compiledOnly: true,
        output: 'GUI project compiled successfully. Export the .java files to run the windowed app locally.',
      } satisfies CompileResponse);
    }

    // --- Execute main class ---
    try {
      const stdinInput = inputs && inputs.length > 0 ? inputs.join('\n') + '\n' : undefined;
      const stdout = execFileSync('java', [safeMainClass], {
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
      const sanitizedError = isTimeout
        ? 'Execution timed out (10 s limit)'
        : sanitizeErrorOutput(stderr || message, workDir);
      return Response.json({
        success: false,
        output: stdout || undefined,
        errorCode: isTimeout ? 'TIMEOUT' : 'RUNTIME_ERROR',
        error: sanitizedError,
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
      { success: false, error: 'An internal error occurred', errorCode: 'INTERNAL_ERROR' } satisfies CompileResponse,
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
