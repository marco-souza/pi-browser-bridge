/** Logger for pi-browser-bridge packages.
 *
 * Silent by default. Set `PI_BROWSER_BRIDGE_LOG_LEVEL` to enable output:
 *   debug < info < warn < error < silent
 *
 * Works in both Node.js and browser contexts.
 */

export type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

export interface Logger {
  debug(...args: unknown[]): void;
  info(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
}

const LEVEL_ORDER: LogLevel[] = ["debug", "info", "warn", "error", "silent"];

function levelIndex(level: LogLevel): number {
  return LEVEL_ORDER.indexOf(level);
}

function getLogLevelFromEnv(): LogLevel {
  try {
    const globalProcess = (globalThis as unknown as Record<string, unknown>).process;
    const env = (globalProcess as Record<string, unknown>).env as Record<string, unknown> | undefined;
    const raw = (env?.PI_BROWSER_BRIDGE_LOG_LEVEL) || "";
    const trimmed = String(raw).trim().toLowerCase() as LogLevel;
    if (LEVEL_ORDER.includes(trimmed)) return trimmed;
  } catch {
    // Browser or restricted environment — default to silent
  }
  return "silent";
}

function formatTime(): string {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function joinArgs(args: unknown[]): string {
  return args
    .map((a) =>
      typeof a === "string"
        ? a
        : a instanceof Error
          ? a.message
          : JSON.stringify(a),
    )
    .join(" ");
}

class LoggerImpl implements Logger {
  private _levelIndex: number;
  private _namespace: string;

  constructor(
    namespace: string,
    level: LogLevel = getLogLevelFromEnv(),
  ) {
    this._namespace = namespace;
    this._levelIndex = levelIndex(level);
  }

  private _shouldLog(target: LogLevel): boolean {
    return levelIndex(target) >= this._levelIndex;
  }

  private _log(level: LogLevel, args: unknown[]): void {
    if (!this._shouldLog(level)) return;
    const prefix = `[${formatTime()} ${level.toUpperCase()} ${this._namespace}]`;
    const message = joinArgs(args);
    // eslint-disable-next-line no-console
    switch (level) {
      case "debug":
        console.log(prefix, message);
        break;
      case "info":
        console.info(prefix, message);
        break;
      case "warn":
        console.warn(prefix, message);
        break;
      case "error":
        console.error(prefix, message);
        break;
    }
  }

  debug(...args: unknown[]): void {
    this._log("debug", args);
  }

  info(...args: unknown[]): void {
    this._log("info", args);
  }

  warn(...args: unknown[]): void {
    this._log("warn", args);
  }

  error(...args: unknown[]): void {
    this._log("error", args);
  }
}

/** Default shared logger instance (namespace: `pi-browser-bridge`). */
export const logger: Logger = new LoggerImpl("pi-browser-bridge");

/** Create a namespaced logger instance. */
export function createLogger(namespace: string): Logger {
  return new LoggerImpl(namespace);
}
