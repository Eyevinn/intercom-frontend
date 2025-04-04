export enum Colors {
  black = "30",
  red = "31",
  green = "32",
  yellow = "33",
  blue = "34",
  magenta = "35",
  cyan = "36",
  white = "37",
}

const env = import.meta.env.VITE_DEBUG_MODE;

// LOGGER LEVELS
// 0 = no logs
// 1 = basic logs
// 2 = colored logs
// 3 = data logs

const productionLoggerLevel = 1;
const devLoggerLevel = Number(import.meta.env.VITE_DEV_LOGGER_LEVEL) || 3;
const loggerLevel = env === "true" ? devLoggerLevel : productionLoggerLevel;

type MsgType = string | number | object | null | boolean | undefined;

// Check if we're in a browser that supports CSS styling in console
const isBrowserWithCSSSupport =
  typeof window !== "undefined" &&
  typeof navigator !== "undefined" &&
  typeof console !== "undefined";

class Logger {
  private prefix: string = "";

  private formatMessage(msg: MsgType): string {
    return this.prefix + JSON.stringify(msg);
  }

  log(colorCode: string, msg: MsgType) {
    if (loggerLevel <= 0) return;

    if (isBrowserWithCSSSupport) {
      // Use CSS styling for browsers
      const colorMap: Record<string, string> = {
        "30": "black",
        "31": "red",
        "32": "green",
        "33": "yellow",
        "34": "blue",
        "35": "magenta",
        "36": "cyan",
        "37": "white",
      };
      const color = colorMap[colorCode] || "black";
      console.log(`%c${this.formatMessage(msg)}`, `color: ${color}`);
    } else {
      // Fallback to ANSI colors for environments that support it (like Node.js)
      console.log(`\x1b[${colorCode}m${this.formatMessage(msg)}\x1b[0m`);
    }
  }

  black(msg: MsgType) {
    if (loggerLevel > 1) this.log(Colors.black, msg);
  }

  red(msg: MsgType) {
    if (loggerLevel > 1) this.log(Colors.red, msg);
  }

  green(msg: MsgType) {
    if (loggerLevel > 1) this.log(Colors.green, msg);
  }

  yellow(msg: MsgType) {
    if (loggerLevel > 1) this.log(Colors.yellow, msg);
  }

  blue(msg: MsgType) {
    if (loggerLevel > 1) this.log(Colors.blue, msg);
  }

  magenta(msg: MsgType) {
    if (loggerLevel > 1) this.log(Colors.magenta, msg);
  }

  cyan(msg: MsgType) {
    if (loggerLevel > 1) this.log(Colors.cyan, msg);
  }

  white(msg: MsgType) {
    if (loggerLevel > 1) this.log(Colors.white, msg);
  }

  data(msgType: string, msgResource: string, msg: MsgType) {
    if (loggerLevel > 2) {
      let massagedMsgResource: string = msgResource;
      if (msgResource?.slice(0, 1) === "/") {
        massagedMsgResource = msgResource.slice(1);
      }
      if (msgType === "sampling-update") {
        return;
      }
      this.log(
        "36",
        `${msgType}|${`${massagedMsgResource}: `}${JSON.stringify(msg)}`
      );
    }
  }
}

export default new Logger();
