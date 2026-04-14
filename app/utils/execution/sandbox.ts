/**
 * Sandboxed code execution for Custom Code nodes.
 *
 * Wraps `new Function()` so that user-supplied code runs in strict mode
 * with dangerous browser/Node globals shadowed (set to undefined).
 * This prevents custom code from accessing the DOM, making network
 * requests, reading storage, or escaping into the host environment.
 */

const BLOCKED_GLOBALS = [
  'window', 'self', 'globalThis', 'document',
  'fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource',
  'localStorage', 'sessionStorage', 'indexedDB',
  'navigator', 'location', 'history',
  'alert', 'confirm', 'prompt',
  'eval', 'Function', 'importScripts',
  'setTimeout', 'setInterval', 'requestAnimationFrame',
  'postMessage', 'process', 'require', 'module', 'exports',
  '__dirname', '__filename',
] as const;

const BLOCKED_FILL = new Array(BLOCKED_GLOBALS.length).fill(undefined);

/**
 * Create a sandboxed function from user code (statement mode).
 * The returned function accepts the declared input values plus
 * `__print__` and `__mem__` helpers — nothing else is accessible.
 */
export function sandboxStatement(
  paramNames: string[],
  code: string,
): (...args: unknown[]) => void {
  const allParams = [...paramNames, '__print__', '__mem__', ...BLOCKED_GLOBALS];
  const fn = new Function(...allParams, `"use strict";\n${code}`);

  return (...args: unknown[]) => {
    fn(...args, ...BLOCKED_FILL);
  };
}

/**
 * Create a sandboxed function from user code (expression mode).
 * Returns the evaluated result of the expression.
 */
export function sandboxExpression(
  paramNames: string[],
  code: string,
): (...args: unknown[]) => unknown {
  const allParams = [...paramNames, ...BLOCKED_GLOBALS];
  const fn = new Function(...allParams, `"use strict";\nreturn (${code});`);

  return (...args: unknown[]) => {
    return fn(...args, ...BLOCKED_FILL);
  };
}
