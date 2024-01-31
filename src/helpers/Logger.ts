import { bgGreen, cyan, bgBlue, bgYellow, bgRed, bgMagenta, gray, black, bold} from "colorette";

export default class Logger {
	private static getDate(): string {
		return new Date(Date.now()).toLocaleString("de-DE", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		});
	}

	static success(content: string): void {
		console.log(gray("[" + Logger.getDate() + "] ") + bgGreen(black(bold("SUCCESS"))) + ": " + cyan(content));
	}

	static log(content: string): void {
		console.log(gray("[" + Logger.getDate() + "] ") + bgBlue(black(bold("INFO"))) + ": " + cyan(content));
	}

	static warn(content: string): void {
		console.log(gray("[" + Logger.getDate() + "] ") + bgYellow(black(bold("WARN"))) + ": " + cyan(content));
	}

	static error(content: string, ex: any = null): void {
		if (ex) {
			console.log(
				gray("[" + Logger.getDate() + "] ") + bgRed(black(bold("ERROR"))) + ": " + cyan(content + ": " + ex?.message),
			);
		} else {
			console.log(gray("[" + Logger.getDate() + "] ") + bgRed(black(bold("ERROR"))) + ": " + cyan(content));
		}
	}

	static debug(content: string): void {
		console.log(gray("[" + Logger.getDate() + "] ") + bgMagenta(black(bold("DEBUG"))) + ": " + cyan(content));
	}
}
