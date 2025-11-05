type LogLevel = 'info' | 'error' | 'warn' | 'debug';

class Logger {
  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  info(message: string): void {
    console.log(this.formatMessage('info', message));
  }

  error(message: string, error?: Error): void {
    console.error(this.formatMessage('error', message));
    if (error) {
      console.error(error);
    }
  }

  warn(message: string): void {
    console.warn(this.formatMessage('warn', message));
  }

  debug(message: string): void {
    console.debug(this.formatMessage('debug', message));
  }
}

export default new Logger();
