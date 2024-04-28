import { bgGreen, cyan, bgBlue, bgYellow, bgRed, bgMagenta, gray, black, bold} from "colorette";

export class Logger {
	public constructor(){};

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

	public success(content: string): void {
		console.log(gray("[" + this.getDate() + "] ") + bgGreen(black(bold("SUCCESS"))) + ": " + cyan(content));
	}

	public log(content: string): void {
		console.log(gray("[" + this.getDate() + "] ") + bgBlue(black(bold("INFO"))) + ": " + cyan(content));
	}

	public warn(content: string): void {
		console.log(gray("[" + this.getDate() + "] ") + bgYellow(black(bold("WARN"))) + ": " + cyan(content));
	}

	public error(content: string, ex: any = null): void {
		if (ex) {
			console.log(
				gray("[" + this.getDate() + "] ") + bgRed(black(bold("ERROR"))) + ": " + cyan(content + ": " + ex?.message),
			);
		} else {
			console.log(gray("[" + this.getDate() + "] ") + bgRed(black(bold("ERROR"))) + ": " + cyan(content));
		}
	}

	public debug(content: string): void {
		console.log(gray("[" + this.getDate() + "] ") + bgMagenta(black(bold("DEBUG"))) + ": " + cyan(content));
	}
}
