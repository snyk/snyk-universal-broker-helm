// Set up some basic logging
enum LogMessage {
  INFO = "info",
  WARN = "warn",
  DEBUG = "debug",
  ERROR = "error",
}

export default class makeLog {
  info(message: string) {
    console.log(
      "\x1b[32m%s\x1b[0m",
      `[${LogMessage.INFO.toUpperCase()}]: ${message}`
    );
  }
  warn(message: string) {
    console.log(
      "\x1b[33m%s\x1b[0m",
      `[${LogMessage.WARN.toUpperCase()}]: ${message}`
    );
  }
  error(message: string) {
    console.error(
      "\x1b[31m%s\x1b[0m",
      `[${LogMessage.ERROR.toUpperCase()}]: ${message}`
    );
  }
  debug(message: string) {
    if (process.env.LOG_LEVEL == LogMessage.DEBUG) {
      console.log(
        "\x1b[2m%s\x1b[0m",
        `[${LogMessage.DEBUG.toUpperCase()}]: ${message}`
      );
    }
  }
}
