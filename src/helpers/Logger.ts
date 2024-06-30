import { bgGreen, cyan, bgBlue, bgYellow, bgRed, bgMagenta, gray, black, bold } from "colorette";

export class Logger {
    public constructor() {}

    private getDate(): string {
        return new Date(Date.now()).toLocaleString("de-DE", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    }

    private _log(level: string, colorFn: (str: string) => string, content: string, ex?: any): void {
        const dateStr = gray(`[${this.getDate()}]`);
        const levelStr = colorFn(black(bold(level)));
        const message = ex ? `${content}: ${ex.message}` : content;
        console.log(`${dateStr} ${levelStr}: ${cyan(message)}`);
    }

    public success(content: string): void {
        this._log("SUCCESS", bgGreen, content);
    }

    public log(content: string): void {
        this._log("INFO", bgBlue, content);
    }

    public warn(content: string): void {
        this._log("WARN", bgYellow, content);
    }

    public error(content: string, ex: any = null): void {
        this._log("ERROR", bgRed, content, ex);
    }

    public debug(content: string): void {
        this._log("DEBUG", bgMagenta, content);
    }
}
