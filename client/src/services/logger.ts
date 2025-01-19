// client/src/services/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  trace?: string;
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private readonly maxLogs = 1000;
  private readonly remoteLoggingEndpoint = '/api/logs';
  private readonly logToConsole: boolean = process.env.NODE_ENV === 'development';
  private readonly logToRemote: boolean = process.env.NODE_ENV === 'production';

  private constructor() {
    window.onerror = (msg, url, lineNo, columnNo, error) => {
      this.error('Window Error', {
        message: msg,
        url,
        lineNo,
        columnNo,
        stack: error?.stack
      });
      return false;
    };

    window.onunhandledrejection = (event) => {
      this.error('Unhandled Promise Rejection', {
        reason: event.reason
      });
    };
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatMessage(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      trace: new Error().stack
    };
  }

  private async sendToRemote(entry: LogEntry): Promise<void> {
    if (!this.logToRemote) return;

    try {
      await fetch(this.remoteLoggingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      console.error('Failed to send log to remote:', error);
    }
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    if (this.logToConsole) {
      const style = `color: ${this.getColorForLevel(entry.level)}; font-weight: bold;`;
      console.log(
        `%c${entry.timestamp} [${entry.level.toUpperCase()}]`,
        style,
        entry.message,
        entry.data || ''
      );
    }

    this.sendToRemote(entry);
  }

  private getColorForLevel(level: LogLevel): string {
    const colors = {
      debug: '#9CA3AF',
      info: '#3B82F6',
      warn: '#F59E0B',
      error: '#EF4444'
    };
    return colors[level];
  }

  debug(message: string, data?: any): void {
    this.addLog(this.formatMessage('debug', message, data));
  }

  info(message: string, data?: any): void {
    this.addLog(this.formatMessage('info', message, data));
  }

  warn(message: string, data?: any): void {
    this.addLog(this.formatMessage('warn', message, data));
  }

  error(message: string, data?: any): void {
    this.addLog(this.formatMessage('error', message, data));
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  downloadLogs(): void {
    const blob = new Blob([JSON.stringify(this.logs, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const logger = Logger.getInstance();
export default logger;