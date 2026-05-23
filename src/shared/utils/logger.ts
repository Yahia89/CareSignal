// Basic custom logger that can be extended with Sentry
type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

class Logger {
  private log(level: LogLevel, message: string, ...args: unknown[]) {
    // eslint-disable-next-line no-console
    console.log(`[${new Date().toISOString()}] [${level}] ${message}`, ...args);
  }

  debug(message: string, ...args: unknown[]) {
    if (__DEV__) this.log('DEBUG', message, ...args);
  }

  info(message: string, ...args: unknown[]) {
    this.log('INFO', message, ...args);
  }

  warn(message: string, ...args: unknown[]) {
    this.log('WARN', message, ...args);
  }

  error(message: string, error?: unknown) {
    this.log('ERROR', message, error);
    // TODO: Send to Sentry if in production
  }
}

export const logger = new Logger();
