import { bgGreen, cyan, bgBlue, bgYellow, bgRed, bgMagenta, gray } from "colorette";

export default class Logger {
	static getDate(): string {
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
		console.log(gray("[" + Logger.getDate() + "] ") + bgGreen("SUCCESS") + ": " + cyan(content));
	}

	static log(content: string): void {
		console.log(gray("[" + Logger.getDate() + "] ") + bgBlue("INFO") + ": " + cyan(content));
	}

	static warn(content: string): void {
		console.log(gray("[" + Logger.getDate() + "] ") + bgYellow("WARN") + ": " + cyan(content));
	}

	static error(content: string, ex: any = null): void {
		if (ex) {
			console.log(
				gray("[" + Logger.getDate() + "] ") + bgRed("ERROR") + ": " + cyan(content + ": " + ex?.message),
			);
		} else {
			console.log(gray("[" + Logger.getDate() + "] ") + bgRed("ERROR") + ": " + cyan(content));
		}
	}

	static debug(content: string): void {
		console.log(gray("[" + Logger.getDate() + "] ") + bgMagenta("DEBUG") + ": " + cyan(content));
	}
}
